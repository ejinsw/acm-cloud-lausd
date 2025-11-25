-- AlterTable
ALTER TABLE "User" ADD COLUMN     "zoomAccessToken" TEXT,
ADD COLUMN     "zoomRefreshToken" TEXT,
ADD COLUMN     "zoomTokenExpiresAt" TIMESTAMP(3);
