-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "GoalPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- DropIndex
DROP INDEX "daily_tasks_date_key";

-- AlterTable
ALTER TABLE "daily_tasks" ADD COLUMN     "mood" INTEGER,
ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "period" "GoalPeriod" NOT NULL DEFAULT 'DAILY',
ALTER COLUMN "targetHours" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "subcategories" ADD COLUMN     "icon" TEXT,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastLoggedDate" TEXT,
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "onboardedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "reminderHour" INTEGER,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC',
ADD COLUMN     "weekStartsOn" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "achievements_userId_idx" ON "achievements"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_userId_key_key" ON "achievements"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "daily_tasks_userId_date_idx" ON "daily_tasks"("userId", "date");

-- CreateIndex
CREATE INDEX "goals_userId_isActive_idx" ON "goals"("userId", "isActive");

-- CreateIndex
CREATE INDEX "subcategories_userId_isArchived_idx" ON "subcategories"("userId", "isArchived");

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Backfill: users who completed the old onboarding (inferred from the three
-- profile fields being present) keep their completed status rather than being
-- sent through the flow a second time.
UPDATE "users"
SET "onboardingCompleted" = true,
    "onboardedAt" = "createdAt"
WHERE "occupation" IS NOT NULL
  AND "age" IS NOT NULL
  AND "focus" IS NOT NULL;

-- Backfill: seed streak bookkeeping from existing history so returning users
-- do not see a zeroed streak on first load.
UPDATE "users" u
SET "lastLoggedDate" = sub."maxdate"
FROM (SELECT "userId", MAX("date") AS "maxdate" FROM "daily_tasks" GROUP BY "userId") sub
WHERE u."id" = sub."userId";
