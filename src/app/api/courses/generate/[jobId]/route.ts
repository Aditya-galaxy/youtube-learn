import { NextResponse, after } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStalled } from "@/lib/generation/jobs";
import { kickWorker } from "@/lib/generation/kick";

export const dynamic = "force-dynamic";

interface PayloadShape {
  syllabus?: { title?: string; modules?: Array<{ title: string }> };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;
  const job = await prisma.courseGenerationJob.findUnique({
    where: { id: jobId },
  });
  // 404 rather than 403 for someone else's job: do not confirm it exists.
  if (!job || job.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Safety net for a lost kick or a worker that died mid-step.
  if (isStalled(job)) after(() => kickWorker(job.id));

  const syllabus = (job.payload as PayloadShape | null)?.syllabus;
  const course =
    job.status === "COMPLETED" && job.courseId
      ? await prisma.course.findUnique({
          where: { id: job.courseId },
          select: { slug: true },
        })
      : null;

  return NextResponse.json(
    {
      status: job.status,
      topic: job.topic,
      step: job.step,
      totalSteps: job.totalSteps,
      progressPct: job.progressPct,
      stageLabel: job.stageLabel,
      courseTitle: syllabus?.title ?? null,
      moduleTitles: syllabus?.modules?.map((m) => m.title) ?? [],
      warnings: job.warnings,
      error: job.error,
      courseSlug: course?.slug ?? null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
