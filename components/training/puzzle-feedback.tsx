'use client'

import { cn } from '@/lib/utils'
import type { PuzzleStatus } from '@/lib/chess/types'

interface PuzzleFeedbackProps {
  status: PuzzleStatus
}

/**
 * Overlay component for showing correct/incorrect feedback.
 * Displays a subtle flash effect over the board.
 */
export function PuzzleFeedback({ status }: PuzzleFeedbackProps) {
  const showFeedback = status === 'correct' || status === 'incorrect'

  if (!showFeedback) {
    return null
  }

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none rounded transition-opacity duration-200',
        status === 'correct' && 'bg-green-500/20',
        status === 'incorrect' && 'bg-red-500/20'
      )}
      aria-hidden="true"
    />
  )
}
