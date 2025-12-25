'use client'

import { useQuery } from '@tanstack/react-query'
import type {
  LeaderboardResponse,
  LeaderboardPeriod,
} from '@/lib/validations/leaderboard'

interface UseLeaderboardOptions {
  period: LeaderboardPeriod
  limit?: number
  offset?: number
}

export function useLeaderboard(options: UseLeaderboardOptions) {
  const { period, limit = 50, offset = 0 } = options

  return useQuery<LeaderboardResponse>({
    queryKey: ['leaderboard', period, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        limit: String(limit),
        offset: String(offset),
      })
      const res = await fetch(`/api/leaderboard?${params}`)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch leaderboard')
      }
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - aggressive caching
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    refetchOnWindowFocus: false,
  })
}
