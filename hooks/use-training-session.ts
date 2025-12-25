'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type {
  NextPuzzleResponse,
  AttemptResponse,
  CreateCycleResponse,
} from '@/lib/validations/training'

interface UseTrainingSessionOptions {
  puzzleSetId: string
  cycleId: string | null
}

// Extended response type including cycle completion data and prefetched puzzle
type PuzzleResponse = NextPuzzleResponse & {
  isCycleComplete: boolean
  cycleStats?: {
    solvedCorrect: number
    solvedIncorrect: number
    skipped: number
    totalTime: number | null
  }
  prefetchedNext?: {
    puzzle: NextPuzzleResponse['puzzle']
    puzzleInSet: NextPuzzleResponse['puzzleInSet']
  } | null
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
  isTransitioning: boolean // true during puzzle transition (after attempt recorded, before next puzzle ready)
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
 * Fetch puzzle helper function
 */
async function fetchNextPuzzle(puzzleSetId: string, cycleId: string): Promise<PuzzleResponse> {
  const res = await fetch(
    `/api/training/puzzle-sets/${puzzleSetId}/next-puzzle?cycleId=${cycleId}`
  )
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to fetch puzzle')
  }
  return res.json()
}

/**
 * Hook for managing a training session with puzzle prefetching.
 * Prefetches the next puzzle while the user is solving the current one
 * to eliminate wait time between puzzles.
 */
export function useTrainingSession(
  options: UseTrainingSessionOptions
): UseTrainingSessionReturn {
  const { puzzleSetId, cycleId } = options
  const queryClient = useQueryClient()

  // Track transitioning state (between recording attempt and showing next puzzle)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Track the current puzzle ID to detect when we've moved to the next puzzle
  const currentPuzzleIdRef = useRef<string | null>(null)

  // Query for fetching the next puzzle
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<PuzzleResponse>({
    queryKey: ['next-puzzle', puzzleSetId, cycleId],
    queryFn: async () => {
      if (!cycleId) {
        throw new Error('No active cycle')
      }
      return fetchNextPuzzle(puzzleSetId, cycleId)
    },
    enabled: !!cycleId,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false,
  })

  // When puzzle data changes, clear transitioning state
  useEffect(() => {
    if (data?.puzzleInSet?.id && data.puzzleInSet.id !== currentPuzzleIdRef.current) {
      currentPuzzleIdRef.current = data.puzzleInSet.id
      setIsTransitioning(false)
    }
    // Also clear transitioning when cycle completes
    if (data?.isCycleComplete) {
      setIsTransitioning(false)
    }
  }, [data?.puzzleInSet?.id, data?.isCycleComplete])

  // Store prefetched puzzle for instant transitions
  const prefetchedRef = useRef<PuzzleResponse['prefetchedNext'] | null>(null)

  // Update prefetched ref when data changes
  useEffect(() => {
    if (data?.prefetchedNext) {
      prefetchedRef.current = data.prefetchedNext
    }
  }, [data?.prefetchedNext])

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
    },
    { previousData: PuzzleResponse | undefined }
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
    onMutate: async () => {
      // Set transitioning state when mutation starts
      setIsTransitioning(true)

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['next-puzzle', puzzleSetId, cycleId] })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<PuzzleResponse>(['next-puzzle', puzzleSetId, cycleId])

      // If we have prefetched data, optimistically update to it
      if (prefetchedRef.current && previousData) {
        const optimisticData: PuzzleResponse = {
          puzzle: prefetchedRef.current.puzzle,
          puzzleInSet: prefetchedRef.current.puzzleInSet,
          progress: {
            ...previousData.progress,
            currentPosition: prefetchedRef.current.puzzleInSet.position,
            completedInCycle: previousData.progress.completedInCycle + 1,
          },
          isCycleComplete: false,
          prefetchedNext: null, // Will be fetched with the real request
        }
        queryClient.setQueryData(['next-puzzle', puzzleSetId, cycleId], optimisticData)
        // Clear the prefetch ref since we used it
        prefetchedRef.current = null
      }

      return { previousData }
    },
    onSuccess: (data) => {
      // Refetch to get the real data and next prefetch
      queryClient.invalidateQueries({ queryKey: ['next-puzzle', puzzleSetId, cycleId] })
      
      // Show achievement unlock toasts
      if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
        // Dynamically import to avoid circular dependencies
        import('@/components/achievements/achievement-unlock-toast').then(
          ({ showAchievementUnlockToasts }) => {
            showAchievementUnlockToasts(data.unlockedAchievements!)
          }
        )
        // Invalidate achievements cache so the achievements page updates
        queryClient.invalidateQueries({ queryKey: ['achievements'] })
      }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['next-puzzle', puzzleSetId, cycleId], context.previousData)
      }
      // Clear transitioning on error
      setIsTransitioning(false)
      toast.error('Failed to record attempt. Please try again.')
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
    isLoading: isLoading,
    isTransitioning: isTransitioning || attemptMutation.isPending || isFetching,
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
      toast.success('New cycle started!')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create cycle')
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
