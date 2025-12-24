'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatTime } from '@/hooks/use-puzzle-timer'
import type { TrainingProgress } from '@/lib/chess/types'

interface PuzzleStatusProps {
  timeMs: number
  progress: TrainingProgress
  puzzleRating?: number
}

/**
 * Status display showing timer, cycle number, and progress.
 */
export function PuzzleStatus({ timeMs, progress, puzzleRating }: PuzzleStatusProps) {
  const percentComplete = Math.round(
    (progress.completedInCycle / progress.totalPuzzles) * 100
  )

  return (
    <Card className="w-full max-w-md">
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Timer */}
          <div className="text-center">
            <div className="font-mono text-3xl tabular-nums font-medium">
              {formatTime(timeMs)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Time</div>
          </div>

          {/* Divider */}
          <div className="h-12 w-px bg-border" />

          {/* Cycle */}
          <div className="text-center">
            <div className="text-2xl font-medium">{progress.cycleNumber}</div>
            <div className="text-xs text-muted-foreground mt-1">Cycle</div>
          </div>

          {/* Divider */}
          <div className="h-12 w-px bg-border" />

          {/* Progress */}
          <div className="text-center flex-1">
            <div className="text-lg font-medium">
              {progress.currentPosition}{' '}
              <span className="text-muted-foreground text-sm">
                / {progress.totalPuzzles}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {percentComplete}% complete
            </div>
          </div>

          {/* Rating (optional) */}
          {puzzleRating && (
            <>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-lg font-medium">{puzzleRating}</div>
                <div className="text-xs text-muted-foreground mt-1">Rating</div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact progress bar for mobile or inline display.
 */
export function PuzzleProgressBar({ progress }: { progress: TrainingProgress }) {
  const percentComplete = (progress.completedInCycle / progress.totalPuzzles) * 100

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>
          Puzzle {progress.currentPosition} of {progress.totalPuzzles}
        </span>
        <span>Cycle {progress.cycleNumber}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentComplete}%` }}
        />
      </div>
    </div>
  )
}
