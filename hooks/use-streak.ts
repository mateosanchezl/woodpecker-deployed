'use client'

import { useAppUser } from '@/hooks/use-app-user'
import type { StreakData } from '@/lib/streak'
import { formatStreakResponse } from '@/lib/streak'

/**
 * Hook for fetching the current user's streak data.
 * Uses the shared /api/user cache key to avoid redundant requests.
 */
export function useStreak() {
  return useAppUser<StreakData>({
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
  })
}
