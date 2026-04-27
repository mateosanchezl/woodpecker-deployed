'use client'

import { memo, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import type { ChessboardOptions } from 'react-chessboard'
import { useChessPuzzle } from '@/hooks/use-chess-puzzle'
import { useBoardInteractionController } from '@/hooks/use-board-interaction-controller'
import type { PuzzleTimerControls } from '@/hooks/use-puzzle-timer'
import type { Square, PuzzleStatus, PromotionState, BoardOrientation } from '@/lib/chess/types'
import { ANIMATION_DURATION } from '@/lib/chess/types'
import { parseUciMove, parseSolutionMoves } from '@/lib/chess/puzzle-engine'
import { getBoardThemeSquareStyles, type BoardThemeId } from '@/lib/chess/board-themes'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChessboardStage } from '@/components/chess/chessboard-stage'
import { PromotionDialog } from './promotion-dialog'
import { PuzzleFeedback } from './puzzle-feedback'
import { ShortcutHints } from './shortcut-hints'
import {
  isPlainShortcutEvent,
  isSpaceKey,
  shouldIgnoreTrainingShortcut,
  TRAINING_SHORTCUTS,
} from '@/lib/training/keyboard-shortcuts'
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  Eye,
  Loader2,
  SkipForward,
} from 'lucide-react'

interface PuzzleBoardProps {
  puzzleId: string
  fen: string
  moves: string
  allowAnyFinalCheckmate?: boolean
  onComplete: (isCorrect: boolean, timeSpent: number, movesPlayed: string[]) => void
  onSkip: (timeSpent: number) => void
  externalSkipRequest?: number
  onAdvanceToNextPuzzle?: () => void
  onPauseStateChange?: (isPaused: boolean) => void
  disabled?: boolean // Disable interactions during transitions
  isSubmittingAttempt?: boolean
  canAdvanceToNext?: boolean
  autoStartNextPuzzle?: boolean
  boardTheme: BoardThemeId
  timerControls: PuzzleTimerControls
}

type PuzzleBoardMode = 'solving' | 'failedReview' | 'awaitingAdvance'
type PendingAdvanceOutcome = 'correct' | 'skipped'

const customBoardStyle: React.CSSProperties = {
  borderRadius: '12px',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
}

function addInsetShadow(existingShadow: string | undefined, shadow: string): string {
  return existingShadow ? `${existingShadow}, ${shadow}` : shadow
}

/**
 * Interactive chess puzzle board component.
 * Handles the complete puzzle solving flow with animations, feedback, and failed-attempt review.
 */
interface PuzzleBoardSurfaceProps {
  puzzleId: string
  chessboardOptions: ChessboardOptions
  status: PuzzleStatus
  mode: PuzzleBoardMode
  promotionState: PromotionState
  orientation: BoardOrientation
  onSelectPromotion: (piece: 'q' | 'r' | 'b' | 'n') => void
  onCancelPromotion: () => void
}

const PuzzleBoardSurface = memo(function PuzzleBoardSurface({
  puzzleId,
  chessboardOptions,
  status,
  mode,
  promotionState,
  orientation,
  onSelectPromotion,
  onCancelPromotion,
}: PuzzleBoardSurfaceProps) {
  const boardContainerRef = useRef<HTMLDivElement>(null)

  return (
    <ChessboardStage
      boardTestId="training-board"
      boardPuzzleId={puzzleId}
      board={
        <div ref={boardContainerRef} className="absolute inset-0">
          <Chessboard options={chessboardOptions} />

          {mode === 'solving' && <PuzzleFeedback status={status} />}

          {mode === 'solving' && (
            <PromotionDialog
              isOpen={promotionState.isOpen}
              color={promotionState.color}
              anchorSquare={promotionState.to}
              boardOrientation={orientation}
              boardContainerRef={boardContainerRef}
              onSelect={onSelectPromotion}
              onCancel={onCancelPromotion}
            />
          )}
        </div>
      }
    />
  )
})

PuzzleBoardSurface.displayName = 'PuzzleBoardSurface'

export const PuzzleBoard = memo(function PuzzleBoard({
  puzzleId,
  fen,
  moves,
  allowAnyFinalCheckmate = false,
  onComplete,
  onSkip,
  externalSkipRequest = 0,
  onAdvanceToNextPuzzle,
  onPauseStateChange,
  disabled = false,
  isSubmittingAttempt = false,
  canAdvanceToNext = false,
  autoStartNextPuzzle = true,
  boardTheme,
  timerControls,
}: PuzzleBoardProps) {
  const [mode, setMode] = useState<PuzzleBoardMode>('solving')
  const [pendingAdvanceOutcome, setPendingAdvanceOutcome] =
    useState<PendingAdvanceOutcome | null>(null)
  const [reviewStartFen, setReviewStartFen] = useState(fen)
  const [reviewStartMoveIndex, setReviewStartMoveIndex] = useState(0)
  const [reviewStartLastMove, setReviewStartLastMove] = useState<{
    from: Square
    to: Square
  } | null>(null)
  const [walkthroughPosition, setWalkthroughPosition] = useState(fen)
  const [walkthroughMoveIndex, setWalkthroughMoveIndex] = useState(0)
  const [walkthroughLastMove, setWalkthroughLastMove] = useState<{
    from: Square
    to: Square
  } | null>(null)
  const lastProcessedSkipRequestRef = useRef(externalSkipRequest)

  const solutionMoves = useMemo(() => parseSolutionMoves(moves), [moves])

  // Chess puzzle hook
  const {
    position,
    orientation,
    status,
    currentMoveIndex,
    lastMove,
    isPlayerTurn,
    promotionState,
    makePlayerMove,
    handlePromotionSelect,
    cancelPromotion,
    getLegalMoveTargets,
  } = useChessPuzzle({
    fen,
    solutionMoves: moves,
    allowAnyFinalCheckmate,
    onIncorrectMove: () => {
      timerControls.pause()
    },
    onPuzzleComplete: (isCorrect, finalMoves) => {
      const finalTime = timerControls.getTime()
      timerControls.pause()

      if (!isCorrect) {
        setPendingAdvanceOutcome(null)
        setMode('failedReview')
        setReviewStartFen(position)
        setReviewStartMoveIndex(currentMoveIndex)
        setReviewStartLastMove(lastMove)
        setWalkthroughPosition(position)
        setWalkthroughMoveIndex(currentMoveIndex)
        setWalkthroughLastMove(lastMove)
      } else if (!autoStartNextPuzzle) {
        setPendingAdvanceOutcome('correct')
        setMode('awaitingAdvance')
      }

      onComplete(isCorrect, finalTime, finalMoves)
    },
    onReady: () => {
      timerControls.start()
    },
  })

  const canInteract =
    mode === 'solving' &&
    !disabled &&
    !isSubmittingAttempt &&
    status !== 'incorrect' &&
    status !== 'complete'

  const playerColor = orientation === 'white' ? 'w' : 'b'

  const {
    selectedSquare,
    legalTargets,
    allowDragging,
    canDragPiece,
    dragActivationDistance,
    handlePieceDrop,
    handleSquareClick,
    clearSelection,
  } = useBoardInteractionController({
    canInteract,
    isPlayerTurn,
    playerColor,
    makePlayerMove,
    getLegalMoveTargets,
  })

  useEffect(() => {
    onPauseStateChange?.(mode !== 'solving')
  }, [mode, onPauseStateChange])

  useEffect(() => {
    return () => {
      onPauseStateChange?.(false)
    }
  }, [onPauseStateChange])

  const handleSkip = useCallback(() => {
    if (mode !== 'solving' || disabled || isSubmittingAttempt) {
      return
    }

    timerControls.pause()
    if (!autoStartNextPuzzle) {
      setPendingAdvanceOutcome('skipped')
      setMode('awaitingAdvance')
    }
    onSkip(timerControls.getTime())
  }, [mode, disabled, isSubmittingAttempt, timerControls, autoStartNextPuzzle, onSkip])

  useEffect(() => {
    if (externalSkipRequest === lastProcessedSkipRequestRef.current) {
      return
    }

    lastProcessedSkipRequestRef.current = externalSkipRequest

    const timeoutId = window.setTimeout(() => {
      handleSkip()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [externalSkipRequest, handleSkip])

  const setWalkthroughToMoveIndex = useCallback((targetMoveIndex: number) => {
    if (mode !== 'failedReview') {
      return
    }

    const clampedMoveIndex = Math.min(
      Math.max(targetMoveIndex, reviewStartMoveIndex),
      solutionMoves.length
    )
    const chess = new Chess()
    chess.load(reviewStartFen)

    let nextLastMove = reviewStartLastMove

    for (let moveIndex = reviewStartMoveIndex; moveIndex < clampedMoveIndex; moveIndex += 1) {
      const moveUci = solutionMoves[moveIndex]
      if (!moveUci) {
        console.error('Missing walkthrough move:', moveIndex)
        return
      }

      const parsed = parseUciMove(moveUci)
      const result = chess.move({
        from: parsed.from,
        to: parsed.to,
        promotion: parsed.promotion,
      })

      if (!result) {
        console.error('Failed to play walkthrough move:', moveUci)
        return
      }

      nextLastMove = { from: parsed.from, to: parsed.to }
    }

    setWalkthroughPosition(chess.fen())
    setWalkthroughLastMove(nextLastMove)
    setWalkthroughMoveIndex(clampedMoveIndex)
  }, [
    mode,
    reviewStartFen,
    reviewStartLastMove,
    reviewStartMoveIndex,
    solutionMoves,
  ])

  const stepForward = useCallback(() => {
    if (walkthroughMoveIndex >= solutionMoves.length) {
      return
    }

    setWalkthroughToMoveIndex(walkthroughMoveIndex + 1)
  }, [walkthroughMoveIndex, solutionMoves.length, setWalkthroughToMoveIndex])

  const stepBackward = useCallback(() => {
    if (walkthroughMoveIndex <= reviewStartMoveIndex) {
      return
    }

    setWalkthroughToMoveIndex(walkthroughMoveIndex - 1)
  }, [walkthroughMoveIndex, reviewStartMoveIndex, setWalkthroughToMoveIndex])

  const handleAdvance = useCallback(() => {
    if (!canAdvanceToNext || isSubmittingAttempt) {
      return
    }

    onAdvanceToNextPuzzle?.()
  }, [canAdvanceToNext, isSubmittingAttempt, onAdvanceToNextPuzzle])

  const displayPosition = mode === 'failedReview' ? walkthroughPosition : position
  const displayLastMove = mode === 'failedReview' ? walkthroughLastMove : lastMove

  const reviewStepsTotal = Math.max(0, solutionMoves.length - reviewStartMoveIndex)
  const reviewStepsCompleted = Math.max(0, walkthroughMoveIndex - reviewStartMoveIndex)
  const isReviewComplete = reviewStepsCompleted >= reviewStepsTotal
  const canStepBackward = walkthroughMoveIndex > reviewStartMoveIndex

  useEffect(() => {
    const handleTrainingKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && promotionState.isOpen) {
        event.preventDefault()
        cancelPromotion()
        return
      }

      if (!isPlainShortcutEvent(event) || shouldIgnoreTrainingShortcut(event)) {
        return
      }

      if (
        event.repeat &&
        event.key !== 'ArrowLeft' &&
        event.key !== 'ArrowRight'
      ) {
        return
      }

      if (event.key === 'Escape') {
        if (selectedSquare) {
          event.preventDefault()
          clearSelection()
          return
        }

        if (mode === 'solving' && isPlayerTurn) {
          event.preventDefault()
          handleSkip()
        }

        return
      }

      if (event.key.toLowerCase() === 's') {
        if (mode === 'solving') {
          event.preventDefault()
          handleSkip()
        }

        return
      }

      if (event.key === 'ArrowRight') {
        if (mode === 'failedReview') {
          event.preventDefault()
          stepForward()
        }

        return
      }

      if (event.key === 'ArrowLeft') {
        if (mode === 'failedReview') {
          event.preventDefault()
          stepBackward()
        }

        return
      }

      if (isSpaceKey(event.key)) {
        if (mode === 'failedReview') {
          event.preventDefault()
          if (isReviewComplete) {
            handleAdvance()
          } else {
            stepForward()
          }
          return
        }

        if (canAdvanceToNext) {
          event.preventDefault()
          handleAdvance()
        }

        return
      }

      if (event.key === 'Enter' && canAdvanceToNext) {
        event.preventDefault()
        handleAdvance()
      }
    }

    window.addEventListener('keydown', handleTrainingKeyDown)
    return () => window.removeEventListener('keydown', handleTrainingKeyDown)
  }, [
    canAdvanceToNext,
    cancelPromotion,
    clearSelection,
    handleAdvance,
    handleSkip,
    isPlayerTurn,
    isReviewComplete,
    mode,
    promotionState.isOpen,
    selectedSquare,
    stepBackward,
    stepForward,
  ])

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {}

    if (displayLastMove) {
      styles[displayLastMove.from] = {
        backgroundColor: 'rgba(255, 255, 0, 0.3)',
      }
      styles[displayLastMove.to] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
      }
    }

    if (mode === 'solving' && selectedSquare) {
      styles[selectedSquare] = {
        ...styles[selectedSquare],
        boxShadow: addInsetShadow(
          styles[selectedSquare]?.boxShadow as string | undefined,
          'inset 0 0 0 3px rgba(59, 130, 246, 0.8)'
        ),
      }
    }

    if (mode === 'solving') {
      legalTargets.forEach(({ to, isCapture }) => {
        const currentStyle = styles[to] ?? {}

        styles[to] = {
          ...currentStyle,
          ...(isCapture
            ? {
                boxShadow: addInsetShadow(
                  currentStyle.boxShadow as string | undefined,
                  'inset 0 0 0 4px rgba(239, 68, 68, 0.72)'
                ),
              }
            : {
                backgroundImage:
                  'radial-gradient(circle, rgba(15, 23, 42, 0.35) 22%, transparent 24%)',
                backgroundSize: '100% 100%',
              }),
        }
      })
    }

    if (mode === 'solving' && promotionState.isOpen && promotionState.to) {
      const currentStyle = styles[promotionState.to] ?? {}
      styles[promotionState.to] = {
        ...currentStyle,
        backgroundColor: currentStyle.backgroundColor || 'rgba(251, 191, 36, 0.28)',
        boxShadow: addInsetShadow(
          currentStyle.boxShadow as string | undefined,
          'inset 0 0 0 4px rgba(251, 191, 36, 0.82)'
        ),
      }
    }

    return styles
  }, [displayLastMove, mode, selectedSquare, legalTargets, promotionState.isOpen, promotionState.to])

  const boardThemeStyles = useMemo(
    () => getBoardThemeSquareStyles(boardTheme),
    [boardTheme]
  )

  const chessboardOptions: ChessboardOptions = useMemo(
    () => ({
      position: displayPosition,
      boardOrientation: orientation,
      onPieceDrop: handlePieceDrop,
      onSquareClick: handleSquareClick,
      allowDragging,
      canDragPiece,
      allowDragOffBoard: false,
      dragActivationDistance,
      clearArrowsOnPositionChange: false,
      animationDurationInMs: ANIMATION_DURATION,
      boardStyle: customBoardStyle,
      darkSquareStyle: boardThemeStyles.darkSquareStyle,
      lightSquareStyle: boardThemeStyles.lightSquareStyle,
      squareStyles: customSquareStyles,
    }),
    [
      displayPosition,
      orientation,
      handlePieceDrop,
      handleSquareClick,
      allowDragging,
      canDragPiece,
      dragActivationDistance,
      boardThemeStyles.darkSquareStyle,
      boardThemeStyles.lightSquareStyle,
      customSquareStyles,
    ]
  )

  return (
    <div
      className="relative flex flex-col items-center gap-4 w-full"
      tabIndex={0}
    >
      <PuzzleBoardSurface
        puzzleId={puzzleId}
        chessboardOptions={chessboardOptions}
        status={status}
        mode={mode}
        promotionState={promotionState}
        orientation={orientation}
        onSelectPromotion={handlePromotionSelect}
        onCancelPromotion={cancelPromotion}
      />

      <div className="flex min-h-10 items-center justify-center text-lg font-medium">
        <StatusText
          mode={mode}
          status={status}
          isSubmittingAttempt={isSubmittingAttempt}
          isReviewComplete={isReviewComplete}
          pendingAdvanceOutcome={pendingAdvanceOutcome}
        />
      </div>

      {mode === 'failedReview' && (
        <div className="flex w-full max-w-[700px] flex-col items-center gap-3">
          {reviewStepsTotal > 0 && (
            <div className="text-sm text-muted-foreground">
              Solution {Math.min(reviewStepsCompleted, reviewStepsTotal)} / {reviewStepsTotal}
            </div>
          )}

          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={stepBackward}
              disabled={!canStepBackward}
              className="flex-1"
              aria-keyshortcuts={TRAINING_SHORTCUTS.previousMove.ariaKeyShortcuts}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              <span>Previous Move</span>
              <ShortcutHints keys={TRAINING_SHORTCUTS.previousMove.hints} />
            </Button>
            <Button
              variant="outline"
              onClick={stepForward}
              disabled={isReviewComplete}
              className="flex-1"
              aria-keyshortcuts={TRAINING_SHORTCUTS.nextMove.ariaKeyShortcuts}
            >
              <ChevronRight className="mr-2 h-4 w-4" />
              {isReviewComplete ? (
                'Solution complete'
              ) : (
                <>
                  <span>Next Move</span>
                  <ShortcutHints keys={TRAINING_SHORTCUTS.nextMove.hints} />
                </>
              )}
            </Button>
            <Button
              onClick={handleAdvance}
              disabled={!canAdvanceToNext || isSubmittingAttempt}
              className="flex-1"
              data-testid="training-next-puzzle-button"
              aria-keyshortcuts={TRAINING_SHORTCUTS.nextPuzzle.ariaKeyShortcuts}
            >
              {isSubmittingAttempt ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SkipForward className="mr-2 h-4 w-4" />
              )}
              {isSubmittingAttempt ? (
                'Saving result...'
              ) : (
                <>
                  <span>Next Puzzle</span>
                  <ShortcutHints keys={TRAINING_SHORTCUTS.nextPuzzle.hints} />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {mode === 'awaitingAdvance' && (
        <div className="flex w-full max-w-[700px] flex-col items-center gap-3">
          <Button
            onClick={handleAdvance}
            disabled={!canAdvanceToNext || isSubmittingAttempt}
            className="w-full sm:w-auto sm:min-w-56"
            data-testid="training-next-puzzle-button"
            aria-keyshortcuts={TRAINING_SHORTCUTS.nextPuzzle.ariaKeyShortcuts}
          >
            {isSubmittingAttempt ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <SkipForward className="mr-2 h-4 w-4" />
            )}
            {isSubmittingAttempt ? (
              'Saving result...'
            ) : (
              <>
                <span>Next Puzzle</span>
                <ShortcutHints keys={TRAINING_SHORTCUTS.nextPuzzle.hints} />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
})

PuzzleBoard.displayName = 'PuzzleBoard'

function StatusText({
  mode,
  status,
  isSubmittingAttempt,
  isReviewComplete,
  pendingAdvanceOutcome,
}: {
  mode: PuzzleBoardMode
  status: PuzzleStatus
  isSubmittingAttempt: boolean
  isReviewComplete: boolean
  pendingAdvanceOutcome: PendingAdvanceOutcome | null
}) {
  if (mode === 'failedReview') {
    if (isSubmittingAttempt) {
      return (
        <StatusBadge
          icon={Loader2}
          label="Saving result"
          tone="warning"
          iconClassName="animate-spin"
        />
      )
    }

    if (isReviewComplete) {
      return (
        <StatusBadge
          icon={CheckCircle2}
          label="Solution Complete"
          tone="success"
        />
      )
    }

    return (
      <StatusBadge
        icon={Eye}
        label="Review The Missed Line"
        tone="warning"
      />
    )
  }

  if (mode === 'awaitingAdvance') {
    if (isSubmittingAttempt) {
      return (
        <StatusBadge
          icon={Loader2}
          label="Saving result"
          tone="warning"
          iconClassName="animate-spin"
        />
      )
    }

    if (pendingAdvanceOutcome === 'skipped') {
      return (
        <StatusBadge
          icon={SkipForward}
          label="Puzzle Skipped"
          tone="warning"
        />
      )
    }

    return (
      <StatusBadge
        icon={CheckCircle2}
        label="Puzzle Complete"
        tone="success"
      />
    )
  }

  switch (status) {
    case 'loading':
      return (
        <StatusBadge
          icon={Loader2}
          label="Loading Puzzle"
          tone="neutral"
          iconClassName="animate-spin"
        />
      )
    case 'opponent_turn':
      return (
        <StatusBadge
          icon={Clock3}
          label="Opponent Moving"
          tone="info"
          iconClassName="animate-pulse"
        />
      )
    case 'player_turn':
      return <StatusBadge icon={CircleDot} label="Your Move" tone="neutral" />
    case 'correct':
      return <StatusBadge icon={CheckCircle2} label="Correct" tone="success" />
    case 'incorrect':
      return <StatusBadge icon={AlertCircle} label="Incorrect" tone="danger" />
    case 'complete':
      return (
        <StatusBadge
          icon={CheckCircle2}
          label="Puzzle Complete"
          tone="success"
        />
      )
    default:
      return null
  }
}

function StatusBadge({
  icon: Icon,
  label,
  tone,
  iconClassName,
}: {
  icon: typeof Loader2
  label: string
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger'
  iconClassName?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium tracking-tight shadow-sm transition-colors',
        tone === 'neutral' && 'border-border bg-background text-foreground/80',
        tone === 'info' && 'border-sky-200/80 bg-sky-50 text-sky-700',
        tone === 'success' && 'border-emerald-200/80 bg-emerald-50 text-emerald-700',
        tone === 'warning' && 'border-amber-200/80 bg-amber-50 text-amber-700',
        tone === 'danger' && 'border-rose-200/80 bg-rose-50 text-rose-700'
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full border bg-white/90',
          tone === 'neutral' && 'border-border/80 text-foreground/70',
          tone === 'info' && 'border-sky-200/80 text-sky-700',
          tone === 'success' && 'border-emerald-200/80 text-emerald-700',
          tone === 'warning' && 'border-amber-200/80 text-amber-700',
          tone === 'danger' && 'border-rose-200/80 text-rose-700'
        )}
      >
        <Icon className={cn('h-3 w-3', iconClassName)} />
      </span>
      <span>{label}</span>
    </span>
  )
}
