-- Migration to transform separate Student/Instructor tables into unified User table

-- Step 1: Create the new User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
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

-- Step 2: Create unique constraint on email
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Step 3: Migrate data from Student table to User table
INSERT INTO "User" (
    "id", "createdAt", "updatedAt", "email", "role", "verified", 
    "firstName", "lastName", "birthdate", "street", "apartment", 
    "city", "state", "zip", "country", "schoolName", "grade", "parentEmail"
)
SELECT 
    "id", "createdAt", "updatedAt", "email", 'STUDENT', false,
    "firstName", "lastName", "birthdate", "street", "apartment",
    "city", "state", "zip", "country", "schoolName", "grade"::TEXT, "parentEmail"
FROM "Student";

-- Step 4: Migrate data from Instructor table to User table
INSERT INTO "User" (
    "id", "createdAt", "updatedAt", "email", "role", "verified",
    "firstName", "lastName", "birthdate", "street", "apartment",
    "city", "state", "zip", "country", "schoolName", "certificationUrls", "averageRating"
)
SELECT 
    "id", "createdAt", "updatedAt", "email", 'INSTRUCTOR', false,
    "firstName", "lastName", "birthdate", "street", "apartment",
    "city", "state", "zip", "country", "schoolName", "certificationUrls", "averageRating"
FROM "Instructor";

-- Step 5: Update Session table to reference User instead of Instructor
ALTER TABLE "Session" ADD COLUMN "instructorId_new" TEXT;
UPDATE "Session" SET "instructorId_new" = "instructorId";
ALTER TABLE "Session" DROP CONSTRAINT "Session_instructorId_fkey";
ALTER TABLE "Session" DROP COLUMN "instructorId";
ALTER TABLE "Session" RENAME COLUMN "instructorId_new" TO "instructorId";
ALTER TABLE "Session" ADD CONSTRAINT "Session_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 6: Update Review table to reference User instead of Student/Instructor
ALTER TABLE "Review" ADD COLUMN "studentId_new" TEXT;
ALTER TABLE "Review" ADD COLUMN "instructorId_new" TEXT;
UPDATE "Review" SET "studentId_new" = "studentId", "instructorId_new" = "instructorId";
ALTER TABLE "Review" DROP CONSTRAINT "Review_studentId_fkey";
ALTER TABLE "Review" DROP CONSTRAINT "Review_instructorId_fkey";
ALTER TABLE "Review" DROP COLUMN "studentId";
ALTER TABLE "Review" DROP COLUMN "instructorId";
ALTER TABLE "Review" RENAME COLUMN "studentId_new" TO "studentId";
ALTER TABLE "Review" RENAME COLUMN "instructorId_new" TO "instructorId";
ALTER TABLE "Review" ADD CONSTRAINT "Review_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 7: Update _InstructorToSubject table to reference User
ALTER TABLE "_InstructorToSubject" ADD COLUMN "A_new" TEXT;
UPDATE "_InstructorToSubject" SET "A_new" = "A";
ALTER TABLE "_InstructorToSubject" DROP CONSTRAINT "_InstructorToSubject_A_fkey";
ALTER TABLE "_InstructorToSubject" DROP COLUMN "A";
ALTER TABLE "_InstructorToSubject" RENAME COLUMN "A_new" TO "A";
ALTER TABLE "_InstructorToSubject" ADD CONSTRAINT "_InstructorToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 8: Update _SessionToStudent table to reference User
ALTER TABLE "_SessionToStudent" ADD COLUMN "B_new" TEXT;
UPDATE "_SessionToStudent" SET "B_new" = "B";
ALTER TABLE "_SessionToStudent" DROP CONSTRAINT "_SessionToStudent_B_fkey";
ALTER TABLE "_SessionToStudent" DROP COLUMN "B";
ALTER TABLE "_SessionToStudent" RENAME COLUMN "B_new" TO "B";
ALTER TABLE "_SessionToStudent" ADD CONSTRAINT "_SessionToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 9: Drop old tables
DROP TABLE "Student";
DROP TABLE "Instructor";

-- Step 10: Create enum for UserRole
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'INSTRUCTOR');

-- Step 11: Update User table to use the enum
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";

-- Step 12: Create enum for SessionStatus
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Step 13: Add status field to Session table
ALTER TABLE "Session" ADD COLUMN "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED';
ALTER TABLE "Session" ADD COLUMN "materials" TEXT[];
ALTER TABLE "Session" ADD COLUMN "objectives" TEXT[];

-- Step 14: Update Subject table to match schema
ALTER TABLE "Subject" ADD COLUMN "description" TEXT;
ALTER TABLE "Subject" ADD COLUMN "category" TEXT;
ALTER TABLE "Subject" ADD COLUMN "level" TEXT; 