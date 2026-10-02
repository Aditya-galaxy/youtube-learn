import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    groundingUsage: {
      findUnique: (...args: unknown[]) => findUnique(...args),
    },
    $executeRaw: vi.fn(),
  },
}));

const { canBuildGrounding, passesUsedToday, DAILY_PASS_LIMIT } =
  await import("@/lib/tutor/groundingBudget");

// Block body on purpose: an arrow returning mockReset() hands vitest the mock
// itself, which it then treats as a teardown callback and calls after the
// test — invoking the throwing implementation outside any try/catch.
beforeEach(() => {
  findUnique.mockReset();
});

describe("the grounding budget", () => {
  it("allows a pass while the day has room", async () => {
    findUnique.mockResolvedValue({ passes: DAILY_PASS_LIMIT - 1 });
    expect(await canBuildGrounding()).toBe(true);
  });

  it("refuses once the daily ceiling is reached", async () => {
    findUnique.mockResolvedValue({ passes: DAILY_PASS_LIMIT });
    expect(await canBuildGrounding()).toBe(false);
  });

  it("treats a day with no row as unspent", async () => {
    findUnique.mockResolvedValue(null);
    expect(await passesUsedToday()).toBe(0);
  });

  // A database problem must stop paid work, not remove the brake.
  it("counts an unreadable ledger as fully spent", async () => {
    findUnique.mockImplementation(() => {
      throw new Error("database down");
    });
    expect(await passesUsedToday()).toBe(DAILY_PASS_LIMIT);
  });

  it("refuses a pass when the ledger cannot be read", async () => {
    findUnique.mockImplementation(() => {
      throw new Error("database down");
    });
    expect(await canBuildGrounding()).toBe(false);
  });
});
