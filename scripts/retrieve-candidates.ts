/**
 * Runs Stage B (retrieval) and Stage D (slicing) against the live YouTube API.
 * No model call, so this needs only YOUTUBE_API_KEY.
 *
 * Its real job is measuring the assumption the quota budget rests on: that
 * enough real videos carry parseable chapters for slicing to be the primary
 * strategy rather than a lucky special case.
 *
 *   npm run retrieve -- "linear algebra lecture" "matrix multiplication"
 */
import { config } from "dotenv";
import { createYouTubeClient } from "../src/lib/youtube/searchVideos";
import { retrieveCandidatesForModule } from "../src/lib/generation/retrieve";
import { buildLesson, chaptersOf } from "../src/lib/generation/slice";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

function fmtDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

async function main() {
  const queries = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (queries.length === 0) {
    throw new Error('Usage: npm run retrieve -- "<query>" ["<query2>" ...]');
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("YOUTUBE_API_KEY is not set (see .env.example)");

  const youtube = createYouTubeClient(apiKey);
  const pool = await retrieveCandidatesForModule(youtube, {
    key: "probe",
    searchQueries: queries,
  });

  console.log(
    `\nquery: ${queries.join(" | ")}\n` +
      `${pool.candidates.length} candidates after filtering · ${pool.unitsSpent} YouTube quota units\n`
  );

  let sliceable = 0;
  for (const c of pool.candidates) {
    const mark = c.sliceable ? "SLICE" : "  -  ";
    console.log(
      `[${String(c.index).padStart(2)}] ${mark} ${fmtDuration(c.durationSec).padStart(8)} ` +
        `${String(c.chapterCount).padStart(3)}ch  ${c.title.slice(0, 62)}`
    );
    console.log(
      `            ${c.channelName} · ${c.viewCount.toLocaleString()} views`
    );
    if (c.sliceable) sliceable += 1;
  }

  // Prove slicing produces playable boundaries on whatever real video we got.
  const best = pool.candidates.find((c) => c.sliceable);
  if (best) {
    const chapters = chaptersOf(best);
    console.log(
      `\n--- slicing "${best.title.slice(0, 60)}" (${chapters.length} chapters) ---`
    );
    chapters.slice(0, 5).forEach((ch, i) => {
      const lesson = buildLesson({
        moduleId: "m1",
        candidate: best,
        lessonTitle: ch.title,
        orderIndex: i + 1,
        strategy: "SLICE_CHAPTERS",
        chapterRange: { fromIndex: i, toIndex: i },
      });
      console.log(
        lesson
          ? `  ${String(i).padStart(2)}. ${fmtDuration(lesson.startSeconds)}-${fmtDuration(
              lesson.endSeconds ?? 0
            )} (${fmtDuration(lesson.durationSec)})  ${lesson.title.slice(0, 50)}`
          : `  ${i}. (unplayable)`
      );
    });

    // A multi-chapter lesson must span the whole range, not stop at the first.
    if (chapters.length >= 3) {
      const merged = buildLesson({
        moduleId: "m1",
        candidate: best,
        lessonTitle: "merged 0-2",
        orderIndex: 99,
        strategy: "SLICE_CHAPTERS",
        chapterRange: { fromIndex: 0, toIndex: 2 },
      });
      console.log(
        merged
          ? `  merged 0-2 -> ${fmtDuration(merged.startSeconds)}-${fmtDuration(merged.endSeconds ?? 0)} ` +
              `(${fmtDuration(merged.durationSec)})`
          : "  merged range unplayable"
      );
    }
  }

  const pct = pool.candidates.length
    ? Math.round((sliceable / pool.candidates.length) * 100)
    : 0;
  console.log(
    `\nsliceable: ${sliceable}/${pool.candidates.length} (${pct}%) · ` +
      `${pool.unitsSpent} units spent\n`
  );
}

main().catch((e) => {
  console.error(`\n${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
