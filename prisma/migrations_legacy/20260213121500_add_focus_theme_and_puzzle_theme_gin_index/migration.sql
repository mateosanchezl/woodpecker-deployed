ALTER TABLE "PuzzleSet"
ADD COLUMN IF NOT EXISTS "focusTheme" TEXT;

DROP INDEX IF EXISTS "Puzzle_themes_idx";
DROP INDEX IF EXISTS "Puzzle_themes_gin_idx";

CREATE INDEX "Puzzle_themes_gin_idx" ON "Puzzle" USING GIN ("themes");
