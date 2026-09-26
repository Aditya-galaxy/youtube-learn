import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/requireUser";
import { chargeTokens, TUTOR_MESSAGE_COST } from "@/lib/rateLimit";
import { loadTutorLessonContext } from "@/lib/tutor/context";
import { tutorTurn, TutorUnavailableError } from "@/lib/tutor/respond";

export const dynamic = "force-dynamic";

/**
 * The learner's situation is looked up from their account by lessonId. Course
 * and lesson titles are deliberately not accepted from the client: the tutor
 * should teach where the learner actually is.
 */
const ChatSchema = z.object({
  lessonId: z.string().min(1).max(64),
  message: z.string().min(1).max(2_000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string().max(4_000),
      })
    )
    .max(20)
    .optional(),
});

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("response" in auth) return auth.response;

  const parsed = ChatSchema.safeParse(await request.json().catch(() => null));
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

  try {
    return NextResponse.json(
      await tutorTurn({
        ctx,
        message: parsed.data.message,
        history: parsed.data.history,
      })
    );
  } catch (error) {
    if (error instanceof TutorUnavailableError)
      return NextResponse.json(
        {
          error: "The tutor is unavailable right now. Please try again later.",
        },
        { status: 503 }
      );
    console.error("[tutor-chat] turn failed:", error);
    return NextResponse.json(
      { error: "The tutor could not answer just now. Please try again." },
      { status: 502 }
    );
  }
}
