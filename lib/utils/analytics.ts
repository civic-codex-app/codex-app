'use client'

import { track } from '@vercel/analytics'

// Generate a session ID for anonymous tracking
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = sessionStorage.getItem('poli-session-id')
  if (!sid) {
    sid = crypto.randomUUID()
    sessionStorage.setItem('poli-session-id', sid)
  }
  return sid
}

/**
 * Track an event to both Vercel Analytics and our Supabase analytics.
 * Fire-and-forget — never blocks the UI.
 */
export function trackEvent(
  name: string,
  data?: Record<string, string | number | boolean | null>
) {
  // Vercel Analytics (their dashboard)
  try {
    track(name, data)
  } catch {
    // Vercel analytics may not be available in dev
  }

  // Our Supabase analytics (admin dashboard)
  const payload = {
    event: name,
    data: data ?? {},
    sessionId: getSessionId(),
    path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    referrer: typeof document !== 'undefined' ? document.referrer : undefined,
  }

  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true, // survives page navigation
  }).catch(() => {})
}

/**
 * Track a page view. Called automatically by useAnalytics hook.
 */
export function trackPageView(path: string, title?: string) {
  trackEvent('page_view', {
    path,
    title: title ?? (typeof document !== 'undefined' ? document.title : ''),
    referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
  })
}
