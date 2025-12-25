'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface UseNavigationGuardOptions {
  /** Whether the guard is currently active */
  enabled: boolean
  /** Message to show in the browser's beforeunload dialog */
  message?: string
}

interface UseNavigationGuardReturn {
  /** Whether the leave confirmation modal should be shown */
  showModal: boolean
  /** Call this to confirm leaving and proceed with navigation */
  confirmLeave: () => void
  /** Call this to cancel leaving and stay on the page */
  cancelLeave: () => void
}

/**
 * Hook to guard against accidental navigation away from a page.
 *
 * Handles two types of navigation:
 * 1. Browser-level navigation (refresh, close tab, back button to external site)
 *    - Uses beforeunload event to show browser's native dialog
 * 2. Client-side navigation (clicking links within the app)
 *    - Intercepts clicks on anchor tags and shows a custom modal
 *
 * @example
 * ```tsx
 * const { showModal, confirmLeave, cancelLeave } = useNavigationGuard({
 *   enabled: isTrainingActive,
 * })
 *
 * return (
 *   <>
 *     <TrainingSession />
 *     <LeaveTrainingModal
 *       open={showModal}
 *       onConfirmLeave={confirmLeave}
 *       onCancel={cancelLeave}
 *     />
 *   </>
 * )
 * ```
 */
export function useNavigationGuard({
  enabled,
  message = 'You have unsaved progress. Are you sure you want to leave?',
}: UseNavigationGuardOptions): UseNavigationGuardReturn {
  const [showModal, setShowModal] = useState(false)
  const pendingNavigationRef = useRef<string | null>(null)

  // Handle browser-level navigation (refresh, close, external navigation)
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // Modern browsers ignore custom messages but require returnValue to be set
      e.returnValue = message
      return message
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enabled, message])

  // Handle client-side navigation (clicking links within the app)
  useEffect(() => {
    if (!enabled) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (!anchor) return

      const href = anchor.getAttribute('href')

      // Ignore external links, hash links, and non-navigation links
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('#') ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download')
      ) {
        return
      }

      // Check if this is an internal navigation that would leave training
      // We need to intercept sidebar links and other in-app navigation
      const currentPath = window.location.pathname
      const isTrainingPath = currentPath.startsWith('/training')

      // If navigating away from training, show the modal
      if (isTrainingPath && href !== currentPath && !href.startsWith('/training')) {
        e.preventDefault()
        e.stopPropagation()
        pendingNavigationRef.current = href
        setShowModal(true)
      }
    }

    // Use capture phase to intercept before Next.js Link handles it
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [enabled])

  // Handle browser back/forward buttons
  useEffect(() => {
    if (!enabled) return

    // Store the current path when guard is enabled
    const currentPath = window.location.pathname

    const handlePopState = () => {
      // If trying to navigate away via back button, show modal
      // and push the current state back
      if (window.location.pathname !== currentPath) {
        window.history.pushState(null, '', currentPath)
        pendingNavigationRef.current = 'back'
        setShowModal(true)
      }
    }

    // Push current state so we can detect back button
    window.history.pushState(null, '', currentPath)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [enabled])

  const confirmLeave = useCallback(() => {
    setShowModal(false)
    const destination = pendingNavigationRef.current
    pendingNavigationRef.current = null

    if (destination === 'back') {
      // Go back in history
      window.history.back()
    } else if (destination) {
      // Navigate to the pending destination
      window.location.href = destination
    }
  }, [])

  const cancelLeave = useCallback(() => {
    setShowModal(false)
    pendingNavigationRef.current = null
  }, [])

  return {
    showModal,
    confirmLeave,
    cancelLeave,
  }
}
