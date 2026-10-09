import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, PUBLIC_READ } from '@/lib/utils/rate-limit'
import { districtsForZip, stateForZip, isZip } from '@/lib/utils/zip'
import { fetchBallotRaces } from '@/lib/utils/fetch-ballot'

/**
 * GET /api/ballot?zip=48104
 *
 * The races a ZIP votes in, with their candidates. Public, because the ballot
 * is public: the old /ballot page required an account to show who is running
 * for Senate, which is the one thing a first-time visitor came to find out.
 *
 * Only federal and governor races. They are the ones a ZIP can be matched to:
 * lib/data/zip-to-district.json maps ZIPs to congressional districts, and
 * nothing here maps them to state-legislative districts, whose numbers collide
 * with House districts ("6" is both MI-6 and Michigan's 6th State House seat).
 * The screen says so and points at the state's own sample ballot for the rest.
 *
 * A ZIP that straddles districts returns every House race it touches, flagged
 * `ambiguous`, rather than silently picking one.
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, PUBLIC_READ)
  if (!limited.success) return limited.response

  const zip = new URL(request.url).searchParams.get('zip')
  if (!isZip(zip)) {
    return NextResponse.json({ error: 'Valid 5-digit zip code required' }, { status: 400 })
  }

  const districts = districtsForZip(zip)
  const state = stateForZip(zip)
  if (!state) {
    return NextResponse.json({ zip, state: null, districts: [], ambiguous: false, races: [] })
  }

  const districtNumbers = districts.filter((d) => d.state === state).map((d) => d.district)
  const races = await fetchBallotRaces(state, districtNumbers.length ? districtNumbers : null, null)
  const shown = races
    .filter((r) => ['senate', 'house', 'governor', 'presidential'].includes(r.chamber))
    .map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      chamber: r.chamber,
      district: r.district,
      election_date: r.election_date,
      candidates: r.candidates
        .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
        .map((c) => ({
          id: c.id,
          name: c.name,
          party: c.party,
          status: c.status,
          is_incumbent: c.is_incumbent,
          image_url: c.image_url,
          politician_slug: c.politician_slug,
        })),
    }))

  return NextResponse.json(
    { zip, state, districts, ambiguous: districtNumbers.length > 1, races: shown },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
  )
}

/** Running first, then the two major parties, so a card's faces are the nominees. */
function rank(c: { status: string; party: string }): number {
  const status = c.status === 'running' ? 0 : c.status === 'lost' ? 10 : 20
  const party = c.party === 'democrat' || c.party === 'republican' ? 0 : 1
  return status + party
}
