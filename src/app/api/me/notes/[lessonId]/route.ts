import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/requireUser";
import { getNote, saveNote } from "@/lib/progress";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ lessonId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUserId();
  if ("response" in auth) return auth.response;
  const { lessonId } = await params;
  return NextResponse.json(
    { content: await getNote(auth.userId, lessonId) },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

const NoteSchema = z.object({ content: z.string().max(20_000) });

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireUserId();
  if ("response" in auth) return auth.response;
  const { lessonId } = await params;
  const parsed = NoteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid note" }, { status: 400 });
  const ok = await saveNote(auth.userId, lessonId, parsed.data.content);
  return ok
    ? NextResponse.json({ saved: true })
    : NextResponse.json({ error: "Lesson not found" }, { status: 404 });
}
