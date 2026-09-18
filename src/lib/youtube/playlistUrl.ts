/**
 * Pure URL/ID helpers for YouTube playlists and videos.
 *
 * Deliberately separate from `playlistImporter.ts`: that module imports
 * `googleapis`, which drags Node built-ins (`fs`, `child_process`) into any
 * bundle that touches it. `CourseImporterDialog` is a client component and
 * only needs these two functions, so importing them from the same file as the
 * API client broke the production build.
 */

/** Extracts a playlist ID from a URL or accepts a raw ID. */
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

/** Extracts a video ID from a URL or accepts a raw ID. */
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
