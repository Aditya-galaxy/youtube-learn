import { NextResponse } from "next/server";
import { listPublicCourses } from "@/lib/courseRepository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ courses: await listPublicCourses() });
  } catch (error) {
    // A down database should degrade the catalogue to the curated courses the
    // client already has, not break the page.
    console.error("[courses] list failed:", error);
    return NextResponse.json({ courses: [] });
  }
}
