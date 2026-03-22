import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

/**
 * GET /api/representatives?zip=78701
 *
 * Uses Google Civic Information API (free, no key required for representativeInfoByAddress)
 * to find representatives by zip code, then matches them to our politicians DB.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zip = searchParams.get('zip')

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Valid 5-digit zip code required' }, { status: 400 })
  }

  try {
    // Call Google Civic Information API (free, no API key needed for basic use)
    const civicUrl = `https://www.googleapis.com/civicinfo/v2/representatives?address=${zip}&levels=country&levels=regional&roles=legislatorUpperBody&roles=legislatorLowerBody&roles=headOfGovernment&key=${process.env.GOOGLE_CIVIC_API_KEY || ''}`

    const civicRes = await fetch(civicUrl, { next: { revalidate: 86400 } }) // Cache 24h

    if (!civicRes.ok) {
      // Fallback: just return state-level reps based on zip prefix
      return fallbackByState(zip)
    }

    const civicData = await civicRes.json()
    const officials = civicData.officials ?? []

    // Extract names from Civic API
    const names: string[] = officials.map((o: any) => o.name).filter(Boolean)

    if (names.length === 0) {
      return fallbackByState(zip)
    }

    // Match names to our politicians DB
    const supabase = createServiceRoleClient()
    const matchedPoliticians: any[] = []

    for (const name of names) {
      // Try exact name match first
      const { data } = await supabase
        .from('politicians')
        .select('id, name, slug, party, state, chamber, title, image_url')
        .ilike('name', `%${name.split(' ').pop()}%`) // Match by last name
        .limit(5)

      if (data && data.length > 0) {
        // Find best match — prefer exact name match, then first-name + last-name
        const nameParts = name.toLowerCase().split(' ')
        const lastName = nameParts[nameParts.length - 1]
        const firstName = nameParts[0]

        const match = data.find((p: any) => {
          const pParts = p.name.toLowerCase().split(' ')
          const pLast = pParts[pParts.length - 1]
          const pFirst = pParts[0]
          return pLast === lastName && pFirst === firstName
        }) ?? data.find((p: any) => {
          const pLast = p.name.toLowerCase().split(' ').pop()
          return pLast === lastName
        })

        if (match && !matchedPoliticians.find((m: any) => m.id === match.id)) {
          matchedPoliticians.push(match)
        }
      }
    }

    return NextResponse.json(
      { representatives: matchedPoliticians, source: 'civic_api' },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800' } }
    )
  } catch (err) {
    console.error('Representatives API error:', err)
    return fallbackByState(zip)
  }
}

/** Fallback: look up state from zip prefix and return senators + governor */
async function fallbackByState(zip: string) {
  // Rough zip-to-state mapping using first 3 digits
  const state = zipToState(zip)
  if (!state) {
    return NextResponse.json({ representatives: [], source: 'none' })
  }

  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('politicians')
    .select('id, name, slug, party, state, chamber, title, image_url')
    .eq('state', state)
    .in('chamber', ['senate', 'governor'])
    .order('chamber')
    .order('name')
    .limit(10)

  return NextResponse.json(
    { representatives: data ?? [], source: 'state_fallback', state },
    { headers: { 'Cache-Control': 'public, s-maxage=86400' } }
  )
}

/** Map zip code prefix to state abbreviation */
function zipToState(zip: string): string | null {
  const prefix = parseInt(zip.substring(0, 3))
  // Standard USPS zip code ranges
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
