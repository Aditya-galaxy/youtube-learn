import { google } from "googleapis";
import type { Course, Lesson, Module } from "../../../types/course";

/**
 * Extracts YouTube Playlist ID from a URL or raw ID string.
 */
export function extractPlaylistId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[A-Za-z0-9_-]{18,}$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    const listParam = url.searchParams.get("list");
    if (listParam) return listParam;
  } catch {
    // Not a valid URL
  }
  return null;
}

/**
 * Extracts YouTube Video ID from a URL or raw ID string.
 */
export function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.slice(1).split("?")[0];
    }
    const vParam = url.searchParams.get("v");
    if (vParam) return vParam;
  } catch {
    // Not a valid URL
  }
  return null;
}

function parseIsoDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h, m, s] = match;
  return Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0);
}

/**
 * Fetches a YouTube playlist using playlistItems.list (only 1 quota unit).
 * Organizes the videos into sequentially ordered modules and lessons.
 */
export async function importYouTubePlaylist({
  playlistId,
  apiKey,
}: {
  playlistId: string;
  apiKey: string;
}): Promise<Partial<Course> | { error: string }> {
  try {
    const youtube = google.youtube({
      version: "v3",
      auth: apiKey,
    });

    // 1. Fetch playlist metadata
    const playlistRes = await youtube.playlists.list({
      part: ["snippet"],
      id: [playlistId],
    });

    const playlistItem = playlistRes.data.items?.[0]?.snippet;
    if (!playlistItem) {
      return { error: "Playlist not found or is private." };
    }

    const playlistTitle = playlistItem.title || "Imported YouTube Playlist";
    const playlistDescription =
      playlistItem.description || "Course imported from YouTube Playlist";
    const channelName = playlistItem.channelTitle || "YouTube Creator";
    const thumbnail =
      playlistItem.thumbnails?.maxres?.url ||
      playlistItem.thumbnails?.high?.url ||
      playlistItem.thumbnails?.medium?.url ||
      "";

    // 2. Fetch playlist items (up to 50 videos in 1 quota unit call)
    const itemsRes = await youtube.playlistItems.list({
      part: ["snippet", "contentDetails"],
      playlistId,
      maxResults: 50,
    });

    const rawItems = itemsRes.data.items || [];
    if (rawItems.length === 0) {
      return { error: "Playlist has no videos." };
    }

    // Extract video IDs for duration lookup
    const videoIds = rawItems
      .map((it) => it.contentDetails?.videoId)
      .filter((id): id is string => Boolean(id));

    // Fetch video durations
    const videoDetailsRes = await youtube.videos.list({
      part: ["contentDetails"],
      id: videoIds,
    });

    const durationMap = new Map<string, number>();
    for (const v of videoDetailsRes.data.items || []) {
      if (v.id && v.contentDetails?.duration) {
        durationMap.set(v.id, parseIsoDuration(v.contentDetails.duration));
      }
    }

    // 3. Build Sequenced Lessons
    const courseId = `course-${Date.now()}`;
    const moduleId = `${courseId}-mod-1`;
    let totalSec = 0;

    const lessons: Lesson[] = [];
    rawItems.forEach((item, index) => {
      const vid = item.contentDetails?.videoId;
      if (!vid) return;

      const title = item.snippet?.title || `Lesson ${index + 1}`;
      if (title === "Private video" || title === "Deleted video") return;

      const durationSec = durationMap.get(vid) || 600;
      totalSec += durationSec;

      lessons.push({
        id: `${moduleId}-l-${index + 1}`,
        moduleId,
        title,
        orderIndex: index + 1,
        videoId: vid,
        channelName,
        durationSec,
        startSeconds: 0,
        summary: item.snippet?.description || "",
        isCompleted: false,
      });
    });

    const courseModule: Module = {
      id: moduleId,
      courseId,
      title: "Course Curriculum",
      orderIndex: 1,
      description: `Complete structured series of ${lessons.length} lessons.`,
      lessons,
    };

    const slug = playlistTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    return {
      id: courseId,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      title: playlistTitle,
      description: playlistDescription,
      thumbnail:
        thumbnail ||
        `https://i.ytimg.com/vi/${lessons[0]?.videoId}/mqdefault.jpg`,
      category: "Computer Science",
      difficulty: "BEGINNER",
      estimatedHours: Math.max(0.5, Math.round((totalSec / 3600) * 10) / 10),
      instructor: channelName,
      isPublic: true,
      modules: [courseModule],
    };
  } catch (err: unknown) {
    console.error("Error importing playlist:", err);
    return {
      error:
        err instanceof Error ? err.message : "Failed to import YouTube playlist",
    };
  }
}
