import type { CourseGenerationJob, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { GenerationError } from "@/lib/ai/client";
import type { SkillLevel, Syllabus } from "@/lib/ai/schemas";
import { chargeTokens, GENERATION_COST } from "@/lib/rateLimit";
import { createYouTubeClient } from "@/lib/youtube/searchVideos";
import { YouTubeQuotaExhaustedError } from "@/lib/youtube/quota";
import { generateSyllabus } from "./syllabus";
import { buildModule } from "./module";
import {
  normalizeTopic,
  persistGeneratedCourse,
  type PersistableModule,
} from "./persist";

/**
 * A step is the syllabus, one module, or the final save — each well inside a
 * serverless time limit. A lock older than this belongs to a worker that died.
 */
const LOCK_TTL_MS = 6 * 60 * 1000;
const MAX_ATTEMPTS = 3;
/** Below this share of planned lessons filled, fail honestly instead of shipping a hollow course. */
const MIN_COVERAGE = 0.6;

interface JobPayload {
  syllabus?: Syllabus;
  modules: PersistableModule[];
  usedVideoIds: string[];
}

interface JobUsage {
  inputTokens: number;
  outputTokens: number;
  thoughtTokens: number;
  youtubeUnits: number;
}

const EMPTY_USAGE: JobUsage = {
  inputTokens: 0,
  outputTokens: 0,
  thoughtTokens: 0,
  youtubeUnits: 0,
};

const asPayload = (job: CourseGenerationJob): JobPayload =>
  (job.payload as unknown as JobPayload) ?? { modules: [], usedVideoIds: [] };
const asUsage = (job: CourseGenerationJob): JobUsage =>
  (job.usage as unknown as JobUsage) ?? EMPTY_USAGE;
const json = (v: unknown) => v as Prisma.InputJsonValue;

export async function enqueueGeneration(input: {
  userId: string;
  topic: string;
  difficulty: SkillLevel;
  weeklyHours?: number;
}): Promise<CourseGenerationJob> {
  return prisma.courseGenerationJob.create({
    data: {
      userId: input.userId,
      topic: input.topic,
      topicNormalized: normalizeTopic(input.topic),
      difficulty: input.difficulty,
      weeklyHours: input.weeklyHours ?? null,
      stageLabel: "Designing your curriculum",
      payload: json({ modules: [], usedVideoIds: [] }),
      usage: json(EMPTY_USAGE),
    },
  });
}

/**
 * Takes the job for one step, or returns null if someone else holds it. The
 * database arbitrates, the same instinct as chargeTokens' ON CONFLICT: two
 * workers kicked for the same job cannot both run a step.
 */
async function claim(jobId: string): Promise<CourseGenerationJob | null> {
  const staleBefore = new Date(Date.now() - LOCK_TTL_MS);
  const { count } = await prisma.courseGenerationJob.updateMany({
    where: {
      id: jobId,
      status: { in: ["QUEUED", "RUNNING"] },
      OR: [{ lockedAt: null }, { lockedAt: { lt: staleBefore } }],
    },
    data: {
      lockedAt: new Date(),
      status: "RUNNING",
      attempts: { increment: 1 },
    },
  });
  if (count === 0) return null;
  return prisma.courseGenerationJob.findUnique({ where: { id: jobId } });
}

async function fail(
  job: CourseGenerationJob,
  message: string,
  options: { refund?: boolean } = {}
) {
  await prisma.courseGenerationJob.update({
    where: { id: job.id },
    data: {
      status: "FAILED",
      error: message,
      lockedAt: null,
      stageLabel: null,
    },
  });
  // Refund when nothing expensive happened yet (a failed syllabus call spent
  // a few cents), or when the failure was not the user's doing.
  if (job.step === 0 || options.refund) {
    await chargeTokens(job.userId, -GENERATION_COST);
  }
}

/**
 * Runs exactly one step of a job. Returns true while more steps remain, so the
 * caller knows whether to schedule another invocation.
 */
export async function runNextStep(jobId: string): Promise<boolean> {
  const job = await claim(jobId);
  if (!job) return false;

  const payload = asPayload(job);
  const usage = asUsage(job);

  try {
    // Step 0: design the syllabus.
    if (job.step === 0) {
      const result = await generateSyllabus({
        topic: job.topic,
        skillLevel: job.difficulty,
        weeklyHours: job.weeklyHours ?? undefined,
      });
      const totalSteps = result.syllabus.modules.length + 2;
      await prisma.courseGenerationJob.update({
        where: { id: job.id },
        data: {
          step: 1,
          totalSteps,
          progressPct: Math.round((1 / totalSteps) * 100),
          stageLabel: `Finding videos for "${result.syllabus.modules[0].title}"`,
          payload: json({ ...payload, syllabus: result.syllabus }),
          usage: json({
            ...usage,
            inputTokens: usage.inputTokens + result.usage.inputTokens,
            outputTokens: usage.outputTokens + result.usage.outputTokens,
            thoughtTokens: usage.thoughtTokens + result.usage.thoughtTokens,
          }),
          lockedAt: null,
          attempts: 0,
        },
      });
      return true;
    }

    const syllabus = payload.syllabus;
    if (!syllabus) throw new GenerationError("Job has no syllabus.", "state");
    const moduleCount = syllabus.modules.length;

    // Steps 1..n: build one module each.
    if (job.step <= moduleCount) {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey)
        throw new GenerationError(
          "YOUTUBE_API_KEY is not configured on the server",
          "config"
        );
      const mod = syllabus.modules[job.step - 1];
      const built = await buildModule(
        createYouTubeClient(apiKey),
        mod,
        payload.usedVideoIds
      );

      const warnings = built.gaps.map((g) => {
        const title = mod.lessonIntents.find((l) => l.key === g)?.title ?? g;
        return `No strong video found for "${title}" in ${mod.title}.`;
      });
      const nextStep = job.step + 1;
      const next = syllabus.modules[nextStep - 1];
      await prisma.courseGenerationJob.update({
        where: { id: job.id },
        data: {
          step: nextStep,
          progressPct: Math.round((nextStep / job.totalSteps) * 100),
          stageLabel: next
            ? `Finding videos for "${next.title}"`
            : "Saving your course",
          warnings: { push: warnings },
          payload: json({
            ...payload,
            modules: [
              ...payload.modules,
              {
                key: built.key,
                title: built.title,
                lessons: built.lessons,
                gaps: built.gaps,
              },
            ],
            usedVideoIds: [
              ...payload.usedVideoIds,
              ...built.lessons.map((l) => l.videoId),
            ],
          }),
          usage: json({
            inputTokens: usage.inputTokens + built.usage.inputTokens,
            outputTokens: usage.outputTokens + built.usage.outputTokens,
            thoughtTokens: usage.thoughtTokens + built.usage.thoughtTokens,
            youtubeUnits: usage.youtubeUnits + built.unitsSpent,
          }),
          lockedAt: null,
          attempts: 0,
        },
      });
      return true;
    }

    // Final step: check coverage and save.
    const planned = syllabus.modules.reduce(
      (n, m) => n + m.lessonIntents.length,
      0
    );
    const filled = payload.modules.reduce((n, m) => n + m.lessons.length, 0);
    if (planned === 0 || filled / planned < MIN_COVERAGE) {
      await fail(
        job,
        `Only ${filled} of ${planned} lessons had a good video, so no course was saved. Try a broader or more common topic.`
      );
      return false;
    }

    const course = await persistGeneratedCourse({
      syllabus,
      modules: payload.modules,
      topic: job.topic,
      creatorId: job.userId,
    });
    await prisma.courseGenerationJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        courseId: course.id,
        progressPct: 100,
        stageLabel: null,
        lockedAt: null,
      },
    });
    return false;
  } catch (error) {
    // The project's daily YouTube quota ran out mid-build. Nothing retries
    // until the day rolls over, so fail now, clearly, and refund the user.
    if (error instanceof YouTubeQuotaExhaustedError) {
      await fail(job, error.message, { refund: true });
      return false;
    }
    if (error instanceof GenerationError) {
      // Transient upstream trouble: hold the step and let a later kick run it
      // again. Failing the whole build on the first rate limit threw away the
      // work already done and told the user to start over.
      if (error.retryable && job.attempts < MAX_ATTEMPTS) {
        console.warn(
          `[jobs] ${job.id} step ${job.step} hit a transient error (${error.stage}), attempt ${job.attempts}/${MAX_ATTEMPTS}: ${error.message}`
        );
        await prisma.courseGenerationJob.update({
          where: { id: job.id },
          data: { lockedAt: null },
        });
        return true;
      }
      console.error(
        `[jobs] ${job.id} failed at step ${job.step} (${error.stage}):`,
        error.message,
        error.violations
      );
      await fail(job, error.message);
      return false;
    }
    console.error(`[jobs] step ${job.step} of ${job.id} failed:`, error);
    if (job.attempts >= MAX_ATTEMPTS) {
      await fail(job, "Course generation failed. Please try again.");
      return false;
    }
    // Release so a later kick retries this step.
    await prisma.courseGenerationJob.update({
      where: { id: job.id },
      data: { lockedAt: null },
    });
    return true;
  }
}

/** True when nothing is holding the job and it has gone quiet — worth re-kicking. */
export function isStalled(job: CourseGenerationJob): boolean {
  if (job.status !== "QUEUED" && job.status !== "RUNNING") return false;
  const quietMs = Date.now() - job.updatedAt.getTime();
  if (job.lockedAt) return Date.now() - job.lockedAt.getTime() > LOCK_TTL_MS;
  return quietMs > 15_000;
}
