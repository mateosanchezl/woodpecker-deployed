'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'

interface UsePuzzleTimerOptions {
  autoStart?: boolean
  onTimeUpdate?: (ms: number) => void
}

export interface PuzzleTimerControls {
  start: () => void
  pause: () => void
  reset: () => void
  getTime: () => number
}

interface UsePuzzleTimerReturn {
  timeMs: number
  isRunning: boolean
  controls: PuzzleTimerControls
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

  const onTimeUpdateRef = useRef(onTimeUpdate)
  const isRunningRef = useRef(autoStart)

  // Refs for tracking elapsed time without render churn
  const startTimeRef = useRef<number | null>(null)
  const accumulatedTimeRef = useRef(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate
  }, [onTimeUpdate])

  const getCurrentTime = useCallback(() => {
    if (startTimeRef.current !== null) {
      return Math.floor(accumulatedTimeRef.current + (performance.now() - startTimeRef.current))
    }
    return Math.floor(accumulatedTimeRef.current)
  }, [])

  const emitTime = useCallback((nextTime: number) => {
    setTimeMs(nextTime)
    onTimeUpdateRef.current?.(nextTime)
  }, [])

  const clearTicker = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    emitTime(getCurrentTime())
  }, [emitTime, getCurrentTime])

  const start = useCallback(() => {
    if (isRunningRef.current) {
      return
    }

    startTimeRef.current = performance.now()
    isRunningRef.current = true
    setIsRunning(true)
    intervalRef.current = window.setInterval(tick, 100)
    tick()
  }, [tick])

  const pause = useCallback(() => {
    if (!isRunningRef.current || startTimeRef.current === null) {
      return
    }

    if (startTimeRef.current !== null) {
      const elapsed = performance.now() - startTimeRef.current
      accumulatedTimeRef.current += elapsed
    }
    startTimeRef.current = null
    isRunningRef.current = false
    setIsRunning(false)
    clearTicker()
    emitTime(getCurrentTime())
  }, [clearTicker, emitTime, getCurrentTime])

  const reset = useCallback(() => {
    clearTicker()
    isRunningRef.current = false
    setIsRunning(false)
    accumulatedTimeRef.current = 0
    startTimeRef.current = null
    emitTime(0)
  }, [clearTicker, emitTime])

  const getTime = useCallback(() => {
    return getCurrentTime()
  }, [getCurrentTime])

  const controls = useMemo<PuzzleTimerControls>(() => ({
    start,
    pause,
    reset,
    getTime,
  }), [start, pause, reset, getTime])

  useEffect(() => {
    return clearTicker
  }, [clearTicker])

  useEffect(() => {
    if (autoStart && !isRunningRef.current) {
      const timeoutId = window.setTimeout(() => {
        start()
      }, 0)
      return () => window.clearTimeout(timeoutId)
    }
  }, [autoStart, start])

  return {
    timeMs,
    isRunning,
    controls,
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
