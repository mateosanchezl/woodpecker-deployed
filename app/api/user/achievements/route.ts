import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  checkRisingStarAchievementByClerkId,
  getUserAchievementsByClerkId,
} from '@/lib/achievements'
import { withRouteMetrics } from '@/lib/metrics/request-metrics'

/**
 * GET /api/user/achievements
 * Returns all achievements with the user's unlock status
 */
export async function GET() {
  return withRouteMetrics('user.achievements.get', async () => {
    try {
      const { userId: clerkId } = await auth()
      if (!clerkId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { achievements, totalUnlocked, totalAchievements } =
        await getUserAchievementsByClerkId(clerkId)

      const formattedAchievements = achievements.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        category: a.category,
        icon: a.icon,
        unlockedAt: a.unlockedAt?.toISOString() ?? null,
        isUnlocked: a.isUnlocked,
      }))

      setImmediate(() => {
        checkRisingStarAchievementByClerkId(clerkId).catch((error) => {
          console.error('Error checking rising-star achievement:', error)
        })
      })

      return NextResponse.json({
        achievements: formattedAchievements,
        totalUnlocked,
        totalAchievements,
      })
    } catch (error) {
      console.error('Error fetching achievements:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}
