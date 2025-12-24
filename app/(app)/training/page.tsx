'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TrainingSession } from '@/components/training/training-session'
import {
  useTrainingSession,
  useCreateCycle,
  usePuzzleSetCycles,
} from '@/hooks/use-training-session'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Play, Target, TrendingUp } from 'lucide-react'
import type { PuzzleInSetData, TrainingProgress } from '@/lib/chess/types'

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

  // Fetch user's active puzzle sets
  const { data: puzzleSets, isLoading: loadingSets } = useQuery<{
    sets: Array<{
      id: string
      name: string
      size: number
      targetCycles: number
      targetRating: number
      isActive: boolean
      currentCycle: number | null
      currentCycleId: string | null
    }>
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
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)

  // Get cycles for selected set
  const { data: cyclesData } = usePuzzleSetCycles(selectedSetId || '')

  // Create cycle mutation
  const createCycleMutation = useCreateCycle(selectedSetId || '')

  // Training session hook
  const trainingSession = useTrainingSession({
    puzzleSetId: selectedSetId || '',
    cycleId: activeCycleId,
  })

  // Handle starting a new cycle
  const handleStartCycle = useCallback(async () => {
    if (!selectedSetId) return

    try {
      const result = await createCycleMutation.mutateAsync()
      setActiveCycleId(result.cycle.id)
    } catch (error) {
      console.error('Failed to start cycle:', error)
    }
  }, [selectedSetId, createCycleMutation])

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
    await handleStartCycle()
  }, [handleStartCycle])

  // Auto-select set from URL or first set, and continue active cycle
  useEffect(() => {
    if (!puzzleSets?.sets || puzzleSets.sets.length === 0) return

    // If URL has setId, use that
    if (urlSetId) {
      const urlSet = puzzleSets.sets.find(s => s.id === urlSetId)
      if (urlSet) {
        setSelectedSetId(urlSet.id)
        if (urlSet.currentCycleId) {
          setActiveCycleId(urlSet.currentCycleId)
        }
        return
      }
    }

    // Otherwise use first set
    if (!selectedSetId) {
      const firstSet = puzzleSets.sets[0]
      setSelectedSetId(firstSet.id)
      if (firstSet.currentCycleId) {
        setActiveCycleId(firstSet.currentCycleId)
      }
    }
  }, [puzzleSets, selectedSetId, urlSetId])

  // Loading state
  if (loadingSets) {
    return <TrainingPageSkeleton />
  }

  // No puzzle sets
  if (!puzzleSets?.sets || puzzleSets.sets.length === 0) {
    return <NoPuzzleSetsCard />
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
      </div>
    )
  }

  // Puzzle set selection / cycle start
  return (
    <div className="py-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Training</h1>
        <p className="text-muted-foreground mt-1">
          Select a puzzle set to begin or continue training
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {puzzleSets.sets.map(set => (
          <PuzzleSetCard
            key={set.id}
            set={set}
            isSelected={selectedSetId === set.id}
            onSelect={() => setSelectedSetId(set.id)}
            onStart={handleStartCycle}
            onContinue={(cycleId) => setActiveCycleId(cycleId)}
            isStarting={createCycleMutation.isPending}
          />
        ))}
      </div>
    </div>
  )
}

interface PuzzleSetCardProps {
  set: {
    id: string
    name: string
    size: number
    targetCycles: number
    targetRating: number
    isActive: boolean
    currentCycle: number | null
    currentCycleId: string | null
  }
  isSelected: boolean
  onSelect: () => void
  onStart: () => void
  onContinue: (cycleId: string) => void
  isStarting: boolean
}

function PuzzleSetCard({
  set,
  isSelected,
  onSelect,
  onStart,
  onContinue,
  isStarting,
}: PuzzleSetCardProps) {
  const hasActiveCycle = set.currentCycleId !== null

  return (
    <Card
      className={`cursor-pointer transition-colors ${
        isSelected ? 'border-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{set.name}</CardTitle>
        <CardDescription>
          {set.size} puzzles at ~{set.targetRating} rating
        </CardDescription>
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
        </div>

        {hasActiveCycle ? (
          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation()
              onContinue(set.currentCycleId!)
            }}
          >
            <Play className="mr-2 h-4 w-4" />
            Continue Training
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation()
              onStart()
            }}
            disabled={isStarting}
          >
            <Play className="mr-2 h-4 w-4" />
            {isStarting ? 'Starting...' : 'Start Cycle 1'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function TrainingPageSkeleton() {
  return (
    <div className="py-4 space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
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
  )
}

function NoPuzzleSetsCard() {
  return (
    <div className="py-4">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>No Puzzle Sets</CardTitle>
          <CardDescription>
            You don&apos;t have any puzzle sets yet. Create one to start training.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/training/new">Create Puzzle Set</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
