'use client'

import { useState, useCallback, useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import type { ChessboardOptions, SquareHandlerArgs, PieceDropHandlerArgs } from 'react-chessboard'
import { useChessPuzzle } from '@/hooks/use-chess-puzzle'
import { usePuzzleTimer } from '@/hooks/use-puzzle-timer'
import type { Square, PuzzleStatus } from '@/lib/chess/types'
import { ANIMATION_DURATION } from '@/lib/chess/types'
import { PromotionDialog } from './promotion-dialog'
import { PuzzleFeedback } from './puzzle-feedback'

interface PuzzleBoardProps {
  fen: string
  moves: string
  onComplete: (isCorrect: boolean, timeSpent: number, movesPlayed: string[]) => void
  onSkip: (timeSpent: number) => void
  disabled?: boolean // Disable interactions during transitions
  timer: ReturnType<typeof usePuzzleTimer>
}

// Custom board colors matching the new "Woodpecker" nature theme
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
 * Handles the complete puzzle solving flow with animations and feedback.
 */
export function PuzzleBoard({ fen, moves, onComplete, onSkip, disabled, timer }: PuzzleBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [legalMoves, setLegalMoves] = useState<Square[]>([])

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

      // Ignore drops on the same square (not a move)
      if (sourceSquare === targetSquare) {
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

      // If clicking the same square that's selected, deselect it
      if (selectedSquare === sq) {
        setSelectedSquare(null)
        setLegalMoves([])
        return
      }

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

  // Effective player turn (disabled during transitions)
  // Allow dragging during loading/opponent_turn so the board is responsive when ready
  // The makePlayerMove function already guards against moves during wrong states
  const canInteract = !disabled && status !== 'incorrect' && status !== 'complete'

  // Chessboard options
  const chessboardOptions: ChessboardOptions = useMemo(() => ({
    position,
    boardOrientation: orientation,
    onPieceDrop: handlePieceDrop,
    onSquareClick: handleSquareClick,
    allowDragging: canInteract,
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
    canInteract,
    customSquareStyles,
  ])

  return (
    <div
      className="relative flex flex-col items-center gap-4 w-full"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Chess board with feedback overlay */}
      <div className="relative w-full max-w-[700px] aspect-square shadow-2xl rounded-xl overflow-hidden">
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
      <div className="text-lg font-medium text-muted-foreground">
        <StatusText status={status} />
      </div>
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
