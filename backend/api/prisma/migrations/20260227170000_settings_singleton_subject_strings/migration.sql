-- Add scalar subject fields and settings singleton table.
ALTER TABLE "User"
ADD COLUMN "subjects" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "Session"
ADD COLUMN "subjects" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "StudentQueue"
ADD COLUMN "subject" TEXT;

CREATE TABLE "Setting" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- Backfill user subject arrays from the legacy many-to-many relation.
UPDATE "User" u
SET "subjects" = mapped.subjects
FROM (
    SELECT rel."B" AS "userId",
           ARRAY_AGG(s."name" ORDER BY s."name") AS "subjects"
    FROM "_SubjectToUser" rel
    JOIN "Subject" s ON s."id" = rel."A"
    GROUP BY rel."B"
) mapped
WHERE u."id" = mapped."userId";

-- Backfill session subject arrays from the legacy many-to-many relation.
UPDATE "Session" sess
SET "subjects" = mapped.subjects
FROM (
    SELECT rel."A" AS "sessionId",
           ARRAY_AGG(s."name" ORDER BY s."name") AS "subjects"
    FROM "_SessionToSubject" rel
    JOIN "Subject" s ON s."id" = rel."B"
    GROUP BY rel."A"
) mapped
WHERE sess."id" = mapped."sessionId";

-- Backfill student queue subject names from legacy foreign key.
UPDATE "StudentQueue" q
SET "subject" = s."name"
FROM "Subject" s
WHERE q."subjectId" = s."id";

UPDATE "StudentQueue"
SET "subject" = 'N/A'
WHERE "subject" IS NULL;

ALTER TABLE "StudentQueue"
ALTER COLUMN "subject" SET NOT NULL;

-- Remove legacy relations and tables.
ALTER TABLE "StudentQueue" DROP CONSTRAINT IF EXISTS "StudentQueue_subjectId_fkey";
ALTER TABLE "StudentQueue" DROP COLUMN IF EXISTS "subjectId";

DROP TABLE IF EXISTS "_SessionToSubject";
DROP TABLE IF EXISTS "_SubjectToUser";
DROP TABLE IF EXISTS "Subject";
