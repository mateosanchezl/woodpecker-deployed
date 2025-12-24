'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Target, TrendingUp, Clock, Zap, Flame } from 'lucide-react'
import { useStreak } from '@/hooks/use-streak'

interface ProgressSummaryProps {
  totalAttempts: number
  completedCycles: number
  overallAccuracy: number
  averageTimePerPuzzle: number
  bestCycleTime: number | null
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

function formatTotalTime(ms: number | null): string {
  if (ms === null) return '—'
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }
  return `${minutes}m ${seconds}s`
}

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  valueColor?: string
  iconBgColor: string
  iconColor: string
}

function StatsCard({ title, value, subtitle, icon: Icon, valueColor, iconBgColor, iconColor }: StatsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold tabular-nums ${valueColor ?? ''}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className={`rounded-xl p-2.5 ${iconBgColor}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProgressSummary({
  totalAttempts,
  completedCycles,
  overallAccuracy,
  averageTimePerPuzzle,
  bestCycleTime,
}: ProgressSummaryProps) {
  const { data: streak } = useStreak()

  const accuracyColor =
    overallAccuracy >= 80
      ? 'text-green-600'
      : overallAccuracy >= 60
        ? 'text-yellow-600'
        : 'text-red-600'

  return (
    <div className="grid gap-4 md:grid-cols-5">
      <StatsCard
        title="Current Streak"
        value={streak?.currentStreak ?? 0}
        subtitle={streak?.longestStreak ? `best: ${streak.longestStreak} days` : undefined}
        icon={Flame}
        valueColor={streak?.currentStreak && streak.currentStreak >= 3 ? 'text-amber-600' : undefined}
        iconBgColor="bg-orange-100"
        iconColor="text-orange-600"
      />
      <StatsCard
        title="Puzzles Solved"
        value={totalAttempts}
        subtitle={`across ${completedCycles} cycle${completedCycles !== 1 ? 's' : ''}`}
        icon={Target}
        iconBgColor="bg-violet-100"
        iconColor="text-violet-600"
      />
      <StatsCard
        title="Overall Accuracy"
        value={`${overallAccuracy}%`}
        icon={TrendingUp}
        valueColor={accuracyColor}
        iconBgColor="bg-emerald-100"
        iconColor="text-emerald-600"
      />
      <StatsCard
        title="Avg Time/Puzzle"
        value={formatTime(averageTimePerPuzzle)}
        icon={Clock}
        iconBgColor="bg-amber-100"
        iconColor="text-amber-600"
      />
      <StatsCard
        title="Best Cycle"
        value={formatTotalTime(bestCycleTime)}
        subtitle="fastest completion"
        icon={Zap}
        iconBgColor="bg-rose-100"
        iconColor="text-rose-600"
      />
    </div>
  )
}
