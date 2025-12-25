'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
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
  const [isTimerVisible, setIsTimerVisible] = useState(true)

  const percentComplete = Math.round(
    (progress.completedInCycle / progress.totalPuzzles) * 100
  )

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4 flex-col">
          {/* Timer with toggle */}
          <div className="text-center relative w-full">
            {isTimerVisible ? (
              <>
                <div className="font-mono text-3xl tabular-nums font-medium">
                  {formatTime(timeMs)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Time</div>
              </>
            ) : (
              <div className="text-3xl font-medium text-muted-foreground">—</div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsTimerVisible(!isTimerVisible)}
              className="absolute top-0 right-0 h-8 w-8"
              title={isTimerVisible ? "Hide timer" : "Show timer"}
            >
              {isTimerVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className='flex flex-row gap-4'>
            {/* Cycle */}
            <div className="text-center">
              <div className="text-2xl font-medium">{progress.cycleNumber}</div>
              <div className="text-xs text-muted-foreground mt-1">Cycle</div>
            </div>

            {/* Divider */}
            <div className="h-12 w-px bg-border" />

            {/* Progress */}
            <div className="text-center flex-1">
              <div className="font-medium text-2xl">
                {progress.currentPosition}{' '}
                <span className="text-muted-foreground ">
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
                  <div className="text-2xl font-medium">{puzzleRating}</div>
                  <div className="text-xs text-muted-foreground mt-1">Rating</div>
                </div>
              </>
            )}
          </div>
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
