'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface LeaveTrainingModalProps {
  open: boolean
  onConfirmLeave: () => void
  onCancel: () => void
}

/**
 * A floating warning modal that appears when the user tries to navigate
 * away from an active training session. Warns them that unsaved progress
 * on the current puzzle will be lost.
 */
export function LeaveTrainingModal({
  open,
  onConfirmLeave,
  onCancel,
}: LeaveTrainingModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-sm"
      >
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
          </div>
          <DialogTitle>Leave training?</DialogTitle>
          <DialogDescription>
            Your progress on the current puzzle will be lost. Completed puzzles are saved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full"
          >
            Continue training
          </Button>
          <Button
            variant="ghost"
            onClick={onConfirmLeave}
            className="w-full text-muted-foreground"
          >
            Leave anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
