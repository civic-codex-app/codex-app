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

export const metadata: Metadata = {
  title: 'Insights -- Codex',
  description: 'Data-driven political insights: chamber composition, issue consensus, alignment spectrums, and bipartisan rankings.',
}

export default async function InsightsPage() {
  const supabase = createServiceRoleClient()

  // Fetch all politicians with their stances
  const { data: allPoliticians, error: politiciansError } = await supabase
    .from('politicians')
    .select('id, name, slug, party, state, chamber, image_url, title')
    .order('name')
  if (politiciansError) console.error('Failed to fetch politicians for insights:', politiciansError.message)

  if (!allPoliticians) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-[1200px] px-6 md:px-10">
          <div className="py-20 text-center">
            <div className="mb-3 font-serif text-2xl text-[var(--codex-text)]">Something went wrong</div>
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

  // Fetch all stances with issue info -- paginate past 1000-row limit
  const stances: InsightsStanceRow[] = []
  {
    let from = 0
    const PAGE = 1000
    while (true) {
      const { data } = await supabase
        .from('politician_issues')
        .select('politician_id, stance, issues:issue_id(id, name, slug, icon, category)')
        .range(from, from + PAGE - 1)
      if (!data || data.length === 0) break
      stances.push(...(data as any as InsightsStanceRow[]))
      if (data.length < PAGE) break
      from += PAGE
    }
  }

  // Fetch all issues
  const { data: allIssues, error: issuesError } = await supabase
    .from('issues')
    .select('id, name, slug, icon, category')
    .order('name')
  if (issuesError) console.error('Failed to fetch issues for insights:', issuesError.message)

  const issues = (allIssues ?? []) as any as InsightsIssueRow[]

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

  // -- Issue Heatmap --
  // Map Lucide icon names to emojis for the heatmap
  const iconToEmoji: Record<string, string> = {
    briefcase: '\uD83D\uDCBC', 'heart-pulse': '\uD83C\uDFE5', globe: '\uD83C\uDF0D', 'graduation-cap': '\uD83C\uDF93',
    shield: '\uD83D\uDEE1\uFE0F', leaf: '\uD83C\uDF3F', scale: '\u2696\uFE0F', landmark: '\uD83C\uDFDB\uFE0F', cpu: '\uD83D\uDCBB',
    users: '\uD83D\uDC65', target: '\uD83C\uDFAF', 'hard-hat': '\uD83C\uDFD7\uFE0F', home: '\uD83C\uDFE0', zap: '\u26A1',
  }

  // Build fast politician party lookup
  const polPartyMap = new Map<string, string>()
  politicians.forEach((p) => polPartyMap.set(p.id, (p.party ?? 'independent').toLowerCase()))

  const heatmapData = issues.map((issue) => {
    const issueStances = stances.filter((s) => s.issues?.slug === issue.slug)
    const partyBreakdown = (party: string) => {
      const partyStances = issueStances.filter((s) => polPartyMap.get(s.politician_id) === party)
      return {
        supports: partyStances.filter((s) => stanceBucket(s.stance) === 'supports').length,
        opposes: partyStances.filter((s) => stanceBucket(s.stance) === 'opposes').length,
        neutral: partyStances.filter((s) => stanceBucket(s.stance) === 'neutral').length,
        mixed: partyStances.filter((s) => stanceBucket(s.stance) === 'mixed').length,
      }
    }

    return {
      issue: issue.name,
      issueSlug: issue.slug,
      icon: iconToEmoji[issue.icon] ?? '\uD83D\uDCCB',
      parties: {
        democrat: partyBreakdown('democrat'),
        republican: partyBreakdown('republican'),
        independent: partyBreakdown('independent'),
      },
    }
  })

  // -- Alignment Spectrum --
  const polStanceMap: Record<string, InsightsStanceRow[]> = {}
  stances.forEach((s) => {
    if (!polStanceMap[s.politician_id]) polStanceMap[s.politician_id] = []
    polStanceMap[s.politician_id].push(s)
  })

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
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        {/* Hero */}
        <div className="mb-14 max-w-[650px]">
          <h1 className="mb-4 animate-fade-up font-serif text-[clamp(32px,4vw,52px)] font-normal leading-[1.1]">
            Political{' '}
            <span className="italic text-[var(--codex-subtle)]">Insights</span>
          </h1>
          <p className="animate-fade-up text-[15px] leading-[1.7] text-[var(--codex-subtle)]">
            Data-driven analysis of political positions, party alignment, and bipartisan cooperation
            across the American political landscape.
          </p>
        </div>

        {/* Section 1: Chamber Composition */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="mb-1 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              Chamber Composition
            </h2>
            <p className="text-[13px] text-[var(--codex-faint)]">
              Current party breakdown by chamber
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
            <h2 className="mb-1 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              Issue Consensus Heatmap
            </h2>
            <p className="text-[13px] text-[var(--codex-faint)]">
              How party members break on each issue
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
            <h2 className="mb-1 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              Political Spectrum
            </h2>
            <p className="text-[13px] text-[var(--codex-faint)]">
              Where each politician falls on the party alignment scale
            </p>
          </div>
          <Suspense fallback={<ChartSkeleton />}>
            <PartyAlignmentSpectrum politicians={spectrumData} />
          </Suspense>
        </section>

        {/* Section 4: Bipartisan Rankings */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="mb-1 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              Bipartisan Index
            </h2>
            <p className="text-[13px] text-[var(--codex-faint)]">
              Who works across the aisle most -- and least
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-5">
              <Suspense fallback={<ChartSkeleton />}>
                <BipartisanScoreCard
                  politicians={mostBipartisan}
                  title="Most Bipartisan"
                  limit={10}
                />
              </Suspense>
            </div>
            <div className="rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] p-5">
              <Suspense fallback={<ChartSkeleton />}>
                <BipartisanScoreCard
                  politicians={mostPartisan}
                  title="Most Partisan"
                  limit={10}
                />
              </Suspense>
            </div>
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
