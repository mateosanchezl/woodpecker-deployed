-- Diagnostic query for duplicate attempts per (cycleId, puzzleInSetId)

SELECT
  COUNT(*)::int AS duplicate_groups,
  COALESCE(SUM(group_count - 1), 0)::int AS duplicate_rows
FROM (
  SELECT COUNT(*)::int AS group_count
  FROM "Attempt"
  GROUP BY "cycleId", "puzzleInSetId"
  HAVING COUNT(*) > 1
) dup;

SELECT
  "cycleId",
  "puzzleInSetId",
  COUNT(*)::int AS group_count,
  MIN("attemptedAt") AS first_attempt_at,
  MAX("attemptedAt") AS last_attempt_at
FROM "Attempt"
GROUP BY "cycleId", "puzzleInSetId"
HAVING COUNT(*) > 1
ORDER BY group_count DESC, last_attempt_at DESC
LIMIT 100;
