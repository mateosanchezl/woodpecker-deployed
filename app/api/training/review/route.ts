import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withUserProvisionFallback } from "@/lib/ensure-user";
import {
  resolveBoardTheme,
  type BoardThemeId,
} from "@/lib/chess/board-themes";
import { normalizeReviewQueueLimit } from "@/lib/training/review-queue";

export interface ReviewPuzzle {
  puzzleInSetId: string;
  puzzleSetId: string;
  puzzleSetName: string;
  position: number;
  queuedAt: string;
  lastReviewedAt: string | null;
  reviewCount: number;
  totalAttempts: number;
  correctAttempts: number;
  successRate: number;
  averageTime: number;
  lastAttemptAt: string | null;
  puzzle: {
    id: string;
    fen: string;
    moves: string;
    rating: number;
    themes: string[];
    difficulty: string;
  };
}

export interface ReviewResponse {
  puzzles: ReviewPuzzle[];
  themeFacets: ThemeFacet[];
  totalPendingPuzzles: number;
  filteredPendingPuzzles: number;
  boardTheme: BoardThemeId | null;
}

export interface ThemeFacet {
  theme: string;
  pendingCount: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
}

export interface ReviewPatchResponse {
  puzzleInSetId: string;
  isCorrect: boolean;
  reviewedAt: string;
  lastReviewedAt: string | null;
  reviewCount: number;
}

interface ReviewQueueRawPuzzle {
  puzzleInSetId: string;
  puzzleSetId: string;
  puzzleSetName: string;
  position: number;
  queuedAt: string | Date;
  lastReviewedAt: string | Date | null;
  reviewCount: number;
  totalAttempts: number;
  correctAttempts: number;
  successRate: number | string;
  averageTime: number | string | null;
  lastAttemptAt: string | Date | null;
  puzzle: {
    id: string;
    fen: string;
    moves: string;
    rating: number;
    themes: string[];
    difficulty: string;
  };
}

interface ReviewQueueRawThemeFacet {
  theme: string;
  pendingCount: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number | string;
}

interface ReviewQueueRawData {
  puzzles?: ReviewQueueRawPuzzle[];
  themeFacets?: ReviewQueueRawThemeFacet[];
  totalPendingPuzzles?: number;
  filteredPendingPuzzles?: number;
}

const reviewPatchSchema = z.object({
  puzzleInSetId: z.string().min(1),
  isCorrect: z.boolean(),
});

function toIsoString(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function normalizeReviewPuzzle(puzzle: ReviewQueueRawPuzzle): ReviewPuzzle {
  return {
    puzzleInSetId: puzzle.puzzleInSetId,
    puzzleSetId: puzzle.puzzleSetId,
    puzzleSetName: puzzle.puzzleSetName,
    position: Number(puzzle.position),
    queuedAt: toIsoString(puzzle.queuedAt) ?? new Date(0).toISOString(),
    lastReviewedAt: toIsoString(puzzle.lastReviewedAt),
    reviewCount: Number(puzzle.reviewCount),
    totalAttempts: Number(puzzle.totalAttempts),
    correctAttempts: Number(puzzle.correctAttempts),
    successRate: Number(puzzle.successRate),
    averageTime: Number(puzzle.averageTime ?? 0),
    lastAttemptAt: toIsoString(puzzle.lastAttemptAt),
    puzzle: {
      id: puzzle.puzzle.id,
      fen: puzzle.puzzle.fen,
      moves: puzzle.puzzle.moves,
      rating: Number(puzzle.puzzle.rating),
      themes: puzzle.puzzle.themes,
      difficulty: puzzle.puzzle.difficulty,
    },
  };
}

function normalizeThemeFacet(facet: ReviewQueueRawThemeFacet): ThemeFacet {
  return {
    theme: facet.theme,
    pendingCount: Number(facet.pendingCount),
    totalAttempts: Number(facet.totalAttempts),
    correctAttempts: Number(facet.correctAttempts),
    accuracy: Number(facet.accuracy),
  };
}

async function getCurrentUser(clerkId: string) {
  return withUserProvisionFallback(clerkId, () =>
    prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        boardTheme: true,
      },
    }),
  );
}

/**
 * GET /api/training/review
 * Returns the user's pending review queue.
 *
 * Query params:
 *   - theme: filter to queued puzzles containing this theme
 *   - limit: max puzzles to return (default 30, max 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const themeFilter = searchParams.get("theme") || null;
    const limit = normalizeReviewQueueLimit(searchParams.get("limit"));

    const rows = await prisma.$queryRaw<Array<{ data: ReviewQueueRawData }>>`
      WITH pending AS (
        SELECT
          rqi."puzzleInSetId" AS puzzle_in_set_id,
          rqi."queuedAt" AS queued_at,
          rqi."lastReviewedAt" AS last_reviewed_at,
          rqi."reviewCount" AS review_count,
          pis."puzzleSetId" AS puzzle_set_id,
          pis.position AS position,
          pis."totalAttempts" AS total_attempts,
          pis."correctAttempts" AS correct_attempts,
          pis."averageTime" AS average_time,
          pis."lastAttemptAt" AS last_attempt_at,
          ps.name AS puzzle_set_name,
          p.id AS puzzle_id,
          p.fen AS fen,
          p.moves AS moves,
          p.rating AS rating,
          p.themes AS puzzle_themes,
          p.difficulty AS difficulty,
          CASE
            WHEN pis."totalAttempts" > 0 THEN
              ROUND(
                (
                  (pis."correctAttempts"::double precision / pis."totalAttempts"::double precision)
                  * 100
                )::numeric,
                1
              )::double precision
            ELSE 0
          END AS success_rate
        FROM "ReviewQueueItem" rqi
        JOIN "PuzzleInSet" pis
          ON pis.id = rqi."puzzleInSetId"
        JOIN "PuzzleSet" ps
          ON ps.id = pis."puzzleSetId"
         AND ps."userId" = rqi."userId"
        JOIN "Puzzle" p
          ON p.id = pis."puzzleId"
        WHERE rqi."userId" = ${user.id}
      ),
      filtered AS (
        SELECT *
        FROM pending
        WHERE (${themeFilter}::text IS NULL OR ${themeFilter} = ANY(puzzle_themes))
      ),
      limited AS (
        SELECT *
        FROM filtered
        ORDER BY last_reviewed_at ASC NULLS FIRST, queued_at ASC, puzzle_in_set_id ASC
        LIMIT ${limit}
      ),
      theme_facets AS (
        SELECT
          theme_value.theme AS theme,
          COUNT(*)::int AS pending_count,
          COALESCE(SUM(total_attempts), 0)::int AS total_attempts,
          COALESCE(SUM(correct_attempts), 0)::int AS correct_attempts,
          CASE
            WHEN COALESCE(SUM(total_attempts), 0) > 0 THEN
              ROUND(
                (
                  (SUM(correct_attempts)::double precision / SUM(total_attempts)::double precision)
                  * 100
                )::numeric,
                1
              )::double precision
            ELSE 0
          END AS accuracy
        FROM pending
        CROSS JOIN LATERAL unnest(puzzle_themes) AS theme_value(theme)
        GROUP BY theme_value.theme
        ORDER BY pending_count DESC, accuracy ASC, theme_value.theme ASC
        LIMIT 12
      )
      SELECT jsonb_build_object(
        'puzzles',
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'puzzleInSetId', puzzle_in_set_id,
                'puzzleSetId', puzzle_set_id,
                'puzzleSetName', puzzle_set_name,
                'position', position,
                'queuedAt', queued_at,
                'lastReviewedAt', last_reviewed_at,
                'reviewCount', review_count,
                'totalAttempts', total_attempts,
                'correctAttempts', correct_attempts,
                'successRate', success_rate,
                'averageTime', average_time,
                'lastAttemptAt', last_attempt_at,
                'puzzle', jsonb_build_object(
                  'id', puzzle_id,
                  'fen', fen,
                  'moves', moves,
                  'rating', rating,
                  'themes', puzzle_themes,
                  'difficulty', difficulty
                )
              )
              ORDER BY last_reviewed_at ASC NULLS FIRST, queued_at ASC, puzzle_in_set_id ASC
            )
            FROM limited
          ),
          '[]'::jsonb
        ),
        'themeFacets',
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'theme', theme,
                'pendingCount', pending_count,
                'totalAttempts', total_attempts,
                'correctAttempts', correct_attempts,
                'accuracy', accuracy
              )
              ORDER BY pending_count DESC, accuracy ASC, theme ASC
            )
            FROM theme_facets
          ),
          '[]'::jsonb
        ),
        'totalPendingPuzzles', (SELECT COUNT(*)::int FROM pending),
        'filteredPendingPuzzles', (SELECT COUNT(*)::int FROM filtered)
      ) AS data;
    `;

    const rawData = rows[0]?.data ?? {};
    const response: ReviewResponse = {
      puzzles: (rawData.puzzles ?? []).map(normalizeReviewPuzzle),
      themeFacets: (rawData.themeFacets ?? []).map(normalizeThemeFacet),
      totalPendingPuzzles: Number(rawData.totalPendingPuzzles ?? 0),
      filteredPendingPuzzles: Number(rawData.filteredPendingPuzzles ?? 0),
      boardTheme: user.boardTheme ? resolveBoardTheme(user.boardTheme) : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching review queue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/training/review
 * Applies a lightweight review result without recording a training attempt.
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = reviewPatchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.message },
        { status: 400 },
      );
    }

    const { puzzleInSetId, isCorrect } = validation.data;
    const reviewedAt = new Date();

    if (isCorrect) {
      const rows = await prisma.$queryRaw<
        Array<{ puzzleInSetId: string; reviewCount: number }>
      >`
        DELETE FROM "ReviewQueueItem"
        WHERE "puzzleInSetId" = ${puzzleInSetId}
          AND "userId" = ${user.id}
        RETURNING "puzzleInSetId", "reviewCount"
      `;

      if (!rows[0]) {
        return NextResponse.json(
          { error: "Review queue item not found" },
          { status: 404 },
        );
      }

      const response: ReviewPatchResponse = {
        puzzleInSetId: rows[0].puzzleInSetId,
        isCorrect: true,
        reviewedAt: reviewedAt.toISOString(),
        lastReviewedAt: null,
        reviewCount: Number(rows[0].reviewCount),
      };

      return NextResponse.json(response);
    }

    const rows = await prisma.$queryRaw<
      Array<{
        puzzleInSetId: string;
        lastReviewedAt: Date | string | null;
        reviewCount: number;
      }>
    >`
      UPDATE "ReviewQueueItem"
      SET
        "lastReviewedAt" = CAST(${reviewedAt} AS timestamp),
        "reviewCount" = "reviewCount" + 1
      WHERE "puzzleInSetId" = ${puzzleInSetId}
        AND "userId" = ${user.id}
      RETURNING "puzzleInSetId", "lastReviewedAt", "reviewCount"
    `;

    if (!rows[0]) {
      return NextResponse.json(
        { error: "Review queue item not found" },
        { status: 404 },
      );
    }

    const response: ReviewPatchResponse = {
      puzzleInSetId: rows[0].puzzleInSetId,
      isCorrect: false,
      reviewedAt: reviewedAt.toISOString(),
      lastReviewedAt: toIsoString(rows[0].lastReviewedAt),
      reviewCount: Number(rows[0].reviewCount),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating review queue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
