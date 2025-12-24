'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface UsePuzzleTimerOptions {
  autoStart?: boolean
  onTimeUpdate?: (ms: number) => void
}

interface UsePuzzleTimerReturn {
  timeMs: number
  isRunning: boolean
  start: () => void
  pause: () => void
  reset: () => void
  getTime: () => number
}

/**
 * Hook for tracking puzzle solving time with high precision.
 * Uses requestAnimationFrame for smooth updates.
 */
export function usePuzzleTimer(
  options: UsePuzzleTimerOptions = {}
): UsePuzzleTimerReturn {
  const { autoStart = false, onTimeUpdate } = options

  const [timeMs, setTimeMs] = useState(0)
  const [isRunning, setIsRunning] = useState(autoStart)

  // Refs for tracking time without causing re-renders
  const startTimeRef = useRef<number | null>(null)
  const accumulatedTimeRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)

  // Update function called on each animation frame
  const updateTime = useCallback(() => {
    if (startTimeRef.current !== null) {
      const elapsed = performance.now() - startTimeRef.current
      const totalTime = accumulatedTimeRef.current + elapsed
      setTimeMs(Math.floor(totalTime))
      onTimeUpdate?.(Math.floor(totalTime))
      animationFrameRef.current = requestAnimationFrame(updateTime)
    }
  }, [onTimeUpdate])

  // Start the timer
  const start = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = performance.now()
      setIsRunning(true)
      animationFrameRef.current = requestAnimationFrame(updateTime)
    }
  }, [isRunning, updateTime])

  // Pause the timer
  const pause = useCallback(() => {
    if (isRunning && startTimeRef.current !== null) {
      // Accumulate the elapsed time
      const elapsed = performance.now() - startTimeRef.current
      accumulatedTimeRef.current += elapsed
      startTimeRef.current = null
      setIsRunning(false)

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isRunning])

  // Reset the timer to zero
  const reset = useCallback(() => {
    pause()
    accumulatedTimeRef.current = 0
    startTimeRef.current = null
    setTimeMs(0)
  }, [pause])

  // Get current time (useful for final value before recording)
  const getTime = useCallback(() => {
    if (startTimeRef.current !== null) {
      const elapsed = performance.now() - startTimeRef.current
      return Math.floor(accumulatedTimeRef.current + elapsed)
    }
    return Math.floor(accumulatedTimeRef.current)
  }, [])

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !isRunning) {
      start()
    }
  }, [autoStart, isRunning, start])

  return {
    timeMs,
    isRunning,
    start,
    pause,
    reset,
    getTime,
  }
}

/**
 * Format milliseconds to MM:SS.s format for display.
 */
export function formatTime(ms: number): string {
  const totalSeconds = ms / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const tenths = Math.floor((ms % 1000) / 100)

  const minutesStr = minutes.toString().padStart(2, '0')
  const secondsStr = seconds.toString().padStart(2, '0')

  return `${minutesStr}:${secondsStr}.${tenths}`
}

/**
 * Format milliseconds to a shorter format for stats display.
 */
export function formatTimeShort(ms: number): string {
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes === 0) {
    return `${seconds}s`
  }

  return `${minutes}m ${seconds}s`
}
