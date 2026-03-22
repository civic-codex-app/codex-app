import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { STANCE_NUMERIC } from '@/lib/utils/stances'
import { IssueMapView } from '@/components/issues/issue-map-view'

export const revalidate = 600

export const metadata = {
  title: 'Issue Map — Codex',
  description:
    'Explore how politicians across each state stand on key issues with an interactive US map.',
}

const PAGE_SIZE = 1000

interface IssueRow {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface StanceRow {
  stance: string
  politicians: { state: string } | null
  issues: { slug: string } | null
}

export default async function IssueMapPage() {
  const supabase = createServiceRoleClient()

  // Fetch all issues
  const { data: issues } = await supabase
    .from('issues')
    .select('id, name, slug, icon')
    .order('name')

  // Fetch all politician_issues with state info — paginate past 1000-row limit
  const allStances: StanceRow[] = []
  let from = 0
  let keepGoing = true

  while (keepGoing) {
    const { data, error } = await supabase
      .from('politician_issues')
      .select('stance, politicians!inner(state), issues!inner(slug)')
      .range(from, from + PAGE_SIZE - 1)

    if (error || !data || data.length === 0) {
      keepGoing = false
    } else {
      allStances.push(...(data as unknown as StanceRow[]))
      if (data.length < PAGE_SIZE) keepGoing = false
      from += PAGE_SIZE
    }
  }

  // Group by issue slug + state, compute average numeric stance per state per issue
  // stateIssueMap: { [issueSlug]: { [stateCode]: { sum, count } } }
  const stateIssueMap: Record<
    string,
    Record<string, { sum: number; count: number }>
  > = {}

  for (const row of allStances) {
    const slug = (row.issues as { slug: string } | null)?.slug
    const state = (row.politicians as { state: string } | null)?.state
    if (!slug || !state) continue
    const numeric = STANCE_NUMERIC[row.stance]
    if (numeric == null || numeric < 0) continue // skip unknown

    if (!stateIssueMap[slug]) stateIssueMap[slug] = {}
    if (!stateIssueMap[slug][state]) stateIssueMap[slug][state] = { sum: 0, count: 0 }
    stateIssueMap[slug][state].sum += numeric
    stateIssueMap[slug][state].count += 1
  }

  // Convert to averages
  const stateIssueAverages: Record<string, Record<string, number>> = {}
  for (const [slug, states] of Object.entries(stateIssueMap)) {
    stateIssueAverages[slug] = {}
    for (const [state, { sum, count }] of Object.entries(states)) {
      stateIssueAverages[slug][state] = sum / count
    }
  }

  // Build per-state politician list for detail panel
  // politiciansByState: { [issueSlug]: { [stateCode]: Array<{ name, stance, party }> } }
  // Fetch politicians for the detail panel
  const { data: politicians } = await supabase
    .from('politicians')
    .select('id, name, slug, state, party, image_url')

  const politicianMap = new Map(
    (politicians ?? []).map((p) => [p.id, p]),
  )

  // Re-fetch politician_issues with politician_id for detail panel
  const allStancesDetail: Array<{
    politician_id: string
    stance: string
    issues: { slug: string } | null
  }> = []
  from = 0
  keepGoing = true

  while (keepGoing) {
    const { data, error } = await supabase
      .from('politician_issues')
      .select('politician_id, stance, issues!inner(slug)')
      .range(from, from + PAGE_SIZE - 1)

    if (error || !data || data.length === 0) {
      keepGoing = false
    } else {
      allStancesDetail.push(
        ...(data as unknown as typeof allStancesDetail),
      )
      if (data.length < PAGE_SIZE) keepGoing = false
      from += PAGE_SIZE
    }
  }

  const politiciansByStateIssue: Record<
    string,
    Record<
      string,
      Array<{
        name: string
        slug: string
        stance: string
        party: string
        image_url: string | null
      }>
    >
  > = {}

  for (const row of allStancesDetail) {
    const issueSlug = (row.issues as { slug: string } | null)?.slug
    if (!issueSlug) continue
    const pol = politicianMap.get(row.politician_id)
    if (!pol || !pol.state) continue

    if (!politiciansByStateIssue[issueSlug])
      politiciansByStateIssue[issueSlug] = {}
    if (!politiciansByStateIssue[issueSlug][pol.state])
      politiciansByStateIssue[issueSlug][pol.state] = []

    politiciansByStateIssue[issueSlug][pol.state].push({
      name: pol.name,
      slug: pol.slug,
      stance: row.stance,
      party: pol.party,
      image_url: pol.image_url,
    })
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        <IssueMapView
          issues={(issues ?? []) as IssueRow[]}
          stateIssueAverages={stateIssueAverages}
          politiciansByStateIssue={politiciansByStateIssue}
        />
      </main>
      <Footer />
    </>
  )
}
