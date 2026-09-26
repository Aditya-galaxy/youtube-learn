import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/requireUser";

export const dynamic = "force-dynamic";

/**
 * Records that a video was actually watched, as opposed to merely served by
 * the feed. The client calls this once a video has been open long enough to
 * count, so History reflects what the learner watched rather than what
 * scrolled past them.
 */
const WatchedSchema = z.object({
  videoId: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[A-Za-z0-9_-]+$/, "Not a video id"),
});

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("response" in auth) return auth.response;

  const parsed = WatchedSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { videoId } = parsed.data;
  const watchedAt = new Date();

  // The feed may already hold a row for this video from having shown it; this
  // adds the watch to it rather than creating a second row.
  await prisma.viewedVideos.upsert({
    where: { userId_videoId: { userId: auth.userId, videoId } },
    create: { userId: auth.userId, videoId, watchedAt },
    update: { watchedAt },
  });

  return NextResponse.json({ watched: true });
}
