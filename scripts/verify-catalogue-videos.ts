/**
 * Checks every video id in the static catalogue against the YouTube API.
 *
 * The open-courseware catalogue shipped with 15 ids that did not exist and 4
 * that refused embedding, because nothing ever asked YouTube whether they were
 * real. One videos.list call covers 50 ids for 1 quota unit, so this is cheap
 * enough to run before every release.
 *
 * Run with: npm run verify:videos
 */
import { CURATED_COURSES } from "../src/lib/coursesData";
import { recordYouTubeUnits } from "../src/lib/youtube/quota";

type Ref = { videoId: string; where: string };

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("YOUTUBE_API_KEY is not set");

  const refs: Ref[] = [];
  for (const course of CURATED_COURSES)
    for (const mod of course.modules)
      for (const lesson of mod.lessons)
        if (lesson.videoId)
          refs.push({
            videoId: lesson.videoId,
            where: `${course.id} / ${lesson.id} "${lesson.title}"`,
          });

  const unique = [...new Set(refs.map((r) => r.videoId))];
  const found = new Map<string, { embeddable: boolean; durationSec: number }>();

  for (let i = 0; i < unique.length; i += 50) {
    const batch = unique.slice(i, i + 50);
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "status,contentDetails");
    url.searchParams.set("id", batch.join(","));
    url.searchParams.set("key", apiKey);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube API ${res.status}`);
    const body = (await res.json()) as {
      items?: {
        id: string;
        status: { embeddable?: boolean };
        contentDetails: { duration: string };
      }[];
    };
    await recordYouTubeUnits(1);
    for (const item of body.items ?? []) {
      const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(
        item.contentDetails.duration
      );
      found.set(item.id, {
        embeddable: item.status.embeddable !== false,
        durationSec:
          Number(m?.[1] ?? 0) * 3600 +
          Number(m?.[2] ?? 0) * 60 +
          Number(m?.[3] ?? 0),
      });
    }
  }

  const problems: string[] = [];
  for (const ref of refs) {
    const hit = found.get(ref.videoId);
    if (!hit) problems.push(`MISSING   ${ref.videoId}  ${ref.where}`);
    else if (!hit.embeddable)
      problems.push(`NOEMBED   ${ref.videoId}  ${ref.where}`);
  }

  console.log(
    `Checked ${refs.length} lesson videos (${unique.length} unique ids).`
  );
  if (problems.length) {
    console.error(`\n${problems.length} broken:\n${problems.join("\n")}`);
    process.exit(1);
  }
  console.log("All lesson videos exist and allow embedding.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
