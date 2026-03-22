import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { STATE_NAMES } from '@/lib/constants/us-states'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { AvatarImage } from '@/components/ui/avatar-image'
import Link from 'next/link'

export const metadata = {
  title: 'Your Ballot Preview — Codex',
  description: 'See the races and candidates on your ballot based on your location.',
}

/* ── Chamber grouping ─────────────────────────────────────────────── */
const FEDERAL_CHAMBERS = ['senate', 'house', 'presidential']
const STATE_CHAMBERS = ['governor', 'state_senate', 'state_house']
const LOCAL_CHAMBERS = ['mayor', 'city_council', 'county', 'school_board', 'other_local']

type RaceGroup = 'Federal' | 'State' | 'Local'

function raceGroup(chamber: string): RaceGroup {
  if (FEDERAL_CHAMBERS.includes(chamber)) return 'Federal'
  if (STATE_CHAMBERS.includes(chamber)) return 'State'
  return 'Local'
}

/* ── Types ────────────────────────────────────────────────────────── */
interface Candidate {
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

interface Race {
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
async function fetchBallotRaces(state: string, userDistrict?: string | null): Promise<Race[]> {
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

  // Filter to only statewide races + user's specific district
  // Statewide = no district (senate, governor, presidential)
  // District-specific = matches user's congressional district
  if (userDistrict) {
    allRaces = allRaces.filter((r) => {
      if (!r.district) return true // statewide race
      return r.district === userDistrict
    })
  }

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

/* ── Page ─────────────────────────────────────────────────────────── */
export default async function BallotPreviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/ballot')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('state, zip_code')
    .eq('id', user.id)
    .single()

  const userState = profile?.state as string | null
  const userZip = profile?.zip_code as string | null
  const stateName = userState ? STATE_NAMES[userState] ?? userState : null

  // If no state set, show prompt
  if (!userState) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
        <h1 className="mb-2 font-serif text-3xl font-bold">Your Ballot Preview</h1>
        <p className="mb-8 text-sm text-[var(--codex-sub)]">
          See the races and candidates that will appear on your ballot.
        </p>

        <div className="rounded-md border border-[var(--codex-border)] py-16 text-center">
          <div className="mb-3">
            <svg
              className="mx-auto h-10 w-10 text-[var(--codex-faint)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <p className="mb-2 text-sm font-medium text-[var(--codex-text)]">
            Location needed
          </p>
          <p className="mb-6 text-sm text-[var(--codex-sub)]">
            Set your state and zip code to see your personalized ballot.
          </p>
          <Link
            href="/account"
            className="rounded-md bg-[var(--codex-badge-bg)] px-5 py-2.5 text-sm font-medium text-[var(--codex-text)] no-underline transition-colors hover:bg-[var(--codex-hover)]"
          >
            Update Profile
          </Link>
        </div>
      </div>
    )
  }

  // Look up user's congressional district from zip
  let userDistrict: string | null = null
  if (userZip) {
    try {
      const zipMap = (await import('@/lib/data/zip-to-district.json')).default as Record<string, string>
      userDistrict = zipMap[userZip] ?? null
    } catch {
      // zip-to-district.json may not exist
    }
  }

  const races = await fetchBallotRaces(userState, userDistrict)

  // Group races by category
  const grouped: Record<RaceGroup, Race[]> = {
    Federal: [],
    State: [],
    Local: [],
  }

  for (const race of races) {
    const group = raceGroup(race.chamber)
    grouped[group].push(race)
  }

  const groups: RaceGroup[] = ['Federal', 'State', 'Local']

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10">
      <h1 className="mb-2 font-serif text-3xl font-bold">Your Ballot Preview</h1>
      <p className="mb-1 text-sm text-[var(--codex-sub)]">
        Races and candidates for {stateName}
        {userZip ? ` (${userZip})` : ''}
      </p>
      <p className="mb-8 text-xs text-[var(--codex-faint)]">
        Based on your profile location. <Link href="/account" className="underline hover:text-[var(--codex-text)]">Update</Link>
      </p>

      {races.length === 0 ? (
        <div className="rounded-md border border-[var(--codex-border)] py-16 text-center">
          <p className="mb-2 text-sm font-medium text-[var(--codex-text)]">
            No upcoming races found
          </p>
          <p className="text-sm text-[var(--codex-sub)]">
            There are no active elections with races in {stateName} right now.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map((groupName) => {
            const groupRaces = grouped[groupName]
            if (groupRaces.length === 0) return null

            return (
              <section key={groupName}>
                <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
                  {groupName} Races
                  <span className="ml-2 text-[var(--codex-faint)]">({groupRaces.length})</span>
                </h2>

                <div className="space-y-3">
                  {groupRaces.map((race) => (
                    <BallotRaceCard key={race.id} race={race} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Race Card ────────────────────────────────────────────────────── */
function BallotRaceCard({ race }: { race: Race }) {
  const chamberLabel =
    CHAMBER_LABELS[race.chamber as ChamberKey] ?? race.chamber

  return (
    <div className="rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)]">
      {/* Header */}
      <div className="border-b border-[var(--codex-border)] px-5 py-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
            {chamberLabel}
          </span>
          {race.district && (
            <span className="text-[11px] text-[var(--codex-faint)]">
              District {race.district}
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold text-[var(--codex-text)]">
          {race.name}
        </h3>
        {race.election_date && (
          <p className="mt-0.5 text-[11px] text-[var(--codex-faint)]">
            {race.election_name} &middot;{' '}
            {new Date(race.election_date + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* Candidates */}
      {race.candidates.length > 0 ? (
        <div className="divide-y divide-[var(--codex-border)]">
          {race.candidates.map((candidate) => (
            <CandidateRow key={candidate.id} candidate={candidate} />
          ))}
        </div>
      ) : (
        <div className="px-5 py-6 text-center text-sm text-[var(--codex-faint)]">
          No candidates filed yet
        </div>
      )}
    </div>
  )
}

/* ── Candidate Row ────────────────────────────────────────────────── */
function CandidateRow({ candidate }: { candidate: Candidate }) {
  const href = candidate.politician_id
    ? `/politicians/${candidate.politician_id}`
    : `/candidates/${candidate.id}`

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-5 py-3 no-underline transition-colors hover:bg-[var(--codex-hover)]"
    >
      {/* Avatar */}
      <div
        className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full"
        style={{ border: `2px solid ${partyColor(candidate.party)}33` }}
      >
        <AvatarImage
          src={candidate.image_url}
          alt={candidate.name}
          size={36}
          fallbackColor={partyColor(candidate.party)}
          party={candidate.party}
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-[var(--codex-text)]">
            {candidate.name}
          </span>
          {candidate.is_incumbent && (
            <span className="rounded-sm bg-[var(--codex-badge-bg)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em] text-[var(--codex-badge-text)]">
              Incumbent
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--codex-sub)]">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: partyColor(candidate.party) }}
          />
          <span>{partyLabel(candidate.party)}</span>
          {candidate.stance_count > 0 && (
            <>
              <span className="text-[var(--codex-faint)]">&middot;</span>
              <span className="text-[var(--codex-faint)]">
                {candidate.stance_count} stance{candidate.stance_count !== 1 ? 's' : ''} on record
              </span>
            </>
          )}
        </div>
      </div>

      {/* Arrow */}
      <svg
        className="h-4 w-4 flex-shrink-0 text-[var(--codex-faint)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  )
}
