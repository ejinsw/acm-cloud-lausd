-- CreateEnum
CREATE TYPE "SessionRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';

-- CreateTable
CREATE TABLE "SessionRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "SessionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "studentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "SessionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionRequest_studentId_idx" ON "SessionRequest"("studentId");

-- CreateIndex
CREATE INDEX "SessionRequest_sessionId_idx" ON "SessionRequest"("sessionId");

-- AddForeignKey
ALTER TABLE "SessionRequest" ADD CONSTRAINT "SessionRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionRequest" ADD CONSTRAINT "SessionRequest_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
