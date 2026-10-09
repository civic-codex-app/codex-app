import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { invalidateSettingsCache } from '@/lib/utils/site-settings'
import { rateLimit, WRITE_OP } from '@/lib/utils/rate-limit'

const ALLOWED_KEYS = new Set([
  'site_name', 'site_tagline', 'site_description',
  'og_title', 'og_description', 'homepage_title', 'homepage_description',
  // The home screen's "next deadline in Congress" row. Nothing in the schema
  // records a statutory deadline, so an admin states it: what runs out, when
  // (YYYY-MM-DD), one sentence of context, and the bill it comes from.
  'deadline_label', 'deadline_date', 'deadline_note', 'deadline_href',
])

const MAX_VALUE_LENGTH = 500

export async function PUT(request: NextRequest) {
  const limited = rateLimit(request, WRITE_OP)
  if (!limited.success) return limited.response

  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  const serviceClient = createServiceRoleClient()

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
