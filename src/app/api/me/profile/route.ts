import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/requireUser";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ProfileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  bio: z.string().trim().max(500).optional(),
  learningGoal: z.string().trim().max(200).optional(),
  skillLevel: z
    .enum(["BASIC", "BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"])
    .optional(),
  weeklyHours: z.number().int().min(1).max(40).optional(),
});

export async function GET() {
  const auth = await requireUserId();
  if ("response" in auth) return auth.response;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      learningGoal: true,
      skillLevel: true,
      weeklyHours: true,
      loginCount: true,
      lastSignIn: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ profile: user });
}

export async function PUT(request: Request) {
  const auth = await requireUserId();
  if ("response" in auth) return auth.response;

  const parsed = ProfileUpdateSchema.safeParse(
    await request.json().catch(() => null)
  );

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: auth.userId },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      learningGoal: true,
      skillLevel: true,
      weeklyHours: true,
    },
  });

  return NextResponse.json({ profile: updated });
}
