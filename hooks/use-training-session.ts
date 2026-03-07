'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState, useEffect, useRef, useMemo } from 'react'
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
  autoStartNextPuzzle: boolean
}

type UserCacheData = {
  user: {
    totalXp?: number
    currentLevel?: number
    weeklyXp?: number
  } & Record<string, unknown>
}

type AttemptMutationContext = {
  previousData: TrainingSession | undefined
  usedPrefetchedNext: boolean
  shouldQueueNextSession: boolean
  shouldResetBoardOnError: boolean
}

interface UseTrainingSessionReturn {
  puzzleData: TrainingSession['current']
  progress: TrainingSession['progress'] | null
  isCycleComplete: boolean
  cycleStats: TrainingSession['cycleStats'] | null
  isLoading: boolean
  isSubmittingAttempt: boolean
  isTransitioning: boolean
  hasPendingAdvance: boolean
  error: Error | null
  puzzleRenderKey: number
  recordAttempt: (
    puzzleInSetId: string,
    isCorrect: boolean,
    timeSpent: number,
    movesPlayed: string[]
  ) => Promise<void>
  recordSkip: (puzzleInSetId: string, timeSpent: number) => Promise<void>
  advancePendingSession: () => void
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
  const { puzzleSetId, cycleId, autoStartNextPuzzle } = options
  const queryClient = useQueryClient()
  const sessionQueryKey = useMemo(
    () => ['training-session', puzzleSetId, cycleId] as const,
    [puzzleSetId, cycleId]
  )

  const [pendingAdvanceSession, setPendingAdvanceSession] = useState<TrainingSession | null>(null)
  const [isSubmittingAttempt, setIsSubmittingAttempt] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [puzzleRenderKey, setPuzzleRenderKey] = useState(0)
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
    setPendingAdvanceSession(null)
    setIsSubmittingAttempt(false)
    setIsTransitioning(false)
    currentPuzzleIdRef.current = null
    prefetchedRef.current = null
  }, [puzzleSetId, cycleId])

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
    prefetchedRef.current = prefetchedNext
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
    {
      previousData: TrainingSession | undefined
      usedPrefetchedNext: boolean
      shouldQueueNextSession: boolean
      shouldResetBoardOnError: boolean
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
        const error = (await res.json()) as { error?: string }
        const apiError = new Error(error.error || 'Failed to record attempt') as ApiError
        apiError.status = res.status
        throw apiError
      }

      return res.json()
    },
    onMutate: async (variables) => {
      const isFailedAttempt = !variables.isCorrect && !variables.wasSkipped
      const shouldQueueNextSession = isFailedAttempt || !autoStartNextPuzzle
      setPendingAdvanceSession(null)
      setIsSubmittingAttempt(true)

      await queryClient.cancelQueries({ queryKey: sessionQueryKey })

      const previousData = queryClient.getQueryData<TrainingSession>(sessionQueryKey)
      let usedPrefetchedNext = false

      if (!shouldQueueNextSession) {
        setIsTransitioning(true)
      }

      if (
        !shouldQueueNextSession &&
        prefetchedRef.current &&
        previousData &&
        !previousData.isCycleComplete
      ) {
        usedPrefetchedNext = true
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

      return {
        previousData,
        usedPrefetchedNext,
        shouldQueueNextSession,
        shouldResetBoardOnError: shouldQueueNextSession,
      } satisfies AttemptMutationContext
    },
    onSuccess: (response, _variables, context) => {
      setIsSubmittingAttempt(false)

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

      const shouldQueueResolvedSession =
        !!(
          context?.shouldQueueNextSession &&
          response.session &&
          !response.session.isCycleComplete
        )

      if (shouldQueueResolvedSession && response.session) {
        setPendingAdvanceSession(response.session)
        setIsTransitioning(false)
      } else if (response.session) {
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
      setIsSubmittingAttempt(false)
      setPendingAdvanceSession(null)

      if (context?.previousData) {
        queryClient.setQueryData(sessionQueryKey, context.previousData)
      }

      if (context?.shouldResetBoardOnError) {
        setPuzzleRenderKey((current) => current + 1)
      }

      queryClient.invalidateQueries({ queryKey: sessionQueryKey })
      setIsTransitioning(false)
      toast.error(mutationError.message || 'Failed to record attempt. Please try again.')
    },
  })

  const advancePendingSession = useCallback(() => {
    if (!pendingAdvanceSession) {
      return
    }

    setIsTransitioning(true)
    prefetchedRef.current = pendingAdvanceSession.prefetchedNext
    queryClient.setQueryData(sessionQueryKey, pendingAdvanceSession)
    setPendingAdvanceSession(null)
  }, [pendingAdvanceSession, queryClient, sessionQueryKey])

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
    isSubmittingAttempt,
    isTransitioning: isTransitioning || isFetching,
    hasPendingAdvance: pendingAdvanceSession !== null,
    error: error ?? null,
    puzzleRenderKey,
    recordAttempt,
    recordSkip,
    advancePendingSession,
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
