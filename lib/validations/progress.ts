import { z } from 'zod'

/**
 * Schema for cycle statistics in progress response.
 */
export const cycleStatsSchema = z.object({
  cycleNumber: z.number(),
  totalTime: z.number().nullable(),
  solvedCorrect: z.number(),
  solvedIncorrect: z.number(),
  skipped: z.number(),
  accuracy: z.number(),
  completedAt: z.string().nullable(),
})

export type CycleStats = z.infer<typeof cycleStatsSchema>

/**
 * Schema for theme performance in progress response.
 */
export const themePerformanceSchema = z.object({
  theme: z.string(),
  totalAttempts: z.number(),
  correctAttempts: z.number(),
  accuracy: z.number(),
})

export type ThemePerformance = z.infer<typeof themePerformanceSchema>

/**
 * Schema for problem puzzles in progress response.
 */
export const problemPuzzleSchema = z.object({
  position: z.number(),
  puzzleId: z.string(),
  rating: z.number(),
  themes: z.array(z.string()),
  fen: z.string(),
  totalAttempts: z.number(),
  correctAttempts: z.number(),
  successRate: z.number(),
  averageTime: z.number(),
})

export type ProblemPuzzle = z.infer<typeof problemPuzzleSchema>

/**
 * Schema for progress API response.
 */
export const progressResponseSchema = z.object({
  set: z.object({
    id: z.string(),
    name: z.string(),
    size: z.number(),
    targetRating: z.number(),
    targetCycles: z.number(),
  }),
  summary: z.object({
    totalAttempts: z.number(),
    completedCycles: z.number(),
    overallAccuracy: z.number(),
    averageTimePerPuzzle: z.number(),
    totalTimeSpent: z.number(),
    bestCycleTime: z.number().nullable(),
  }),
  cycles: z.array(cycleStatsSchema),
  themePerformance: z.array(themePerformanceSchema),
  problemPuzzles: z.array(problemPuzzleSchema),
})

export type ProgressResponse = z.infer<typeof progressResponseSchema>
