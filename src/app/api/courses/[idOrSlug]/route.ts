import { NextResponse } from "next/server";
import { findCourse } from "@/lib/courseRepository";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  const { idOrSlug } = await params;
  try {
    const course = await findCourse(idOrSlug);
    return course
      ? NextResponse.json({ course })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error("[courses] fetch failed:", error);
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
}
