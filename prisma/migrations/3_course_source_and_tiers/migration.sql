-- Course source attribution (open courseware) and the BASIC/EXPERT tiers.
-- These columns and enum values were added to schema.prisma without a
-- migration, which made every write to "courses" fail against a real database.

ALTER TYPE "SkillLevel" ADD VALUE IF NOT EXISTS 'BASIC' BEFORE 'BEGINNER';
ALTER TYPE "SkillLevel" ADD VALUE IF NOT EXISTS 'EXPERT' AFTER 'ADVANCED';

ALTER TABLE "courses" ADD COLUMN "institution" TEXT;
ALTER TABLE "courses" ADD COLUMN "sourceUrl" TEXT;
ALTER TABLE "courses" ADD COLUMN "tier" TEXT;
