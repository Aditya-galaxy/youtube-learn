import { prisma } from "@/lib/prisma";
import { LEITNER_INTERVAL_DAYS } from "@/lib/spacedRepetition";
import type { ReviewScheduleRecord } from "@/lib/spacedRepetition";

/**
 * Server-side spaced-retrieval schedules.
 *
 * The Leitner box and the next due date are computed here, never accepted from
 * the client — the same rule as course progress. A browser can report whether
 * an answer was right; when the card comes back is the system's decision, and
 * a request claiming "due in 30 days" should not be able to retire a card the
 * learner keeps failing.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

type Row = {
  cardId: string;
  repetitionLevel: number;
  reviewCount: number;
  lapseCount: number;
  lastReviewedAt: Date | null;
  dueAt: Date;
};

function toRecord(row: Row): ReviewScheduleRecord {
  return {
    repetitionLevel: row.repetitionLevel,
    lastReviewedAt: row.lastReviewedAt?.getTime() ?? 0,
    nextDueTime: row.dueAt.getTime(),
    reviewCount: row.reviewCount,
    lapseCount: row.lapseCount,
  };
}

const SELECT = {
  cardId: true,
  repetitionLevel: true,
  reviewCount: true,
  lapseCount: true,
  lastReviewedAt: true,
  dueAt: true,
} as const;

export async function listSchedules(
  userId: string
): Promise<Record<string, ReviewScheduleRecord>> {
  const rows = await prisma.reviewSchedule.findMany({
    where: { userId },
    select: SELECT,
  });

  const out: Record<string, ReviewScheduleRecord> = {};
  for (const row of rows) out[row.cardId] = toRecord(row);
  return out;
}

/** Applies the Leitner step for one answer and returns the stored schedule. */
export async function recordReview(
  userId: string,
  input: { cardId: string; correct: boolean; lessonId?: string }
): Promise<ReviewScheduleRecord> {
  const existing = await prisma.reviewSchedule.findUnique({
    where: { userId_cardId: { userId, cardId: input.cardId } },
    select: SELECT,
  });

  // Right answers move up a box; a lapse goes back to the start, so a concept
  // the learner has just failed returns tomorrow rather than in a month.
  const level = input.correct
    ? Math.min(
        (existing?.repetitionLevel ?? 0) + 1,
        LEITNER_INTERVAL_DAYS.length - 1
      )
    : 0;
  const intervalDays = LEITNER_INTERVAL_DAYS[level] ?? 1;
  const now = new Date();
  const dueAt = new Date(now.getTime() + intervalDays * DAY_MS);

  const row = await prisma.reviewSchedule.upsert({
    where: { userId_cardId: { userId, cardId: input.cardId } },
    create: {
      userId,
      cardId: input.cardId,
      lessonId: input.lessonId ?? null,
      repetitionLevel: level,
      reviewCount: 1,
      lapseCount: input.correct ? 0 : 1,
      lastReviewedAt: now,
      dueAt,
    },
    update: {
      // Only overwrite when the caller supplied one.
      lessonId: input.lessonId ?? undefined,
      repetitionLevel: level,
      reviewCount: { increment: 1 },
      lapseCount: input.correct ? undefined : { increment: 1 },
      lastReviewedAt: now,
      dueAt,
    },
    select: SELECT,
  });

  return toRecord(row);
}

/**
 * One-shot import of schedules a guest built up in the browser.
 *
 * Existing rows win: a schedule already on the account reflects reviews the
 * server timed, and a stale browser copy should not push a card's due date
 * backwards.
 */
export async function importLocalSchedules(
  userId: string,
  schedules: Record<string, ReviewScheduleRecord>
): Promise<number> {
  const entries = Object.entries(schedules).slice(0, 500);
  if (entries.length === 0) return 0;

  const existing = await prisma.reviewSchedule.findMany({
    where: { userId, cardId: { in: entries.map(([cardId]) => cardId) } },
    select: { cardId: true },
  });
  const have = new Set(existing.map((row) => row.cardId));

  const fresh = entries.filter(([cardId]) => !have.has(cardId));
  if (fresh.length === 0) return 0;

  await prisma.reviewSchedule.createMany({
    data: fresh.map(([cardId, record]) => ({
      userId,
      cardId,
      repetitionLevel: Math.max(
        0,
        Math.min(record.repetitionLevel, LEITNER_INTERVAL_DAYS.length - 1)
      ),
      reviewCount: Math.max(0, Math.min(record.reviewCount, 10_000)),
      lapseCount: Math.max(0, Math.min(record.lapseCount, 10_000)),
      lastReviewedAt: record.lastReviewedAt
        ? new Date(record.lastReviewedAt)
        : null,
      dueAt: new Date(record.nextDueTime || Date.now()),
    })),
    skipDuplicates: true,
  });

  return fresh.length;
}
