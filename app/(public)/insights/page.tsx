import { Suspense } from 'react'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ChamberComposition } from '@/components/visualizations/chamber-composition'
import { IssueHeatmap } from '@/components/visualizations/issue-heatmap'
import { PartyAlignmentSpectrum } from '@/components/visualizations/party-alignment-spectrum'
import { BipartisanScoreCard } from '@/components/visualizations/bipartisan-score-card'
import { computeAlignment } from '@/lib/utils/alignment'
import { stanceBucket } from '@/lib/utils/stances'
import type { Metadata } from 'next'
import type {
  InsightsPoliticianRow,
  InsightsStanceRow,
  InsightsIssueRow,
} from '@/lib/types/supabase'

export const revalidate = 900 // 15 minutes

export const metadata: Metadata = {
  title: 'Insights -- Poli',
  description: 'Data-driven political insights: chamber composition, issue consensus, alignment spectrums, and bipartisan rankings.',
}

export default async function InsightsPage() {
  const supabase = createServiceRoleClient()

  // Fetch federal/statewide politicians for insights (scoped for performance)
  const INSIGHT_CHAMBERS = ['senate', 'house', 'governor', 'presidential']
  const { data: allPoliticians, error: politiciansError } = await supabase
    .from('politicians')
    .select('id, name, slug, party, state, chamber, image_url, title')
    .in('chamber', INSIGHT_CHAMBERS)
    .order('name')
  if (politiciansError) console.error('Failed to fetch politicians for insights:', politiciansError.message)

  if (!allPoliticians) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
          <div className="py-20 text-center">
            <div className="mb-3 text-2xl font-bold text-[var(--codex-text)]">Something went wrong</div>
            <p className="text-sm text-[var(--codex-sub)]">
              We couldn&apos;t load insights right now. Please try again later.
            </p>
          </div>
          <Footer />
        </div>
      </>
    )
  }

  const politicians = allPoliticians as any as InsightsPoliticianRow[]

  // Fetch issues first (small query)
  const { data: allIssues } = await supabase
    .from('issues')
    .select('id, name, slug, icon, category')
    .order('name')
  const issues = (allIssues ?? []) as any as InsightsIssueRow[]
  const issueMap = new Map(issues.map(i => [i.id, i]))

  // Fetch stances WITHOUT join (much faster) — paginate through scoped politician IDs
  const polIds = politicians.map(p => p.id)
  const BATCH = 100 // 100 pols × 14 issues = 1400 rows, over 1000 limit. Use 70.
  const SAFE_BATCH = 70 // 70 × 14 = 980, under 1000-row limit
  const stancePromises = []
  for (let i = 0; i < polIds.length; i += SAFE_BATCH) {
    const batch = polIds.slice(i, i + SAFE_BATCH)
    stancePromises.push(
      supabase
        .from('politician_issues')
        .select('politician_id, stance, issue_id')
        .in('politician_id', batch)
    )
  }
  const stanceResults = await Promise.all(stancePromises)

  // Reconstruct with issue info from the map
  const stances: InsightsStanceRow[] = []
  for (const result of stanceResults) {
    if (result.data) {
      for (const row of result.data) {
        const issue = issueMap.get(row.issue_id)
        if (issue) {
          stances.push({
            politician_id: row.politician_id,
            stance: row.stance,
            issues: issue,
          } as InsightsStanceRow)
        }
      }
    }
  }

  // -- Chamber Composition --
  const chamberData = (chamber: string) => {
    const filtered = politicians.filter((p) =>
      chamber === 'Governors'
        ? p.chamber?.toLowerCase() === 'governor'
        : p.chamber?.toLowerCase() === chamber.toLowerCase()
    )
    const partyCounts: Record<string, number> = {}
    filtered.forEach((p) => {
      const party = (p.party ?? 'independent').toLowerCase()
      partyCounts[party] = (partyCounts[party] ?? 0) + 1
    })
    return {
      seats: Object.entries(partyCounts).map(([party, count]) => ({ party, count })),
      total: filtered.length,
    }
  }

  const senateData = chamberData('Senate')
  const houseData = chamberData('House')
  const govData = chamberData('Governors')

  // -- Pre-index all data for fast lookups --
  const polPartyMap = new Map<string, string>()
  politicians.forEach((p) => polPartyMap.set(p.id, (p.party ?? 'independent').toLowerCase()))

  // Group stances by politician and by issue+party in one pass
  const polStanceMap: Record<string, InsightsStanceRow[]> = {}
  // heatmap index: issueSlug -> party -> bucket -> count
  type BucketCounts = { supports: number; opposes: number; neutral: number; mixed: number }
  const heatIndex = new Map<string, Map<string, BucketCounts>>()

  for (const s of stances) {
    // Per-politician grouping
    if (!polStanceMap[s.politician_id]) polStanceMap[s.politician_id] = []
    polStanceMap[s.politician_id].push(s)

    // Heatmap indexing
    const issueSlug = s.issues?.slug
    if (!issueSlug) continue
    if (!heatIndex.has(issueSlug)) heatIndex.set(issueSlug, new Map())
    const partyMap = heatIndex.get(issueSlug)!
    const party = polPartyMap.get(s.politician_id) ?? 'independent'
    if (!partyMap.has(party)) partyMap.set(party, { supports: 0, opposes: 0, neutral: 0, mixed: 0 })
    const counts = partyMap.get(party)!
    const bucket = stanceBucket(s.stance)
    if (bucket === 'supports') counts.supports++
    else if (bucket === 'opposes') counts.opposes++
    else if (bucket === 'neutral') counts.neutral++
    else counts.mixed++
  }

  // -- Issue Heatmap (from pre-indexed data) --
  const EMPTY_COUNTS: BucketCounts = { supports: 0, opposes: 0, neutral: 0, mixed: 0 }
  const heatmapData = issues.map((issue) => {
    const partyMap = heatIndex.get(issue.slug)
    return {
      issue: issue.name,
      issueSlug: issue.slug,
      icon: issue.icon ?? '',
      parties: {
        democrat: partyMap?.get('democrat') ?? { ...EMPTY_COUNTS },
        republican: partyMap?.get('republican') ?? { ...EMPTY_COUNTS },
        independent: partyMap?.get('independent') ?? { ...EMPTY_COUNTS },
      },
    }
  })

  // -- Alignment Spectrum --

  const spectrumData = politicians
    .map((p) => {
      const polStances = polStanceMap[p.id] ?? []
      const mappedStances = polStances.map((s) => ({
        stance: s.stance,
        issues: s.issues ? { slug: s.issues.slug } : null,
      }))
      const alignment = computeAlignment(p.party ?? 'independent', mappedStances)
      return {
        name: p.name,
        slug: p.slug,
        party: (p.party ?? 'independent').toLowerCase(),
        state: p.state ?? '',
        chamber: (p.chamber ?? '').toLowerCase(),
        alignment,
        imageUrl: p.image_url ?? undefined,
      }
    })
    .filter((p) => p.alignment >= 0)

  // -- Bipartisan Score --
  // Bipartisan = inverse of alignment (how often they deviate from party line)
  const bipartisanData = spectrumData
    .filter((p) => p.alignment >= 0)
    .map((p) => ({
      name: p.name,
      slug: p.slug,
      party: p.party,
      state: p.state,
      imageUrl: p.imageUrl,
      bipartisanScore: Math.max(0, 100 - p.alignment),
    }))

  const mostBipartisan = [...bipartisanData].sort((a, b) => b.bipartisanScore - a.bipartisanScore)
  const mostPartisan = [...bipartisanData].sort((a, b) => a.bipartisanScore - b.bipartisanScore)

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        {/* Hero */}
        <div className="mb-14 max-w-[650px]">
          <h1 className="mb-4 animate-fade-up text-[clamp(32px,4vw,52px)] font-bold leading-[1.1]">
            Political Insights
          </h1>
          <p className="animate-fade-up text-[15px] leading-[1.7] text-[var(--codex-subtle)]">
            These charts break down how the government is split between parties, where politicians agree and disagree, and who works across the aisle. Everything here is based on real data from official records.
          </p>
        </div>

        {/* Section 1: Chamber Composition */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="mb-1 text-sm font-semibold text-[var(--codex-sub)]">
              Chamber Composition
            </h2>
            <p className="text-[13px] text-[var(--codex-faint)]">
              Which party has the most seats in each part of government
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--codex-faint)]">
              Each dot represents one official. The party with more than half the seats is &quot;in the majority&quot; — they get to decide which bills come up for a vote and lead the committees.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Suspense fallback={<ChartSkeleton />}>
              <ChamberComposition
                seats={senateData.seats}
                chamber="Senate"
                total={senateData.total}
              />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <ChamberComposition
                seats={houseData.seats}
                chamber="House"
                total={houseData.total}
              />
            </Suspense>
            <Suspense fallback={<ChartSkeleton />}>
              <ChamberComposition
                seats={govData.seats}
                chamber="Governors"
                total={govData.total}
              />
            </Suspense>
          </div>
        </section>

        {/* Section 2: Issue Consensus Heatmap */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="mb-1 text-sm font-semibold text-[var(--codex-sub)]">
              Issue Consensus Heatmap
            </h2>
            <p className="text-[13px] text-[var(--codex-faint)]">
              Where the two parties agree and disagree the most
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--codex-faint)]">
              Each bar shows how politicians from that party feel about an issue. Blue means they support it, red means they oppose it. When both parties have mostly the same color, they agree. When the colors are opposite, that issue is a major dividing line.
            </p>
          </div>
          <div className="rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-5">
            <Suspense fallback={<ChartSkeleton />}>
              <IssueHeatmap stanceData={heatmapData} />
            </Suspense>
          </div>
        </section>

        {/* Section 3: Political Spectrum */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="mb-1 text-sm font-semibold text-[var(--codex-sub)]">
              Political Spectrum
            </h2>
            <p className="text-[13px] text-[var(--codex-faint)]">
              How closely each politician votes with their own party
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--codex-faint)]">
              Every politician gets an alignment score from 0% to 100%. A score near 100% means they almost always agree with their party. A low score means they often break away and vote differently. Tap any dot to see who it is.
            </p>
          </div>
          <Suspense fallback={<ChartSkeleton />}>
            <PartyAlignmentSpectrum politicians={spectrumData} />
          </Suspense>
        </section>

        {/* Section 4: Bipartisan Rankings */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="mb-1 text-sm font-semibold text-[var(--codex-sub)]">
              Bipartisan Index
            </h2>
            <p className="text-[13px] text-[var(--codex-faint)]">
              Which politicians work with the other party the most — and the least
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--codex-faint)]">
              The left list shows politicians who vote across party lines the most — they don&apos;t always follow their party. The right list shows those who almost never break from their party&apos;s position.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-5">
              <Suspense fallback={<ChartSkeleton />}>
                <BipartisanScoreCard
                  politicians={mostBipartisan}
                  title="Works with both sides"
                  subtitle="Ranked by how often they work with the other party"
                  limit={10}
                />
              </Suspense>
            </div>
            <div className="rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-5">
              <Suspense fallback={<ChartSkeleton />}>
                <BipartisanScoreCard
                  politicians={mostPartisan}
                  title="Sticks with their own party"
                  subtitle="Ranked by how often they only vote with their own side"
                  limit={10}
                />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Explore More */}
        <section className="mb-16">
          <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
            Explore More
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <a href="/issues/map" className="rounded-md border border-[var(--codex-border)] p-5 transition-colors hover:border-[var(--codex-text)]">
              <div className="mb-2 text-lg font-semibold">Issue Map</div>
              <p className="text-[13px] text-[var(--codex-sub)]">See how each state&apos;s delegation leans on key issues</p>
            </a>
            <a href="/insights/money-map" className="rounded-md border border-[var(--codex-border)] p-5 transition-colors hover:border-[var(--codex-text)]">
              <div className="mb-2 text-lg font-semibold">Money Map</div>
              <p className="text-[13px] text-[var(--codex-sub)]">Campaign finance totals by state</p>
            </a>
            <a href="/report-cards" className="rounded-md border border-[var(--codex-border)] p-5 transition-colors hover:border-[var(--codex-text)]">
              <div className="mb-2 text-lg font-semibold">Report Cards</div>
              <p className="text-[13px] text-[var(--codex-sub)]">Every politician graded A through F</p>
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-6">
      <div className="mb-4 h-4 w-32 rounded bg-[var(--codex-border)]" />
      <div className="h-40 rounded bg-[var(--codex-border)]" style={{ opacity: 0.3 }} />
    </div>
  )
}
