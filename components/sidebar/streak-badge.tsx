'use client'

import { useStreak } from '@/hooks/use-streak'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StreakBadge() {
  const { data: streak, isLoading } = useStreak()

  if (isLoading || !streak) {
    return null
  }

  const hasStreak = streak.currentStreak > 0
  const isAtRisk = streak.isAtRisk

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all',
        hasStreak
          ? 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300'
          : 'bg-muted text-muted-foreground',
        isAtRisk && 'animate-pulse'
      )}
    >
      <Flame
        className={cn(
          'h-4 w-4',
          hasStreak
            ? 'text-amber-500 dark:text-amber-400'
            : 'text-muted-foreground'
        )}
      />
      <span className="tabular-nums">{streak.currentStreak}</span>
      {isAtRisk && (
        <span className="text-xs text-amber-600 dark:text-amber-400">!</span>
      )}
    </div>
  )
}
