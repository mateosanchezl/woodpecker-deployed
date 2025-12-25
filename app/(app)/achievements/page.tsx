'use client'

import { AchievementsDisplay } from '@/components/achievements/achievements-display'

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Achievements</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your progress and unlock badges as you train
        </p>
      </div>

      {/* Achievements Grid */}
      <AchievementsDisplay />
    </div>
  )
}
