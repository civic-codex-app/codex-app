import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import type { Metadata } from 'next'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { AppShell } from '@/components/app/surface'
import { BackButton } from '@/components/ui/back-button'
import { ProfileHero } from '@/components/politicians/profile-hero'
import { ElectionCard, type Opponent } from '@/components/politicians/election-card'
import { MoneyCard } from '@/components/politicians/money-card'
import { StancesCard } from '@/components/politicians/stances-card'
import { VotesCard } from '@/components/politicians/votes-card'
import { MoreSection } from '@/components/politicians/more-section'

import type { Politician } from '@/lib/types/politician'
import type {
  PoliticianStanceRow,
  CommitteeMembershipRow,
  VotingRecordRow,
  CampaignFinanceRow,
  ElectionResultRow,
  ComparisonStanceRow,
  LikeMindedPoliticianRow,
} from '@/lib/types/supabase'
import { computeAlignment } from '@/lib/utils/alignment'
import { type LikeMindedPolitician } from '@/components/politicians/like-minded'
import { computeReportCard } from '@/lib/utils/report-card'
import { getCachedNews } from '@/lib/utils/news'
import { candidacyFor } from '@/lib/utils/candidacy'
import { countdown } from '@/lib/utils/next-election'
import { PageViewTracker } from '@/components/analytics/page-view-tracker'

/**
 * A profile: one face, then four cards — Election, Money, Stances, Votes —
 * and everything else behind a row that opens in place. The composition is
 * the "Rep" screen of the Quiet Screens canvas.
 *
 * Caching is unchanged from before: revalidate with an empty
 * generateStaticParams, no cookie reads (the Follow button and the civic
 * profile's sign-in gate resolve the session on the client).
 */

/**
 * Number of issues in the catalog, cached. It is the denominator for stance
 * coverage on the report card and changes roughly twice a year.
 */
const getIssueCatalogSize = unstable_cache(
  async () => {
    const supabase = createServiceRoleClient()
    const { count } = await supabase.from('issues').select('*', { count: 'exact', head: true })
    return count ?? 0
  },
  ['issue-catalog-size'],
  { revalidate: 3600, tags: ['issues'] }
)

// 30 minutes is the ceiling, not the actual window. Next takes the SHORTEST
// revalidate encountered during a render, and getCachedNews (lib/utils/news.ts)
// caches for 600s — so this page's served Cache-Control is s-maxage=600 and it
// refreshes every 10 minutes. That is the right behaviour for a page carrying
// news, but the number here on its own is misleading.
export const revalidate = 1800

/**
 * On-demand ISR.
 *
 * A dynamic segment without generateStaticParams is never cached, whatever
 * `revalidate` says — the production build emits Cache-Control: no-store and
 * no x-nextjs-cache header. Returning no params prerenders nothing at build
 * time, so the build does not depend on Supabase, and each profile is cached
 * after its first visitor.
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return []
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from('politicians').select('name, title, party, state, bio').eq('slug', slug).single()
  if (error) console.error('Failed to fetch politician metadata:', error.message)

  if (!data) return { title: 'Not Found | Poli' }

  const description = data.bio?.slice(0, 160) || `${data.title} from ${data.state}`
  const ogUrl = `/api/og?title=${encodeURIComponent(data.name)}&subtitle=${encodeURIComponent(data.title)}&party=${data.party}&type=politician`

  return {
    title: `${data.name} - ${data.title} | Poli`,
    description,
    alternates: { canonical: `https://getpoli.app/politicians/${slug}` },
    openGraph: {
      title: `${data.name} - ${data.title}`,
      description,
      type: 'profile',
      url: `https://getpoli.app/politicians/${slug}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.name} - ${data.title}`,
      images: [ogUrl],
    },
  }
}

export default async function PoliticianPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createServiceRoleClient()
  const { data, error: politicianError } = await supabase.from('politicians').select('*').eq('slug', slug).single()
  if (politicianError) console.error('Failed to fetch politician:', politicianError.message)

  if (!data) notFound()

  const pol = data as Politician

  // Run all queries in parallel for performance
  const [stancesResult, committeeResult, votingResult, financeResult, electionResult, newsArticles, candidacies] = await Promise.all([
    supabase.from('politician_issues').select('politician_id, issue_id, stance, is_verified, summary, source_url, issues:issue_id(id, name, slug, icon, category)').eq('politician_id', pol.id).order('created_at'),
    supabase.from('politician_committees').select('role, committees:committee_id(id, name, slug, chamber)').eq('politician_id', pol.id),
    supabase.from('voting_records').select('id, bill_name, bill_number, bill_id, vote, vote_date').eq('politician_id', pol.id).order('vote_date', { ascending: false }),
    supabase.from('campaign_finance').select('id, politician_id, cycle, total_raised, total_spent, cash_on_hand, source, last_updated').eq('politician_id', pol.id).order('cycle', { ascending: false }).limit(10),
    supabase.from('election_results').select('id, politician_id, election_year, state, chamber, district, race_name, party, result, vote_percentage, total_votes, opponent_name, opponent_party, opponent_vote_percentage').eq('politician_id', pol.id).order('election_year', { ascending: false }).limit(20),
    getCachedNews(pol.name),
    candidacyFor(supabase, [{ id: pol.id, state: pol.state, chamber: pol.chamber, district: pol.district ?? null }]),
  ])

  const politicianStances = (stancesResult.data ?? []) as any as PoliticianStanceRow[]
  const committees = (committeeResult.data ?? []) as any as CommitteeMembershipRow[]
  const votingRecords = (votingResult.data ?? []) as any as VotingRecordRow[]
  const financeRecords = (financeResult.data ?? []) as any as CampaignFinanceRow[]
  const electionResults = (electionResult.data ?? []) as any as ElectionResultRow[]
  const candidacy = candidacies.get(pol.id) ?? null

  // The race the candidacy refers to: who else is running in it, and when.
  let opponents: Opponent[] = []
  let electionDate: string | null = null
  if (candidacy?.raceSlug) {
    const { data: race } = await supabase
      .from('races')
      .select('id, elections:election_id(election_date), candidates(name, party, status, politician_id)')
      .eq('slug', candidacy.raceSlug)
      .maybeSingle()
    const r = race as any
    electionDate = r?.elections?.election_date ?? null
    opponents = ((r?.candidates ?? []) as Array<{ name: string; party: string; status: string; politician_id: string | null }>)
      .filter((c) => c.status === 'running' && c.politician_id !== pol.id)
      .map((c) => ({ name: c.name, party: c.party }))
  }
  const c = electionDate ? countdown(electionDate) : null

  // Compute party alignment score
  const alignmentScore = computeAlignment(pol.party, politicianStances)

  const issueCatalogSize = await getIssueCatalogSize()

  const verifiedCount = politicianStances.filter((s: any) => s.is_verified).length
  const reportCard = computeReportCard({
    party: pol.party,
    chamber: pol.chamber,
    stances: politicianStances,
    votingRecords: votingRecords.map((v: any) => ({ vote: v.vote })),
    committees: committees.map((cm: any) => ({ role: cm.role })),
    verifiedStances: verifiedCount,
    totalStances: politicianStances.length,
    issueCount: issueCatalogSize ?? undefined,
  })

  // Build stance map for this politician: issue_id -> stance
  const stanceMap = new Map<string, string>()
  for (const s of politicianStances) {
    if (s.issues?.id) stanceMap.set(s.issues.id, s.stance)
  }

  // Find like-minded officials: compare same-party + same-chamber for speed
  let likeMinded: LikeMindedPolitician[] = []
  if (stanceMap.size > 0) {
    const { data: sameParyPols } = await supabase
      .from('politicians')
      .select('id')
      .eq('party', pol.party)
      .eq('chamber', pol.chamber)
      .neq('id', pol.id)
      .limit(50)

    if (sameParyPols && sameParyPols.length > 0) {
      const samePartyIds = sameParyPols.map(p => p.id)
      const { data: partyStances } = await supabase
        .from('politician_issues')
        .select('politician_id, stance, issue_id')
        .in('politician_id', samePartyIds)
        .limit(1000)

      if (partyStances && partyStances.length > 0) {
        const byPol = new Map<string, Map<string, string>>()
        for (const row of partyStances as ComparisonStanceRow[]) {
          if (!byPol.has(row.politician_id)) byPol.set(row.politician_id, new Map())
          byPol.get(row.politician_id)!.set(row.issue_id, row.stance)
        }

        const scores: { id: string; overlap: number }[] = []
        for (const [pid, otherMap] of byPol) {
          let matched = 0, total = 0
          for (const [issueId, stance] of stanceMap) {
            const other = otherMap.get(issueId)
            if (!other) continue
            total++
            if (stance === other) matched += 1.0
            else if (
              (stance === 'mixed' && (other === 'supports' || other === 'opposes')) ||
              ((stance === 'supports' || stance === 'opposes') && other === 'mixed')
            ) matched += 0.4
          }
          if (total >= 5) scores.push({ id: pid, overlap: Math.round((matched / total) * 100) })
        }

        scores.sort((a, b) => b.overlap - a.overlap)
        const topIds = scores.slice(0, 6).map(s => s.id)

        if (topIds.length > 0) {
          const { data: topPols } = await supabase
            .from('politicians')
            .select('id, name, slug, party, state, chamber, image_url')
            .in('id', topIds)

          if (topPols) {
            const scoreMap = new Map(scores.map(s => [s.id, s.overlap]))
            likeMinded = (topPols as any as LikeMindedPoliticianRow[])
              .map(p => ({ ...p, overlap: scoreMap.get(p.id) ?? 0 }))
              .sort((a, b) => b.overlap - a.overlap)
          }
        }
      }
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: pol.name,
    jobTitle: pol.title,
    description: pol.bio,
    image: pol.image_url,
    url: `https://getpoli.app/politicians/${pol.slug}`,
    memberOf: {
      '@type': 'Organization',
      name: pol.party === 'democrat' ? 'Democratic Party' : pol.party === 'republican' ? 'Republican Party' : pol.party === 'green' ? 'Green Party' : 'Independent',
    },
    workLocation: {
      '@type': 'Place',
      name: pol.state,
    },
    sameAs: [
      pol.website_url,
      pol.twitter_url,
      pol.facebook_url,
      pol.instagram_url,
      pol.youtube_url,
      pol.wiki_url,
    ].filter(Boolean),
  }

  const lastName = pol.name.trim().split(/\s+/).pop() ?? pol.name

  return (
    <AppShell>
      <PageViewTracker event="politician_viewed" data={{ slug, party: pol.party, chamber: pol.chamber, state: pol.state }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-[560px] px-4 pt-3">
        <div className="-mb-4">
          <BackButton />
        </div>

        <ProfileHero
          pol={{
            id: pol.id,
            name: pol.name,
            slug: pol.slug,
            party: pol.party,
            state: pol.state,
            chamber: pol.chamber,
            district: pol.district ?? null,
            title: pol.title,
            image_url: pol.image_url,
            website_url: pol.website_url,
          }}
          candidacy={candidacy}
          electionDate={c?.bare ?? null}
        />

        {/* Appointed disclaimer for cabinet members */}
        {pol.chamber === 'presidential' &&
          pol.title !== 'President of the United States' &&
          pol.title !== 'Vice President of the United States' && (
          <p className="mb-3 rounded-2xl border border-[var(--poli-border)] bg-[var(--poli-card)] px-4 py-3 text-[13px] leading-[1.5] text-[var(--poli-sub)]">
            <span className="font-semibold text-[var(--poli-text)]">Appointed, not elected.</span> {pol.name} was appointed to serve as {pol.title}.
          </p>
        )}

        <ElectionCard
          name={pol.name}
          candidacy={candidacy}
          days={c?.days ?? null}
          when={c?.short ?? null}
          opponents={opponents}
        />

        <MoneyCard records={financeRecords as any} name={pol.name} />

        <StancesCard stances={politicianStances as any} />

        <VotesCard votes={votingRecords as any} pronoun={`${lastName}’s`} />

        <MoreSection
          pol={{
            id: pol.id,
            name: pol.name,
            slug: pol.slug,
            party: pol.party,
            since_year: pol.since_year,
            website_url: pol.website_url,
            wiki_url: pol.wiki_url,
            donate_url: pol.donate_url,
            twitter_url: pol.twitter_url,
            facebook_url: pol.facebook_url,
            instagram_url: pol.instagram_url,
            youtube_url: pol.youtube_url,
          }}
          alignmentScore={alignmentScore}
          stances={politicianStances as any}
          committees={committees as any}
          votingRecords={votingRecords as any}
          electionResults={electionResults as any}
          reportCard={reportCard as any}
          likeMinded={likeMinded}
          newsArticles={newsArticles}
        />
      </div>
    </AppShell>
  )
}
