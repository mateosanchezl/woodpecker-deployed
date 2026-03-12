'use client'

import { AchievementsDisplay } from '@/components/achievements/achievements-display'

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Achievements</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Track your progress and unlock badges as you train
        </p>
      </div>

      {/* Achievements Grid */}
      <AchievementsDisplay />
    </div>
  )
}
