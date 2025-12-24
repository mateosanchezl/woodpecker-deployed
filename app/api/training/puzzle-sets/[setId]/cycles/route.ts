import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ setId: string }>
}

/**
 * POST /api/training/puzzle-sets/[setId]/cycles
 * Creates a new training cycle for the puzzle set.
 */
export async function POST(request: NextRequest, context: RouteContext) {
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

    // Get the puzzle set and verify ownership
    const puzzleSet = await prisma.puzzleSet.findUnique({
      where: { id: setId },
      include: {
        puzzles: true,
        cycles: {
          orderBy: { cycleNumber: 'desc' },
          take: 1,
        },
      },
    })

    if (!puzzleSet) {
      return NextResponse.json({ error: 'Puzzle set not found' }, { status: 404 })
    }

    if (puzzleSet.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Determine the next cycle number
    const lastCycle = puzzleSet.cycles[0]
    const nextCycleNumber = lastCycle ? lastCycle.cycleNumber + 1 : 1

    // Check if last cycle was completed (if exists)
    if (lastCycle && !lastCycle.completedAt) {
      return NextResponse.json(
        { error: 'Previous cycle is not yet complete' },
        { status: 400 }
      )
    }

    // Check if we've reached the target cycles
    if (lastCycle && lastCycle.cycleNumber >= puzzleSet.targetCycles) {
      return NextResponse.json(
        { error: 'All target cycles have been completed' },
        { status: 400 }
      )
    }

    // Create new cycle
    const cycle = await prisma.cycle.create({
      data: {
        puzzleSetId: setId,
        cycleNumber: nextCycleNumber,
        totalPuzzles: puzzleSet.puzzles.length,
        startedAt: new Date(),
      },
    })

    return NextResponse.json({
      cycle: {
        id: cycle.id,
        cycleNumber: cycle.cycleNumber,
        totalPuzzles: cycle.totalPuzzles,
        startedAt: cycle.startedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error creating cycle:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/training/puzzle-sets/[setId]/cycles
 * Returns all cycles for a puzzle set.
 */
export async function GET(request: NextRequest, context: RouteContext) {
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

    // Get the puzzle set and verify ownership
    const puzzleSet = await prisma.puzzleSet.findUnique({
      where: { id: setId },
    })

    if (!puzzleSet) {
      return NextResponse.json({ error: 'Puzzle set not found' }, { status: 404 })
    }

    if (puzzleSet.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all cycles
    const cycles = await prisma.cycle.findMany({
      where: { puzzleSetId: setId },
      orderBy: { cycleNumber: 'asc' },
    })

    return NextResponse.json({
      cycles: cycles.map(c => ({
        id: c.id,
        cycleNumber: c.cycleNumber,
        totalPuzzles: c.totalPuzzles,
        solvedCorrect: c.solvedCorrect,
        solvedIncorrect: c.solvedIncorrect,
        skipped: c.skipped,
        totalTime: c.totalTime,
        startedAt: c.startedAt.toISOString(),
        completedAt: c.completedAt?.toISOString() || null,
      })),
    })
  } catch (error) {
    console.error('Error fetching cycles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
