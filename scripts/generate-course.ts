/**
 * The whole pipeline end to end, minus persistence: topic -> syllabus ->
 * YouTube retrieval -> video selection -> chapter slicing -> playable lessons.
 * Needs YOUTUBE_API_KEY and a Gemini backend; writes nothing to the database.
 *
 *   npm run generate:course -- "linear algebra" --level BEGINNER --hours 4
 *   npm run generate:course -- "rust ownership" --out course.json
 *
 * Env comes from .env.local via scripts/load-env.cjs, preloaded before any
 * module executes.
 */
import { writeFileSync } from "fs";
import { generateSyllabus } from "../src/lib/generation/syllabus";
import { buildModule } from "../src/lib/generation/module";
import { createYouTubeClient } from "../src/lib/youtube/searchVideos";
import {
  GenerationError,
  GENERATION_BACKEND,
  GENERATION_MODEL,
} from "../src/lib/ai/client";
import type { SkillLevel } from "../src/lib/ai/schemas";
import type { Lesson } from "../types/course";

const LEVELS: SkillLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
// Gemini 2.5 Pro list pricing, $ per 1M tokens (<=200k context). Thinking
// tokens bill as output.
const IN_PER_MTOK = 1.25;
const OUT_PER_MTOK = 10;

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  let level: SkillLevel = "BEGINNER";
  let hours: number | undefined;
  let out: string | undefined;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--level") {
      const v = (argv[++i] ?? "").toUpperCase() as SkillLevel;
      if (!LEVELS.includes(v))
        throw new Error(`--level must be one of ${LEVELS.join(", ")}`);
      level = v;
    } else if (a === "--hours") hours = Number(argv[++i]);
    else if (a === "--out") out = argv[++i];
    else positional.push(a);
  }
  const topic = positional.join(" ").trim();
  if (!topic)
    throw new Error(
      'Usage: npm run generate:course -- "<topic>" [--level L] [--hours N] [--out file.json]'
    );
  return { topic, level, hours, out };
}

const fmt = (sec: number) => {
  const h = Math.floor(sec / 3600),
    m = Math.floor((sec % 3600) / 60),
    s = sec % 60;
  return h
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const ytKey = process.env.YOUTUBE_API_KEY;
  if (!ytKey) throw new Error("YOUTUBE_API_KEY is not set (see .env.example)");
  const youtube = createYouTubeClient(ytKey);
  const started = Date.now();
  const tokens = { in: 0, out: 0, thought: 0 };
  let units = 0;

  console.log(
    `\n[${GENERATION_BACKEND} · ${GENERATION_MODEL}] designing "${args.topic}"...`
  );
  const { syllabus, usage: su } = await generateSyllabus({
    topic: args.topic,
    skillLevel: args.level,
    weeklyHours: args.hours,
  });
  tokens.in += su.inputTokens;
  tokens.out += su.outputTokens;
  tokens.thought += su.thoughtTokens;
  console.log(`${syllabus.title} — ${syllabus.modules.length} modules\n`);

  const usedVideoIds: string[] = [];
  const course: Array<{
    key: string;
    title: string;
    lessons: Lesson[];
    gaps: string[];
  }> = [];
  let planned = 0,
    filled = 0;

  for (const mod of syllabus.modules) {
    planned += mod.lessonIntents.length;
    const built = await buildModule(youtube, mod, usedVideoIds);
    units += built.unitsSpent;
    tokens.in += built.usage.inputTokens;
    tokens.out += built.usage.outputTokens;
    tokens.thought += built.usage.thoughtTokens;
    usedVideoIds.push(...built.lessons.map((l) => l.videoId));
    filled += built.lessons.length;
    course.push({
      key: built.key,
      title: built.title,
      lessons: built.lessons,
      gaps: built.gaps,
    });

    console.log(`${course.length}. ${mod.title}`);
    console.log(
      `   ${built.unitsSpent} units${built.gapFillRan ? " · gap-fill pass ran" : ""}`
    );
    for (const l of built.lessons) {
      const intentKey = mod.lessonIntents.find((i) => i.title === l.title)?.key;
      const pick = built.picks.find((p) => p.lessonIntentKey === intentKey);
      const span = l.endSeconds
        ? `${fmt(l.startSeconds)}-${fmt(l.endSeconds)}`
        : `full ${fmt(l.durationSec)}`;
      console.log(`   ✓ ${l.title}`);
      console.log(
        `       ${span.padEnd(18)} youtu.be/${l.videoId}${l.startSeconds ? `?t=${l.startSeconds}` : ""}  (${l.channelName})`
      );
      if (pick) console.log(`       why: ${pick.reason.slice(0, 110)}`);
    }
    for (const g of built.gaps) {
      console.log(
        `   ✗ ${mod.lessonIntents.find((i) => i.key === g)?.title ?? g} — no good video found`
      );
    }
    console.log("");
  }

  const cost =
    (tokens.in / 1e6) * IN_PER_MTOK +
    ((tokens.out + tokens.thought) / 1e6) * OUT_PER_MTOK;
  const coverage = planned ? Math.round((filled / planned) * 100) : 0;
  console.log(
    `--- ${filled}/${planned} lessons filled (${coverage}%) · ${((Date.now() - started) / 1000).toFixed(0)}s · ` +
      `${units} YouTube units · tokens in ${tokens.in} out ${tokens.out} thinking ${tokens.thought} · ~$${cost.toFixed(3)} ---\n`
  );

  if (args.out) {
    writeFileSync(args.out, JSON.stringify({ syllabus, course }, null, 2));
    console.log(`wrote ${args.out}`);
  }
}

main().catch((e) => {
  if (e instanceof GenerationError) {
    console.error(`\nGeneration failed at stage "${e.stage}": ${e.message}`);
    for (const v of e.violations) console.error(`  - ${v}`);
  } else console.error(`\n${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
