'use client'

import { Card, CardContent } from '@/components/ui/card'
import { RankBadge } from './rank-badge'
import { User } from 'lucide-react'
import type { LeaderboardResponse } from '@/lib/validations/leaderboard'

interface CurrentUserRankProps {
  currentUser: NonNullable<LeaderboardResponse['currentUser']>
  isVisibleInTable: boolean
}

export function CurrentUserRank({
  currentUser,
  isVisibleInTable,
}: CurrentUserRankProps) {
  // Don't show if user is already visible in the table or has no entry
  if (isVisibleInTable || !currentUser.entry) {
    return null
  }

  const { entry, rank } = currentUser

  return (
    <Card className="bg-linear-to-r from-primary/10 to-primary/5 border-primary/20 shadow-sm transition-all hover:shadow-md">
      <CardContent className="py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 shadow-sm">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold">Your Ranking</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {rank ? `#${rank}` : 'Unranked'} with {entry.puzzlesSolved}{' '}
                puzzles solved
              </p>
            </div>
          </div>
          {rank && <RankBadge rank={rank} />}
        </div>
      </CardContent>
    </Card>
  )
}
