/**
 * Prints a generated curriculum for a topic. No database, no UI, no YouTube —
 * just the model call and the ordering checks, so syllabus quality can be
 * inspected before any of the pipeline around it exists.
 *
 * Env comes from .env.local via scripts/load-env.cjs, preloaded before any
 * module executes.
 *
 *   npm run generate:syllabus -- "linear algebra" --level BEGINNER --hours 4
 *   npm run generate:syllabus -- "rust ownership" --json
 */
import { generateSyllabus } from "../src/lib/generation/syllabus";
import { GenerationError } from "../src/lib/ai/client";
import type { SkillLevel } from "../src/lib/ai/schemas";

const LEVELS: SkillLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  let level: SkillLevel = "BEGINNER";
  let hours: number | undefined;
  let goal: string | undefined;
  let json = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--json") json = true;
    else if (arg === "--level") {
      const next = (argv[++i] ?? "").toUpperCase() as SkillLevel;
      if (!LEVELS.includes(next)) {
        throw new Error(`--level must be one of ${LEVELS.join(", ")}`);
      }
      level = next;
    } else if (arg === "--hours") hours = Number(argv[++i]);
    else if (arg === "--goal") goal = argv[++i];
    else positional.push(arg);
  }

  const topic = positional.join(" ").trim();
  if (!topic) {
    throw new Error(
      'Usage: npm run generate:syllabus -- "<topic>" [--level BEGINNER|INTERMEDIATE|ADVANCED] [--hours N] [--goal "..."] [--json]'
    );
  }
  return {
    topic,
    skillLevel: level,
    weeklyHours: hours,
    learningGoal: goal,
    json,
  };
}

// Gemini 2.5/3 Pro list pricing, $ per 1M tokens. Update if the model changes.
const INPUT_PER_MTOK = 1.25;
const OUTPUT_PER_MTOK = 10;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const startedAt = Date.now();

  const { syllabus, order, usage, attempts } = await generateSyllabus(args);

  if (args.json) {
    console.log(JSON.stringify(syllabus, null, 2));
    return;
  }

  const lessonCount = syllabus.modules.reduce(
    (n, m) => n + m.lessonIntents.length,
    0
  );

  console.log(`\n${syllabus.title}`);
  console.log("=".repeat(syllabus.title.length));
  console.log(syllabus.description);
  console.log(
    `\n${syllabus.category} · ${syllabus.difficulty} · ~${syllabus.estimatedHours}h · ` +
      `${syllabus.modules.length} modules · ${lessonCount} lessons`
  );

  syllabus.modules.forEach((mod, i) => {
    const prereqs =
      mod.prerequisiteKeys.length > 0
        ? mod.prerequisiteKeys.join(", ")
        : "none";
    console.log(`\n${i + 1}. ${mod.title}  [${mod.key}]`);
    console.log(`   requires: ${prereqs}`);
    console.log(`   search:   ${mod.searchQueries.join(" | ")}`);
    for (const lesson of mod.lessonIntents) {
      console.log(`     - ${lesson.title}`);
      for (const must of lesson.mustTeach) {
        console.log(`         · ${must}`);
      }
    }
  });

  const cost =
    (usage.inputTokens / 1e6) * INPUT_PER_MTOK +
    (usage.outputTokens / 1e6) * OUTPUT_PER_MTOK;

  console.log(`\n--- dependency order ---\n${order.join(" -> ")}`);
  console.log(
    `\n--- ${((Date.now() - startedAt) / 1000).toFixed(1)}s · attempts ${attempts} · ` +
      `in ${usage.inputTokens} (cache read ${usage.cacheReadInputTokens}) · ` +
      `out ${usage.outputTokens} · ~$${cost.toFixed(3)} ---\n`
  );
}

main().catch((error) => {
  if (error instanceof GenerationError) {
    console.error(
      `\nGeneration failed at stage "${error.stage}": ${error.message}`
    );
    for (const v of error.violations) console.error(`  - ${v}`);
  } else {
    console.error(
      `\n${error instanceof Error ? error.message : String(error)}`
    );
  }
  process.exit(1);
});
