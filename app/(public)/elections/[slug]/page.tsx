import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PartyIcon } from '@/components/icons/party-icons'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { CHAMBER_LABELS } from '@/lib/constants/chambers'
import { computeAlignment, alignmentMeta } from '@/lib/utils/alignment'
import { RaceComparison } from '@/components/elections/race-comparison'

export const dynamic = 'force-dynamic'
import { ElectionCountdown } from '@/components/elections/election-countdown'
import type {
  RaceDetailRow,
  CandidateRow,
  ElectionJoin,
  ElectionStanceRow,
} from '@/lib/types/supabase'
import { CHAMBER_EXPLAINERS } from '@/lib/data/educational-content'

interface PageProps {
  params: Promise<{ slug: string }>
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  running: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Running' },
  withdrawn: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Withdrawn' },
  won: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Won' },
  lost: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Lost' },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceRoleClient()

  // Check if it's a state election first
  const { data: election } = await supabase.from('elections').select('name').eq('slug', slug).single()
  if (election) {
    return { title: `${election.name} | Poli` }
  }

  // Otherwise it's a race slug
  const { data } = await supabase.from('races').select('name, state').eq('slug', slug).single()
  if (!data) return { title: 'Not Found | Poli' }

  return {
    title: `${data.name} | Poli Elections`,
    openGraph: { title: data.name, description: `${data.name} - ${data.state}` },
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
  const chamberLabel = CHAMBER_LABELS[race.chamber as keyof typeof CHAMBER_LABELS] ?? race.chamber

  // Fetch stances for candidates that have politician profiles
  const polIds = candidateList
    .map((c) => c.politician?.id)
    .filter(Boolean) as string[]

  let stancesByPol = new Map<string, ElectionStanceRow[]>()
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

  const electionDate = election?.election_date
    ? new Date(election.election_date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  // Party breakdown
  const partyGroups: Record<string, number> = {}
  for (const c of candidateList) {
    partyGroups[c.party] = (partyGroups[c.party] || 0) + 1
  }

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[900px] px-6 pt-6 md:px-10">
        <Link
          href="/elections"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--codex-sub)] transition-colors hover:text-[var(--codex-text)]"
        >
          &larr; Back to elections
        </Link>

        {/* Badges */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
            {chamberLabel}
          </span>
          <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
            {race.state}
            {race.district ? ` - District ${race.district}` : ''}
          </span>
          {electionDate && (
            <span className="text-[11px] text-[var(--codex-faint)]">{electionDate}</span>
          )}
        </div>

        <h1 className="mb-3 text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
          {race.name}
        </h1>

        {CHAMBER_EXPLAINERS[race.chamber] && (
          <p className="mb-4 text-[12px] leading-[1.5] text-[var(--codex-faint)]">
            {CHAMBER_EXPLAINERS[race.chamber]}
          </p>
        )}

        {election?.election_date && (
          <div className="mb-4">
            <ElectionCountdown electionDate={election.election_date} />
          </div>
        )}

        {race.description && (
          <p className="mb-6 text-[15px] leading-[1.7] text-[var(--codex-sub)]">
            {race.description}
          </p>
        )}

        {/* Party breakdown bar */}
        {candidateList.length > 1 && (
          <div className="mb-8 rounded-md border border-[var(--codex-border)] p-4">
            <div className="mb-2 text-[10px] uppercase tracking-[0.1em] text-[var(--codex-faint)]">
              Party Breakdown
            </div>
            <div className="mb-2 flex h-3 overflow-hidden rounded-full">
              {Object.entries(partyGroups).map(([party, count]) => (
                <div
                  key={party}
                  className="transition-all"
                  style={{
                    width: `${(count / candidateList.length) * 100}%`,
                    background: partyColor(party),
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
            <div className="flex gap-4">
              {Object.entries(partyGroups).map(([party, count]) => (
                <div key={party} className="flex items-center gap-1.5">
                  <PartyIcon party={party} size={10} />
                  <span className="text-[11px]" style={{ color: partyColor(party) }}>
                    {count} {partyLabel(party)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Side-by-side issue comparison */}
        {candidateList.length >= 2 && (() => {
          // Build stances by candidate ID (using politician stances for linked candidates)
          const stancesByCandidate = new Map<string, Array<{ stance: string; issues: { slug: string; name: string; icon?: string } }>>()
          for (const c of candidateList) {
            if (c.politician?.id) {
              const polStances = stancesByPol.get(c.politician.id) ?? []
              stancesByCandidate.set(c.id, polStances.map((s: any) => ({
                stance: s.stance,
                issues: s.issues ?? { slug: '', name: '' },
              })))
            }
          }
          const compCandidates = candidateList
            .filter((c) => stancesByCandidate.has(c.id) && (stancesByCandidate.get(c.id)?.length ?? 0) > 0)
            .map((c) => ({
              id: c.id,
              name: c.name,
              party: c.party,
              politician: c.politician ? { id: c.politician.id, slug: c.politician.slug } : null,
            }))
          return compCandidates.length >= 2 ? (
            <RaceComparison candidates={compCandidates} stancesByCandidate={stancesByCandidate} />
          ) : null
        })()}

        {/* Candidates */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
            Candidates
            <span className="text-[var(--codex-faint)]">{candidateList.length}</span>
          </h2>

          {candidateList.length > 0 ? (
            <div className="space-y-4">
              {candidateList.map((candidate) => {
                const pol = candidate.politician
                const status = STATUS_CONFIG[candidate.status] ?? STATUS_CONFIG.running
                const color = partyColor(candidate.party)
                const polStances = pol ? (stancesByPol.get(pol.id) ?? []) : []
                const alignment = pol && polStances.length > 0
                  ? computeAlignment(candidate.party, polStances)
                  : -1
                const meta = alignment >= 0 ? alignmentMeta(alignment) : null

                const supports = polStances.filter((s) => ['strongly_supports', 'supports', 'leans_support'].includes(s.stance)).length
                const opposes = polStances.filter((s) => ['strongly_opposes', 'opposes', 'leans_oppose'].includes(s.stance)).length
                const mixed = polStances.filter((s) => ['mixed', 'neutral'].includes(s.stance)).length
                const totalStances = supports + opposes + mixed

                return (
                  <div
                    key={candidate.id}
                    className="overflow-hidden rounded-md border border-[var(--codex-border)]"
                  >
                    {/* Color accent */}
                    <div className="h-1" style={{ background: `${color}55` }} />

                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div
                          className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--codex-card)]"
                          style={{ border: `2px solid ${color}44` }}
                        >
                          <AvatarImage
                            src={candidate.image_url || pol?.image_url || null}
                            alt={candidate.name}
                            size={64}
                            party={candidate.party}
                            fallbackColor={color}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            {pol ? (
                              <Link
                                href={`/politicians/${pol.slug}`}
                                className="text-lg font-semibold transition-colors hover:text-[var(--codex-text)]"
                              >
                                {candidate.name}
                              </Link>
                            ) : (
                              <Link
                                href={`/candidates/${candidate.id}`}
                                className="text-lg font-semibold transition-colors hover:text-[var(--codex-text)]"
                              >
                                {candidate.name}
                              </Link>
                            )}
                            <PartyIcon party={candidate.party} size={14} />
                            <span
                              className="text-[10px] font-medium uppercase"
                              style={{ color }}
                            >
                              {partyLabel(candidate.party)}
                            </span>
                            {candidate.is_incumbent && (
                              <span className="rounded-sm bg-[var(--codex-badge-bg)] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.06em] text-[var(--codex-badge-text)]">
                                Incumbent
                              </span>
                            )}
                            <span
                              className={`rounded-sm px-1.5 py-0.5 text-[9px] uppercase tracking-[0.06em] ${status.bg} ${status.text}`}
                            >
                              {status.label}
                            </span>
                          </div>

                          {pol?.title && (
                            <div className="mb-2 text-[12px] text-[var(--codex-faint)]">
                              {pol.title} &middot; {pol.state}
                            </div>
                          )}

                          {(candidate.bio || pol?.bio) && (
                            <p className="mb-3 line-clamp-2 text-[12px] leading-[1.6] text-[var(--codex-sub)]">
                              {candidate.bio || pol?.bio}
                            </p>
                          )}

                          {/* Stance bar + alignment for linked politicians */}
                          {totalStances > 0 && (
                            <div className="mb-2 flex items-center gap-3">
                              <div className="flex h-[5px] w-24 overflow-hidden rounded-full bg-[var(--codex-border)]">
                                {supports > 0 && (
                                  <div style={{ width: `${(supports / totalStances) * 100}%`, background: '#3B82F6', opacity: 0.7 }} />
                                )}
                                {mixed > 0 && (
                                  <div style={{ width: `${(mixed / totalStances) * 100}%`, background: '#A855F7', opacity: 0.7 }} />
                                )}
                                {opposes > 0 && (
                                  <div style={{ width: `${(opposes / totalStances) * 100}%`, background: '#EF4444', opacity: 0.7 }} />
                                )}
                              </div>
                              <span className="text-[10px] tabular-nums text-[var(--codex-faint)]">
                                {totalStances} issues
                              </span>
                              {alignment >= 0 && meta && (
                                <>
                                  <span className="text-[var(--codex-border)]">&middot;</span>
                                  <span
                                    className="rounded-sm px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em]"
                                    style={{ color: meta.color, background: meta.bgColor }}
                                  >
                                    {alignment}% aligned
                                  </span>
                                </>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            {pol ? (
                              <Link
                                href={`/politicians/${pol.slug}`}
                                className="text-[11px] text-[var(--codex-faint)] transition-colors hover:text-[var(--codex-text)]"
                              >
                                View full profile &rarr;
                              </Link>
                            ) : (
                              <Link
                                href={`/candidates/${candidate.id}`}
                                className="text-[11px] text-[var(--codex-faint)] transition-colors hover:text-[var(--codex-text)]"
                              >
                                View profile &rarr;
                              </Link>
                            )}
                            {candidate.website_url && (
                              <a
                                href={candidate.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-[var(--codex-faint)] transition-colors hover:text-[var(--codex-text)]"
                              >
                                Campaign website &rarr;
                              </a>
                            )}
                            {pol && candidateList.length > 1 && (
                              <Link
                                href={`/compare?a=${pol.slug}&b=${candidateList.find((c) => c.politician?.slug && c.politician.slug !== pol.slug)?.politician?.slug ?? ''}`}
                                className="text-[11px] text-[var(--codex-faint)] transition-colors hover:text-[var(--codex-text)]"
                              >
                                Compare &rarr;
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-[var(--codex-faint)]">
              <div className="mb-2 text-lg font-semibold">No candidates announced yet</div>
              <div className="text-sm">Check back as the race develops</div>
            </div>
          )}
        </section>

        <Footer />
      </div>
    </>
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

  // Group by chamber
  const grouped: Record<string, typeof allRaces> = {}
  for (const race of allRaces) {
    if (!grouped[race.chamber]) grouped[race.chamber] = []
    grouped[race.chamber].push(race)
  }

  const stateCode = election.slug.split('-')[0]?.toUpperCase()
  const electionDate = new Date(election.election_date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1000px] px-6 pt-6 md:px-10">
        <Link
          href="/elections"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--codex-sub)] transition-colors hover:text-[var(--codex-text)]"
        >
          &larr; All states
        </Link>

        <h1 className="mb-2 text-[clamp(26px,4vw,40px)] font-bold leading-[1.1]">
          {election.name}
        </h1>
        <p className="mb-4 text-[14px] text-[var(--codex-sub)]">
          {electionDate} · {allRaces.length} race{allRaces.length !== 1 ? 's' : ''}
        </p>

        <div className="mb-8">
          <ElectionCountdown electionDate={election.election_date} />
        </div>

        {/* Race groups */}
        {CHAMBER_ORDER_STATE.map(chamber => {
          const races = grouped[chamber]
          if (!races || races.length === 0) return null
          const label = CHAMBER_DISPLAY[chamber] || chamber

          return (
            <section key={chamber} className="mb-10">
              <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
                {label} · {races.length} race{races.length !== 1 ? 's' : ''}
              </h2>
              <div className="space-y-2">
                {races.map((race: any) => {
                  const candidates = race.candidates ?? []
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
                          <div className="mt-1 flex items-center gap-2 text-[12px] text-[var(--codex-faint)]">
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
                              <span className="text-[var(--codex-faint)]">+{candidates.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {candidates.length > 0 && (
                          <span className="rounded bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[10px] text-[var(--codex-faint)]">
                            {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--codex-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}

        <Footer />
      </div>
    </>
  )
}
