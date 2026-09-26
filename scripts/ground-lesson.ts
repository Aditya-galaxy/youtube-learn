/**
 * Builds grounding for a lesson by watching its video, and prints the result.
 *
 * Run with: npm run ground -- <lessonId> [--force]
 */
import { prisma } from "../src/lib/prisma";
import { ensureGrounding, readGrounding } from "../src/lib/tutor/grounding";

async function main() {
  const [lessonId, ...flags] = process.argv.slice(2);
  if (!lessonId)
    throw new Error("usage: npm run ground -- <lessonId> [--force]");

  if (flags.includes("--force"))
    await prisma.lessonGrounding.deleteMany({ where: { lessonId } });

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { title: true, videoId: true, durationSec: true },
  });
  if (!lesson) throw new Error(`No lesson ${lessonId}`);

  const cached = await readGrounding(lessonId);
  console.log(
    `${lesson.title}\nvideo ${lesson.videoId}, ${Math.round(lesson.durationSec / 60)} min${cached ? " (already grounded)" : ""}\n`
  );

  const started = Date.now();
  const grounding = await ensureGrounding(lessonId);
  if (!grounding) throw new Error("Grounding failed");

  const mmss = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  for (const s of grounding.sections)
    console.log(`  ${mmss(s.startSeconds).padStart(6)}  ${s.title}`);
  console.log(
    `\nconcepts: ${grounding.keyConcepts.map((c) => c.term).join(", ")}`
  );
  if (!cached)
    console.log(`\nbuilt in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
