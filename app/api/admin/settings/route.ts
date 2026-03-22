import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { invalidateSettingsCache } from '@/lib/utils/site-settings'

export async function PUT(request: Request) {
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

  // Upsert each setting
  const entries = Object.entries(settings).filter(
    ([, v]) => typeof v === 'string' && v.trim().length > 0
  )

  for (const [key, value] of entries) {
    const { error } = await serviceClient
      .from('site_settings')
      .upsert({ key, value: value.trim(), updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) {
      return NextResponse.json({ error: `Failed to save ${key}: ${error.message}` }, { status: 500 })
    }
  }

  // Invalidate cache so next page render picks up new values
  invalidateSettingsCache()

  return NextResponse.json({ success: true, updated: entries.length })
}
