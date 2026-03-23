import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { rateLimit, WRITE_OP } from '@/lib/utils/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, WRITE_OP)
    if (!limited.success) return limited.response

    const body = await request.json()
    const { event, data, sessionId, path, referrer: clientReferrer } = body

    if (!event || typeof event !== 'string' || event.length > 100) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 })
    }

    // Validate event data
    if (data && typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Try to get authenticated user (optional — anonymous is fine)
    let userId: string | null = null
    try {
      const supabaseAuth = await createClient()
      const { data: { user } } = await supabaseAuth.auth.getUser()
      userId = user?.id ?? null
    } catch {
      // Anonymous user — that's fine
    }

    // Extract request metadata
    const userAgent = request.headers.get('user-agent') ?? null
    const serverReferrer = request.headers.get('referer') ?? clientReferrer ?? null

    // Vercel provides geo headers automatically on deployed apps
    const city = request.headers.get('x-vercel-ip-city') ?? null
    const region = request.headers.get('x-vercel-ip-country-region') ?? null
    const country = request.headers.get('x-vercel-ip-country') ?? null

    // Hash IP for anonymous grouping
    let ipHash: string | null = null
    try {
      const forwarded = request.headers.get('x-forwarded-for')
      const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown'
      const encoder = new TextEncoder()
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(ip + 'poli-salt'))
      ipHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 16)
    } catch {
      // IP hashing failed — not critical
    }

    // Sanitize event data (strip long values, limit keys)
    const sanitizedData: Record<string, unknown> = {}
    if (data) {
      const keys = Object.keys(data).slice(0, 20) // max 20 properties
      for (const key of keys) {
        const val = data[key]
        if (typeof val === 'string') {
          sanitizedData[key] = val.slice(0, 500)
        } else if (typeof val === 'number' || typeof val === 'boolean' || val === null) {
          sanitizedData[key] = val
        }
      }
    }

    // Inject geo data from Vercel headers into event_data
    if (city) sanitizedData._city = decodeURIComponent(city)
    if (region) sanitizedData._region = region
    if (country) sanitizedData._country = country

    const supabase = createServiceRoleClient()

    const { error } = await supabase.from('analytics_events').insert({
      event_name: event,
      event_data: sanitizedData,
      user_id: userId,
      session_id: typeof sessionId === 'string' ? sessionId.slice(0, 100) : null,
      page_path: typeof path === 'string' ? path.slice(0, 500) : null,
      referrer: typeof serverReferrer === 'string' ? serverReferrer.slice(0, 1000) : null,
      user_agent: typeof userAgent === 'string' ? userAgent.slice(0, 500) : null,
      ip_hash: ipHash,
    })

    if (error) {
      console.error('Analytics insert error:', error.message)
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
