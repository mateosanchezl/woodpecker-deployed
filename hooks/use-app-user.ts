'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

export interface AppUser {
  id: string
  email: string
  name: string | null
  estimatedRating: number
  preferredSetSize: number
  targetCycles: number
  autoStartNextPuzzle: boolean
  boardTheme: string | null
  hasCompletedOnboarding: boolean
  showOnLeaderboard: boolean
  puzzleSetCount: number
  createdAt: string
  currentStreak: number
  longestStreak: number
  lastTrainedDate: string | null
  totalXp: number
  currentLevel: number
  weeklyXp: number
}

export interface AppUserResponse {
  user: AppUser
}

async function fetchAppUser(): Promise<AppUserResponse> {
  const res = await fetch('/api/user')
  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(error?.error || 'Failed to fetch user')
  }

  return res.json()
}

export function useAppUser<TData = AppUserResponse>(
  options?: Omit<UseQueryOptions<AppUserResponse, Error, TData>, 'queryKey' | 'queryFn'>
) {
  return useQuery<AppUserResponse, Error, TData>({
    queryKey: ['user'],
    queryFn: fetchAppUser,
    staleTime: 60_000,
    ...options,
  })
}
