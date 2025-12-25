/**
 * XP Engine
 *
 * Core business logic for calculating and awarding XP.
 */

import {
  XP_VALUES,
  XpBreakdownItem,
  XpGainResult,
  calculateRatingBonus,
  calculateStreakBonus,
  calculateCycleAccuracyMultiplier,
  getLevelFromXp,
} from './definitions'

// =============================================================================
// Types
// =============================================================================

export interface PuzzleAttemptContext {
  /** Whether the puzzle was solved correctly */
  isCorrect: boolean

  /** Time spent solving in milliseconds */
  timeSpentMs: number

  /** The puzzle's rating */
  puzzleRating: number

  /** User's current streak (days) */
  currentStreak: number

  /** Whether this is the first attempt on this puzzle ever */
  isFirstAttempt: boolean

  /** Previous attempt data (if exists) */
  previousAttempt?: {
    isCorrect: boolean
    timeSpentMs: number
  }

  /** User's current total XP (before this attempt) */
  currentTotalXp: number
}

export interface CycleCompleteContext {
  /** Number of puzzles solved correctly */
  solvedCorrect: number

  /** Total puzzles in the cycle */
  totalPuzzles: number

  /** User's current total XP (before this cycle completion) */
  currentTotalXp: number
}

// =============================================================================
// XP Calculation Functions
// =============================================================================

/**
 * Calculate XP gained from a puzzle attempt
 */
export function calculatePuzzleAttemptXp(context: PuzzleAttemptContext): XpGainResult {
  const breakdown: XpBreakdownItem[] = []
  let totalXp = 0

  // Only award XP for correct answers
  if (!context.isCorrect) {
    return {
      totalXp: 0,
      breakdown: [],
      newTotalXp: context.currentTotalXp,
      previousLevel: getLevelFromXp(context.currentTotalXp),
      newLevel: getLevelFromXp(context.currentTotalXp),
      leveledUp: false,
    }
  }

  // Base XP for correct puzzle
  breakdown.push({
    source: 'PUZZLE_CORRECT',
    amount: XP_VALUES.PUZZLE_CORRECT,
    label: 'Correct answer',
  })
  totalXp += XP_VALUES.PUZZLE_CORRECT

  // Rating bonus
  const ratingBonus = calculateRatingBonus(context.puzzleRating)
  if (ratingBonus > 0) {
    breakdown.push({
      source: 'PUZZLE_RATING_BONUS',
      amount: ratingBonus,
      label: `Puzzle rating (${context.puzzleRating})`,
    })
    totalXp += ratingBonus
  }

  // Speed bonus (under 10 seconds)
  if (context.timeSpentMs < XP_VALUES.SPEED_BONUS_THRESHOLD_MS) {
    breakdown.push({
      source: 'SPEED_BONUS',
      amount: XP_VALUES.SPEED_BONUS,
      label: 'Speed bonus',
    })
    totalXp += XP_VALUES.SPEED_BONUS
  }

  // Streak bonus
  if (context.currentStreak > 0) {
    const streakBonus = calculateStreakBonus(context.currentStreak)
    if (streakBonus > 0) {
      breakdown.push({
        source: 'STREAK_BONUS',
        amount: streakBonus,
        label: `${context.currentStreak} day streak`,
      })
      totalXp += streakBonus
    }
  }

  // First attempt bonus
  if (context.isFirstAttempt) {
    breakdown.push({
      source: 'FIRST_ATTEMPT_BONUS',
      amount: XP_VALUES.FIRST_ATTEMPT_BONUS,
      label: 'First attempt',
    })
    totalXp += XP_VALUES.FIRST_ATTEMPT_BONUS
  }

  // Improvement bonus (correct when previously wrong, or faster when previously correct)
  if (context.previousAttempt) {
    const wasImprovement =
      (!context.previousAttempt.isCorrect && context.isCorrect) ||
      (context.previousAttempt.isCorrect && context.timeSpentMs < context.previousAttempt.timeSpentMs)

    if (wasImprovement) {
      breakdown.push({
        source: 'IMPROVEMENT_BONUS',
        amount: XP_VALUES.IMPROVEMENT_BONUS,
        label: 'Improvement',
      })
      totalXp += XP_VALUES.IMPROVEMENT_BONUS
    }
  }

  const newTotalXp = context.currentTotalXp + totalXp
  const previousLevel = getLevelFromXp(context.currentTotalXp)
  const newLevel = getLevelFromXp(newTotalXp)

  return {
    totalXp,
    breakdown,
    newTotalXp,
    previousLevel,
    newLevel,
    leveledUp: newLevel > previousLevel,
  }
}

/**
 * Calculate XP gained from completing a cycle
 */
export function calculateCycleCompleteXp(context: CycleCompleteContext): XpGainResult {
  const breakdown: XpBreakdownItem[] = []
  let totalXp = 0

  // Base cycle completion XP
  breakdown.push({
    source: 'CYCLE_COMPLETE',
    amount: XP_VALUES.CYCLE_COMPLETE,
    label: 'Cycle complete',
  })
  totalXp += XP_VALUES.CYCLE_COMPLETE

  // Accuracy bonus
  const { bonusXp } = calculateCycleAccuracyMultiplier(context.solvedCorrect, context.totalPuzzles)

  if (bonusXp > 0) {
    const accuracy = Math.round((context.solvedCorrect / context.totalPuzzles) * 100)
    breakdown.push({
      source: 'CYCLE_ACCURACY_BONUS',
      amount: bonusXp,
      label: `${accuracy}% accuracy bonus`,
    })
    totalXp += bonusXp
  }

  const newTotalXp = context.currentTotalXp + totalXp
  const previousLevel = getLevelFromXp(context.currentTotalXp)
  const newLevel = getLevelFromXp(newTotalXp)

  return {
    totalXp,
    breakdown,
    newTotalXp,
    previousLevel,
    newLevel,
    leveledUp: newLevel > previousLevel,
  }
}

/**
 * Combine multiple XP gains (e.g., puzzle attempt + cycle completion)
 */
export function combineXpGains(gains: XpGainResult[]): XpGainResult {
  if (gains.length === 0) {
    return {
      totalXp: 0,
      breakdown: [],
      newTotalXp: 0,
      previousLevel: 1,
      newLevel: 1,
      leveledUp: false,
    }
  }

  const allBreakdown: XpBreakdownItem[] = []
  let totalXp = 0

  for (const gain of gains) {
    allBreakdown.push(...gain.breakdown)
    totalXp += gain.totalXp
  }

  // Use first gain's previous level and last gain's new level
  const previousLevel = gains[0].previousLevel
  const newLevel = gains[gains.length - 1].newLevel

  return {
    totalXp,
    breakdown: allBreakdown,
    newTotalXp: gains[gains.length - 1].newTotalXp,
    previousLevel,
    newLevel,
    leveledUp: newLevel > previousLevel,
  }
}
