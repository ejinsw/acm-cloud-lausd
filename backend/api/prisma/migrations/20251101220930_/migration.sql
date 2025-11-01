-- AlterTable
ALTER TABLE "StudentQueue" ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "zoomMeetingId" TEXT,
ADD COLUMN     "zoomMeetingPassword" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "zoomAccessToken" TEXT,
ADD COLUMN     "zoomRefreshToken" TEXT,
ADD COLUMN     "zoomTokenExpiry" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "StudentQueue" ADD CONSTRAINT "StudentQueue_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
