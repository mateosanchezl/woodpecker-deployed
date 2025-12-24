'use client'

import { useQuery } from '@tanstack/react-query'
import type { ProgressResponse } from '@/lib/validations/progress'

/**
 * Hook for fetching progress data for a puzzle set.
 */
export function useProgressData(puzzleSetId: string | null) {
  return useQuery<ProgressResponse>({
    queryKey: ['progress', puzzleSetId],
    queryFn: async () => {
      if (!puzzleSetId) {
        throw new Error('No puzzle set selected')
      }
      const res = await fetch(`/api/progress/${puzzleSetId}`)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch progress data')
      }
      return res.json()
    },
    enabled: !!puzzleSetId,
    staleTime: 30000, // 30 seconds - progress data doesn't change frequently
  })
}
