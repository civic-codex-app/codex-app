import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function GET() {
  const supabase = createServiceRoleClient()

  // Get top 6 most-followed politicians by counting follows per politician_id
  const { data: followCounts, error: followError } = await supabase
    .rpc('get_trending_politicians')
    .limit(6)

  // Fallback: if the RPC doesn't exist, query manually
  if (followError) {
    // Manual approach: query follows, group by politician_id
    const { data: follows, error: rawError } = await supabase
      .from('follows')
      .select('politician_id')

    if (rawError) {
      return NextResponse.json({ error: rawError.message }, { status: 500 })
    }

    // Count follows per politician
    const counts = new Map<string, number>()
    for (const f of follows ?? []) {
      counts.set(f.politician_id, (counts.get(f.politician_id) ?? 0) + 1)
    }

    // Sort by count desc, take top 6
    const topIds: Array<{ id: string; count: number }> = []
    counts.forEach((count, id) => {
      topIds.push({ id, count })
    })
    topIds.sort((a, b) => b.count - a.count)
    const top6 = topIds.slice(0, 6)

    if (top6.length === 0) {
      return NextResponse.json([], {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
      })
    }

    // Fetch politician details
    const { data: politicians, error: polError } = await supabase
      .from('politicians')
      .select('id, name, slug, party, state, image_url, title')
      .in('id', top6.map((t) => t.id))

    if (polError) {
      return NextResponse.json({ error: polError.message }, { status: 500 })
    }

    // Merge follow counts and sort
    const polMap = new Map((politicians ?? []).map((p: any) => [p.id, p]))
    const results = top6
      .map((t) => {
        const pol = polMap.get(t.id)
        if (!pol) return null
        return Object.assign({}, pol, { follow_count: t.count })
      })
      .filter(Boolean)

    return NextResponse.json(results, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  }

  return NextResponse.json(followCounts ?? [], {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
  })
}
