'use client'

import { useState } from 'react'
import { AlertOctagon, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const MIN_MESSAGE_LENGTH = 12
const MAX_MESSAGE_LENGTH = 1200

export interface TrainingBugReportContext {
  puzzleSetId: string | null
  cycleId: string | null
  cycleNumber: number | null
  puzzleInSetId: string | null
  puzzleId: string | null
  puzzlePosition: number | null
  isCycleComplete: boolean
  sessionError: string | null
}

interface TrainingBugReportProps {
  context: TrainingBugReportContext
  className?: string
}

export function TrainingBugReport({
  context,
  className,
}: TrainingBugReportProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setMessage('')
    setValidationError(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen && !isSubmitting) {
      resetForm()
    }
  }

  const handleSubmit = async () => {
    const trimmedMessage = message.trim()

    if (trimmedMessage.length < MIN_MESSAGE_LENGTH) {
      setValidationError(
        `Please add at least ${MIN_MESSAGE_LENGTH} characters so we can reproduce it.`
      )
      return
    }

    setValidationError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/training/bug-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...context,
          message: trimmedMessage,
          currentUrl: window.location.href,
        }),
      })

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error || "Couldn't send your report. Please try again.")
      }

      toast.success('Bug report sent')
      resetForm()
      setOpen(false)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Couldn't send your report. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const remainingCharacters = MAX_MESSAGE_LENGTH - message.length

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex w-full items-center justify-start gap-2 rounded-lg border border-transparent px-2.5 py-1.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:border-border/70 hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
      >
        <AlertOctagon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">Report an issue</span>
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Report a training issue</DialogTitle>
            <DialogDescription>
              Briefly describe what happened. Current training context is attached automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label
              htmlFor="training-bug-report-message"
              className="text-sm font-medium"
            >
              What went wrong?
            </label>
            <textarea
              id="training-bug-report-message"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value)
                if (validationError) {
                  setValidationError(null)
                }
              }}
              rows={5}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder="Board froze after I solved the puzzle."
              className="flex min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <div className="flex items-center justify-between gap-3 text-xs">
              <span
                className={cn(
                  'text-muted-foreground',
                  validationError && 'text-destructive'
                )}
              >
                {validationError || `Context is attached automatically.`}
              </span>
              <span className="shrink-0 text-muted-foreground">
                {remainingCharacters}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
