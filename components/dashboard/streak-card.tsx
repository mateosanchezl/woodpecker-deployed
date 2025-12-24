'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useStreak } from '@/hooks/use-streak'
import { getStreakMessage, getNextMilestone, getCurrentMilestoneTier } from '@/lib/streak-milestones'
import { Flame, Trophy, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StreakCard() {
  const { data: streak, isLoading, error } = useStreak()

  if (isLoading) {
    return <StreakCardSkeleton />
  }

  if (error || !streak) {
    return null
  }

  const message = getStreakMessage(
    streak.currentStreak,
    streak.isActiveToday,
    streak.isAtRisk
  )

  const currentTier = getCurrentMilestoneTier(streak.currentStreak)
  const nextMilestone = getNextMilestone(streak.currentStreak)

  // Determine card styling based on streak state
  const isActive = streak.currentStreak > 0
  const hasStreak = streak.currentStreak >= 3 // Show enhanced styling at 3+ days

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all',
        hasStreak && 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800',
        streak.isAtRisk && 'animate-pulse'
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">
              Training Streak
            </p>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                'text-4xl font-bold tabular-nums',
                hasStreak && 'text-amber-600 dark:text-amber-400'
              )}>
                {streak.currentStreak}
              </span>
              <span className="text-lg text-muted-foreground">
                {streak.currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
            <p className={cn(
              'text-sm',
              streak.isAtRisk
                ? 'text-amber-600 dark:text-amber-400 font-medium'
                : 'text-muted-foreground'
            )}>
              {message}
            </p>
          </div>

          <div className={cn(
            'p-3 rounded-full',
            hasStreak
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
              : 'bg-muted'
          )}>
            <Flame className={cn(
              'h-6 w-6',
              !hasStreak && 'text-muted-foreground'
            )} />
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">Best: </span>
              <span className="font-semibold">{streak.longestStreak} days</span>
            </div>
          </div>

          {nextMilestone && streak.currentStreak > 0 && (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <span className="text-muted-foreground">Next: </span>
                <span className="font-semibold">{nextMilestone.days} days</span>
              </div>
            </div>
          )}

          {currentTier && (
            <div className="ml-auto text-sm">
              <span className="text-muted-foreground">{currentTier.emoji} {currentTier.title}</span>
            </div>
          )}
        </div>

        {/* Active today indicator */}
        {streak.isActiveToday && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Trained today
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StreakCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
        <div className="mt-4 pt-4 border-t flex items-center gap-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}
