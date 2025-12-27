import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import type { ProgressResponse, CycleStats, ThemePerformance, ProblemPuzzle } from '@/lib/validations/progress'

interface RouteContext {
  params: Promise<{ setId: string }>
}

/**
 * GET /api/progress/[setId]
 * Returns detailed progress data for a puzzle set.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { setId } = await context.params

    // Get the user's database ID from their Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch puzzle set with all related data
    const puzzleSet = await prisma.puzzleSet.findUnique({
      where: { id: setId },
      include: {
        cycles: {
          orderBy: { cycleNumber: 'asc' },
        },
        puzzles: {
          include: {
            puzzle: {
              select: {
                id: true,
                fen: true,
                rating: true,
                themes: true,
              },
            },
            attempts: {
              select: {
                isCorrect: true,
                timeSpent: true,
              },
            },
          },
        },
      },
    })

    if (!puzzleSet) {
      return NextResponse.json({ error: 'Puzzle set not found' }, { status: 404 })
    }

    // Verify ownership
    if (puzzleSet.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Calculate cycle stats
    const cycles: CycleStats[] = puzzleSet.cycles
      .filter((cycle: { 
        cycleNumber: number
        totalTime: number | null
        solvedCorrect: number
        solvedIncorrect: number
        skipped: number
        completedAt: Date | null
      }) => cycle.completedAt !== null)
      .map((cycle: {
        cycleNumber: number
        totalTime: number | null
        solvedCorrect: number
        solvedIncorrect: number
        skipped: number
        completedAt: Date | null
      }) => {
        const total = cycle.solvedCorrect + cycle.solvedIncorrect + cycle.skipped
        const accuracy = total > 0 ? (cycle.solvedCorrect / total) * 100 : 0

        return {
          cycleNumber: cycle.cycleNumber,
          totalTime: cycle.totalTime,
          solvedCorrect: cycle.solvedCorrect,
          solvedIncorrect: cycle.solvedIncorrect,
          skipped: cycle.skipped,
          accuracy: Math.round(accuracy * 10) / 10,
          completedAt: cycle.completedAt?.toISOString() ?? null,
        }
      })

    // Calculate summary stats
    const completedCycles = cycles.length
    const totalAttempts = puzzleSet.puzzles.reduce(
      (sum, p) => sum + p.totalAttempts,
      0
    )
    const totalCorrect = puzzleSet.puzzles.reduce(
      (sum, p) => sum + p.correctAttempts,
      0
    )
    const overallAccuracy = totalAttempts > 0
      ? Math.round((totalCorrect / totalAttempts) * 1000) / 10
      : 0

    const totalTimeSpent = cycles.reduce(
      (sum, c) => sum + (c.totalTime ?? 0),
      0
    )
    const averageTimePerPuzzle = totalAttempts > 0
      ? Math.round(totalTimeSpent / totalAttempts)
      : 0

    const completedCycleTimes = cycles
      .map(c => c.totalTime)
      .filter((t): t is number => t !== null)
    const bestCycleTime = completedCycleTimes.length > 0
      ? Math.min(...completedCycleTimes)
      : null

    // Calculate theme performance
    const themeStats = new Map<string, { correct: number; total: number }>()

    for (const puzzleInSet of puzzleSet.puzzles) {
      const themes = puzzleInSet.puzzle.themes
      for (const attempt of puzzleInSet.attempts) {
        for (const theme of themes) {
          const current = themeStats.get(theme) ?? { correct: 0, total: 0 }
          themeStats.set(theme, {
            correct: current.correct + (attempt.isCorrect ? 1 : 0),
            total: current.total + 1,
          })
        }
      }
    }

    const themePerformance: ThemePerformance[] = Array.from(themeStats.entries())
      .map(([theme, stats]) => ({
        theme,
        totalAttempts: stats.total,
        correctAttempts: stats.correct,
        accuracy: Math.round((stats.correct / stats.total) * 1000) / 10,
      }))
      .sort((a, b) => b.totalAttempts - a.totalAttempts)
      .slice(0, 10)

    // Identify problem puzzles
    const problemPuzzles: ProblemPuzzle[] = puzzleSet.puzzles
      .filter(p => p.totalAttempts > 0 && p.correctAttempts < p.totalAttempts)
      .map(p => {
        const successRate = Math.round((p.correctAttempts / p.totalAttempts) * 1000) / 10
        const totalTime = p.attempts.reduce((sum, a) => sum + a.timeSpent, 0)
        const avgTime = p.attempts.length > 0 ? Math.round(totalTime / p.attempts.length) : 0

        return {
          position: p.position,
          puzzleId: p.puzzle.id,
          rating: p.puzzle.rating,
          themes: p.puzzle.themes,
          fen: p.puzzle.fen,
          totalAttempts: p.totalAttempts,
          correctAttempts: p.correctAttempts,
          successRate,
          averageTime: avgTime,
        }
      })
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, 15)

    const response: ProgressResponse = {
      set: {
        id: puzzleSet.id,
        name: puzzleSet.name,
        size: puzzleSet.size,
        targetRating: puzzleSet.targetRating,
        targetCycles: puzzleSet.targetCycles,
      },
      summary: {
        totalAttempts,
        completedCycles,
        overallAccuracy,
        averageTimePerPuzzle,
        totalTimeSpent,
        bestCycleTime,
      },
      cycles,
      themePerformance,
      problemPuzzles,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
