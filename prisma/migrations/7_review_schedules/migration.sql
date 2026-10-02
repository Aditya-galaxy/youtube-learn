-- Spaced-retrieval schedules, moved from the browser onto the account so a
-- cleared browser no longer wipes a learner's review history.
CREATE TABLE "review_schedules" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "lessonId" TEXT,
    "repetitionLevel" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "lapseCount" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_schedules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "review_schedules_userId_cardId_key" ON "review_schedules"("userId", "cardId");
CREATE INDEX "review_schedules_userId_dueAt_idx" ON "review_schedules"("userId", "dueAt");

ALTER TABLE "review_schedules" ADD CONSTRAINT "review_schedules_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
