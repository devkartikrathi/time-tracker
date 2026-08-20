/*
  Warnings:

  - You are about to drop the column `categoryId` on the `goals` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `subcategories` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `goals` table without a default value. This is not possible if the table is not empty.
  - Made the column `subcategoryId` on table `goals` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `category` to the `subcategories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `subcategories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CategoryType" AS ENUM ('REST', 'WORK', 'OTHER');

-- DropForeignKey
ALTER TABLE "public"."categories" DROP CONSTRAINT "categories_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."goals" DROP CONSTRAINT "goals_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."goals" DROP CONSTRAINT "goals_subcategoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."subcategories" DROP CONSTRAINT "subcategories_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tasks" DROP CONSTRAINT "tasks_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tasks" DROP CONSTRAINT "tasks_subcategoryId_fkey";

-- AlterTable
ALTER TABLE "public"."goals" DROP COLUMN "categoryId",
ADD COLUMN     "category" "public"."CategoryType" NOT NULL,
ALTER COLUMN "subcategoryId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."subcategories" DROP COLUMN "categoryId",
ADD COLUMN     "category" "public"."CategoryType" NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."tasks" DROP COLUMN "categoryId",
ADD COLUMN     "category" "public"."CategoryType" NOT NULL,
ALTER COLUMN "subcategoryId" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."categories";

-- CreateTable
CREATE TABLE "public"."daily_tasks" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wellBeingTags" TEXT[],
    "hours" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_tasks_date_key" ON "public"."daily_tasks"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_tasks_userId_date_key" ON "public"."daily_tasks"("userId", "date");

-- AddForeignKey
ALTER TABLE "public"."subcategories" ADD CONSTRAINT "subcategories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_tasks" ADD CONSTRAINT "daily_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "public"."subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."goals" ADD CONSTRAINT "goals_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "public"."subcategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
