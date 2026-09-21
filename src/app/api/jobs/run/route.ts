import { NextResponse, after } from "next/server";
import { timingSafeEqual } from "crypto";
import { z } from "zod";
import { runNextStep } from "@/lib/generation/jobs";
import { kickWorker } from "@/lib/generation/kick";

// One step (a syllabus or a module) can take a couple of minutes with model
// thinking plus YouTube calls; the whole build would not fit one invocation.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const BodySchema = z.object({ jobId: z.string().min(1).max(64) });

function authorised(header: string | null): boolean {
  const secret = process.env.JOB_RUNNER_SECRET;
  if (!secret || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Internal: advances a generation job by one step.
 *
 * Accepts immediately and works inside after(), so the caller is never held
 * for the length of a step and the response always completes normally —
 * after() hooks are dropped when a response is cut off, which is how the
 * previous version lost every step-to-step handoff.
 */
export async function POST(request: Request) {
  // 404, not 401: do not advertise that an internal endpoint exists.
  if (!authorised(request.headers.get("x-job-secret"))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { jobId } = parsed.data;
  after(async () => {
    const more = await runNextStep(jobId);
    if (more) await kickWorker(jobId);
  });

  return NextResponse.json({ accepted: true }, { status: 202 });
}
