'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RankBadge } from './rank-badge'
import { cn } from '@/lib/utils'
import { getLevelTitle } from '@/lib/xp'
import type { LeaderboardEntry } from '@/lib/validations/leaderboard'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>No entries yet this period.</p>
        <p className="text-sm mt-1">Solve some puzzles to appear on the leaderboard!</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">Rank</TableHead>
          <TableHead>Player</TableHead>
          <TableHead className="w-[100px] text-right">XP</TableHead>
          <TableHead className="w-[80px] text-right">Level</TableHead>
          <TableHead className="w-[100px] text-right">Puzzles</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => {
          const levelTitle = getLevelTitle(entry.level)
          return (
            <TableRow
              key={entry.userId}
              className={cn(entry.isCurrentUser && 'bg-primary/5')}
            >
              <TableCell>
                <RankBadge rank={entry.rank} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'font-medium',
                      entry.isCurrentUser && 'text-primary'
                    )}
                  >
                    {entry.name || 'Anonymous'}
                  </span>
                  {entry.isCurrentUser && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium">
                {entry.xp.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <span
                  className="inline-flex items-center gap-1 text-sm"
                  title={levelTitle.title}
                >
                  <span>{levelTitle.icon}</span>
                  <span className="tabular-nums">{entry.level}</span>
                </span>
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {entry.puzzlesSolved.toLocaleString()}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
