'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getLevelTitle } from '@/lib/xp'

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  newLevel: number
}

export function LevelUpModal({ isOpen, onClose, newLevel }: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const { title, icon } = getLevelTitle(newLevel)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="space-y-4">
          <div className="mx-auto relative">
            <div
              className={`text-7xl transition-transform duration-500 ${
                showConfetti ? 'scale-125 animate-bounce' : 'scale-100'
              }`}
            >
              {icon}
            </div>
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Simple sparkle effect */}
                <div className="absolute -top-2 -left-2 text-2xl animate-ping">
                  ✨
                </div>
                <div className="absolute -top-2 -right-2 text-2xl animate-ping delay-100">
                  ✨
                </div>
                <div className="absolute -bottom-2 -left-4 text-2xl animate-ping delay-200">
                  ✨
                </div>
                <div className="absolute -bottom-2 -right-4 text-2xl animate-ping delay-300">
                  ✨
                </div>
              </div>
            )}
          </div>
          <DialogTitle className="text-2xl">Level Up!</DialogTitle>
          <DialogDescription className="text-lg">
            You reached{' '}
            <span className="font-semibold text-primary">Level {newLevel}</span>
            <br />
            <span className="text-muted-foreground">{title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            Keep training to reach even higher levels and unlock new titles!
          </p>
          <Button onClick={onClose} className="w-full">
            Continue Training
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
