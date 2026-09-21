import { prisma } from "@/lib/prisma";
import type { Course } from "../../types/course";

const include = {
  modules: {
    orderBy: { orderIndex: "asc" as const },
    include: { lessons: { orderBy: { orderIndex: "asc" as const } } },
  },
};

type CourseRow = NonNullable<
  Awaited<
    ReturnType<typeof prisma.course.findFirst<{ include: typeof include }>>
  >
>;

/** Database rows -> the client `Course` shape the UI already renders. */
function toCourse(row: CourseRow): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    thumbnail: row.thumbnail,
    category: row.category,
    difficulty: row.difficulty,
    estimatedHours: row.estimatedHours,
    instructor: row.instructor ?? undefined,
    isPublic: row.isPublic,
    isAiGenerated: row.isAiGenerated,
    modules: row.modules.map((m) => ({
      id: m.id,
      courseId: m.courseId,
      title: m.title,
      orderIndex: m.orderIndex,
      description: m.description ?? undefined,
      unfilledLessons: m.unfilledLessons,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        moduleId: l.moduleId,
        title: l.title,
        orderIndex: l.orderIndex,
        videoId: l.videoId,
        channelName: l.channelName ?? undefined,
        durationSec: l.durationSec,
        startSeconds: l.startSeconds,
        endSeconds: l.endSeconds ?? undefined,
        summary: l.summary ?? undefined,
      })),
    })),
  };
}

export async function findCourse(idOrSlug: string): Promise<Course | null> {
  const row = await prisma.course.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include,
  });
  return row ? toCourse(row) : null;
}

export async function listPublicCourses(limit = 50): Promise<Course[]> {
  const rows = await prisma.course.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include,
  });
  return rows.map(toCourse);
}
