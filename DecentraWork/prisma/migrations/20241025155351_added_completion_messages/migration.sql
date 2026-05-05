/*
  Warnings:

  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_revieweeId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_reviewerId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "assignedCompletetionMessage" TEXT DEFAULT '',
ADD COLUMN     "clientCompletionMessage" TEXT DEFAULT '';

-- DropTable
DROP TABLE "Review";
