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
        'flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-bold transition-all duration-200',
        hasStreak
          ? 'bg-linear-to-r from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400 ring-1 ring-orange-500/20 shadow-sm'
          : 'bg-muted/50 text-muted-foreground ring-1 ring-border/50',
        isAtRisk && 'animate-pulse ring-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
      )}
    >
      <Flame
        className={cn(
          'h-4 w-4',
          hasStreak
            ? 'text-orange-500 dark:text-orange-400 fill-orange-500/20 dark:fill-orange-400/20'
            : 'text-muted-foreground',
          isAtRisk && 'text-red-500 dark:text-red-400 fill-red-500/20 dark:fill-red-400/20'
        )}
      />
      <span className="tracking-tight">{streak.currentStreak}</span>
      {isAtRisk && (
        <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 ml-0.5">At Risk</span>
      )}
    </div>
  )
}
