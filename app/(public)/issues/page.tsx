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

export const revalidate = 600 // 10 minutes

export const metadata = {
  title: 'Issues -- Poli',
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
  const supportStances = ['strongly_supports', 'supports', 'leans_support']
  const opposeStances = ['strongly_opposes', 'opposes', 'leans_oppose']

  const issueIds = issues.map(i => i.id)

  // Fast parallel count queries per issue (instead of fetching 100K+ rows)
  async function fetchIssueStats(issueId: string) {
    const [totalR, supR, oppR, demTotalR, demSupR, demOppR, gopTotalR, gopSupR, gopOppR] = await Promise.all([
      supabase.from('politician_issues').select('id', { count: 'exact', head: true }).eq('issue_id', issueId),
      supabase.from('politician_issues').select('id', { count: 'exact', head: true }).eq('issue_id', issueId).in('stance', supportStances),
      supabase.from('politician_issues').select('id', { count: 'exact', head: true }).eq('issue_id', issueId).in('stance', opposeStances),
      supabase.from('politician_issues').select('id, politicians:politician_id!inner(id)', { count: 'exact', head: true }).eq('issue_id', issueId).eq('politicians.party', 'democrat'),
      supabase.from('politician_issues').select('id, politicians:politician_id!inner(id)', { count: 'exact', head: true }).eq('issue_id', issueId).eq('politicians.party', 'democrat').in('stance', supportStances),
      supabase.from('politician_issues').select('id, politicians:politician_id!inner(id)', { count: 'exact', head: true }).eq('issue_id', issueId).eq('politicians.party', 'democrat').in('stance', opposeStances),
      supabase.from('politician_issues').select('id, politicians:politician_id!inner(id)', { count: 'exact', head: true }).eq('issue_id', issueId).eq('politicians.party', 'republican'),
      supabase.from('politician_issues').select('id, politicians:politician_id!inner(id)', { count: 'exact', head: true }).eq('issue_id', issueId).eq('politicians.party', 'republican').in('stance', supportStances),
      supabase.from('politician_issues').select('id, politicians:politician_id!inner(id)', { count: 'exact', head: true }).eq('issue_id', issueId).eq('politicians.party', 'republican').in('stance', opposeStances),
    ])
    const total = totalR.count ?? 0
    const supports = supR.count ?? 0
    const opposes = oppR.count ?? 0
    return {
      total, supports, opposes, mixed: total - supports - opposes,
      demTotal: demTotalR.count ?? 0, demSupports: demSupR.count ?? 0, demOpposes: demOppR.count ?? 0,
      gopTotal: gopTotalR.count ?? 0, gopSupports: gopSupR.count ?? 0, gopOpposes: gopOppR.count ?? 0,
    }
  }

  // Run all issue stats in parallel
  const statsArr = await Promise.all(issueIds.map(id => fetchIssueStats(id)))

  const issueStats = new Map<string, typeof statsArr[0]>()
  const issueTotalCounts = new Map<string, number>()
  for (let i = 0; i < issueIds.length; i++) {
    issueStats.set(issueIds[i], statsArr[i])
    issueTotalCounts.set(issueIds[i], statsArr[i].total)
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
                className="touch-feedback group block rounded-lg border border-[var(--codex-border)] bg-[var(--codex-card)] p-5 no-underline transition-all hover:border-[var(--codex-input-border)]"
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
                      {supports > 0 && <div style={{ width: `${(supports / total) * 100}%`, background: '#3B82F6', opacity: 0.7 }} />}
                      {mixed > 0 && <div style={{ width: `${(mixed / total) * 100}%`, background: '#A855F7', opacity: 0.6 }} />}
                      {opposes > 0 && <div style={{ width: `${(opposes / total) * 100}%`, background: '#EF4444', opacity: 0.7 }} />}
                    </div>
                    <div className="mt-1.5 flex gap-3 text-[11px] text-[var(--codex-faint)]">
                      <span style={{ color: '#3B82F6' }}>{supports}</span>
                      <span style={{ color: '#A855F7' }}>{mixed}</span>
                      <span style={{ color: '#EF4444' }}>{opposes}</span>
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

                <div className="text-[11px] text-[var(--codex-faint)]">
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
        {supportPct > 0 && <div style={{ width: `${supportPct}%`, background: '#3B82F6', opacity: 0.6 }} />}
        {opposePct > 0 && <div style={{ width: `${opposePct}%`, background: '#EF4444', opacity: 0.6, marginLeft: 'auto' }} />}
      </div>
      <span className="w-14 text-right text-[10px] tabular-nums text-[var(--codex-faint)]">
        {supportPct > opposePct ? `${supportPct}% for` : `${opposePct}% against`}
      </span>
    </div>
  )
}
