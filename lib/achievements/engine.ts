/**
 * Achievement evaluation engine
 * Checks and unlocks achievements based on user actions
 */

import { prisma } from '@/lib/prisma'
import {
  ACHIEVEMENT_DEFINITIONS,
  type AchievementDefinition,
} from './definitions'

export interface UnlockedAchievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: Date
}

export interface AchievementCheckResult {
  newlyUnlocked: UnlockedAchievement[]
}

/**
 * Context provided when a puzzle attempt is recorded
 */
export interface AttemptContext {
  isCorrect: boolean
  timeSpentMs: number
  attemptedAt: Date
  puzzleThemes: string[]
}

/**
 * Context provided when a cycle is completed
 */
export interface CycleCompleteContext {
  puzzleSetId: string
  cycleNumber: number
  accuracy: number // 0-100
  totalPuzzles: number
  correctPuzzles: number
}

/**
 * Context provided when streak is updated
 */
export interface StreakContext {
  currentStreak: number
  longestStreak: number
}

/**
 * Get user's already unlocked achievement IDs
 */
async function getUserUnlockedAchievementIds(userId: string): Promise<Set<string>> {
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  })
  return new Set(userAchievements.map((ua) => ua.achievementId))
}

/**
 * Unlock achievements for a user
 */
async function unlockAchievements(
  userId: string,
  achievementIds: string[]
): Promise<UnlockedAchievement[]> {
  if (achievementIds.length === 0) return []

  const now = new Date()
  
  // Create user achievements
  await prisma.userAchievement.createMany({
    data: achievementIds.map((achievementId) => ({
      userId,
      achievementId,
      unlockedAt: now,
    })),
    skipDuplicates: true,
  })

  // Return the unlocked achievement details
  return achievementIds.map((id) => {
    const def = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === id)!
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      unlockedAt: now,
    }
  })
}

/**
 * Check puzzle count achievements (first-blood, century)
 */
async function checkPuzzleCountAchievements(
  userId: string,
  unlockedIds: Set<string>
): Promise<string[]> {
  const toUnlock: string[] = []

  // Get total correct attempts for user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalCorrectAttempts: true },
  })

  if (!user) return toUnlock

  const totalCorrect = user.totalCorrectAttempts

  // Check first-blood
  if (!unlockedIds.has('first-blood') && totalCorrect >= 1) {
    toUnlock.push('first-blood')
  }

  // Check century
  if (!unlockedIds.has('century') && totalCorrect >= 100) {
    toUnlock.push('century')
  }

  return toUnlock
}

/**
 * Check speed achievement (speed-demon)
 */
function checkSpeedAchievement(
  context: AttemptContext,
  unlockedIds: Set<string>
): string[] {
  const toUnlock: string[] = []

  if (
    !unlockedIds.has('speed-demon') &&
    context.isCorrect &&
    context.timeSpentMs < 3000
  ) {
    toUnlock.push('speed-demon')
  }

  return toUnlock
}

/**
 * Check time-of-day achievements (early-bird, night-owl)
 */
function checkTimeOfDayAchievements(
  context: AttemptContext,
  unlockedIds: Set<string>
): string[] {
  const toUnlock: string[] = []
  const hour = context.attemptedAt.getHours()

  // Early bird: before 7am
  if (!unlockedIds.has('early-bird') && hour < 7) {
    toUnlock.push('early-bird')
  }

  // Night owl: between midnight and 5am
  if (!unlockedIds.has('night-owl') && hour >= 0 && hour < 5) {
    toUnlock.push('night-owl')
  }

  return toUnlock
}

/**
 * Check theme accuracy achievement (theme-master-fork)
 */
async function checkThemeAccuracyAchievements(
  userId: string,
  context: AttemptContext,
  unlockedIds: Set<string>
): Promise<string[]> {
  const toUnlock: string[] = []

  // Only check if the puzzle has the fork theme
  if (!context.puzzleThemes.includes('fork')) return toUnlock
  if (unlockedIds.has('theme-master-fork')) return toUnlock

  // Get all attempts on fork puzzles for this user
  const forkAttempts = await prisma.attempt.findMany({
    where: {
      puzzleInSet: {
        puzzle: {
          themes: { has: 'fork' },
        },
        puzzleSet: {
          userId,
        },
      },
    },
    select: {
      isCorrect: true,
    },
  })

  const totalAttempts = forkAttempts.length
  const correctAttempts = forkAttempts.filter((a) => a.isCorrect).length

  // Need at least 20 attempts and 90% accuracy
  if (totalAttempts >= 20) {
    const accuracy = (correctAttempts / totalAttempts) * 100
    if (accuracy >= 90) {
      toUnlock.push('theme-master-fork')
    }
  }

  return toUnlock
}

/**
 * Check cycle accuracy achievement (perfectionist)
 */
function checkCycleAccuracyAchievement(
  context: CycleCompleteContext,
  unlockedIds: Set<string>
): string[] {
  const toUnlock: string[] = []

  if (!unlockedIds.has('perfectionist') && context.accuracy === 100) {
    toUnlock.push('perfectionist')
  }

  return toUnlock
}

/**
 * Check cycles same set achievement (woodpecker-pro)
 */
async function checkCyclesSameSetAchievement(
  userId: string,
  context: CycleCompleteContext,
  unlockedIds: Set<string>
): Promise<string[]> {
  const toUnlock: string[] = []

  if (unlockedIds.has('woodpecker-pro')) return toUnlock

  // Count completed cycles for this puzzle set
  const completedCycles = await prisma.cycle.count({
    where: {
      puzzleSetId: context.puzzleSetId,
      completedAt: { not: null },
      puzzleSet: {
        userId,
      },
    },
  })

  if (completedCycles >= 5) {
    toUnlock.push('woodpecker-pro')
  }

  return toUnlock
}

/**
 * Check streak achievements (on-fire, unstoppable)
 */
function checkStreakAchievements(
  context: StreakContext,
  unlockedIds: Set<string>
): string[] {
  const toUnlock: string[] = []
  const streak = Math.max(context.currentStreak, context.longestStreak)

  if (!unlockedIds.has('on-fire') && streak >= 7) {
    toUnlock.push('on-fire')
  }

  if (!unlockedIds.has('unstoppable') && streak >= 30) {
    toUnlock.push('unstoppable')
  }

  return toUnlock
}

/**
 * Check achievements after a puzzle attempt is recorded
 */
export async function checkAchievementsAfterAttempt(
  userId: string,
  context: AttemptContext
): Promise<AchievementCheckResult> {
  const unlockedIds = await getUserUnlockedAchievementIds(userId)
  const toUnlock: string[] = []

  // Only check achievements for correct attempts (except time-of-day)
  if (context.isCorrect) {
    // Check puzzle count achievements
    const puzzleCountAchievements = await checkPuzzleCountAchievements(
      userId,
      unlockedIds
    )
    toUnlock.push(...puzzleCountAchievements)

    // Check speed achievement
    toUnlock.push(...checkSpeedAchievement(context, unlockedIds))

    // Check theme accuracy achievements
    const themeAchievements = await checkThemeAccuracyAchievements(
      userId,
      context,
      unlockedIds
    )
    toUnlock.push(...themeAchievements)
  }

  // Time-of-day achievements apply to any attempt
  toUnlock.push(...checkTimeOfDayAchievements(context, unlockedIds))

  // Unlock the achievements
  const newlyUnlocked = await unlockAchievements(userId, toUnlock)

  return { newlyUnlocked }
}

/**
 * Check achievements after a cycle is completed
 */
export async function checkAchievementsAfterCycleComplete(
  userId: string,
  context: CycleCompleteContext
): Promise<AchievementCheckResult> {
  const unlockedIds = await getUserUnlockedAchievementIds(userId)
  const toUnlock: string[] = []

  // Check cycle accuracy achievement
  toUnlock.push(...checkCycleAccuracyAchievement(context, unlockedIds))

  // Check cycles same set achievement
  const cyclesSameSet = await checkCyclesSameSetAchievement(
    userId,
    context,
    unlockedIds
  )
  toUnlock.push(...cyclesSameSet)

  // Unlock the achievements
  const newlyUnlocked = await unlockAchievements(userId, toUnlock)

  return { newlyUnlocked }
}

/**
 * Check achievements after streak is updated
 */
export async function checkAchievementsAfterStreakUpdate(
  userId: string,
  context: StreakContext
): Promise<AchievementCheckResult> {
  const unlockedIds = await getUserUnlockedAchievementIds(userId)
  const toUnlock: string[] = []

  // Check streak achievements
  toUnlock.push(...checkStreakAchievements(context, unlockedIds))

  // Unlock the achievements
  const newlyUnlocked = await unlockAchievements(userId, toUnlock)

  return { newlyUnlocked }
}

/**
 * Get all achievements with unlock status for a user
 */
export async function getUserAchievements(userId: string): Promise<{
  achievements: Array<
    AchievementDefinition & { unlockedAt: Date | null; isUnlocked: boolean }
  >
  totalUnlocked: number
  totalAchievements: number
}> {
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true, unlockedAt: true },
  })

  const unlockedMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
  )

  const achievements = ACHIEVEMENT_DEFINITIONS.map((def) => ({
    ...def,
    unlockedAt: unlockedMap.get(def.id) ?? null,
    isUnlocked: unlockedMap.has(def.id),
  }))

  return {
    achievements,
    totalUnlocked: userAchievements.length,
    totalAchievements: ACHIEVEMENT_DEFINITIONS.length,
  }
}
