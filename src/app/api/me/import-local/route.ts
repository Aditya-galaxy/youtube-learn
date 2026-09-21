import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/requireUser";
import { importLocalProgress } from "@/lib/progress";

export const dynamic = "force-dynamic";

// Bounded so a crafted request cannot turn one import into thousands of writes.
const ImportSchema = z.object({
  enrollments: z
    .array(
      z.object({
        courseId: z.string().min(1).max(64),
        completedLessonIds: z.array(z.string().min(1).max(64)).max(500),
        lastLessonId: z.string().max(64).optional(),
      })
    )
    .max(100),
  notes: z
    .array(
      z.object({
        lessonId: z.string().min(1).max(64),
        content: z.string().max(20_000),
      })
    )
    .max(500),
});

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("response" in auth) return auth.response;
  const parsed = ImportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid import" }, { status: 400 });
  return NextResponse.json({
    imported: await importLocalProgress(auth.userId, parsed.data),
  });
}
