import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

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

    // Get all puzzle sets with their latest cycle
    const puzzleSets = await prisma.puzzleSet.findMany({
      where: { userId: user.id },
      include: {
        cycles: {
          orderBy: { cycleNumber: 'desc' },
          take: 1,
        },
        _count: {
          select: { puzzles: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      sets: puzzleSets.map(set => {
        const latestCycle = set.cycles[0]
        const isCurrentCycleComplete = latestCycle?.completedAt !== null

        return {
          id: set.id,
          name: set.name,
          size: set._count.puzzles,
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
            ? latestCycle.cycleNumber
            : (latestCycle?.cycleNumber || 1) - 1,
        }
      }),
    })
  } catch (error) {
    console.error('Error fetching puzzle sets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
