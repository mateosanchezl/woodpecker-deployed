'use client'

import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { CreatePuzzleSetForm } from '@/components/onboarding/create-puzzle-set-form'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useAppBootstrap, APP_BOOTSTRAP_QUERY_KEY } from '@/hooks/use-app-bootstrap'
import type { TrainingTheme } from '@/lib/chess/training-themes'

export default function NewPuzzleSetPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useAppBootstrap({
    select: (data) => data.user,
  })

  // Create puzzle set mutation
  const createPuzzleSetMutation = useMutation({
    mutationFn: async (data: {
      name: string
      targetRating: number
      ratingRange: number
      size: number
      targetCycles: number
      focusTheme: TrainingTheme | null
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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: APP_BOOTSTRAP_QUERY_KEY })
      toast.success('Puzzle set created successfully!')
      try {
        const cycleRes = await fetch(
          `/api/training/puzzle-sets/${data.puzzleSet.id}/cycles`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }
        )
        if (!cycleRes.ok) {
          const error = await cycleRes.json()
          throw new Error(error.error || 'Failed to start cycle')
        }
        const cycleData = await cycleRes.json()
        router.push(
          `/training?setId=${data.puzzleSet.id}&cycleId=${cycleData.cycle.id}`
        )
      } catch (error) {
        toast.error((error as Error).message || 'Failed to start cycle')
        router.push(`/training?setId=${data.puzzleSet.id}`)
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create puzzle set')
    },
  })

  const handleSubmit = useCallback((data: {
    name: string
    targetRating: number
    ratingRange: number
    size: number
    targetCycles: number
    focusTheme: TrainingTheme | null
  }) => {
    createPuzzleSetMutation.mutate(data)
  }, [createPuzzleSetMutation])

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Button
        variant="ghost"
        className="gap-2 mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <CreatePuzzleSetForm
        userRating={user?.estimatedRating || 1200}
        onSubmit={handleSubmit}
        isSubmitting={createPuzzleSetMutation.isPending}
      />

      {createPuzzleSetMutation.isError && (
        <p className="text-sm text-red-600 mt-4 text-center">
          {createPuzzleSetMutation.error.message}
        </p>
      )}
    </div>
  )
}
