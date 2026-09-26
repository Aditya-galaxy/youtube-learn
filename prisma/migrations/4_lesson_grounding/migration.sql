-- Grounding: what the model found when it watched a lesson's video.
CREATE TABLE "lesson_grounding" (
    "lessonId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "keyConcepts" JSONB NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_grounding_pkey" PRIMARY KEY ("lessonId")
);

ALTER TABLE "lesson_grounding" ADD CONSTRAINT "lesson_grounding_lessonId_fkey"
    FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
