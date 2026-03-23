import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeVoterMatch } from '@/lib/utils/voter-match'
import { STANCE_NUMERIC } from '@/lib/utils/stances'
import { rateLimit, EXPENSIVE_OP } from '@/lib/utils/rate-limit'

const PAGE_SIZE = 1000
const MIN_MATCHING_ISSUES = 3
const TOP_N = 20

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, EXPENSIVE_OP)
    if (!limited.success) return limited.response

    const body = await request.json()
    const stances: Record<string, string> = body?.stances

    // Validate input
    if (!stances || typeof stances !== 'object' || Object.keys(stances).length === 0) {
      return NextResponse.json({ error: 'stances object is required' }, { status: 400 })
    }

    // Limit stances count and validate slug format
    if (Object.keys(stances).length > 30) {
      return NextResponse.json({ error: 'Too many stances' }, { status: 400 })
    }

    // Validate each stance value is a known type
    for (const [slug, stance] of Object.entries(stances)) {
      if (typeof slug !== 'string' || typeof stance !== 'string') {
        return NextResponse.json({ error: 'Invalid stance format' }, { status: 400 })
      }
      if (!/^[a-z0-9-]+$/.test(slug) || slug.length > 100) {
        return NextResponse.json({ error: 'Invalid issue slug format' }, { status: 400 })
      }
      if (!(stance in STANCE_NUMERIC)) {
        return NextResponse.json({ error: `Unknown stance type: ${stance}` }, { status: 400 })
      }
    }

    const supabase = await createClient()
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
    let allRows: Array<{ politician_id: string; stance: string; is_verified: boolean | null; issues: any }> = []
    from = 0

    // Process in chunks of 200 politician IDs to stay under URL limits
    const CHUNK = 200
    for (let c = 0; c < federalIds.length; c += CHUNK) {
      const chunk = federalIds.slice(c, c + CHUNK)
      let chunkFrom = 0

      while (true) {
        const { data, error } = await supabase
          .from('politician_issues')
          .select('politician_id, stance, is_verified, issues!inner(slug)')
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

    // Group stances and verification status by politician_id
    const byPolitician = new Map<string, Record<string, string>>()
    const verifiedByPolitician = new Map<string, Record<string, boolean>>()
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

      let vmap = verifiedByPolitician.get(row.politician_id)
      if (!vmap) {
        vmap = {}
        verifiedByPolitician.set(row.politician_id, vmap)
      }
      vmap[slug] = row.is_verified === true
    }

    // Compute match scores
    const scored: Array<{ politicianId: string; score: number; matched: number; total: number }> = []

    for (const [politicianId, polStances] of byPolitician) {
      const verifiedMap = verifiedByPolitician.get(politicianId)
      const result = computeVoterMatch(stances, polStances, verifiedMap)
      // Require minimum matching issues
      if (result.matched >= MIN_MATCHING_ISSUES) {
        scored.push({ politicianId, ...result })
      }
    }

    // Sort by score desc
    scored.sort((a, b) => b.score - a.score || b.matched - a.matched)

    if (scored.length === 0) {
      return NextResponse.json(
        { results: [], yourState: [] },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }

    // Get all politician IDs we need details for
    const allScoredIds = scored.slice(0, 100).map((t) => t.politicianId)
    const { data: politicians, error: polError } = await supabase
      .from('politicians')
      .select('id, name, slug, party, state, chamber, image_url, title, twitter_url, facebook_url, instagram_url, website_url')
      .in('id', allScoredIds)

    if (polError) {
      console.error('Supabase error fetching politicians:', polError)
      return NextResponse.json({ error: 'Failed to fetch politicians' }, { status: 500 })
    }

    const polMap = new Map(
      (politicians ?? []).map((p) => [p.id, p])
    )

    // Get user's state from profile (if logged in)
    let userState: string | null = null
    try {
      const authHeader = request.headers.get('cookie')
      if (authHeader) {
        // Try to get user state from the request body
        userState = body?.userState ?? null
      }
    } catch {}

    function buildResult(t: typeof scored[0]) {
      const politician = polMap.get(t.politicianId)
      if (!politician) return null

      // Build per-issue comparison
      const polStances = byPolitician.get(t.politicianId) ?? {}
      const issueBreakdown: Array<{ slug: string; userStance: string; polStance: string; distance: number }> = []
      for (const slug of Object.keys(stances)) {
        const userStance = stances[slug]
        const polStance = polStances[slug]
        if (!polStance) continue
        const uVal = STANCE_NUMERIC[userStance]
        const pVal = STANCE_NUMERIC[polStance]
        if (uVal == null || pVal == null || uVal < 0 || pVal < 0) continue
        // Skip neutral/mixed user stances (same as scoring)
        if (userStance === 'neutral' || userStance === 'mixed') continue
        issueBreakdown.push({ slug, userStance, polStance, distance: Math.abs(uVal - pVal) })
      }
      // Sort: agreed first, then disagreed
      issueBreakdown.sort((a, b) => a.distance - b.distance)

      return {
        politician: {
          name: politician.name,
          slug: politician.slug,
          party: politician.party,
          state: politician.state,
          chamber: politician.chamber,
          image_url: politician.image_url,
          title: politician.title,
          twitter_url: politician.twitter_url,
          facebook_url: politician.facebook_url,
          instagram_url: politician.instagram_url,
          website_url: politician.website_url,
        },
        score: t.score,
        matchedIssues: t.matched,
        totalIssues: t.total,
        issueBreakdown,
      }
    }

    // Split into state-specific results with party diversity
    let yourState: ReturnType<typeof buildResult>[] = []
    if (userState) {
      const stateScored = scored.filter(t => {
        const pol = polMap.get(t.politicianId)
        return pol?.state === userState
      })
      const stateByParty = new Map<string, typeof scored>()
      for (const s of stateScored) {
        const pol = polMap.get(s.politicianId)
        if (!pol) continue
        if (!stateByParty.has(pol.party)) stateByParty.set(pol.party, [])
        stateByParty.get(pol.party)!.push(s)
      }
      // Top 1 from each party first
      const stateDiv: typeof scored = []
      const stateUsed = new Set<string>()
      const stateBests = [...stateByParty.entries()]
        .map(([, ps]) => ps[0])
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
      for (const s of stateBests) {
        stateDiv.push(s)
        stateUsed.add(s.politicianId)
      }
      for (const s of stateScored) {
        if (stateDiv.length >= 10) break
        if (!stateUsed.has(s.politicianId)) {
          stateDiv.push(s)
          stateUsed.add(s.politicianId)
        }
      }
      yourState = stateDiv.map(buildResult).filter(Boolean) as typeof yourState
    }

    // Build diverse results: top 1 from each party first, then fill by score
    const byParty = new Map<string, typeof scored>()
    for (const s of scored) {
      const pol = polMap.get(s.politicianId)
      if (!pol) continue
      const party = pol.party
      if (!byParty.has(party)) byParty.set(party, [])
      byParty.get(party)!.push(s)
    }

    const diverse: typeof scored = []
    const usedIds = new Set<string>()

    // Top 1 from each party (sorted by best score first)
    const partyBests = [...byParty.entries()]
      .map(([, ps]) => ps[0])
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)

    for (const s of partyBests) {
      diverse.push(s)
      usedIds.add(s.politicianId)
    }

    // Fill remaining slots from overall top scores
    for (const s of scored) {
      if (diverse.length >= TOP_N) break
      if (!usedIds.has(s.politicianId)) {
        diverse.push(s)
        usedIds.add(s.politicianId)
      }
    }

    const results = diverse
      .slice(0, TOP_N)
      .map(buildResult)
      .filter(Boolean)

    return NextResponse.json(
      { results, yourState },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('Match API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
