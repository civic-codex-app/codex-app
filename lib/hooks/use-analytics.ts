'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView, trackEvent } from '@/lib/utils/analytics'

/**
 * Auto-tracks page views on route changes.
 * Returns trackEvent for convenience.
 */
export function useAnalytics() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    // Skip duplicate fires (React strict mode, etc.)
    if (pathname === lastPath.current) return
    lastPath.current = pathname

    // Small delay to let document.title update after navigation
    const timer = setTimeout(() => {
      trackPageView(pathname)
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname])

  return { trackEvent }
}
