/*
  Warnings:

  - You are about to drop the column `instructorId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionHistoryItemId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_studentId_fkey";

-- DropIndex
DROP INDEX "Review_instructorId_idx";

-- DropIndex
DROP INDEX "Review_studentId_idx";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "instructorId",
DROP COLUMN "studentId",
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "recipientId" TEXT NOT NULL,
ADD COLUMN     "sessionHistoryItemId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Review_sessionHistoryItemId_key" ON "Review"("sessionHistoryItemId");

-- CreateIndex
CREATE INDEX "Review_ownerId_idx" ON "Review"("ownerId");

-- CreateIndex
CREATE INDEX "Review_recipientId_idx" ON "Review"("recipientId");

-- CreateIndex
CREATE INDEX "Review_sessionHistoryItemId_idx" ON "Review"("sessionHistoryItemId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_sessionHistoryItemId_fkey" FOREIGN KEY ("sessionHistoryItemId") REFERENCES "SessionHistoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
