/**
 * Achievement definitions with criteria for evaluation
 */

export type AchievementCategory =
  | 'puzzles'
  | 'streaks'
  | 'speed'
  | 'cycles'
  | 'time'
  | 'themes'
  | 'accuracy'
  | 'mastery'
  | 'leaderboard'

export type AchievementCriteria =
  | { type: 'puzzle_count'; count: number }
  | { type: 'streak_days'; days: number }
  | { type: 'speed_under_ms'; milliseconds: number }
  | { type: 'cycle_accuracy'; percent: number }
  | { type: 'cycles_same_set'; count: number }
  | { type: 'time_of_day'; before?: number; after?: number } // hours in 24h format
  | {
      type: 'theme_accuracy'
      theme: string
      percent: number
      minAttempts: number
    }
  | { type: 'weekly_puzzle_count'; count: number }
  | { type: 'lightning_speed'; milliseconds: number }
  | { type: 'speed_streak'; consecutiveCount: number; maxSeconds: number }
  | { type: 'first_cycle_complete' }
  | { type: 'cycles_same_set_extended'; count: number }
  | { type: 'cycle_time_improvement'; percentReduction: number }
  | { type: 'streak_extended'; days: number }
  | { type: 'cycle_high_accuracy'; percent: number; minPuzzles: number }
  | { type: 'consecutive_correct'; count: number }
  | { type: 'perfect_cycle_strict'; minPuzzles: number }
  | {
      type: 'theme_accuracy_extended'
      theme: string
      percent: number
      minAttempts: number
    }
  | { type: 'overall_accuracy'; percent: number; minAttempts: number }
  | { type: 'high_rating_count'; minRating: number; count: number }
  | {
      type: 'multi_theme_mastery'
      themeCount: number
      percent: number
      minPerTheme: number
    }
  | { type: 'weekly_leaderboard_rank'; maxRank: number }

export interface AchievementDefinition {
  id: string
  name: string
  description: string
  category: AchievementCategory
  icon: string
  criteria: AchievementCriteria
}

/**
 * All achievement definitions with their unlock criteria
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Complete your first puzzle',
    category: 'puzzles',
    icon: '🎯',
    criteria: { type: 'puzzle_count', count: 1 },
  },
  {
    id: 'century',
    name: 'Century',
    description: 'Solve 100 puzzles',
    category: 'puzzles',
    icon: '💯',
    criteria: { type: 'puzzle_count', count: 100 },
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Solve a puzzle in under 3 seconds',
    category: 'speed',
    icon: '⚡',
    criteria: { type: 'speed_under_ms', milliseconds: 3000 },
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete a cycle with 100% accuracy',
    category: 'cycles',
    icon: '✨',
    criteria: { type: 'cycle_accuracy', percent: 100 },
  },
  {
    id: 'woodpecker-pro',
    name: 'Woodpecker Pro',
    description: 'Complete 5 cycles of the same set',
    category: 'cycles',
    icon: '🪶',
    criteria: { type: 'cycles_same_set', count: 5 },
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Practice before 7am',
    category: 'time',
    icon: '🌅',
    criteria: { type: 'time_of_day', before: 7 },
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Practice after midnight',
    category: 'time',
    icon: '🦉',
    criteria: { type: 'time_of_day', after: 0, before: 5 },
  },
  {
    id: 'on-fire',
    name: 'On Fire',
    description: 'Reach a 7-day streak',
    category: 'streaks',
    icon: '🔥',
    criteria: { type: 'streak_days', days: 7 },
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Reach a 30-day streak',
    category: 'streaks',
    icon: '🚀',
    criteria: { type: 'streak_days', days: 30 },
  },
  {
    id: 'theme-master-fork',
    name: 'Theme Master: Forks',
    description: '90%+ accuracy on fork puzzles (min 20 attempts)',
    category: 'themes',
    icon: '🍴',
    criteria: { type: 'theme_accuracy', theme: 'fork', percent: 90, minAttempts: 20 },
  },
  // NEW ACHIEVEMENTS
  {
    id: 'half-thousand',
    name: 'Half Thousand',
    description: 'Solve 500 puzzles correctly',
    category: 'puzzles',
    icon: '🎖️',
    criteria: { type: 'puzzle_count', count: 500 },
  },
  {
    id: 'millennium',
    name: 'Millennium',
    description: 'Solve 1000 puzzles correctly',
    category: 'puzzles',
    icon: '👑',
    criteria: { type: 'puzzle_count', count: 1000 },
  },
  {
    id: 'weekly-warrior',
    name: 'Weekly Warrior',
    description: 'Solve 100 puzzles in a single week',
    category: 'puzzles',
    icon: '📅',
    criteria: { type: 'weekly_puzzle_count', count: 100 },
  },
  {
    id: 'lightning-fast',
    name: 'Lightning Fast',
    description: 'Solve a puzzle in under 1.5 seconds',
    category: 'speed',
    icon: '⚡',
    criteria: { type: 'lightning_speed', milliseconds: 1500 },
  },
  {
    id: 'speed-streak',
    name: 'Speed Streak',
    description: 'Solve 10 consecutive puzzles in under 5 seconds each',
    category: 'speed',
    icon: '💨',
    criteria: { type: 'speed_streak', consecutiveCount: 10, maxSeconds: 5 },
  },
  {
    id: 'cycle-complete',
    name: 'Cycle Complete',
    description: 'Complete your first full cycle',
    category: 'cycles',
    icon: '♻️',
    criteria: { type: 'first_cycle_complete' },
  },
  {
    id: 'woodpecker-master',
    name: 'Woodpecker Master',
    description: 'Complete 10 cycles of the same set',
    category: 'cycles',
    icon: '🏆',
    criteria: { type: 'cycles_same_set_extended', count: 10 },
  },
  {
    id: 'improvement-king',
    name: 'Improvement King',
    description: 'Reduce cycle completion time by 50% compared to first cycle',
    category: 'cycles',
    icon: '📈',
    criteria: { type: 'cycle_time_improvement', percentReduction: 50 },
  },
  {
    id: 'consistent-trainer',
    name: 'Consistent Trainer',
    description: 'Train for 14 consecutive days',
    category: 'streaks',
    icon: '💪',
    criteria: { type: 'streak_extended', days: 14 },
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Train for 60 consecutive days',
    category: 'streaks',
    icon: '🔱',
    criteria: { type: 'streak_extended', days: 60 },
  },
  {
    id: 'sharp-shooter',
    name: 'Sharp Shooter',
    description: 'Maintain 95% accuracy over 50 puzzles in a cycle',
    category: 'accuracy',
    icon: '🎯',
    criteria: { type: 'cycle_high_accuracy', percent: 95, minPuzzles: 50 },
  },
  {
    id: 'flawless-streak',
    name: 'Flawless Streak',
    description: 'Solve 25 consecutive puzzles correctly',
    category: 'accuracy',
    icon: '✅',
    criteria: { type: 'consecutive_correct', count: 25 },
  },
  {
    id: 'no-mistakes',
    name: 'No Mistakes',
    description: 'Complete a full cycle without a single error (min 20 puzzles)',
    category: 'accuracy',
    icon: '💎',
    criteria: { type: 'perfect_cycle_strict', minPuzzles: 20 },
  },
  {
    id: 'theme-master-pin',
    name: 'Theme Master: Pins',
    description: '90%+ accuracy on pin puzzles (min 20 attempts)',
    category: 'themes',
    icon: '📌',
    criteria: { type: 'theme_accuracy_extended', theme: 'pin', percent: 90, minAttempts: 20 },
  },
  {
    id: 'theme-master-skewer',
    name: 'Theme Master: Skewers',
    description: '90%+ accuracy on skewer puzzles (min 20 attempts)',
    category: 'themes',
    icon: '🗡️',
    criteria: { type: 'theme_accuracy_extended', theme: 'skewer', percent: 90, minAttempts: 20 },
  },
  {
    id: 'mate-master',
    name: 'Mate Master',
    description: '90%+ accuracy on checkmate puzzles (min 30 attempts)',
    category: 'themes',
    icon: '♟️',
    criteria: { type: 'theme_accuracy_extended', theme: 'mate', percent: 90, minAttempts: 30 },
  },
  {
    id: 'tactical-prodigy',
    name: 'Tactical Prodigy',
    description: 'Achieve 85%+ accuracy across 200 total attempts',
    category: 'mastery',
    icon: '🧠',
    criteria: { type: 'overall_accuracy', percent: 85, minAttempts: 200 },
  },
  {
    id: 'rating-climber',
    name: 'Rating Climber',
    description: 'Solve 50 puzzles with rating 1800+',
    category: 'mastery',
    icon: '📊',
    criteria: { type: 'high_rating_count', minRating: 1800, count: 50 },
  },
  {
    id: 'versatile',
    name: 'Versatile',
    description: 'Solve puzzles from 5 different tactical themes with 80%+ accuracy (min 15 each)',
    category: 'mastery',
    icon: '🎨',
    criteria: { type: 'multi_theme_mastery', themeCount: 5, percent: 80, minPerTheme: 15 },
  },
  {
    id: 'rising-star',
    name: 'Rising Star',
    description: 'Reach top 100 on the weekly leaderboard',
    category: 'leaderboard',
    icon: '⭐',
    criteria: { type: 'weekly_leaderboard_rank', maxRank: 100 },
  },
]

/**
 * Get achievement definition by ID
 */
export function getAchievementDefinition(
  id: string
): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((a) => a.id === id)
}

/**
 * Get all achievement IDs
 */
export function getAllAchievementIds(): string[] {
  return ACHIEVEMENT_DEFINITIONS.map((a) => a.id)
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(
  category: AchievementCategory
): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter((a) => a.category === category)
}
