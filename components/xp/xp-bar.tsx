'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface XpBarProps {
  currentXp: number
  xpInCurrentLevel: number
  xpNeededForNextLevel: number
  progressPercent: number
  currentLevel: number
  className?: string
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function XpBar({
  currentXp,
  xpInCurrentLevel,
  xpNeededForNextLevel,
  progressPercent,
  currentLevel,
  className,
  showLabels = true,
  size = 'md',
}: XpBarProps) {
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className={cn('w-full', className)}>
      {showLabels && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Level {currentLevel}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {xpInCurrentLevel.toLocaleString()} / {xpNeededForNextLevel.toLocaleString()} XP
          </span>
        </div>
      )}
      <Progress
        value={progressPercent}
        className={cn(sizeClasses[size], 'bg-primary/10')}
      />
      {showLabels && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-muted-foreground">
            {currentXp.toLocaleString()} total XP
          </span>
          <span className="text-xs text-muted-foreground">
            Level {currentLevel + 1}
          </span>
        </div>
      )}
    </div>
  )
}
