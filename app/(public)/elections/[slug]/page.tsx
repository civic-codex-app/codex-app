import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { AppShell } from '@/components/app/surface'
import { partyColor } from '@/lib/constants/parties'
import { RaceComparison } from '@/components/elections/race-comparison'
import { RaceView, type RaceCandidate, type RaceFinance } from '@/components/elections/race-view'
import { ElectionCountdown } from '@/components/elections/election-countdown'
import type {
  RaceDetailRow,
  CandidateRow,
  ElectionJoin,
  ElectionStanceRow,
} from '@/lib/types/supabase'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceRoleClient()

  // Check if it's a state election first
  const { data: election } = await supabase.from('elections').select('name, description, election_date').eq('slug', slug).single()
  if (election) {
    const description = election.description?.slice(0, 160) || `Track races, candidates, and results for ${election.name}`
    const ogUrl = `/api/og?title=${encodeURIComponent(election.name)}&subtitle=${encodeURIComponent('Election Races')}&type=election`
    return {
      title: `${election.name} | Poli`,
      description,
      alternates: { canonical: `https://getpoli.app/elections/${slug}` },
      openGraph: {
        title: election.name,
        description,
        url: `https://getpoli.app/elections/${slug}`,
        images: [{ url: ogUrl, width: 1200, height: 630 }],
      },
      twitter: { card: 'summary_large_image', title: election.name, images: [ogUrl] },
    }
  }

  // Otherwise it's a race slug
  const { data } = await supabase.from('races').select('name, state, chamber').eq('slug', slug).single()
  if (!data) return { title: 'Not Found | Poli' }

  const description = `Candidates, stances, and polls for ${data.name} in ${data.state}`
  const ogUrl = `/api/og?title=${encodeURIComponent(data.name)}&subtitle=${encodeURIComponent(data.state)}&type=election`
  return {
    title: `${data.name} | Poli Elections`,
    description,
    alternates: { canonical: `https://getpoli.app/elections/${slug}` },
    openGraph: {
      title: data.name,
      description,
      url: `https://getpoli.app/elections/${slug}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: data.name, images: [ogUrl] },
  }
}

export default async function RaceDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createServiceRoleClient()

  // First check if this is a state election slug (e.g., tx-2026-elections)
  const { data: stateElection } = await supabase
    .from('elections')
    .select('id, name, slug, election_date, description')
    .eq('slug', slug)
    .single()

  if (stateElection) {
    return renderStateElection(supabase, stateElection)
  }

  // Otherwise treat as individual race slug
  const { data: raceData, error: raceError } = await supabase
    .from('races')
    .select(`
      *,
      elections (id, name, slug, election_date),
      incumbent:incumbent_id (id, name, slug, party, image_url, state, title)
    `)
    .eq('slug', slug)
    .single()
  if (raceError) console.error('Failed to fetch race:', raceError.message)

  if (!raceData) notFound()

  const race = raceData as any as RaceDetailRow

  const { data: candidates, error: candidatesError } = await supabase
    .from('candidates')
    .select(`
      *,
      politician:politician_id (id, name, slug, image_url, state, title, bio, party, chamber)
    `)
    .eq('race_id', race.id)
    .order('is_incumbent', { ascending: false })
    .order('name')
  if (candidatesError) console.error('Failed to fetch candidates:', candidatesError.message)

  const candidateList = (candidates ?? []) as any as CandidateRow[]
  const election = race.elections as ElectionJoin | null

  // Fetch stances for candidates that have politician profiles
  const polIds = candidateList
    .map((c) => c.politician?.id)
    .filter(Boolean) as string[]

  const stancesByPol = new Map<string, ElectionStanceRow[]>()
  if (polIds.length > 0) {
    const { data: stances, error: stancesError } = await supabase
      .from('politician_issues')
      .select('politician_id, stance, issue_id, issues:issue_id(id, name, slug, icon)')
      .in('politician_id', polIds)
    if (stancesError) console.error('Failed to fetch candidate stances:', stancesError.message)

    for (const s of (stances ?? []) as any as ElectionStanceRow[]) {
      if (!stancesByPol.has(s.politician_id)) stancesByPol.set(s.politician_id, [])
      stancesByPol.get(s.politician_id)!.push(s)
    }
  }

  // Money for the head-to-head: only politicians whose current office is the
  // office on the ballot, only this election's cycle. See RaceView for why.
  const electionYear = election?.election_date?.slice(0, 4) ?? null
  const sameOfficeIds = candidateList
    .filter((c) => c.politician && (c.politician as any).chamber === race.chamber)
    .map((c) => c.politician!.id)
  const finance: Record<string, RaceFinance> = {}
  if (electionYear && sameOfficeIds.length > 0) {
    const { data: rows } = await supabase
      .from('campaign_finance')
      .select('politician_id, cycle, total_raised, cash_on_hand, source')
      .in('politician_id', sameOfficeIds)
      .eq('cycle', electionYear)
    for (const r of (rows ?? []) as Array<{ politician_id: string; cycle: string; total_raised: number | null; cash_on_hand: number | null; source: string | null }>) {
      finance[r.politician_id] = { cycle: r.cycle, total_raised: r.total_raised, cash_on_hand: r.cash_on_hand, source: r.source }
    }
  }

  // Side-by-side issue comparison for linked candidates with stances
  const stancesByCandidate = new Map<string, Array<{ stance: string; issues: { slug: string; name: string; icon?: string } }>>()
  for (const c of candidateList) {
    if (c.politician?.id) {
      const polStances = stancesByPol.get(c.politician.id) ?? []
      if (polStances.length) {
        stancesByCandidate.set(c.id, polStances.map((s: any) => ({
          stance: s.stance,
          issues: s.issues ?? { slug: '', name: '' },
        })))
      }
    }
  }
  const compCandidates = candidateList
    .filter((c) => c.status === 'running' && stancesByCandidate.has(c.id))
    .map((c) => ({
      id: c.id,
      name: c.name,
      party: c.party,
      politician: c.politician ? { id: c.politician.id, slug: c.politician.slug } : null,
    }))
  const comparison = compCandidates.length >= 2
    ? <RaceComparison candidates={compCandidates} stancesByCandidate={stancesByCandidate} />
    : null

  // JSON-LD structured data for individual race
  const raceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: race.name,
    startDate: election?.election_date,
    description: race.description,
    url: `https://getpoli.app/elections/${slug}`,
  }

  const incumbent = race.incumbent
    ? {
        id: (race.incumbent as any).id as string,
        name: race.incumbent.name,
        slug: race.incumbent.slug,
        party: (race.incumbent as any).party as string,
        image_url: race.incumbent.image_url,
      }
    : null

  const viewCandidates: RaceCandidate[] = candidateList.map((c) => ({
    id: c.id,
    name: c.name,
    party: c.party,
    status: c.status,
    is_incumbent: !!c.is_incumbent,
    image_url: c.image_url,
    politician: c.politician
      ? { id: c.politician.id, slug: c.politician.slug, image_url: c.politician.image_url, chamber: (c.politician as any).chamber }
      : null,
  }))

  return (
    <AppShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(raceJsonLd) }}
      />
      <div className="mx-auto max-w-[560px] px-4 pt-3">
        <Link
          href="/ballot"
          className="mb-2 inline-flex h-11 items-center gap-1 text-[14px] font-semibold text-[var(--poli-sub)] no-underline"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          Your ballot
        </Link>
        <RaceView
          race={{ name: race.name, slug: race.slug, state: race.state, chamber: race.chamber, district: race.district ?? null, description: race.description ?? null }}
          electionDate={election?.election_date ?? null}
          incumbent={incumbent}
          candidates={viewCandidates}
          finance={finance}
          comparison={comparison}
          unverified={candidateList.length > 0 && candidateList.every((c) => !c.is_verified)}
        />
      </div>
    </AppShell>
  )
}

/* ── State Election View ──────────────────────────────────────────── */

const CHAMBER_ORDER_STATE = ['senate', 'house', 'governor', 'state_senate', 'state_house', 'mayor', 'city_council', 'county', 'school_board', 'other_local']
const CHAMBER_DISPLAY: Record<string, string> = {
  senate: 'U.S. Senate',
  house: 'U.S. House',
  governor: 'Governor',
  state_senate: 'State Senate',
  state_house: 'State House',
  mayor: 'Mayor',
  city_council: 'City Council',
  county: 'County',
  school_board: 'School Board',
  other_local: 'Other',
}

async function renderStateElection(
  supabase: ReturnType<typeof createServiceRoleClient>,
  election: { id: string; name: string; slug: string; election_date: string; description: string | null }
) {
  // Fetch all races for this election, paginated
  let allRaces: any[] = []
  let from = 0
  while (true) {
    const { data } = await supabase
      .from('races')
      .select('id, name, slug, chamber, district, description, candidates(id, name, party, is_incumbent, image_url, politician_id)')
      .eq('election_id', election.id)
      .order('chamber')
      .order('name')
      .range(from, from + 499)
    if (!data || data.length === 0) break
    allRaces = allRaces.concat(data)
    if (data.length < 500) break
    from += 500
  }

  // Group by chamber, excluding races with no candidates
  const grouped: Record<string, typeof allRaces> = {}
  for (const race of allRaces) {
    if ((race.candidates ?? []).length === 0) continue
    if (!grouped[race.chamber]) grouped[race.chamber] = []
    grouped[race.chamber].push(race)
  }

  const racesWithCandidates = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0)

  const electionDate = new Date(election.election_date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  // JSON-LD structured data for state election
  const electionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: election.name,
    startDate: election.election_date,
    description: election.description,
    url: `https://getpoli.app/elections/${election.slug}`,
  }

  return (
    <AppShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(electionJsonLd) }}
      />
      <div className="mx-auto max-w-[560px] px-4 pt-3">
        <Link
          href="/elections"
          className="mb-2 inline-flex h-11 items-center gap-1 text-[14px] font-semibold text-[var(--poli-sub)] no-underline"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          All states
        </Link>

        <h1 className="font-serif text-[40px] font-normal leading-[1.08] text-[var(--poli-text)]">
          {election.name}
        </h1>
        <p className="mb-4 mt-1 text-[14px] text-[var(--poli-sub)]">
          {electionDate} · {racesWithCandidates} race{racesWithCandidates !== 1 ? 's' : ''}
        </p>

        <div className="mb-6">
          <ElectionCountdown electionDate={election.election_date} />
        </div>

        {/* Race groups */}
        {racesWithCandidates > 0 ? (
          CHAMBER_ORDER_STATE.map(chamber => {
            const races = grouped[chamber]
            if (!races || races.length === 0) return null
            const label = CHAMBER_DISPLAY[chamber] || chamber

            return (
              <section key={chamber} className="mb-6">
                <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--poli-sub)]">
                  {label} · {races.length} race{races.length !== 1 ? 's' : ''}
                </h2>
                <div className="rounded-2xl border border-[var(--poli-border)] bg-[var(--poli-card)] px-4">
                  {races.map((race: any, i: number) => {
                    const candidates = race.candidates ?? []
                    return (
                      <Link
                        key={race.id}
                        href={`/elections/${race.slug}`}
                        className={`flex min-h-[60px] items-center justify-between gap-3 no-underline ${i < races.length - 1 ? 'border-b border-[var(--poli-border)]' : ''}`}
                      >
                        <div className="min-w-0">
                          <div className="text-[15px] font-semibold text-[var(--poli-text)]">
                            {race.name}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px] text-[var(--poli-sub)]">
                            {candidates.slice(0, 3).map((c: any) => (
                              <span key={c.id} className="flex items-center gap-1">
                                <span
                                  className="inline-block h-2 w-2 rounded-full"
                                  style={{ backgroundColor: partyColor(c.party) }}
                                />
                                {c.name}
                              </span>
                            ))}
                            {candidates.length > 3 && (
                              <span>+{candidates.length - 3} more</span>
                            )}
                          </div>
                        </div>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--poli-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })
        ) : (
          <div className="py-12 text-center text-[var(--poli-faint)]">
            <div className="mb-2 text-lg font-semibold">No upcoming races</div>
            <div className="text-sm">Candidate announcements for this election haven&apos;t been added yet</div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
