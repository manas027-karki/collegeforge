-- A user may have at most one current resume.
--
-- The rule is enforced here rather than only in the service, so two devices
-- promoting a resume at the same moment cannot both succeed: the second one
-- fails on the index instead of leaving two current resumes behind.

-- Archive any duplicates first, keeping the highest version as the current
-- one. A database that already has two current resumes for a user would
-- otherwise make the index creation fail.
UPDATE "resumes"
SET "status" = 'ARCHIVED'
WHERE "status" = 'CURRENT'
  AND id NOT IN (
    SELECT DISTINCT ON ("user_id") id
    FROM "resumes"
    WHERE "status" = 'CURRENT'
    ORDER BY "user_id", "version" DESC
  );

-- CreateIndex
CREATE UNIQUE INDEX "resumes_one_current_per_user_idx" ON "resumes"("user_id") WHERE "status" = 'CURRENT';
