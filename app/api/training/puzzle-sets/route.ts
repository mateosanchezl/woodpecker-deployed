import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createPuzzleSetSchema } from '@/lib/validations/training'
import { selectRandomPuzzlesForSet } from '@/lib/training/puzzle-selection'

/**
 * GET /api/training/puzzle-sets
 * Returns all puzzle sets for the authenticated user.
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all puzzle sets with their latest cycle.
    const puzzleSets = await prisma.puzzleSet.findMany({
      where: {
        user: {
          clerkId,
        },
      },
      include: {
        cycles: {
          orderBy: { cycleNumber: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    })

    const setsWithActivity = puzzleSets.map(set => {
      const latestCycle = set.cycles[0]
      const isCurrentCycleComplete = latestCycle?.completedAt !== null
      const lastTrainedAt = set.lastTrainedAt || latestCycle?.startedAt || null

      return {
        id: set.id,
        name: set.name,
        size: set.size,
        focusTheme: set.focusTheme,
        targetCycles: set.targetCycles,
        targetRating: set.targetRating,
        minRating: set.minRating,
        maxRating: set.maxRating,
        isActive: set.isActive,
        createdAt: set.createdAt.toISOString(),
        // Current cycle info
        currentCycle: latestCycle?.cycleNumber || null,
        currentCycleId: latestCycle && !isCurrentCycleComplete ? latestCycle.id : null,
        completedCycles: isCurrentCycleComplete
          ? latestCycle?.cycleNumber ?? 0
          : (latestCycle?.cycleNumber ?? 1) - 1,
        // Last activity timestamp
        lastTrainedAt: lastTrainedAt?.toISOString() || null,
      }
    })

    // Sort by lastTrainedAt (most recent first), nulls last
    setsWithActivity.sort((a, b) => {
      if (!a.lastTrainedAt && !b.lastTrainedAt) return 0
      if (!a.lastTrainedAt) return 1
      if (!b.lastTrainedAt) return -1
      return new Date(b.lastTrainedAt).getTime() - new Date(a.lastTrainedAt).getTime()
    })

    return NextResponse.json({
      sets: setsWithActivity,
    })
  } catch (error) {
    console.error('Error fetching puzzle sets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/training/puzzle-sets
 * Creates a new puzzle set with randomly selected puzzles.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = createPuzzleSetSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.message },
        { status: 400 }
      )
    }

    const { name, targetRating, ratingRange, size, targetCycles, focusTheme } = validation.data

    // Calculate rating bounds
    const minRating = Math.max(800, targetRating - Math.floor(ratingRange / 2))
    const maxRating = Math.min(2600, targetRating + Math.floor(ratingRange / 2))

    // Select random puzzles within the rating range and optional theme filter
    const puzzles = await selectRandomPuzzlesForSet({
      minRating,
      maxRating,
      size,
      focusTheme,
    })

    if (puzzles.length < size) {
      return NextResponse.json(
        {
          error: 'Not enough puzzles available',
          details: focusTheme
            ? `Found ${puzzles.length} puzzles for theme "${focusTheme}" in rating range ${minRating}-${maxRating}, but ${size} requested.`
            : `Found ${puzzles.length} puzzles in rating range ${minRating}-${maxRating}, but ${size} requested.`
        },
        { status: 400 }
      )
    }

    // Create puzzle set with puzzles in a transaction
    const puzzleSet = await prisma.$transaction(async (tx) => {
      // Create the puzzle set
      const set = await tx.puzzleSet.create({
        data: {
          user: {
            connect: { clerkId },
          },
          name,
          targetRating,
          minRating,
          maxRating,
          size,
          targetCycles,
          focusTheme: focusTheme ?? null,
        },
      })

      // Create PuzzleInSet entries with positions
      await tx.puzzleInSet.createMany({
        data: puzzles.map((puzzle, index) => ({
          puzzleSetId: set.id,
          puzzleId: puzzle.id,
          position: index + 1,
        })),
      })

      await tx.user.updateMany({
        where: {
          clerkId,
          hasCompletedOnboarding: false,
        },
        data: { hasCompletedOnboarding: true },
      })

      return set
    })

    return NextResponse.json(
      {
        puzzleSet: {
          id: puzzleSet.id,
          name: puzzleSet.name,
          size: puzzleSet.size,
          targetRating: puzzleSet.targetRating,
          minRating: puzzleSet.minRating,
          maxRating: puzzleSet.maxRating,
          targetCycles: puzzleSet.targetCycles,
          focusTheme: puzzleSet.focusTheme,
          createdAt: puzzleSet.createdAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.error('Error creating puzzle set:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
