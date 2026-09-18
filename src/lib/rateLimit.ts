import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

// Our own per-user budget units, not YouTube's. A search.list + videos.list
// pair costs ~101 real YouTube units; a feed request charges 50 of these.
export const HOURLY_TOKEN_LIMIT = 10_000;
export const FEED_REQUEST_COST = 50;
/** A playlist import spends 3 YouTube calls and can return 100s of videos. */
export const PLAYLIST_IMPORT_COST = 150;

export type ChargeResult =
  { tokensRemaining: number } | { error: string; status: 429 | 500 };

/**
 * Charges the caller's hourly budget atomically.
 *
 * The window is an *epoch* hour (hours since 1970) rather than a wall-clock
 * hour-of-day: storing `getHours()` meant a user returning exactly 24h later
 * saw `lastResetHour === hour` and kept their stale balance. Epoch hours keep
 * the column an Int, so no migration is needed, and old 0-23 values simply
 * read as "long expired".
 *
 * `ON CONFLICT DO UPDATE` takes a row lock, so concurrent charges serialise —
 * a read-then-write in an interactive transaction was racy under READ
 * COMMITTED, with parallel requests both reading the old total.
 */
export async function chargeTokens(
  userId: string,
  cost: number = FEED_REQUEST_COST
): Promise<ChargeResult> {
  const window = Math.floor(Date.now() / 3_600_000);

  try {
    const rows = await prisma.$queryRaw<Array<{ tokensUsed: number }>>`
      INSERT INTO user_tokens ("id", "userId", "tokensUsed", "lastResetHour")
      VALUES (${randomUUID()}, ${userId}, ${cost}, ${window})
      ON CONFLICT ("userId") DO UPDATE SET
        "tokensUsed" = CASE
          WHEN user_tokens."lastResetHour" = ${window}
            THEN user_tokens."tokensUsed" + ${cost}
          ELSE ${cost}
        END,
        "lastResetHour" = ${window}
      RETURNING "tokensUsed"
    `;

    // Clamp: a compensating negative charge must never leave a negative total
    // that would hand the user free budget later in the window.
    const tokensUsed = Math.max(0, rows[0]?.tokensUsed ?? cost);
    if (tokensUsed > HOURLY_TOKEN_LIMIT) {
      return {
        error: "Hourly request limit reached. Please try again later.",
        status: 429,
      };
    }
    return { tokensRemaining: HOURLY_TOKEN_LIMIT - tokensUsed };
  } catch (error) {
    console.error("Token usage error:", error);
    return { error: "Failed to process token usage", status: 500 };
  }
}
