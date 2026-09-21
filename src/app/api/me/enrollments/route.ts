import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/requireUser";
import { enroll, listEnrollments } from "@/lib/progress";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUserId();
  if ("response" in auth) return auth.response;
  return NextResponse.json(
    { enrollments: await listEnrollments(auth.userId) },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

const EnrollSchema = z.object({ courseId: z.string().min(1).max(64) });

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("response" in auth) return auth.response;
  const parsed = EnrollSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const enrollment = await enroll(auth.userId, parsed.data.courseId);
  return enrollment
    ? NextResponse.json({ enrollment })
    : NextResponse.json({ error: "Course not found" }, { status: 404 });
}
