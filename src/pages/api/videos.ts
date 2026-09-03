import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { google, youtube_v3 } from "googleapis";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import type { Video } from "../../../types/video";

interface VideoResponse {
  videos: Video[];
  nextPageToken?: string;
  tokensRemaining: number;
}

interface ErrorResponse {
  error: string;
  tokensRemaining?: number;
}

// Quota accounting. A search.list + videos.list pair costs ~101 real YouTube
// units; TOKENS_PER_REQUEST is our own per-user budget unit, not YouTube's.
const HOURLY_TOKEN_LIMIT = 10_000;
const TOKENS_PER_REQUEST = 50;
const MAX_RESULTS = 12;
const HOURS_24 = 24 * 60 * 60 * 1000;
const MIN_DURATION_SECONDS = 120;
const MIN_VIEW_COUNT = 100;
const EDUCATION_CATEGORY_ID = "27";
const DEFAULT_FEED_QUERY = "university lecture";

const QuerySchema = z.object({
  q: z.string().trim().min(1).max(200).optional(),
  pageToken: z.string().max(1024).optional(),
  refresh: z.enum(["true", "false"]).optional(),
  // YouTube rejects a non-numeric videoCategoryId and a malformed
  // regionCode/relevanceLanguage with a 400, so validate before we spend quota.
  category: z
    .string()
    .regex(/^\d{1,3}$/, "category must be a numeric YouTube category id")
    .optional(),
  language: z
    .string()
    .regex(/^[a-z]{2}(-[A-Za-z]{2})?$/, "language must be an ISO 639-1 code")
    .optional()
    .default("en"),
  region: z
    .string()
    .regex(/^[A-Z]{2}$/, "region must be an ISO 3166-1 alpha-2 code")
    .optional()
    .default("US"),
  order: z
    .enum(["relevance", "viewCount", "date", "rating"])
    .optional()
    .default("relevance"),
});

/**
 * Charges the caller's hourly budget atomically.
 *
 * The window is an *epoch* hour (hours since 1970) rather than a wall-clock
 * hour-of-day. The previous version stored `getHours()`, so a user returning
 * exactly 24h later saw `lastResetHour === hour` and kept their stale balance
 * instead of getting a fresh window. Epoch hours keep the column an Int, so no
 * migration is needed, and old 0-23 values simply read as "long expired".
 *
 * The read-then-write inside an interactive transaction it replaces was racy
 * under READ COMMITTED: parallel requests both read the old total and both
 * wrote the same incremented value. `ON CONFLICT DO UPDATE` takes a row lock,
 * so concurrent charges serialise.
 */
async function chargeTokens(
  userId: string
): Promise<{ tokensRemaining: number } | { error: string; status: 429 | 500 }> {
  const window = Math.floor(Date.now() / 3_600_000);

  try {
    const rows = await prisma.$queryRaw<Array<{ tokensUsed: number }>>`
      INSERT INTO user_tokens ("id", "userId", "tokensUsed", "lastResetHour")
      VALUES (${randomUUID()}, ${userId}, ${TOKENS_PER_REQUEST}, ${window})
      ON CONFLICT ("userId") DO UPDATE SET
        "tokensUsed" = CASE
          WHEN user_tokens."lastResetHour" = ${window}
            THEN user_tokens."tokensUsed" + ${TOKENS_PER_REQUEST}
          ELSE ${TOKENS_PER_REQUEST}
        END,
        "lastResetHour" = ${window}
      RETURNING "tokensUsed"
    `;

    const tokensUsed = rows[0]?.tokensUsed ?? TOKENS_PER_REQUEST;
    if (tokensUsed > HOURLY_TOKEN_LIMIT) {
      return {
        error: "Hourly request limit reached. Please try again later.",
        status: 429,
      };
    }
    return { tokensRemaining: HOURLY_TOKEN_LIMIT - tokensUsed };
  } catch (error) {
    console.error("Token usage error:", error);
    return { error: "Failed to process token usage", status: 500 };
  }
}

async function getRecentlySeenVideoIds(userId: string): Promise<string[]> {
  try {
    const seen = await prisma.viewedVideos.findMany({
      where: { userId, viewedAt: { gte: new Date(Date.now() - HOURS_24) } },
      select: { videoId: true },
    });
    return seen.map((v) => v.videoId);
  } catch (error) {
    console.error("Error fetching viewed videos:", error);
    return [];
  }
}

/**
 * `create()` per video inside a transaction used to abort the whole batch the
 * first time a video was returned twice, because of @@unique([userId, videoId]).
 */
async function recordSeenVideos(userId: string, videos: Video[]) {
  if (videos.length === 0) return;
  try {
    await prisma.viewedVideos.createMany({
      data: videos.map((video) => ({ userId, videoId: video.id })),
      skipDuplicates: true,
    });
  } catch (error) {
    console.error("Error updating viewed videos:", error);
  }
}

function parseIsoDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h, m, s] = match;
  return Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0);
}

/**
 * Rejects obviously non-educational uploads. Deliberately narrower than the
 * previous list, which also dropped legitimate results: "live", "stream",
 * "daily" and "clips" all appear in real lecture titles ("Live coding",
 * "Streaming algorithms", "Daily astronomy").
 */
function hasSuspiciousTitle(title: string): boolean {
  const suspiciousPatterns = [
    /\b(prank|reaction|gameplay|tiktok|shorts)\b/i,
    /\b(click\s*bait|clickbait|click\s*here|must\s*watch)\b/i,
    /\b(fortnite|minecraft|roblox|game\s*play)\b/i,
    /\b(vlog|unboxing|challenge\s*video)\b/i,
    /[\u{1F600}-\u{1F64F}\u{1F3AE}-\u{1F3B2}]/u,
  ];
  return suspiciousPatterns.some((pattern) => pattern.test(title));
}

async function fetchYouTubeVideos({
  youtube,
  searchQuery,
  pageToken,
  seenVideoIds,
  category,
  language,
  region,
  order,
}: {
  youtube: youtube_v3.Youtube;
  searchQuery?: string;
  pageToken?: string;
  seenVideoIds: string[];
  category?: string;
  language: string;
  region: string;
  order: "relevance" | "viewCount" | "date" | "rating";
}): Promise<{ videos: Video[]; nextPageToken?: string } | { error: string }> {
  try {
    const searchResponse = await youtube.search.list({
      part: ["snippet"],
      maxResults: MAX_RESULTS,
      type: ["video"],
      videoCategoryId: category || EDUCATION_CATEGORY_ID,
      order,
      pageToken,
      // The old query appended `site:edu` and `(lecture|course|education)`.
      // YouTube's search API supports neither Google's `site:` operator nor
      // parenthesised alternation, so both were matched as literal text and
      // starved the result set. The Education category filter below is what
      // actually constrains the topic.
      q: searchQuery || DEFAULT_FEED_QUERY,
      relevanceLanguage: language,
      regionCode: region,
      safeSearch: "moderate",
      // Every result is rendered in an iframe, so exclude anything that cannot
      // legally be embedded — those used to render as "Video unavailable".
      videoEmbeddable: "true",
      videoSyndicated: "true",
    });

    const searchItems = searchResponse.data.items ?? [];
    if (searchItems.length === 0) {
      return { videos: [], nextPageToken: undefined };
    }

    const videoIds = searchItems
      .map((item) => item.id?.videoId)
      .filter((id): id is string => Boolean(id));

    if (videoIds.length === 0) {
      return { videos: [], nextPageToken: undefined };
    }

    const videoDetails = await youtube.videos.list({
      part: ["contentDetails", "statistics", "snippet"],
      id: videoIds,
    });

    const detailsById = new Map(
      (videoDetails.data.items ?? []).map((item) => [item.id, item])
    );
    const seen = new Set(seenVideoIds);

    const videos: Video[] = [];
    for (const searchItem of searchItems) {
      const videoId = searchItem.id?.videoId;
      if (!videoId) continue;

      const detail = detailsById.get(videoId);
      if (!detail) continue;

      const duration = detail.contentDetails?.duration ?? "";
      const viewCount = Number(detail.statistics?.viewCount ?? 0);

      if (
        parseIsoDuration(duration) < MIN_DURATION_SECONDS ||
        viewCount < MIN_VIEW_COUNT ||
        hasSuspiciousTitle(searchItem.snippet?.title ?? "")
      ) {
        continue;
      }

      videos.push({
        id: videoId,
        title: searchItem.snippet?.title ?? "",
        thumbnail:
          searchItem.snippet?.thumbnails?.medium?.url ??
          `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        channelName: searchItem.snippet?.channelTitle ?? "",
        channelId: searchItem.snippet?.channelId ?? "",
        // Kept as an ISO string so the client can format it in the viewer's
        // locale; `toLocaleDateString()` on the server used the server locale.
        publishedAt: searchItem.snippet?.publishedAt ?? "",
        duration,
        views: detail.statistics?.viewCount ?? "0",
        description: searchItem.snippet?.description ?? "",
        watched: seen.has(videoId),
        inLibrary: false,
      });
    }

    return {
      videos,
      nextPageToken: searchResponse.data.nextPageToken ?? undefined,
    };
  } catch (error) {
    const err = error as { code?: number; message?: string };
    if (err.code === 403 && err.message?.includes("quota")) {
      return {
        error: "YouTube API quota exceeded for today. Please try again later.",
      };
    }
    console.error("YouTube API error:", error);
    return { error: "Failed to fetch videos from YouTube" };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VideoResponse | ErrorResponse>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Per-user results must never be stored by a shared cache.
  res.setHeader("Cache-Control", "private, no-store");

  try {
    const queryResult = QuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      // Log the detail, return a generic message: the raw Zod error echoed the
      // caller's input straight back into the response body.
      console.warn("Query validation error:", queryResult.error.flatten());
      return res.status(400).json({ error: "Invalid query parameters" });
    }
    const { q, pageToken, refresh, category, language, region, order } =
      queryResult.data;

    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!process.env.YOUTUBE_API_KEY) {
      console.error("Missing YOUTUBE_API_KEY");
      return res
        .status(500)
        .json({ error: "Server configuration error: YouTube API key not set" });
    }

    const tokenResult = await chargeTokens(userId);
    if ("error" in tokenResult) {
      return res
        .status(tokenResult.status)
        .json({ error: tokenResult.error, tokensRemaining: 0 });
    }

    const youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });

    const seenVideoIds = await getRecentlySeenVideoIds(userId);

    const result = await fetchYouTubeVideos({
      youtube,
      searchQuery: q,
      pageToken,
      seenVideoIds,
      category,
      language,
      region,
      order,
    });

    if ("error" in result) {
      return res.status(502).json({ error: result.error });
    }

    if (refresh !== "true") {
      await recordSeenVideos(userId, result.videos);
    }

    return res.status(200).json({
      videos: result.videos,
      nextPageToken: result.nextPageToken,
      tokensRemaining: tokenResult.tokensRemaining,
    });
  } catch (error) {
    const err = error as { code?: unknown; message?: string };
    console.error("API Error:", err.message, err.code);
    if (err.code === "ECONNREFUSED") {
      return res.status(503).json({ error: "YouTube service unavailable" });
    }
    if (err.code === "ETIMEDOUT") {
      return res.status(504).json({ error: "Request timed out" });
    }
    // Never forward the upstream error text: it can contain the API key and
    // internal endpoint details.
    return res.status(500).json({ error: "Internal server error" });
  }
}
