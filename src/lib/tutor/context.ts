import { prisma } from "@/lib/prisma";

/**
 * What the tutor knows about a learner at a moment in a course.
 *
 * Every field is read from the database for the signed-in user. The client
 * sends only a lessonId: an earlier version took the course title, lesson
 * title and tier straight from the request body, which meant the "context" was
 * whatever the caller claimed and the tutor could be told it was teaching
 * anything at all.
 */
export interface TutorLessonContext {
  courseId: string;
  courseTitle: string;
  courseTier: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonSummary: string;
  /** Seconds into the video where this lesson's segment begins. */
  startSeconds: number;
  endSeconds: number | null;
  durationSec: number;
  isCompleted: boolean;
  /** Lesson order within the whole course, 1-based, and the course total. */
  position: number;
  totalLessons: number;
  completedCount: number;
  previousLessonTitle: string | null;
  nextLessonTitle: string | null;
  /** Lesson titles the learner has finished, most recent first, capped. */
  recentlyCompleted: string[];
}

export async function loadTutorLessonContext(
  userId: string,
  lessonId: string
): Promise<TutorLessonContext | null> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              modules: {
                orderBy: { orderIndex: "asc" },
                include: { lessons: { orderBy: { orderIndex: "asc" } } },
              },
            },
          },
        },
      },
    },
  });
  if (!lesson) return null;

  const course = lesson.module.course;
  const ordered = course.modules.flatMap((m) => m.lessons);
  const index = ordered.findIndex((l) => l.id === lessonId);

  const progress = await prisma.userLessonProgress.findMany({
    where: {
      userId,
      isCompleted: true,
      lesson: { module: { courseId: course.id } },
    },
    select: { lessonId: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
  const completedIds = new Set(progress.map((p) => p.lessonId));
  const titleById = new Map(ordered.map((l) => [l.id, l.title]));

  return {
    courseId: course.id,
    courseTitle: course.title,
    courseTier: course.tier ?? course.difficulty,
    moduleTitle: lesson.module.title,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    lessonSummary: lesson.summary ?? "",
    startSeconds: lesson.startSeconds ?? 0,
    endSeconds: lesson.endSeconds ?? null,
    durationSec: lesson.durationSec ?? 0,
    isCompleted: completedIds.has(lesson.id),
    position: index + 1,
    totalLessons: ordered.length,
    completedCount: completedIds.size,
    previousLessonTitle: index > 0 ? ordered[index - 1].title : null,
    nextLessonTitle:
      index >= 0 && index < ordered.length - 1
        ? ordered[index + 1].title
        : null,
    recentlyCompleted: progress
      .slice(0, 5)
      .map((p) => titleById.get(p.lessonId))
      .filter((t): t is string => Boolean(t)),
  };
}

/** A compact, readable rendering of the context for the model's prompt. */
export function describeContext(ctx: TutorLessonContext): string {
  const mmss = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return [
    `Course: "${ctx.courseTitle}" (${ctx.courseTier} tier)`,
    `Module: "${ctx.moduleTitle}"`,
    `Lesson ${ctx.position} of ${ctx.totalLessons}: "${ctx.lessonTitle}"`,
    ctx.lessonSummary && `Lesson summary: ${ctx.lessonSummary}`,
    `Video segment: ${mmss(ctx.startSeconds)}–${
      ctx.endSeconds ? mmss(ctx.endSeconds) : mmss(ctx.durationSec)
    } (seek times must fall inside this range)`,
    `Learner has completed ${ctx.completedCount} of ${ctx.totalLessons} lessons in this course.`,
    `This lesson is ${ctx.isCompleted ? "already marked complete" : "not yet complete"}.`,
    ctx.previousLessonTitle && `Previous lesson: "${ctx.previousLessonTitle}"`,
    ctx.nextLessonTitle && `Next lesson: "${ctx.nextLessonTitle}"`,
    ctx.recentlyCompleted.length > 0 &&
      `Recently completed: ${ctx.recentlyCompleted.map((t) => `"${t}"`).join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}
