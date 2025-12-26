import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { leaderboardQuerySchema } from '@/lib/validations/leaderboard'
import { getISOWeekStart } from '@/lib/leaderboard'
import type { LeaderboardEntry, LeaderboardResponse } from '@/lib/validations/leaderboard'

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate query params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const parseResult = leaderboardQuerySchema.safeParse(searchParams)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { period, limit, offset } = parseResult.data

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        name: true,
        estimatedRating: true,
        showOnLeaderboard: true,
        totalCorrectAttempts: true,
        weeklyCorrectAttempts: true,
        weeklyCorrectStartDate: true,
        totalXp: true,
        currentLevel: true,
        weeklyXp: true,
        weeklyXpStartDate: true,
      },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentWeekStart = getISOWeekStart(new Date())
    const isWeekly = period === 'weekly'

    // Build the where clause based on period (ranked by XP)
    const whereClause = isWeekly
      ? {
          showOnLeaderboard: true,
          weeklyXp: { gt: 0 },
          weeklyXpStartDate: { gte: currentWeekStart },
        }
      : {
          showOnLeaderboard: true,
          totalXp: { gt: 0 },
        }

    // Get total count for pagination
    const total = await prisma.user.count({ where: whereClause })

    // Get leaderboard entries (ranked by XP)
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        estimatedRating: true,
        totalCorrectAttempts: true,
        weeklyCorrectAttempts: true,
        totalXp: true,
        currentLevel: true,
        weeklyXp: true,
      },
      orderBy: isWeekly ? { weeklyXp: 'desc' } : { totalXp: 'desc' },
      take: limit,
      skip: offset,
    })

    // Transform to entries with rank
    const entries: LeaderboardEntry[] = users.map((user: typeof users[number], index: number) => ({
      rank: offset + index + 1,
      userId: user.id,
      name: user.name,
      xp: isWeekly ? user.weeklyXp : user.totalXp,
      level: user.currentLevel,
      puzzlesSolved: isWeekly ? user.weeklyCorrectAttempts : user.totalCorrectAttempts,
      estimatedRating: user.estimatedRating,
      isCurrentUser: user.id === currentUser.id,
    }))

    // Calculate current user's rank if they're not in the current page
    let currentUserData: LeaderboardResponse['currentUser'] = null

    // Get current user's XP for this period
    const currentUserXp = isWeekly
      ? currentUser.weeklyXpStartDate &&
        currentUser.weeklyXpStartDate >= currentWeekStart
        ? currentUser.weeklyXp
        : 0
      : currentUser.totalXp

    // Get current user's puzzles solved for this period
    const currentUserPuzzles = isWeekly
      ? currentUser.weeklyCorrectStartDate &&
        currentUser.weeklyCorrectStartDate >= currentWeekStart
        ? currentUser.weeklyCorrectAttempts
        : 0
      : currentUser.totalCorrectAttempts

    if (currentUserXp > 0) {
      // Count users with higher XP to get rank
      const usersAhead = await prisma.user.count({
        where: {
          ...whereClause,
          [isWeekly ? 'weeklyXp' : 'totalXp']: {
            gt: currentUserXp,
          },
        },
      })

      const rank = usersAhead + 1

      currentUserData = {
        rank: currentUser.showOnLeaderboard ? rank : null,
        entry: {
          rank,
          userId: currentUser.id,
          name: currentUser.name,
          xp: currentUserXp,
          level: currentUser.currentLevel,
          puzzlesSolved: currentUserPuzzles,
          estimatedRating: currentUser.estimatedRating,
          isCurrentUser: true,
        },
      }
    } else {
      currentUserData = {
        rank: null,
        entry: null,
      }
    }

    const response: LeaderboardResponse = {
      entries,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      currentUser: currentUserData,
      period,
      ...(isWeekly && { weekStartDate: currentWeekStart.toISOString() }),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
