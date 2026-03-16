'use client'

import { getLevelProgress, getLevelTitle } from '@/lib/xp'
import { useAppBootstrap } from '@/hooks/use-app-bootstrap'

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
  return useAppBootstrap<XpData>({
    select: (data) => {
      const { totalXp, currentLevel, weeklyXp } = data.user

      return {
        totalXp,
        currentLevel,
        weeklyXp,
        levelProgress: getLevelProgress(totalXp),
        levelTitle: getLevelTitle(currentLevel),
      }
    },
  })
}
