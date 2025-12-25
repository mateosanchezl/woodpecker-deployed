'use client'

import { cn } from '@/lib/utils'
import { getLevelTitle } from '@/lib/xp'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface LevelBadgeProps {
  level: number
  className?: string
  showTitle?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function LevelBadge({
  level,
  className,
  showTitle = false,
  size = 'md',
}: LevelBadgeProps) {
  const { title, icon } = getLevelTitle(level)

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-0.5',
    md: 'text-sm px-2 py-1 gap-1',
    lg: 'text-base px-3 py-1.5 gap-1.5',
  }

  const badge = (
    <div
      className={cn(
        'inline-flex items-center rounded-full bg-primary/10 text-primary font-medium',
        sizeClasses[size],
        className
      )}
    >
      <span>{icon}</span>
      <span className="tabular-nums">{level}</span>
      {showTitle && <span className="text-primary/70">{title}</span>}
    </div>
  )

  if (showTitle) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p>
            Level {level} - {title}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
