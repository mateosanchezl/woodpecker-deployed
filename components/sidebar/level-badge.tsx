'use client'

import { useXp } from '@/hooks/use-xp'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function SidebarLevelBadge() {
  const { data: xpData, isLoading } = useXp()

  if (isLoading || !xpData) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 text-indigo-700 dark:text-indigo-300">
            <span>{xpData.levelTitle.icon}</span>
            <span className="tabular-nums">{xpData.currentLevel}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-center">
            <p className="font-medium">
              Level {xpData.currentLevel} - {xpData.levelTitle.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {xpData.totalXp.toLocaleString()} XP
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
