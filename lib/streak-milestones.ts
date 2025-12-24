/**
 * Streak milestone definitions and celebration messages.
 * Following the app's encouraging, warm aesthetic.
 */

export interface Milestone {
  days: number
  title: string
  message: string
  emoji: string
}

export const STREAK_MILESTONES: Milestone[] = [
  { days: 3, title: 'Habit Forming', message: "You're building a habit!", emoji: '🌱' },
  { days: 7, title: 'One Week Strong', message: 'A full week of training!', emoji: '🔥' },
  { days: 14, title: 'Two Weeks', message: 'Two weeks of dedication!', emoji: '⚡' },
  { days: 21, title: 'Three Weeks', message: 'The habit is sticking!', emoji: '🌟' },
  { days: 30, title: 'One Month', message: 'A full month! Incredible!', emoji: '🏆' },
  { days: 50, title: 'Fifty Days', message: 'Fifty days of progress!', emoji: '💪' },
  { days: 100, title: 'Century', message: '100 days! True dedication!', emoji: '💯' },
  { days: 200, title: 'Two Hundred', message: '200 days of excellence!', emoji: '🎯' },
  { days: 365, title: 'Full Year', message: 'A whole year! Legendary!', emoji: '👑' },
]

/**
 * Check if a streak count matches a milestone.
 */
export function getMilestone(streakCount: number): Milestone | null {
  return STREAK_MILESTONES.find((m) => m.days === streakCount) || null
}

/**
 * Get the next milestone for a given streak count.
 */
export function getNextMilestone(streakCount: number): Milestone | null {
  return STREAK_MILESTONES.find((m) => m.days > streakCount) || null
}

/**
 * Get the most recent achieved milestone for a streak count.
 */
export function getCurrentMilestoneTier(streakCount: number): Milestone | null {
  const achieved = STREAK_MILESTONES.filter((m) => m.days <= streakCount)
  return achieved.length > 0 ? achieved[achieved.length - 1] : null
}

/**
 * Get an encouraging message based on streak status.
 */
export function getStreakMessage(
  currentStreak: number,
  isActiveToday: boolean,
  isAtRisk: boolean
): string {
  if (currentStreak === 0) {
    return 'Start your training streak today!'
  }

  if (isActiveToday) {
    const milestone = getMilestone(currentStreak)
    if (milestone) {
      return `${milestone.emoji} ${milestone.message}`
    }

    if (currentStreak === 1) {
      return 'Great start! Come back tomorrow to build your streak.'
    }

    return `${currentStreak}-day streak! Keep it going!`
  }

  if (isAtRisk) {
    return `Train today to keep your ${currentStreak}-day streak alive!`
  }

  // Streak broken
  return 'Starting fresh! Every streak begins with day one.'
}

/**
 * Get a toast message for streak events.
 */
export function getStreakToastMessage(
  newStreak: number,
  isNewRecord: boolean,
  streakBroken: boolean
): { title: string; description: string } | null {
  // Check for milestone
  const milestone = getMilestone(newStreak)
  if (milestone) {
    return {
      title: `${milestone.emoji} ${milestone.title}!`,
      description: milestone.message,
    }
  }

  // New personal record (not on a specific milestone)
  if (isNewRecord && newStreak > 1) {
    return {
      title: 'New Personal Best!',
      description: `${newStreak} days - your longest streak ever!`,
    }
  }

  // Streak was broken but user is starting fresh
  if (streakBroken) {
    return {
      title: 'Fresh Start',
      description: 'New streak started. You got this!',
    }
  }

  // First day of training
  if (newStreak === 1) {
    return {
      title: 'Streak Started!',
      description: 'Come back tomorrow to keep it going.',
    }
  }

  return null
}
