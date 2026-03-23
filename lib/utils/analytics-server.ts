import { track } from '@vercel/analytics/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

/**
 * Track a server-side event to both Vercel and Supabase.
 * Use in API routes, server actions, and server components.
 */
export async function trackServerEvent(
  name: string,
  data?: Record<string, string | number | boolean | null>,
  options?: {
    userId?: string
    sessionId?: string
    pagePath?: string
    request?: Request
  }
) {
  const { userId, sessionId, pagePath, request } = options ?? {}

  // Vercel Analytics
  try {
    await track(name, data)
  } catch {
    // May not be available in dev
  }

  // Supabase analytics
  try {
    const supabase = createServiceRoleClient()

    // Extract info from request if provided
    let userAgent: string | undefined
    let ipHash: string | undefined
    let referrer: string | undefined

    if (request) {
      userAgent = request.headers.get('user-agent') ?? undefined
      referrer = request.headers.get('referer') ?? undefined

      // Hash the IP for anonymous grouping (privacy-preserving)
      const forwarded = request.headers.get('x-forwarded-for')
      const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown'
      const encoder = new TextEncoder()
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(ip + 'poli-salt'))
      ipHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
    }

    await supabase.from('analytics_events').insert({
      event_name: name,
      event_data: data ?? {},
      user_id: userId ?? null,
      session_id: sessionId ?? null,
      page_path: pagePath ?? null,
      user_agent: userAgent ?? null,
      ip_hash: ipHash ?? null,
      referrer: referrer ?? null,
    })
  } catch (err) {
    console.error('Failed to track server event:', err)
  }
}
