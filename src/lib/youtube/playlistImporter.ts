// SERVER ONLY. Importing this from a client component pulls googleapis — and
// with it `fs` and `child_process` — into the browser bundle and breaks the
// build. Client code wants ./playlistUrl instead.
//
// Not guarded with the `server-only` package: this module is consumed by a
// Pages Router API route, which that package treats as a client module and
// throws on at runtime. Revisit when the route moves to the App Router.
import { google, type youtube_v3 } from "googleapis";
import type { Course, Lesson, Module } from "../../../types/course";
import { parseIsoDuration } from "./duration";

export { extractPlaylistId, extractVideoId } from "./playlistUrl";

/** playlistItems.list caps at 50 per page; YouTube playlists routinely exceed it. */
const PAGE_SIZE = 50;
/** Safety rail so one enormous playlist cannot spend the whole daily quota. */
const MAX_PAGES = 10;
/** videos.list accepts at most 50 ids per call. */
const DETAILS_BATCH = 50;

/**
 * Fetches a YouTube playlist and organises it into ordered modules and lessons.
 *
 * Costs 1 unit for playlists.list, 1 per page of playlistItems.list, and 1 per
 * 50 videos for videos.list.
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

    // 2. Fetch every page of playlist items. A single un-paginated call
    // silently truncated any playlist longer than 50 videos.
    const rawItems: youtube_v3.Schema$PlaylistItem[] = [];
    let pageToken: string | undefined = undefined;

    for (let page = 0; page < MAX_PAGES; page += 1) {
      // Annotated explicitly: without it TS sees pageToken -> request ->
      // response -> pageToken as a circular inference (TS7022).
      const itemsPage: {
        data: youtube_v3.Schema$PlaylistItemListResponse;
      } = await youtube.playlistItems.list({
        part: ["snippet", "contentDetails"],
        playlistId,
        maxResults: PAGE_SIZE,
        pageToken,
      });
      rawItems.push(...(itemsPage.data.items || []));
      pageToken = itemsPage.data.nextPageToken ?? undefined;
      if (!pageToken) break;
    }

    if (rawItems.length === 0) {
      return { error: "Playlist has no videos." };
    }

    // Extract video IDs for duration lookup
    const videoIds = rawItems
      .map((it) => it.contentDetails?.videoId)
      .filter((id): id is string => Boolean(id));

    // videos.list takes at most 50 ids, so batch it alongside the pagination.
    const durationMap = new Map<string, number>();
    for (let i = 0; i < videoIds.length; i += DETAILS_BATCH) {
      const batch = videoIds.slice(i, i + DETAILS_BATCH);
      const videoDetailsRes = await youtube.videos.list({
        part: ["contentDetails"],
        id: batch,
      });
      for (const v of videoDetailsRes.data.items || []) {
        if (v.id && v.contentDetails?.duration) {
          durationMap.set(v.id, parseIsoDuration(v.contentDetails.duration));
        }
      }
    }

    // 3. Build Sequenced Lessons
    const courseId = `course-${Date.now()}`;
    const moduleId = `${courseId}-mod-1`;
    let totalSec = 0;

    // orderIndex counts *kept* lessons. Indexing by the source array left gaps
    // (1,2,4,5) whenever a private or deleted video was skipped, which breaks
    // the @@unique([moduleId, orderIndex]) contiguity the persist step expects.
    const lessons: Lesson[] = [];
    for (const item of rawItems) {
      const vid = item.contentDetails?.videoId;
      if (!vid) continue;

      const title = item.snippet?.title;
      if (!title || title === "Private video" || title === "Deleted video") {
        continue;
      }

      const durationSec = durationMap.get(vid) || 600;
      totalSec += durationSec;

      const orderIndex = lessons.length + 1;
      lessons.push({
        id: `${moduleId}-l-${orderIndex}`,
        moduleId,
        title,
        orderIndex,
        videoId: vid,
        channelName,
        durationSec,
        startSeconds: 0,
        summary: item.snippet?.description || "",
        isCompleted: false,
      });
    }

    if (lessons.length === 0) {
      return { error: "Playlist contains no playable videos." };
    }

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
        err instanceof Error
          ? err.message
          : "Failed to import YouTube playlist",
    };
  }
}
