/**
 * XP & Levelling System Definitions
 *
 * This file contains all constants, formulas, and type definitions
 * for the XP and levelling system.
 */

// =============================================================================
// XP Award Values
// =============================================================================

export const XP_VALUES = {
  /** Base XP for solving a puzzle correctly */
  PUZZLE_CORRECT: 10,

  /** Bonus XP for solving under 10 seconds */
  SPEED_BONUS: 5,

  /** Speed bonus threshold in milliseconds */
  SPEED_BONUS_THRESHOLD_MS: 10000,

  /** Bonus XP for first-time correct (puzzle never attempted before) */
  FIRST_ATTEMPT_BONUS: 5,

  /** Bonus XP for improvement (correct when previously wrong, or faster) */
  IMPROVEMENT_BONUS: 10,

  /** Base XP for completing a cycle */
  CYCLE_COMPLETE: 50,

  /** XP per streak day (capped at MAX_STREAK_BONUS_DAYS) */
  STREAK_BONUS_PER_DAY: 2,

  /** Maximum streak days that contribute to bonus */
  MAX_STREAK_BONUS_DAYS: 10,

  /** Base rating for calculating rating bonus (puzzles below this give 0 bonus) */
  RATING_BONUS_BASE: 1000,

  /** Rating points per 1 XP bonus */
  RATING_BONUS_DIVISOR: 100,
} as const

// =============================================================================
// XP Source Types
// =============================================================================

export type XpSourceType =
  | 'PUZZLE_CORRECT'
  | 'PUZZLE_RATING_BONUS'
  | 'SPEED_BONUS'
  | 'STREAK_BONUS'
  | 'FIRST_ATTEMPT_BONUS'
  | 'IMPROVEMENT_BONUS'
  | 'CYCLE_COMPLETE'
  | 'CYCLE_ACCURACY_BONUS'

export interface XpBreakdownItem {
  source: XpSourceType
  amount: number
  label: string
}

export interface XpGainResult {
  totalXp: number
  breakdown: XpBreakdownItem[]
  newTotalXp: number
  previousLevel: number
  newLevel: number
  leveledUp: boolean
}

// =============================================================================
// Level System
// =============================================================================

/**
 * Level progression formula: XP required for level N = 100 × (N^1.5)
 *
 * This creates a smooth exponential curve where early levels are quick
 * but higher levels require significant effort.
 */
export const LEVEL_EXPONENT = 1.5
export const LEVEL_BASE_XP = 100

/**
 * Calculate total XP required to reach a specific level
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(LEVEL_BASE_XP * Math.pow(level, LEVEL_EXPONENT))
}

/**
 * Calculate the level for a given total XP amount
 */
export function getLevelFromXp(totalXp: number): number {
  if (totalXp <= 0) return 1

  // Inverse of the formula: level = (totalXp / 100)^(1/1.5)
  const level = Math.floor(Math.pow(totalXp / LEVEL_BASE_XP, 1 / LEVEL_EXPONENT))

  // Ensure we return at least level 1
  return Math.max(1, level)
}

/**
 * Get XP progress within the current level
 */
export function getLevelProgress(totalXp: number): {
  currentLevel: number
  currentLevelXp: number
  nextLevelXp: number
  xpInCurrentLevel: number
  xpNeededForNextLevel: number
  progressPercent: number
} {
  const currentLevel = getLevelFromXp(totalXp)
  const currentLevelXp = getXpRequiredForLevel(currentLevel)
  const nextLevelXp = getXpRequiredForLevel(currentLevel + 1)

  const xpInCurrentLevel = totalXp - currentLevelXp
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp
  const progressPercent =
    xpNeededForNextLevel > 0
      ? Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100))
      : 100

  return {
    currentLevel,
    currentLevelXp,
    nextLevelXp,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercent,
  }
}

// =============================================================================
// Level Titles
// =============================================================================

export interface LevelTitle {
  minLevel: number
  maxLevel: number
  title: string
  icon: string
}

export const LEVEL_TITLES: LevelTitle[] = [
  { minLevel: 1, maxLevel: 4, title: 'Pawn', icon: '♟️' },
  { minLevel: 5, maxLevel: 9, title: 'Knight', icon: '♞' },
  { minLevel: 10, maxLevel: 19, title: 'Bishop', icon: '♝' },
  { minLevel: 20, maxLevel: 34, title: 'Rook', icon: '♜' },
  { minLevel: 35, maxLevel: 49, title: 'Queen', icon: '♛' },
  { minLevel: 50, maxLevel: Infinity, title: 'Grandmaster', icon: '♚' },
]

/**
 * Get the title and icon for a given level
 */
export function getLevelTitle(level: number): { title: string; icon: string } {
  const titleData = LEVEL_TITLES.find((t) => level >= t.minLevel && level <= t.maxLevel)
  return titleData ? { title: titleData.title, icon: titleData.icon } : { title: 'Pawn', icon: '♟️' }
}

// =============================================================================
// XP Calculation Helpers
// =============================================================================

/**
 * Calculate the rating bonus for a puzzle
 */
export function calculateRatingBonus(puzzleRating: number): number {
  if (puzzleRating <= XP_VALUES.RATING_BONUS_BASE) return 0
  return Math.floor((puzzleRating - XP_VALUES.RATING_BONUS_BASE) / XP_VALUES.RATING_BONUS_DIVISOR)
}

/**
 * Calculate the streak bonus
 */
export function calculateStreakBonus(currentStreak: number): number {
  const cappedStreak = Math.min(currentStreak, XP_VALUES.MAX_STREAK_BONUS_DAYS)
  return cappedStreak * XP_VALUES.STREAK_BONUS_PER_DAY
}

/**
 * Calculate cycle completion bonus based on accuracy
 */
export function calculateCycleAccuracyMultiplier(
  correct: number,
  total: number
): { multiplier: number; bonusXp: number } {
  if (total === 0) return { multiplier: 1, bonusXp: 0 }

  const accuracy = correct / total

  // Accuracy multiplier: 100% = 2x, 90% = 1.5x, 80% = 1.2x, below 80% = 1x
  let multiplier: number
  if (accuracy >= 1) {
    multiplier = 2
  } else if (accuracy >= 0.9) {
    multiplier = 1.5
  } else if (accuracy >= 0.8) {
    multiplier = 1.2
  } else {
    multiplier = 1
  }

  const baseXp = XP_VALUES.CYCLE_COMPLETE
  const bonusXp = Math.floor(baseXp * multiplier) - baseXp

  return { multiplier, bonusXp }
}
