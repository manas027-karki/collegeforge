-- Add the contract job type.
--
-- The job board has always offered three types, and the Prisma enum only had
-- two. The third was missing from the database rather than deliberately
-- excluded, so it is added here to match the UI.
ALTER TYPE "JobType" ADD VALUE 'CONTRACT';
