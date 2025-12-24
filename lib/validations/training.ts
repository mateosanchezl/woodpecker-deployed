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
