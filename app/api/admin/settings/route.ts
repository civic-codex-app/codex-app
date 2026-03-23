import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { invalidateSettingsCache } from '@/lib/utils/site-settings'
import { rateLimit, WRITE_OP } from '@/lib/utils/rate-limit'

const ALLOWED_KEYS = new Set([
  'site_name', 'site_tagline', 'site_description',
  'og_title', 'og_description', 'homepage_title', 'homepage_description',
])

const MAX_VALUE_LENGTH = 500

export async function PUT(request: NextRequest) {
  const limited = rateLimit(request, WRITE_OP)
  if (!limited.success) return limited.response

  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Admin check
  const serviceClient = createServiceRoleClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Parse body
  const body = await request.json()
  const settings = body.settings as Record<string, string>

  if (!settings || typeof settings !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  // Filter to allowed keys and validate values
  const entries = Object.entries(settings).filter(
    ([key, v]) => ALLOWED_KEYS.has(key) && typeof v === 'string' && v.trim().length > 0
  )

  if (entries.length === 0) {
    return NextResponse.json({ error: 'No valid settings provided' }, { status: 400 })
  }

  // Upsert each setting
  for (const [key, value] of entries) {
    const trimmed = value.trim().slice(0, MAX_VALUE_LENGTH)
    const { error } = await serviceClient
      .from('site_settings')
      .upsert({ key, value: trimmed, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) {
      return NextResponse.json({ error: `Failed to save ${key}: ${error.message}` }, { status: 500 })
    }
  }

  // Invalidate cache so next page render picks up new values
  invalidateSettingsCache()

  return NextResponse.json({ success: true, updated: entries.length })
}
