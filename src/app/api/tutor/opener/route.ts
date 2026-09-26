import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/requireUser";
import { chargeTokens, TUTOR_MESSAGE_COST } from "@/lib/rateLimit";
import { loadTutorLessonContext } from "@/lib/tutor/context";
import { tutorTurn, TutorUnavailableError } from "@/lib/tutor/respond";

export const dynamic = "force-dynamic";

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

  const brief = ctx.isCompleted
    ? `The learner has reopened a lesson they already completed. In at most four short lines: welcome them back, name the one idea worth re-checking, and offer a single retrieval question to see whether it stuck.`
    : `The learner just opened this lesson. In at most four short lines: say what this lesson gives them and why it matters here in the course, tell them precisely what to watch for, and state the one question you will ask them once they have watched. Do not summarise the video's content as if you had watched it.`;

  try {
    const turn = await tutorTurn({ ctx, message: brief });
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
