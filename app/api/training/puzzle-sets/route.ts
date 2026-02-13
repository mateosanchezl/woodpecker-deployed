import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createPuzzleSetSchema } from '@/lib/validations/training'
import { selectRandomPuzzlesForSet } from '@/lib/training/puzzle-selection'

/**
 * GET /api/training/puzzle-sets
 * Returns all puzzle sets for the authenticated user.
 */
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's database ID from their Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all puzzle sets with their latest cycle and last activity
    const puzzleSets = await prisma.puzzleSet.findMany({
      where: { userId: user.id },
      include: {
        cycles: {
          orderBy: { cycleNumber: 'desc' },
          take: 1,
          include: {
            attempts: {
              orderBy: { attemptedAt: 'desc' },
              take: 1,
              select: { attemptedAt: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Sort by last activity (most recent first)
    const setsWithActivity = puzzleSets.map(set => {
      const latestCycle = set.cycles[0]
      const isCurrentCycleComplete = latestCycle?.completedAt !== null
      const lastAttempt = latestCycle?.attempts?.[0]?.attemptedAt
      const lastTrainedAt = lastAttempt || latestCycle?.startedAt || null

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
    const { userId } = await auth()
    if (!userId) {
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

    // Get the user's database ID from their Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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
          userId: user.id,
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

      if (!user.hasCompletedOnboarding) {
        await tx.user.update({
          where: { id: user.id },
          data: { hasCompletedOnboarding: true },
        })
      }

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
    console.error('Error creating puzzle set:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
