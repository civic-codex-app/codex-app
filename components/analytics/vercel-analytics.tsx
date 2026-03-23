'use client'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export function VercelAnalytics() {
  return (
    <>
      <Analytics
        beforeSend={(event) => {
          if (event.url.includes('/admin')) return null
          return event
        }}
      />
      <SpeedInsights />
    </>
  )
}
