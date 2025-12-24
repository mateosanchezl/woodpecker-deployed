'use client'

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { CreatePuzzleSetForm } from '@/components/onboarding/create-puzzle-set-form'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Play, Plus, Target, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface UserData {
  user: {
    id: string
    email: string
    name: string | null
    estimatedRating: number
    preferredSetSize: number
    targetCycles: number
    hasCompletedOnboarding: boolean
    puzzleSetCount: number
    createdAt: string
  }
}

interface PuzzleSetsData {
  sets: Array<{
    id: string
    name: string
    size: number
    targetCycles: number
    targetRating: number
    minRating: number
    maxRating: number
    isActive: boolean
    createdAt: string
    currentCycle: number | null
    currentCycleId: string | null
    completedCycles: number
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery<UserData>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      if (!res.ok) throw new Error('Failed to fetch user')
      return res.json()
    },
  })

  // Fetch puzzle sets
  const { data: puzzleSetsData, isLoading: setsLoading } = useQuery<PuzzleSetsData>({
    queryKey: ['puzzle-sets'],
    queryFn: async () => {
      const res = await fetch('/api/training/puzzle-sets')
      if (!res.ok) throw new Error('Failed to fetch puzzle sets')
      return res.json()
    },
    enabled: userData?.user.hasCompletedOnboarding,
  })

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: { estimatedRating: number }) => {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to complete onboarding')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Onboarding completed!')
    },
    onError: () => {
      toast.error('Failed to complete onboarding')
    },
  })

  // Create puzzle set mutation
  const createPuzzleSetMutation = useMutation({
    mutationFn: async (data: {
      name: string
      targetRating: number
      ratingRange: number
      size: number
      targetCycles: number
    }) => {
      const res = await fetch('/api/training/puzzle-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create puzzle set')
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['puzzle-sets'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Puzzle set created successfully!')
      // Navigate to training with the new puzzle set
      router.push(`/training?setId=${data.puzzleSet.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create puzzle set')
    },
  })

  const handleOnboardingComplete = useCallback((data: { estimatedRating: number }) => {
    completeOnboardingMutation.mutate(data)
  }, [completeOnboardingMutation])

  const handleCreatePuzzleSet = useCallback((data: {
    name: string
    targetRating: number
    ratingRange: number
    size: number
    targetCycles: number
  }) => {
    createPuzzleSetMutation.mutate(data)
  }, [createPuzzleSetMutation])

  // Loading state
  if (userLoading || !userData) {
    return <DashboardSkeleton />
  }

  const showOnboarding = !userData.user.hasCompletedOnboarding
  const showCreateSet = !showOnboarding && userData.user.puzzleSetCount === 0

  return (
    <>
      <Dialog open={showOnboarding} onOpenChange={() => {}}>
        <DialogContent 
          className="[&>button]:hidden max-w-2xl" 
          onInteractOutside={(e) => e.preventDefault()} 
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <OnboardingWizard
            onComplete={handleOnboardingComplete}
            isSubmitting={completeOnboardingMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {showCreateSet ? (
        <div className="max-w-2xl mx-auto py-8">
          <CreatePuzzleSetForm
            userRating={userData.user.estimatedRating}
            onSubmit={handleCreatePuzzleSet}
            isSubmitting={createPuzzleSetMutation.isPending}
          />
          {createPuzzleSetMutation.isError && (
            <p className="text-sm text-red-600 mt-4 text-center">
              {createPuzzleSetMutation.error.message}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {userData.user.name ? `Welcome back, ${userData.user.name.split(' ')[0]}` : 'Welcome back'}
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => router.push('/training/new')}
        >
          <Plus className="h-4 w-4" />
          New Set
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Sets"
          value={puzzleSetsData?.sets.length || 0}
          icon={Target}
        />
        <StatsCard
          title="Active Training"
          value={puzzleSetsData?.sets.filter(s => s.isActive).length || 0}
          icon={TrendingUp}
        />
        <StatsCard
          title="Your Rating"
          value={userData.user.estimatedRating}
          icon={CheckCircle2}
        />
      </div>

      {/* Puzzle Sets */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Puzzle Sets</h2>
        {setsLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48 mt-1" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-2 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {puzzleSetsData?.sets.map(set => (
              <PuzzleSetCard key={set.id} set={set} />
            ))}
          </div>
        )}
      </div>
    </div>
      )}
    </>
  )
}

interface StatsCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
}

function StatsCard({ title, value, icon: Icon }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground/50" />
        </div>
      </CardContent>
    </Card>
  )
}

interface PuzzleSetCardProps {
  set: PuzzleSetsData['sets'][0]
}

function PuzzleSetCard({ set }: PuzzleSetCardProps) {
  const router = useRouter()
  const cycleProgress = (set.completedCycles / set.targetCycles) * 100
  const hasActiveCycle = set.currentCycleId !== null

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{set.name}</CardTitle>
            <CardDescription>
              {set.size} puzzles · {set.minRating}-{set.maxRating} rating
            </CardDescription>
          </div>
          {set.completedCycles >= set.targetCycles && (
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3" />
              Complete
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cycle progress</span>
            <span className="font-medium">
              {set.completedCycles} / {set.targetCycles}
            </span>
          </div>
          <Progress value={cycleProgress} className="h-2" />
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>~{set.targetRating}</span>
          </div>
          {set.currentCycle && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Cycle {set.currentCycle}</span>
            </div>
          )}
        </div>

        <Button
          className="w-full gap-2"
          onClick={() => router.push(`/training?setId=${set.id}`)}
        >
          <Play className="h-4 w-4" />
          {hasActiveCycle ? 'Continue Training' : 'Start Next Cycle'}
        </Button>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
