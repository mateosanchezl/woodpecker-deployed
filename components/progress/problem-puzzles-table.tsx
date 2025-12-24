'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertTriangle } from 'lucide-react'
import type { ProblemPuzzle } from '@/lib/validations/progress'

interface ProblemPuzzlesTableProps {
  puzzles: ProblemPuzzle[]
}

// Format theme names for display (camelCase to Title Case)
function formatTheme(theme: string): string {
  return theme
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

// Theme badge colors for visual variety
const THEME_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
]

function getThemeColor(theme: string): string {
  // Simple hash to get consistent color for each theme
  let hash = 0
  for (let i = 0; i < theme.length; i++) {
    hash = theme.charCodeAt(i) + ((hash << 5) - hash)
  }
  return THEME_COLORS[Math.abs(hash) % THEME_COLORS.length]
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

export function ProblemPuzzlesTable({ puzzles }: ProblemPuzzlesTableProps) {
  if (puzzles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="rounded-lg bg-amber-100 p-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            Problem Puzzles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[100px] flex items-center justify-center text-emerald-600 text-sm font-medium">
            No problem puzzles found - great work!
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <div className="rounded-lg bg-amber-100 p-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          Problem Puzzles
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Puzzles you&apos;ve struggled with across cycles
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead className="w-[80px]">Rating</TableHead>
              <TableHead>Themes</TableHead>
              <TableHead className="w-[100px] text-right">Success</TableHead>
              <TableHead className="w-[100px] text-right">Avg Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {puzzles.map((puzzle) => {
              const successColor =
                puzzle.successRate >= 50
                  ? 'text-amber-600'
                  : 'text-rose-600'

              return (
                <TableRow key={puzzle.puzzleId}>
                  <TableCell className="font-medium tabular-nums">
                    {puzzle.position}
                  </TableCell>
                  <TableCell className="tabular-nums">{puzzle.rating}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {puzzle.themes.slice(0, 3).map((theme) => (
                        <span
                          key={theme}
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getThemeColor(theme)}`}
                        >
                          {formatTheme(theme)}
                        </span>
                      ))}
                      {puzzle.themes.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{puzzle.themes.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={`text-right tabular-nums ${successColor}`}>
                    {puzzle.successRate}%
                    <span className="text-muted-foreground text-xs ml-1">
                      ({puzzle.correctAttempts}/{puzzle.totalAttempts})
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-mono text-sm">
                    {formatTime(puzzle.averageTime)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
