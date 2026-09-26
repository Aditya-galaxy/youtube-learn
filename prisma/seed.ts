/**
 * Seeds the curated catalogue into the database, preserving the ids the app
 * has always used for it (course-python-masterclass, pyless-1, ...).
 *
 * Keeping ids stable is what lets progress saved in a browser before accounts
 * were server-backed be imported by lesson id, and lets enrollments and
 * progress reference curated lessons through real foreign keys.
 *
 * Idempotent: re-running updates content in place and never duplicates.
 */
import { prisma } from "../src/lib/prisma";
import { CURATED_COURSES } from "../src/lib/coursesData";

async function main() {
  for (const course of CURATED_COURSES) {
    await prisma.course.upsert({
      where: { id: course.id },
      update: {
        slug: course.slug,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        category: course.category,
        difficulty: course.difficulty,
        estimatedHours: course.estimatedHours,
        instructor: course.instructor ?? null,
        institution: course.institution ?? null,
        sourceUrl: course.sourceUrl ?? null,
        tier: course.tier ?? null,
        isPublic: true,
        isAiGenerated: false,
      },
      create: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        category: course.category,
        difficulty: course.difficulty,
        estimatedHours: course.estimatedHours,
        instructor: course.instructor ?? null,
        institution: course.institution ?? null,
        sourceUrl: course.sourceUrl ?? null,
        tier: course.tier ?? null,
        isPublic: true,
        isAiGenerated: false,
      },
    });

    for (const mod of course.modules) {
      await prisma.module.upsert({
        where: { id: mod.id },
        update: {
          title: mod.title,
          orderIndex: mod.orderIndex,
          description: mod.description ?? null,
        },
        create: {
          id: mod.id,
          courseId: course.id,
          title: mod.title,
          orderIndex: mod.orderIndex,
          description: mod.description ?? null,
        },
      });

      for (const lesson of mod.lessons) {
        const data = {
          title: lesson.title,
          orderIndex: lesson.orderIndex,
          videoId: lesson.videoId,
          channelName: lesson.channelName ?? null,
          durationSec: lesson.durationSec,
          startSeconds: lesson.startSeconds,
          endSeconds: lesson.endSeconds ?? null,
          summary: lesson.summary ?? null,
        };
        await prisma.lesson.upsert({
          where: { id: lesson.id },
          update: data,
          create: { id: lesson.id, moduleId: mod.id, ...data },
        });
      }
    }
    const lessons = course.modules.reduce((n, m) => n + m.lessons.length, 0);
    console.log(
      `seeded ${course.slug}: ${course.modules.length} modules, ${lessons} lessons`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
