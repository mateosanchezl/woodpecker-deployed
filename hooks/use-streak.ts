'use client'

import { useQuery } from '@tanstack/react-query'
import type { StreakData } from '@/lib/streak'

/**
 * Hook for fetching the current user's streak data.
 */
export function useStreak() {
  return useQuery<StreakData>({
    queryKey: ['streak'],
    queryFn: async () => {
      const res = await fetch('/api/user/streak')
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch streak')
      }
      return res.json()
    },
    staleTime: 60000, // 1 minute - streaks don't change frequently within a session
  })
}
