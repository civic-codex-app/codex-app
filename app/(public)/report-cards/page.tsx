import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { createClient as createServerAuthClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { computeReportCard, gradeColor } from '@/lib/utils/report-card'
import type { ReportCard } from '@/lib/utils/report-card'
import { partyColor } from '@/lib/constants/parties'
import { ReportCardList } from './report-card-list'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 3600 // 1 hour

export const metadata: Metadata = {
  title: 'Report Cards | Poli',
  description:
    'Grade every U.S. politician on bipartisanship, engagement, transparency, and effectiveness. Data-driven scores — no opinions.',
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
  // Check authentication
  let isAuthenticated = false
  try {
    const authClient = await createServerAuthClient()
    const { data: { user } } = await authClient.auth.getUser()
    isAuthenticated = !!user
  } catch {}

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main id="main-content" className="mx-auto max-w-[1200px] px-6 pb-16 pt-6 md:px-10">
          <div className="py-20 text-center">
            <div
              className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="mb-2 text-[clamp(24px,3vw,36px)] font-bold text-[var(--poli-text)]">
              Civic Report Cards
            </h1>
            <p className="mx-auto mb-6 max-w-[400px] text-[14px] leading-[1.7] text-[var(--poli-sub)]">
              Unlock detailed scores on bipartisanship, transparency, engagement,
              and effectiveness for every politician.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-[14px] font-semibold text-white no-underline shadow-lg transition-all hover:scale-[1.02] hover:bg-blue-700 hover:shadow-xl"
            >
              Create Free Account
            </Link>
            <p className="mt-3 text-[12px] text-[var(--poli-faint)]">
              Free forever. No credit card required.
            </p>
          </div>
          <Footer />
        </main>
      </>
    )
  }

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
        <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
          <div className="py-20 text-center">
            <div className="mb-3 text-2xl font-bold text-[var(--poli-text)]">
              Something went wrong
            </div>
            <p className="text-sm text-[var(--poli-sub)]">
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
      chamber: p.chamber,
      stances: stanceData?.stances ?? [],
      votingRecords: votesByPol.get(p.id) ?? [],
      committees: committeesByPol.get(p.id) ?? [],
      verifiedStances: stanceData?.verified ?? 0,
      totalStances: stanceData?.total ?? 0,
    })
    return { ...p, reportCard }
  })

  ranked.sort((a, b) => b.reportCard.score - a.reportCard.score)

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 pt-6 pb-16 md:px-10">
        {/* Page title */}
        <h1 className="mb-2 text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-tight text-[var(--poli-text)]">
          Civic Profiles
        </h1>
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-[var(--poli-sub)]">
          Every politician scored on civic activity: bipartisanship, engagement,
          transparency, and effectiveness. Higher scores mean more active public service.
        </p>

        <ReportCardList politicians={ranked} />

        <Footer />
      </div>
    </>
  )
}
