/**
 * Parses an ISO-8601 duration ("PT1H2M3S") to seconds.
 *
 * Previously duplicated verbatim in `src/pages/api/videos.ts` and
 * `src/lib/youtube/playlistImporter.ts`.
 */
export function parseIsoDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h, m, s] = match;
  return Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0);
}
