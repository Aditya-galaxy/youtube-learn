import { NextResponse, after } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/requireUser";
import { chargeTokens, TUTOR_MESSAGE_COST } from "@/lib/rateLimit";
import { loadTutorLessonContext } from "@/lib/tutor/context";
import { tutorTurn, TutorUnavailableError } from "@/lib/tutor/respond";
import { ensureGrounding, readGrounding } from "@/lib/tutor/grounding";

export const dynamic = "force-dynamic";
// Watching a two-hour lecture takes about 90 seconds.
export const maxDuration = 300;

const OpenerSchema = z.object({ lessonId: z.string().min(1).max(64) });

/**
 * The tutor's opening move when a lesson is opened: what this lesson is for,
 * what to watch, and what it will ask afterwards. A companion that waits to be
 * spoken to is a search box; this is the difference.
 */
export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("response" in auth) return auth.response;

  const parsed = OpenerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const ctx = await loadTutorLessonContext(auth.userId, parsed.data.lessonId);
  if (!ctx)
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const charge = await chargeTokens(auth.userId, TUTOR_MESSAGE_COST);
  if ("error" in charge)
    return NextResponse.json(
      { error: charge.error },
      { status: charge.status }
    );

  const grounding = await readGrounding(ctx.lessonId);
  if (!grounding) {
    // First opener for this lesson answers from its structure alone, and the
    // video pass runs behind the response. It is built once and then shared by
    // everyone, so only the first learner to arrive waits a turn for it.
    after(async () => {
      try {
        await ensureGrounding(ctx.lessonId);
      } catch (error) {
        console.error("[tutor-opener] grounding failed:", error);
      }
    });
  }

  const brief = ctx.isCompleted
    ? `The learner has reopened a lesson they already completed. In at most four short lines: welcome them back, name the one idea worth re-checking, and offer a single retrieval question to see whether it stuck.`
    : `The learner just opened this lesson. In at most four short lines: say what this lesson gives them and why it matters here in the course, tell them precisely what to watch for, and state the one question you will ask them once they have watched. Do not summarise the video's content as if you had watched it.`;

  try {
    const turn = await tutorTurn({ ctx, message: brief, grounding });
    return NextResponse.json(turn);
  } catch (error) {
    if (error instanceof TutorUnavailableError)
      return NextResponse.json(
        { error: "The tutor is unavailable right now." },
        { status: 503 }
      );
    console.error("[tutor-opener] failed:", error);
    return NextResponse.json(
      { error: "The tutor could not start this lesson." },
      { status: 502 }
    );
  }
}
