import type { Lesson } from "../../../types/course";

export interface ParsedChapter {
  title: string;
  startSeconds: number;
  endSeconds?: number;
  durationSec: number;
}

/**
 * Converts HH:MM:SS or MM:SS timestamp string to total seconds.
 */
export function timestampToSeconds(timestamp: string): number {
  const parts = timestamp.trim().split(":").map(Number);
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return m * 60 + s;
  }
  return 0;
}

/**
 * Formats seconds into MM:SS or HH:MM:SS.
 */
export function formatSecondsToTime(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Parses chapter markers from YouTube video descriptions or comments.
 * Common formats:
 *   00:00 - Introduction
 *   05:23 Environment Setup
 *   (12:45) Lesson 2: Variables
 *   1:02:15 Building the Server
 */
export function parseChaptersFromDescription(
  text: string,
  totalVideoDurationSec?: number
): ParsedChapter[] {
  if (!text) return [];

  // Match lines with timestamps like: 00:00, 1:23:45, (04:12), 00:00:00
  const lines = text.split(/\r?\n/);
  const timestampRegex =
    /(?:^|\s|\()((?:\d{1,2}:)?\d{1,2}:\d{2})(?:\)|\s|-|–|—|:)*(.*)$/;

  const rawChapters: Array<{ title: string; startSeconds: number }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(timestampRegex);
    if (match) {
      const timestamp = match[1];
      const title = match[2];
      const cleanTitle = title
        .replace(/^[-–—:\s]+/, "")
        .replace(/[-–—:\s]+$/, "")
        .trim();

      if (cleanTitle.length > 0) {
        const startSeconds = timestampToSeconds(timestamp);
        rawChapters.push({
          title: cleanTitle,
          startSeconds,
        });
      }
    }
  }

  // Sort chronologically
  rawChapters.sort((a, b) => a.startSeconds - b.startSeconds);

  // Filter out any duplicates
  const uniqueChapters = rawChapters.filter(
    (item, index, self) =>
      index === 0 || item.startSeconds > self[index - 1].startSeconds
  );

  // Compute durations and endSeconds
  const result: ParsedChapter[] = [];
  for (let i = 0; i < uniqueChapters.length; i++) {
    const current = uniqueChapters[i];
    const next = uniqueChapters[i + 1];
    const endSeconds = next ? next.startSeconds : totalVideoDurationSec;
    const durationSec = endSeconds
      ? Math.max(0, endSeconds - current.startSeconds)
      : 300; // Default 5 mins if unknown

    result.push({
      title: current.title,
      startSeconds: current.startSeconds,
      endSeconds,
      durationSec,
    });
  }

  return result;
}

/**
 * Converts parsed chapters from a single monolithic video into sequenced Lessons.
 */
export function chaptersToLessons(
  chapters: ParsedChapter[],
  videoId: string,
  moduleId: string,
  channelName?: string
): Lesson[] {
  return chapters.map((chap, idx) => ({
    id: `${moduleId}-chap-${idx + 1}`,
    moduleId,
    title: chap.title,
    orderIndex: idx + 1,
    videoId,
    channelName,
    startSeconds: chap.startSeconds,
    endSeconds: chap.endSeconds,
    durationSec: chap.durationSec,
    summary: `Chapter ${idx + 1} of the course covering ${chap.title}. Starts at ${formatSecondsToTime(chap.startSeconds)}.`,
    isCompleted: false,
  }));
}
