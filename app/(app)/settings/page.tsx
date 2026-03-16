'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { BoardThemePicker } from '@/components/training/board-theme-picker'
import {
  resolveBoardTheme,
  type BoardThemeId,
} from '@/lib/chess/board-themes'
import { useAppBootstrap, updateBootstrapCache } from '@/hooks/use-app-bootstrap'
import { toast } from 'sonner'
import { Settings, Users, Eye, EyeOff, Target, Clock3, Palette } from 'lucide-react'

interface UpdateSettingsInput {
  estimatedRating?: number
  preferredSetSize?: number
  targetCycles?: number
  autoStartNextPuzzle?: boolean
  boardTheme?: BoardThemeId
  showOnLeaderboard?: boolean
}

interface SettingsDraft {
  estimatedRating: number
  preferredSetSize: number
  targetCycles: number
  autoStartNextPuzzle: boolean
  boardTheme: BoardThemeId
  showOnLeaderboard: boolean
}

interface UpdateSettingsResponse {
  user: {
    id: string
    estimatedRating: number
    preferredSetSize: number
    targetCycles: number
    autoStartNextPuzzle: boolean
    boardTheme?: string | null
    showOnLeaderboard: boolean
    hasCompletedOnboarding: boolean
  }
}

const DEFAULT_SETTINGS: SettingsDraft = {
  estimatedRating: 1200,
  preferredSetSize: 150,
  targetCycles: 5,
  autoStartNextPuzzle: true,
  boardTheme: 'peck',
  showOnLeaderboard: true,
}

function createSettingsDraft(
  user?: {
    estimatedRating?: number
    preferredSetSize?: number
    targetCycles?: number
    autoStartNextPuzzle?: boolean
    boardTheme?: string | null
    showOnLeaderboard?: boolean
  }
): SettingsDraft {
  return {
    estimatedRating: user?.estimatedRating ?? DEFAULT_SETTINGS.estimatedRating,
    preferredSetSize: user?.preferredSetSize ?? DEFAULT_SETTINGS.preferredSetSize,
    targetCycles: user?.targetCycles ?? DEFAULT_SETTINGS.targetCycles,
    autoStartNextPuzzle:
      user?.autoStartNextPuzzle ?? DEFAULT_SETTINGS.autoStartNextPuzzle,
    boardTheme: resolveBoardTheme(user?.boardTheme),
    showOnLeaderboard: user?.showOnLeaderboard ?? DEFAULT_SETTINGS.showOnLeaderboard,
  }
}

function settingsAreEqual(a: SettingsDraft, b: SettingsDraft) {
  return (
    a.estimatedRating === b.estimatedRating &&
    a.preferredSetSize === b.preferredSetSize &&
    a.targetCycles === b.targetCycles &&
    a.autoStartNextPuzzle === b.autoStartNextPuzzle &&
    a.boardTheme === b.boardTheme &&
    a.showOnLeaderboard === b.showOnLeaderboard
  )
}

function getChangedSettings(
  savedSettings: SettingsDraft,
  draftSettings: SettingsDraft
): UpdateSettingsInput {
  const changes: UpdateSettingsInput = {}

  if (savedSettings.estimatedRating !== draftSettings.estimatedRating) {
    changes.estimatedRating = draftSettings.estimatedRating
  }
  if (savedSettings.preferredSetSize !== draftSettings.preferredSetSize) {
    changes.preferredSetSize = draftSettings.preferredSetSize
  }
  if (savedSettings.targetCycles !== draftSettings.targetCycles) {
    changes.targetCycles = draftSettings.targetCycles
  }
  if (
    savedSettings.autoStartNextPuzzle !== draftSettings.autoStartNextPuzzle
  ) {
    changes.autoStartNextPuzzle = draftSettings.autoStartNextPuzzle
  }
  if (savedSettings.boardTheme !== draftSettings.boardTheme) {
    changes.boardTheme = draftSettings.boardTheme
  }
  if (savedSettings.showOnLeaderboard !== draftSettings.showOnLeaderboard) {
    changes.showOnLeaderboard = draftSettings.showOnLeaderboard
  }

  return changes
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [draftSettings, setDraftSettings] = useState<SettingsDraft | null>(null)
  const lastLoadedSettingsRef = useRef<SettingsDraft | null>(null)

  const { data: user, isLoading } = useAppBootstrap({
    select: (bootstrap) => bootstrap.user,
  })

  const loadedEstimatedRating = user?.estimatedRating
  const loadedPreferredSetSize = user?.preferredSetSize
  const loadedTargetCycles = user?.targetCycles
  const loadedAutoStartNextPuzzle = user?.autoStartNextPuzzle
  const loadedBoardTheme = user?.boardTheme
  const loadedShowOnLeaderboard = user?.showOnLeaderboard

  const updateSettings = useMutation<
    UpdateSettingsResponse,
    Error,
    UpdateSettingsInput
  >({
    mutationFn: async (settings) => {
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
    onSuccess: (response) => {
      updateBootstrapCache(queryClient, (current) => {
        const nextUser = {
          ...current.user,
          ...response.user,
          boardTheme: response.user.boardTheme ?? current.user.boardTheme,
        }

        return {
          ...current,
          user: nextUser,
        }
      })

      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      toast.success('Settings saved')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  useEffect(() => {
    if (
      loadedEstimatedRating === undefined ||
      loadedPreferredSetSize === undefined ||
      loadedTargetCycles === undefined ||
      loadedAutoStartNextPuzzle === undefined ||
      loadedBoardTheme === undefined ||
      loadedShowOnLeaderboard === undefined
    ) {
      return
    }

    const nextLoadedSettings: SettingsDraft = {
      estimatedRating: loadedEstimatedRating,
      preferredSetSize: loadedPreferredSetSize,
      targetCycles: loadedTargetCycles,
      autoStartNextPuzzle: loadedAutoStartNextPuzzle,
      boardTheme: resolveBoardTheme(loadedBoardTheme),
      showOnLeaderboard: loadedShowOnLeaderboard,
    }
    const previousLoadedSettings = lastLoadedSettingsRef.current

    setDraftSettings(currentDraftSettings => {
      if (
        !currentDraftSettings ||
        !previousLoadedSettings ||
        settingsAreEqual(currentDraftSettings, previousLoadedSettings)
      ) {
        return nextLoadedSettings
      }

      return currentDraftSettings
    })

    lastLoadedSettingsRef.current = nextLoadedSettings
  }, [
    loadedEstimatedRating,
    loadedPreferredSetSize,
    loadedTargetCycles,
    loadedAutoStartNextPuzzle,
    loadedBoardTheme,
    loadedShowOnLeaderboard,
  ])

  const savedSettings = user ? createSettingsDraft(user) : null
  const currentSettings = draftSettings ?? savedSettings ?? DEFAULT_SETTINGS
  const isDirty =
    savedSettings !== null &&
    draftSettings !== null &&
    !settingsAreEqual(draftSettings, savedSettings)

  const updateDraft = (changes: Partial<SettingsDraft>) => {
    setDraftSettings(currentDraftSettings => ({
      ...(currentDraftSettings ?? savedSettings ?? DEFAULT_SETTINGS),
      ...changes,
    }))
  }

  const handleSave = () => {
    if (!savedSettings || !draftSettings || !isDirty) {
      return
    }

    updateSettings.mutate(getChangedSettings(savedSettings, draftSettings))
  }

  const handleReset = () => {
    if (!savedSettings) {
      return
    }

    setDraftSettings(savedSettings)
  }

  if (isLoading) {
    return <SettingsSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Manage your account preferences
        </p>
      </div>

      {isDirty ? (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={updateSettings.isPending}
            className="rounded-xl"
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="rounded-xl shadow-md shadow-primary/20 transition-transform active:scale-[0.98]"
          >
            {updateSettings.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      ) : null}

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <div className="rounded-2xl bg-violet-100 p-2.5 shadow-sm">
              <Users className="h-5 w-5 text-violet-600" />
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
                {currentSettings.showOnLeaderboard ? (
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
              checked={currentSettings.showOnLeaderboard}
              onCheckedChange={(checked) =>
                updateDraft({ showOnLeaderboard: checked })
              }
              disabled={updateSettings.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-2.5 shadow-sm">
              <Clock3 className="h-5 w-5 text-emerald-700" />
            </div>
            Training Session
          </CardTitle>
          <CardDescription>
            Control how quickly training moves from one puzzle to the next
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-6">
            <div className="space-y-1">
              <Label htmlFor="auto-start-next-puzzle" className="text-sm font-medium">
                Auto-start next puzzle
              </Label>
              <p className="text-sm text-muted-foreground">
                Turn off to pause after each puzzle and continue with a manual click.
              </p>
            </div>
            <Switch
              id="auto-start-next-puzzle"
              checked={currentSettings.autoStartNextPuzzle}
              onCheckedChange={(checked) =>
                updateDraft({ autoStartNextPuzzle: checked })
              }
              disabled={updateSettings.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-2.5 shadow-sm">
              <Palette className="h-5 w-5 text-sky-700" />
            </div>
            Board Appearance
          </CardTitle>
          <CardDescription>
            Pick the board palette used during training
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <span>Board theme</span>
              <Badge variant="secondary" className="uppercase tracking-wide">
                New
              </Badge>
            </Label>
            <p className="text-sm text-muted-foreground">
              This changes the training board only. Puzzle tactical themes stay separate.
            </p>
          </div>

          <BoardThemePicker
            value={currentSettings.boardTheme}
            onValueChange={(boardTheme) => updateDraft({ boardTheme })}
            disabled={updateSettings.isPending}
          />
        </CardContent>
      </Card>

      {/* Training Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-2.5 shadow-sm">
              <Target className="h-5 w-5 text-amber-600" />
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
              <span className="text-sm font-medium tabular-nums">
                {currentSettings.estimatedRating}
              </span>
            </div>
            <Slider
              value={[currentSettings.estimatedRating]}
              onValueChange={([estimatedRating]) =>
                updateDraft({ estimatedRating })
              }
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
              <span className="text-sm font-medium tabular-nums">
                {currentSettings.preferredSetSize}
              </span>
            </div>
            <Slider
              value={[currentSettings.preferredSetSize]}
              onValueChange={([preferredSetSize]) =>
                updateDraft({ preferredSetSize })
              }
              min={50}
              max={500}
              step={25}
              disabled={updateSettings.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Default puzzle count (~
              {Math.round((currentSettings.preferredSetSize * 0.5) / 60)}-
              {Math.round((currentSettings.preferredSetSize * 1.5) / 60)} min/cycle)
            </p>
          </div>

          {/* Target Cycles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Target Cycles</Label>
              <span className="text-sm font-medium tabular-nums">
                {currentSettings.targetCycles}
              </span>
            </div>
            <Slider
              value={[currentSettings.targetCycles]}
              onValueChange={([targetCycles]) => updateDraft({ targetCycles })}
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
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-2.5 shadow-sm">
              <Settings className="h-5 w-5 text-slate-600" />
            </div>
            Account
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <Label className="text-sm text-muted-foreground">Email</Label>
            <p className="text-sm font-medium">{user?.email}</p>
          </div>
          <div className="grid gap-1">
            <Label className="text-sm text-muted-foreground">Name</Label>
            <p className="text-sm font-medium">{user?.name || 'Not set'}</p>
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
