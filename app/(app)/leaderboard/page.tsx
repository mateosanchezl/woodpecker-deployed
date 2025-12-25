'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'
import { PeriodToggle } from '@/components/leaderboard/period-toggle'
import { CurrentUserRank } from '@/components/leaderboard/current-user-rank'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { Users } from 'lucide-react'
import type { LeaderboardPeriod } from '@/lib/validations/leaderboard'

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>('alltime')

  const { data, isLoading, error } = useLeaderboard({ period })

  // Check if current user is visible in the table
  const isCurrentUserVisible =
    data?.entries.some((entry) => entry.isCurrentUser) ?? false

  if (isLoading) {
    return <LeaderboardSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
          <PeriodToggle period={period} onPeriodChange={setPeriod} />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-destructive">Failed to load leaderboard</p>
              <p className="text-muted-foreground text-sm mt-1">
                {error.message}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            See how you stack up against other players
          </p>
        </div>
        <PeriodToggle period={period} onPeriodChange={setPeriod} />
      </div>

      {/* Current User Rank (if not visible in table) */}
      {data?.currentUser && (
        <CurrentUserRank
          currentUser={data.currentUser}
          isVisibleInTable={isCurrentUserVisible}
        />
      )}

      {/* Leaderboard Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="rounded-lg bg-violet-100 p-1.5">
              <Users className="h-4 w-4 text-violet-600" />
            </div>
            {period === 'weekly' ? 'This Week' : 'All Time'} Rankings
            {data?.pagination.total !== undefined && (
              <span className="text-muted-foreground font-normal ml-2">
                ({data.pagination.total} players)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardTable entries={data?.entries ?? []} />
        </CardContent>
      </Card>

      {/* Pagination info */}
      {data?.pagination.hasMore && (
        <p className="text-center text-sm text-muted-foreground">
          Showing top {data.entries.length} of {data.pagination.total} players
        </p>
      )}
    </div>
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-9 w-48" />
      </div>

      <Card>
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
