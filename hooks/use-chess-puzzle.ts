'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Chess } from 'chess.js'
import type {
  PuzzleState,
  PuzzleStatus,
  BoardOrientation,
  Square,
  PromotionState,
} from '@/lib/chess/types'
import {
  ANIMATION_DURATION,
  OPPONENT_MOVE_DELAY,
  FEEDBACK_DISPLAY_TIME,
  NEXT_PUZZLE_DELAY,
} from '@/lib/chess/types'
import {
  parseUciMove,
  toUciMove,
  getOrientationFromFen,
  parseSolutionMoves,
  isCorrectMove,
  isPromotionMove,
  sleep,
} from '@/lib/chess/puzzle-engine'

interface UseChessPuzzleOptions {
  fen: string
  solutionMoves: string // Space-separated UCI moves
  onCorrectMove?: () => void
  onIncorrectMove?: () => void
  onPuzzleComplete?: (isCorrect: boolean, movesPlayed: string[]) => void
  onReady?: () => void // Called when puzzle is ready for player input
}

interface UseChessPuzzleReturn {
  // State
  position: string
  orientation: BoardOrientation
  status: PuzzleStatus
  lastMove: { from: Square; to: Square } | null
  movesPlayed: string[]
  isPlayerTurn: boolean
  promotionState: PromotionState

  // Actions
  makePlayerMove: (from: Square, to: Square, promotion?: string) => boolean
  handlePromotionSelect: (piece: 'q' | 'r' | 'b' | 'n') => void
  cancelPromotion: () => void
  reset: () => void

  // For highlighting legal moves
  getLegalMoves: (square: Square) => Square[]
}

/**
 * Core hook for managing chess puzzle state and move validation.
 * Handles the complete puzzle flow including opponent moves and feedback.
 */
export function useChessPuzzle(options: UseChessPuzzleOptions): UseChessPuzzleReturn {
  const { fen, solutionMoves, onCorrectMove, onIncorrectMove, onPuzzleComplete, onReady } = options

  // Parse solution moves once
  const solutionMovesArray = parseSolutionMoves(solutionMoves)
  const orientation = getOrientationFromFen(fen)

  // Chess.js instance ref (mutable, doesn't trigger re-renders)
  const chessRef = useRef<Chess>(new Chess())

  // Track initialization to prevent race conditions
  const initIdRef = useRef(0)

  // State
  const [position, setPosition] = useState(fen)
  const [status, setStatus] = useState<PuzzleStatus>('loading')
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null)
  const [movesPlayed, setMovesPlayed] = useState<string[]>([])
  const [promotionState, setPromotionState] = useState<PromotionState>({
    isOpen: false,
    from: null,
    to: null,
    color: 'w',
  })

  // Derived state
  const isPlayerTurn = status === 'player_turn'

  // Initialize puzzle
  const initialize = useCallback(async () => {
    // Increment init ID to track this specific initialization
    const currentInitId = ++initIdRef.current

    try {
      // Create a fresh Chess instance and load the FEN
      const chess = new Chess()
      chess.load(fen)
      chessRef.current = chess

      // Parse the solution moves for this specific puzzle
      const moves = parseSolutionMoves(solutionMoves)

      setPosition(fen)
      setStatus('loading')
      setCurrentMoveIndex(0)
      setLastMove(null)
      setMovesPlayed([])
      setPromotionState({ isOpen: false, from: null, to: null, color: 'w' })

      // Brief delay before showing opponent's first move
      await sleep(OPPONENT_MOVE_DELAY)

      // Check if this initialization is still current (puzzle hasn't changed)
      if (initIdRef.current !== currentInitId) {
        return // Abort - puzzle changed during delay
      }

      // Play opponent's first move
      if (moves.length > 0) {
        const firstMove = parseUciMove(moves[0])
        setStatus('opponent_turn')

        const result = chessRef.current.move({
          from: firstMove.from,
          to: firstMove.to,
          promotion: firstMove.promotion,
        })

        if (result) {
          setPosition(chessRef.current.fen())
          setLastMove({ from: firstMove.from, to: firstMove.to })
          setCurrentMoveIndex(1)

          // Wait for animation
          await sleep(ANIMATION_DURATION)

          // Check again if still current
          if (initIdRef.current !== currentInitId) {
            return // Abort - puzzle changed during animation
          }

          // Ready for player
          setStatus('player_turn')
          onReady?.()
        } else {
          console.error('Failed to play first move:', moves[0], 'FEN:', fen)
          setStatus('player_turn')
          onReady?.()
        }
      } else {
        setStatus('player_turn')
        onReady?.()
      }
    } catch (error) {
      console.error('Failed to initialize puzzle:', error)
      // Only set status if this init is still current
      if (initIdRef.current === currentInitId) {
        setStatus('player_turn')
      }
    }
  }, [fen, solutionMoves, onReady])

  // Play opponent's next move
  const playOpponentMove = useCallback(async (moveIndex: number) => {
    if (moveIndex >= solutionMovesArray.length) {
      // Puzzle complete!
      setStatus('complete')
      onPuzzleComplete?.(true, movesPlayed)
      return
    }

    setStatus('opponent_turn')
    await sleep(OPPONENT_MOVE_DELAY)

    const moveUci = solutionMovesArray[moveIndex]
    const parsed = parseUciMove(moveUci)

    const result = chessRef.current.move({
      from: parsed.from,
      to: parsed.to,
      promotion: parsed.promotion,
    })

    if (result) {
      setPosition(chessRef.current.fen())
      setLastMove({ from: parsed.from, to: parsed.to })
      setCurrentMoveIndex(moveIndex + 1)

      await sleep(ANIMATION_DURATION)

      // Check if puzzle is complete
      if (moveIndex + 1 >= solutionMovesArray.length) {
        setStatus('complete')
        onPuzzleComplete?.(true, [...movesPlayed])
      } else {
        setStatus('player_turn')
      }
    } else {
      console.error('Failed to play opponent move:', moveUci)
      setStatus('player_turn')
    }
  }, [solutionMovesArray, movesPlayed, onPuzzleComplete])

  // Handle player move (internal, after promotion is resolved)
  const executePlayerMove = useCallback(async (
    from: Square,
    to: Square,
    promotion?: string
  ): Promise<boolean> => {
    if (status !== 'player_turn') {
      return false
    }

    // Check if this is the correct move
    const expectedMoveUci = solutionMovesArray[currentMoveIndex]
    if (!expectedMoveUci) {
      return false
    }

    const isCorrect = isCorrectMove(from, to, promotion, expectedMoveUci)

    if (!isCorrect) {
      // Wrong move - show feedback and fail
      setStatus('incorrect')
      onIncorrectMove?.()

      await sleep(FEEDBACK_DISPLAY_TIME)

      // Record the incorrect move
      const incorrectMoveUci = toUciMove(from, to, promotion)
      const finalMoves = [...movesPlayed, incorrectMoveUci]
      setMovesPlayed(finalMoves)

      await sleep(NEXT_PUZZLE_DELAY - FEEDBACK_DISPLAY_TIME)

      onPuzzleComplete?.(false, finalMoves)
      return false
    }

    // Correct move - execute it
    const result = chessRef.current.move({
      from,
      to,
      promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    })

    if (!result) {
      // This shouldn't happen if isCorrectMove passed, but handle it
      console.error('Legal move validation passed but chess.js rejected move')
      return false
    }

    // Update state
    const moveUci = toUciMove(from, to, promotion)
    const newMovesPlayed = [...movesPlayed, moveUci]
    setMovesPlayed(newMovesPlayed)
    setPosition(chessRef.current.fen())
    setLastMove({ from, to })
    setStatus('correct')
    onCorrectMove?.()

    await sleep(FEEDBACK_DISPLAY_TIME)

    // Play opponent's response
    const nextMoveIndex = currentMoveIndex + 1
    setCurrentMoveIndex(nextMoveIndex)
    await playOpponentMove(nextMoveIndex)

    return true
  }, [
    status,
    currentMoveIndex,
    solutionMovesArray,
    movesPlayed,
    onCorrectMove,
    onIncorrectMove,
    onPuzzleComplete,
    playOpponentMove,
  ])

  // Public method to make a player move
  const makePlayerMove = useCallback((
    from: Square,
    to: Square,
    promotion?: string
  ): boolean => {
    if (status !== 'player_turn') {
      return false
    }

    // Ignore same-square "moves" (not a real move)
    if (from === to) {
      return false
    }

    // Check if this is a promotion move
    if (isPromotionMove(position, from, to) && !promotion) {
      // Show promotion dialog
      const piece = chessRef.current.get(from)
      setPromotionState({
        isOpen: true,
        from,
        to,
        color: piece?.color || 'w',
      })
      return false // Move not executed yet
    }

    // Execute the move (async, but we return immediately)
    executePlayerMove(from, to, promotion)
    return true
  }, [status, position, executePlayerMove])

  // Handle promotion piece selection
  const handlePromotionSelect = useCallback((piece: 'q' | 'r' | 'b' | 'n') => {
    if (promotionState.from && promotionState.to) {
      executePlayerMove(promotionState.from, promotionState.to, piece)
    }
    setPromotionState({ isOpen: false, from: null, to: null, color: 'w' })
  }, [promotionState, executePlayerMove])

  // Cancel promotion dialog
  const cancelPromotion = useCallback(() => {
    setPromotionState({ isOpen: false, from: null, to: null, color: 'w' })
  }, [])

  // Reset to initial state
  const reset = useCallback(() => {
    initialize()
  }, [initialize])

  // Get legal moves from a square
  const getLegalMoves = useCallback((square: Square): Square[] => {
    if (status !== 'player_turn') {
      return []
    }
    const moves = chessRef.current.moves({ square, verbose: true })
    return moves.map(m => m.to as Square)
  }, [status])

  // Initialize on mount or when puzzle changes
  useEffect(() => {
    initialize()
  }, [fen, solutionMoves]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    position,
    orientation,
    status,
    lastMove,
    movesPlayed,
    isPlayerTurn,
    promotionState,
    makePlayerMove,
    handlePromotionSelect,
    cancelPromotion,
    reset,
    getLegalMoves,
  }
}
