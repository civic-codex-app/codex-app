import { Suspense } from 'react'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { IssueIcon } from '@/components/icons/issue-icon'
import { IssueCategoryFilter } from '@/components/filters/issue-category-filter'
import Link from 'next/link'
import { stanceBucket } from '@/lib/utils/stances'
import { partyColor } from '@/lib/constants/parties'
import { IssueSortSelect } from '@/components/filters/issue-sort-select'
import type { IssueWithStancesRow } from '@/lib/types/supabase'

export const metadata = {
  title: 'Issues -- Codex',
  description: 'Explore political issues and see where politicians stand.',
}

const CATEGORY_LABELS: Record<string, string> = {
  economy: 'Economy',
  healthcare: 'Healthcare',
  immigration: 'Immigration',
  education: 'Education',
  defense: 'Defense',
  environment: 'Environment',
  justice: 'Justice',
  foreign_policy: 'Foreign Policy',
  technology: 'Technology',
  social: 'Social',
  gun_policy: 'Gun Policy',
  infrastructure: 'Infrastructure',
  housing: 'Housing',
  energy: 'Energy',
}

type SortKey = 'name' | 'most_stances' | 'most_controversial'

interface PageProps {
  searchParams: Promise<{ category?: string; sort?: string }>
}

/** Compute a controversy score: how evenly split supports vs opposes are (0-1, 1 = perfect split) */
function controversyScore(stances: Array<{ stance: string }>): number {
  const total = stances.length
  if (total === 0) return 0
  const supports = stances.filter((s) => {
    const b = stanceBucket(s.stance)
    return b === 'supports'
  }).length
  const opposes = stances.filter((s) => {
    const b = stanceBucket(s.stance)
    return b === 'opposes'
  }).length
  const relevantTotal = supports + opposes
  if (relevantTotal === 0) return 0
  const ratio = Math.min(supports, opposes) / Math.max(supports, opposes)
  // Weight by how many stances exist (more data = more meaningful)
  const dataWeight = Math.min(relevantTotal / 20, 1)
  return ratio * dataWeight
}

/** Compute party consensus: what % of a party's stances bucket into the majority bucket */
function partyConsensus(stances: Array<{ stance: string; politicians: { party: string } | null }>, party: string) {
  const partyStances = stances.filter((s) => s.politicians?.party === party)
  const total = partyStances.length
  if (total === 0) return { total: 0, supports: 0, opposes: 0, mixed: 0, consensus: 0 }
  const supports = partyStances.filter((s) => stanceBucket(s.stance) === 'supports').length
  const opposes = partyStances.filter((s) => stanceBucket(s.stance) === 'opposes').length
  const mixed = total - supports - opposes
  const maxBucket = Math.max(supports, opposes, mixed)
  return { total, supports, opposes, mixed, consensus: maxBucket / total }
}

export default async function IssuesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createServiceRoleClient()

  let query = supabase
    .from('issues')
    .select('*, politician_issues(id, stance, politicians:politician_id(party))')
    .order('name')

  if (params.category) {
    query = query.eq('category', params.category)
  }

  const { data: issues, error: issuesError } = await query
  if (issuesError) console.error('Failed to fetch issues:', issuesError.message)

  if (!issues) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-[1200px] px-6 md:px-10">
          <div className="py-20 text-center">
            <div className="mb-3 font-serif text-2xl text-[var(--codex-text)]">Something went wrong</div>
            <p className="text-sm text-[var(--codex-sub)]">
              We couldn&apos;t load political issues right now. Please try again later.
            </p>
          </div>
          <Footer />
        </div>
      </>
    )
  }

  const issuesList = issues as any as IssueWithStancesRow[]

  // Sort
  const sortKey = (params.sort as SortKey) || 'name'
  const sorted = [...issuesList].sort((a, b) => {
    if (sortKey === 'most_stances') {
      return (b.politician_issues?.length ?? 0) - (a.politician_issues?.length ?? 0)
    }
    if (sortKey === 'most_controversial') {
      return controversyScore(b.politician_issues ?? []) - controversyScore(a.politician_issues ?? [])
    }
    return a.name.localeCompare(b.name)
  })

  // Group by category
  const grouped = sorted.reduce(
    (acc: Record<string, IssueWithStancesRow[]>, issue) => {
      const cat = issue.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(issue)
      return acc
    },
    {}
  )

  // Global stats
  const totalStancesCount = issuesList.reduce((sum, i) => sum + (i.politician_issues?.length ?? 0), 0)

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <div className="mb-10 max-w-[600px]">
          <h1 className="mb-4 animate-fade-up font-serif text-[clamp(32px,4vw,52px)] font-normal leading-[1.1]">
            Political <span className="italic text-[var(--codex-subtle)]">Issues</span>
          </h1>
          <p className="animate-fade-up text-[15px] leading-[1.7] text-[var(--codex-subtle)]">
            Explore where politicians stand on the issues that matter most.
          </p>
        </div>

        {/* Stats bar */}
        <div className="mb-6 flex flex-wrap gap-6 border-y border-[var(--codex-border)] py-4">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl">{issuesList.length}</span>
            <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--codex-sub)]">Issues</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl">{totalStancesCount.toLocaleString()}</span>
            <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--codex-sub)]">Total Stances</span>
          </div>
        </div>

        {/* Category filter + Sort */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Suspense>
            <IssueCategoryFilter categories={Object.keys(CATEGORY_LABELS)} labels={CATEGORY_LABELS} />
          </Suspense>
          <Suspense>
            <IssueSortSelect currentSort={sortKey} />
          </Suspense>
        </div>

        {Object.entries(grouped).length > 0 ? (
          Object.entries(grouped).map(([category, catIssues]) => (
            <section key={category} className="mb-12">
              <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
                {CATEGORY_LABELS[category] ?? category}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {catIssues.map((issue) => {
                  const stances = issue.politician_issues ?? []
                  const total = stances.length
                  const supports = stances.filter((s) => ['strongly_supports', 'supports', 'leans_support'].includes(s.stance)).length
                  const opposes = stances.filter((s) => ['strongly_opposes', 'opposes', 'leans_oppose'].includes(s.stance)).length
                  const mixed = stances.filter((s) => ['mixed', 'neutral'].includes(s.stance)).length

                  // Party consensus
                  const demConsensus = partyConsensus(stances, 'democrat')
                  const repConsensus = partyConsensus(stances, 'republican')

                  return (
                    <Link
                      key={issue.id}
                      href={`/issues/${issue.slug}`}
                      className="group block rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-5 no-underline transition-all hover:border-[var(--codex-input-border)]"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <IssueIcon icon={issue.icon} size={18} className="text-[var(--codex-sub)]" />
                        <h3 className="font-serif text-lg transition-colors group-hover:text-[var(--codex-text)]">
                          {issue.name}
                        </h3>
                      </div>
                      {issue.description && (
                        <p className="mb-3 line-clamp-2 text-sm text-[var(--codex-sub)]">{issue.description}</p>
                      )}

                      {/* Stance breakdown bar */}
                      {total > 0 && (
                        <div className="mb-3">
                          <div className="flex h-1.5 overflow-hidden rounded-full bg-[var(--codex-border)]">
                            {supports > 0 && (
                              <div
                                className="bg-green-500/60 transition-all"
                                style={{ width: `${(supports / total) * 100}%` }}
                              />
                            )}
                            {mixed > 0 && (
                              <div
                                className="bg-yellow-500/60 transition-all"
                                style={{ width: `${(mixed / total) * 100}%` }}
                              />
                            )}
                            {opposes > 0 && (
                              <div
                                className="bg-red-500/60 transition-all"
                                style={{ width: `${(opposes / total) * 100}%` }}
                              />
                            )}
                          </div>
                          <div className="mt-1.5 flex gap-3 text-[11px] text-[var(--codex-faint)]">
                            {supports > 0 && <span className="text-green-400/70">{supports} support</span>}
                            {mixed > 0 && <span className="text-yellow-400/70">{mixed} mixed</span>}
                            {opposes > 0 && <span className="text-red-400/70">{opposes} oppose</span>}
                          </div>
                        </div>
                      )}

                      {/* Party consensus meters */}
                      {(demConsensus.total > 0 || repConsensus.total > 0) && (
                        <div className="mb-3 space-y-1.5">
                          {demConsensus.total > 0 && (
                            <PartyConsensusMeter
                              party="democrat"
                              supports={demConsensus.supports}
                              opposes={demConsensus.opposes}
                              total={demConsensus.total}
                            />
                          )}
                          {repConsensus.total > 0 && (
                            <PartyConsensusMeter
                              party="republican"
                              supports={repConsensus.supports}
                              opposes={repConsensus.opposes}
                              total={repConsensus.total}
                            />
                          )}
                        </div>
                      )}

                      <div className="text-[11px] text-[var(--codex-faint)]">
                        {total} official{total !== 1 ? 's' : ''} with stances
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))
        ) : (
          <div className="py-20 text-center text-[var(--codex-faint)]">
            <div className="mb-2 font-serif text-2xl">No issues found</div>
            <div className="text-sm">Try adjusting your filters</div>
          </div>
        )}

        <Footer />
      </div>
    </>
  )
}

/** Small inline party consensus bar */
function PartyConsensusMeter({ party, supports, opposes, total }: { party: string; supports: number; opposes: number; total: number }) {
  const color = partyColor(party)
  const label = party === 'democrat' ? 'Dem' : party === 'republican' ? 'GOP' : party.charAt(0).toUpperCase()
  const supportPct = Math.round((supports / total) * 100)
  const opposePct = Math.round((opposes / total) * 100)
  const mixedPct = 100 - supportPct - opposePct

  return (
    <div className="flex items-center gap-2">
      <span className="w-7 text-[10px] font-medium" style={{ color }}>{label}</span>
      <div className="flex h-1 flex-1 overflow-hidden rounded-full bg-[var(--codex-border)]">
        {supportPct > 0 && (
          <div className="bg-green-500/60" style={{ width: `${supportPct}%` }} />
        )}
        {mixedPct > 0 && (
          <div className="bg-yellow-500/40" style={{ width: `${mixedPct}%` }} />
        )}
        {opposePct > 0 && (
          <div className="bg-red-500/60" style={{ width: `${opposePct}%` }} />
        )}
      </div>
      <span className="w-16 text-right text-[10px] tabular-nums text-[var(--codex-faint)]">
        {supportPct > opposePct ? `${supportPct}% for` : opposePct > supportPct ? `${opposePct}% against` : 'split'}
      </span>
    </div>
  )
}

