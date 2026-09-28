-- Daily ceiling for lesson-grounding video passes, which cost real money and
-- are triggered by opening a lesson.
CREATE TABLE "grounding_usage" (
    "day" TEXT NOT NULL,
    "passes" INTEGER NOT NULL DEFAULT 0,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grounding_usage_pkey" PRIMARY KEY ("day")
);
