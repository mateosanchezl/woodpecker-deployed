'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  PieceDropHandlerArgs,
  PieceHandlerArgs,
  SquareHandlerArgs,
} from 'react-chessboard'
import type { Square } from '@/lib/chess/types'
import type { LegalMoveTarget } from '@/hooks/use-chess-puzzle'

interface UseBoardInteractionControllerOptions {
  canInteract: boolean
  isPlayerTurn: boolean
  playerColor: 'w' | 'b'
  makePlayerMove: (from: Square, to: Square) => boolean
  getLegalMoveTargets: (square: Square) => LegalMoveTarget[]
}

interface UseBoardInteractionControllerReturn {
  selectedSquare: Square | null
  legalTargets: LegalMoveTarget[]
  allowDragging: boolean
  canDragPiece: (args: PieceHandlerArgs) => boolean
  dragActivationDistance: number
  handlePieceDrop: (args: PieceDropHandlerArgs) => boolean
  handleSquareClick: (args: SquareHandlerArgs) => void
  clearSelection: () => void
}

const DROP_CLICK_DEDUPE_MS = 180

function getPieceColor(pieceType?: string): 'w' | 'b' | null {
  const color = pieceType?.[0]?.toLowerCase()
  if (color === 'w' || color === 'b') {
    return color
  }
  return null
}

function useCoarsePointer(): boolean {
  const [isCoarsePointer, setIsCoarsePointer] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)')
    const updatePointer = () => setIsCoarsePointer(mediaQuery.matches)
    updatePointer()
    mediaQuery.addEventListener('change', updatePointer)
    return () => mediaQuery.removeEventListener('change', updatePointer)
  }, [])

  return isCoarsePointer
}

export function useBoardInteractionController({
  canInteract,
  isPlayerTurn,
  playerColor,
  makePlayerMove,
  getLegalMoveTargets,
}: UseBoardInteractionControllerOptions): UseBoardInteractionControllerReturn {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [legalTargets, setLegalTargets] = useState<LegalMoveTarget[]>([])
  const isCoarsePointer = useCoarsePointer()
  const lastDropAtRef = useRef(0)

  const clearSelection = useCallback(() => {
    setSelectedSquare(null)
    setLegalTargets([])
  }, [])

  const allowDragging = canInteract && isPlayerTurn
  const dragActivationDistance = isCoarsePointer ? 6 : 1

  const canDragPiece = useCallback(({ isSparePiece, piece, square }: PieceHandlerArgs): boolean => {
    if (!allowDragging || isSparePiece || !square) {
      return false
    }

    return getPieceColor(piece.pieceType) === playerColor
  }, [allowDragging, playerColor])

  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (!allowDragging || !sourceSquare || !targetSquare || sourceSquare === targetSquare) {
        return false
      }

      if (isCoarsePointer) {
        lastDropAtRef.current = performance.now()
      }

      clearSelection()
      return makePlayerMove(sourceSquare as Square, targetSquare as Square)
    },
    [allowDragging, isCoarsePointer, clearSelection, makePlayerMove]
  )

  const handleSquareClick = useCallback(
    ({ square }: SquareHandlerArgs) => {
      if (!canInteract || !isPlayerTurn) {
        return
      }

      if (
        isCoarsePointer &&
        performance.now() - lastDropAtRef.current <= DROP_CLICK_DEDUPE_MS
      ) {
        return
      }

      const nextSquare = square as Square

      if (selectedSquare === nextSquare) {
        clearSelection()
        return
      }

      if (selectedSquare && legalTargets.some(target => target.to === nextSquare)) {
        makePlayerMove(selectedSquare, nextSquare)
        clearSelection()
        return
      }

      const nextLegalTargets = getLegalMoveTargets(nextSquare)
      if (nextLegalTargets.length > 0) {
        setSelectedSquare(nextSquare)
        setLegalTargets(nextLegalTargets)
      } else {
        clearSelection()
      }
    },
    [
      canInteract,
      isPlayerTurn,
      isCoarsePointer,
      selectedSquare,
      legalTargets,
      clearSelection,
      makePlayerMove,
      getLegalMoveTargets,
    ]
  )

  return useMemo(() => ({
    selectedSquare,
    legalTargets,
    allowDragging,
    canDragPiece,
    dragActivationDistance,
    handlePieceDrop,
    handleSquareClick,
    clearSelection,
  }), [
    selectedSquare,
    legalTargets,
    allowDragging,
    canDragPiece,
    dragActivationDistance,
    handlePieceDrop,
    handleSquareClick,
    clearSelection,
  ])
}
