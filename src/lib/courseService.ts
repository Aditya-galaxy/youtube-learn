import type {
  Course,
  CourseEnrollment,
  Lesson,
  SkillLevel,
} from "../../types/course";
import { CURATED_COURSES } from "./coursesData";
import { prisma } from "./prisma";

export interface NextLessonInfo {
  nextLesson: Lesson | null;
  isLastInModule: boolean;
  isLastInCourse: boolean;
}

/**
 * Returns all available courses. Falls back to CURATED_COURSES if DB is unreachable.
 */
export async function getAllCourses(): Promise<Course[]> {
  try {
    const dbCourses = await prisma.course.findMany({
      include: {
        modules: {
          orderBy: { orderIndex: "asc" },
          include: {
            lessons: {
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbCourses && dbCourses.length > 0) {
      return dbCourses.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        thumbnail: c.thumbnail,
        category: c.category,
        difficulty: c.difficulty as SkillLevel,
        estimatedHours: c.estimatedHours,
        instructor: c.instructor || "Educator",
        isPublic: c.isPublic,
        isAiGenerated: c.isAiGenerated,
        modules: c.modules.map((m) => ({
          id: m.id,
          courseId: m.courseId,
          title: m.title,
          orderIndex: m.orderIndex,
          description: m.description || undefined,
          lessons: m.lessons.map((l) => ({
            id: l.id,
            moduleId: l.moduleId,
            title: l.title,
            orderIndex: l.orderIndex,
            videoId: l.videoId,
            channelName: l.channelName || undefined,
            durationSec: l.durationSec,
            startSeconds: l.startSeconds,
            endSeconds: l.endSeconds || undefined,
            summary: l.summary || undefined,
          })),
        })),
      }));
    }
  } catch {
    // Database connection or table not yet seeded
  }

  return CURATED_COURSES;
}

/**
 * Finds a single course by slug or ID.
 */
export async function getCourseByIdOrSlug(
  idOrSlug: string
): Promise<Course | null> {
  const all = await getAllCourses();
  return all.find((c) => c.id === idOrSlug || c.slug === idOrSlug) || null;
}

/**
 * Given a current lesson, finds the immediate next lesson in pedagogical sequence.
 */
export function getNextLessonInSequence(
  course: Course,
  currentLessonId: string
): NextLessonInfo {
  const allLessons: Lesson[] = [];
  course.modules.forEach((mod) => {
    mod.lessons.forEach((l) => allLessons.push(l));
  });

  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  if (currentIndex === -1 || currentIndex === allLessons.length - 1) {
    return {
      nextLesson: null,
      isLastInModule: true,
      isLastInCourse: true,
    };
  }

  const nextLesson = allLessons[currentIndex + 1];
  const currentLesson = allLessons[currentIndex];
  const isLastInModule = currentLesson.moduleId !== nextLesson.moduleId;
  // False by definition here: the early return above already covers "the
  // current lesson is the last one". This previously reported true when the
  // *next* lesson was last, so the final lesson never got the end-of-course UI.
  const isLastInCourse = false;

  return {
    nextLesson,
    isLastInModule,
    isLastInCourse,
  };
}

/**
 * Total lesson count for a course.
 */
export function getCourseTotalLessons(course: Course): number {
  return course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
}

/**
 * Calculates completion percentage for a course.
 */
export function calculateCourseProgress(
  course: Course,
  completedLessonIds: string[]
): number {
  const total = getCourseTotalLessons(course);
  if (total === 0) return 0;
  const completedCount = completedLessonIds.filter((id) =>
    course.modules.some((m) => m.lessons.some((l) => l.id === id))
  ).length;
  return Math.min(100, Math.round((completedCount / total) * 100));
}
