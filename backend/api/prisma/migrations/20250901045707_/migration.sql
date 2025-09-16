-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateTable
CREATE TABLE "StudentQueue" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'PENDING',
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "acceptedInstructorId" TEXT,

    CONSTRAINT "StudentQueue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudentQueue" ADD CONSTRAINT "StudentQueue_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentQueue" ADD CONSTRAINT "StudentQueue_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentQueue" ADD CONSTRAINT "StudentQueue_acceptedInstructorId_fkey" FOREIGN KEY ("acceptedInstructorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
