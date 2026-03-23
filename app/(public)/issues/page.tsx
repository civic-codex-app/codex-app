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
import { ISSUE_SUBTITLES } from '@/lib/data/educational-content'

export const revalidate = 3600 // 1 hour

export const metadata = {
  title: 'Issues | Poli',
  description: 'Explore political issues and see where politicians stand.',
}

const CATEGORY_LABELS: Record<string, string> = {
  economy: 'Economy', healthcare: 'Healthcare', immigration: 'Immigration',
  education: 'Education', defense: 'Defense', environment: 'Environment',
  justice: 'Justice', foreign_policy: 'Foreign Policy', technology: 'Technology',
  social: 'Social', gun_policy: 'Gun Policy', infrastructure: 'Infrastructure',
  housing: 'Housing', energy: 'Energy',
}

type SortKey = 'name' | 'most_stances' | 'most_controversial'

interface PageProps {
  searchParams: Promise<{ category?: string; sort?: string }>
}

export default async function IssuesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createServiceRoleClient()

  // Fetch issues
  let query = supabase.from('issues').select('*').order('name')
  if (params.category) query = query.eq('category', params.category)
  const { data: issues } = await query
  if (!issues) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
          <div className="py-20 text-center">
            <div className="mb-3 text-2xl font-bold">Something went wrong</div>
          </div>
          <Footer />
        </div>
      </>
    )
  }

  // Stance types grouped by bucket
  const supportStances = new Set(['strongly_supports', 'supports', 'leans_support'])
  const opposeStances = new Set(['strongly_opposes', 'opposes', 'leans_oppose'])

  const issueIds = issues.map(i => i.id)

  // Lightweight count queries — 3 per issue, all in parallel (66 head-only queries)
  const supportArr = ['strongly_supports', 'supports', 'leans_support']
  const opposeArr = ['strongly_opposes', 'opposes', 'leans_oppose']

  type IssueAgg = { total: number; supports: number; opposes: number; mixed: number; demTotal: number; demSupports: number; demOpposes: number; gopTotal: number; gopSupports: number; gopOpposes: number }
  const issueStats = new Map<string, IssueAgg>()
  const issueTotalCounts = new Map<string, number>()

  // Run all count queries in parallel — head:true means no data transferred
  const countResults = await Promise.all(issueIds.map(async (id) => {
    const [totalR, supR, oppR] = await Promise.all([
      supabase.from('politician_issues').select('id', { count: 'exact', head: true }).eq('issue_id', id),
      supabase.from('politician_issues').select('id', { count: 'exact', head: true }).eq('issue_id', id).in('stance', supportArr),
      supabase.from('politician_issues').select('id', { count: 'exact', head: true }).eq('issue_id', id).in('stance', opposeArr),
    ])
    const total = totalR.count ?? 0
    const supports = supR.count ?? 0
    const opposes = oppR.count ?? 0
    return { id, total, supports, opposes, mixed: total - supports - opposes }
  }))

  for (const r of countResults) {
    issueStats.set(r.id, {
      ...r,
      demTotal: 0, demSupports: 0, demOpposes: 0,
      gopTotal: 0, gopSupports: 0, gopOpposes: 0,
    })
    issueTotalCounts.set(r.id, r.total)
  }

  // Sort
  const sortKey = (params.sort as SortKey) || 'name'
  const sorted = [...issues].sort((a, b) => {
    const statsA = issueStats.get(a.id)
    const statsB = issueStats.get(b.id)
    if (sortKey === 'most_stances') return (statsB?.total ?? 0) - (statsA?.total ?? 0)
    if (sortKey === 'most_controversial') {
      const scoreA = statsA ? Math.min(statsA.supports, statsA.opposes) / Math.max(statsA.supports, statsA.opposes, 1) : 0
      const scoreB = statsB ? Math.min(statsB.supports, statsB.opposes) / Math.max(statsB.supports, statsB.opposes, 1) : 0
      return scoreB - scoreA
    }
    return a.name.localeCompare(b.name)
  })

  let totalStancesCount = 0
  for (const count of issueTotalCounts.values()) totalStancesCount += count

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        <div className="mb-10 max-w-[600px]">
          <h1 className="mb-4 animate-fade-up text-[clamp(32px,4vw,52px)] font-bold leading-[1.1]">
            Political Issues
          </h1>
          <p className="animate-fade-up text-[15px] leading-[1.7] text-[var(--codex-subtle)]">
            Explore where politicians stand on the issues that matter most.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 flex flex-wrap gap-6 border-y border-[var(--codex-border)] py-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{issues.length}</span>
            <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--codex-sub)]">Issues</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{totalStancesCount.toLocaleString()}</span>
            <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--codex-sub)]">Total Stances</span>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Suspense>
            <IssueCategoryFilter categories={Object.keys(CATEGORY_LABELS)} labels={CATEGORY_LABELS} />
          </Suspense>
          <Suspense>
            <IssueSortSelect currentSort={sortKey} />
          </Suspense>
        </div>

        {/* Flat grid — no category grouping */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((issue) => {
            const stats = issueStats.get(issue.id)
            const total = stats?.total ?? 0
            const supports = stats?.supports ?? 0
            const opposes = stats?.opposes ?? 0
            const mixed = stats?.mixed ?? 0

            return (
              <Link
                key={issue.id}
                href={`/issues/${issue.slug}`}
                className="touch-feedback group block cursor-pointer rounded-lg border border-[var(--codex-border)] bg-[var(--codex-card)] p-5 no-underline transition-all duration-200 hover:border-[var(--codex-input-border)] hover:shadow-md"
              >
                <div className="mb-2 flex items-center gap-2">
                  <IssueIcon icon={issue.icon} size={18} className="text-[var(--codex-sub)]" />
                  <h3 className="text-lg font-semibold transition-colors group-hover:text-[var(--codex-text)]">
                    {issue.name}
                  </h3>
                </div>

                {ISSUE_SUBTITLES[issue.slug] && (
                  <p className="mb-1.5 text-[12px] italic text-[var(--codex-faint)]">{ISSUE_SUBTITLES[issue.slug]}</p>
                )}

                {issue.description && (
                  <p className="mb-3 line-clamp-2 text-[13px] text-[var(--codex-sub)]">{issue.description}</p>
                )}

                {/* Stance bar */}
                {total > 0 && (
                  <div className="mb-3">
                    <div className="flex h-2 overflow-hidden rounded-full bg-[var(--codex-border)]">
                      {supports > 0 && <div style={{ width: `${(supports / total) * 100}%`, background: '#2563EB' }} />}
                      {mixed > 0 && <div style={{ width: `${(mixed / total) * 100}%`, background: '#8B5CF6' }} />}
                      {opposes > 0 && <div style={{ width: `${(opposes / total) * 100}%`, background: '#DC2626' }} />}
                    </div>
                    <div className="mt-1.5 flex gap-3 text-[11px] text-[var(--codex-faint)]">
                      <span style={{ color: '#2563EB' }}>{Math.round((supports / total) * 100)}% Favor</span>
                      <span className="text-[var(--codex-faint)]">&middot;</span>
                      <span style={{ color: '#8B5CF6' }}>{Math.round((mixed / total) * 100)}% Mixed</span>
                      <span className="text-[var(--codex-faint)]">&middot;</span>
                      <span style={{ color: '#DC2626' }}>{Math.round((opposes / total) * 100)}% Oppose</span>
                    </div>
                  </div>
                )}

                {/* Party consensus */}
                {stats && (stats.demTotal > 0 || stats.gopTotal > 0) && (
                  <div className="mb-2 space-y-1">
                    {stats.demTotal > 0 && (
                      <PartyBar party="democrat" supports={stats.demSupports} opposes={stats.demOpposes} total={stats.demTotal} />
                    )}
                    {stats.gopTotal > 0 && (
                      <PartyBar party="republican" supports={stats.gopSupports} opposes={stats.gopOpposes} total={stats.gopTotal} />
                    )}
                  </div>
                )}

                <div className="text-[10px] text-[var(--codex-faint)]">
                  {(issueTotalCounts.get(issue.id) ?? total).toLocaleString()} officials with stances
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

function PartyBar({ party, supports, opposes, total }: { party: string; supports: number; opposes: number; total: number }) {
  const color = partyColor(party)
  const label = party === 'democrat' ? 'Dem' : 'GOP'
  const supportPct = Math.round((supports / total) * 100)
  const opposePct = Math.round((opposes / total) * 100)

  return (
    <div className="flex items-center gap-2">
      <span className="w-7 text-[10px] font-medium" style={{ color }}>{label}</span>
      <div className="flex h-1 flex-1 overflow-hidden rounded-full bg-[var(--codex-border)]">
        {supportPct > 0 && <div style={{ width: `${supportPct}%`, background: '#2563EB' }} />}
        {opposePct > 0 && <div style={{ width: `${opposePct}%`, background: '#DC2626', marginLeft: 'auto' }} />}
      </div>
      <span className="w-14 text-right text-[10px] tabular-nums text-[var(--codex-faint)]">
        {supportPct > opposePct ? `${supportPct}% for` : `${opposePct}% against`}
      </span>
    </div>
  )
}
