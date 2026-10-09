import { unstable_cache } from 'next/cache'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { AppShell } from '@/components/app/surface'
import { IssuesView, type IssueCard } from '@/components/issues/issues-view'

/**
 * A day, not an hour.
 *
 * Everything this page derives comes from politician_issues, which is 188,848
 * template-generated rows that last changed in September and change only when a
 * script rewrites them. Recomputing hourly bought nothing and cost a scan of the
 * single largest object in the database — 73.89 MB, 50.79% of it — twenty-four
 * times a day, on an instance with no room to hold it in cache. That was a
 * material share of the disk IO that exhausted the project's IO budget.
 *
 * The 'stances' tag is the right invalidation point when the data does move.
 * Nothing calls revalidateTag today, so this expires on time alone; a script
 * that rewrites stances should trigger it rather than this being shortened back.
 */
export const revalidate = 86400 // 24 hours

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
  { revalidate: 86400, tags: ['stances'] }
)

export const metadata = {
  title: 'Issues | Poli',
  description: 'See where every U.S. politician stands on 22 key issues — from healthcare to immigration. Filter by party and compare stances across the aisle.',
}

/**
 * The page is prerendered with the national picture; who the visitor's own
 * officials are, and where they stand, resolves on the client
 * (components/issues/issues-view.tsx), so the route stays cached.
 */
export default async function IssuesPage() {
  const supabase = createServiceRoleClient()

  const { data: issues } = await supabase.from('issues').select('id, slug, name').order('name')
  if (!issues) {
    return (
      <AppShell>
        <div className="mx-auto max-w-[560px] px-4 pt-5">
          <h1 className="font-serif text-[40px] font-normal leading-[1.08] text-[var(--poli-text)]">Issues</h1>
          <p className="mt-2 text-[14.5px] text-[var(--poli-sub)]">The issue list is unavailable right now.</p>
        </div>
      </AppShell>
    )
  }

  const supportStances = new Set(['strongly_supports', 'supports', 'leans_support'])
  const opposeStances = new Set(['strongly_opposes', 'opposes', 'leans_oppose'])

  // Postgres does the counting (see getStanceCounts). The view is grouped by
  // (issue_id, stance) only — it has no party column — so there is no party
  // split here, and nothing pretends there is.
  const agg = new Map<string, { total: number; supports: number; opposes: number }>()
  for (const i of issues) agg.set(i.id, { total: 0, supports: 0, opposes: 0 })
  for (const row of await getStanceCounts()) {
    const a = agg.get(row.issue_id)
    if (!a) continue
    a.total += row.n
    if (supportStances.has(row.stance)) a.supports += row.n
    else if (opposeStances.has(row.stance)) a.opposes += row.n
  }

  const cards: IssueCard[] = issues.map((issue) => {
    const a = agg.get(issue.id)!
    return {
      id: issue.id,
      slug: issue.slug,
      name: issue.name,
      total: a.total,
      supports: a.supports,
      opposes: a.opposes,
      mixed: a.total - a.supports - a.opposes,
    }
  })
  // Every politician holds one row per issue, so the largest per-issue total
  // is the number of officials with stances.
  const officials = Math.max(0, ...cards.map((c) => c.total))

  return (
    <AppShell>
      <div className="mx-auto max-w-[560px] px-4 pt-5">
        <IssuesView issues={cards} officials={officials} />
      </div>
    </AppShell>
  )
}
