import type { Course, CourseEnrollment, Lesson, SkillLevel } from "../../types/course";
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
  return (
    all.find((c) => c.id === idOrSlug || c.slug === idOrSlug) || null
  );
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
  const isLastInCourse = currentIndex + 1 === allLessons.length - 1;

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

/**
 * Synthesizes a structured personalized course from a custom topic and skill level.
 */
export function generatePersonalizedCourse({
  topic,
  skillLevel,
}: {
  topic: string;
  skillLevel: SkillLevel;
}): Course {
  const cleanTopic = topic.trim();
  const slug = `${cleanTopic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

  return {
    id: `custom-course-${Date.now()}`,
    slug,
    title: `${cleanTopic}: Personalized Learning Path`,
    description: `A custom-tailored, sequential curriculum for mastering ${cleanTopic} designed for ${skillLevel.toLowerCase()} learners.`,
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
    category: "Personalized Track",
    difficulty: skillLevel,
    estimatedHours: 2.5,
    instructor: "AI Curriculum Architect & Top YouTube Creators",
    isPublic: false,
    isAiGenerated: true,
    modules: [
      {
        id: `mod-1-${slug}`,
        courseId: `custom-course-${Date.now()}`,
        title: `Module 1: Foundations & Core Concepts of ${cleanTopic}`,
        orderIndex: 1,
        description: `Essential background, theory, and first principles.`,
        lessons: [
          {
            id: `less-1-${slug}`,
            moduleId: `mod-1-${slug}`,
            title: `1. Introduction & Theoretical Mental Model of ${cleanTopic}`,
            orderIndex: 1,
            videoId: "WUvTyaaNkzM",
            channelName: "Curated Expert",
            durationSec: 840,
            startSeconds: 0,
            summary: `High-level conceptual breakdown and prerequisites for ${cleanTopic}.`,
          },
          {
            id: `less-2-${slug}`,
            moduleId: `mod-1-${slug}`,
            title: `2. Core Syntax, Tools & Practical Environment Setup`,
            orderIndex: 2,
            videoId: "rfscVS0vtbw",
            channelName: "Curated Expert",
            durationSec: 960,
            startSeconds: 0,
            summary: `Setting up your development or learning workspace for success.`,
          },
        ],
      },
      {
        id: `mod-2-${slug}`,
        courseId: `custom-course-${Date.now()}`,
        title: `Module 2: Intermediate Deep Dive & Patterns`,
        orderIndex: 2,
        description: `Applied problem solving and intermediate mechanics.`,
        lessons: [
          {
            id: `less-3-${slug}`,
            moduleId: `mod-2-${slug}`,
            title: `3. Key Patterns & Common Pitfalls in ${cleanTopic}`,
            orderIndex: 1,
            videoId: "kqtD5dpn9C8",
            channelName: "Curated Expert",
            durationSec: 1100,
            startSeconds: 0,
            summary: `Deep dive into common architectural challenges and patterns.`,
          },
          {
            id: `less-4-${slug}`,
            moduleId: `mod-2-${slug}`,
            title: `4. Building a Hands-On Practical Project`,
            orderIndex: 2,
            videoId: "W8KRzm-HUcc",
            channelName: "Curated Expert",
            durationSec: 1350,
            startSeconds: 0,
            summary: `Step-by-step synthesis building a project applying all learned concepts.`,
          },
        ],
      },
    ],
  };
}
