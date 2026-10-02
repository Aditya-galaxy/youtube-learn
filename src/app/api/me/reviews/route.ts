import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/requireUser";
import { listSchedules, recordReview } from "@/lib/reviews";

export const dynamic = "force-dynamic";

/**
 * The learner's spaced-retrieval schedules.
 *
 * Deliberately no due date in the request body: the server decides when a card
 * returns, so a client cannot retire a card it keeps getting wrong.
 */
const ReviewSchema = z.object({
  cardId: z.string().min(1).max(200),
  correct: z.boolean(),
  lessonId: z.string().min(1).max(64).optional(),
});

export async function GET() {
  const auth = await requireUserId();
  if ("response" in auth) return auth.response;

  return NextResponse.json(
    { schedules: await listSchedules(auth.userId) },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("response" in auth) return auth.response;

  const parsed = ReviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  return NextResponse.json({
    schedule: await recordReview(auth.userId, parsed.data),
  });
}
