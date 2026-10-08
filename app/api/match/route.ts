import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { computeVoterMatch } from '@/lib/utils/voter-match'
import { STANCE_NUMERIC } from '@/lib/utils/stances'
import { rateLimit, EXPENSIVE_OP } from '@/lib/utils/rate-limit'

const PAGE_SIZE = 1000
const MIN_MATCHING_ISSUES = 3
const TOP_N = 20


/**
 * Every federal politician's stances, as a compact index.
 *
 * Shape matters here. Returning the raw join rows produced a 2.15 MB payload,
 * and Next refuses to store an unstable_cache entry over 2 MB — it logged
 * "items over 2MB can not be cached" and silently re-ran the whole fetch on
 * every request, so the cache was decorative. Interning the 22 slugs and the 9
 * stance values and storing [slugIdx, stanceIdx, verified] triples brings the
 * same ~11,800 rows to roughly 120 KB, comfortably inside the limit.
 *
 * Service role rather than the request's cookie client: unstable_cache cannot
 * read cookies, and this is public data that /issues and /insights already read
 * the same way. Nothing per-user is fetched here; the caller filters and scores.
 *
 * A day because politician_issues is template-generated and static — see
 * app/(public)/issues/page.tsx for the longer version of that argument.
 */
type FederalStanceIndex = {
  slugs: string[]
  stanceValues: string[]
  rows: Record<string, Array<[number, number, 0 | 1]>>
}

const getFederalStances = unstable_cache(
  async (): Promise<FederalStanceIndex> => {
    const supabase = createServiceRoleClient()
    const FEDERAL_CHAMBERS = ['senate', 'house', 'governor', 'presidential']

    let federalIds: string[] = []
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data } = await supabase
        .from('politicians')
        .select('id')
        .in('chamber', FEDERAL_CHAMBERS)
        .range(from, from + PAGE_SIZE - 1)
      if (!data || data.length === 0) break
      federalIds = federalIds.concat(data.map((p) => p.id))
      if (data.length < PAGE_SIZE) break
    }

    const slugs: string[] = []
    const stanceValues: string[] = []
    const slugIdx = new Map<string, number>()
    const stanceIdx = new Map<string, number>()
    const intern = (v: string, list: string[], map: Map<string, number>) => {
      let i = map.get(v)
      if (i === undefined) {
        i = list.length
        list.push(v)
        map.set(v, i)
      }
      return i
    }

    const rows: FederalStanceIndex['rows'] = {}
    const CHUNK = 200
    for (let c = 0; c < federalIds.length; c += CHUNK) {
      const chunk = federalIds.slice(c, c + CHUNK)
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase
          .from('politician_issues')
          .select('politician_id, stance, is_verified, issues!inner(slug)')
          .in('politician_id', chunk)
          .range(from, from + PAGE_SIZE - 1)
        if (error) {
          console.error('[match] stance fetch failed:', error.message)
          break
        }
        if (!data || data.length === 0) break
        for (const row of data as any[]) {
          // A Supabase !inner join returns the related row as an object or a
          // one-element array depending on how it infers the relationship.
          const issue = Array.isArray(row.issues) ? row.issues[0] : row.issues
          const slug = issue?.slug
          if (!slug || !row.stance) continue
          ;(rows[row.politician_id] ??= []).push([
            intern(slug, slugs, slugIdx),
            intern(row.stance, stanceValues, stanceIdx),
            row.is_verified === true ? 1 : 0,
          ])
        }
        if (data.length < PAGE_SIZE) break
      }
    }
    return { slugs, stanceValues, rows }
  },
  ['match-federal-stance-index'],
  { revalidate: 86400, tags: ['stances'] }
)

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

    const issueSlugs = Object.keys(stances)

    // One shared, pre-indexed fetch of every federal stance; the per-user part
    // is the scoring, which happens below in memory.
    //
    // This used to page the politicians table and then page politician_issues
    // in chunks of 200 ids on EVERY quiz submission. Only the scoring varies
    // between users: the rows underneath are the same ~536 federal politicians
    // and the same 22 issues every time. politician_issues is 73.89 MB, half
    // the database, on an instance too small to keep it resident, so each
    // submission paid real disk IO to re-read rows the previous submission had
    // just read.
    const index = await getFederalStances()

    const byPolitician = new Map<string, Record<string, string>>()
    const verifiedByPolitician = new Map<string, Record<string, boolean>>()
    const wanted = new Set(issueSlugs)
    for (const [politicianId, triples] of Object.entries(index.rows)) {
      const polStances: Record<string, string> = {}
      const verified: Record<string, boolean> = {}
      for (const [slugIdx, stanceIdx, isVerified] of triples) {
        const slug = index.slugs[slugIdx]
        if (!wanted.has(slug)) continue
        polStances[slug] = index.stanceValues[stanceIdx]
        verified[slug] = isVerified === 1
      }
      if (Object.keys(polStances).length > 0) {
        byPolitician.set(politicianId, polStances)
        verifiedByPolitician.set(politicianId, verified)
      }
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

    // Details for the ranked politicians, and the signed-in user's state below.
    // The cookie client, not the cached service-role one: the profile read that
    // follows is genuinely per-request.
    const supabase = await createClient()

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

    // Outliers: surprising cross-party matches and unexpected disagreements
    // Find the user's "expected" party (party with highest avg score)
    const partyAvgs: Record<string, { total: number; count: number }> = {}
    for (const s of scored) {
      const pol = polMap.get(s.politicianId)
      if (!pol) continue
      if (!partyAvgs[pol.party]) partyAvgs[pol.party] = { total: 0, count: 0 }
      partyAvgs[pol.party].total += s.score
      partyAvgs[pol.party].count++
    }
    const sortedParties = Object.entries(partyAvgs)
      .map(([party, { total, count }]) => ({ party, avg: total / count }))
      .sort((a, b) => b.avg - a.avg)

    const userParty = sortedParties[0]?.party
    const oppositeParties = sortedParties.slice(1).map(p => p.party)

    // "Across the aisle" — best matches from opposite parties
    const acrossTheAisle = oppositeParties
      .flatMap(party => (byParty.get(party) ?? []).slice(0, 2))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(buildResult)
      .filter(Boolean)

    // "Might surprise you" — lowest-scoring from user's expected party
    const surprises = (byParty.get(userParty ?? '') ?? [])
      .slice(-5)
      .reverse()
      .map(buildResult)
      .filter(Boolean)

    return NextResponse.json(
      { results, yourState, acrossTheAisle, surprises, userParty },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('Match API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
