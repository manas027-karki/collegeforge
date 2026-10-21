-- Problems now belong to the user who added them.
--
-- The column is added as nullable first so the table can be backfilled, then
-- made NOT NULL once every row has an owner. On a fresh database the table is
-- empty and the backfill is a no-op.

-- AlterTable
ALTER TABLE "dsa_problems" ADD COLUMN "user_id" UUID;

-- Backfill any existing rows to the earliest user, so the NOT NULL constraint
-- below can be applied.
UPDATE "dsa_problems"
SET "user_id" = (SELECT id FROM "users" ORDER BY "created_at" ASC LIMIT 1)
WHERE "user_id" IS NULL;

-- AlterTable
ALTER TABLE "dsa_problems" ALTER COLUMN "user_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "dsa_problems_user_id_idx" ON "dsa_problems"("user_id");

-- AddForeignKey
ALTER TABLE "dsa_problems" ADD CONSTRAINT "dsa_problems_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
