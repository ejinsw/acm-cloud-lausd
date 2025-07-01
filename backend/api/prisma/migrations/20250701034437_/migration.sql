/*
  Warnings:

  - You are about to drop the `_InstructorToSubject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SessionToStudent` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `studentId` on table `Review` required. This step will fail if there are existing NULL values in that column.
  - Made the column `instructorId` on table `Review` required. This step will fail if there are existing NULL values in that column.
  - Made the column `instructorId` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_InstructorToSubject" DROP CONSTRAINT "_InstructorToSubject_A_fkey";

-- DropForeignKey
ALTER TABLE "_InstructorToSubject" DROP CONSTRAINT "_InstructorToSubject_B_fkey";

-- DropForeignKey
ALTER TABLE "_SessionToStudent" DROP CONSTRAINT "_SessionToStudent_A_fkey";

-- DropForeignKey
ALTER TABLE "_SessionToStudent" DROP CONSTRAINT "_SessionToStudent_B_fkey";

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "studentId" SET NOT NULL,
ALTER COLUMN "instructorId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "instructorId" SET NOT NULL;

-- DropTable
DROP TABLE "_InstructorToSubject";

-- DropTable
DROP TABLE "_SessionToStudent";

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
CREATE INDEX "_StudentSessions_B_index" ON "_StudentSessions"("B");

-- CreateIndex
CREATE INDEX "_SubjectToUser_B_index" ON "_SubjectToUser"("B");

-- CreateIndex
CREATE INDEX "Review_studentId_idx" ON "Review"("studentId");

-- CreateIndex
CREATE INDEX "Review_instructorId_idx" ON "Review"("instructorId");

-- CreateIndex
CREATE INDEX "Session_instructorId_idx" ON "Session"("instructorId");

-- AddForeignKey
ALTER TABLE "_StudentSessions" ADD CONSTRAINT "_StudentSessions_A_fkey" FOREIGN KEY ("A") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentSessions" ADD CONSTRAINT "_StudentSessions_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectToUser" ADD CONSTRAINT "_SubjectToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectToUser" ADD CONSTRAINT "_SubjectToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
