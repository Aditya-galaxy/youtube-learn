import { prisma } from "@/lib/prisma";

/**
 * Project-wide YouTube Data API budget.
 *
 * The per-user hourly budget in rateLimit.ts stops one person hammering the
 * app; it cannot stop the SUM of users exhausting the project's single daily
 * YouTube quota (10,000 units by default). A generated course costs roughly
 * 500-1,300 units, so a handful of builds could otherwise leave the video feed
 * returning errors for everyone until midnight Pacific.
 *
 * Policy: course generation may only START while the day has room for a whole
 * build below GENERATION_CEILING, reserving the remainder for the feed and
 * playlist imports, which are cheap and are what most visitors see.
 */

export const DAILY_QUOTA = Number(process.env.YOUTUBE_DAILY_QUOTA) || 10_000;
/** Generation stops being accepted past this share of the day. */
export const GENERATION_CEILING = Math.floor(DAILY_QUOTA * 0.8);
/** Pessimistic cost of one build, used to decide whether one can start. */
export const ESTIMATED_GENERATION_UNITS = 1_500;
/** Everything stops a little short of the real limit. */
export const HARD_CEILING = DAILY_QUOTA - 100;

export class YouTubeQuotaExhaustedError extends Error {
  constructor() {
    super(
      "Today's YouTube search budget is used up. It resets at midnight Pacific time."
    );
    this.name = "YouTubeQuotaExhaustedError";
  }
}

/** The quota day: YouTube resets at midnight America/Los_Angeles, not UTC. */
export function quotaDay(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export async function unitsUsedToday(): Promise<number> {
  try {
    const row = await prisma.youtubeQuotaUsage.findUnique({
      where: { day: quotaDay() },
      select: { unitsUsed: true },
    });
    return row?.unitsUsed ?? 0;
  } catch (error) {
    // Fail open on a read error: the counter is a guard, and a database hiccup
    // should not take down search. YouTube's own 403 remains the backstop.
    console.error("[quota] read failed:", error);
    return 0;
  }
}

/**
 * Adds units atomically. INSERT ... ON CONFLICT takes a row lock, so parallel
 * requests serialise — the same pattern as chargeTokens.
 */
export async function recordYouTubeUnits(units: number): Promise<void> {
  if (units <= 0) return;
  const day = quotaDay();
  try {
    await prisma.$executeRaw`
      INSERT INTO youtube_quota_usage ("day", "unitsUsed", "updatedAt")
      VALUES (${day}, ${units}, now())
      ON CONFLICT ("day") DO UPDATE SET
        "unitsUsed" = youtube_quota_usage."unitsUsed" + ${units},
        "updatedAt" = now()
    `;
  } catch (error) {
    // Never fail the user's request over bookkeeping.
    console.error("[quota] record failed:", error);
  }
}

/**
 * YouTube itself said the quota is gone. Pin the counter at the limit so every
 * caller stops sending requests that can only fail until the day rolls over.
 */
export async function markQuotaExhausted(): Promise<void> {
  const day = quotaDay();
  try {
    await prisma.$executeRaw`
      INSERT INTO youtube_quota_usage ("day", "unitsUsed", "updatedAt")
      VALUES (${day}, ${DAILY_QUOTA}, now())
      ON CONFLICT ("day") DO UPDATE SET
        "unitsUsed" = GREATEST(youtube_quota_usage."unitsUsed", ${DAILY_QUOTA}),
        "updatedAt" = now()
    `;
  } catch (error) {
    console.error("[quota] mark exhausted failed:", error);
  }
}

export async function canStartGeneration(): Promise<boolean> {
  return (
    (await unitsUsedToday()) + ESTIMATED_GENERATION_UNITS <= GENERATION_CEILING
  );
}

export async function hasSearchQuota(): Promise<boolean> {
  return (await unitsUsedToday()) < HARD_CEILING;
}

/** True for the Data API's 403 quotaExceeded / dailyLimitExceeded responses. */
export function isQuotaError(error: unknown): boolean {
  const e = error as {
    code?: number;
    message?: string;
    errors?: Array<{ reason?: string }>;
  };
  if (e?.code !== 403) return false;
  const reasons = (e.errors ?? []).map((r) => r.reason ?? "");
  return (
    reasons.some((r) => /quotaExceeded|dailyLimitExceeded/i.test(r)) ||
    /quota/i.test(e.message ?? "")
  );
}
