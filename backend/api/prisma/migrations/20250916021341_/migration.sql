-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_recipientId_fkey";

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "recipientId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SessionHistoryItem" ADD COLUMN     "instructorId" TEXT;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
