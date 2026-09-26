import { google, type youtube_v3 } from "googleapis";
import { decodeDeep } from "@/lib/youtube/decodeEntities";
import { parseIsoDuration } from "./duration";
import {
  hasSearchQuota,
  isQuotaError,
  markQuotaExhausted,
  recordYouTubeUnits,
  YouTubeQuotaExhaustedError,
} from "./quota";

/**
 * Shared YouTube search, used by both the browsable feed and the course
 * generator. They want different filters, so the differences are parameters
 * rather than two copies of the two-call search.list + videos.list join.
 */

export interface VideoCandidate {
  videoId: string;
  title: string;
  /**
   * The FULL description, taken from videos.list.
   *
   * search.list truncates snippet.description, and chapter markers live past
   * the truncation point — reading it from the search response silently
   * disables chapter slicing, which is both the quota strategy and the best
   * pedagogical outcome.
   */
  description: string;
  channelName: string;
  channelId: string;
  publishedAt: string;
  durationSec: number;
  viewCount: number;
}

export interface SearchOptions {
  query: string;
  maxResults?: number;
  /** Omit entirely to search all of YouTube. The feed pins this to 27 (Education). */
  videoCategoryId?: string;
  order?: "relevance" | "viewCount" | "date" | "rating";
  pageToken?: string;
  language?: string;
  region?: string;
  minDurationSec?: number;
  minViewCount?: number;
  /** Drops obviously non-educational uploads. On by default. */
  filterSuspiciousTitles?: boolean;
}

export interface SearchResult {
  candidates: VideoCandidate[];
  nextPageToken?: string;
  /** Real YouTube quota units spent: 100 for search.list, 1 per videos.list. */
  unitsSpent: number;
}

export const SEARCH_LIST_UNITS = 100;
export const VIDEOS_LIST_UNITS = 1;

/**
 * Rejects obviously non-educational uploads. Deliberately narrow: "live",
 * "stream", "daily" and "clips" all appear in real lecture titles ("Live
 * coding", "Streaming algorithms", "Daily astronomy").
 */
export function hasSuspiciousTitle(title: string): boolean {
  const suspiciousPatterns = [
    /\b(prank|reaction|gameplay|tiktok|shorts)\b/i,
    /\b(click\s*bait|clickbait|click\s*here|must\s*watch)\b/i,
    /\b(fortnite|minecraft|roblox|game\s*play)\b/i,
    /\b(vlog|unboxing|challenge\s*video)\b/i,
    /[\u{1F600}-\u{1F64F}\u{1F3AE}-\u{1F3B2}]/u,
  ];
  return suspiciousPatterns.some((pattern) => pattern.test(title));
}

export function createYouTubeClient(apiKey: string): youtube_v3.Youtube {
  return google.youtube({ version: "v3", auth: apiKey });
}

export async function searchVideos(
  youtube: youtube_v3.Youtube,
  options: SearchOptions
): Promise<SearchResult> {
  const {
    query,
    maxResults = 12,
    videoCategoryId,
    order = "relevance",
    pageToken,
    language = "en",
    region = "US",
    minDurationSec = 120,
    minViewCount = 100,
    filterSuspiciousTitles = true,
  } = options;

  // Refuse before spending: past the day's ceiling the call can only fail, and
  // failing here is cheaper and clearer than a raw 403 from Google.
  if (!(await hasSearchQuota())) throw new YouTubeQuotaExhaustedError();

  let searchResponse;
  try {
    searchResponse = await youtube.search.list({
      part: ["snippet"],
      maxResults,
      type: ["video"],
      ...(videoCategoryId ? { videoCategoryId } : {}),
      order,
      pageToken,
      q: query,
      relevanceLanguage: language,
      regionCode: region,
      safeSearch: "moderate",
      // Everything is played in an iframe, so anything unembeddable is useless
      // to us — it would render as "Video unavailable" inside a course.
      videoEmbeddable: "true",
      videoSyndicated: "true",
    });
  } catch (error) {
    if (isQuotaError(error)) {
      await markQuotaExhausted();
      throw new YouTubeQuotaExhaustedError();
    }
    throw error;
  }

  let unitsSpent = SEARCH_LIST_UNITS;
  const searchItems = searchResponse.data.items ?? [];
  const videoIds = searchItems
    .map((item) => item.id?.videoId)
    .filter((id): id is string => Boolean(id));

  if (videoIds.length === 0) {
    await recordYouTubeUnits(unitsSpent);
    return { candidates: [], nextPageToken: undefined, unitsSpent };
  }

  let details;
  try {
    details = await youtube.videos.list({
      part: ["contentDetails", "statistics", "snippet"],
      id: videoIds,
    });
  } catch (error) {
    await recordYouTubeUnits(unitsSpent);
    if (isQuotaError(error)) {
      await markQuotaExhausted();
      throw new YouTubeQuotaExhaustedError();
    }
    throw error;
  }
  unitsSpent += VIDEOS_LIST_UNITS;
  await recordYouTubeUnits(unitsSpent);

  const candidates: VideoCandidate[] = [];
  for (const item of details.data.items ?? []) {
    const videoId = item.id;
    if (!videoId) continue;

    const title = decodeDeep(item.snippet?.title ?? "");
    const durationSec = parseIsoDuration(item.contentDetails?.duration ?? "");
    const viewCount = Number(item.statistics?.viewCount ?? 0);

    if (durationSec < minDurationSec) continue;
    if (viewCount < minViewCount) continue;
    if (filterSuspiciousTitles && hasSuspiciousTitle(title)) continue;

    candidates.push({
      videoId,
      title,
      description: decodeDeep(item.snippet?.description ?? ""),
      channelName: decodeDeep(item.snippet?.channelTitle ?? ""),
      channelId: item.snippet?.channelId ?? "",
      publishedAt: item.snippet?.publishedAt ?? "",
      durationSec,
      viewCount,
    });
  }

  // videos.list does not preserve the relevance order of the search response.
  const rank = new Map(videoIds.map((id, i) => [id, i]));
  candidates.sort((a, b) => rank.get(a.videoId)! - rank.get(b.videoId)!);

  return {
    candidates,
    nextPageToken: searchResponse.data.nextPageToken ?? undefined,
    unitsSpent,
  };
}
