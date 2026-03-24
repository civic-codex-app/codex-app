import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { rateLimit, WRITE_OP } from '@/lib/utils/rate-limit'
import { randomBytes } from 'crypto'
import { z } from 'zod'

const ToggleSchema = z.object({
  enabled: z.boolean(),
})

/**
 * GET /api/sharing
 * Returns the current sharing status for the authenticated user.
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, WRITE_OP)
  if (!limited.success) return limited.response

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createServiceRoleClient()
    const { data, error } = await admin
      .from('profiles')
      .select('sharing_enabled, anonymous_id')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch sharing status' }, { status: 500 })
    }

    return NextResponse.json({
      enabled: data?.sharing_enabled ?? false,
      anonymousId: data?.anonymous_id ?? null,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/sharing
 * Toggle anonymous sharing on/off.
 * When enabling, generates a unique anonymous_id if one doesn't exist.
 */
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, WRITE_OP)
  if (!limited.success) return limited.response

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = ToggleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const admin = createServiceRoleClient()
    const { enabled } = parsed.data

    if (enabled) {
      // Check if user already has an anonymous_id
      const { data: existing } = await admin
        .from('profiles')
        .select('anonymous_id')
        .eq('id', user.id)
        .single()

      let anonymousId = existing?.anonymous_id

      if (!anonymousId) {
        // Generate unique 8-char hex ID with retry on collision
        for (let attempt = 0; attempt < 5; attempt++) {
          const candidate = randomBytes(4).toString('hex')
          const { error: updateError } = await admin
            .from('profiles')
            .update({ sharing_enabled: true, anonymous_id: candidate })
            .eq('id', user.id)

          if (!updateError) {
            anonymousId = candidate
            break
          }

          // If unique constraint violation, retry
          if (updateError.code === '23505') continue
          return NextResponse.json({ error: 'Failed to enable sharing' }, { status: 500 })
        }

        if (!anonymousId) {
          return NextResponse.json({ error: 'Failed to generate anonymous ID' }, { status: 500 })
        }
      } else {
        // Re-enable with existing ID
        await admin
          .from('profiles')
          .update({ sharing_enabled: true })
          .eq('id', user.id)
      }

      return NextResponse.json({ enabled: true, anonymousId })
    } else {
      // Disable sharing (keep anonymous_id for re-enable)
      await admin
        .from('profiles')
        .update({ sharing_enabled: false })
        .eq('id', user.id)

      return NextResponse.json({ enabled: false, anonymousId: null })
    }
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
