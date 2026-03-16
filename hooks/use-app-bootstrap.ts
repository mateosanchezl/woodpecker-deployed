'use client'

import { useQuery, type QueryClient, type UseQueryOptions } from '@tanstack/react-query'
import type { AppBootstrapResponse } from '@/lib/app-bootstrap'

export const APP_BOOTSTRAP_QUERY_KEY = ['app-bootstrap'] as const

async function fetchAppBootstrap(): Promise<AppBootstrapResponse> {
  const res = await fetch('/api/bootstrap')
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch app bootstrap' }))
    throw new Error(error.error || 'Failed to fetch app bootstrap')
  }

  return res.json()
}

export function useAppBootstrap<TData = AppBootstrapResponse>(
  options?: Omit<
    UseQueryOptions<AppBootstrapResponse, Error, TData, typeof APP_BOOTSTRAP_QUERY_KEY>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<AppBootstrapResponse, Error, TData, typeof APP_BOOTSTRAP_QUERY_KEY>({
    queryKey: APP_BOOTSTRAP_QUERY_KEY,
    queryFn: fetchAppBootstrap,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  })
}

export function updateBootstrapCache(
  queryClient: QueryClient,
  updater: (current: AppBootstrapResponse) => AppBootstrapResponse,
) {
  queryClient.setQueryData<AppBootstrapResponse>(APP_BOOTSTRAP_QUERY_KEY, (current) => {
    if (!current) {
      return current
    }

    return updater(current)
  })
}
