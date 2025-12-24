import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { nextPuzzleQuerySchema } from '@/lib/validations/training'

interface RouteContext {
  params: Promise<{ setId: string }>
}

/**
 * GET /api/training/puzzle-sets/[setId]/next-puzzle
 * Returns the next unsolved puzzle in the current cycle.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { setId } = await context.params
    const searchParams = request.nextUrl.searchParams
    const cycleId = searchParams.get('cycleId')

    // Validate query params
    const validation = nextPuzzleQuerySchema.safeParse({ cycleId })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.message },
        { status: 400 }
      )
    }

    // Get the user's database ID from their Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the puzzle set and verify ownership
    const puzzleSet = await prisma.puzzleSet.findUnique({
      where: { id: setId },
      include: {
        puzzles: {
          orderBy: { position: 'asc' },
          include: {
            puzzle: true,
          },
        },
      },
    })

    if (!puzzleSet) {
      return NextResponse.json({ error: 'Puzzle set not found' }, { status: 404 })
    }

    if (puzzleSet.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get the current cycle
    const cycle = await prisma.cycle.findUnique({
      where: { id: validation.data.cycleId },
      include: {
        attempts: {
          select: { puzzleInSetId: true },
        },
      },
    })

    if (!cycle) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 })
    }

    if (cycle.puzzleSetId !== setId) {
      return NextResponse.json(
        { error: 'Cycle does not belong to this puzzle set' },
        { status: 400 }
      )
    }

    // Find puzzles that haven't been attempted in this cycle
    const attemptedPuzzleIds = new Set(cycle.attempts.map(a => a.puzzleInSetId))
    const unsolvedPuzzles = puzzleSet.puzzles.filter(
      p => !attemptedPuzzleIds.has(p.id)
    )

    // Check if cycle is complete
    if (unsolvedPuzzles.length === 0) {
      return NextResponse.json({
        puzzle: null,
        puzzleInSet: null,
        progress: {
          currentPosition: puzzleSet.puzzles.length,
          totalPuzzles: puzzleSet.puzzles.length,
          completedInCycle: cycle.attempts.length,
          cycleNumber: cycle.cycleNumber,
        },
        isCycleComplete: true,
        cycleStats: {
          solvedCorrect: cycle.solvedCorrect,
          solvedIncorrect: cycle.solvedIncorrect,
          skipped: cycle.skipped,
          totalTime: cycle.totalTime,
        },
      })
    }

    // Get the next puzzle (first unsolved) and prefetch the one after
    const nextPuzzleInSet = unsolvedPuzzles[0]
    const prefetchPuzzleInSet = unsolvedPuzzles.length > 1 ? unsolvedPuzzles[1] : null
    const completedCount = attemptedPuzzleIds.size

    return NextResponse.json({
      puzzle: {
        id: nextPuzzleInSet.puzzle.id,
        fen: nextPuzzleInSet.puzzle.fen,
        moves: nextPuzzleInSet.puzzle.moves,
        rating: nextPuzzleInSet.puzzle.rating,
        themes: nextPuzzleInSet.puzzle.themes,
      },
      puzzleInSet: {
        id: nextPuzzleInSet.id,
        position: nextPuzzleInSet.position,
        totalAttempts: nextPuzzleInSet.totalAttempts,
        correctAttempts: nextPuzzleInSet.correctAttempts,
        averageTime: nextPuzzleInSet.averageTime,
      },
      progress: {
        currentPosition: nextPuzzleInSet.position,
        totalPuzzles: puzzleSet.puzzles.length,
        completedInCycle: completedCount,
        cycleNumber: cycle.cycleNumber,
      },
      isCycleComplete: false,
      // Prefetched next puzzle for instant transitions
      prefetchedNext: prefetchPuzzleInSet ? {
        puzzle: {
          id: prefetchPuzzleInSet.puzzle.id,
          fen: prefetchPuzzleInSet.puzzle.fen,
          moves: prefetchPuzzleInSet.puzzle.moves,
          rating: prefetchPuzzleInSet.puzzle.rating,
          themes: prefetchPuzzleInSet.puzzle.themes,
        },
        puzzleInSet: {
          id: prefetchPuzzleInSet.id,
          position: prefetchPuzzleInSet.position,
          totalAttempts: prefetchPuzzleInSet.totalAttempts,
          correctAttempts: prefetchPuzzleInSet.correctAttempts,
          averageTime: prefetchPuzzleInSet.averageTime,
        },
      } : null,
    })
  } catch (error) {
    console.error('Error fetching next puzzle:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
