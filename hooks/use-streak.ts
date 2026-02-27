'use client'

import { useQuery } from '@tanstack/react-query'
import type { StreakData } from '@/lib/streak'
import { formatStreakResponse } from '@/lib/streak'

interface UserData {
  user: {
    currentStreak: number
    longestStreak: number
    lastTrainedDate: string | null
  }
}

/**
 * Hook for fetching the current user's streak data.
 * Uses the shared /api/user cache key to avoid redundant requests.
 */
export function useStreak() {
  return useQuery<UserData, Error, StreakData>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch user')
      }
      return res.json()
    },
    select: (data) => {
      const lastTrainedDate = data.user.lastTrainedDate
        ? new Date(data.user.lastTrainedDate)
        : null

      return formatStreakResponse(
        data.user.currentStreak,
        data.user.longestStreak,
        lastTrainedDate
      )
    },
    staleTime: 60000,
  })
}
