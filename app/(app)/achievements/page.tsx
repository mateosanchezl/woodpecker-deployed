'use client'

import { useAppUser } from '@/hooks/use-app-user'
import { AchievementsDisplay } from '@/components/achievements/achievements-display'

export default function AchievementsPage() {
  const { data: appUser } = useAppUser()

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
      <AchievementsDisplay enabled={!!appUser?.user} />
    </div>
  )
}
