import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
const upsert = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    reviewSchedule: {
      findUnique: (...args: unknown[]) => findUnique(...args),
      upsert: (...args: unknown[]) => upsert(...args),
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

const { recordReview } = await import("./reviews");

const DAY = 86_400_000;

/** Returns what the server decided to store, which is the logic under test. */
function stored() {
  return upsert.mock.calls.at(-1)?.[0].create as {
    repetitionLevel: number;
    dueAt: Date;
    lapseCount: number;
  };
}

beforeEach(() => {
  findUnique.mockReset();
  upsert.mockReset();
  upsert.mockImplementation(async ({ create }) => ({
    cardId: create.cardId,
    repetitionLevel: create.repetitionLevel,
    reviewCount: 1,
    lapseCount: create.lapseCount,
    lastReviewedAt: create.lastReviewedAt,
    dueAt: create.dueAt,
  }));
});

describe("recordReview", () => {
  it("moves a new card to the first box, due tomorrow", async () => {
    findUnique.mockResolvedValue(null);
    await recordReview("u1", { cardId: "c1", correct: true });

    const row = stored();
    expect(row.repetitionLevel).toBe(1);
    expect(Math.round((row.dueAt.getTime() - Date.now()) / DAY)).toBe(3);
  });

  it("climbs the ladder on repeated success", async () => {
    findUnique.mockResolvedValue({ repetitionLevel: 2, lapseCount: 0 });
    await recordReview("u1", { cardId: "c1", correct: true });

    const row = stored();
    expect(row.repetitionLevel).toBe(3);
    expect(Math.round((row.dueAt.getTime() - Date.now()) / DAY)).toBe(14);
  });

  it("stops climbing at the longest interval", async () => {
    findUnique.mockResolvedValue({ repetitionLevel: 4, lapseCount: 0 });
    await recordReview("u1", { cardId: "c1", correct: true });

    const row = stored();
    expect(row.repetitionLevel).toBe(4);
    expect(Math.round((row.dueAt.getTime() - Date.now()) / DAY)).toBe(30);
  });

  it("sends a failed card back to tomorrow however well it was doing", async () => {
    findUnique.mockResolvedValue({ repetitionLevel: 4, lapseCount: 1 });
    await recordReview("u1", { cardId: "c1", correct: false });

    const row = stored();
    expect(row.repetitionLevel).toBe(0);
    expect(Math.round((row.dueAt.getTime() - Date.now()) / DAY)).toBe(1);
  });

  it("never takes a due date from the caller", async () => {
    findUnique.mockResolvedValue(null);
    await recordReview("u1", {
      cardId: "c1",
      correct: true,
      // @ts-expect-error — a client trying to retire a card it keeps failing.
      nextDueTime: Date.now() + 365 * DAY,
    });

    const row = stored();
    expect(Math.round((row.dueAt.getTime() - Date.now()) / DAY)).toBe(3);
  });
});
