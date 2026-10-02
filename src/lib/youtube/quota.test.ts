import { describe, expect, it } from "vitest";
import { isQuotaError, quotaDay } from "./quota";

describe("quotaDay", () => {
  it("uses the Pacific day, which is when YouTube resets the quota", () => {
    // 07:00 UTC on 1 March is still 23:00 on 28 February in California.
    expect(quotaDay(new Date("2026-03-01T07:00:00Z"))).toBe("2026-02-28");
    expect(quotaDay(new Date("2026-03-01T08:30:00Z"))).toBe("2026-03-01");
  });

  it("follows daylight saving rather than a fixed offset", () => {
    // In July the offset is -7, so 06:30 UTC is already the new day.
    expect(quotaDay(new Date("2026-07-15T06:30:00Z"))).toBe("2026-07-14");
    expect(quotaDay(new Date("2026-07-15T07:30:00Z"))).toBe("2026-07-15");
  });
});

describe("isQuotaError", () => {
  it("recognises the shapes the YouTube API uses for exhaustion", () => {
    expect(
      isQuotaError({ code: 403, errors: [{ reason: "quotaExceeded" }] })
    ).toBe(true);
    expect(
      isQuotaError({ code: 403, errors: [{ reason: "dailyLimitExceeded" }] })
    ).toBe(true);
  });

  it("does not mistake other failures for a quota problem", () => {
    expect(isQuotaError({ code: 403, errors: [{ reason: "forbidden" }] })).toBe(
      false
    );
    expect(isQuotaError({ code: 404 })).toBe(false);
    expect(isQuotaError(new Error("network down"))).toBe(false);
  });
});
