'use client'

import { useQuery } from '@tanstack/react-query'
import { getLevelProgress, getLevelTitle } from '@/lib/xp'

interface UserData {
  user: {
    totalXp: number
    currentLevel: number
    weeklyXp: number
  }
}

export interface XpData {
  totalXp: number
  currentLevel: number
  weeklyXp: number
  levelProgress: {
    currentLevel: number
    currentLevelXp: number
    nextLevelXp: number
    xpInCurrentLevel: number
    xpNeededForNextLevel: number
    progressPercent: number
  }
  levelTitle: {
    title: string
    icon: string
  }
}

/**
 * Hook for fetching the current user's XP and level data.
 */
export function useXp() {
  return useQuery<XpData>({
    queryKey: ['xp'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch XP data')
      }

      const data: UserData = await res.json()
      const { totalXp, currentLevel, weeklyXp } = data.user

      return {
        totalXp,
        currentLevel,
        weeklyXp,
        levelProgress: getLevelProgress(totalXp),
        levelTitle: getLevelTitle(currentLevel),
      }
    },
    staleTime: 60000, // 1 minute
  })
}
