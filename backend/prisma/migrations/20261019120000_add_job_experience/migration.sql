-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('FRESHER', 'ONE_TO_TWO_YEARS', 'THREE_TO_FIVE_YEARS');

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN "experience" "ExperienceLevel" NOT NULL DEFAULT 'FRESHER';

-- CreateIndex
CREATE INDEX "jobs_experience_idx" ON "jobs"("experience");
