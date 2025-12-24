'use client'

import { useState, useCallback, useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import type { ChessboardOptions, SquareHandlerArgs, PieceDropHandlerArgs } from 'react-chessboard'
import { useChessPuzzle } from '@/hooks/use-chess-puzzle'
import { usePuzzleTimer, formatTime } from '@/hooks/use-puzzle-timer'
import type { Square, PuzzleStatus } from '@/lib/chess/types'
import { ANIMATION_DURATION } from '@/lib/chess/types'
import { PromotionDialog } from './promotion-dialog'
import { PuzzleFeedback } from './puzzle-feedback'

interface PuzzleBoardProps {
  fen: string
  moves: string
  onComplete: (isCorrect: boolean, timeSpent: number, movesPlayed: string[]) => void
  onSkip: (timeSpent: number) => void
}

// Custom board colors matching the slate design system
const customDarkSquareStyle: React.CSSProperties = {
  backgroundColor: '#475569', // slate-600
}

const customLightSquareStyle: React.CSSProperties = {
  backgroundColor: '#e2e8f0', // slate-200
}

const customBoardStyle: React.CSSProperties = {
  borderRadius: '4px',
}

/**
 * Interactive chess puzzle board component.
 * Handles the complete puzzle solving flow with animations and feedback.
 */
export function PuzzleBoard({ fen, moves, onComplete, onSkip }: PuzzleBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [legalMoves, setLegalMoves] = useState<Square[]>([])

  // Timer hook
  const timer = usePuzzleTimer()

  // Chess puzzle hook
  const {
    position,
    orientation,
    status,
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
    onCorrectMove: () => {
      // Continue timer
    },
    onIncorrectMove: () => {
      timer.pause()
    },
    onPuzzleComplete: (isCorrect, finalMoves) => {
      timer.pause()
      onComplete(isCorrect, timer.getTime(), finalMoves)
    },
    onReady: () => {
      timer.start()
    },
  })

  // Handle piece drop
  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (!isPlayerTurn || !sourceSquare || !targetSquare) {
        return false
      }

      setSelectedSquare(null)
      setLegalMoves([])

      return makePlayerMove(sourceSquare as Square, targetSquare as Square)
    },
    [isPlayerTurn, makePlayerMove]
  )

  // Handle square click (for click-to-move)
  const handleSquareClick = useCallback(
    ({ square }: SquareHandlerArgs) => {
      if (!isPlayerTurn) {
        return
      }

      const sq = square as Square

      // If a piece is already selected and this is a legal target
      if (selectedSquare && legalMoves.includes(sq)) {
        makePlayerMove(selectedSquare, sq)
        setSelectedSquare(null)
        setLegalMoves([])
        return
      }

      // Select the clicked square and get legal moves
      const moves = getLegalMoves(sq)
      if (moves.length > 0) {
        setSelectedSquare(sq)
        setLegalMoves(moves)
      } else {
        setSelectedSquare(null)
        setLegalMoves([])
      }
    },
    [isPlayerTurn, selectedSquare, legalMoves, makePlayerMove, getLegalMoves]
  )

  // Custom square styles for highlighting
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {}

    // Highlight last move
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(255, 255, 0, 0.3)',
      }
      styles[lastMove.to] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
      }
    }

    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(59, 130, 246, 0.5)', // blue-500
      }
    }

    // Highlight legal move targets
    legalMoves.forEach(sq => {
      styles[sq] = {
        ...styles[sq],
        background: styles[sq]?.backgroundColor
          ? `radial-gradient(circle, rgba(0, 0, 0, 0.2) 25%, transparent 25%), ${styles[sq].backgroundColor}`
          : 'radial-gradient(circle, rgba(0, 0, 0, 0.2) 25%, transparent 25%)',
        backgroundSize: '100% 100%',
      }
    })

    return styles
  }, [lastMove, selectedSquare, legalMoves])

  // Handle skip
  const handleSkip = useCallback(() => {
    timer.pause()
    onSkip(timer.getTime())
  }, [timer, onSkip])

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (promotionState.isOpen) {
          cancelPromotion()
        } else if (selectedSquare) {
          setSelectedSquare(null)
          setLegalMoves([])
        } else if (isPlayerTurn) {
          handleSkip()
        }
      }
    },
    [promotionState.isOpen, cancelPromotion, selectedSquare, isPlayerTurn, handleSkip]
  )

  // Chessboard options
  const chessboardOptions: ChessboardOptions = useMemo(() => ({
    position,
    boardOrientation: orientation,
    onPieceDrop: handlePieceDrop,
    onSquareClick: handleSquareClick,
    allowDragging: isPlayerTurn,
    animationDurationInMs: ANIMATION_DURATION,
    boardStyle: customBoardStyle,
    darkSquareStyle: customDarkSquareStyle,
    lightSquareStyle: customLightSquareStyle,
    squareStyles: customSquareStyles,
  }), [
    position,
    orientation,
    handlePieceDrop,
    handleSquareClick,
    isPlayerTurn,
    customSquareStyles,
  ])

  return (
    <div
      className="relative flex flex-col items-center gap-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Timer display */}
      <div className="font-mono text-2xl text-muted-foreground tabular-nums">
        {formatTime(timer.timeMs)}
      </div>

      {/* Chess board with feedback overlay */}
      <div className="relative w-full max-w-[480px] aspect-square">
        <Chessboard options={chessboardOptions} />

        {/* Feedback overlay */}
        <PuzzleFeedback status={status} />

        {/* Promotion dialog */}
        <PromotionDialog
          isOpen={promotionState.isOpen}
          color={promotionState.color}
          onSelect={handlePromotionSelect}
          onCancel={cancelPromotion}
        />
      </div>

      {/* Status indicator */}
      <div className="text-sm text-muted-foreground">
        <StatusText status={status} />
      </div>

      {/* Skip button */}
      {isPlayerTurn && (
        <button
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip (Esc)
        </button>
      )}
    </div>
  )
}

function StatusText({ status }: { status: PuzzleStatus }) {
  switch (status) {
    case 'loading':
      return <span>Loading puzzle...</span>
    case 'opponent_turn':
      return <span className="animate-pulse">Opponent moving...</span>
    case 'player_turn':
      return <span>Your move</span>
    case 'correct':
      return <span className="text-green-600">Correct!</span>
    case 'incorrect':
      return <span className="text-red-600">Incorrect</span>
    case 'complete':
      return <span className="text-green-600">Puzzle complete!</span>
    default:
      return null
  }
}
