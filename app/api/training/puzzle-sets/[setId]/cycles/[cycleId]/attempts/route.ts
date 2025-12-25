import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { attemptSchema } from '@/lib/validations/training'
import { calculateStreakUpdate, getTodayUTC } from '@/lib/streak'
import { getISOWeekStart, isSameISOWeek } from '@/lib/leaderboard'
import {
  checkAchievementsAfterAttempt,
  checkAchievementsAfterCycleComplete,
  checkAchievementsAfterStreakUpdate,
  type UnlockedAchievement,
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

    // Get the user's database ID from their Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify the puzzle set belongs to the user
    const puzzleSet = await prisma.puzzleSet.findUnique({
      where: { id: setId },
      include: {
        puzzles: true,
      },
    })

    if (!puzzleSet) {
      return NextResponse.json({ error: 'Puzzle set not found' }, { status: 404 })
    }

    if (puzzleSet.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify the cycle belongs to this puzzle set
    const cycle = await prisma.cycle.findUnique({
      where: { id: cycleId },
    })

    if (!cycle) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 })
    }

    if (cycle.puzzleSetId !== setId) {
      return NextResponse.json(
        { error: 'Cycle does not belong to this puzzle set' },
        { status: 400 }
      )
    }

    // Verify the puzzleInSet exists and belongs to this set
    const puzzleInSet = await prisma.puzzleInSet.findUnique({
      where: { id: puzzleInSetId },
      include: {
        puzzle: {
          select: { themes: true, rating: true },
        },
        attempts: {
          orderBy: { attemptedAt: 'desc' },
          take: 1,
          select: { isCorrect: true, timeSpent: true },
        },
      },
    })

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

    // Check if an attempt already exists for this puzzle in this cycle
    const existingAttempt = await prisma.attempt.findFirst({
      where: {
        cycleId,
        puzzleInSetId,
      },
    })

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
    const allUnlockedAchievements: UnlockedAchievement[] = []
    const attemptedAt = new Date()

    // Check attempt-related achievements
    const attemptAchievements = await checkAchievementsAfterAttempt(user.id, {
      isCorrect,
      timeSpentMs: timeSpent,
      attemptedAt,
      puzzleThemes: puzzleInSet.puzzle.themes,
    })
    allUnlockedAchievements.push(...attemptAchievements.newlyUnlocked)

    // Check cycle completion achievements
    if (result.isLastPuzzle) {
      const cycleAccuracy =
        (result.updatedCycle.solvedCorrect / result.updatedCycle.totalPuzzles) * 100
      const cycleAchievements = await checkAchievementsAfterCycleComplete(
        user.id,
        {
          puzzleSetId: setId,
          cycleNumber: cycle.cycleNumber,
          accuracy: cycleAccuracy,
          totalPuzzles: result.updatedCycle.totalPuzzles,
          correctPuzzles: result.updatedCycle.solvedCorrect,
        }
      )
      allUnlockedAchievements.push(...cycleAchievements.newlyUnlocked)
    }

    // Check streak achievements if streak was updated
    if (result.streakResult.streakIncremented) {
      const streakAchievements = await checkAchievementsAfterStreakUpdate(
        user.id,
        {
          currentStreak: result.streakResult.newStreak,
          longestStreak: result.streakResult.newLongestStreak,
        }
      )
      allUnlockedAchievements.push(...streakAchievements.newlyUnlocked)
    }

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
