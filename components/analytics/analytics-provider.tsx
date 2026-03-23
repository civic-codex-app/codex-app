'use client'

import { useAnalytics } from '@/lib/hooks/use-analytics'

/**
 * Place in a layout to auto-track page views on every route change.
 */
export function AnalyticsProvider() {
  useAnalytics()
  return null
}
