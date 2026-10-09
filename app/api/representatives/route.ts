import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { rateLimit, PUBLIC_READ } from '@/lib/utils/rate-limit'
import { districtsForZip, stateForZip, isZip } from '@/lib/utils/zip'
import { candidacyFor } from '@/lib/utils/candidacy'

/**
 * GET /api/representatives?zip=78701
 *
 * Looks up congressional district(s) for a zip code using local data,
 * then returns matching House rep(s), Senators, and Governor from the DB,
 * each with what they are doing in the next election (lib/utils/candidacy.ts).
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, PUBLIC_READ)
  if (!limited.success) return limited.response

  const { searchParams } = new URL(request.url)
  const zip = searchParams.get('zip')

  if (!isZip(zip)) {
    return NextResponse.json(
      { error: 'Valid 5-digit zip code required' },
      { status: 400 }
    )
  }

  try {
    const districts = districtsForZip(zip)

    if (districts.length === 0) {
      // No district data for this zip — try state-level fallback
      return fallbackByState(zip)
    }

    const supabase = await createClient()

    // Collect unique states from the district entries
    const states = [...new Set(districts.map((d) => d.state))]

    // ── Fetch House reps matching state + district ──────────────
    //
    // is_verified is the filter that makes this endpoint answer "who represents
    // you" rather than "who has ever held this seat". It is set only by
    // scripts/import-congress-members.mjs from the Congress.gov member API, so
    // a true value means Congress.gov listed that person in the seat when we
    // last reconciled.
    //
    // Without it this route returns former members alongside current ones.
    // Fifteen House seats hold more than one row: CA-14 returns both Aisha
    // Wahab and Eric Swalwell, GA-13 both Everton Blair and David Scott, GA-03
    // both Brian Jack and Drew Ferguson. Checked against Congress.gov directly:
    // Swalwell's and Scott's terms are recorded as ending in 2026, and the
    // verified row is the sitting member in each case. Three more pairs are the
    // same person stored twice under two spellings (Mike/Michael Waltz,
    // Buddy/Earl Carter, Mike/Michael Turner).
    //
    // 436 of 472 House rows are verified, covering 434 of the 435 seats, and
    // 95.9% of the ZIPs in lib/data/zip-to-district.json still resolve with the
    // filter on. Showing a voter someone who left office as their current
    // representative is worse than showing nobody.
    const housePromises = districts.map((d) =>
      supabase
        .from('politicians')
        .select('id, name, slug, party, state, chamber, district, title, image_url')
        .eq('state', d.state)
        .eq('chamber', 'house')
        .eq('district', d.district)
        .eq('is_verified', true)
        .limit(5)
    )

    // ── Fetch Senators for the state(s) ─────────────────────────
    // Same filter, same reason: 100 of 101 senate rows are verified.
    const senatePromise = supabase
      .from('politicians')
      .select('id, name, slug, party, state, chamber, title, image_url')
      .in('state', states)
      .eq('chamber', 'senate')
      .eq('is_verified', true)
      .order('name')
      .limit(10)

    // ── Fetch Governor(s) for the state(s) ──────────────────────
    // Deliberately NOT filtered on is_verified. Congress.gov covers Congress,
    // so it can never verify a governor and all 55 rows are false; filtering
    // here would return an empty governor for every state in the country.
    // These rows need their own authoritative check against state sources
    // before this endpoint can make the same promise about them.
    const govPromise = supabase
      .from('politicians')
      .select('id, name, slug, party, state, chamber, title, image_url')
      .in('state', states)
      .eq('chamber', 'governor')
      .limit(5)

    const [houseResults, senateResult, govResult] = await Promise.all([
      Promise.all(housePromises),
      senatePromise,
      govPromise,
    ])

    // Deduplicate house reps (a zip may map to multiple districts)
    const seen = new Set<string>()
    const houseReps: any[] = []
    for (const result of houseResults) {
      for (const rep of result.data ?? []) {
        if (!seen.has(rep.id)) {
          seen.add(rep.id)
          houseReps.push(rep)
        }
      }
    }

    const senators = senateResult.data ?? []
    const governors = govResult.data ?? []

    const representatives = await withCandidacy([...senators, ...houseReps, ...governors])

    return NextResponse.json(
      {
        representatives,
        districts,
        state: states[0],
        source: 'zip_lookup',
      },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=86400, stale-while-revalidate=172800',
        },
      }
    )
  } catch (err) {
    console.error('Representatives API error:', err)
    return fallbackByState(zip)
  }
}

/**
 * Each official's next-election status, attached as `candidacy`. Read with
 * the service role: `candidates` and `races` are world-readable, but this
 * keeps the lookup independent of whatever RLS the anon client carries, and
 * it writes nothing.
 */
async function withCandidacy<T extends { id: string; state: string | null; chamber: string; district?: string | null }>(
  reps: T[]
) {
  if (!reps.length) return reps
  try {
    const statuses = await candidacyFor(createServiceRoleClient(), reps)
    return reps.map((r) => ({ ...r, candidacy: statuses.get(r.id) ?? null }))
  } catch (err) {
    console.error('Candidacy lookup failed:', err)
    return reps.map((r) => ({ ...r, candidacy: null }))
  }
}

/** Fallback: look up state from zip prefix and return senators + governor */
async function fallbackByState(zip: string) {
  const state = stateForZip(zip)
  if (!state) {
    return NextResponse.json({ representatives: [], source: 'none' })
  }

  // Senators are filtered to currently-serving members, governors cannot be
  // (see the governor query above), so the two are fetched separately rather
  // than with one .in() that could only apply the filter to both or neither.
  const supabase = await createClient()
  const [{ data: senators }, { data: governors }] = await Promise.all([
    supabase
      .from('politicians')
      .select('id, name, slug, party, state, chamber, title, image_url')
      .eq('state', state)
      .eq('chamber', 'senate')
      .eq('is_verified', true)
      .order('name')
      .limit(10),
    supabase
      .from('politicians')
      .select('id, name, slug, party, state, chamber, title, image_url')
      .eq('state', state)
      .eq('chamber', 'governor')
      .limit(5),
  ])
  const data = await withCandidacy([...(senators ?? []), ...(governors ?? [])])

  return NextResponse.json(
    { representatives: data ?? [], source: 'state_fallback', state },
    { headers: { 'Cache-Control': 'public, s-maxage=86400' } }
  )
}
