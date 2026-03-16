'use client'

import type { StreakData } from '@/lib/streak'
import { formatStreakResponse } from '@/lib/streak'
import { useAppBootstrap } from '@/hooks/use-app-bootstrap'

/**
 * Hook for fetching the current user's streak data.
 * Uses the shared app bootstrap cache to avoid redundant requests.
 */
export function useStreak() {
  return useAppBootstrap<StreakData>({
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
