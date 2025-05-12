-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "birthdate" TIMESTAMP(3),
    "grade" INTEGER,
    "street" TEXT,
    "apartment" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "schoolName" TEXT,
    "parentEmail" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "birthdate" TIMESTAMP(3),
    "address" TEXT,
    "grade" INTEGER,
    "street" TEXT,
    "apartment" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "schoolName" TEXT,
    "certificationUrls" TEXT[],
    "averageRating" DOUBLE PRECISION,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "zoomLink" TEXT,
    "maxAttendees" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "instructorId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_InstructorToSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InstructorToSubject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SessionToStudent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SessionToStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SessionToSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SessionToSubject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_email_key" ON "Instructor"("email");

-- CreateIndex
CREATE INDEX "Session_instructorId_idx" ON "Session"("instructorId");

-- CreateIndex
CREATE INDEX "Review_studentId_idx" ON "Review"("studentId");

-- CreateIndex
CREATE INDEX "Review_instructorId_idx" ON "Review"("instructorId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "Subject"("name");

-- CreateIndex
CREATE INDEX "_InstructorToSubject_B_index" ON "_InstructorToSubject"("B");

-- CreateIndex
CREATE INDEX "_SessionToStudent_B_index" ON "_SessionToStudent"("B");

-- CreateIndex
CREATE INDEX "_SessionToSubject_B_index" ON "_SessionToSubject"("B");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstructorToSubject" ADD CONSTRAINT "_InstructorToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstructorToSubject" ADD CONSTRAINT "_InstructorToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SessionToStudent" ADD CONSTRAINT "_SessionToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SessionToStudent" ADD CONSTRAINT "_SessionToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SessionToSubject" ADD CONSTRAINT "_SessionToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SessionToSubject" ADD CONSTRAINT "_SessionToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
