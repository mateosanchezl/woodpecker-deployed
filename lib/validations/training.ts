import { z } from 'zod'

// UCI move pattern: e2e4 or e7e8q (with promotion)
const uciMovePattern = /^[a-h][1-8][a-h][1-8][qrbn]?$/

/**
 * Schema for recording a puzzle attempt.
 */
export const attemptSchema = z.object({
  puzzleInSetId: z.string().min(1, 'puzzleInSetId is required'),
  timeSpent: z
    .number()
    .int('timeSpent must be an integer')
    .positive('timeSpent must be positive')
    .max(3600000, 'timeSpent cannot exceed 1 hour'), // 1 hour max
  isCorrect: z.boolean(),
  wasSkipped: z.boolean(),
  movesPlayed: z.array(
    z.string().regex(uciMovePattern, 'Invalid UCI move format')
  ),
})

export type AttemptInput = z.infer<typeof attemptSchema>

/**
 * Schema for creating a new training cycle.
 */
export const createCycleSchema = z.object({
  // No body required - uses puzzle set defaults
})

export type CreateCycleInput = z.infer<typeof createCycleSchema>

/**
 * Schema for puzzle set query parameters.
 */
export const puzzleSetQuerySchema = z.object({
  setId: z.string().min(1, 'setId is required'),
  cycleId: z.string().min(1).optional(),
})

export type PuzzleSetQueryParams = z.infer<typeof puzzleSetQuerySchema>

/**
 * Schema for next puzzle query parameters.
 */
export const nextPuzzleQuerySchema = z.object({
  cycleId: z.string().min(1, 'cycleId is required'),
})

export type NextPuzzleQueryParams = z.infer<typeof nextPuzzleQuerySchema>

/**
 * Response schema for next puzzle endpoint.
 */
export const nextPuzzleResponseSchema = z.object({
  puzzle: z.object({
    id: z.string(),
    fen: z.string(),
    moves: z.string(),
    rating: z.number(),
    themes: z.array(z.string()),
  }),
  puzzleInSet: z.object({
    id: z.string(),
    position: z.number(),
    totalAttempts: z.number(),
    correctAttempts: z.number(),
    averageTime: z.number().nullable(),
  }),
  progress: z.object({
    currentPosition: z.number(),
    totalPuzzles: z.number(),
    completedInCycle: z.number(),
    cycleNumber: z.number(),
  }),
})

export type NextPuzzleResponse = z.infer<typeof nextPuzzleResponseSchema>

/**
 * Response schema for recording an attempt.
 */
export const attemptResponseSchema = z.object({
  attempt: z.object({
    id: z.string(),
    timeSpent: z.number(),
    isCorrect: z.boolean(),
    wasSkipped: z.boolean(),
  }),
  cycleStats: z.object({
    solvedCorrect: z.number(),
    solvedIncorrect: z.number(),
    skipped: z.number(),
    totalTime: z.number().nullable(),
  }),
  isLastPuzzle: z.boolean(),
  streak: z
    .object({
      current: z.number(),
      longest: z.number(),
      incremented: z.boolean(),
      broken: z.boolean(),
      isNewRecord: z.boolean(),
    })
    .optional(),
  xp: z
    .object({
      gained: z.number(),
      breakdown: z.array(
        z.object({
          source: z.string(),
          amount: z.number(),
          label: z.string(),
        })
      ),
      newTotal: z.number(),
      previousLevel: z.number(),
      newLevel: z.number(),
      leveledUp: z.boolean(),
    })
    .optional(),
  unlockedAchievements: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        icon: z.string(),
        unlockedAt: z.string(),
      })
    )
    .optional(),
})

export type AttemptResponse = z.infer<typeof attemptResponseSchema>

/**
 * Response schema for creating a cycle.
 */
export const createCycleResponseSchema = z.object({
  cycle: z.object({
    id: z.string(),
    cycleNumber: z.number(),
    totalPuzzles: z.number(),
    startedAt: z.string(),
  }),
})

export type CreateCycleResponse = z.infer<typeof createCycleResponseSchema>

/**
 * Error response schema.
 */
export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
})

export type ErrorResponse = z.infer<typeof errorResponseSchema>

/**
 * Schema for creating a puzzle set.
 */
export const createPuzzleSetSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  targetRating: z
    .number()
    .int()
    .min(800, 'Target rating must be at least 800')
    .max(2600, 'Target rating must be at most 2600'),
  ratingRange: z
    .number()
    .int()
    .min(50, 'Rating range must be at least 50')
    .max(400, 'Rating range must be at most 400'),
  size: z
    .number()
    .int()
    .min(50, 'Set size must be at least 50')
    .max(500, 'Set size must be at most 500'),
  targetCycles: z
    .number()
    .int()
    .min(1, 'Must complete at least 1 cycle')
    .max(10, 'Cannot exceed 10 cycles'),
})

export type CreatePuzzleSetInput = z.infer<typeof createPuzzleSetSchema>

/**
 * Response schema for creating a puzzle set.
 */
export const createPuzzleSetResponseSchema = z.object({
  puzzleSet: z.object({
    id: z.string(),
    name: z.string(),
    size: z.number(),
    targetRating: z.number(),
    minRating: z.number(),
    maxRating: z.number(),
    targetCycles: z.number(),
    createdAt: z.string(),
  }),
})

export type CreatePuzzleSetResponse = z.infer<typeof createPuzzleSetResponseSchema>

/**
 * Schema for completing onboarding.
 */
export const completeOnboardingSchema = z.object({
  estimatedRating: z
    .number()
    .int()
    .min(800, 'Rating must be at least 800')
    .max(2600, 'Rating must be at most 2600'),
})

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>

/**
 * Schema for updating user settings.
 */
export const updateUserSettingsSchema = z.object({
  estimatedRating: z
    .number()
    .int()
    .min(800, 'Rating must be at least 800')
    .max(2600, 'Rating must be at most 2600')
    .optional(),
  preferredSetSize: z
    .number()
    .int()
    .min(50, 'Set size must be at least 50')
    .max(500, 'Set size must be at most 500')
    .optional(),
  targetCycles: z
    .number()
    .int()
    .min(1, 'Must complete at least 1 cycle')
    .max(10, 'Cannot exceed 10 cycles')
    .optional(),
  showOnLeaderboard: z.boolean().optional(),
})

export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>
