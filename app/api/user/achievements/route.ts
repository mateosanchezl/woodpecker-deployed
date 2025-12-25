import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getUserAchievements } from '@/lib/achievements'

/**
 * GET /api/user/achievements
 * Returns all achievements with the user's unlock status
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { achievements, totalUnlocked, totalAchievements } =
      await getUserAchievements(user.id)

    // Convert Date to ISO string for JSON response
    const formattedAchievements = achievements.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      category: a.category,
      icon: a.icon,
      unlockedAt: a.unlockedAt?.toISOString() ?? null,
      isUnlocked: a.isUnlocked,
    }))

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
}
