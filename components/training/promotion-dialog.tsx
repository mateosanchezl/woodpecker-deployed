'use client'

import { useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface PromotionDialogProps {
  isOpen: boolean
  color: 'w' | 'b'
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void
  onCancel: () => void
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

/**
 * Modal dialog for selecting a promotion piece.
 * Shows Q/R/B/N options with piece symbols.
 */
export function PromotionDialog({
  isOpen,
  color,
  onSelect,
  onCancel,
}: PromotionDialogProps) {
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

  if (!isOpen) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 rounded"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-label="Select promotion piece"
      >
        <div className="bg-background border rounded-lg shadow-lg p-2 flex gap-1">
          {PROMOTION_PIECES.map(({ piece, name }) => (
            <button
              key={piece}
              onClick={() => onSelect(piece)}
              className={cn(
                'w-16 h-16 flex items-center justify-center',
                'text-5xl leading-none',
                'rounded hover:bg-accent transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
              title={`${name} (${piece.toUpperCase()})`}
              aria-label={`Promote to ${name}`}
            >
              {PIECE_SYMBOLS[color][piece]}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
