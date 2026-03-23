'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/utils/analytics'

interface Props {
  event: string
  data?: Record<string, string | number | boolean | null>
}

/**
 * Drop into any server component page to fire a one-time analytics event on mount.
 * Example: <PageViewTracker event="politician_viewed" data={{ slug, party }} />
 */
export function PageViewTracker({ event, data }: Props) {
  useEffect(() => {
    trackEvent(event, data)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event])

  return null
}
