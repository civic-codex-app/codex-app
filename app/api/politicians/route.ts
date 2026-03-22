import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextRequest, NextResponse } from 'next/server'
import { computeAlignment } from '@/lib/utils/alignment'
import { stanceBucket } from '@/lib/utils/stances'

const PAGE_SIZE = 50

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = createServiceRoleClient()

  let query = supabase.from('politicians').select('*', { count: 'exact' })

  const chamber = sp.get('chamber')
  const state = sp.get('state')
  const party = sp.get('party')
  const q = sp.get('q')

  if (chamber && chamber !== 'all') query = query.eq('chamber', chamber)
  if (state) query = query.eq('state', state)
  if (party) query = query.eq('party', party)
  if (q) query = query.or(`name.ilike.%${q}%,state.ilike.%${q}%,title.ilike.%${q}%`)

  const sort = sp.get('sort') ?? 'name'
  if (sort === 'name-desc') {
    query = query.order('name', { ascending: false })
  } else if (sort === 'state') {
    query = query.order('state').order('name')
  } else {
    query = query.order('name')
  }

  query = query.range(offset, offset + PAGE_SIZE - 1)

  const { data: politicians, count } = await query

  if (!politicians) {
    return NextResponse.json({ politicians: [], stances: {}, alignments: {}, hasMore: false })
  }

  // Fetch stances for this page
  const ids = politicians.map(p => p.id)
  const { data: stancesRaw } = await supabase
    .from('politician_issues')
    .select('politician_id, stance, issues:issue_id(slug)')
    .in('politician_id', ids)

  const stances: Record<string, { supports: number; opposes: number; mixed: number }> = {}
  const stancesByPol: Record<string, { stance: string; issues: { slug: string } | null }[]> = {}

  for (const s of (stancesRaw ?? []) as unknown as { politician_id: string; stance: string; issues: { slug: string } | null }[]) {
    if (!stances[s.politician_id]) stances[s.politician_id] = { supports: 0, opposes: 0, mixed: 0 }
    if (!stancesByPol[s.politician_id]) stancesByPol[s.politician_id] = []
    const bucket = stanceBucket(s.stance)
    if (bucket === 'supports') stances[s.politician_id].supports++
    else if (bucket === 'opposes') stances[s.politician_id].opposes++
    else stances[s.politician_id].mixed++
    stancesByPol[s.politician_id].push(s)
  }

  const alignments: Record<string, number> = {}
  for (const pol of politicians) {
    const data = stancesByPol[pol.id]
    if (data) alignments[pol.id] = computeAlignment(pol.party, data)
  }

  const totalCount = count ?? 0
  const hasMore = offset + PAGE_SIZE < totalCount

  return NextResponse.json({ politicians, stances, alignments, hasMore, totalCount })
}
