/**
 * Schedules the next step of a job in a fresh invocation.
 *
 * The worker route answers 202 immediately and does its step inside after(),
 * so awaiting this fetch costs milliseconds, not the length of a step. An
 * earlier version aborted the fetch after 2s instead — which cancelled the
 * worker's response and silently dropped the after() hook meant to schedule
 * the NEXT step, leaving every step to be rescued by the poll route's 15s
 * stall detector. If a kick is lost anyway, that stall detector still applies.
 */
export async function kickWorker(jobId: string): Promise<void> {
  const secret = process.env.JOB_RUNNER_SECRET;
  const origin =
    process.env.APP_URL ??
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  if (!secret || !origin) {
    console.error(
      "[jobs] cannot kick worker: JOB_RUNNER_SECRET or APP_URL/NEXTAUTH_URL missing"
    );
    return;
  }

  try {
    const res = await fetch(`${origin}/api/jobs/run`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-job-secret": secret },
      body: JSON.stringify({ jobId }),
      // Generous: the route only has to accept, but a cold start can be slow.
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok)
      console.error(`[jobs] kick for ${jobId} returned ${res.status}`);
  } catch (error) {
    console.error(`[jobs] kick for ${jobId} failed:`, error);
  }
}
