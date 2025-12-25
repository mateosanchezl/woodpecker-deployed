'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Settings, Users, Eye, EyeOff, Target } from 'lucide-react'

interface UserData {
  user: {
    id: string
    email: string
    name: string | null
    estimatedRating: number
    preferredSetSize: number
    targetCycles: number
    showOnLeaderboard: boolean
    hasCompletedOnboarding: boolean
  }
}

export default function SettingsPage() {
  const queryClient = useQueryClient()

  // Local state for training preferences
  const [estimatedRating, setEstimatedRating] = useState<number>(1200)
  const [preferredSetSize, setPreferredSetSize] = useState<number>(150)
  const [targetCycles, setTargetCycles] = useState<number>(5)

  const { data, isLoading } = useQuery<UserData>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      if (!res.ok) throw new Error('Failed to fetch user')
      return res.json()
    },
  })

  // Initialize local state when data loads
  useEffect(() => {
    if (data?.user) {
      setEstimatedRating(data.user.estimatedRating)
      setPreferredSetSize(data.user.preferredSetSize)
      setTargetCycles(data.user.targetCycles)
    }
  }, [data])

  const updateSettings = useMutation({
    mutationFn: async (settings: {
      estimatedRating?: number
      preferredSetSize?: number
      targetCycles?: number
      showOnLeaderboard?: boolean
    }) => {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update settings')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      toast.success('Settings updated')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleLeaderboardToggle = (checked: boolean) => {
    updateSettings.mutate({ showOnLeaderboard: checked })
  }

  const handleRatingChange = (value: number[]) => {
    const newRating = value[0]
    setEstimatedRating(newRating)
    updateSettings.mutate({ estimatedRating: newRating })
  }

  const handleSetSizeChange = (value: number[]) => {
    const newSize = value[0]
    setPreferredSetSize(newSize)
    updateSettings.mutate({ preferredSetSize: newSize })
  }

  const handleCyclesChange = (value: number[]) => {
    const newCycles = value[0]
    setTargetCycles(newCycles)
    updateSettings.mutate({ targetCycles: newCycles })
  }

  if (isLoading) {
    return <SettingsSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences
        </p>
      </div>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="rounded-lg bg-violet-100 p-1.5">
              <Users className="h-4 w-4 text-violet-600" />
            </div>
            Privacy
          </CardTitle>
          <CardDescription>
            Control how your profile appears to other users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="leaderboard-toggle" className="text-sm font-medium">
                Show on Leaderboard
              </Label>
              <p className="text-sm text-muted-foreground">
                {data?.user.showOnLeaderboard ? (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Your ranking is visible to other players
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <EyeOff className="h-3 w-3" />
                    You are hidden from the public leaderboard
                  </span>
                )}
              </p>
            </div>
            <Switch
              id="leaderboard-toggle"
              checked={data?.user.showOnLeaderboard ?? true}
              onCheckedChange={handleLeaderboardToggle}
              disabled={updateSettings.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Training Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="rounded-lg bg-amber-100 p-1.5">
              <Target className="h-4 w-4 text-amber-600" />
            </div>
            Training Preferences
          </CardTitle>
          <CardDescription>
            Default settings for new puzzle sets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Estimated Rating */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Estimated Rating</Label>
              <span className="text-sm font-medium tabular-nums">{estimatedRating}</span>
            </div>
            <Slider
              value={[estimatedRating]}
              onValueChange={handleRatingChange}
              min={800}
              max={2600}
              step={25}
              disabled={updateSettings.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Your approximate chess puzzle rating
            </p>
          </div>

          {/* Preferred Set Size */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Preferred Set Size</Label>
              <span className="text-sm font-medium tabular-nums">{preferredSetSize}</span>
            </div>
            <Slider
              value={[preferredSetSize]}
              onValueChange={handleSetSizeChange}
              min={50}
              max={500}
              step={25}
              disabled={updateSettings.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Default puzzle count (~{Math.round((preferredSetSize * 0.5) / 60)}-{Math.round((preferredSetSize * 1.5) / 60)} min/cycle)
            </p>
          </div>

          {/* Target Cycles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Target Cycles</Label>
              <span className="text-sm font-medium tabular-nums">{targetCycles}</span>
            </div>
            <Slider
              value={[targetCycles]}
              onValueChange={handleCyclesChange}
              min={1}
              max={10}
              step={1}
              disabled={updateSettings.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Default number of repetitions for new sets
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="rounded-lg bg-slate-100 p-1.5">
              <Settings className="h-4 w-4 text-slate-600" />
            </div>
            Account
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <Label className="text-sm text-muted-foreground">Email</Label>
            <p className="text-sm font-medium">{data?.user.email}</p>
          </div>
          <div className="grid gap-1">
            <Label className="text-sm text-muted-foreground">Name</Label>
            <p className="text-sm font-medium">{data?.user.name || 'Not set'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      {/* Privacy Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Training Preferences Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-52" />
          </div>
        </CardContent>
      </Card>

      {/* Account Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-40 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
