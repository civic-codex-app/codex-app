import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { rateLimit, PUBLIC_READ } from '@/lib/utils/rate-limit'
import { candidacyFor } from '@/lib/utils/candidacy'
import { STATE_NAMES } from '@/lib/constants/us-states'

/**
 * GET /api/directory?state=MI
 *
 * One state's federal delegation and governor, grouped, each with what they
 * are doing in the next election. The directory's default view is the
 * visitor's own state; this is what it reads. Senators and House members are
 * the Congress.gov-verified rows (see /api/representatives for why);
 * governors cannot be verified by a federal source and are unfiltered.
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, PUBLIC_READ)
  if (!limited.success) return limited.response

  const state = (new URL(request.url).searchParams.get('state') ?? '').toUpperCase()
  if (!STATE_NAMES[state]) return NextResponse.json({ error: 'Unknown state' }, { status: 400 })

  const supabase = createServiceRoleClient()
  const cols = 'id, name, slug, party, state, chamber, district, title, image_url'
  const [senate, house, gov] = await Promise.all([
    supabase.from('politicians').select(cols).eq('state', state).eq('chamber', 'senate').eq('is_verified', true).order('name'),
    supabase.from('politicians').select(cols).eq('state', state).eq('chamber', 'house').eq('is_verified', true),
    supabase.from('politicians').select(cols).eq('state', state).eq('chamber', 'governor').limit(5),
  ])
  type Row = { id: string; name: string; slug: string; party: string; state: string; chamber: string; district: string | null; title: string | null; image_url: string | null }
  const houseRows = ((house.data ?? []) as Row[]).sort((a, b) => Number(a.district ?? 0) - Number(b.district ?? 0) || a.name.localeCompare(b.name))
  const all = [...((senate.data ?? []) as Row[]), ...((gov.data ?? []) as Row[]), ...houseRows]
  const statuses = await candidacyFor(supabase, all)
  const withStatus = (rows: Row[]) => rows.map((r) => ({ ...r, candidacy: statuses.get(r.id) ?? null }))

  return NextResponse.json(
    {
      state,
      stateName: STATE_NAMES[state],
      senate: withStatus((senate.data ?? []) as Row[]),
      governor: withStatus((gov.data ?? []) as Row[]),
      house: withStatus(houseRows),
    },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
  )
}
