import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { ensureUserExists } from '@/lib/ensure-user'
import { quickStartRequestSchema } from '@/lib/validations/training'

/**
 * POST /api/training/quick-start
 * Creates a starter puzzle set and an initial cycle for first-time users.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let user = await prisma.user.findUnique({
      where: { clerkId },
    })

    if (!user) {
      user = await ensureUserExists(clerkId)
    }

    let body: unknown = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const validation = quickStartRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.message },
        { status: 400 }
      )
    }

    const { estimatedRating } = validation.data
    if (estimatedRating !== undefined && estimatedRating !== user.estimatedRating) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { estimatedRating },
      })
    }

    const targetRating = Math.max(800, user.estimatedRating - 200)
    const ratingRange = 200
    const size = Math.max(50, Math.min(user.preferredSetSize, 100))
    const targetCycles = user.targetCycles

    const minRating = Math.max(800, targetRating - Math.floor(ratingRange / 2))
    const maxRating = Math.min(2600, targetRating + Math.floor(ratingRange / 2))

    const puzzles = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Puzzle"
      WHERE rating >= ${minRating} AND rating <= ${maxRating}
      ORDER BY RANDOM()
      LIMIT ${size}
    `

    if (puzzles.length < size) {
      return NextResponse.json(
        {
          error: 'Not enough puzzles available',
          details: `Found ${puzzles.length} puzzles in rating range ${minRating}-${maxRating}, but ${size} requested.`,
        },
        { status: 400 }
      )
    }

    const { puzzleSet, cycle } = await prisma.$transaction(async (tx) => {
      const set = await tx.puzzleSet.create({
        data: {
          userId: user.id,
          name: 'Starter Set',
          targetRating,
          minRating,
          maxRating,
          size,
          targetCycles,
        },
      })

      await tx.puzzleInSet.createMany({
        data: puzzles.map((puzzle, index) => ({
          puzzleSetId: set.id,
          puzzleId: puzzle.id,
          position: index + 1,
        })),
      })

      const newCycle = await tx.cycle.create({
        data: {
          puzzleSetId: set.id,
          cycleNumber: 1,
          totalPuzzles: size,
        },
      })

      if (!user.hasCompletedOnboarding) {
        await tx.user.update({
          where: { id: user.id },
          data: { hasCompletedOnboarding: true },
        })
      }

      return { puzzleSet: set, cycle: newCycle }
    })

    return NextResponse.json({
      puzzleSet: {
        id: puzzleSet.id,
        name: puzzleSet.name,
        size: puzzleSet.size,
        targetRating: puzzleSet.targetRating,
        minRating: puzzleSet.minRating,
        maxRating: puzzleSet.maxRating,
        targetCycles: puzzleSet.targetCycles,
        createdAt: puzzleSet.createdAt.toISOString(),
      },
      cycle: {
        id: cycle.id,
        cycleNumber: cycle.cycleNumber,
        totalPuzzles: cycle.totalPuzzles,
        startedAt: cycle.startedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error creating quick start set:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
