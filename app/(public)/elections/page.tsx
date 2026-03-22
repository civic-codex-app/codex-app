import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ElectionCountdown } from '@/components/elections/election-countdown'
import { ElectionsMap } from '@/components/elections/elections-map'

export const revalidate = 600

export const metadata = {
  title: 'Elections -- Codex',
  description: 'Track upcoming elections — Senate, House, Governor, and local races in every state.',
}

const STATE_NAMES: Record<string, string> = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'Washington D.C.',FL:'Florida',GA:'Georgia',GU:'Guam',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',PR:'Puerto Rico',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',VI:'Virgin Islands',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',MP:'Northern Mariana Islands',AS:'American Samoa'
}

export default async function ElectionsPage() {
  const supabase = createServiceRoleClient()

  // Fetch all active elections
  const { data: elections } = await supabase
    .from('elections')
    .select('id, name, slug, election_date, description, is_active')
    .eq('is_active', true)
    .order('name')

  if (!elections || elections.length === 0) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
          <div className="py-20 text-center text-[var(--codex-faint)]">
            <div className="mb-2 text-2xl font-bold">No active elections</div>
            <div className="text-sm">Check back soon for upcoming election coverage</div>
          </div>
          <Footer />
        </div>
      </>
    )
  }

  // Get race counts per election
  const electionIds = elections.map(e => e.id)
  const PAGE = 1000
  let allRaces: { election_id: string; chamber: string }[] = []
  let from = 0
  while (true) {
    const { data } = await supabase
      .from('races')
      .select('election_id, chamber')
      .in('election_id', electionIds)
      .range(from, from + PAGE - 1)
    if (!data || data.length === 0) break
    allRaces = allRaces.concat(data as any)
    if (data.length < PAGE) break
    from += PAGE
  }

  const raceCounts: Record<string, { total: number; senate: number; house: number; governor: number; local: number }> = {}
  for (const r of allRaces) {
    if (!raceCounts[r.election_id]) raceCounts[r.election_id] = { total: 0, senate: 0, house: 0, governor: 0, local: 0 }
    raceCounts[r.election_id].total++
    if (r.chamber === 'senate') raceCounts[r.election_id].senate++
    else if (r.chamber === 'house') raceCounts[r.election_id].house++
    else if (r.chamber === 'governor') raceCounts[r.election_id].governor++
    else raceCounts[r.election_id].local++
  }

  // Separate national overview from state elections
  const national = elections.find(e => e.slug === '2026-midterms')
  const stateElections = elections.filter(e => e.slug !== '2026-midterms').sort((a, b) => a.name.localeCompare(b.name))

  // Election date for countdown
  const electionDate = stateElections[0]?.election_date || national?.election_date || '2026-11-03'

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="mb-3 text-[clamp(28px,4vw,44px)] font-bold leading-[1.1]">
            2026 Elections
          </h1>
          <p className="mb-4 max-w-lg text-[15px] leading-relaxed text-[var(--codex-sub)]">
            Every race happening on November 3, 2026 — find your state to see what's on your ballot.
          </p>
          <ElectionCountdown electionDate={electionDate} />
        </div>

        {/* Quick stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-[var(--codex-border)] p-4 text-center">
            <div className="text-2xl font-bold text-[var(--codex-text)]">{allRaces.filter(r => r.chamber === 'senate').length}</div>
            <div className="text-[12px] text-[var(--codex-faint)]">Senate Races</div>
          </div>
          <div className="rounded-lg border border-[var(--codex-border)] p-4 text-center">
            <div className="text-2xl font-bold text-[var(--codex-text)]">435</div>
            <div className="text-[12px] text-[var(--codex-faint)]">House Races</div>
          </div>
          <div className="rounded-lg border border-[var(--codex-border)] p-4 text-center">
            <div className="text-2xl font-bold text-[var(--codex-text)]">{allRaces.filter(r => r.chamber === 'governor').length}</div>
            <div className="text-[12px] text-[var(--codex-faint)]">Governor Races</div>
          </div>
          <div className="rounded-lg border border-[var(--codex-border)] p-4 text-center">
            <div className="text-2xl font-bold text-[var(--codex-text)]">{stateElections.length}</div>
            <div className="text-[12px] text-[var(--codex-faint)]">States Voting</div>
          </div>
        </div>

        {/* Interactive map */}
        <div className="mb-10">
          <ElectionsMap
            stateElections={stateElections.map(el => {
              const counts = raceCounts[el.id] || { total: 0, senate: 0, house: 0, governor: 0, local: 0 }
              const stateCode = el.slug.split('-')[0]?.toUpperCase()
              return {
                slug: el.slug,
                stateCode,
                raceCount: counts.total,
                hasSenate: counts.senate > 0,
                hasGovernor: counts.governor > 0,
              }
            })}
          />
        </div>

        {/* State grid */}
        <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
          Or Browse by State
        </h2>
        <div className="mb-12 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {stateElections.map(election => {
            const counts = raceCounts[election.id] || { total: 0, senate: 0, house: 0, governor: 0, local: 0 }
            const stateCode = election.slug.split('-')[0]?.toUpperCase()
            const stateName = STATE_NAMES[stateCode] || election.name.replace(' 2026 Elections', '')

            // Build race summary chips
            const chips: string[] = []
            if (counts.senate > 0) chips.push('Senate')
            if (counts.governor > 0) chips.push('Governor')
            if (counts.house > 0) chips.push(counts.house + ' House')
            if (counts.local > 0) chips.push(counts.local + ' Local')

            return (
              <Link
                key={election.id}
                href={`/elections/${election.slug}`}
                className="group rounded-lg border border-[var(--codex-border)] p-3 no-underline transition-all hover:border-[var(--codex-text)] hover:shadow-sm"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[var(--codex-faint)]">{stateCode}</span>
                  <span className="text-[14px] font-semibold text-[var(--codex-text)] group-hover:text-[var(--codex-text)]">
                    {stateName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {chips.map(chip => (
                    <span key={chip} className="rounded bg-[var(--codex-badge-bg)] px-1.5 py-0.5 text-[10px] text-[var(--codex-faint)]">
                      {chip}
                    </span>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>

        <Footer />
      </div>
    </>
  )
}
