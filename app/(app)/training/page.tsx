'use client'

import { useState, useCallback, Suspense, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrainingSession } from '@/components/training/training-session'
import {
  useTrainingSession,
  useCreateCycle,
} from '@/hooks/use-training-session'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Play,
  Target,
  TrendingUp,
  MoreVertical,
  Trash2,
  Clock,
  Flame,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStreak } from '@/hooks/use-streak'
import { useNavigationGuard } from '@/hooks/use-navigation-guard'
import { getStreakMessage } from '@/lib/streak-milestones'
import { LeaveTrainingModal } from '@/components/training/leave-training-modal'
import { cn } from '@/lib/utils'
import { resolveBoardTheme } from '@/lib/chess/board-themes'
import { getTrainingThemeLabel } from '@/lib/chess/training-themes'

interface PuzzleSetData {
  id: string
  name: string
  size: number
  focusTheme: string | null
  targetCycles: number
  targetRating: number
  isActive: boolean
  currentCycle: number | null
  currentCycleId: string | null
  completedCycles: number
  lastTrainedAt: string | null
}

interface UserPreferenceData {
  user: {
    autoStartNextPuzzle: boolean
    boardTheme?: string | null
  }
}

/**
 * Training page - main entry point for puzzle training.
 * Shows puzzle sets and allows starting/continuing training cycles.
 */
export default function TrainingPage() {
  return (
    <Suspense fallback={<TrainingPageSkeleton />}>
      <TrainingPageContent />
    </Suspense>
  )
}

function TrainingPageContent() {
  const searchParams = useSearchParams()
  const urlSetId = searchParams.get('setId')
  const urlCycleId = searchParams.get('cycleId')
  const quickstart = searchParams.get('quickstart') === '1'
  const key = `${urlSetId ?? ''}:${urlCycleId ?? ''}:${quickstart ? '1' : ''}`

  return (
    <TrainingPageInner
      key={key}
      urlSetId={urlSetId}
      urlCycleId={urlCycleId}
      quickstart={quickstart}
    />
  )
}

function TrainingPageInner({
  urlSetId,
  urlCycleId,
  quickstart,
}: {
  urlSetId: string | null
  urlCycleId: string | null
  quickstart: boolean
}) {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch user's active puzzle sets
  const { data: puzzleSets, isLoading: loadingSets } = useQuery<{
    sets: PuzzleSetData[]
  }>({
    queryKey: ['puzzle-sets'],
    queryFn: async () => {
      const res = await fetch('/api/training/puzzle-sets')
      if (!res.ok) {
        throw new Error('Failed to fetch puzzle sets')
      }
      return res.json()
    },
  })

  const {
    data: userData,
    isLoading: isLoadingUserPreferences,
    error: userPreferencesError,
    refetch: refetchUserPreferences,
  } = useQuery<UserPreferenceData>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch user')
      }
      return res.json()
    },
    staleTime: 60000,
  })

  const [selectedSetId, setSelectedSetId] = useState<string | null>(urlSetId)
  const [activeCycleId, setActiveCycleId] = useState<string | null>(urlCycleId)
  const autoStartNextPuzzle = userData?.user.autoStartNextPuzzle
  const boardTheme = resolveBoardTheme(userData?.user.boardTheme)

  // Delete puzzle set mutation
  const deleteMutation = useMutation({
    mutationFn: async (setId: string) => {
      const res = await fetch(`/api/training/puzzle-sets/${setId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        throw new Error('Failed to delete puzzle set')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puzzle-sets'] })
      setSelectedSetId(null)
      toast.success('Puzzle set deleted')
    },
    onError: () => {
      toast.error('Failed to delete puzzle set')
    },
  })

  // Quick start mutation
  const quickStartMutation = useMutation<{
    puzzleSet: {
      id: string
    }
    cycle: {
      id: string
    }
  }, Error>({
    mutationFn: async () => {
      const res = await fetch('/api/training/quick-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to quick start')
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['puzzle-sets'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      setSelectedSetId(data.puzzleSet.id)
      setActiveCycleId(data.cycle.id)
      router.replace(`/training?setId=${data.puzzleSet.id}&cycleId=${data.cycle.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to quick start')
    },
  })

  // Create cycle mutation
  const createCycleMutation = useCreateCycle()

  const updateAutoStartNextPuzzleMutation = useMutation<
    UserPreferenceData,
    Error,
    boolean,
    { previousUserData?: UserPreferenceData }
  >({
    mutationFn: async (autoStartNextPuzzle) => {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoStartNextPuzzle }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update training pace')
      }
      return res.json()
    },
    onMutate: async (autoStartNextPuzzle) => {
      await queryClient.cancelQueries({ queryKey: ['user'] })

      const previousUserData = queryClient.getQueryData<UserPreferenceData>(['user'])

      queryClient.setQueryData<UserPreferenceData>(['user'], oldData => {
        if (!oldData?.user) {
          return oldData
        }

        return {
          ...oldData,
          user: {
            ...oldData.user,
            autoStartNextPuzzle,
          },
        }
      })

      return { previousUserData }
    },
    onError: (error, _value, context) => {
      if (context?.previousUserData) {
        queryClient.setQueryData(['user'], context.previousUserData)
      }

      toast.error(error.message || 'Failed to update training pace')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  // Training session hook
  const trainingSession = useTrainingSession({
    puzzleSetId: selectedSetId || '',
    cycleId: activeCycleId,
    autoStartNextPuzzle: autoStartNextPuzzle ?? true,
  })

  const hasNoSets = !loadingSets && (puzzleSets?.sets?.length ?? 0) === 0
  const quickStartTriggeredRef = useRef(false)

  useEffect(() => {
    if (!quickstart || !hasNoSets || activeCycleId || quickStartTriggeredRef.current) {
      return
    }

    quickStartTriggeredRef.current = true
    quickStartMutation.mutate()
  }, [quickstart, hasNoSets, activeCycleId, quickStartMutation])

  // Handle starting a new cycle
  const handleStartCycle = useCallback(async (setId: string) => {
    if (!setId) return

    try {
      setSelectedSetId(setId)
      const result = await createCycleMutation.mutateAsync(setId)
      setActiveCycleId(result.cycle.id)
    } catch (error) {
      console.error('Failed to start cycle:', error)
    }
  }, [createCycleMutation])

  // Handle puzzle completion
  const handlePuzzleComplete = useCallback(
    async (
      puzzleInSetId: string,
      isCorrect: boolean,
      timeSpent: number,
      movesPlayed: string[]
    ) => {
      await trainingSession.recordAttempt(puzzleInSetId, isCorrect, timeSpent, movesPlayed)
    },
    [trainingSession]
  )

  // Handle skip
  const handleSkip = useCallback(
    async (puzzleInSetId: string, timeSpent: number) => {
      await trainingSession.recordSkip(puzzleInSetId, timeSpent)
    },
    [trainingSession]
  )

  const handleAutoStartNextPuzzleChange = useCallback(
    (autoStartNextPuzzle: boolean) => {
      updateAutoStartNextPuzzleMutation.mutate(autoStartNextPuzzle)
    },
    [updateAutoStartNextPuzzleMutation]
  )

  // Handle starting next cycle after completion
  const handleStartNextCycle = useCallback(async () => {
    if (selectedSetId) {
      await handleStartCycle(selectedSetId)
    }
  }, [handleStartCycle, selectedSetId])

  // Handle delete
  const handleDelete = useCallback((setId: string) => {
    if (confirm('Are you sure you want to delete this puzzle set? This action cannot be undone.')) {
      deleteMutation.mutate(setId)
    }
  }, [deleteMutation])

  const hasLoadedTrainingPreference = typeof autoStartNextPuzzle === 'boolean'

  // Navigation guard - active when training is in progress and cycle not complete
  const isTrainingActive = !!(
    activeCycleId &&
    selectedSetId &&
    !trainingSession.isCycleComplete
  )
  const { showModal, confirmLeave, cancelLeave } = useNavigationGuard({
    enabled: isTrainingActive,
  })

  // Loading state
  if (loadingSets) {
    return <TrainingPageSkeleton />
  }

  if (activeCycleId && selectedSetId && !hasLoadedTrainingPreference && isLoadingUserPreferences) {
    return <TrainingPageSkeleton />
  }

  if (activeCycleId && selectedSetId && !hasLoadedTrainingPreference) {
    return (
      <div className="py-4">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Could not load training preferences
            </CardTitle>
            <CardDescription>
              {userPreferencesError instanceof Error
                ? userPreferencesError.message
                : 'Training pace and board theme are stored in your user settings. Reload those preferences before starting the session so the board and puzzle flow load correctly.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetchUserPreferences()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Training in progress
  if (activeCycleId && selectedSetId) {
    return (
      <div className="py-4">
        <TrainingSession
          puzzleData={trainingSession.puzzleData ? {
            id: trainingSession.puzzleData.puzzleInSet.id,
            position: trainingSession.puzzleData.puzzleInSet.position,
            totalAttempts: trainingSession.puzzleData.puzzleInSet.totalAttempts,
            correctAttempts: trainingSession.puzzleData.puzzleInSet.correctAttempts,
            averageTime: trainingSession.puzzleData.puzzleInSet.averageTime,
            puzzle: trainingSession.puzzleData.puzzle,
          } : null}
          progress={trainingSession.progress}
          isLoading={trainingSession.isLoading}
          isSubmittingAttempt={trainingSession.isSubmittingAttempt}
          isTransitioning={trainingSession.isTransitioning}
          error={trainingSession.error}
          canAdvanceToNext={trainingSession.hasPendingAdvance}
          autoStartNextPuzzle={autoStartNextPuzzle ?? true}
          isUpdatingAutoStartNextPuzzle={updateAutoStartNextPuzzleMutation.isPending}
          boardTheme={boardTheme}
          onPuzzleComplete={handlePuzzleComplete}
          onSkip={handleSkip}
          onAdvanceToNextPuzzle={trainingSession.advancePendingSession}
          onAutoStartNextPuzzleChange={handleAutoStartNextPuzzleChange}
          onRetry={trainingSession.refetch}
          isCycleComplete={trainingSession.isCycleComplete}
          cycleStats={trainingSession.cycleStats || undefined}
          onStartNextCycle={handleStartNextCycle}
          puzzleRenderKey={trainingSession.puzzleRenderKey}
          bugReportContext={{
            puzzleSetId: selectedSetId,
            cycleId: activeCycleId,
            cycleNumber: trainingSession.progress?.cycleNumber ?? null,
            puzzleInSetId: trainingSession.puzzleData?.puzzleInSet.id ?? null,
            puzzleId: trainingSession.puzzleData?.puzzle.id ?? null,
            puzzlePosition: trainingSession.puzzleData?.puzzleInSet.position ?? null,
            isCycleComplete: trainingSession.isCycleComplete,
            sessionError: trainingSession.error?.message ?? null,
          }}
        />
        <LeaveTrainingModal
          open={showModal}
          onConfirmLeave={confirmLeave}
          onCancel={cancelLeave}
        />
      </div>
    )
  }

  // No puzzle sets
  if (!puzzleSets?.sets || puzzleSets.sets.length === 0) {
    if (quickstart && !quickStartMutation.isError) {
      return <QuickStartLoadingCard />
    }

    if (quickStartMutation.isPending) {
      return <QuickStartLoadingCard />
    }

    return (
      <QuickStartCard
        onQuickStart={() => quickStartMutation.mutate()}
        isStarting={quickStartMutation.isPending}
        error={quickStartMutation.isError ? quickStartMutation.error?.message : null}
      />
    )
  }

  // Find the last trained set (first in sorted list with training activity)
  const lastTrainedSet = puzzleSets.sets.find(s => s.lastTrainedAt !== null)
  const otherSets = puzzleSets.sets.filter(s => s.id !== lastTrainedSet?.id)

  // Puzzle set selection / cycle start
  return (
    <div className="py-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Training</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Select a puzzle set to begin or continue training
        </p>
      </div>

      {/* Streak Encouragement Banner */}
      <StreakBanner />

      {/* Continue Training Section */}
      {lastTrainedSet && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Continue Training
          </h2>
          <ContinueTrainingCard
            set={lastTrainedSet}
            onStart={() => handleStartCycle(lastTrainedSet.id)}
            onContinue={(cycleId) => {
              setSelectedSetId(lastTrainedSet.id)
              setActiveCycleId(cycleId)
            }}
            onDelete={() => handleDelete(lastTrainedSet.id)}
            isStarting={createCycleMutation.isPending && selectedSetId === lastTrainedSet.id}
            isDeleting={deleteMutation.isPending}
          />
        </div>
      )}

      {/* Other Puzzle Sets */}
      {otherSets.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {lastTrainedSet ? 'Other Puzzle Sets' : 'Your Puzzle Sets'}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherSets.map(set => (
              <PuzzleSetCard
                key={set.id}
                set={set}
                onStart={() => handleStartCycle(set.id)}
                onContinue={(cycleId) => {
                  setSelectedSetId(set.id)
                  setActiveCycleId(cycleId)
                }}
                onDelete={() => handleDelete(set.id)}
                isStarting={createCycleMutation.isPending && selectedSetId === set.id}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface ContinueTrainingCardProps {
  set: PuzzleSetData
  onStart: () => void
  onContinue: (cycleId: string) => void
  onDelete: () => void
  isStarting: boolean
  isDeleting: boolean
}

function ContinueTrainingCard({
  set,
  onStart,
  onContinue,
  onDelete,
  isStarting,
  isDeleting,
}: ContinueTrainingCardProps) {
  const hasActiveCycle = set.currentCycleId !== null

  return (
    <Card className="border-primary/50 shadow-md shadow-primary/5 bg-linear-to-br from-card to-primary/5 overflow-hidden transition-all hover:shadow-lg hover:border-primary/80 duration-300 relative group">
      <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-primary/0 via-primary/50 to-primary/0" />
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl group-hover:text-primary transition-colors">{set.name}</CardTitle>
            <CardDescription className="flex flex-wrap gap-1.5 items-center mt-1">
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {set.size} puzzles
              </span>
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                ~{set.targetRating}
              </span>
              {set.focusTheme && (
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {getTrainingThemeLabel(set.focusTheme)}
                </span>
              )}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem
                variant="destructive"
                onClick={onDelete}
                disabled={isDeleting}
                className="rounded-lg"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Target className="h-4 w-4 text-amber-500" />
            <span>{set.targetCycles} cycles</span>
          </div>
          {set.currentCycle && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span>On cycle {set.currentCycle}</span>
            </div>
          )}
          {set.lastTrainedAt && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span>{formatRelativeTime(set.lastTrainedAt)}</span>
            </div>
          )}
        </div>

        {hasActiveCycle ? (
          <Button
            size="lg"
            className="w-full gap-2 rounded-xl h-12 text-base transition-transform active:scale-[0.98] shadow-md shadow-primary/20"
            onClick={() => onContinue(set.currentCycleId!)}
          >
            <Play className="h-5 w-5 fill-current" />
            Continue Training
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full gap-2 rounded-xl h-12 text-base transition-transform active:scale-[0.98]"
            onClick={onStart}
            disabled={isStarting}
            variant="secondary"
          >
            <Play className="h-5 w-5" />
            {isStarting ? 'Starting...' : `Start Cycle ${(set.completedCycles || 0) + 1}`}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface PuzzleSetCardProps {
  set: PuzzleSetData
  onStart: () => void
  onContinue: (cycleId: string) => void
  onDelete: () => void
  isStarting: boolean
  isDeleting: boolean
}

function PuzzleSetCard({
  set,
  onStart,
  onContinue,
  onDelete,
  isStarting,
  isDeleting,
}: PuzzleSetCardProps) {
  const hasActiveCycle = set.currentCycleId !== null

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md hover:border-primary/20 duration-300 group flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">{set.name}</CardTitle>
            <CardDescription className="flex flex-wrap gap-1.5 items-center mt-1">
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {set.size} puzzles
              </span>
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                ~{set.targetRating}
              </span>
              {set.focusTheme && (
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {getTrainingThemeLabel(set.focusTheme)}
                </span>
              )}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem
                variant="destructive"
                onClick={onDelete}
                disabled={isDeleting}
                className="rounded-lg"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 flex-1 flex flex-col justify-end">
        <div className="flex items-center gap-5 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Target className="h-4 w-4 text-amber-500" />
            <span>{set.targetCycles} cycles</span>
          </div>
          {set.currentCycle && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span>Cycle {set.currentCycle}</span>
            </div>
          )}
        </div>

        <Button
          className="w-full gap-2 rounded-xl h-11 mt-2 transition-transform active:scale-[0.98]"
          onClick={() => hasActiveCycle ? onContinue(set.currentCycleId!) : onStart()}
          disabled={!hasActiveCycle && isStarting}
          variant={hasActiveCycle ? "default" : "secondary"}
        >
          <Play className="h-4 w-4" />
          {hasActiveCycle ? 'Continue Training' : (isStarting ? 'Starting...' : `Start Cycle ${(set.completedCycles || 0) + 1}`)}
        </Button>
      </CardContent>
    </Card>
  )
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function TrainingPageSkeleton() {
  return (
    <div className="py-4 space-y-8">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function QuickStartCard({
  onQuickStart,
  isStarting,
  error,
}: {
  onQuickStart: () => void
  isStarting: boolean
  error: string | null
}) {
  return (
    <div className="py-12">
      <Card className="max-w-2xl mx-auto border-primary/20 shadow-lg shadow-primary/5 bg-linear-to-b from-card to-primary/5 overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-primary/0 via-primary to-primary/0 opacity-50" />
        <CardHeader className="text-center space-y-3 pb-6 pt-10">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2 animate-in fade-in zoom-in duration-500">
            <Play className="h-8 w-8 text-primary ml-1" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Start Your First Set</CardTitle>
          <CardDescription className="text-base text-muted-foreground max-w-md mx-auto">
            You repeat a fixed set in cycles. Each cycle gets faster as patterns become automatic.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-10">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button onClick={onQuickStart} disabled={isStarting} size="lg" className="gap-2 w-full sm:w-auto rounded-xl text-base px-8 h-12 transition-transform hover:scale-105 active:scale-95 shadow-md shadow-primary/20">
              {isStarting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-current" />
                  Start Training Now
                </>
              )}
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 w-full sm:w-auto rounded-xl text-base px-8 h-12 hover:bg-primary/5">
              <Link href="/training/new">Customize First Set</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Want the full method?{' '}
            <Link href="/woodpecker-method" className="underline underline-offset-4 hover:text-primary transition-colors font-medium">
              Learn the Woodpecker Method
            </Link>
          </p>
          {error && (
            <p className="text-sm text-red-600 text-center font-medium">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function QuickStartLoadingCard() {
  return (
    <div className="py-4">
      <Card className="max-w-xl mx-auto">
        <CardHeader className="text-center space-y-2">
          <CardTitle>Setting up your first puzzle set...</CardTitle>
          <CardDescription>
            Picking puzzles and creating your first cycle.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  )
}

function StreakBanner() {
  const { data: streak, isLoading } = useStreak()

  if (isLoading || !streak) {
    return null
  }

  const message = getStreakMessage(
    streak.currentStreak,
    streak.isActiveToday,
    streak.isAtRisk
  )

  const hasStreak = streak.currentStreak > 0

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300',
        hasStreak
          ? 'bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/50 shadow-sm hover:shadow-md'
          : 'bg-muted/50 border border-border hover:bg-muted/80',
        streak.isAtRisk && 'animate-pulse'
      )}
    >
      <div
        className={cn(
          'p-2.5 rounded-full',
          hasStreak
            ? 'bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-sm'
            : 'bg-muted-foreground/10 text-muted-foreground'
        )}
      >
        <Flame className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className={cn(
          'text-sm font-medium',
          streak.isAtRisk ? 'text-amber-700 dark:text-amber-300' : 'text-foreground'
        )}>
          {message}
        </p>
      </div>
      {hasStreak && (
        <div className="text-right flex items-baseline gap-1.5 bg-background/50 px-3 py-1 rounded-lg">
          <span className={cn(
            'text-2xl font-bold tabular-nums',
            'text-amber-600 dark:text-amber-400'
          )}>
            {streak.currentStreak}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {streak.currentStreak === 1 ? 'day' : 'days'}
          </span>
        </div>
      )}
    </div>
  )
}
