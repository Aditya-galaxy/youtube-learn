import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Per-query logging is opt-in: at a poll every 2.5s it buried every
    // useful log line during a live generation run.
    log:
      process.env.PRISMA_LOG_QUERIES === "1"
        ? ["query", "error", "warn"]
        : ["error", "warn"],
  });

// Cached in every environment. On serverless platforms each warm lambda would
// otherwise open a fresh pool on module re-evaluation and exhaust Postgres
// connections; this is not a dev-only concern.
globalForPrisma.prisma = prisma;
