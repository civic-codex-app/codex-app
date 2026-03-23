import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { createClient as createServerAuthClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PartyIcon } from '@/components/icons/party-icons'
import { partyColor } from '@/lib/constants/parties'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { FollowButton } from '@/components/directory/follow-button'
import { LikeButton } from '@/components/directory/like-button'
import { BackButton } from '@/components/ui/back-button'
import { ProfileTabs } from '@/components/politicians/profile-tabs'
export const revalidate = 1800 // 30 minutes

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
import { ExportPdfButton } from '@/components/politicians/export-pdf-button'
import { PageViewTracker } from '@/components/analytics/page-view-tracker'
import { UpdatePoliticianButton } from '@/components/forms/update-politician-modal'

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
    openGraph: {
      title: `${data.name} - ${data.title}`,
      description,
      type: 'profile',
      url: `https://getpoli.com/politicians/${slug}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.name} - ${data.title}`,
      images: [ogUrl],
    },
  }
}

function LinkButton({
  href,
  label,
  icon,
  accent,
}: {
  href: string
  label: string
  icon: string
  accent?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-md border border-[var(--codex-border)] bg-[var(--codex-input-bg)] px-4 py-3 text-[13px] font-medium no-underline transition-all hover:bg-[var(--codex-hover)]"
      style={{ color: accent || 'var(--codex-sub)', borderColor: accent ? `${accent}33` : undefined }}
    >
      <span>{label}</span>
      <span className="text-base font-semibold" style={{ color: accent || 'var(--codex-faint)' }}>
        {icon}
      </span>
    </a>
  )
}

export default async function PoliticianPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createServiceRoleClient()
  const { data, error: politicianError } = await supabase.from('politicians').select('*').eq('slug', slug).single()
  if (politicianError) console.error('Failed to fetch politician:', politicianError.message)

  if (!data) notFound()

  const pol = data as Politician

  // Run all queries in parallel for performance
  const [stancesResult, committeeResult, votingResult, financeResult, electionResult, stanceHistoryResult] = await Promise.all([
    supabase.from('politician_issues').select('politician_id, issue_id, stance, is_verified, summary, source_url, issues:issue_id(id, name, slug, icon, category)').eq('politician_id', pol.id).order('created_at'),
    supabase.from('politician_committees').select('role, committees:committee_id(id, name, slug, chamber)').eq('politician_id', pol.id),
    supabase.from('voting_records').select('id, bill_name, bill_number, bill_id, vote, vote_date').eq('politician_id', pol.id).order('vote_date', { ascending: false }),
    supabase.from('campaign_finance').select('id, politician_id, cycle, total_raised, total_spent, cash_on_hand, source_url').eq('politician_id', pol.id).order('cycle', { ascending: false }).limit(10),
    supabase.from('election_results').select('id, politician_id, election_year, state, chamber, district, race_name, party, result, vote_percentage, total_votes, opponent_name, opponent_party, opponent_vote_percentage').eq('politician_id', pol.id).order('election_year', { ascending: false }).limit(20),
    supabase.from('stance_history').select('id, issue_id, stance, effective_date, source_url, source_description').eq('politician_id', pol.id).order('effective_date', { ascending: false }).limit(50),
  ])

  const politicianStances = (stancesResult.data ?? []) as any as PoliticianStanceRow[]
  const committees = (committeeResult.data ?? []) as any as CommitteeMembershipRow[]
  const votingRecords = (votingResult.data ?? []) as any as VotingRecordRow[]
  const financeRecords = (financeResult.data ?? []) as any as CampaignFinanceRow[]
  const electionResults = (electionResult.data ?? []) as any as ElectionResultRow[]
  const stanceHistory = (stanceHistoryResult.data ?? []) as Array<{
    id: string; issue_id: string; stance: string; effective_date: string | null;
    source_url: string | null; source_description: string | null
  }>

  // Build stance history map: issue_id -> entries[]
  const stanceHistoryByIssue = new Map<string, typeof stanceHistory>()
  for (const h of stanceHistory) {
    const list = stanceHistoryByIssue.get(h.issue_id) ?? []
    list.push(h)
    stanceHistoryByIssue.set(h.issue_id, list)
  }

  // Compute party alignment score
  const alignmentScore = computeAlignment(pol.party, politicianStances)

  // Check if user is authenticated (for gating report card)
  let isAuthenticated = false
  try {
    const authClient = await createServerAuthClient()
    const { data: { user } } = await authClient.auth.getUser()
    isAuthenticated = !!user
  } catch {}

  // Compute report card
  const verifiedCount = politicianStances.filter((s: any) => s.is_verified).length
  const reportCard = computeReportCard({
    party: pol.party,
    chamber: pol.chamber,
    stances: politicianStances,
    votingRecords: votingRecords.map((v: any) => ({ vote: v.vote })),
    committees: committees.map((c: any) => ({ role: c.role })),
    verifiedStances: verifiedCount,
    totalStances: politicianStances.length,
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

  const color = partyColor(pol.party)

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

  return (
    <>
      <PageViewTracker event="politician_viewed" data={{ slug, party: pol.party, chamber: pol.chamber, state: pol.state }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        <BackButton />

        <div className="grid gap-10 md:grid-cols-[340px_1fr]">
          {/* Image -- large on desktop, hidden on mobile */}
          <div className="relative hidden md:block">
            {pol.image_url ? (
              <Image
                src={pol.image_url}
                alt={pol.name}
                width={300}
                height={400}
                unoptimized
                className="aspect-[3/4] w-full rounded-xl object-cover object-top"
              />
            ) : (
              <div
                className="flex aspect-[3/4] w-full items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}08`, border: `2px solid ${color}22` }}
              >
                <PartyIcon party={pol.party} size={120} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0">
            {/* Mobile: large avatar + name row */}
            <div className="mb-5 flex items-center gap-4 md:hidden">
              <div
                className="h-40 w-40 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--codex-card)]"
                style={{ border: `2.5px solid ${color}44` }}
              >
                {pol.image_url ? (
                  <Image
                    src={pol.image_url}
                    alt={pol.name}
                    width={160}
                    height={160}
                    unoptimized
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ backgroundColor: `${color}08` }}
                  >
                    <PartyIcon party={pol.party} size={64} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                {pol.image_url && <PartyIcon party={pol.party} size={32} />}
                <h1 className={`text-[28px] font-bold leading-[1.05]${pol.image_url ? ' mt-1.5' : ''}`}>
                  {pol.name}
                </h1>
              </div>
            </div>

            {/* Desktop: party icon + name (only show icon if has photo) */}
            {pol.image_url && (
              <div className="mb-3 hidden md:block">
                <PartyIcon party={pol.party} size={40} />
              </div>
            )}
            <h1 className="mb-4 hidden text-[38px] font-serif font-bold leading-[1.05] md:block">
              {pol.name}
            </h1>

            <div className="mb-7 flex flex-wrap items-center gap-3 print:hidden">
              <FollowButton politicianId={pol.id} />
              <LikeButton politicianId={pol.id} />
              <Link
                href={`/compare?a=${pol.slug}`}
                className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--codex-border)] px-3.5 text-[12px] font-medium text-[var(--codex-sub)] transition-all hover:border-[var(--codex-input-focus)] hover:text-[var(--codex-text)]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Compare
              </Link>
              <ExportPdfButton />
              <UpdatePoliticianButton politicianId={pol.id} politicianName={pol.name} />
              {pol.twitter_url && (
                <a href={pol.twitter_url} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--codex-border)] text-[var(--codex-sub)] transition-all hover:border-[var(--codex-input-focus)] hover:text-[var(--codex-text)]" aria-label="X (Twitter)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
              {pol.facebook_url && (
                <a href={pol.facebook_url} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--codex-border)] text-[var(--codex-sub)] transition-all hover:border-[var(--codex-input-focus)] hover:text-[var(--codex-text)]" aria-label="Facebook">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
              {pol.instagram_url && (
                <a href={pol.instagram_url} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--codex-border)] text-[var(--codex-sub)] transition-all hover:border-[var(--codex-input-focus)] hover:text-[var(--codex-text)]" aria-label="Instagram">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
              {pol.youtube_url && (
                <a href={pol.youtube_url} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--codex-border)] text-[var(--codex-sub)] transition-all hover:border-[var(--codex-input-focus)] hover:text-[var(--codex-text)]" aria-label="YouTube">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              )}
            </div>

            {/* Links */}
            <div className="mb-9 grid grid-cols-2 gap-2.5 print:hidden">
              {pol.website_url && <LinkButton href={pol.website_url} label="Official Website" icon="→" />}
              {pol.wiki_url && <LinkButton href={pol.wiki_url} label="Wikipedia" icon="W" />}
              {pol.donate_url && (
                <LinkButton href={pol.donate_url} label="Donate" icon="$" accent={color} />
              )}
            </div>

            {/* Appointed disclaimer for cabinet members */}
            {pol.chamber === 'presidential' &&
              pol.title !== 'President of the United States' &&
              pol.title !== 'Vice President of the United States' && (
              <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[13px] text-[var(--codex-sub)]">
                <span className="mr-1.5 font-medium text-amber-600">Appointed Official</span>
                — This position is not elected. {pol.name} was appointed to serve as {pol.title}.
              </div>
            )}

            {/* Metadata line */}
            <div className="text-sm text-[var(--codex-sub)]">
              {[
                CHAMBER_LABELS[pol.chamber as ChamberKey] ?? pol.chamber,
                pol.state,
                pol.since_year ? `Since ${pol.since_year}` : null,
              ].filter(Boolean).join(' \u00b7 ')}
            </div>

            <ProfileTabs
              politician={{
                id: pol.id,
                name: pol.name,
                slug: pol.slug,
                party: pol.party,
                state: pol.state,
                chamber: pol.chamber,
                title: pol.title,
                image_url: pol.image_url,
                website_url: pol.website_url,
                twitter_url: pol.twitter_url,
                facebook_url: pol.facebook_url,
                since_year: pol.since_year,
              }}
              isAuthenticated={isAuthenticated}
              alignmentScore={alignmentScore}
              stances={politicianStances as any}
              stanceHistoryByIssue={Object.fromEntries(stanceHistoryByIssue)}
              committees={committees as any}
              votingRecords={votingRecords as any}
              financeRecords={financeRecords as any}
              electionResults={electionResults as any}
              reportCard={reportCard as any}
              likeMinded={likeMinded}
            />
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}
