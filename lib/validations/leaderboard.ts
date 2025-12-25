import { z } from 'zod'

export const leaderboardQuerySchema = z.object({
  period: z.enum(['weekly', 'alltime']).default('alltime'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export const leaderboardEntrySchema = z.object({
  rank: z.number(),
  userId: z.string(),
  name: z.string().nullable(),
  xp: z.number(),
  level: z.number(),
  puzzlesSolved: z.number(),
  estimatedRating: z.number(),
  isCurrentUser: z.boolean(),
})

export const leaderboardResponseSchema = z.object({
  entries: z.array(leaderboardEntrySchema),
  pagination: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
  }),
  currentUser: z
    .object({
      rank: z.number().nullable(),
      entry: leaderboardEntrySchema.nullable(),
    })
    .nullable(),
  period: z.enum(['weekly', 'alltime']),
  weekStartDate: z.string().optional(),
})

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>
export type LeaderboardResponse = z.infer<typeof leaderboardResponseSchema>
export type LeaderboardPeriod = z.infer<typeof leaderboardQuerySchema>['period']
