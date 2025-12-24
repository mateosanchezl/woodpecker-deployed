'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import type {
  NextPuzzleResponse,
  AttemptResponse,
  CreateCycleResponse,
} from '@/lib/validations/training'

interface UseTrainingSessionOptions {
  puzzleSetId: string
  cycleId: string | null
}

interface UseTrainingSessionReturn {
  // Data
  puzzleData: NextPuzzleResponse['puzzleInSet'] & {
    puzzle: NextPuzzleResponse['puzzle']
  } | null
  progress: NextPuzzleResponse['progress'] | null
  isCycleComplete: boolean
  cycleStats: {
    solvedCorrect: number
    solvedIncorrect: number
    skipped: number
    totalTime: number | null
  } | null

  // Loading and error states
  isLoading: boolean
  error: Error | null

  // Actions
  recordAttempt: (
    puzzleInSetId: string,
    isCorrect: boolean,
    timeSpent: number,
    movesPlayed: string[]
  ) => Promise<void>
  recordSkip: (puzzleInSetId: string, timeSpent: number) => Promise<void>
  refetch: () => void
}

/**
 * Hook for managing a training session, including fetching puzzles and recording attempts.
 */
export function useTrainingSession(
  options: UseTrainingSessionOptions
): UseTrainingSessionReturn {
  const { puzzleSetId, cycleId } = options
  const queryClient = useQueryClient()

  // Query for fetching the next puzzle
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<NextPuzzleResponse & { isCycleComplete: boolean; cycleStats?: {
    solvedCorrect: number
    solvedIncorrect: number
    skipped: number
    totalTime: number | null
  } }>({
    queryKey: ['next-puzzle', puzzleSetId, cycleId],
    queryFn: async () => {
      if (!cycleId) {
        throw new Error('No active cycle')
      }
      const res = await fetch(
        `/api/training/puzzle-sets/${puzzleSetId}/next-puzzle?cycleId=${cycleId}`
      )
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch puzzle')
      }
      return res.json()
    },
    enabled: !!cycleId,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false,
  })

  // Mutation for recording attempts
  const attemptMutation = useMutation<
    AttemptResponse,
    Error,
    {
      puzzleInSetId: string
      timeSpent: number
      isCorrect: boolean
      wasSkipped: boolean
      movesPlayed: string[]
    }
  >({
    mutationFn: async ({ puzzleInSetId, timeSpent, isCorrect, wasSkipped, movesPlayed }) => {
      if (!cycleId) {
        throw new Error('No active cycle')
      }
      const res = await fetch(
        `/api/training/puzzle-sets/${puzzleSetId}/cycles/${cycleId}/attempts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            puzzleInSetId,
            timeSpent,
            isCorrect,
            wasSkipped,
            movesPlayed,
          }),
        }
      )
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to record attempt')
      }
      return res.json()
    },
    onSuccess: () => {
      // Invalidate and refetch the next puzzle
      queryClient.invalidateQueries({ queryKey: ['next-puzzle', puzzleSetId, cycleId] })
    },
  })

  // Record a puzzle attempt (correct or incorrect)
  const recordAttempt = useCallback(
    async (
      puzzleInSetId: string,
      isCorrect: boolean,
      timeSpent: number,
      movesPlayed: string[]
    ) => {
      await attemptMutation.mutateAsync({
        puzzleInSetId,
        timeSpent,
        isCorrect,
        wasSkipped: false,
        movesPlayed,
      })
    },
    [attemptMutation]
  )

  // Record a skip
  const recordSkip = useCallback(
    async (puzzleInSetId: string, timeSpent: number) => {
      await attemptMutation.mutateAsync({
        puzzleInSetId,
        timeSpent,
        isCorrect: false,
        wasSkipped: true,
        movesPlayed: [],
      })
    },
    [attemptMutation]
  )

  // Derive puzzle data
  const puzzleData = data?.puzzle && data?.puzzleInSet
    ? {
        ...data.puzzleInSet,
        puzzle: data.puzzle,
      }
    : null

  return {
    puzzleData,
    progress: data?.progress || null,
    isCycleComplete: data?.isCycleComplete || false,
    cycleStats: data?.cycleStats || null,
    isLoading: isLoading || attemptMutation.isPending,
    error: error || attemptMutation.error,
    recordAttempt,
    recordSkip,
    refetch,
  }
}

/**
 * Hook for creating a new training cycle.
 */
export function useCreateCycle(puzzleSetId: string) {
  const queryClient = useQueryClient()

  return useMutation<CreateCycleResponse, Error>({
    mutationFn: async () => {
      const res = await fetch(
        `/api/training/puzzle-sets/${puzzleSetId}/cycles`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      )
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create cycle')
      }
      return res.json()
    },
    onSuccess: () => {
      // Invalidate puzzle set data to refresh cycle list
      queryClient.invalidateQueries({ queryKey: ['puzzle-set', puzzleSetId] })
    },
  })
}

/**
 * Hook for fetching puzzle set cycles.
 */
export function usePuzzleSetCycles(puzzleSetId: string) {
  return useQuery<{
    cycles: Array<{
      id: string
      cycleNumber: number
      totalPuzzles: number
      solvedCorrect: number
      solvedIncorrect: number
      skipped: number
      totalTime: number | null
      startedAt: string
      completedAt: string | null
    }>
  }>({
    queryKey: ['puzzle-set-cycles', puzzleSetId],
    queryFn: async () => {
      const res = await fetch(`/api/training/puzzle-sets/${puzzleSetId}/cycles`)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch cycles')
      }
      return res.json()
    },
  })
}
