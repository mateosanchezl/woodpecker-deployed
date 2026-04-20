'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Chess, type Move } from 'chess.js'
import type {
  PuzzleStatus,
  BoardOrientation,
  Square,
  PromotionState,
} from '@/lib/chess/types'
import {
  ANIMATION_DURATION,
  OPPONENT_MOVE_DELAY,
  FEEDBACK_DISPLAY_TIME,
} from '@/lib/chess/types'
import {
  parseUciMove,
  toUciMove,
  getOrientationFromFen,
  parseSolutionMoves,
  isAcceptedPuzzleMove,
} from '@/lib/chess/puzzle-engine'

interface UseChessPuzzleOptions {
  fen: string
  solutionMoves: string // Space-separated UCI moves
  allowAnyFinalCheckmate?: boolean
  onCorrectMove?: () => void
  onIncorrectMove?: () => void
  onPuzzleComplete?: (isCorrect: boolean, movesPlayed: string[]) => void
  onReady?: () => void // Called when puzzle is ready for player input
}

export interface LegalMoveTarget {
  to: Square
  isCapture: boolean
  requiresPromotion: boolean
}

interface UseChessPuzzleReturn {
  // State
  position: string
  orientation: BoardOrientation
  status: PuzzleStatus
  currentMoveIndex: number
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
  getLegalMoveTargets: (square: Square) => LegalMoveTarget[]
}

/**
 * Core hook for managing chess puzzle state and move validation.
 * Handles the complete puzzle flow including opponent moves and feedback.
 */
export function useChessPuzzle(options: UseChessPuzzleOptions): UseChessPuzzleReturn {
  const {
    fen,
    solutionMoves,
    allowAnyFinalCheckmate = false,
    onCorrectMove,
    onIncorrectMove,
    onPuzzleComplete,
    onReady,
  } = options

  const solutionMovesArray = parseSolutionMoves(solutionMoves)
  const orientation = getOrientationFromFen(fen)

  const chessRef = useRef<Chess>(new Chess())
  const onCorrectMoveRef = useRef(onCorrectMove)
  const onIncorrectMoveRef = useRef(onIncorrectMove)
  const onPuzzleCompleteRef = useRef(onPuzzleComplete)
  const onReadyRef = useRef(onReady)
  const movesPlayedRef = useRef<string[]>([])
  const runTokenRef = useRef(0)
  const pendingTimeoutsRef = useRef<Set<number>>(new Set())
  const pendingDelayResolversRef = useRef<Map<number, (isStillActive: boolean) => void>>(new Map())
  const isMountedRef = useRef(true)

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

  const isPlayerTurn = status === 'player_turn'

  useEffect(() => {
    onCorrectMoveRef.current = onCorrectMove
    onIncorrectMoveRef.current = onIncorrectMove
    onPuzzleCompleteRef.current = onPuzzleComplete
    onReadyRef.current = onReady
  }, [onCorrectMove, onIncorrectMove, onPuzzleComplete, onReady])

  const isRunActive = useCallback((runToken: number) => {
    return isMountedRef.current && runTokenRef.current === runToken
  }, [])

  const cancelPendingAsyncWork = useCallback(() => {
    runTokenRef.current += 1
    pendingTimeoutsRef.current.forEach(timeoutId => {
      window.clearTimeout(timeoutId)
      pendingDelayResolversRef.current.get(timeoutId)?.(false)
    })
    pendingTimeoutsRef.current.clear()
    pendingDelayResolversRef.current.clear()
  }, [])

  const waitFor = useCallback((ms: number, runToken: number): Promise<boolean> => {
    if (!isRunActive(runToken)) {
      return Promise.resolve(false)
    }

    return new Promise(resolve => {
      const timeoutId = window.setTimeout(() => {
        pendingTimeoutsRef.current.delete(timeoutId)
        pendingDelayResolversRef.current.delete(timeoutId)
        resolve(isRunActive(runToken))
      }, ms)
      pendingTimeoutsRef.current.add(timeoutId)
      pendingDelayResolversRef.current.set(timeoutId, resolve)
    })
  }, [isRunActive])

  const getLegalCandidatesForMove = useCallback((from: Square, to: Square): Move[] => {
    try {
      return chessRef.current.moves({ square: from, verbose: true }).filter(move => move.to === to)
    } catch {
      return []
    }
  }, [])

  const initialize = useCallback(async () => {
    cancelPendingAsyncWork()
    const runToken = runTokenRef.current

    try {
      const chess = new Chess()
      chess.load(fen)
      chessRef.current = chess

      const moves = parseSolutionMoves(solutionMoves)

      setPosition(fen)
      setStatus('loading')
      setCurrentMoveIndex(0)
      setLastMove(null)
      setMovesPlayed([])
      movesPlayedRef.current = []
      setPromotionState({ isOpen: false, from: null, to: null, color: 'w' })

      if (!(await waitFor(OPPONENT_MOVE_DELAY, runToken))) {
        return
      }

      if (moves.length > 0) {
        const firstMove = parseUciMove(moves[0])
        setStatus('opponent_turn')

        const result = chessRef.current.move({
          from: firstMove.from,
          to: firstMove.to,
          promotion: firstMove.promotion,
        })

        if (result) {
          if (!isRunActive(runToken)) {
            return
          }

          setPosition(chessRef.current.fen())
          setLastMove({ from: firstMove.from, to: firstMove.to })
          setCurrentMoveIndex(1)

          if (!(await waitFor(ANIMATION_DURATION, runToken))) {
            return
          }

          if (!isRunActive(runToken)) {
            return
          }

          setStatus('player_turn')
          onReadyRef.current?.()
        } else {
          console.error('Failed to play first move:', moves[0], 'FEN:', fen)
          if (!isRunActive(runToken)) {
            return
          }
          setStatus('player_turn')
          onReadyRef.current?.()
        }
      } else {
        if (!isRunActive(runToken)) {
          return
        }
        setStatus('player_turn')
        onReadyRef.current?.()
      }
    } catch (error) {
      console.error('Failed to initialize puzzle:', error)
      if (isRunActive(runToken)) {
        setStatus('player_turn')
      }
    }
  }, [cancelPendingAsyncWork, fen, solutionMoves, waitFor, isRunActive])

  const playOpponentMove = useCallback(async (moveIndex: number, runToken: number): Promise<boolean> => {
    if (!isRunActive(runToken)) {
      return false
    }

    if (moveIndex >= solutionMovesArray.length) {
      setStatus('complete')
      onPuzzleCompleteRef.current?.(true, [...movesPlayedRef.current])
      return true
    }

    setStatus('opponent_turn')
    if (!(await waitFor(OPPONENT_MOVE_DELAY, runToken))) {
      return false
    }

    const moveUci = solutionMovesArray[moveIndex]
    if (!moveUci) {
      return false
    }

    const parsed = parseUciMove(moveUci)

    const result = chessRef.current.move({
      from: parsed.from,
      to: parsed.to,
      promotion: parsed.promotion,
    })

    if (!result) {
      console.error('Failed to play opponent move:', moveUci)
      if (isRunActive(runToken)) {
        setStatus('player_turn')
      }
      return false
    }

    if (!isRunActive(runToken)) {
      return false
    }

    setPosition(chessRef.current.fen())
    setLastMove({ from: parsed.from, to: parsed.to })
    setCurrentMoveIndex(moveIndex + 1)

    if (!(await waitFor(ANIMATION_DURATION, runToken))) {
      return false
    }

    if (!isRunActive(runToken)) {
      return false
    }

    if (moveIndex + 1 >= solutionMovesArray.length) {
      setStatus('complete')
      onPuzzleCompleteRef.current?.(true, [...movesPlayedRef.current])
      return true
    }

    setStatus('player_turn')
    return true
  }, [solutionMovesArray, waitFor, isRunActive])

  const executePlayerMove = useCallback(async (
    from: Square,
    to: Square,
    promotion?: string
  ): Promise<boolean> => {
    if (status !== 'player_turn') {
      return false
    }

    const expectedMoveUci = solutionMovesArray[currentMoveIndex]
    if (!expectedMoveUci) {
      return false
    }

    const legalCandidates = getLegalCandidatesForMove(from, to)
    if (legalCandidates.length === 0) {
      return false
    }

    const moveRequiresPromotion = legalCandidates.some(move => Boolean(move.promotion))
    if (moveRequiresPromotion && !promotion) {
      return false
    }

    if (promotion && !legalCandidates.some(move => move.promotion === promotion)) {
      return false
    }

    cancelPendingAsyncWork()
    const runToken = runTokenRef.current

    const isCorrect = isAcceptedPuzzleMove({
      fen: chessRef.current.fen(),
      from,
      to,
      promotion,
      expectedUci: expectedMoveUci,
      allowAnyFinalCheckmate,
      isFinalExpectedMove: currentMoveIndex === solutionMovesArray.length - 1,
    })

    if (!isCorrect) {
      setStatus('incorrect')
      onIncorrectMoveRef.current?.()

      if (!(await waitFor(FEEDBACK_DISPLAY_TIME, runToken))) {
        return false
      }

      if (!isRunActive(runToken)) {
        return false
      }

      const incorrectMoveUci = toUciMove(from, to, promotion)
      const finalMoves = [...movesPlayedRef.current, incorrectMoveUci]
      movesPlayedRef.current = finalMoves
      setMovesPlayed(finalMoves)
      onPuzzleCompleteRef.current?.(false, finalMoves)
      return false
    }

    const result = chessRef.current.move({
      from,
      to,
      promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
    })

    if (!result) {
      console.error('Legal move validation passed but chess.js rejected move')
      return false
    }

    if (!isRunActive(runToken)) {
      return false
    }

    const moveUci = toUciMove(from, to, promotion)
    const newMovesPlayed = [...movesPlayedRef.current, moveUci]
    movesPlayedRef.current = newMovesPlayed
    setMovesPlayed(newMovesPlayed)
    setPosition(chessRef.current.fen())
    setLastMove({ from, to })
    setStatus('correct')
    onCorrectMoveRef.current?.()

    const feedbackDelayBeforeOpponent = Math.min(FEEDBACK_DISPLAY_TIME, ANIMATION_DURATION)
    if (!(await waitFor(feedbackDelayBeforeOpponent, runToken))) {
      return false
    }

    if (!isRunActive(runToken)) {
      return false
    }

    const nextMoveIndex = currentMoveIndex + 1
    setCurrentMoveIndex(nextMoveIndex)
    await playOpponentMove(nextMoveIndex, runToken)

    return true
  }, [
    status,
    currentMoveIndex,
    solutionMovesArray,
    allowAnyFinalCheckmate,
    getLegalCandidatesForMove,
    cancelPendingAsyncWork,
    waitFor,
    playOpponentMove,
    isRunActive,
  ])

  const makePlayerMove = useCallback((
    from: Square,
    to: Square,
    promotion?: string
  ): boolean => {
    if (status !== 'player_turn') {
      return false
    }

    if (from === to) {
      return false
    }

    const legalCandidates = getLegalCandidatesForMove(from, to)
    if (legalCandidates.length === 0) {
      return false
    }

    const moveRequiresPromotion = legalCandidates.some(move => Boolean(move.promotion))
    if (moveRequiresPromotion && !promotion) {
      const piece = chessRef.current.get(from)
      setPromotionState({
        isOpen: true,
        from,
        to,
        color: piece?.color || 'w',
      })
      return false
    }

    if (promotion && !legalCandidates.some(move => move.promotion === promotion)) {
      return false
    }

    void executePlayerMove(from, to, promotion)
    return true
  }, [status, getLegalCandidatesForMove, executePlayerMove])

  const handlePromotionSelect = useCallback((piece: 'q' | 'r' | 'b' | 'n') => {
    if (promotionState.from && promotionState.to) {
      void executePlayerMove(promotionState.from, promotionState.to, piece)
    }
    setPromotionState({ isOpen: false, from: null, to: null, color: 'w' })
  }, [promotionState, executePlayerMove])

  const cancelPromotion = useCallback(() => {
    setPromotionState({ isOpen: false, from: null, to: null, color: 'w' })
  }, [])

  const reset = useCallback(() => {
    void initialize()
  }, [initialize])

  const getLegalMoveTargets = useCallback((square: Square): LegalMoveTarget[] => {
    if (status !== 'player_turn') {
      return []
    }

    const moves = chessRef.current.moves({ square, verbose: true })
    const targetMap = new Map<Square, LegalMoveTarget>()

    moves.forEach(move => {
      const targetSquare = move.to as Square
      const isCapture = move.flags.includes('c') || move.flags.includes('e')
      const requiresPromotion = Boolean(move.promotion)
      const existingTarget = targetMap.get(targetSquare)

      if (!existingTarget) {
        targetMap.set(targetSquare, {
          to: targetSquare,
          isCapture,
          requiresPromotion,
        })
        return
      }

      targetMap.set(targetSquare, {
        to: targetSquare,
        isCapture: existingTarget.isCapture || isCapture,
        requiresPromotion: existingTarget.requiresPromotion || requiresPromotion,
      })
    })

    return Array.from(targetMap.values())
  }, [status])

  const getLegalMoves = useCallback((square: Square): Square[] => {
    return getLegalMoveTargets(square).map(target => target.to)
  }, [getLegalMoveTargets])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void initialize()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
      cancelPendingAsyncWork()
    }
  }, [initialize, cancelPendingAsyncWork])

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      cancelPendingAsyncWork()
    }
  }, [cancelPendingAsyncWork])

  return {
    position,
    orientation,
    status,
    currentMoveIndex,
    lastMove,
    movesPlayed,
    isPlayerTurn,
    promotionState,
    makePlayerMove,
    handlePromotionSelect,
    cancelPromotion,
    reset,
    getLegalMoves,
    getLegalMoveTargets,
  }
}
