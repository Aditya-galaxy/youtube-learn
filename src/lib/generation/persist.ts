import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import type { Syllabus } from "@/lib/ai/schemas";
import type { Lesson } from "../../../types/course";

export interface PersistableModule {
  key: string;
  title: string;
  lessons: Lesson[];
  gaps: string[];
}

export function normalizeTopic(topic: string): string {
  return topic.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Course.slug is globally unique, and every user who generates "Linear
 * Algebra" would otherwise collide on `linear-algebra`. A short random suffix
 * keeps slugs readable and the existing `course.slug || course.id` links
 * working without scoping routes by creator.
 */
export function makeSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${base || "course"}-${randomBytes(3).toString("hex")}`;
}

/**
 * Writes a generated course in one transaction. Modules without a single
 * usable lesson are dropped — an empty module is worse than none — and their
 * planned lessons are kept on the module record as `unfilledLessons` so the
 * gap is visible instead of silently missing.
 */
export async function persistGeneratedCourse(input: {
  syllabus: Syllabus;
  modules: PersistableModule[];
  topic: string;
  creatorId: string;
}): Promise<{ id: string; slug: string }> {
  const { syllabus, modules, topic, creatorId } = input;

  const kept = modules.filter((m) => m.lessons.length > 0);
  if (kept.length === 0) {
    throw new Error(
      "No module has a usable lesson; refusing to save an empty course."
    );
  }

  const totalSec = kept
    .flatMap((m) => m.lessons)
    .reduce((sum, l) => sum + (l.durationSec || 0), 0);
  const firstVideo = kept[0].lessons[0].videoId;
  const syllabusModules = new Map(syllabus.modules.map((m) => [m.key, m]));
  const slug = makeSlug(syllabus.title);

  const course = await prisma.$transaction(async (tx) => {
    const created = await tx.course.create({
      data: {
        slug,
        title: syllabus.title,
        description: syllabus.description,
        // The first lesson's own thumbnail, never stock art: next.config only
        // allows YouTube image hosts, and it represents the course honestly.
        thumbnail: `https://i.ytimg.com/vi/${firstVideo}/mqdefault.jpg`,
        category: syllabus.category,
        difficulty: syllabus.difficulty,
        tier: syllabus.difficulty,
        estimatedHours: Math.max(0.5, Math.round((totalSec / 3600) * 10) / 10),
        instructor: "Curated from YouTube",
        isPublic: true,
        isAiGenerated: true,
        topic,
        topicNormalized: normalizeTopic(topic),
        creatorId,
      },
      select: { id: true, slug: true },
    });

    for (const [mi, mod] of kept.entries()) {
      const planned = syllabusModules.get(mod.key);
      await tx.module.create({
        data: {
          courseId: created.id,
          title: mod.title,
          orderIndex: mi + 1,
          description: planned?.description ?? null,
          key: mod.key,
          objectives: planned?.objectives ?? [],
          prerequisiteKeys: planned?.prerequisiteKeys ?? [],
          unfilledLessons: mod.gaps.map(
            (g) => planned?.lessonIntents.find((l) => l.key === g)?.title ?? g
          ),
          lessons: {
            // orderIndex is re-numbered here so it is contiguous regardless of
            // gaps — @@unique([moduleId, orderIndex]) would reject duplicates.
            create: mod.lessons.map((l, li) => ({
              title: l.title,
              orderIndex: li + 1,
              videoId: l.videoId,
              channelName: l.channelName ?? null,
              durationSec: l.durationSec,
              startSeconds: l.startSeconds,
              endSeconds: l.endSeconds ?? null,
              summary: l.summary ?? null,
            })),
          },
        },
      });
    }

    return created;
  });

  return course;
}
