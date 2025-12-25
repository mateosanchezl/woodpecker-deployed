'use client'

import { useCallback, useEffect } from 'react'
import { PuzzleBoard } from './puzzle-board'
import { PuzzleStatus, PuzzleProgressBar } from './puzzle-status'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, CheckCircle2, SkipForward, Sparkles } from 'lucide-react'
import type { TrainingProgress, PuzzleInSetData } from '@/lib/chess/types'
import { usePuzzleTimer } from '@/hooks/use-puzzle-timer'
import { useXp } from '@/hooks/use-xp'
import { XpBar } from '@/components/xp/xp-bar'

interface TrainingSessionProps {
  // Current puzzle data
  puzzleData: PuzzleInSetData | null
  progress: TrainingProgress | null

  // Loading and error states
  isLoading: boolean
  isTransitioning?: boolean // True during puzzle transition
  error: Error | null

  // Callbacks
  onPuzzleComplete: (
    puzzleInSetId: string,
    isCorrect: boolean,
    timeSpent: number,
    movesPlayed: string[]
  ) => void
  onSkip: (puzzleInSetId: string, timeSpent: number) => void
  onRetry: () => void

  // Cycle completion
  isCycleComplete?: boolean
  cycleStats?: {
    solvedCorrect: number
    solvedIncorrect: number
    skipped: number
    totalTime: number | null
  }
  onStartNextCycle?: () => void
}

/**
 * Main training session component that orchestrates the puzzle solving experience.
 * Handles loading states, errors, puzzle display, and cycle completion.
 */
export function TrainingSession({
  puzzleData,
  progress,
  isLoading,
  isTransitioning,
  error,
  onPuzzleComplete,
  onSkip,
  onRetry,
  isCycleComplete,
  cycleStats,
  onStartNextCycle,
}: TrainingSessionProps) {
  // Timer hook
  const timer = usePuzzleTimer()

  // Handle keyboard shortcuts at session level
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcuts could be added here
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle puzzle completion
  const handleComplete = useCallback(
    (isCorrect: boolean, timeSpent: number, movesPlayed: string[]) => {
      if (puzzleData) {
        onPuzzleComplete(puzzleData.id, isCorrect, timeSpent, movesPlayed)
      }
    },
    [puzzleData, onPuzzleComplete]
  )

  // Handle skip
  const handleSkip = useCallback(
    (timeSpent: number) => {
      if (puzzleData) {
        onSkip(puzzleData.id, timeSpent)
      }
    },
    [puzzleData, onSkip]
  )

  // Loading state (initial load only, not transitions)
  if (isLoading && !puzzleData) {
    return <TrainingSessionSkeleton />
  }

  // Error state
  if (error) {
    return (
      <TrainingSessionError
        message={error.message}
        onRetry={onRetry}
      />
    )
  }

  // Cycle complete state
  if (isCycleComplete && cycleStats) {
    return (
      <CycleCompleteCard
        stats={cycleStats}
        cycleNumber={progress?.cycleNumber || 1}
        onStartNextCycle={onStartNextCycle}
      />
    )
  }

  // No puzzle available
  if (!puzzleData || !progress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <p>No puzzles available</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-8 w-full max-w-7xl mx-auto p-4">
      {/* Left Column: Board */}
      <div className="flex-1 w-full flex justify-center lg:justify-end">
        <PuzzleBoard
          key={puzzleData.id}
          fen={puzzleData.puzzle.fen}
          moves={puzzleData.puzzle.moves}
          onComplete={handleComplete}
          onSkip={handleSkip}
          disabled={isTransitioning}
          timer={timer}
        />
      </div>

      {/* Right Column: Status & Metadata */}
      <div className="w-full lg:w-80 flex flex-col gap-6 sticky top-4">
        <PuzzleStatus
          timeMs={timer.timeMs}
          progress={progress}
          puzzleRating={puzzleData.puzzle.rating}
        />
        
        <Button 
            variant="ghost" 
            onClick={() => handleSkip(timer.getTime())}
            disabled={isTransitioning}
            className="w-full text-muted-foreground hover:text-foreground"
        >
            <SkipForward className="mr-2 h-4 w-4" />
            Skip Puzzle
        </Button>

        {/* Puzzle metadata (themes) */}
        {puzzleData.puzzle.themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center lg:justify-start">
            {puzzleData.puzzle.themes.slice(0, 5).map(theme => (
              <span
                key={theme}
                className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
              >
                {formatTheme(theme)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Loading skeleton for training session.
 */
function TrainingSessionSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Progress bar skeleton */}
      <div className="w-full px-4">
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>

      {/* Timer skeleton */}
      <Skeleton className="h-8 w-24" />

      {/* Board skeleton */}
      <Skeleton className="aspect-square w-full max-w-[480px]" />

      {/* Status skeleton */}
      <Skeleton className="h-6 w-32" />
    </div>
  )
}

/**
 * Error display for training session.
 */
function TrainingSessionError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="flex flex-col items-center gap-4 py-8">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="font-medium">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Cycle completion summary card.
 */
function CycleCompleteCard({
  stats,
  cycleNumber,
  onStartNextCycle,
}: {
  stats: {
    solvedCorrect: number
    solvedIncorrect: number
    skipped: number
    totalTime: number | null
  }
  cycleNumber: number
  onStartNextCycle?: () => void
}) {
  const { data: xpData } = useXp()
  const total = stats.solvedCorrect + stats.solvedIncorrect + stats.skipped
  const accuracy = total > 0 ? Math.round((stats.solvedCorrect / total) * 100) : 0

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <CardTitle>Cycle {cycleNumber} Complete</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-medium text-green-600">
              {stats.solvedCorrect}
            </div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>
          <div>
            <div className="text-2xl font-medium text-red-600">
              {stats.solvedIncorrect}
            </div>
            <div className="text-xs text-muted-foreground">Incorrect</div>
          </div>
          <div>
            <div className="text-2xl font-medium text-muted-foreground">
              {stats.skipped}
            </div>
            <div className="text-xs text-muted-foreground">Skipped</div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="text-center py-4 border-t border-b">
          <div className="text-3xl font-medium">{accuracy}%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>

        {/* Time */}
        {stats.totalTime && (
          <div className="text-center">
            <div className="text-lg font-mono">
              {formatTotalTime(stats.totalTime)}
            </div>
            <div className="text-xs text-muted-foreground">Total time</div>
          </div>
        )}

        {/* XP Progress */}
        {xpData && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="text-lg font-semibold">
                Level {xpData.currentLevel}
              </span>
              <span className="text-muted-foreground">
                {xpData.levelTitle.icon} {xpData.levelTitle.title}
              </span>
            </div>
            <XpBar
              currentXp={xpData.totalXp}
              xpInCurrentLevel={xpData.levelProgress.xpInCurrentLevel}
              xpNeededForNextLevel={xpData.levelProgress.xpNeededForNextLevel}
              progressPercent={xpData.levelProgress.progressPercent}
              currentLevel={xpData.currentLevel}
              showLabels={true}
              size="md"
            />
          </div>
        )}

        {/* Next cycle button */}
        {onStartNextCycle && (
          <Button className="w-full" onClick={onStartNextCycle}>
            Start Cycle {cycleNumber + 1}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Format theme name for display.
 */
function formatTheme(theme: string): string {
  return theme
    .split(/(?=[A-Z])/)
    .join(' ')
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase())
}

/**
 * Format total time in minutes:seconds.
 */
function formatTotalTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds}s`
}
