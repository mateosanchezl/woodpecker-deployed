'use client'

import { toast } from 'sonner'
import type { UnlockedAchievement } from '@/lib/validations/achievements'

/**
 * Shows a toast notification for an unlocked achievement
 */
export function showAchievementUnlockToast(achievement: UnlockedAchievement) {
  toast.success(
    <div className="flex items-center gap-3">
      <span className="text-2xl">{achievement.icon}</span>
      <div>
        <p className="font-semibold">Achievement Unlocked!</p>
        <p className="text-sm text-muted-foreground">{achievement.name}</p>
      </div>
    </div>,
    {
      duration: 5000,
      className: 'achievement-toast',
      icon: null
    }
  )
}

/**
 * Shows toast notifications for multiple unlocked achievements
 */
export function showAchievementUnlockToasts(achievements: UnlockedAchievement[]) {
  // Stagger the toasts slightly for multiple achievements
  achievements.forEach((achievement, index) => {
    setTimeout(() => {
      showAchievementUnlockToast(achievement)
    }, index * 500)
  })
}
