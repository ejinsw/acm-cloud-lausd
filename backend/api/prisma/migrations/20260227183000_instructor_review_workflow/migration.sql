-- CreateEnum
CREATE TYPE "InstructorReviewStatus" AS ENUM ('UNDER_REVIEW', 'APPROVED');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "instructorReviewStatus" "InstructorReviewStatus" NOT NULL DEFAULT 'APPROVED';

-- Backfill instructors that were previously pending verification into review workflow
UPDATE "User"
SET "instructorReviewStatus" = 'UNDER_REVIEW'
WHERE "role" = 'INSTRUCTOR' AND "verified" = false;

-- CreateTable
CREATE TABLE "InstructorVerificationDocument" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,

    CONSTRAINT "InstructorVerificationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InstructorVerificationDocument_userId_idx" ON "InstructorVerificationDocument"("userId");

-- AddForeignKey
ALTER TABLE "InstructorVerificationDocument" ADD CONSTRAINT "InstructorVerificationDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
