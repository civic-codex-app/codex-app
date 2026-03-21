import { Suspense } from 'react'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ElectionFilters } from '@/components/elections/election-filters'
import { RaceSection } from '@/components/elections/race-section'
import { CHAMBER_LABELS } from '@/lib/constants/chambers'

export const metadata = {
  title: 'Elections — Codex',
  description: 'Track upcoming elections — Senate, House, Governor, and local races across the country.',
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

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        {/* Hero */}
        <div className="mb-10 max-w-[600px]">
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

        {/* Stats bar */}
        <div className="mb-8 flex flex-wrap gap-6 border-y border-[var(--codex-border)] py-4">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl">{totalRaces}</span>
            <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--codex-sub)]">
              Total Races
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
