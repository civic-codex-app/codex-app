import { Suspense } from 'react'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ElectionFilters } from '@/components/elections/election-filters'
import { ElectionCountdown } from '@/components/elections/election-countdown'
import { RaceSection } from '@/components/elections/race-section'
import { AvatarImage } from '@/components/ui/avatar-image'
import { PartyIcon } from '@/components/icons/party-icons'
import { CHAMBER_LABELS } from '@/lib/constants/chambers'
import { partyColor, partyLabel } from '@/lib/constants/parties'

export const revalidate = 600 // 10 minutes

export const metadata = {
  title: 'Elections -- Codex',
  description: 'Track upcoming elections -- Senate, House, Governor, and local races across the country.',
}

const CHAMBER_ORDER = [
  'senate', 'house', 'governor', 'mayor', 'state_senate',
  'state_house', 'city_council', 'county', 'school_board', 'other_local',
]

const LOCAL_CHAMBERS = ['mayor', 'city_council', 'state_senate', 'state_house', 'county', 'school_board', 'other_local']

interface PageProps {
  searchParams: Promise<{ chamber?: string; state?: string }>
}

/** Paginate Supabase .select() to avoid 1000-row cap */
async function fetchAllRaces(
  supabase: ReturnType<typeof createServiceRoleClient>,
  electionId: string,
  options?: { chamber?: string; state?: string }
) {
  const PAGE_SIZE = 500
  let from = 0
  const all: any[] = []

  while (true) {
    let query = supabase
      .from('races')
      .select(`
        *,
        candidates (id, name, party, is_incumbent, status, image_url, politician_id),
        incumbent:incumbent_id (id, name, party, image_url, slug)
      `)
      .eq('election_id', electionId)

    if (options?.chamber === 'local') {
      query = query.in('chamber', LOCAL_CHAMBERS)
    } else if (options?.chamber && options.chamber !== 'all') {
      query = query.eq('chamber', options.chamber)
    }
    if (options?.state) {
      query = query.eq('state', options.state)
    }

    query = query.order('state').range(from, from + PAGE_SIZE - 1)
    const { data, error } = await query
    if (error) {
      console.error('Failed to fetch races:', error.message)
      break
    }
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return all
}

/** Fetch just ids + chamber for stats (lighter query, still paginated) */
async function fetchRaceStats(
  supabase: ReturnType<typeof createServiceRoleClient>,
  electionId: string
) {
  const PAGE_SIZE = 500
  let from = 0
  const all: { id: string; chamber: string }[] = []

  while (true) {
    const { data, error } = await supabase
      .from('races')
      .select('id, chamber')
      .eq('election_id', electionId)
      .range(from, from + PAGE_SIZE - 1)
    if (error) {
      console.error('Failed to fetch race stats:', error.message)
      break
    }
    if (!data || data.length === 0) break
    all.push(...(data as any))
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return all
}

export default async function ElectionsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createServiceRoleClient()

  // Fetch the active election
  const { data: election } = await supabase
    .from('elections')
    .select('*')
    .eq('is_active', true)
    .order('election_date', { ascending: false })
    .limit(1)
    .single()

  if (!election) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-[1200px] px-6 md:px-10">
          <div className="py-20 text-center text-[var(--codex-faint)]">
            <div className="mb-2 font-serif text-2xl">No active elections</div>
            <div className="text-sm">Check back soon for upcoming election coverage</div>
          </div>
          <Footer />
        </div>
      </>
    )
  }

  // Fetch filtered races (paginated) and all race stats in parallel
  const [raceList, allRaceList] = await Promise.all([
    fetchAllRaces(supabase, election.id, {
      chamber: params.chamber,
      state: params.state,
    }),
    fetchRaceStats(supabase, election.id),
  ])

  // Compute chamber counts from all races (unfiltered)
  const chamberCounts: Record<string, number> = {}
  for (const r of allRaceList) {
    chamberCounts[r.chamber] = (chamberCounts[r.chamber] || 0) + 1
  }

  const totalRaces = allRaceList.length

  // Group filtered races by chamber
  const grouped: Record<string, typeof raceList> = {}
  for (const race of raceList) {
    const key = race.chamber as string
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(race)
  }

  // Format election date
  const electionDate = new Date(election.election_date + 'T00:00:00')
  const dateStr = electionDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const hasFilters = !!(params.chamber || params.state)

  // Key races: races with the most candidates (competitive) — pick up to 6
  const keyRaces = [...raceList]
    .filter((r) => (r.candidates?.length ?? 0) >= 2)
    .sort((a, b) => (b.candidates?.length ?? 0) - (a.candidates?.length ?? 0))
    .slice(0, 6)

  // Count total candidates across all races
  const totalCandidates = raceList.reduce((sum, r) => sum + (r.candidates?.length ?? 0), 0)

  // Count unique states
  const uniqueStates = new Set(raceList.map((r: any) => r.state)).size

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        {/* Hero */}
        <div className="mb-6 max-w-[600px]">
          <h1 className="mb-4 animate-fade-up font-serif text-[clamp(32px,4vw,52px)] font-normal leading-[1.1]">
            {election.name.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="italic text-[var(--codex-subtle)]">
              {election.name.split(' ').pop()}
            </span>
          </h1>
          <p className="animate-fade-up text-[15px] leading-[1.7] text-[var(--codex-subtle)]">
            {election.description ?? `Election day: ${dateStr}`}
          </p>
        </div>

        {/* Countdown */}
        <div className="mb-8">
          <ElectionCountdown electionDate={election.election_date} />
        </div>

        {/* Stats bar */}
        <div className="mb-8 flex flex-wrap gap-6 border-y border-[var(--codex-border)] py-4">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl">{totalRaces}</span>
            <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--codex-sub)]">
              Total Races
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl">{totalCandidates}</span>
            <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--codex-sub)]">
              Candidates
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl">{uniqueStates}</span>
            <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--codex-sub)]">
              States
            </span>
          </div>
          {CHAMBER_ORDER.map((chamber) => {
            const count = chamberCounts[chamber] ?? 0
            if (count === 0) return null
            return (
              <div key={chamber} className="flex items-baseline gap-2">
                <span className="font-serif text-2xl">{count}</span>
                <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--codex-sub)]">
                  {CHAMBER_LABELS[chamber as keyof typeof CHAMBER_LABELS] ?? chamber}
                </span>
              </div>
            )
          })}
          <div className="ml-auto flex items-baseline gap-2">
            <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">
              {dateStr}
            </span>
          </div>
        </div>

        {/* Key Races */}
        {keyRaces.length > 0 && !hasFilters && (
          <section className="mb-12">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              Key Races
              <span className="ml-2 text-[var(--codex-faint)]">Most competitive</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {keyRaces.map((race) => {
                const candidates = race.candidates ?? []
                const chamberLabel = CHAMBER_LABELS[race.chamber as keyof typeof CHAMBER_LABELS] ?? race.chamber

                // Party breakdown for bar
                const partyGroups: Record<string, number> = {}
                for (const c of candidates) {
                  partyGroups[c.party] = (partyGroups[c.party] || 0) + 1
                }

                return (
                  <Link
                    key={race.id}
                    href={`/elections/${race.slug}`}
                    className="group relative block overflow-hidden rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-5 no-underline transition-all hover:border-[var(--codex-input-border)]"
                  >
                    {/* Gradient accent */}
                    <div className="absolute inset-x-0 top-0 flex h-1 overflow-hidden">
                      {Object.entries(partyGroups).map(([party, count]) => (
                        <div
                          key={party}
                          style={{
                            width: `${(count / candidates.length) * 100}%`,
                            background: partyColor(party),
                            opacity: 0.6,
                          }}
                        />
                      ))}
                    </div>

                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
                        {chamberLabel}
                      </span>
                      <span className="text-[11px] text-[var(--codex-faint)]">
                        {race.state}{race.district ? ` - D${race.district}` : ''}
                      </span>
                    </div>

                    <h3 className="mb-3 font-serif text-base transition-colors group-hover:text-[var(--codex-text)]">
                      {race.name}
                    </h3>

                    {/* Candidate avatars */}
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {candidates.slice(0, 4).map((c: any) => (
                          <div
                            key={c.id}
                            className="h-7 w-7 overflow-hidden rounded-lg bg-[var(--codex-bg)]"
                            style={{ border: `2px solid ${partyColor(c.party)}44` }}
                            title={`${c.name} (${partyLabel(c.party)})`}
                          >
                            {c.image_url ? (
                              <AvatarImage
                                src={c.image_url}
                                alt={c.name}
                                size={28}
                                party={c.party}
                                fallbackColor={partyColor(c.party)}
                              />
                            ) : (
                              <div
                                className="flex h-full w-full items-center justify-center text-[9px] font-medium"
                                style={{ color: partyColor(c.party), background: `${partyColor(c.party)}12` }}
                              >
                                {c.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        {Object.keys(partyGroups).map((party) => (
                          <PartyIcon key={party} party={party} size={10} />
                        ))}
                      </div>
                    </div>

                    <div className="text-[11px] text-[var(--codex-faint)]">
                      {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Filters */}
        <Suspense>
          <ElectionFilters chamberCounts={chamberCounts} />
        </Suspense>

        {/* Result count when filtered */}
        {hasFilters && (
          <div className="mb-4 text-[11px] text-[var(--codex-faint)]">
            {raceList.length} race{raceList.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Race sections by chamber */}
        {CHAMBER_ORDER.map((chamber) => {
          const chamberRaces = grouped[chamber]
          if (!chamberRaces || chamberRaces.length === 0) return null
          const label = CHAMBER_LABELS[chamber as keyof typeof CHAMBER_LABELS] ?? chamber
          return (
            <RaceSection
              key={chamber}
              label={label}
              races={chamberRaces}
              initialLimit={20}
            />
          )
        })}

        {raceList.length === 0 && (
          <div className="py-20 text-center text-[var(--codex-faint)]">
            <div className="mb-2 font-serif text-2xl">No races found</div>
            <div className="text-sm">Try adjusting your filters</div>
          </div>
        )}

        <Footer />
      </div>
    </>
  )
}
