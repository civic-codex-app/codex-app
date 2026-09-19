import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, PUBLIC_READ } from '@/lib/utils/rate-limit'
import zipToDistrictData from '@/lib/data/zip-to-district.json'

type DistrictEntry = { state: string; district: string }
const zipLookup = zipToDistrictData as Record<string, DistrictEntry[]>

/**
 * GET /api/representatives?zip=78701
 *
 * Looks up congressional district(s) for a zip code using local data,
 * then returns matching House rep(s), Senators, and Governor from the DB.
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, PUBLIC_READ)
  if (!limited.success) return limited.response

  const { searchParams } = new URL(request.url)
  const zip = searchParams.get('zip')

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json(
      { error: 'Valid 5-digit zip code required' },
      { status: 400 }
    )
  }

  try {
    const districts = zipLookup[zip]

    if (!districts || districts.length === 0) {
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

    const representatives = [...senators, ...houseReps, ...governors]

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

/** Fallback: look up state from zip prefix and return senators + governor */
async function fallbackByState(zip: string) {
  const state = zipToState(zip)
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
  const data = [...(senators ?? []), ...(governors ?? [])]

  return NextResponse.json(
    { representatives: data ?? [], source: 'state_fallback', state },
    { headers: { 'Cache-Control': 'public, s-maxage=86400' } }
  )
}

/** Map zip code prefix to state abbreviation */
function zipToState(zip: string): string | null {
  const prefix = parseInt(zip.substring(0, 3))
  if (prefix >= 35 && prefix <= 36) return 'AL'
  if (prefix >= 995 && prefix <= 999) return 'AK'
  if (prefix >= 850 && prefix <= 865) return 'AZ'
  if (prefix >= 716 && prefix <= 729) return 'AR'
  if (prefix >= 900 && prefix <= 961) return 'CA'
  if (prefix >= 800 && prefix <= 816) return 'CO'
  if (prefix >= 60 && prefix <= 69) return 'CT'
  if (prefix >= 197 && prefix <= 199) return 'DE'
  if (prefix >= 200 && prefix <= 205) return 'DC'
  if (prefix >= 320 && prefix <= 349) return 'FL'
  if (prefix >= 300 && prefix <= 319) return 'GA'
  if (prefix >= 967 && prefix <= 968) return 'HI'
  if (prefix >= 832 && prefix <= 838) return 'ID'
  if (prefix >= 600 && prefix <= 629) return 'IL'
  if (prefix >= 460 && prefix <= 479) return 'IN'
  if (prefix >= 500 && prefix <= 528) return 'IA'
  if (prefix >= 660 && prefix <= 679) return 'KS'
  if (prefix >= 400 && prefix <= 427) return 'KY'
  if (prefix >= 700 && prefix <= 714) return 'LA'
  if (prefix >= 39 && prefix <= 49) return 'ME'
  if (prefix >= 206 && prefix <= 219) return 'MD'
  if (prefix >= 10 && prefix <= 27) return 'MA'
  if (prefix >= 480 && prefix <= 499) return 'MI'
  if (prefix >= 550 && prefix <= 567) return 'MN'
  if (prefix >= 386 && prefix <= 397) return 'MS'
  if (prefix >= 630 && prefix <= 658) return 'MO'
  if (prefix >= 590 && prefix <= 599) return 'MT'
  if (prefix >= 680 && prefix <= 693) return 'NE'
  if (prefix >= 889 && prefix <= 898) return 'NV'
  if (prefix >= 30 && prefix <= 38) return 'NH'
  if (prefix >= 70 && prefix <= 89) return 'NJ'
  if (prefix >= 870 && prefix <= 884) return 'NM'
  if (prefix >= 100 && prefix <= 149) return 'NY'
  if (prefix >= 270 && prefix <= 289) return 'NC'
  if (prefix >= 580 && prefix <= 588) return 'ND'
  if (prefix >= 430 && prefix <= 458) return 'OH'
  if (prefix >= 730 && prefix <= 749) return 'OK'
  if (prefix >= 970 && prefix <= 979) return 'OR'
  if (prefix >= 150 && prefix <= 196) return 'PA'
  if (prefix >= 28 && prefix <= 29) return 'RI'
  if (prefix >= 290 && prefix <= 299) return 'SC'
  if (prefix >= 570 && prefix <= 577) return 'SD'
  if (prefix >= 370 && prefix <= 385) return 'TN'
  if (prefix >= 750 && prefix <= 799) return 'TX'
  if (prefix >= 840 && prefix <= 847) return 'UT'
  if (prefix >= 50 && prefix <= 59) return 'VT'
  if (prefix >= 220 && prefix <= 246) return 'VA'
  if (prefix >= 980 && prefix <= 994) return 'WA'
  if (prefix >= 247 && prefix <= 268) return 'WV'
  if (prefix >= 530 && prefix <= 549) return 'WI'
  if (prefix >= 820 && prefix <= 831) return 'WY'
  return null
}
