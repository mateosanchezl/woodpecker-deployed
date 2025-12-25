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
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Your Ranking</p>
              <p className="text-xs text-muted-foreground">
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
