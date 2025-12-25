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
