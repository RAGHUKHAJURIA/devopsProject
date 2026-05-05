/*
  Warnings:

  - You are about to drop the column `walletAddress` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[walletAddressSOL]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[walletAddressETH]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_walletAddress_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "walletAddress",
ADD COLUMN     "walletAddressETH" TEXT[],
ADD COLUMN     "walletAddressSOL" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddressSOL_key" ON "User"("walletAddressSOL");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddressETH_key" ON "User"("walletAddressETH");
