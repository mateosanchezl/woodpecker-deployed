'use client'

import { Button } from '@/components/ui/button'
import { SkipForward } from 'lucide-react'

interface PuzzleControlsProps {
  onSkip: () => void
  isDisabled?: boolean
}

/**
 * Control buttons for puzzle interaction.
 * Currently only includes skip functionality (no hints per Woodpecker method).
 */
export function PuzzleControls({ onSkip, isDisabled = false }: PuzzleControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onSkip}
        disabled={isDisabled}
        className="text-muted-foreground hover:text-foreground"
      >
        <SkipForward className="mr-2 h-4 w-4" />
        Skip
        <kbd className="ml-2 text-xs text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded">
          Esc
        </kbd>
      </Button>
    </div>
  )
}
