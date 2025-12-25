'use client'

import { useXp } from '@/hooks/use-xp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { XpBar } from '@/components/xp/xp-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles, TrendingUp } from 'lucide-react'

export function XpCard() {
  const { data: xpData, isLoading } = useXp()

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!xpData) {
    return null
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">{xpData.levelTitle.icon}</span>
              Level {xpData.currentLevel}
            </CardTitle>
            <CardDescription>{xpData.levelTitle.title}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums text-primary">
              {xpData.totalXp.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <XpBar
          currentXp={xpData.totalXp}
          xpInCurrentLevel={xpData.levelProgress.xpInCurrentLevel}
          xpNeededForNextLevel={xpData.levelProgress.xpNeededForNextLevel}
          progressPercent={xpData.levelProgress.progressPercent}
          currentLevel={xpData.currentLevel}
          showLabels={true}
        />

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>This week</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="font-semibold tabular-nums">
              +{xpData.weeklyXp.toLocaleString()} XP
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
