import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { computeVoterMatch } from '@/lib/utils/voter-match'
import { STANCE_NUMERIC } from '@/lib/utils/stances'

const PAGE_SIZE = 1000
const MIN_MATCHING_ISSUES = 3
const TOP_N = 20

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const stances: Record<string, string> = body?.stances

    // Validate input
    if (!stances || typeof stances !== 'object' || Object.keys(stances).length === 0) {
      return NextResponse.json({ error: 'stances object is required' }, { status: 400 })
    }

    // Validate each stance value is a known type
    for (const [slug, stance] of Object.entries(stances)) {
      if (typeof slug !== 'string' || typeof stance !== 'string') {
        return NextResponse.json({ error: 'Invalid stance format' }, { status: 400 })
      }
      if (!(stance in STANCE_NUMERIC)) {
        return NextResponse.json({ error: `Unknown stance type: ${stance}` }, { status: 400 })
      }
    }

    const supabase = createServiceRoleClient()
    const issueSlugs = Object.keys(stances)

    // First get federal politician IDs only (senate, house, governor, presidential)
    // This drastically reduces the dataset from 7000+ to ~500
    const FEDERAL_CHAMBERS = ['senate', 'house', 'governor', 'presidential']
    let federalIds: string[] = []
    let from = 0

    while (true) {
      const { data } = await supabase
        .from('politicians')
        .select('id')
        .in('chamber', FEDERAL_CHAMBERS)
        .range(from, from + PAGE_SIZE - 1)

      if (!data || data.length === 0) break
      federalIds = federalIds.concat(data.map(p => p.id))
      if (data.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }

    // Fetch stances only for federal politicians on the user's issues
    let allRows: Array<{ politician_id: string; stance: string; issues: any }> = []
    from = 0

    // Process in chunks of 200 politician IDs to stay under URL limits
    const CHUNK = 200
    for (let c = 0; c < federalIds.length; c += CHUNK) {
      const chunk = federalIds.slice(c, c + CHUNK)
      let chunkFrom = 0

      while (true) {
        const { data, error } = await supabase
          .from('politician_issues')
          .select('politician_id, stance, issues!inner(slug)')
          .in('politician_id', chunk)
          .in('issues.slug', issueSlugs)
          .range(chunkFrom, chunkFrom + PAGE_SIZE - 1)

        if (error) {
          console.error('Supabase error fetching politician_issues:', error)
          return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
        }

        if (!data || data.length === 0) break
        allRows = allRows.concat(data as any[])
        if (data.length < PAGE_SIZE) break
        chunkFrom += PAGE_SIZE
      }
    }

    // Group stances by politician_id
    const byPolitician = new Map<string, Record<string, string>>()
    for (const row of allRows) {
      // Supabase !inner join can return issues as object or array
      const issueData = Array.isArray(row.issues) ? row.issues[0] : row.issues
      const slug = issueData?.slug
      if (!slug) continue

      let map = byPolitician.get(row.politician_id)
      if (!map) {
        map = {}
        byPolitician.set(row.politician_id, map)
      }
      map[slug] = row.stance
    }

    // Compute match scores
    const scored: Array<{ politicianId: string; score: number; matched: number; total: number }> = []

    for (const [politicianId, polStances] of byPolitician) {
      const result = computeVoterMatch(stances, polStances)
      // Require minimum matching issues
      if (result.matched >= MIN_MATCHING_ISSUES) {
        scored.push({ politicianId, ...result })
      }
    }

    // Sort by score desc, take top 20
    scored.sort((a, b) => b.score - a.score || b.matched - a.matched)
    const top = scored.slice(0, TOP_N)

    if (top.length === 0) {
      return NextResponse.json(
        { results: [] },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Fetch politician details for top results
    const politicianIds = top.map((t) => t.politicianId)
    const { data: politicians, error: polError } = await supabase
      .from('politicians')
      .select('id, name, slug, party, state, chamber, image_url, title')
      .in('id', politicianIds)

    if (polError) {
      console.error('Supabase error fetching politicians:', polError)
      return NextResponse.json({ error: 'Failed to fetch politicians' }, { status: 500 })
    }

    const polMap = new Map(
      (politicians ?? []).map((p) => [p.id, p])
    )

    const results = top
      .map((t) => {
        const politician = polMap.get(t.politicianId)
        if (!politician) return null
        return {
          politician: {
            name: politician.name,
            slug: politician.slug,
            party: politician.party,
            state: politician.state,
            chamber: politician.chamber,
            image_url: politician.image_url,
            title: politician.title,
          },
          score: t.score,
          matchedIssues: t.matched,
          totalIssues: t.total,
        }
      })
      .filter(Boolean)

    return NextResponse.json(
      { results },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('Match API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
