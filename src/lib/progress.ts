import { prisma } from "@/lib/prisma";
import type { CourseEnrollment } from "../../types/course";

/**
 * Server-side learning progress. The client's CourseEnrollment shape is kept
 * so CourseContext and ClassroomPlayer did not have to change what they read.
 *
 * progressPct is always derived here from UserLessonProgress rows — never
 * accepted from the client — so a request cannot simply assert 100%.
 */

async function toClientEnrollment(
  userId: string,
  courseId: string
): Promise<CourseEnrollment | null> {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment) return null;

  const completed = await prisma.userLessonProgress.findMany({
    where: { userId, isCompleted: true, lesson: { module: { courseId } } },
    select: { lessonId: true },
  });

  return {
    id: enrollment.id,
    courseId,
    userId,
    status: enrollment.status,
    progressPct: enrollment.progressPct,
    completedLessonIds: completed.map((c) => c.lessonId),
    lastLessonId: enrollment.lastLessonId ?? undefined,
    enrolledAt: enrollment.enrolledAt.toISOString(),
    lastAccessedAt: enrollment.lastAccessedAt.toISOString(),
  };
}

export async function listEnrollments(
  userId: string
): Promise<Record<string, CourseEnrollment>> {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId },
    select: { courseId: true },
  });
  const out: Record<string, CourseEnrollment> = {};
  for (const { courseId } of enrollments) {
    const e = await toClientEnrollment(userId, courseId);
    if (e) out[courseId] = e;
  }
  return out;
}

export async function enroll(
  userId: string,
  courseId: string
): Promise<CourseEnrollment | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });
  if (!course) return null;
  await prisma.courseEnrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { lastAccessedAt: new Date() },
    create: { userId, courseId },
  });
  return toClientEnrollment(userId, courseId);
}

/** Recomputes progress for one course from the completion rows. */
async function recompute(
  userId: string,
  courseId: string,
  lastLessonId?: string
) {
  const [total, done] = await Promise.all([
    prisma.lesson.count({ where: { module: { courseId } } }),
    prisma.userLessonProgress.count({
      where: { userId, isCompleted: true, lesson: { module: { courseId } } },
    }),
  ]);
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
  await prisma.courseEnrollment.update({
    where: { userId_courseId: { userId, courseId } },
    data: {
      progressPct,
      status: progressPct >= 100 ? "COMPLETED" : "IN_PROGRESS",
      lastAccessedAt: new Date(),
      ...(lastLessonId ? { lastLessonId } : {}),
    },
  });
}

/**
 * Marks a lesson complete or not, enrolling the user in its course on the way
 * if they were not already — finishing a lesson is enrolment enough.
 */
export async function setLessonProgress(
  userId: string,
  lessonId: string,
  update: { completed?: boolean; positionSec?: number }
): Promise<CourseEnrollment | null> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { courseId: true } } },
  });
  if (!lesson) return null;
  const courseId = lesson.module.courseId;

  await prisma.courseEnrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId },
  });

  await prisma.userLessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      ...(update.completed !== undefined
        ? {
            isCompleted: update.completed,
            completedAt: update.completed ? new Date() : null,
          }
        : {}),
      ...(update.positionSec !== undefined
        ? { lastPositionSec: update.positionSec }
        : {}),
    },
    create: {
      userId,
      lessonId,
      isCompleted: update.completed ?? false,
      completedAt: update.completed ? new Date() : null,
      lastPositionSec: update.positionSec ?? 0,
    },
  });

  await recompute(userId, courseId, lessonId);
  return toClientEnrollment(userId, courseId);
}

export async function getNote(
  userId: string,
  lessonId: string
): Promise<string> {
  const note = await prisma.lessonNote.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    select: { content: true },
  });
  return note?.content ?? "";
}

/** Saves a note; an empty note deletes it rather than storing blank rows. */
export async function saveNote(
  userId: string,
  lessonId: string,
  content: string
): Promise<boolean> {
  const exists = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true },
  });
  if (!exists) return false;
  if (!content.trim()) {
    await prisma.lessonNote.deleteMany({ where: { userId, lessonId } });
    return true;
  }
  await prisma.lessonNote.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { content },
    create: { userId, lessonId, content },
  });
  return true;
}

/**
 * One-shot import of progress a user made in this browser before signing in.
 * Unknown courses and lessons are ignored (a custom course imported only into
 * localStorage has no rows to attach to). Existing server notes are never
 * overwritten — the account is the source of truth once it exists.
 */
export async function importLocalProgress(
  userId: string,
  input: {
    enrollments: Array<{
      courseId: string;
      completedLessonIds: string[];
      lastLessonId?: string;
    }>;
    notes: Array<{ lessonId: string; content: string }>;
  }
): Promise<{ courses: number; lessons: number; notes: number }> {
  let courses = 0;
  let lessons = 0;
  let notes = 0;

  for (const e of input.enrollments) {
    const course = await prisma.course.findUnique({
      where: { id: e.courseId },
      select: {
        id: true,
        modules: { select: { lessons: { select: { id: true } } } },
      },
    });
    if (!course) continue;
    const valid = new Set(
      course.modules.flatMap((m) => m.lessons.map((l) => l.id))
    );

    await prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId, courseId: course.id } },
      update: {},
      create: { userId, courseId: course.id },
    });
    courses += 1;

    for (const lessonId of e.completedLessonIds.filter((id) => valid.has(id))) {
      await prisma.userLessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: { isCompleted: true },
        create: {
          userId,
          lessonId,
          isCompleted: true,
          completedAt: new Date(),
        },
      });
      lessons += 1;
    }
    await recompute(
      userId,
      course.id,
      e.lastLessonId && valid.has(e.lastLessonId) ? e.lastLessonId : undefined
    );
  }

  for (const n of input.notes) {
    if (!n.content.trim()) continue;
    const lesson = await prisma.lesson.findUnique({
      where: { id: n.lessonId },
      select: { id: true },
    });
    if (!lesson) continue;
    // Upsert with an empty update: never overwrites an account note, and two
    // imports racing (two tabs, or React's double effect in development)
    // cannot collide on the unique (userId, lessonId) key the way
    // check-then-create could.
    const before = await prisma.lessonNote.count({
      where: { userId, lessonId: n.lessonId },
    });
    await prisma.lessonNote.upsert({
      where: { userId_lessonId: { userId, lessonId: n.lessonId } },
      update: {},
      create: { userId, lessonId: n.lessonId, content: n.content },
    });
    if (before > 0) continue;
    notes += 1;
  }

  return { courses, lessons, notes };
}
