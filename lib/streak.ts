/**
 * Streak calculation utilities for tracking daily training consistency.
 * Uses UTC dates for consistency across timezones.
 */

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastTrainedDate: Date | null
  isActiveToday: boolean
  isAtRisk: boolean // True if user hasn't trained today but streak is active
}

export interface StreakUpdateResult {
  newStreak: number
  newLongestStreak: number
  streakIncremented: boolean
  streakBroken: boolean
  isNewRecord: boolean
}

/**
 * Get the UTC date string (YYYY-MM-DD) from a Date object.
 * This normalizes dates to compare training across days.
 */
export function getUTCDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get the current UTC date as a Date object (midnight UTC).
 */
export function getTodayUTC(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

/**
 * Get yesterday's UTC date as a Date object (midnight UTC).
 */
export function getYesterdayUTC(): Date {
  const today = getTodayUTC()
  return new Date(today.getTime() - 24 * 60 * 60 * 1000)
}

/**
 * Calculate the number of days between two dates (in UTC days).
 */
export function daysBetween(date1: Date, date2: Date): number {
  const d1 = new Date(Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate()))
  const d2 = new Date(Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate()))
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.floor(diffTime / (24 * 60 * 60 * 1000))
}

/**
 * Check if a date is today (UTC).
 */
export function isToday(date: Date): boolean {
  return getUTCDateString(date) === getUTCDateString(new Date())
}

/**
 * Check if a date is yesterday (UTC).
 */
export function isYesterday(date: Date): boolean {
  const yesterday = getYesterdayUTC()
  return getUTCDateString(date) === getUTCDateString(yesterday)
}

/**
 * Calculate the streak update when a user trains.
 * Returns the new streak values and whether milestones were reached.
 */
export function calculateStreakUpdate(
  lastTrainedDate: Date | null,
  currentStreak: number,
  longestStreak: number,
  now: Date = new Date()
): StreakUpdateResult {
  // If no previous training, start a new streak
  if (!lastTrainedDate) {
    return {
      newStreak: 1,
      newLongestStreak: Math.max(1, longestStreak),
      streakIncremented: true,
      streakBroken: false,
      isNewRecord: longestStreak === 0,
    }
  }

  const daysDiff = daysBetween(lastTrainedDate, now)

  // Already trained today - no change
  if (daysDiff === 0) {
    return {
      newStreak: currentStreak,
      newLongestStreak: longestStreak,
      streakIncremented: false,
      streakBroken: false,
      isNewRecord: false,
    }
  }

  // Trained yesterday - continue streak
  if (daysDiff === 1) {
    const newStreak = currentStreak + 1
    const isNewRecord = newStreak > longestStreak
    return {
      newStreak,
      newLongestStreak: Math.max(newStreak, longestStreak),
      streakIncremented: true,
      streakBroken: false,
      isNewRecord,
    }
  }

  // More than 1 day gap - streak broken, start fresh
  return {
    newStreak: 1,
    newLongestStreak: longestStreak,
    streakIncremented: true,
    streakBroken: currentStreak > 0,
    isNewRecord: false,
  }
}

/**
 * Get the current streak status without modifying anything.
 * Used for display purposes.
 */
export function getStreakStatus(
  lastTrainedDate: Date | null,
  currentStreak: number,
  now: Date = new Date()
): { isActiveToday: boolean; isAtRisk: boolean; daysSinceLastTrain: number } {
  if (!lastTrainedDate) {
    return {
      isActiveToday: false,
      isAtRisk: false,
      daysSinceLastTrain: -1, // Never trained
    }
  }

  const daysDiff = daysBetween(lastTrainedDate, now)

  return {
    isActiveToday: daysDiff === 0,
    isAtRisk: daysDiff === 1 && currentStreak > 0, // Has streak but hasn't trained today
    daysSinceLastTrain: daysDiff,
  }
}

/**
 * Format streak data for API response.
 */
export function formatStreakResponse(
  currentStreak: number,
  longestStreak: number,
  lastTrainedDate: Date | null
): StreakData {
  const status = getStreakStatus(lastTrainedDate, currentStreak)

  return {
    currentStreak,
    longestStreak,
    lastTrainedDate,
    isActiveToday: status.isActiveToday,
    isAtRisk: status.isAtRisk,
  }
}
