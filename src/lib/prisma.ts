import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Cached in every environment. On serverless platforms each warm lambda would
// otherwise open a fresh pool on module re-evaluation and exhaust Postgres
// connections; this is not a dev-only concern.
globalForPrisma.prisma = prisma;
