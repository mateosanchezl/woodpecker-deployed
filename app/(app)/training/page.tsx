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
import { Play, Target, TrendingUp, MoreVertical, Trash2, Clock, Flame, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useStreak } from '@/hooks/use-streak'
import { useNavigationGuard } from '@/hooks/use-navigation-guard'
import { getStreakMessage } from '@/lib/streak-milestones'
import { LeaveTrainingModal } from '@/components/training/leave-training-modal'
import { cn } from '@/lib/utils'
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

  const [selectedSetId, setSelectedSetId] = useState<string | null>(urlSetId)
  const [activeCycleId, setActiveCycleId] = useState<string | null>(urlCycleId)

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
  const createCycleMutation = useCreateCycle(selectedSetId || '')

  // Training session hook
  const trainingSession = useTrainingSession({
    puzzleSetId: selectedSetId || '',
    cycleId: activeCycleId,
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
      const result = await createCycleMutation.mutateAsync()
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

  // Navigation guard - active when training is in progress and cycle not complete
  const isTrainingActive = !!(activeCycleId && selectedSetId && !trainingSession.isCycleComplete)
  const { showModal, confirmLeave, cancelLeave } = useNavigationGuard({
    enabled: isTrainingActive,
  })

  // Loading state
  if (loadingSets) {
    return <TrainingPageSkeleton />
  }

  // Training in progress
  if (activeCycleId && selectedSetId) {
    return (
      <div className="py-4">
        <TrainingSession
          puzzleData={trainingSession.puzzleData ? {
            id: trainingSession.puzzleData.id,
            position: trainingSession.puzzleData.position,
            totalAttempts: trainingSession.puzzleData.totalAttempts,
            correctAttempts: trainingSession.puzzleData.correctAttempts,
            averageTime: trainingSession.puzzleData.averageTime,
            puzzle: trainingSession.puzzleData.puzzle,
          } : null}
          progress={trainingSession.progress}
          isLoading={trainingSession.isLoading}
          isTransitioning={trainingSession.isTransitioning}
          error={trainingSession.error}
          onPuzzleComplete={handlePuzzleComplete}
          onSkip={handleSkip}
          onRetry={trainingSession.refetch}
          isCycleComplete={trainingSession.isCycleComplete}
          cycleStats={trainingSession.cycleStats || undefined}
          onStartNextCycle={handleStartNextCycle}
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
        <h1 className="text-2xl font-semibold">Training</h1>
        <p className="text-muted-foreground mt-1">
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
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{set.name}</CardTitle>
            <CardDescription>
              {set.size} puzzles at ~{set.targetRating} rating
              {set.focusTheme ? ` · ${getTrainingThemeLabel(set.focusTheme)}` : ''}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                onClick={onDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>{set.targetCycles} cycles</span>
          </div>
          {set.currentCycle && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>On cycle {set.currentCycle}</span>
            </div>
          )}
          {set.lastTrainedAt && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatRelativeTime(set.lastTrainedAt)}</span>
            </div>
          )}
        </div>

        {hasActiveCycle ? (
          <Button
            size="lg"
            className="w-full"
            onClick={() => onContinue(set.currentCycleId!)}
          >
            <Play className="mr-2 h-4 w-4" />
            Continue Training
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full"
            onClick={onStart}
            disabled={isStarting}
          >
            <Play className="mr-2 h-4 w-4" />
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
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-lg truncate">{set.name}</CardTitle>
            <CardDescription>
              {set.size} puzzles at ~{set.targetRating} rating
              {set.focusTheme ? ` · ${getTrainingThemeLabel(set.focusTheme)}` : ''}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                onClick={onDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>{set.targetCycles} cycles</span>
          </div>
          {set.currentCycle && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>Cycle {set.currentCycle}</span>
            </div>
          )}
        </div>

        {hasActiveCycle ? (
          <Button
            className="w-full"
            onClick={() => onContinue(set.currentCycleId!)}
          >
            <Play className="mr-2 h-4 w-4" />
            Continue Training
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={onStart}
            disabled={isStarting}
          >
            <Play className="mr-2 h-4 w-4" />
            {isStarting ? 'Starting...' : `Start Cycle ${(set.completedCycles || 0) + 1}`}
          </Button>
        )}
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
    <div className="py-4">
      <Card className="max-w-xl mx-auto">
        <CardHeader className="text-center space-y-2">
          <CardTitle>Start Training Now</CardTitle>
          <CardDescription>
            You repeat a fixed set in cycles. Each cycle gets faster as patterns become automatic.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onQuickStart} disabled={isStarting} className="gap-2">
              {isStarting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Training Now
                </>
              )}
            </Button>
            <Button asChild variant="outline">
              <Link href="/training/new">Customize First Set</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Want the full method?{' '}
            <Link href="/woodpecker-method" className="underline underline-offset-2">
              Learn the Woodpecker Method
            </Link>
          </p>
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
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
        'flex items-center gap-3 px-4 py-3 rounded-lg',
        hasStreak
          ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800'
          : 'bg-muted/50 border border-border',
        streak.isAtRisk && 'animate-pulse'
      )}
    >
      <div
        className={cn(
          'p-2 rounded-full',
          hasStreak
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
            : 'bg-muted'
        )}
      >
        <Flame className={cn('h-4 w-4', !hasStreak && 'text-muted-foreground')} />
      </div>
      <div className="flex-1">
        <p className={cn(
          'text-sm font-medium',
          streak.isAtRisk && 'text-amber-700 dark:text-amber-300'
        )}>
          {message}
        </p>
      </div>
      {hasStreak && (
        <div className="text-right">
          <span className={cn(
            'text-lg font-bold tabular-nums',
            'text-amber-600 dark:text-amber-400'
          )}>
            {streak.currentStreak}
          </span>
          <span className="text-sm text-muted-foreground ml-1">
            {streak.currentStreak === 1 ? 'day' : 'days'}
          </span>
        </div>
      )}
    </div>
  )
}
