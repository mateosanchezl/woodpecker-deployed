'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type {
  AttemptResponse,
  CreateCycleResponse,
  TrainingSession,
  TrainingSessionResponse,
} from '@/lib/validations/training'

interface ApiError extends Error {
  status?: number
}

interface UseTrainingSessionOptions {
  puzzleSetId: string
  cycleId: string | null
}

type UserCacheData = {
  user: {
    totalXp?: number
    currentLevel?: number
    weeklyXp?: number
  } & Record<string, unknown>
}

interface UseTrainingSessionReturn {
  puzzleData: TrainingSession['current']
  progress: TrainingSession['progress'] | null
  isCycleComplete: boolean
  cycleStats: TrainingSession['cycleStats'] | null
  isLoading: boolean
  isTransitioning: boolean
  error: Error | null
  recordAttempt: (
    puzzleInSetId: string,
    isCorrect: boolean,
    timeSpent: number,
    movesPlayed: string[]
  ) => Promise<void>
  recordSkip: (puzzleInSetId: string, timeSpent: number) => Promise<void>
  refetch: () => void
}

async function fetchTrainingSession(
  puzzleSetId: string,
  cycleId: string
): Promise<TrainingSession> {
  const res = await fetch(
    `/api/training/puzzle-sets/${puzzleSetId}/cycles/${cycleId}/session`
  )
  if (!res.ok) {
    const error = (await res.json()) as { error?: string }
    const apiError = new Error(
      error.error || 'Failed to fetch training session'
    ) as ApiError
    apiError.status = res.status
    throw apiError
  }

  const data = (await res.json()) as TrainingSessionResponse
  return data.session
}

export function useTrainingSession(
  options: UseTrainingSessionOptions
): UseTrainingSessionReturn {
  const { puzzleSetId, cycleId } = options
  const queryClient = useQueryClient()
  const sessionQueryKey = ['training-session', puzzleSetId, cycleId] as const

  const [isTransitioning, setIsTransitioning] = useState(false)
  const currentPuzzleIdRef = useRef<string | null>(null)
  const prefetchedRef = useRef<TrainingSession['prefetchedNext'] | null>(null)

  const { data, isLoading, error, refetch, isFetching } = useQuery<TrainingSession>({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      if (!cycleId) {
        throw new Error('No active cycle')
      }
      return fetchTrainingSession(puzzleSetId, cycleId)
    },
    enabled: !!cycleId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  const currentPuzzleId = data?.current?.puzzleInSet.id ?? null
  const isCycleComplete = data?.isCycleComplete ?? false
  const prefetchedNext = data?.prefetchedNext ?? null

  useEffect(() => {
    if (currentPuzzleId && currentPuzzleId !== currentPuzzleIdRef.current) {
      currentPuzzleIdRef.current = currentPuzzleId
      setIsTransitioning(false)
    }

    if (isCycleComplete) {
      setIsTransitioning(false)
    }
  }, [currentPuzzleId, isCycleComplete])

  useEffect(() => {
    if (prefetchedNext) {
      prefetchedRef.current = prefetchedNext
    }
  }, [prefetchedNext])

  const attemptMutation = useMutation<
    AttemptResponse,
    ApiError,
    {
      puzzleInSetId: string
      timeSpent: number
      isCorrect: boolean
      wasSkipped: boolean
      movesPlayed: string[]
    },
    { previousData: TrainingSession | undefined; usedPrefetchedNext: boolean }
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
        const error = (await res.json()) as { error?: string }
        const apiError = new Error(error.error || 'Failed to record attempt') as ApiError
        apiError.status = res.status
        throw apiError
      }

      return res.json()
    },
    onMutate: async () => {
      setIsTransitioning(true)

      await queryClient.cancelQueries({ queryKey: sessionQueryKey })

      const previousData = queryClient.getQueryData<TrainingSession>(sessionQueryKey)
      const usedPrefetchedNext = !!(prefetchedRef.current && previousData)

      if (prefetchedRef.current && previousData && !previousData.isCycleComplete) {
        const optimisticData: TrainingSession = {
          current: prefetchedRef.current,
          prefetchedNext: null,
          progress: {
            ...previousData.progress,
            currentPosition: prefetchedRef.current.puzzleInSet.position,
            completedInCycle: previousData.progress.completedInCycle + 1,
          },
          isCycleComplete: false,
          cycleStats: previousData.cycleStats,
        }

        queryClient.setQueryData(sessionQueryKey, optimisticData)
        prefetchedRef.current = null
      }

      return { previousData, usedPrefetchedNext }
    },
    onSuccess: (response, _variables, context) => {
      if (response.xp) {
        const xp = response.xp
        queryClient.setQueryData<UserCacheData>(['user'], (oldData) => {
          if (!oldData?.user) {
            return oldData
          }

          return {
            ...oldData,
            user: {
              ...oldData.user,
              totalXp: xp.newTotal,
              currentLevel: xp.newLevel,
              weeklyXp:
                (typeof oldData.user.weeklyXp === 'number' ? oldData.user.weeklyXp : 0) +
                xp.gained,
            },
          }
        })
      }

      if (response.session) {
        queryClient.setQueryData(sessionQueryKey, response.session)
      } else if (response.isLastPuzzle || !context?.usedPrefetchedNext) {
        queryClient.invalidateQueries({ queryKey: sessionQueryKey })
      }

      if (response.isLastPuzzle) {
        queryClient.invalidateQueries({ queryKey: ['user'] })
      }

      if (response.unlockedAchievements && response.unlockedAchievements.length > 0) {
        import('@/components/achievements/achievement-unlock-toast').then(
          ({ showAchievementUnlockToasts }) => {
            showAchievementUnlockToasts(response.unlockedAchievements!)
          }
        )
        queryClient.invalidateQueries({ queryKey: ['achievements'] })
      }
    },
    onError: (mutationError, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(sessionQueryKey, context.previousData)
      }

      if (mutationError.status === 409) {
        queryClient.invalidateQueries({ queryKey: sessionQueryKey })
      }

      setIsTransitioning(false)
      toast.error(mutationError.message || 'Failed to record attempt. Please try again.')
    },
  })

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

  return {
    puzzleData: data?.current ?? null,
    progress: data?.progress ?? null,
    isCycleComplete: data?.isCycleComplete ?? false,
    cycleStats: data?.cycleStats ?? null,
    isLoading,
    isTransitioning: isTransitioning || attemptMutation.isPending || isFetching,
    error: error || attemptMutation.error,
    recordAttempt,
    recordSkip,
    refetch,
  }
}

export function useCreateCycle() {
  const queryClient = useQueryClient()

  return useMutation<CreateCycleResponse, Error, string>({
    mutationFn: async (puzzleSetId) => {
      const res = await fetch(`/api/training/puzzle-sets/${puzzleSetId}/cycles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create cycle')
      }
      return res.json()
    },
    onSuccess: (data, puzzleSetId) => {
      queryClient.invalidateQueries({ queryKey: ['puzzle-set', puzzleSetId] })
      queryClient.invalidateQueries({ queryKey: ['puzzle-sets'] })

      if (data.session) {
        queryClient.setQueryData(
          ['training-session', puzzleSetId, data.cycle.id],
          data.session
        )
      }

      toast.success('New cycle started!')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create cycle')
    },
  })
}

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
