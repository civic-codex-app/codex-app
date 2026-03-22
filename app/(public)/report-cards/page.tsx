import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { computeReportCard, gradeColor } from '@/lib/utils/report-card'
import type { ReportCard } from '@/lib/utils/report-card'
import { partyColor } from '@/lib/constants/parties'
import { ReportCardList } from './report-card-list'
import type { Metadata } from 'next'

export const revalidate = 900 // 15 minutes

export const metadata: Metadata = {
  title: 'Report Cards — Codex',
  description:
    'See how every U.S. politician scores on bipartisanship, engagement, transparency, and effectiveness.',
}

// ---- helpers for paginated Supabase fetches ----

const PAGE_SIZE = 900

async function fetchAllRows<T>(
  queryFn: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>
): Promise<T[]> {
  const all: T[] = []
  let offset = 0
  while (true) {
    const { data, error } = await queryFn(offset, offset + PAGE_SIZE - 1)
    if (error) {
      console.error('Paginated fetch error:', error.message)
      break
    }
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }
  return all
}

// ---- types for the ranked list ----

export interface RankedPolitician {
  id: string
  name: string
  slug: string
  party: string
  state: string
  chamber: string
  image_url: string | null
  reportCard: ReportCard
}

export default async function ReportCardsPage() {
  const supabase = createServiceRoleClient()

  const CHAMBERS = ['senate', 'house', 'governor']

  // 1. Fetch politicians (paginated)
  const politicians = await fetchAllRows<{
    id: string
    name: string
    slug: string
    party: string
    state: string
    chamber: string
    image_url: string | null
  }>((from, to) =>
    supabase
      .from('politicians')
      .select('id, name, slug, party, state, chamber, image_url')
      .in('chamber', CHAMBERS)
      .order('name')
      .range(from, to)
  )

  if (politicians.length === 0) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-[1200px] px-6 md:px-10">
          <div className="py-20 text-center">
            <div className="mb-3 font-serif text-2xl text-[var(--codex-text)]">
              Something went wrong
            </div>
            <p className="text-sm text-[var(--codex-sub)]">
              We couldn&apos;t load report cards right now. Please try again later.
            </p>
          </div>
          <Footer />
        </div>
      </>
    )
  }

  const polIds = politicians.map((p) => p.id)

  // 2. Fetch stances (batched to stay under 1000-row limit per query)
  const STANCE_BATCH = 70 // 70 pols * ~14 issues = ~980 rows
  const stancePromises: Promise<{
    data: { politician_id: string; stance: string; issue_id: string; is_verified: boolean }[] | null
    error: any
  }>[] = []
  for (let i = 0; i < polIds.length; i += STANCE_BATCH) {
    const batch = polIds.slice(i, i + STANCE_BATCH)
    stancePromises.push(
      supabase
        .from('politician_issues')
        .select('politician_id, stance, issue_id, is_verified')
        .in('politician_id', batch) as any
    )
  }
  const stanceResults = await Promise.all(stancePromises)
  const allStances: { politician_id: string; stance: string; issue_id: string; is_verified: boolean }[] = []
  for (const r of stanceResults) {
    if (r.data) allStances.push(...r.data)
  }

  // 3. Fetch issues (for slug mapping)
  const { data: issuesData } = await supabase
    .from('issues')
    .select('id, slug')
  const issueMap = new Map((issuesData ?? []).map((i: any) => [i.id, i.slug]))

  // Build stance map per politician
  const stancesByPol = new Map<
    string,
    { stances: { stance: string; issues: { slug: string } | null }[]; verified: number; total: number }
  >()
  for (const s of allStances) {
    if (!stancesByPol.has(s.politician_id)) {
      stancesByPol.set(s.politician_id, { stances: [], verified: 0, total: 0 })
    }
    const entry = stancesByPol.get(s.politician_id)!
    const slug = issueMap.get(s.issue_id) ?? null
    entry.stances.push({ stance: s.stance, issues: slug ? { slug } : null })
    entry.total++
    if (s.is_verified) entry.verified++
  }

  // 4. Fetch voting records (paginated, no .in() filter to avoid URL length limits)
  const polIdSet = new Set(polIds)
  const votingRecords = await fetchAllRows<{ politician_id: string; vote: string }>(
    (from, to) =>
      supabase
        .from('voting_records')
        .select('politician_id, vote')
        .range(from, to)
  )
  const votesByPol = new Map<string, { vote: string }[]>()
  for (const v of votingRecords) {
    if (!polIdSet.has(v.politician_id)) continue
    if (!votesByPol.has(v.politician_id)) votesByPol.set(v.politician_id, [])
    votesByPol.get(v.politician_id)!.push({ vote: v.vote })
  }

  // 5. Fetch committees (paginated)
  const committeeLinks = await fetchAllRows<{ politician_id: string; role: string }>(
    (from, to) =>
      supabase
        .from('politician_committees')
        .select('politician_id, role')
        .range(from, to)
  )
  const committeesByPol = new Map<string, { role: string }[]>()
  for (const c of committeeLinks) {
    if (!committeesByPol.has(c.politician_id))
      committeesByPol.set(c.politician_id, [])
    committeesByPol.get(c.politician_id)!.push({ role: c.role })
  }

  // 6. Compute report cards & rank
  const ranked: RankedPolitician[] = politicians.map((p) => {
    const stanceData = stancesByPol.get(p.id)
    const reportCard = computeReportCard({
      party: p.party,
      stances: stanceData?.stances ?? [],
      votingRecords: votesByPol.get(p.id) ?? [],
      committees: committeesByPol.get(p.id) ?? [],
      verifiedStances: stanceData?.verified ?? 0,
      totalStances: stanceData?.total ?? 0,
    })
    return { ...p, reportCard }
  })

  ranked.sort((a, b) => b.reportCard.score - a.reportCard.score)
  const top = ranked.slice(0, 100)

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 pb-16 pt-10 md:px-10">
        {/* Page title */}
        <h1 className="mb-2 font-serif text-[clamp(1.8rem,4vw,2.8rem)] leading-tight text-[var(--codex-text)]">
          Report <em>Cards</em>
        </h1>
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-[var(--codex-sub)]">
          Every politician graded on four dimensions: bipartisanship (crossing
          party lines), engagement (voting attendance), transparency (verified
          stances), and effectiveness (committee involvement). Scores are
          combined into a letter grade from A to F.
        </p>

        <ReportCardList politicians={top} />

        <Footer />
      </div>
    </>
  )
}
