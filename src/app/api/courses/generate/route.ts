import { NextResponse, after } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chargeTokens, GENERATION_COST } from "@/lib/rateLimit";
import { enqueueGeneration } from "@/lib/generation/jobs";
import { kickWorker } from "@/lib/generation/kick";
import { normalizeTopic } from "@/lib/generation/persist";
import { canStartGeneration } from "@/lib/youtube/quota";

const REUSE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

// The topic is the first user text to reach a model. Keep it a short phrase,
// not a URL or a paragraph of instructions.
const BodySchema = z.object({
  topic: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .refine((t) => !/https?:\/\/|www\./i.test(t), "Enter a topic, not a URL")
    .refine((t) => !/\p{Cc}/u.test(t), "Invalid characters"),
  difficulty: z
    .enum(["BASIC", "BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"])
    .default("BEGINNER"),
  prioritizeAcademic: z.boolean().optional(),
  weeklyHours: z.number().int().min(1).max(40).optional(),
  /** Build a new course even if a recent one exists for this topic. */
  force: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json(
      { error: "Sign in to build a course" },
      { status: 401 }
    );
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }
  const { topic, difficulty, weeklyHours, force } = parsed.data;
  const topicNormalized = normalizeTopic(topic);

  // One build at a time per user: hand back the one already running.
  const inFlight = await prisma.courseGenerationJob.findFirst({
    where: { userId, status: { in: ["QUEUED", "RUNNING"] } },
    select: { id: true },
  });
  if (inFlight) {
    return NextResponse.json(
      { jobId: inFlight.id, reused: true },
      { status: 202 }
    );
  }

  // The biggest cost and quota saver: someone already built this path.
  if (!force) {
    const existing = await prisma.course.findFirst({
      where: {
        topicNormalized,
        difficulty,
        isPublic: true,
        createdAt: { gte: new Date(Date.now() - REUSE_WINDOW_MS) },
      },
      orderBy: { createdAt: "desc" },
      select: { slug: true, title: true },
    });
    if (existing) {
      return NextResponse.json({ existingCourse: existing }, { status: 200 });
    }
  }

  // Checked after reuse (which costs no quota) and before charging the user.
  if (!(await canStartGeneration())) {
    return NextResponse.json(
      {
        error:
          "Course building is paused for today to keep video search working for everyone. It resumes after midnight Pacific time.",
      },
      { status: 503 }
    );
  }

  const charge = await chargeTokens(userId, GENERATION_COST);
  if ("error" in charge) {
    return NextResponse.json(
      { error: charge.error },
      { status: charge.status }
    );
  }

  const job = await enqueueGeneration({
    userId,
    topic,
    difficulty,
    weeklyHours,
  });
  after(() => kickWorker(job.id));

  return NextResponse.json({ jobId: job.id }, { status: 202 });
}
