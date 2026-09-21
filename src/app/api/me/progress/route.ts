import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/requireUser";
import { setLessonProgress } from "@/lib/progress";

export const dynamic = "force-dynamic";

// Deliberately no progressPct field: the server derives it from completion
// rows, so a client cannot simply claim 100%.
const ProgressSchema = z
  .object({
    lessonId: z.string().min(1).max(64),
    completed: z.boolean().optional(),
    positionSec: z.number().int().min(0).max(86_400).optional(),
  })
  .refine((v) => v.completed !== undefined || v.positionSec !== undefined, {
    message: "Nothing to update",
  });

export async function PUT(request: Request) {
  const auth = await requireUserId();
  if ("response" in auth) return auth.response;
  const parsed = ProgressSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { lessonId, ...update } = parsed.data;
  const enrollment = await setLessonProgress(auth.userId, lessonId, update);
  return enrollment
    ? NextResponse.json({ enrollment })
    : NextResponse.json({ error: "Lesson not found" }, { status: 404 });
}
