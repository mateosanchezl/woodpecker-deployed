'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import type { ChessboardOptions, SquareHandlerArgs, PieceDropHandlerArgs } from 'react-chessboard'
import { useChessPuzzle } from '@/hooks/use-chess-puzzle'
import { usePuzzleTimer } from '@/hooks/use-puzzle-timer'
import type { Square, PuzzleStatus } from '@/lib/chess/types'
import { ANIMATION_DURATION } from '@/lib/chess/types'
import { parseUciMove, parseSolutionMoves } from '@/lib/chess/puzzle-engine'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PromotionDialog } from './promotion-dialog'
import { PuzzleFeedback } from './puzzle-feedback'
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
  fen: string
  moves: string
  onComplete: (isCorrect: boolean, timeSpent: number, movesPlayed: string[]) => void
  onSkip: (timeSpent: number) => void
  onAdvanceToNextPuzzle?: () => void
  onReviewModeChange?: (isReviewing: boolean) => void
  disabled?: boolean // Disable interactions during transitions
  isSubmittingAttempt?: boolean
  canAdvanceToNext?: boolean
  timer: ReturnType<typeof usePuzzleTimer>
}

type PuzzleBoardMode = 'solving' | 'failedReview'

// Custom board colors matching the new "Peck" nature theme
const customDarkSquareStyle: React.CSSProperties = {
  backgroundColor: 'oklch(0.6 0.1 145)', // Muted moss green
}

const customLightSquareStyle: React.CSSProperties = {
  backgroundColor: 'oklch(0.96 0.03 145)', // Very light green/cream
}

const customBoardStyle: React.CSSProperties = {
  borderRadius: '12px',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
}

/**
 * Interactive chess puzzle board component.
 * Handles the complete puzzle solving flow with animations, feedback, and failed-attempt review.
 */
export function PuzzleBoard({
  fen,
  moves,
  onComplete,
  onSkip,
  onAdvanceToNextPuzzle,
  onReviewModeChange,
  disabled = false,
  isSubmittingAttempt = false,
  canAdvanceToNext = false,
  timer,
}: PuzzleBoardProps) {
  const [mode, setMode] = useState<PuzzleBoardMode>('solving')
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [legalMoves, setLegalMoves] = useState<Square[]>([])
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
    getLegalMoves,
  } = useChessPuzzle({
    fen,
    solutionMoves: moves,
    onIncorrectMove: () => {
      timer.pause()
    },
    onPuzzleComplete: (isCorrect, finalMoves) => {
      const finalTime = timer.getTime()
      timer.pause()

      if (!isCorrect) {
        setMode('failedReview')
        setSelectedSquare(null)
        setLegalMoves([])
        setReviewStartFen(position)
        setReviewStartMoveIndex(currentMoveIndex)
        setReviewStartLastMove(lastMove)
        setWalkthroughPosition(position)
        setWalkthroughMoveIndex(currentMoveIndex)
        setWalkthroughLastMove(lastMove)
      }

      onComplete(isCorrect, finalTime, finalMoves)
    },
    onReady: () => {
      timer.start()
    },
  })

  useEffect(() => {
    onReviewModeChange?.(mode === 'failedReview')
  }, [mode, onReviewModeChange])

  useEffect(() => {
    return () => {
      onReviewModeChange?.(false)
    }
  }, [onReviewModeChange])

  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (
        mode !== 'solving' ||
        disabled ||
        isSubmittingAttempt ||
        !isPlayerTurn ||
        !sourceSquare ||
        !targetSquare
      ) {
        return false
      }

      if (sourceSquare === targetSquare) {
        return false
      }

      setSelectedSquare(null)
      setLegalMoves([])

      return makePlayerMove(sourceSquare as Square, targetSquare as Square)
    },
    [mode, disabled, isSubmittingAttempt, isPlayerTurn, makePlayerMove]
  )

  const handleSquareClick = useCallback(
    ({ square }: SquareHandlerArgs) => {
      if (mode !== 'solving' || disabled || isSubmittingAttempt || !isPlayerTurn) {
        return
      }

      const sq = square as Square

      if (selectedSquare === sq) {
        setSelectedSquare(null)
        setLegalMoves([])
        return
      }

      if (selectedSquare && legalMoves.includes(sq)) {
        makePlayerMove(selectedSquare, sq)
        setSelectedSquare(null)
        setLegalMoves([])
        return
      }

      const nextLegalMoves = getLegalMoves(sq)
      if (nextLegalMoves.length > 0) {
        setSelectedSquare(sq)
        setLegalMoves(nextLegalMoves)
      } else {
        setSelectedSquare(null)
        setLegalMoves([])
      }
    },
    [
      mode,
      disabled,
      isSubmittingAttempt,
      isPlayerTurn,
      selectedSquare,
      legalMoves,
      makePlayerMove,
      getLegalMoves,
    ]
  )

  const handleSkip = useCallback(() => {
    if (mode !== 'solving' || disabled || isSubmittingAttempt) {
      return
    }

    timer.pause()
    onSkip(timer.getTime())
  }, [mode, disabled, isSubmittingAttempt, timer, onSkip])

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

  useEffect(() => {
    if (mode !== 'failedReview') {
      return
    }

    const handleReviewKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName))
      ) {
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        stepForward()
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        stepBackward()
      }
    }

    window.addEventListener('keydown', handleReviewKeyDown)
    return () => window.removeEventListener('keydown', handleReviewKeyDown)
  }, [mode, stepForward, stepBackward])

  const handleAdvance = useCallback(() => {
    if (!canAdvanceToNext || isSubmittingAttempt) {
      return
    }

    onAdvanceToNextPuzzle?.()
  }, [canAdvanceToNext, isSubmittingAttempt, onAdvanceToNextPuzzle])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Escape') {
        return
      }

      if (promotionState.isOpen) {
        cancelPromotion()
        return
      }

      if (selectedSquare) {
        setSelectedSquare(null)
        setLegalMoves([])
        return
      }

      if (mode === 'solving' && isPlayerTurn) {
        handleSkip()
      }
    },
    [
      promotionState.isOpen,
      cancelPromotion,
      selectedSquare,
      mode,
      isPlayerTurn,
      handleSkip,
    ]
  )

  const displayPosition = mode === 'failedReview' ? walkthroughPosition : position
  const displayLastMove = mode === 'failedReview' ? walkthroughLastMove : lastMove
  const canInteract =
    mode === 'solving' &&
    !disabled &&
    !isSubmittingAttempt &&
    status !== 'incorrect' &&
    status !== 'complete'

  const reviewStepsTotal = Math.max(0, solutionMoves.length - reviewStartMoveIndex)
  const reviewStepsCompleted = Math.max(0, walkthroughMoveIndex - reviewStartMoveIndex)
  const isReviewComplete = reviewStepsCompleted >= reviewStepsTotal
  const canStepBackward = walkthroughMoveIndex > reviewStartMoveIndex

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
        backgroundColor: 'rgba(59, 130, 246, 0.5)', // blue-500
      }
    }

    if (mode === 'solving') {
      legalMoves.forEach((sq) => {
        styles[sq] = {
          ...styles[sq],
          backgroundImage: styles[sq]?.backgroundColor
            ? 'radial-gradient(circle, rgba(0, 0, 0, 0.2) 25%, transparent 25%)'
            : 'radial-gradient(circle, rgba(0, 0, 0, 0.2) 25%, transparent 25%)',
          backgroundSize: '100% 100%',
        }
      })
    }

    return styles
  }, [displayLastMove, mode, selectedSquare, legalMoves])

  const chessboardOptions: ChessboardOptions = useMemo(
    () => ({
      position: displayPosition,
      boardOrientation: orientation,
      onPieceDrop: handlePieceDrop,
      onSquareClick: handleSquareClick,
      allowDragging: canInteract,
      animationDurationInMs: ANIMATION_DURATION,
      boardStyle: customBoardStyle,
      darkSquareStyle: customDarkSquareStyle,
      lightSquareStyle: customLightSquareStyle,
      squareStyles: customSquareStyles,
    }),
    [
      displayPosition,
      orientation,
      handlePieceDrop,
      handleSquareClick,
      canInteract,
      customSquareStyles,
    ]
  )

  return (
    <div
      className="relative flex flex-col items-center gap-4 w-full"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative w-full max-w-[700px] aspect-square shadow-2xl rounded-xl overflow-hidden">
        <Chessboard options={chessboardOptions} />

        {mode === 'solving' && <PuzzleFeedback status={status} />}

        {mode === 'solving' && (
          <PromotionDialog
            isOpen={promotionState.isOpen}
            color={promotionState.color}
            onSelect={handlePromotionSelect}
            onCancel={cancelPromotion}
          />
        )}
      </div>

      <div className="flex min-h-10 items-center justify-center text-lg font-medium">
        <StatusText
          mode={mode}
          status={status}
          isSubmittingAttempt={isSubmittingAttempt}
          isReviewComplete={isReviewComplete}
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
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous Move
            </Button>
            <Button
              variant="outline"
              onClick={stepForward}
              disabled={isReviewComplete}
              className="flex-1"
            >
              <ChevronRight className="mr-2 h-4 w-4" />
              {isReviewComplete ? 'Solution complete' : 'Next Move'}
            </Button>
            <Button
              onClick={handleAdvance}
              disabled={!canAdvanceToNext || isSubmittingAttempt}
              className="flex-1"
            >
              {isSubmittingAttempt ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SkipForward className="mr-2 h-4 w-4" />
              )}
              {isSubmittingAttempt ? 'Saving result...' : 'Next Puzzle'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusText({
  mode,
  status,
  isSubmittingAttempt,
  isReviewComplete,
}: {
  mode: PuzzleBoardMode
  status: PuzzleStatus
  isSubmittingAttempt: boolean
  isReviewComplete: boolean
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
