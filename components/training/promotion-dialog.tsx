'use client'

import { useEffect, useCallback, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import type { BoardOrientation, Square } from '@/lib/chess/types'

interface PromotionDialogProps {
  isOpen: boolean
  color: 'w' | 'b'
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void
  onCancel: () => void
  anchorSquare?: Square | null
  boardOrientation?: BoardOrientation
  boardContainerRef?: React.RefObject<HTMLElement | null>
}

const PROMOTION_PIECES = [
  { piece: 'q' as const, name: 'Queen' },
  { piece: 'r' as const, name: 'Rook' },
  { piece: 'b' as const, name: 'Bishop' },
  { piece: 'n' as const, name: 'Knight' },
]

// Unicode chess piece symbols
const PIECE_SYMBOLS: Record<string, Record<string, string>> = {
  w: { q: '\u2655', r: '\u2656', b: '\u2657', n: '\u2658' },
  b: { q: '\u265B', r: '\u265C', b: '\u265D', n: '\u265E' },
}

interface PromotionAnchorLayout {
  style: React.CSSProperties
  buttonSize: number
}

function getAnchorLayout({
  anchorSquare,
  boardOrientation,
  boardContainer,
}: {
  anchorSquare: Square | null | undefined
  boardOrientation: BoardOrientation
  boardContainer: HTMLElement | null | undefined
}): PromotionAnchorLayout | null {
  if (!anchorSquare || !boardContainer) {
    return null
  }

  const boardRect = boardContainer.getBoundingClientRect()
  const boardSize = Math.min(boardRect.width, boardRect.height)
  if (!Number.isFinite(boardSize) || boardSize <= 0) {
    return null
  }

  const file = anchorSquare.charCodeAt(0) - 97
  const rank = Number(anchorSquare[1])
  if (!Number.isFinite(file) || !Number.isFinite(rank) || file < 0 || file > 7 || rank < 1 || rank > 8) {
    return null
  }

  const squareSize = boardSize / 8
  const column = boardOrientation === 'black' ? 7 - file : file
  const row = boardOrientation === 'black' ? rank - 1 : 8 - rank

  const buttonSize = Math.round(Math.min(64, Math.max(44, squareSize * 0.92)))
  const buttonGap = 4 // Matches Tailwind `gap-1`.
  const panelWidth = buttonSize + 16
  const panelHeight = buttonSize * 4 + 16 + buttonGap * 3

  const anchorCenterX = column * squareSize + squareSize / 2
  let left = anchorCenterX - panelWidth / 2
  left = Math.max(6, Math.min(left, boardSize - panelWidth - 6))

  const preferDown = row <= 1
  const preferredTop = preferDown
    ? row * squareSize + squareSize + 4
    : row * squareSize - panelHeight - 4
  const top = Math.max(6, Math.min(preferredTop, boardSize - panelHeight - 6))

  return {
    style: {
      left: `${left}px`,
      top: `${top}px`,
    },
    buttonSize,
  }
}

/**
 * Modal dialog for selecting a promotion piece.
 * Shows Q/R/B/N options with piece symbols.
 */
export function PromotionDialog({
  isOpen,
  color,
  onSelect,
  onCancel,
  anchorSquare = null,
  boardOrientation = 'white',
  boardContainerRef,
}: PromotionDialogProps) {
  const [anchorLayout, setAnchorLayout] = useState<PromotionAnchorLayout | null>(null)

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key.toLowerCase()) {
        case 'q':
          onSelect('q')
          break
        case 'r':
          onSelect('r')
          break
        case 'b':
          onSelect('b')
          break
        case 'n':
        case 'k': // Some users might expect 'k' for knight
          onSelect('n')
          break
        case 'escape':
          onCancel()
          break
      }
    },
    [isOpen, onSelect, onCancel]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  useEffect(() => {
    if (!isOpen) {
      const timeoutId = window.setTimeout(() => {
        setAnchorLayout(null)
      }, 0)
      return () => window.clearTimeout(timeoutId)
    }

    const updateLayout = () => {
      setAnchorLayout(getAnchorLayout({
        anchorSquare,
        boardOrientation,
        boardContainer: boardContainerRef?.current,
      }))
    }

    const frameId = window.requestAnimationFrame(updateLayout)
    window.addEventListener('resize', updateLayout)
    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', updateLayout)
    }
  }, [isOpen, anchorSquare, boardOrientation, boardContainerRef])

  const panelStyle = useMemo<React.CSSProperties>(() => {
    if (anchorLayout) {
      return {
        ...anchorLayout.style,
        ['--promotion-button-size' as string]: `${anchorLayout.buttonSize}px`,
      }
    }

    return {
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }, [anchorLayout])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="absolute inset-0 z-20"
      role="dialog"
      aria-modal="true"
      aria-label="Select promotion piece"
    >
      <div
        className={cn(
          'absolute inset-0 rounded',
          anchorLayout ? 'bg-black/5' : 'bg-black/20'
        )}
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        className={cn(
          'absolute rounded-lg border bg-background p-2 shadow-lg',
          'flex flex-col gap-1'
        )}
        style={panelStyle}
      >
        {PROMOTION_PIECES.map(({ piece, name }) => (
          <button
            key={piece}
            onClick={() => onSelect(piece)}
            className={cn(
              'flex items-center justify-center rounded',
              'leading-none transition-colors hover:bg-accent',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              anchorLayout
                ? 'h-[var(--promotion-button-size)] w-[var(--promotion-button-size)] text-[calc(var(--promotion-button-size)*0.68)]'
                : 'h-14 w-14 text-5xl'
            )}
            title={`${name} (${piece.toUpperCase()})`}
            aria-label={`Promote to ${name}`}
          >
            {PIECE_SYMBOLS[color][piece]}
          </button>
        ))}
      </div>
    </div>
  )
}
