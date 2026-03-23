import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AvatarImage } from '@/components/ui/avatar-image'
import { PartyIcon } from '@/components/icons/party-icons'
import { partyColor } from '@/lib/constants/parties'
import { CHAMBER_LABELS } from '@/lib/constants/chambers'
import { US_STATES, STATE_NAMES } from '@/lib/constants/us-states'
import { StatePoliticianList } from '@/components/states/state-politician-list'

export const revalidate = 1800

interface PageProps {
  params: Promise<{ state: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state } = await params
  const abbr = state.toUpperCase()
  const name = STATE_NAMES[abbr]
  if (!name) return { title: 'Not Found | Poli' }

  return {
    title: `${name} | Poli`,
    description: `Elected officials, campaign finance, and upcoming races in ${name}.`,
    openGraph: {
      title: `${name} | Poli`,
      description: `Elected officials, campaign finance, and upcoming races in ${name}.`,
    },
  }
}

interface Politician {
  id: string
  name: string
  slug: string
  state: string
  chamber: string
  party: string
  title: string | null
  image_url: string | null
}

interface Race {
  id: string
  name: string
  slug: string
  state: string
  chamber: string
  district: string | null
  candidates: Array<{ id: string; name: string; party: string }>
  elections: { id: string; name: string; slug: string; election_date: string; is_active: boolean } | null
}

interface FinanceRecord {
  politician_id: string
  total_raised: number
  total_spent: number
  politician: { id: string; name: string; slug: string; party: string; image_url: string | null } | null
}

export default async function StateDetailPage({ params }: PageProps) {
  const { state } = await params
  const abbr = state.toUpperCase()

  if (!(US_STATES as readonly string[]).includes(abbr)) {
    notFound()
  }

  const stateName = STATE_NAMES[abbr]!
  const supabase = createServiceRoleClient()

  // Fetch in parallel: politicians, races, campaign finance
  const [politiciansResult, racesResult, financeResult] = await Promise.all([
    // Politicians for this state
    (async () => {
      const all: Politician[] = []
      let from = 0
      while (true) {
        const { data } = await supabase
          .from('politicians')
          .select('id, name, slug, state, chamber, party, title, image_url')
          .eq('state', abbr)
          .order('chamber')
          .order('name')
          .range(from, from + 499)
        if (!data || data.length === 0) break
        all.push(...(data as Politician[]))
        if (data.length < 500) break
        from += 500
      }
      return all
    })(),

    // Races in this state (active elections)
    (async () => {
      const all: Race[] = []
      let from = 0
      while (true) {
        const { data } = await supabase
          .from('races')
          .select('id, name, slug, state, chamber, district, candidates(id, name, party), elections!inner(id, name, slug, election_date, is_active)')
          .eq('state', abbr)
          .eq('elections.is_active', true)
          .order('name')
          .range(from, from + 499)
        if (!data || data.length === 0) break
        all.push(...(data as unknown as Race[]))
        if (data.length < 500) break
        from += 500
      }
      // Only return races that have at least one candidate
      return all.filter(r => (r.candidates ?? []).length > 0)
    })(),

    // Campaign finance for state politicians
    (async () => {
      // First get politician IDs for this state
      const { data: pols } = await supabase
        .from('politicians')
        .select('id')
        .eq('state', abbr)

      if (!pols || pols.length === 0) return []

      const polIds = pols.map((p) => p.id)
      const all: FinanceRecord[] = []
      let from = 0
      while (true) {
        const { data } = await supabase
          .from('campaign_finance')
          .select('politician_id, total_raised, total_spent, politician:politician_id(id, name, slug, party, image_url)')
          .in('politician_id', polIds)
          .order('total_raised', { ascending: false })
          .range(from, from + 499)
        if (!data || data.length === 0) break
        all.push(...(data as unknown as FinanceRecord[]))
        if (data.length < 500) break
        from += 500
      }
      return all
    })(),
  ])

  const politicians = politiciansResult
  const races = racesResult
  const finance = financeResult

  // Group politicians by chamber
  const chamberOrder = ['senate', 'governor', 'house', 'state_senate', 'state_house', 'mayor', 'city_council', 'county', 'school_board', 'other_local']
  const chamberGroups: Record<string, Politician[]> = {}
  for (const pol of politicians) {
    const ch = pol.chamber ?? 'other_local'
    if (!chamberGroups[ch]) chamberGroups[ch] = []
    chamberGroups[ch].push(pol)
  }

  // Finance totals
  const totalRaised = finance.reduce((sum, f) => sum + (f.total_raised ?? 0), 0)
  const totalSpent = finance.reduce((sum, f) => sum + (f.total_spent ?? 0), 0)
  const topFundraisers = finance
    .filter((f) => f.politician)
    .sort((a, b) => (b.total_raised ?? 0) - (a.total_raised ?? 0))
    .slice(0, 5)
  const maxRaised = topFundraisers[0]?.total_raised ?? 1

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: stateName,
    address: {
      '@type': 'PostalAddress',
      addressRegion: abbr,
      addressCountry: 'US',
    },
    url: `https://getpoli.app/states/${state}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 pt-6 pb-16 md:px-10">
        {/* Back link */}
        <Link
          href="/states"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--codex-sub)] transition-colors hover:text-[var(--codex-text)]"
        >
          &larr; All states
        </Link>

        {/* Hero */}
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-3">
            <span className="rounded-md bg-[var(--codex-badge-bg)] px-2.5 py-1 text-sm font-semibold text-[var(--codex-badge-text)]">
              {abbr}
            </span>
          </div>
          <h1 className="mb-2 font-serif text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
            {stateName}
          </h1>
          <p className="text-[15px] text-[var(--codex-sub)]">
            {politicians.length} elected official{politicians.length !== 1 ? 's' : ''} tracked
            {races.length > 0 && <> &middot; {races.length} upcoming race{races.length !== 1 ? 's' : ''}</>}
          </p>
        </div>

        {/* Your Representatives */}
        {politicians.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              Your Representatives
            </h2>

            {chamberOrder.map((chamber) => {
              const group = chamberGroups[chamber]
              if (!group || group.length === 0) return null
              const label = CHAMBER_LABELS[chamber as keyof typeof CHAMBER_LABELS] ?? chamber

              return (
                <div key={chamber} className="mb-6">
                  <h3 className="mb-3 text-[13px] font-semibold text-[var(--codex-text)]">
                    {label}
                    <span className="ml-2 text-[var(--codex-faint)]">{group.length}</span>
                  </h3>
                  <StatePoliticianList politicians={group} initialCount={6} />
                </div>
              )
            })}
          </section>
        )}

        {/* Campaign Finance */}
        {finance.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              Campaign Finance
            </h2>

            <div className="mb-6 flex gap-6">
              <div>
                <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--codex-faint)]">Total Raised</div>
                <div className="text-[20px] font-bold text-[var(--codex-text)]">
                  {formatCurrency(totalRaised)}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--codex-faint)]">Total Spent</div>
                <div className="text-[20px] font-bold text-[var(--codex-text)]">
                  {formatCurrency(totalSpent)}
                </div>
              </div>
            </div>

            {topFundraisers.length > 0 && (
              <div className="space-y-3">
                <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--codex-faint)]">Top Fundraisers</div>
                {topFundraisers.map((f) => {
                  const pol = f.politician!
                  const pct = maxRaised > 0 ? (f.total_raised / maxRaised) * 100 : 0
                  const color = partyColor(pol.party)
                  return (
                    <Link
                      key={f.politician_id}
                      href={`/politicians/${pol.slug}`}
                      className="flex items-center gap-3 no-underline"
                    >
                      <div
                        className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-[var(--codex-card)]"
                        style={{ border: `2px solid ${color}44` }}
                      >
                        <AvatarImage
                          src={pol.image_url}
                          alt={pol.name}
                          size={32}
                          party={pol.party}
                          fallbackColor={color}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="truncate text-[13px] font-medium text-[var(--codex-text)] transition-colors hover:text-[var(--codex-text)]">
                            {pol.name}
                          </span>
                          <span className="flex-shrink-0 text-[12px] tabular-nums text-[var(--codex-sub)]">
                            {formatCurrency(f.total_raised)}
                          </span>
                        </div>
                        <div className="h-[4px] w-full overflow-hidden rounded-full bg-[var(--codex-border)]">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: color, opacity: 0.6 }}
                          />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* Upcoming Races */}
        {races.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              Upcoming Races
            </h2>
            <div className="space-y-2">
              {races.map((race) => {
                const candidates = race.candidates ?? []
                const election = race.elections
                const electionSlug = election?.slug

                return (
                  <Link
                    key={race.id}
                    href={`/elections/${race.slug}`}
                    className="flex items-center justify-between rounded-lg border border-[var(--codex-border)] p-4 no-underline transition-all hover:border-[var(--codex-text)] hover:shadow-sm"
                  >
                    <div>
                      <div className="text-[14px] font-medium text-[var(--codex-text)]">
                        {race.name}
                      </div>
                      {candidates.length > 0 && (
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--codex-faint)]">
                          {candidates.slice(0, 3).map((c) => (
                            <span key={c.id} className="flex items-center gap-1">
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: partyColor(c.party) }}
                              />
                              {c.name}
                            </span>
                          ))}
                          {candidates.length > 3 && (
                            <span className="text-[var(--codex-faint)]">+{candidates.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">
                        {CHAMBER_LABELS[race.chamber as keyof typeof CHAMBER_LABELS] ?? race.chamber}
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--codex-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* All Officials grid */}
        {politicians.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              All Officials
              <span className="ml-2 text-[var(--codex-faint)]">{politicians.length}</span>
            </h2>
            <StatePoliticianList politicians={politicians} initialCount={6} size="compact" />
          </section>
        )}

        <Footer />
      </div>
    </>
  )
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`
  }
  return `$${amount.toLocaleString()}`
}
