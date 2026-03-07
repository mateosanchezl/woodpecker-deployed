'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { PuzzleBoard } from './puzzle-board'
import { PuzzleStatus } from './puzzle-status'
import {
  TrainingBugReport,
  type TrainingBugReportContext,
} from './training-bug-report'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AlertCircle, RefreshCw, CheckCircle2, ExternalLink, SkipForward, Sparkles } from 'lucide-react'
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
  isSubmittingAttempt?: boolean
  isTransitioning?: boolean // True during puzzle transition
  error: Error | null
  canAdvanceToNext?: boolean
  autoStartNextPuzzle: boolean
  isUpdatingAutoStartNextPuzzle?: boolean

  // Callbacks
  onPuzzleComplete: (
    puzzleInSetId: string,
    isCorrect: boolean,
    timeSpent: number,
    movesPlayed: string[]
  ) => void
  onSkip: (puzzleInSetId: string, timeSpent: number) => void
  onAdvanceToNextPuzzle?: () => void
  onAutoStartNextPuzzleChange: (checked: boolean) => void
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
  puzzleRenderKey?: number
  bugReportContext: TrainingBugReportContext
}

/**
 * Main training session component that orchestrates the puzzle solving experience.
 * Handles loading states, errors, puzzle display, and cycle completion.
 */
export function TrainingSession({
  puzzleData,
  progress,
  isLoading,
  isSubmittingAttempt = false,
  isTransitioning,
  error,
  canAdvanceToNext = false,
  autoStartNextPuzzle,
  isUpdatingAutoStartNextPuzzle = false,
  onPuzzleComplete,
  onSkip,
  onAdvanceToNextPuzzle,
  onAutoStartNextPuzzleChange,
  onRetry,
  isCycleComplete,
  cycleStats,
  onStartNextCycle,
  puzzleRenderKey = 0,
  bugReportContext,
}: TrainingSessionProps) {
  // Timer hook
  const timer = usePuzzleTimer()
  const [externalSkipRequest, setExternalSkipRequest] = useState(0)
  const [isPuzzleFlowPaused, setIsPuzzleFlowPaused] = useState(false)
  const [showPuzzleThemes, setShowPuzzleThemes] = useState(true)
  const resetTimerRef = useRef(timer.controls.reset)

  useEffect(() => {
    resetTimerRef.current = timer.controls.reset
  }, [timer.controls])

  // Handle keyboard shortcuts at session level
  useEffect(() => {
    const handleKeyDown = () => {
      // Global shortcuts could be added here
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (puzzleData?.id) {
      resetTimerRef.current()
    }
  }, [puzzleData?.id, puzzleRenderKey])

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
        bugReportContext={bugReportContext}
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

  const lichessPuzzleUrl = `https://lichess.org/training/${encodeURIComponent(puzzleData.puzzle.id)}`

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-8 w-full max-w-7xl mx-auto p-4">
      {/* Left Column: Board */}
      <div className="flex-1 w-full flex justify-center lg:justify-end">
        <PuzzleBoard
          key={`${puzzleData.id}:${puzzleRenderKey}`}
          fen={puzzleData.puzzle.fen}
          moves={puzzleData.puzzle.moves}
          onComplete={handleComplete}
          onSkip={handleSkip}
          externalSkipRequest={externalSkipRequest}
          onAdvanceToNextPuzzle={onAdvanceToNextPuzzle}
          onPauseStateChange={setIsPuzzleFlowPaused}
          disabled={isTransitioning}
          isSubmittingAttempt={isSubmittingAttempt}
          canAdvanceToNext={canAdvanceToNext}
          autoStartNextPuzzle={autoStartNextPuzzle}
          timerControls={timer.controls}
        />
      </div>

      {/* Right Column: Status & Metadata */}
      <div className="w-full lg:w-80 flex flex-col gap-6 sticky top-4">
        <PuzzleStatus
          timeMs={timer.timeMs}
          progress={progress}
          puzzleRating={puzzleData.puzzle.rating}
          isPaused={isPuzzleFlowPaused}
        />

        <div className="rounded-lg border bg-card p-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <Label
                htmlFor="training-pace-toggle"
                className="text-sm font-medium"
              >
                Auto-start next puzzle
              </Label>
              <p className="text-xs text-muted-foreground">
                Turn off to pause between puzzles and start the next one manually.
              </p>
            </div>
            <Switch
              id="training-pace-toggle"
              checked={autoStartNextPuzzle}
              onCheckedChange={onAutoStartNextPuzzleChange}
              disabled={isUpdatingAutoStartNextPuzzle}
            />
          </div>
        </div>

        {!isPuzzleFlowPaused && (
          <Button
            variant="ghost"
            onClick={() => setExternalSkipRequest((current) => current + 1)}
            disabled={isTransitioning || isSubmittingAttempt}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Skip Puzzle
          </Button>
        )}

        <Button asChild variant="outline" className="w-full">
          <a
            href={lichessPuzzleUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            View in Lichess
          </a>
        </Button>

        <TrainingBugReport context={bugReportContext} />

        {/* Puzzle metadata visibility */}
        {puzzleData.puzzle.themes.length > 0 && (
          <div className="rounded-lg border bg-card p-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <Label
                  htmlFor="puzzle-theme-visibility"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <span>Show puzzle themes</span>
                  <Badge variant="secondary" className="uppercase tracking-wide">
                    New
                  </Badge>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Hide theme labels to avoid tactical hints.
                </p>
              </div>
              <Switch
                id="puzzle-theme-visibility"
                checked={showPuzzleThemes}
                onCheckedChange={setShowPuzzleThemes}
              />
            </div>

            {showPuzzleThemes && (
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
  bugReportContext,
}: {
  message: string
  onRetry: () => void
  bugReportContext: TrainingBugReportContext
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
        <TrainingBugReport context={bugReportContext} className="max-w-sm" />
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
