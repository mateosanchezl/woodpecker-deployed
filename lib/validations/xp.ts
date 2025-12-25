import { z } from 'zod'

// =============================================================================
// XP Source Types
// =============================================================================

export const xpSourceTypeSchema = z.enum([
  'PUZZLE_CORRECT',
  'PUZZLE_RATING_BONUS',
  'SPEED_BONUS',
  'STREAK_BONUS',
  'FIRST_ATTEMPT_BONUS',
  'IMPROVEMENT_BONUS',
  'CYCLE_COMPLETE',
  'CYCLE_ACCURACY_BONUS',
])

// =============================================================================
// XP Breakdown
// =============================================================================

export const xpBreakdownItemSchema = z.object({
  source: xpSourceTypeSchema,
  amount: z.number().int().min(0),
  label: z.string(),
})

export const xpGainResultSchema = z.object({
  totalXp: z.number().int().min(0),
  breakdown: z.array(xpBreakdownItemSchema),
  newTotalXp: z.number().int().min(0),
  previousLevel: z.number().int().min(1),
  newLevel: z.number().int().min(1),
  leveledUp: z.boolean(),
})

// =============================================================================
// Level Progress
// =============================================================================

export const levelProgressSchema = z.object({
  currentLevel: z.number().int().min(1),
  currentLevelXp: z.number().int().min(0),
  nextLevelXp: z.number().int().min(0),
  xpInCurrentLevel: z.number().int().min(0),
  xpNeededForNextLevel: z.number().int().min(0),
  progressPercent: z.number().int().min(0).max(100),
})

export const levelTitleSchema = z.object({
  title: z.string(),
  icon: z.string(),
})

// =============================================================================
// User XP Response
// =============================================================================

export const userXpResponseSchema = z.object({
  totalXp: z.number().int().min(0),
  currentLevel: z.number().int().min(1),
  weeklyXp: z.number().int().min(0),
  levelProgress: levelProgressSchema,
  levelTitle: levelTitleSchema,
})

// =============================================================================
// Type Exports
// =============================================================================

export type XpSourceType = z.infer<typeof xpSourceTypeSchema>
export type XpBreakdownItem = z.infer<typeof xpBreakdownItemSchema>
export type XpGainResult = z.infer<typeof xpGainResultSchema>
export type LevelProgress = z.infer<typeof levelProgressSchema>
export type LevelTitle = z.infer<typeof levelTitleSchema>
export type UserXpResponse = z.infer<typeof userXpResponseSchema>
