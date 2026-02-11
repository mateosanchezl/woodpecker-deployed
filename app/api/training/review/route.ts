import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export interface ReviewPuzzle {
  puzzleInSetId: string;
  puzzleSetId: string;
  puzzleSetName: string;
  position: number;
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
  // Context for recording attempts
  latestCycleId: string;
}

export interface ReviewResponse {
  puzzles: ReviewPuzzle[];
  themeWeaknesses: ThemeWeakness[];
  totalStruggledPuzzles: number;
}

export interface ThemeWeakness {
  theme: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  puzzleCount: number;
}

/**
 * GET /api/training/review
 * Returns puzzles the user has struggled with most, across all puzzle sets.
 * Supports filtering by theme and limiting results.
 *
 * Query params:
 *   - theme: filter to puzzles containing this theme
 *   - limit: max puzzles to return (default 50)
 *   - maxSuccessRate: upper bound on success rate, 0-100 (default 75)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const themeFilter = searchParams.get("theme");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50", 10),
      100,
    );
    const maxSuccessRate = parseInt(
      searchParams.get("maxSuccessRate") || "75",
      10,
    );

    // Fetch all puzzle-in-set records with attempts where user has struggled
    const puzzlesInSets = await prisma.puzzleInSet.findMany({
      where: {
        puzzleSet: {
          userId: user.id,
        },
        totalAttempts: { gt: 0 },
      },
      include: {
        puzzle: {
          select: {
            id: true,
            fen: true,
            moves: true,
            rating: true,
            themes: true,
            difficulty: true,
          },
        },
        puzzleSet: {
          select: {
            id: true,
            name: true,
            cycles: {
              orderBy: { cycleNumber: "desc" },
              take: 1,
              select: { id: true },
            },
          },
        },
        attempts: {
          orderBy: { attemptedAt: "desc" },
          take: 1,
          select: { attemptedAt: true },
        },
      },
      orderBy: {
        totalAttempts: "desc",
      },
    });

    // Compute success rate and filter — exclude puzzles with perfect scores
    const scoredPuzzles = puzzlesInSets
      .map((pis) => {
        const successRate =
          pis.totalAttempts > 0
            ? Math.round((pis.correctAttempts / pis.totalAttempts) * 1000) / 10
            : 0;

        return {
          ...pis,
          successRate,
        };
      })
      .filter((p) => p.correctAttempts < p.totalAttempts) // At least one wrong
      .filter((p) => p.successRate <= maxSuccessRate)
      .filter((p) => {
        if (!themeFilter) return true;
        return p.puzzle.themes.includes(themeFilter);
      });

    // Sort by: worst success rate first, then by staleness (least recently attempted first)
    scoredPuzzles.sort((a, b) => {
      // Primary: lowest success rate first
      if (a.successRate !== b.successRate) {
        return a.successRate - b.successRate;
      }
      // Secondary: least recently attempted first (prioritise stale puzzles)
      const aTime = a.attempts[0]?.attemptedAt?.getTime() ?? 0;
      const bTime = b.attempts[0]?.attemptedAt?.getTime() ?? 0;
      return aTime - bTime;
    });

    // Compute theme weaknesses across all struggled puzzles
    const themeStats = new Map<
      string,
      { correct: number; total: number; puzzleIds: Set<string> }
    >();

    for (const pis of scoredPuzzles) {
      for (const theme of pis.puzzle.themes) {
        const current = themeStats.get(theme) ?? {
          correct: 0,
          total: 0,
          puzzleIds: new Set(),
        };
        current.correct += pis.correctAttempts;
        current.total += pis.totalAttempts;
        current.puzzleIds.add(pis.puzzle.id);
        themeStats.set(theme, current);
      }
    }

    const themeWeaknesses: ThemeWeakness[] = Array.from(themeStats.entries())
      .map(([theme, stats]) => ({
        theme,
        totalAttempts: stats.total,
        correctAttempts: stats.correct,
        accuracy: Math.round((stats.correct / stats.total) * 1000) / 10,
        puzzleCount: stats.puzzleIds.size,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 15);

    const totalStruggledPuzzles = scoredPuzzles.length;

    // Limit results
    const limitedPuzzles = scoredPuzzles.slice(0, limit);

    const puzzles: ReviewPuzzle[] = limitedPuzzles.map((pis) => ({
      puzzleInSetId: pis.id,
      puzzleSetId: pis.puzzleSet.id,
      puzzleSetName: pis.puzzleSet.name,
      position: pis.position,
      totalAttempts: pis.totalAttempts,
      correctAttempts: pis.correctAttempts,
      successRate: pis.successRate,
      averageTime: pis.averageTime ?? 0,
      lastAttemptAt: pis.attempts[0]?.attemptedAt?.toISOString() ?? null,
      puzzle: {
        id: pis.puzzle.id,
        fen: pis.puzzle.fen,
        moves: pis.puzzle.moves,
        rating: pis.puzzle.rating,
        themes: pis.puzzle.themes,
        difficulty: pis.puzzle.difficulty,
      },
      latestCycleId: pis.puzzleSet.cycles[0]?.id ?? "",
    }));

    const response: ReviewResponse = {
      puzzles,
      themeWeaknesses,
      totalStruggledPuzzles,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching review puzzles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
