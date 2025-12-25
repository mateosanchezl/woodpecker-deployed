'use client'

import { useQuery } from '@tanstack/react-query'
import type { AchievementsResponse } from '@/lib/validations/achievements'

/**
 * Hook for fetching the current user's achievements.
 */
export function useAchievements() {
  return useQuery<AchievementsResponse>({
    queryKey: ['achievements'],
    queryFn: async () => {
      const res = await fetch('/api/user/achievements')
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch achievements')
      }
      return res.json()
    },
    staleTime: 60000, // 1 minute
  })
}
