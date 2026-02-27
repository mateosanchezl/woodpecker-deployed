-- Remove duplicate attempts per (cycleId, puzzleInSetId) before applying
-- the unique constraint Attempt(cycleId, puzzleInSetId).
--
-- Strategy:
-- 1) Keep the earliest attempt by attemptedAt/id for each duplicate group
-- 2) Delete later duplicates
-- 3) Recompute Cycle and PuzzleInSet aggregates for impacted rows only
--
-- Run during a short maintenance window (or with writes paused) to prevent
-- new duplicates appearing between cleanup and migrate deploy.

BEGIN;

WITH ranked AS (
  SELECT
    a.id,
    a."cycleId",
    a."puzzleInSetId",
    ROW_NUMBER() OVER (
      PARTITION BY a."cycleId", a."puzzleInSetId"
      ORDER BY a."attemptedAt" ASC, a.id ASC
    ) AS rn
  FROM "Attempt" a
),
to_delete AS (
  SELECT id, "cycleId", "puzzleInSetId"
  FROM ranked
  WHERE rn > 1
),
deleted AS (
  DELETE FROM "Attempt" a
  USING to_delete td
  WHERE a.id = td.id
  RETURNING td."cycleId", td."puzzleInSetId"
),
impacted_cycles AS (
  SELECT DISTINCT "cycleId" AS id FROM deleted
),
impacted_puzzle_in_sets AS (
  SELECT DISTINCT "puzzleInSetId" AS id FROM deleted
),
cycle_agg AS (
  SELECT
    c.id AS cycle_id,
    COUNT(a.id)::int AS attempted_count,
    COUNT(*) FILTER (WHERE a."wasSkipped" = true)::int AS skipped_count,
    COUNT(*) FILTER (
      WHERE a."wasSkipped" = false AND a."isCorrect" = true
    )::int AS solved_correct_count,
    COUNT(*) FILTER (
      WHERE a."wasSkipped" = false AND a."isCorrect" = false
    )::int AS solved_incorrect_count,
    COALESCE(SUM(a."timeSpent"), 0)::int AS total_time
  FROM "Cycle" c
  LEFT JOIN "Attempt" a ON a."cycleId" = c.id
  WHERE c.id IN (SELECT id FROM impacted_cycles)
  GROUP BY c.id
),
updated_cycles AS (
  UPDATE "Cycle" c
  SET
    "solvedCorrect" = ca.solved_correct_count,
    "solvedIncorrect" = ca.solved_incorrect_count,
    "skipped" = ca.skipped_count,
    "totalTime" = CASE
      WHEN ca.attempted_count = 0 THEN NULL
      ELSE ca.total_time
    END,
    "completedAt" = CASE
      WHEN ca.attempted_count >= c."totalPuzzles"
        THEN COALESCE(c."completedAt", c."startedAt")
      ELSE NULL
    END
  FROM cycle_agg ca
  WHERE c.id = ca.cycle_id
  RETURNING c.id
),
puzzle_in_set_agg AS (
  SELECT
    pis.id AS puzzle_in_set_id,
    COUNT(a.id)::int AS total_attempts,
    COUNT(*) FILTER (WHERE a."isCorrect" = true)::int AS correct_attempts,
    AVG(a."timeSpent")::double precision AS average_time
  FROM "PuzzleInSet" pis
  LEFT JOIN "Attempt" a ON a."puzzleInSetId" = pis.id
  WHERE pis.id IN (SELECT id FROM impacted_puzzle_in_sets)
  GROUP BY pis.id
),
updated_puzzle_in_sets AS (
  UPDATE "PuzzleInSet" pis
  SET
    "totalAttempts" = pa.total_attempts,
    "correctAttempts" = pa.correct_attempts,
    "averageTime" = pa.average_time
  FROM puzzle_in_set_agg pa
  WHERE pis.id = pa.puzzle_in_set_id
  RETURNING pis.id
)
SELECT
  (SELECT COUNT(*) FROM deleted) AS deleted_attempt_rows,
  (SELECT COUNT(*) FROM updated_cycles) AS updated_cycle_rows,
  (SELECT COUNT(*) FROM updated_puzzle_in_sets) AS updated_puzzle_in_set_rows;

COMMIT;
