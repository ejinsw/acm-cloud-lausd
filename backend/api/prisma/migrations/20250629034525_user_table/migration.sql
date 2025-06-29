/*
  Warnings:

  - You are about to drop the `Instructor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_InstructorToSubject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SessionToStudent` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'INSTRUCTOR');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "_InstructorToSubject" DROP CONSTRAINT "_InstructorToSubject_A_fkey";

-- DropForeignKey
ALTER TABLE "_InstructorToSubject" DROP CONSTRAINT "_InstructorToSubject_B_fkey";

-- DropForeignKey
ALTER TABLE "_SessionToStudent" DROP CONSTRAINT "_SessionToStudent_A_fkey";

-- DropForeignKey
ALTER TABLE "_SessionToStudent" DROP CONSTRAINT "_SessionToStudent_B_fkey";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "materials" TEXT[],
ADD COLUMN     "objectives" TEXT[],
ADD COLUMN     "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "category" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "level" TEXT;

-- DropTable
DROP TABLE "Instructor";

-- DropTable
DROP TABLE "Student";

-- DropTable
DROP TABLE "_InstructorToSubject";

-- DropTable
DROP TABLE "_SessionToStudent";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3),
    "street" TEXT,
    "apartment" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "schoolName" TEXT,
    "profilePicture" TEXT,
    "bio" TEXT,
    "grade" TEXT,
    "parentFirstName" TEXT,
    "parentLastName" TEXT,
    "parentEmail" TEXT,
    "parentPhone" TEXT,
    "interests" TEXT[],
    "learningGoals" TEXT[],
    "education" TEXT[],
    "experience" TEXT[],
    "certificationUrls" TEXT[],
    "averageRating" DOUBLE PRECISION,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StudentSessions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StudentSessions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SubjectToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubjectToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "_StudentSessions_B_index" ON "_StudentSessions"("B");

-- CreateIndex
CREATE INDEX "_SubjectToUser_B_index" ON "_SubjectToUser"("B");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentSessions" ADD CONSTRAINT "_StudentSessions_A_fkey" FOREIGN KEY ("A") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentSessions" ADD CONSTRAINT "_StudentSessions_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectToUser" ADD CONSTRAINT "_SubjectToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectToUser" ADD CONSTRAINT "_SubjectToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
