import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { formatStreakResponse, getStreakStatus } from '@/lib/streak'

/**
 * GET /api/user/streak
 * Returns the current user's streak data.
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastTrainedDate: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if streak is still valid (hasn't been broken since last calculation)
    const status = getStreakStatus(
      user.lastTrainedDate,
      user.currentStreak
    )

    // If more than 1 day has passed since last training, streak is broken
    // But we don't update the DB here - we just report the effective streak
    let effectiveStreak = user.currentStreak
    if (status.daysSinceLastTrain > 1) {
      effectiveStreak = 0
    }

    const response = formatStreakResponse(
      effectiveStreak,
      user.longestStreak,
      user.lastTrainedDate
    )

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching streak:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
