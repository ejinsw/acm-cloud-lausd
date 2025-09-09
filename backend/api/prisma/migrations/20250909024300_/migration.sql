-- CreateTable
CREATE TABLE "SessionHistoryItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "zoomLink" TEXT,
    "maxAttendees" INTEGER,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "materials" TEXT[],
    "objectives" TEXT[],
    "subjects" TEXT[],
    "instructorName" TEXT,
    "studentNames" TEXT[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "SessionHistoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionHistoryItem_userId_idx" ON "SessionHistoryItem"("userId");

-- AddForeignKey
ALTER TABLE "SessionHistoryItem" ADD CONSTRAINT "SessionHistoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
