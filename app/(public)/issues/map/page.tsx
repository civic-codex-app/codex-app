import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { STANCE_NUMERIC } from '@/lib/utils/stances'
import { IssueMapView } from '@/components/issues/issue-map-view'

export const revalidate = 3600 // 1 hour
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Issue Map — Poli',
  description:
    'Explore how politicians across each state stand on key issues with an interactive US map.',
}

const PAGE_SIZE = 900

export default async function IssueMapPage() {
  const supabase = createServiceRoleClient()

  // Fetch all issues
  const { data: issues } = await supabase
    .from('issues')
    .select('id, name, slug, icon')
    .order('name')

  // Fetch all politicians (id, name, slug, state, party) — paginated
  const allPoliticians: Array<{ id: string; name: string; slug: string; state: string; party: string; image_url: string | null }> = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('politicians')
      .select('id, name, slug, state, party, image_url')
      .in('chamber', ['senate', 'house', 'governor', 'presidential'])
      .range(from, from + PAGE_SIZE - 1)
    if (error || !data || data.length === 0) break
    allPoliticians.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  const politicianMap = new Map(allPoliticians.map((p) => [p.id, p]))

  // Fetch stances only for federal politicians — batch by 70 to stay under 1000 rows
  const allStances: Array<{ politician_id: string; stance: string; issue_id: string }> = []
  const polIds = allPoliticians.map(p => p.id)
  const BATCH = 70
  const stancePromises = []
  for (let i = 0; i < polIds.length; i += BATCH) {
    stancePromises.push(
      supabase.from('politician_issues')
        .select('politician_id, stance, issue_id')
        .in('politician_id', polIds.slice(i, i + BATCH))
    )
  }
  const stanceResults = await Promise.all(stancePromises)
  for (const r of stanceResults) {
    if (r.data) allStances.push(...(r.data as any[]))
  }

  // Build issue id -> slug mapping
  const issueIdToSlug = new Map((issues ?? []).map((i: any) => [i.id, i.slug]))

  // Group by issue slug + state, compute average numeric stance
  const stateIssueMap: Record<string, Record<string, { sum: number; count: number }>> = {}
  const politiciansByStateIssue: Record<string, Record<string, Array<{ name: string; slug: string; stance: string; party: string; image_url: string | null }>>> = {}

  for (const row of allStances) {
    const issueSlug = issueIdToSlug.get(row.issue_id)
    if (!issueSlug) continue
    const pol = politicianMap.get(row.politician_id)
    if (!pol || !pol.state) continue

    const numeric = STANCE_NUMERIC[row.stance]
    if (numeric == null || numeric < 0) continue

    // Averages
    if (!stateIssueMap[issueSlug]) stateIssueMap[issueSlug] = {}
    if (!stateIssueMap[issueSlug][pol.state]) stateIssueMap[issueSlug][pol.state] = { sum: 0, count: 0 }
    stateIssueMap[issueSlug][pol.state].sum += numeric
    stateIssueMap[issueSlug][pol.state].count += 1

    // Detail lists
    if (!politiciansByStateIssue[issueSlug]) politiciansByStateIssue[issueSlug] = {}
    if (!politiciansByStateIssue[issueSlug][pol.state]) politiciansByStateIssue[issueSlug][pol.state] = []
    politiciansByStateIssue[issueSlug][pol.state].push({
      name: pol.name,
      slug: pol.slug,
      stance: row.stance,
      party: pol.party,
      image_url: pol.image_url,
    })
  }

  // Convert to averages
  const stateIssueAverages: Record<string, Record<string, number>> = {}
  for (const [slug, states] of Object.entries(stateIssueMap)) {
    stateIssueAverages[slug] = {}
    for (const [state, { sum, count }] of Object.entries(states)) {
      stateIssueAverages[slug][state] = sum / count
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        <IssueMapView
          issues={(issues ?? []) as Array<{ id: string; name: string; slug: string; icon: string | null }>}
          stateIssueAverages={stateIssueAverages}
          politiciansByStateIssue={politiciansByStateIssue}
        />
      </main>
      <Footer />
    </>
  )
}
