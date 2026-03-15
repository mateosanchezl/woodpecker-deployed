import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSelectedAppUserByClerkId } from '@/lib/ensure-user'
import { formatStreakResponse, getStreakStatus } from '@/lib/streak'
import { withRouteMetrics } from '@/lib/metrics/request-metrics'

/**
 * GET /api/user/streak
 * Returns the current user's streak data.
 */
export async function GET() {
  return withRouteMetrics('user.streak.get', async () => {
    try {
      const { userId: clerkId } = await auth()
      if (!clerkId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const user = await getSelectedAppUserByClerkId(clerkId, {
        currentStreak: true,
        longestStreak: true,
        lastTrainedDate: true,
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const status = getStreakStatus(
        user.lastTrainedDate,
        user.currentStreak
      )

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
  })
}
