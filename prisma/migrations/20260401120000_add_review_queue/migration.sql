CREATE TABLE "ReviewQueueItem" (
    "puzzleInSetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewedAt" TIMESTAMP(3),
    "reviewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReviewQueueItem_pkey" PRIMARY KEY ("puzzleInSetId")
);

ALTER TABLE "ReviewQueueItem"
    ADD CONSTRAINT "ReviewQueueItem_puzzleInSetId_fkey"
    FOREIGN KEY ("puzzleInSetId") REFERENCES "PuzzleInSet"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReviewQueueItem"
    ADD CONSTRAINT "ReviewQueueItem_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "ReviewQueueItem_userId_lastReviewedAt_queuedAt_puzzleInSetId_idx"
ON "ReviewQueueItem"("userId", "lastReviewedAt", "queuedAt", "puzzleInSetId");

INSERT INTO "ReviewQueueItem" ("puzzleInSetId", "userId", "queuedAt")
SELECT
    pis.id,
    ps."userId",
    COALESCE(pis."lastAttemptAt", CURRENT_TIMESTAMP)
FROM "PuzzleInSet" pis
JOIN "PuzzleSet" ps
  ON ps.id = pis."puzzleSetId"
WHERE pis."totalAttempts" > 0
  AND pis."correctAttempts" < pis."totalAttempts"
  AND COALESCE(pis."lastAttemptIsCorrect", FALSE) = FALSE
ON CONFLICT ("puzzleInSetId") DO NOTHING;
