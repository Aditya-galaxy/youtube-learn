import type { youtube_v3 } from "googleapis";
import type { SyllabusModule } from "@/lib/ai/schemas";
import { searchVideos, type VideoCandidate } from "@/lib/youtube/searchVideos";
import { parseChaptersFromDescription } from "@/lib/youtube/chapterParser";

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
/** Higher than the feed's floor: a course lesson should be well-established. */
export const MIN_LESSON_VIEW_COUNT = 1000;
export const CANDIDATES_PER_QUERY = 12;

export interface PoolCandidate extends VideoCandidate {
  /** Index within this module's pool — what the model selects by. */
  index: number;
  /** Parsed from the full description; 0 when none or not long enough to matter. */
  chapterCount: number;
  sliceable: boolean;
}

export interface ModulePool {
  moduleKey: string;
  candidates: PoolCandidate[];
  unitsSpent: number;
}

export async function retrieveCandidatesForModule(
  youtube: youtube_v3.Youtube,
  mod: Pick<SyllabusModule, "key" | "searchQueries">,
  options: { language?: string; region?: string } = {}
): Promise<ModulePool> {
  const byVideoId = new Map<string, VideoCandidate>();
  let unitsSpent = 0;

  for (const query of mod.searchQueries) {
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
  }

  const candidates = [...byVideoId.values()].map((candidate, index) =>
    toPoolCandidate(candidate, index)
  );

  return { moduleKey: mod.key, candidates, unitsSpent };
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
        : "";
      return [
        `[${c.index}] ${c.title}`,
        `    ${c.channelName} · ${mins} min · ${views} views${chapters}`,
        `    ${c.description.slice(0, 220).replace(/\s+/g, " ").trim()}`,
      ].join("\n");
    })
    .join("\n");
}
