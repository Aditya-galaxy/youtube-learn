import { prisma } from "@/lib/prisma";
import { quotaDay } from "@/lib/youtube/quota";

/**
 * Spending limits on grounding passes.
 *
 * Grounding is triggered by opening a lesson, and a pass costs roughly $0.13
 * for a two-hour lecture. Nothing bounded that: the hourly budget allows 100
 * tutor calls an hour, so a single account clicking through the catalogue
 * could have started 100 passes an hour — $13 to $25 — and a scripted one
 * could have done it all day.
 *
 * Two limits, for two different failure modes. The daily ceiling caps what the
 * project can spend however many people are asking. The per-user charge, taken
 * from the same hourly budget as everything else, stops one account consuming
 * that ceiling on its own.
 */

/** Passes allowed across the whole project per day. */
export const DAILY_PASS_LIMIT =
  Number(process.env.GROUNDING_DAILY_PASSES) || 60;

/**
 * Charged against the user's hourly budget when a pass is actually needed, so
 * one account can start four an hour rather than a hundred. Reading grounding
 * that already exists costs nothing.
 */
export const GROUNDING_PASS_COST = 2_500;

export async function passesUsedToday(): Promise<number> {
  try {
    const row = await prisma.groundingUsage.findUnique({
      where: { day: quotaDay() },
      select: { passes: true },
    });
    return row?.passes ?? 0;
  } catch (error) {
    // Fail closed: if the ledger cannot be read, do not start a paid pass.
    console.error("[grounding] could not read the budget:", error);
    return DAILY_PASS_LIMIT;
  }
}

export async function canBuildGrounding(): Promise<boolean> {
  return (await passesUsedToday()) < DAILY_PASS_LIMIT;
}

/**
 * Counts a pass against the day.
 *
 * Called before the model request, because a failed pass is billed the same as
 * a successful one; `recordGroundingTokens` fills in the size afterwards.
 */
export async function recordGroundingAttempt(): Promise<void> {
  try {
    await prisma.$executeRaw`
      INSERT INTO grounding_usage ("day", "passes", "promptTokens", "updatedAt")
      VALUES (${quotaDay()}, 1, 0, now())
      ON CONFLICT ("day") DO UPDATE SET
        "passes" = grounding_usage."passes" + 1,
        "updatedAt" = now()
    `;
  } catch (error) {
    console.error("[grounding] could not record the attempt:", error);
  }
}

export async function recordGroundingTokens(tokens: number): Promise<void> {
  if (tokens <= 0) return;
  try {
    await prisma.$executeRaw`
      INSERT INTO grounding_usage ("day", "passes", "promptTokens", "updatedAt")
      VALUES (${quotaDay()}, 0, ${tokens}, now())
      ON CONFLICT ("day") DO UPDATE SET
        "promptTokens" = grounding_usage."promptTokens" + ${tokens},
        "updatedAt" = now()
    `;
  } catch (error) {
    // Never fail a learner's request over bookkeeping.
    console.error("[grounding] could not record tokens:", error);
  }
}
