-- Add denormalized hot-path columns used by training session flow.
ALTER TABLE "Cycle"
  ADD COLUMN "attemptedCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "nextPosition" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "PuzzleInSet"
  ADD COLUMN "lastAttemptIsCorrect" BOOLEAN,
  ADD COLUMN "lastAttemptTime" INTEGER,
  ADD COLUMN "lastAttemptAt" TIMESTAMP(3);

ALTER TABLE "PuzzleSet"
  ADD COLUMN "lastTrainedAt" TIMESTAMP(3);

-- Backfill cycle counters from existing solved/incorrect/skipped values.
UPDATE "Cycle"
SET "attemptedCount" = ("solvedCorrect" + "solvedIncorrect" + "skipped");

UPDATE "Cycle"
SET "nextPosition" = LEAST("totalPuzzles" + 1, "attemptedCount" + 1);

-- Backfill most recent attempt metadata per puzzle-in-set.
WITH latest_attempts AS (
  SELECT DISTINCT ON (a."puzzleInSetId")
    a."puzzleInSetId",
    a."isCorrect",
    a."timeSpent",
    a."attemptedAt"
  FROM "Attempt" a
  ORDER BY a."puzzleInSetId", a."attemptedAt" DESC
)
UPDATE "PuzzleInSet" pis
SET
  "lastAttemptIsCorrect" = la."isCorrect",
  "lastAttemptTime" = la."timeSpent",
  "lastAttemptAt" = la."attemptedAt"
FROM latest_attempts la
WHERE la."puzzleInSetId" = pis.id;

-- Backfill set-level activity timestamp from latest attempts.
WITH set_last_train AS (
  SELECT ps.id AS "puzzleSetId", MAX(a."attemptedAt") AS "lastAttemptAt"
  FROM "PuzzleSet" ps
  LEFT JOIN "PuzzleInSet" pis ON pis."puzzleSetId" = ps.id
  LEFT JOIN "Attempt" a ON a."puzzleInSetId" = pis.id
  GROUP BY ps.id
)
UPDATE "PuzzleSet" ps
SET "lastTrainedAt" = slt."lastAttemptAt"
FROM set_last_train slt
WHERE slt."puzzleSetId" = ps.id;

-- Validate composite uniqueness before adding the constraint.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Attempt"
    GROUP BY "cycleId", "puzzleInSetId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add unique constraint Attempt(cycleId, puzzleInSetId): duplicates detected';
  END IF;
END $$;

ALTER TABLE "Attempt"
  ADD CONSTRAINT "Attempt_cycleId_puzzleInSetId_key" UNIQUE ("cycleId", "puzzleInSetId");

CREATE INDEX "PuzzleSet_userId_lastTrainedAt_idx" ON "PuzzleSet"("userId", "lastTrainedAt");
