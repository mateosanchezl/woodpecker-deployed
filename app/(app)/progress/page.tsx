'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SetSelector } from '@/components/progress/set-selector'
import { ProgressSummary } from '@/components/progress/progress-summary'
import { TimeChart } from '@/components/progress/time-chart'
import { AccuracyChart } from '@/components/progress/accuracy-chart'
import { ThemeChart } from '@/components/progress/theme-chart'
import { ProblemPuzzlesTable } from '@/components/progress/problem-puzzles-table'
import { useProgressData } from '@/hooks/use-progress-data'
import { Trophy } from 'lucide-react'

interface PuzzleSetsData {
  sets: Array<{
    id: string
    name: string
    completedCycles: number
    targetCycles: number
  }>
}

export default function ProgressPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedSetId = searchParams.get('setId')

  // Fetch puzzle sets for selector
  const { data: setsData, isLoading: setsLoading } = useQuery<PuzzleSetsData>({
    queryKey: ['puzzle-sets'],
    queryFn: async () => {
      const res = await fetch('/api/training/puzzle-sets')
      if (!res.ok) throw new Error('Failed to fetch puzzle sets')
      return res.json()
    },
  })

  // Auto-select first set if none selected
  useEffect(() => {
    if (!selectedSetId && setsData?.sets.length) {
      const firstSet = setsData.sets[0]
      router.replace(`/progress?setId=${firstSet.id}`)
    }
  }, [selectedSetId, setsData, router])

  // Fetch progress data for selected set
  const {
    data: progressData,
    isLoading: progressLoading,
    error: progressError,
  } = useProgressData(selectedSetId)

  const handleSetChange = (setId: string) => {
    router.push(`/progress?setId=${setId}`)
  }

  // Loading state
  if (setsLoading) {
    return <ProgressSkeleton />
  }

  // No sets state
  if (!setsData?.sets.length) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h2 className="text-lg font-medium mb-2">No puzzle sets yet</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Create a puzzle set and complete some training cycles to see your progress here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
        <SetSelector
          sets={setsData.sets}
          selectedSetId={selectedSetId}
          onSetChange={handleSetChange}
        />
      </div>

      {/* Content */}
      {progressLoading ? (
        <ProgressContentSkeleton />
      ) : progressError ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-destructive">Failed to load progress data</p>
              <p className="text-muted-foreground text-sm mt-1">
                {progressError.message}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : progressData ? (
        progressData.cycles.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h2 className="text-lg font-medium mb-2">No completed cycles yet</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  Complete your first training cycle to see detailed progress analytics.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Summary Stats */}
            <ProgressSummary
              totalAttempts={progressData.summary.totalAttempts}
              completedCycles={progressData.summary.completedCycles}
              overallAccuracy={progressData.summary.overallAccuracy}
              averageTimePerPuzzle={progressData.summary.averageTimePerPuzzle}
              bestCycleTime={progressData.summary.bestCycleTime}
            />

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              <TimeChart cycles={progressData.cycles} />
              <AccuracyChart cycles={progressData.cycles} />
              <ThemeChart themes={progressData.themePerformance} />
            </div>

            {/* Problem Puzzles */}
            <ProblemPuzzlesTable puzzles={progressData.problemPuzzles} />
          </div>
        )
      ) : null}
    </div>
  )
}

function ProgressSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-[280px]" />
      </div>
      <ProgressContentSkeleton />
    </div>
  )
}

function ProgressContentSkeleton() {
  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Theme Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
