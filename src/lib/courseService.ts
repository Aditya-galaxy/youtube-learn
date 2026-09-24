import type {
  Course,
  CourseTier,
  Lesson,
  SkillLevel,
} from "../../types/course";
import { CURATED_COURSES } from "./coursesData";
import { OPEN_COURSEWARE_COURSES } from "./openCourseWareData";
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
        tier: (c.tier as CourseTier) || undefined,
        institution: c.institution || undefined,
        sourceUrl: c.sourceUrl || undefined,
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

/**
 * Generates a tailored structured course for a specific tier (BASIC, INTERMEDIATE, ADVANCED, EXPERT).
 */
export function generateTieredCourse({
  topic,
  tier,
  prioritizeAcademic,
}: {
  topic: string;
  tier: CourseTier;
  prioritizeAcademic?: boolean;
}): Course {
  const cleanTopic = topic.trim();
  const slug = `${cleanTopic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${tier.toLowerCase()}-${Date.now().toString().slice(-4)}`;

  const tierMetadata = {
    BASIC: {
      titlePrefix: "Foundations of",
      descriptionPrefix: "An introductory, zero-assumption visual curriculum covering first principles, mental models, and setup for",
      channel: prioritizeAcademic ? "MIT OpenCourseWare & CS50" : "Curated University Educators",
      mod1Title: "Core Mental Models & Visual Intuition",
      mod2Title: "Hands-on Syntax & First Working Examples",
      hours: 2.5,
    },
    INTERMEDIATE: {
      titlePrefix: "Applied Mastery of",
      descriptionPrefix: "A practical, production-focused curriculum covering real-world architecture, idioms, and standard patterns for",
      channel: prioritizeAcademic ? "MIT OCW & Stanford Online" : "Top Industry Practitioners",
      mod1Title: "Architecture, Idiomatic Patterns & Standard APIs",
      mod2Title: "Building a Full Real-World Application",
      hours: 4.0,
    },
    ADVANCED: {
      titlePrefix: "Advanced Systems & Invariants in",
      descriptionPrefix: "A deep technical dive into algorithmic performance, memory profiling, concurrency, and internal mechanics of",
      channel: prioritizeAcademic ? "MIT 6.006 & Stanford Computer Science" : "Senior Systems Engineers",
      mod1Title: "Algorithmic Complexity & Deep Internals",
      mod2Title: "Performance Profiling & Distributed Concurrency",
      hours: 6.0,
    },
    EXPERT: {
      titlePrefix: "Expert Research & Distributed Invariants:",
      descriptionPrefix: "An elite, graduate-level exploration of distributed consensus, low-level hardware memory barriers, and formal proofs in",
      channel: prioritizeAcademic ? "MIT 6.824 & Stanford CS229" : "Principal Research Engineers",
      mod1Title: "Distributed Invariants & Formal Verification",
      mod2Title: "Low-Level Kernel/Hardware Concurrency & SMR",
      hours: 8.5,
    },
  }[tier];

  return {
    id: `custom-course-${Date.now()}`,
    slug,
    title: `${tierMetadata.titlePrefix} ${cleanTopic} (${tier} Tier)`,
    description: `${tierMetadata.descriptionPrefix} ${cleanTopic}.`,
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
    category: "Structured Track",
    difficulty: tier === "BASIC" ? "BEGINNER" : (tier as SkillLevel),
    tier,
    estimatedHours: tierMetadata.hours,
    instructor: tierMetadata.channel,
    institution: prioritizeAcademic ? "OpenCourseWare Academic Consortium" : undefined,
    sourceUrl: prioritizeAcademic ? "https://ocw.mit.edu" : undefined,
    isPublic: false,
    isAiGenerated: true,
    modules: [
      {
        id: `mod-1-${slug}`,
        courseId: `custom-course-${Date.now()}`,
        title: `Module 1: ${tierMetadata.mod1Title}`,
        orderIndex: 1,
        description: `Mastery of initial concepts and prerequisite mental models.`,
        lessons: [
          {
            id: `less-1-${slug}`,
            moduleId: `mod-1-${slug}`,
            title: `1. Deep Dive: ${cleanTopic} Fundamentals & Theoretical Mechanics`,
            orderIndex: 1,
            videoId: tier === "BASIC" ? "LfaMVlDaQ24" : tier === "EXPERT" ? "cQP8WApzIQQ" : "WUvTyaaNkzM",
            channelName: tierMetadata.channel,
            durationSec: 1200,
            startSeconds: 0,
            summary: `Detailed lecture examining core theoretical properties.`,
          },
          {
            id: `less-2-${slug}`,
            moduleId: `mod-1-${slug}`,
            title: `2. Structural Analysis & Systematic Breakdown`,
            orderIndex: 2,
            videoId: tier === "BASIC" ? "rfscVS0vtbw" : tier === "EXPERT" ? "UzxXb4khtPU" : "kqtD5dpn9C8",
            channelName: tierMetadata.channel,
            durationSec: 1450,
            startSeconds: 0,
            summary: `Key invariants and edge-case execution models.`,
          },
        ],
      },
      {
        id: `mod-2-${slug}`,
        courseId: `custom-course-${Date.now()}`,
        title: `Module 2: ${tierMetadata.mod2Title}`,
        orderIndex: 2,
        description: `Applied problem solving and capstone design.`,
        lessons: [
          {
            id: `less-3-${slug}`,
            moduleId: `mod-2-${slug}`,
            title: `3. Complex Patterns & Implementation Trade-Offs`,
            orderIndex: 1,
            videoId: tier === "BASIC" ? "W8KRzm-HUcc" : tier === "EXPERT" ? "Ea1e0bH_7v0" : "8pDqJVdNa4g",
            channelName: tierMetadata.channel,
            durationSec: 1600,
            startSeconds: 0,
            summary: `In-depth case study exploring trade-offs and performance.`,
          },
        ],
      },
    ],
  };
}
