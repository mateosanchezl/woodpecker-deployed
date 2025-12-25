'use client'

import { Trophy, Medal, Award } from 'lucide-react'

interface RankBadgeProps {
  rank: number
}

export function RankBadge({ rank }: RankBadgeProps) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100">
        <Trophy className="h-4 w-4 text-amber-600" />
      </div>
    )
  }

  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
        <Medal className="h-4 w-4 text-slate-500" />
      </div>
    )
  }

  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
        <Award className="h-4 w-4 text-orange-600" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-8 h-8">
      <span className="text-sm font-medium tabular-nums text-muted-foreground">
        {rank}
      </span>
    </div>
  )
}
