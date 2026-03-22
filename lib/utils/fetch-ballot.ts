import { createServiceRoleClient } from '@/lib/supabase/service-role'

/* ── Chamber grouping ─────────────────────────────────────────────── */
export const FEDERAL_CHAMBERS = ['senate', 'house', 'presidential']
export const STATE_CHAMBERS = ['governor', 'state_senate', 'state_house']
export const LOCAL_CHAMBERS = ['mayor', 'city_council', 'county', 'school_board', 'other_local']

export type RaceGroup = 'Federal' | 'State' | 'Local'

export function raceGroup(chamber: string): RaceGroup {
  if (FEDERAL_CHAMBERS.includes(chamber)) return 'Federal'
  if (STATE_CHAMBERS.includes(chamber)) return 'State'
  return 'Local'
}

/* ── Types ────────────────────────────────────────────────────────── */
export interface Candidate {
  id: string
  name: string
  party: string
  is_incumbent: boolean
  status: string
  image_url: string | null
  politician_id: string | null
  bio: string | null
  stance_count: number
}

export interface Race {
  id: string
  name: string
  slug: string
  state: string
  chamber: string
  district: string | null
  description: string | null
  candidates: Candidate[]
  election_name: string
  election_date: string
}

/* ── Data fetching ────────────────────────────────────────────────── */
export async function fetchBallotRaces(state: string, userDistrict?: string | null, userCity?: string | null): Promise<Race[]> {
  const supabase = createServiceRoleClient()
  const todayStr = new Date().toISOString().split('T')[0]

  // Get active elections
  const { data: elections } = await supabase
    .from('elections')
    .select('id, name, election_date')
    .eq('is_active', true)
    .gte('election_date', todayStr)
    .order('election_date')

  if (!elections || elections.length === 0) return []

  const electionIds = elections.map((e) => e.id)
  const electionMap = new Map(elections.map((e) => [e.id, e]))

  // Fetch races for user's state across all active elections
  // Paginate to handle >1000 rows
  const PAGE = 500
  let allRaces: any[] = []
  let from = 0
  let hasMore = true

  while (hasMore) {
    const { data } = await supabase
      .from('races')
      .select('id, name, slug, state, chamber, district, description, election_id')
      .in('election_id', electionIds)
      .eq('state', state)
      .order('chamber')
      .order('name')
      .range(from, from + PAGE - 1)

    if (!data || data.length === 0) {
      hasMore = false
    } else {
      allRaces = [...allRaces, ...data]
      from += PAGE
      if (data.length < PAGE) hasMore = false
    }
  }

  if (allRaces.length === 0) return []

  // Filter races to user's specific district and city
  const LOCAL = ['mayor', 'city_council', 'county', 'school_board', 'other_local']
  const cityLower = userCity?.toLowerCase()

  allRaces = allRaces.filter((r) => {
    // Local races: only show if race name contains user's city
    if (LOCAL.includes(r.chamber)) {
      if (!cityLower) return false // no city info, skip local races
      return r.name.toLowerCase().includes(cityLower)
    }
    // District races: match user's district
    if (r.district) {
      if (!userDistrict) return true // no district info, show all
      return r.district === userDistrict
    }
    // Statewide races (no district): always show
    return true
  })

  if (allRaces.length === 0) return []

  // Fetch candidates for these races
  const raceIds = allRaces.map((r) => r.id)
  let allCandidates: any[] = []
  from = 0
  hasMore = true

  while (hasMore) {
    const { data } = await supabase
      .from('candidates')
      .select('id, race_id, name, party, is_incumbent, status, image_url, politician_id, bio')
      .in('race_id', raceIds)
      .range(from, from + PAGE - 1)

    if (!data || data.length === 0) {
      hasMore = false
    } else {
      allCandidates = [...allCandidates, ...data]
      from += PAGE
      if (data.length < PAGE) hasMore = false
    }
  }

  // Count stances per candidate via candidate_issues
  const candidateIds = allCandidates.map((c) => c.id)
  const stanceCounts = new Map<string, number>()

  if (candidateIds.length > 0) {
    let allStances: any[] = []
    from = 0
    hasMore = true

    while (hasMore) {
      const { data } = await supabase
        .from('candidate_issues')
        .select('candidate_id')
        .in('candidate_id', candidateIds)
        .range(from, from + PAGE - 1)

      if (!data || data.length === 0) {
        hasMore = false
      } else {
        allStances = [...allStances, ...data]
        from += PAGE
        if (data.length < PAGE) hasMore = false
      }
    }

    for (const s of allStances) {
      stanceCounts.set(s.candidate_id, (stanceCounts.get(s.candidate_id) ?? 0) + 1)
    }
  }

  // Group candidates by race
  const candidatesByRace = new Map<string, Candidate[]>()
  for (const c of allCandidates) {
    const list = candidatesByRace.get(c.race_id) ?? []
    list.push({
      id: c.id,
      name: c.name,
      party: c.party,
      is_incumbent: c.is_incumbent,
      status: c.status,
      image_url: c.image_url,
      politician_id: c.politician_id,
      bio: c.bio,
      stance_count: stanceCounts.get(c.id) ?? 0,
    })
    candidatesByRace.set(c.race_id, list)
  }

  return allRaces.map((r) => {
    const election = electionMap.get(r.election_id)
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      state: r.state,
      chamber: r.chamber,
      district: r.district,
      description: r.description,
      candidates: candidatesByRace.get(r.id) ?? [],
      election_name: election?.name ?? '',
      election_date: election?.election_date ?? '',
    }
  })
}
