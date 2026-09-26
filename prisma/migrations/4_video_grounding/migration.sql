-- Grounding: what the model found when it watched a video.
-- Keyed by video, so lessons sliced from one long lecture share a single pass.
CREATE TABLE "video_grounding" (
    "videoId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "keyConcepts" JSONB NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_grounding_pkey" PRIMARY KEY ("videoId")
);
