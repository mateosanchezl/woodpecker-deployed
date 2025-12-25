'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAchievements } from '@/hooks/use-achievements'
import { AchievementBadge } from './achievement-badge'
import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Achievement, AchievementCategory } from '@/lib/validations/achievements'

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  puzzles: 'Puzzles',
  streaks: 'Streaks',
  speed: 'Speed',
  cycles: 'Cycles',
  time: 'Time',
  themes: 'Themes',
}

const CATEGORY_ORDER: AchievementCategory[] = [
  'puzzles',
  'speed',
  'cycles',
  'streaks',
  'time',
  'themes',
]

interface AchievementsDisplayProps {
  showHeader?: boolean
  compact?: boolean
}

export function AchievementsDisplay({
  showHeader = true,
  compact = false,
}: AchievementsDisplayProps) {
  const { data, isLoading, error } = useAchievements()

  if (isLoading) {
    return <AchievementsDisplaySkeleton showHeader={showHeader} compact={compact} />
  }

  if (error || !data) {
    return null
  }

  const { achievements, totalUnlocked, totalAchievements } = data

  // Group achievements by category
  const groupedAchievements = CATEGORY_ORDER.reduce(
    (acc, category) => {
      const categoryAchievements = achievements.filter(
        (a) => a.category === category
      )
      if (categoryAchievements.length > 0) {
        acc[category] = categoryAchievements
      }
      return acc
    },
    {} as Record<AchievementCategory, Achievement[]>
  )

  const progressPercent = Math.round((totalUnlocked / totalAchievements) * 100)

  return (
    <div className="space-y-6">
      {showHeader && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Achievements</h2>
                  <p className="text-sm text-muted-foreground">
                    {totalUnlocked} of {totalAchievements} unlocked
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {progressPercent}%
                </span>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement categories */}
      <div className="space-y-6">
        {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {CATEGORY_LABELS[category as AchievementCategory]}
            </h3>
            <div
              className={cn(
                'grid gap-4',
                compact
                  ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
              )}
            >
              {categoryAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  compact={compact}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface AchievementCardProps {
  achievement: Achievement
  compact?: boolean
}

function AchievementCard({ achievement, compact = false }: AchievementCardProps) {
  if (compact) {
    return <AchievementBadge achievement={achievement} size="sm" />
  }

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        achievement.isUnlocked
          ? 'bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200/50 dark:border-amber-800/50'
          : 'opacity-60'
      )}
    >
      <CardContent className="pt-4 pb-4 flex flex-col items-center text-center">
        <AchievementBadge achievement={achievement} size="lg" showTooltip={false} />
        <h4
          className={cn(
            'mt-3 font-semibold text-sm',
            !achievement.isUnlocked && 'text-muted-foreground'
          )}
        >
          {achievement.name}
        </h4>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {achievement.description}
        </p>
        {achievement.isUnlocked && achievement.unlockedAt && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            {new Date(achievement.unlockedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function AchievementsDisplaySkeleton({
  showHeader,
  compact,
}: {
  showHeader: boolean
  compact: boolean
}) {
  return (
    <div className="space-y-6">
      {showHeader && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-10 w-16" />
            </div>
            <Skeleton className="mt-4 h-2 w-full" />
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {[1, 2].map((section) => (
          <div key={section}>
            <Skeleton className="h-4 w-20 mb-3" />
            <div
              className={cn(
                'grid gap-4',
                compact
                  ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
              )}
            >
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-4 pb-4 flex flex-col items-center">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <Skeleton className="mt-3 h-4 w-20" />
                    <Skeleton className="mt-2 h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
