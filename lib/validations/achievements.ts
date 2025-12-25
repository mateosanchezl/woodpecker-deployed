import { z } from 'zod'

export const achievementCategorySchema = z.enum([
  'puzzles',
  'streaks',
  'speed',
  'cycles',
  'time',
  'themes',
])

export const achievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: achievementCategorySchema,
  icon: z.string(),
  unlockedAt: z.string().nullable(), // ISO date string or null
  isUnlocked: z.boolean(),
})

export const achievementsResponseSchema = z.object({
  achievements: z.array(achievementSchema),
  totalUnlocked: z.number(),
  totalAchievements: z.number(),
})

export const unlockedAchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  unlockedAt: z.string(), // ISO date string
})

export type AchievementCategory = z.infer<typeof achievementCategorySchema>
export type Achievement = z.infer<typeof achievementSchema>
export type AchievementsResponse = z.infer<typeof achievementsResponseSchema>
export type UnlockedAchievement = z.infer<typeof unlockedAchievementSchema>
