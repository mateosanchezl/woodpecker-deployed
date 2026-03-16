import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { withUserProvisionFallback } from '@/lib/ensure-user'
import { formatStreakResponse, getStreakStatus } from '@/lib/streak'

/**
 * GET /api/user/streak
 * Deprecated compatibility shim. The app now reads streak data from /api/bootstrap.
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await withUserProvisionFallback(clerkId, () =>
      prisma.user.findUnique({
        where: { clerkId },
        select: {
          currentStreak: true,
          longestStreak: true,
          lastTrainedDate: true,
        },
      })
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const status = getStreakStatus(user.lastTrainedDate, user.currentStreak)

    const effectiveStreak = status.daysSinceLastTrain > 1 ? 0 : user.currentStreak

    return NextResponse.json(
      formatStreakResponse(
        effectiveStreak,
        user.longestStreak,
        user.lastTrainedDate
      )
    )
  } catch (error) {
    console.error('Error fetching streak:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
