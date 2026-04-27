'use client'

import { Button } from '@/components/ui/button'
import { SkipForward } from 'lucide-react'
import { TRAINING_SHORTCUTS } from '@/lib/training/keyboard-shortcuts'
import { ShortcutHints } from './shortcut-hints'

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
        aria-keyshortcuts={TRAINING_SHORTCUTS.skip.ariaKeyShortcuts}
      >
        <SkipForward className="mr-2 h-4 w-4" />
        <span>Skip</span>
        <ShortcutHints keys={TRAINING_SHORTCUTS.skip.hints} />
      </Button>
    </div>
  )
}
