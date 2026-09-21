-- DropIndex
DROP INDEX "lesson_notes_userId_lessonId_idx";

-- AlterTable
ALTER TABLE "course_enrollments" ADD COLUMN     "lastLessonId" TEXT;

-- CreateTable
CREATE TABLE "youtube_quota_usage" (
    "day" TEXT NOT NULL,
    "unitsUsed" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "youtube_quota_usage_pkey" PRIMARY KEY ("day")
);

-- CreateIndex
CREATE UNIQUE INDEX "lesson_notes_userId_lessonId_key" ON "lesson_notes"("userId", "lessonId");

