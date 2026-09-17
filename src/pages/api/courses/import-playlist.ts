import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { importYouTubePlaylist } from "@/lib/youtube/playlistImporter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  // Allow authenticated users (or local dev)
  const { playlistId, category } = req.body;
  if (!playlistId || typeof playlistId !== "string") {
    return res.status(400).json({ error: "playlistId is required" });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "YOUTUBE_API_KEY is not configured on the server",
    });
  }

  const result = await importYouTubePlaylist({
    playlistId,
    apiKey,
  });

  if ("error" in result) {
    return res.status(500).json({ error: result.error });
  }

  if (category) {
    result.category = category;
  }

  return res.status(200).json({ course: result });
}
