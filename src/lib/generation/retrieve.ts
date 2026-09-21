import type { youtube_v3 } from "googleapis";
import type { SyllabusModule } from "@/lib/ai/schemas";
import { searchVideos, type VideoCandidate } from "@/lib/youtube/searchVideos";
import { parseChaptersFromDescription } from "@/lib/youtube/chapterParser";
import { formatSecondsToTime } from "@/lib/youtube/chapterParser";

/**
 * Stage B: build a candidate pool per module.
 *
 * Searches at MODULE granularity, not per lesson. search.list costs 100 quota
 * units against a 10,000/day default shared with the feed, so a per-lesson
 * search at ~24 lessons would be 2,400 units — four courses a day for the
 * whole project. One search returns a pool several lessons are chosen from.
 */

/** A lesson needs more than a clip; below this it cannot carry a concept. */
export const MIN_LESSON_DURATION_SEC = 300;
/** Long enough that chapters are worth looking for. */
export const SLICEABLE_DURATION_SEC = 1200;
/**
 * Longest a single lesson may be. Measured against live results: long videos
 * with no chapter markers are common in some domains (every "organic chemistry
 * full course" candidate was 2-7 hours with zero timestamps), and without this
 * ceiling selection would happily make a 7h35m video one "lesson".
 */
export const MAX_LESSON_DURATION_SEC = 2700;
/** Higher than the feed's floor: a course lesson should be well-established. */
export const MIN_LESSON_VIEW_COUNT = 1000;
export const CANDIDATES_PER_QUERY = 12;
/**
 * Stop searching a module once the pool is this deep. Running every query
 * unconditionally cost ~1,300-1,500 units for a 5-module course (3 queries x
 * 101 each) against the plan's ~500 budget. Coverage lost to stopping early is
 * recovered by the gap-filling pass in module.ts, which runs the remaining
 * queries only for modules that actually came back with unmatched lessons.
 */
export const GOOD_ENOUGH_POOL = 10;

export interface PoolCandidate extends VideoCandidate {
  /** Index within this module's pool — what the model selects by. */
  index: number;
  /** Parsed from the full description; 0 when none or not long enough to matter. */
  chapterCount: number;
  sliceable: boolean;
  /** False for anything too long to sit behind a single lesson. */
  usableAsFullVideo: boolean;
}

export interface ModulePool {
  moduleKey: string;
  candidates: PoolCandidate[];
  unitsSpent: number;
  /** Queries actually run; early-stop may leave some for a gap-filling pass. */
  queriesUsed: string[];
}

export async function retrieveCandidatesForModule(
  youtube: youtube_v3.Youtube,
  mod: Pick<SyllabusModule, "key" | "searchQueries">,
  options: { language?: string; region?: string } = {}
): Promise<ModulePool> {
  const byVideoId = new Map<string, VideoCandidate>();
  let unitsSpent = 0;
  const queriesUsed: string[] = [];

  for (const query of mod.searchQueries) {
    queriesUsed.push(query);
    const result = await searchVideos(youtube, {
      query,
      maxResults: CANDIDATES_PER_QUERY,
      // Deliberately NOT pinned to the Education category. That is right for a
      // browsable feed and wrong here: much of the best teaching content sits
      // under Science & Technology or Howto, and combining a category filter
      // with a narrow topical query starves niche subjects.
      minDurationSec: MIN_LESSON_DURATION_SEC,
      minViewCount: MIN_LESSON_VIEW_COUNT,
      language: options.language,
      region: options.region,
    });
    unitsSpent += result.unitsSpent;

    for (const candidate of result.candidates) {
      // Queries within a module overlap heavily; first occurrence wins.
      if (!byVideoId.has(candidate.videoId)) {
        byVideoId.set(candidate.videoId, candidate);
      }
    }

    if (byVideoId.size >= GOOD_ENOUGH_POOL) break;
  }

  const candidates = [...byVideoId.values()].map((candidate, index) =>
    toPoolCandidate(candidate, index)
  );

  return { moduleKey: mod.key, candidates, unitsSpent, queriesUsed };
}

export function toPoolCandidate(
  candidate: VideoCandidate,
  index: number
): PoolCandidate {
  const chapters =
    candidate.durationSec >= SLICEABLE_DURATION_SEC
      ? parseChaptersFromDescription(
          candidate.description,
          candidate.durationSec
        )
      : [];

  return {
    ...candidate,
    index,
    chapterCount: chapters.length,
    usableAsFullVideo: candidate.durationSec <= MAX_LESSON_DURATION_SEC,
    // Slicing one long, well-chaptered video into a module is both the
    // cheapest outcome (one search instead of many) and the best teaching
    // outcome: one instructor, one notation, one running example throughout.
    sliceable:
      candidate.durationSec >= SLICEABLE_DURATION_SEC && chapters.length >= 3,
  };
}

/** Renders the pool as the numbered list the model selects from by index. */
export function formatPoolForPrompt(pool: ModulePool): string {
  if (pool.candidates.length === 0) return "(no candidates found)";

  return pool.candidates
    .map((c) => {
      const mins = Math.round(c.durationSec / 60);
      const views =
        c.viewCount >= 1e6
          ? `${(c.viewCount / 1e6).toFixed(1)}M`
          : `${Math.round(c.viewCount / 1000)}K`;
      const chapters = c.sliceable
        ? `, ${c.chapterCount} chapters (sliceable)`
        : c.usableAsFullVideo
          ? ""
          : ", TOO LONG for one lesson and has no chapters — unusable";
      const lines = [
        `[${c.index}] ${c.title}`,
        `    ${c.channelName} · ${mins} min · ${views} views${chapters}`,
        `    ${c.description.slice(0, 220).replace(/\s+/g, " ").trim()}`,
      ];
      // Without the chapter list the model picks chapterRange blind — it only
      // knew HOW MANY chapters existed, and produced a one-minute "lesson".
      if (c.sliceable) {
        const chs = parseChaptersFromDescription(c.description, c.durationSec);
        lines.push("    chapters:");
        for (const [i, ch] of chs.entries()) {
          const dur = Math.round((ch.durationSec ?? 0) / 60);
          lines.push(
            `      ${i}. ${formatSecondsToTime(ch.startSeconds)} ${ch.title} (${dur} min)`
          );
        }
      }
      return lines.join("\n");
    })
    .join("\n");
}
