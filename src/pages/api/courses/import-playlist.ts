import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { chargeTokens, PLAYLIST_IMPORT_COST } from "@/lib/rateLimit";
import { importYouTubePlaylist } from "@/lib/youtube/playlistImporter";

// Mirrors the discipline in src/pages/api/videos.ts: validate before spending
// quota, and never echo the caller's input or upstream error text back out.
const BodySchema = z.object({
  playlistId: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{2,64}$/, "playlistId must be a YouTube playlist id"),
  category: z.string().trim().min(1).max(60).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "private, no-store");

  // This previously read the session into a variable it never used, leaving an
  // unauthenticated, unmetered proxy to the project's YouTube API key.
  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    console.warn("import-playlist validation error:", parsed.error.flatten());
    return res.status(400).json({ error: "Invalid request body" });
  }
  const { playlistId, category } = parsed.data;

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error("Missing YOUTUBE_API_KEY");
    return res
      .status(503)
      .json({ error: "Server configuration error: YouTube API key not set" });
  }

  const charge = await chargeTokens(userId, PLAYLIST_IMPORT_COST);
  if ("error" in charge) {
    return res.status(charge.status).json({ error: charge.error });
  }

  const result = await importYouTubePlaylist({ playlistId, apiKey });

  if ("error" in result) {
    // The importer's messages are user-facing by design ("Playlist has no
    // videos."), but a not-found is a 404, not a 500.
    const notFound = /not found|private|no videos|no playable/i.test(
      result.error
    );
    return res
      .status(notFound ? 404 : 502)
      .json({ error: notFound ? result.error : "Failed to import playlist" });
  }

  if (category) {
    result.category = category;
  }

  return res
    .status(200)
    .json({ course: result, tokensRemaining: charge.tokensRemaining });
}
