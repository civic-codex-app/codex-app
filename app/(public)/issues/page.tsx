import { unstable_cache } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { IssueGrid, type IssueCard } from '@/components/issues/issue-grid'
import { stanceBucket } from '@/lib/utils/stances'

export const revalidate = 3600 // 1 hour

/**
 * Per-issue stance tallies, aggregated by Postgres.
 *
 * politician_issues is ~189k rows, so neither counting in the app (≈189 paged
 * requests) nor 3 count queries per issue (66 round-trips) is viable. The
 * issue_stance_counts view (supabase/025_issue_stance_counts.sql) does the
 * GROUP BY and returns ~200 rows in a single request.
 */
const getStanceCounts = unstable_cache(
  async (): Promise<Array<{ issue_id: string; stance: string; n: number }>> => {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('issue_stance_counts')
      .select('issue_id, stance, n')
    if (error) {
      console.error('[issues] issue_stance_counts unavailable:', error.message)
      return []
    }
    return (data ?? []) as Array<{ issue_id: string; stance: string; n: number }>
  },
  ['issues-stance-counts'],
  { revalidate: 3600, tags: ['stances'] }
)

export const metadata = {
  title: 'Issues | Poli',
  description: 'See where every U.S. politician stands on 22 key issues — from healthcare to immigration. Filter by party and compare stances across the aisle.',
}

const CATEGORY_LABELS: Record<string, string> = {
  economy: 'Economy', healthcare: 'Healthcare', immigration: 'Immigration',
  education: 'Education', defense: 'Defense', environment: 'Environment',
  justice: 'Justice', foreign_policy: 'Foreign Policy', technology: 'Technology',
  social: 'Social', gun_policy: 'Gun Policy', infrastructure: 'Infrastructure',
  housing: 'Housing', energy: 'Energy',
}

type SortKey = 'name' | 'most_stances' | 'most_controversial'

export default async function IssuesPage() {
  const supabase = createServiceRoleClient()

  const { data: issues } = await supabase.from('issues').select('*').order('name')
  if (!issues) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        <div className="py-20 text-center">
          <div className="mb-3 text-2xl font-bold">Something went wrong</div>
        </div>
      </div>
    )
  }

  // Stance types grouped by bucket
  const supportStances = new Set(['strongly_supports', 'supports', 'leans_support'])
  const opposeStances = new Set(['strongly_opposes', 'opposes', 'leans_oppose'])

  // Postgres does the counting (see getStanceCounts) — one request returning
  // ~200 grouped rows, instead of 66 count round-trips (5.4s) or paginating
  // 189k rows into the app (>20s).
  // No party split here on purpose: issue_stance_counts is grouped by
  // (issue_id, stance) only — it has no party column. The old code carried
  // demTotal/gopTotal fields and a <PartyBar> branch guarded on them being
  // above zero, which they never were, so those bars have never rendered on
  // this page. Dropped rather than left looking like a feature.
  type IssueAgg = { total: number; supports: number; opposes: number; mixed: number }
  const issueStats = new Map<string, IssueAgg>()
  for (const i of issues) {
    issueStats.set(i.id, { total: 0, supports: 0, opposes: 0, mixed: 0 })
  }
  for (const row of await getStanceCounts()) {
    const agg = issueStats.get(row.issue_id)
    if (!agg) continue
    agg.total += row.n
    if (supportStances.has(row.stance)) agg.supports += row.n
    else if (opposeStances.has(row.stance)) agg.opposes += row.n
  }

  let totalStances = 0
  const cards: IssueCard[] = issues.map((issue) => {
    const a = issueStats.get(issue.id)!
    a.mixed = a.total - a.supports - a.opposes
    totalStances += a.total
    return {
      id: issue.id,
      slug: issue.slug,
      name: issue.name,
      icon: issue.icon ?? null,
      description: issue.description ?? null,
      category: issue.category ?? null,
      ...a,
      officials: a.total,
    }
  })

  return (
    <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
      <div className="mb-10 max-w-[600px]">
        <h1 className="mb-4 animate-fade-up text-[clamp(32px,4vw,52px)] font-bold leading-[1.1]">
          Political Issues
        </h1>
        <p className="animate-fade-up text-[15px] leading-[1.7] text-[var(--poli-subtle)]">
          Explore where politicians stand on the issues that matter most.
        </p>
      </div>

      {/* Filtering and sorting happen in the browser: 22 issues do not need a
          server round trip, and awaiting searchParams here would make the
          whole page dynamic. */}
      <IssueGrid issues={cards} categoryLabels={CATEGORY_LABELS} totalStances={totalStances} />
    </div>
  )
}
