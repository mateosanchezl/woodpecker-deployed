'use client'

import { cn } from '@/lib/utils'
import type { Achievement } from '@/lib/validations/achievements'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface AchievementBadgeProps {
  achievement: Achievement
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

const sizeClasses = {
  sm: 'w-12 h-12 text-xl',
  md: 'w-16 h-16 text-2xl',
  lg: 'w-20 h-20 text-3xl',
}

export function AchievementBadge({
  achievement,
  size = 'md',
  showTooltip = true,
}: AchievementBadgeProps) {
  const badge = (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full transition-all',
        sizeClasses[size],
        achievement.isUnlocked
          ? 'bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900/40 dark:to-yellow-900/40 border-2 border-amber-300 dark:border-amber-700 shadow-md'
          : 'bg-muted border-2 border-muted-foreground/20 grayscale opacity-50'
      )}
    >
      <span
        className={cn(
          'select-none',
          !achievement.isUnlocked && 'opacity-50'
        )}
      >
        {achievement.icon}
      </span>
      
      {/* Unlocked glow effect */}
      {achievement.isUnlocked && (
        <div className="absolute inset-0 rounded-full bg-amber-400/20 dark:bg-amber-400/10 animate-pulse" />
      )}
    </div>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <div className="space-y-1">
            <p className="font-semibold">{achievement.name}</p>
            <p className="text-xs text-muted-foreground">
              {achievement.description}
            </p>
            {achievement.isUnlocked && achievement.unlockedAt && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
