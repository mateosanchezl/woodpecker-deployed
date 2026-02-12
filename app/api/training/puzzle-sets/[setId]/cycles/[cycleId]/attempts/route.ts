import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { attemptSchema } from '@/lib/validations/training'
import { calculateStreakUpdate, getTodayUTC } from '@/lib/streak'
import { getISOWeekStart, isSameISOWeek } from '@/lib/leaderboard'
import {
  checkAllAchievements,
  type UnlockedAchievement,
  type AchievementContext,
} from '@/lib/achievements'
import {
  calculatePuzzleAttemptXp,
  calculateCycleCompleteXp,
  combineXpGains,
  getLevelFromXp,
  type XpGainResult,
} from '@/lib/xp'

interface RouteContext {
  params: Promise<{ setId: string; cycleId: string }>
}

/**
 * POST /api/training/puzzle-sets/[setId]/cycles/[cycleId]/attempts
 * Records a puzzle attempt.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { setId, cycleId } = await context.params

    // Parse and validate request body
    const body = await request.json()
    const validation = attemptSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.message },
        { status: 400 }
      )
    }

    const { puzzleInSetId, timeSpent, isCorrect, wasSkipped, movesPlayed } =
      validation.data

    // Get the user (select only fields needed for this route)
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        totalCorrectAttempts: true,
        weeklyCorrectAttempts: true,
        weeklyCorrectStartDate: true,
        totalXp: true,
        weeklyXp: true,
        weeklyXpStartDate: true,
        currentStreak: true,
        longestStreak: true,
        lastTrainedDate: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Run all pre-checks in parallel (4 queries, 1 DB round trip)
    const [puzzleInSet, cycle, existingAttempt, puzzleSetOwnership] =
      await Promise.all([
        prisma.puzzleInSet.findUnique({
          where: { id: puzzleInSetId },
          include: {
            puzzle: {
              select: { themes: true, rating: true },
            },
            attempts: {
              orderBy: { attemptedAt: 'desc' as const },
              take: 1,
              select: { isCorrect: true, timeSpent: true },
            },
          },
        }),
        prisma.cycle.findUnique({
          where: { id: cycleId },
        }),
        prisma.attempt.findFirst({
          where: { cycleId, puzzleInSetId },
        }),
        prisma.puzzleSet.findFirst({
          where: { id: setId, userId: user.id },
          select: { id: true },
        }),
      ])

    // Validate puzzle set ownership (covers both "not found" and "not owned")
    if (!puzzleSetOwnership) {
      return NextResponse.json(
        { error: 'Puzzle set not found' },
        { status: 404 }
      )
    }

    // Validate cycle
    if (!cycle) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 })
    }

    if (cycle.puzzleSetId !== setId) {
      return NextResponse.json(
        { error: 'Cycle does not belong to this puzzle set' },
        { status: 400 }
      )
    }

    // Validate puzzleInSet
    if (!puzzleInSet) {
      return NextResponse.json(
        { error: 'Puzzle not found in set' },
        { status: 404 }
      )
    }

    if (puzzleInSet.puzzleSetId !== setId) {
      return NextResponse.json(
        { error: 'Puzzle does not belong to this set' },
        { status: 400 }
      )
    }

    // Reject duplicate attempts
    if (existingAttempt) {
      return NextResponse.json(
        { error: 'Attempt already recorded for this puzzle in this cycle' },
        { status: 400 }
      )
    }

    // Use a transaction to update all related records atomically
    const result = await prisma.$transaction(async tx => {
      // Create the attempt
      const attempt = await tx.attempt.create({
        data: {
          cycleId,
          puzzleInSetId,
          timeSpent,
          isCorrect,
          wasSkipped,
          movesPlayed,
        },
      })

      // Update PuzzleInSet aggregate stats
      const newTotalAttempts = puzzleInSet.totalAttempts + 1
      const newCorrectAttempts = isCorrect
        ? puzzleInSet.correctAttempts + 1
        : puzzleInSet.correctAttempts

      // Calculate new average time
      const currentTotal = (puzzleInSet.averageTime || 0) * puzzleInSet.totalAttempts
      const newAverageTime = (currentTotal + timeSpent) / newTotalAttempts

      await tx.puzzleInSet.update({
        where: { id: puzzleInSetId },
        data: {
          totalAttempts: newTotalAttempts,
          correctAttempts: newCorrectAttempts,
          averageTime: newAverageTime,
        },
      })

      // Update cycle stats
      const cycleUpdateData: {
        solvedCorrect?: { increment: number }
        solvedIncorrect?: { increment: number }
        skipped?: { increment: number }
        totalTime?: number
        completedAt?: Date
      } = {}

      if (wasSkipped) {
        cycleUpdateData.skipped = { increment: 1 }
      } else if (isCorrect) {
        cycleUpdateData.solvedCorrect = { increment: 1 }
      } else {
        cycleUpdateData.solvedIncorrect = { increment: 1 }
      }

      // Update total time
      const newTotalTime = (cycle.totalTime || 0) + timeSpent
      cycleUpdateData.totalTime = newTotalTime

      // Check if this is the last puzzle
      const totalAttempts =
        cycle.solvedCorrect +
        cycle.solvedIncorrect +
        cycle.skipped +
        1 // +1 for current attempt

      const isLastPuzzle = totalAttempts >= cycle.totalPuzzles
      if (isLastPuzzle) {
        cycleUpdateData.completedAt = new Date()
      }

      const updatedCycle = await tx.cycle.update({
        where: { id: cycleId },
        data: cycleUpdateData,
      })

      // Update user's streak
      const streakResult = calculateStreakUpdate(
        user.lastTrainedDate,
        user.currentStreak,
        user.longestStreak
      )

      // Build user update data
      const userUpdateData: {
        currentStreak?: number
        longestStreak?: number
        lastTrainedDate?: Date
        streakUpdatedAt?: Date
        totalCorrectAttempts?: { increment: number }
        weeklyCorrectAttempts?: number | { increment: number }
        weeklyCorrectStartDate?: Date
        totalXp?: number
        currentLevel?: number
        weeklyXp?: number | { increment: number }
        weeklyXpStartDate?: Date
      } = {}

      // Only update streak if it changed (i.e., first attempt of the day)
      if (streakResult.streakIncremented) {
        userUpdateData.currentStreak = streakResult.newStreak
        userUpdateData.longestStreak = streakResult.newLongestStreak
        userUpdateData.lastTrainedDate = getTodayUTC()
        userUpdateData.streakUpdatedAt = new Date()
      }

      // Update leaderboard stats if correct attempt
      if (isCorrect) {
        userUpdateData.totalCorrectAttempts = { increment: 1 }

        const currentWeekStart = getISOWeekStart(new Date())
        const needsWeeklyReset =
          !user.weeklyCorrectStartDate ||
          !isSameISOWeek(user.weeklyCorrectStartDate, new Date())

        if (needsWeeklyReset) {
          userUpdateData.weeklyCorrectAttempts = 1
        } else {
          userUpdateData.weeklyCorrectAttempts = { increment: 1 }
        }
        userUpdateData.weeklyCorrectStartDate = currentWeekStart
      }

      // Calculate XP for this puzzle attempt
      const previousAttempt = puzzleInSet.attempts[0]
      const puzzleXpResult = calculatePuzzleAttemptXp({
        isCorrect,
        timeSpentMs: timeSpent,
        puzzleRating: puzzleInSet.puzzle.rating,
        currentStreak: streakResult.streakIncremented
          ? streakResult.newStreak
          : user.currentStreak,
        isFirstAttempt: puzzleInSet.totalAttempts === 0,
        previousAttempt: previousAttempt
          ? {
              isCorrect: previousAttempt.isCorrect,
              timeSpentMs: previousAttempt.timeSpent,
            }
          : undefined,
        currentTotalXp: user.totalXp,
      })

      // Calculate cycle completion XP if this is the last puzzle
      let cycleXpResult: XpGainResult | null = null
      if (isLastPuzzle) {
        const updatedCorrect = isCorrect
          ? updatedCycle.solvedCorrect
          : updatedCycle.solvedCorrect
        cycleXpResult = calculateCycleCompleteXp({
          solvedCorrect: updatedCorrect,
          totalPuzzles: updatedCycle.totalPuzzles,
          currentTotalXp: puzzleXpResult.newTotalXp,
        })
      }

      // Combine XP gains
      const xpGains = cycleXpResult
        ? combineXpGains([puzzleXpResult, cycleXpResult])
        : puzzleXpResult

      // Update XP if any was earned
      if (xpGains.totalXp > 0) {
        userUpdateData.totalXp = xpGains.newTotalXp
        userUpdateData.currentLevel = getLevelFromXp(xpGains.newTotalXp)

        // Update weekly XP
        const currentWeekStart = getISOWeekStart(new Date())
        const needsWeeklyXpReset =
          !user.weeklyXpStartDate ||
          !isSameISOWeek(user.weeklyXpStartDate, new Date())

        if (needsWeeklyXpReset) {
          userUpdateData.weeklyXp = xpGains.totalXp
        } else {
          userUpdateData.weeklyXp = { increment: xpGains.totalXp }
        }
        userUpdateData.weeklyXpStartDate = currentWeekStart
      }

      // Update user if there are any changes
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: userUpdateData,
        })
      }

      return {
        attempt,
        updatedCycle,
        isLastPuzzle,
        streakResult,
        xpGains,
      }
    })

    // Check achievements (outside transaction for performance)
    // Build post-transaction user counters for achievement context
    const postTxTotalCorrect = isCorrect
      ? user.totalCorrectAttempts + 1
      : user.totalCorrectAttempts

    const currentWeekStartForAch = getISOWeekStart(new Date())
    const needsWeeklyResetForAch =
      !user.weeklyCorrectStartDate ||
      !isSameISOWeek(user.weeklyCorrectStartDate, new Date())
    const postTxWeeklyCorrect = !isCorrect
      ? (needsWeeklyResetForAch ? 0 : user.weeklyCorrectAttempts)
      : needsWeeklyResetForAch
        ? 1
        : user.weeklyCorrectAttempts + 1

    const needsWeeklyXpResetForAch =
      !user.weeklyXpStartDate ||
      !isSameISOWeek(user.weeklyXpStartDate, new Date())
    const postTxWeeklyXp =
      result.xpGains.totalXp === 0
        ? (needsWeeklyXpResetForAch ? 0 : user.weeklyXp)
        : needsWeeklyXpResetForAch
          ? result.xpGains.totalXp
          : user.weeklyXp + result.xpGains.totalXp

    const achievementCtx: AchievementContext = {
      userId: user.id,
      attempt: {
        isCorrect,
        timeSpentMs: timeSpent,
        attemptedAt: new Date(),
        puzzleThemes: puzzleInSet.puzzle.themes,
        puzzleRating: puzzleInSet.puzzle.rating,
      },
      user: {
        totalCorrectAttempts: postTxTotalCorrect,
        weeklyCorrectAttempts: postTxWeeklyCorrect,
        totalXp: result.xpGains.newTotalXp,
        weeklyXp: postTxWeeklyXp,
      },
    }

    // Add cycle-complete context if this was the last puzzle
    if (result.isLastPuzzle) {
      const cycleAccuracy =
        (result.updatedCycle.solvedCorrect / result.updatedCycle.totalPuzzles) * 100
      achievementCtx.cycleComplete = {
        puzzleSetId: setId,
        cycleNumber: cycle.cycleNumber,
        accuracy: cycleAccuracy,
        totalPuzzles: result.updatedCycle.totalPuzzles,
        correctPuzzles: result.updatedCycle.solvedCorrect,
      }
    }

    // Add streak context if streak was updated
    if (result.streakResult.streakIncremented) {
      achievementCtx.streak = {
        currentStreak: result.streakResult.newStreak,
        longestStreak: result.streakResult.newLongestStreak,
      }
    }

    const { newlyUnlocked: allUnlockedAchievements } =
      await checkAllAchievements(achievementCtx)

    return NextResponse.json({
      attempt: {
        id: result.attempt.id,
        timeSpent: result.attempt.timeSpent,
        isCorrect: result.attempt.isCorrect,
        wasSkipped: result.attempt.wasSkipped,
      },
      cycleStats: {
        solvedCorrect: result.updatedCycle.solvedCorrect,
        solvedIncorrect: result.updatedCycle.solvedIncorrect,
        skipped: result.updatedCycle.skipped,
        totalTime: result.updatedCycle.totalTime,
      },
      isLastPuzzle: result.isLastPuzzle,
      streak: {
        current: result.streakResult.newStreak,
        longest: result.streakResult.newLongestStreak,
        incremented: result.streakResult.streakIncremented,
        broken: result.streakResult.streakBroken,
        isNewRecord: result.streakResult.isNewRecord,
      },
      xp: {
        gained: result.xpGains.totalXp,
        breakdown: result.xpGains.breakdown,
        newTotal: result.xpGains.newTotalXp,
        previousLevel: result.xpGains.previousLevel,
        newLevel: result.xpGains.newLevel,
        leveledUp: result.xpGains.leveledUp,
      },
      unlockedAchievements: allUnlockedAchievements.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        unlockedAt: a.unlockedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Error recording attempt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
