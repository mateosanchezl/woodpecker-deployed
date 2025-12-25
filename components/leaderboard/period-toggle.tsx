'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { LeaderboardPeriod } from '@/lib/validations/leaderboard'

interface PeriodToggleProps {
  period: LeaderboardPeriod
  onPeriodChange: (period: LeaderboardPeriod) => void
}

export function PeriodToggle({ period, onPeriodChange }: PeriodToggleProps) {
  return (
    <Tabs
      value={period}
      onValueChange={(value) => onPeriodChange(value as LeaderboardPeriod)}
    >
      <TabsList>
        <TabsTrigger value="weekly">This Week</TabsTrigger>
        <TabsTrigger value="alltime">All Time</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
