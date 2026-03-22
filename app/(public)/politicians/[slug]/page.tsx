import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { createClient as createServerAuthClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PartyPill } from '@/components/directory/party-pill'
import { PartyIcon } from '@/components/icons/party-icons'
import { partyColor } from '@/lib/constants/parties'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { FollowButton } from '@/components/directory/follow-button'
import { LikeButton } from '@/components/directory/like-button'
export const revalidate = 600 // 10 minutes

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
import { IssueIcon } from '@/components/icons/issue-icon'
import { computeAlignment } from '@/lib/utils/alignment'
import { AlignmentGauge } from '@/components/politicians/alignment-gauge'
import { LikeMinded, type LikeMindedPolitician } from '@/components/politicians/like-minded'
import { StanceDeviation } from '@/components/politicians/stance-deviation'
import { PoliticianReportCard } from '@/components/politicians/report-card'
import { computeReportCard } from '@/lib/utils/report-card'
import { AccountabilityScore } from '@/components/politicians/accountability-score'
import { VotingHistory } from '@/components/politicians/voting-history'
import { CampaignFinance } from '@/components/politicians/campaign-finance'
import { ElectionHistory } from '@/components/politicians/election-history'
import { stanceStyle } from '@/lib/utils/stances'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.from('politicians').select('name, title, party, state, bio').eq('slug', slug).single()
  if (error) console.error('Failed to fetch politician metadata:', error.message)

  if (!data) return { title: 'Not Found -- Codex' }

  const description = data.bio?.slice(0, 160) || `${data.title} from ${data.state}`
  const ogUrl = `/api/og?title=${encodeURIComponent(data.name)}&subtitle=${encodeURIComponent(data.title)}&party=${data.party}&type=politician`

  return {
    title: `${data.name} - ${data.title} | Codex`,
    description,
    openGraph: {
      title: `${data.name} - ${data.title}`,
      description,
      type: 'profile',
      url: `https://codexapp.org/politicians/${slug}`,
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
      <span className="font-serif text-base" style={{ color: accent || 'var(--codex-faint)' }}>
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
  const [stancesResult, committeeResult, votingResult, financeResult, electionResult] = await Promise.all([
    supabase.from('politician_issues').select('*, issues:issue_id(id, name, slug, icon, category)').eq('politician_id', pol.id).order('created_at'),
    supabase.from('politician_committees').select('role, committees:committee_id(id, name, slug, chamber)').eq('politician_id', pol.id),
    supabase.from('voting_records').select('id, bill_name, bill_number, bill_id, vote, vote_date').eq('politician_id', pol.id).order('vote_date', { ascending: false }),
    supabase.from('campaign_finance').select('*').eq('politician_id', pol.id).order('cycle', { ascending: false }),
    supabase.from('election_results').select('*').eq('politician_id', pol.id).order('election_year', { ascending: false }),
  ])

  const politicianStances = (stancesResult.data ?? []) as any as PoliticianStanceRow[]
  const committees = (committeeResult.data ?? []) as any as CommitteeMembershipRow[]
  const votingRecords = (votingResult.data ?? []) as any as VotingRecordRow[]
  const financeRecords = (financeResult.data ?? []) as any as CampaignFinanceRow[]
  const electionResults = (electionResult.data ?? []) as any as ElectionResultRow[]

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

  // Find like-minded officials: only compare same-party politicians for speed
  let likeMinded: LikeMindedPolitician[] = []
  if (stanceMap.size > 0) {
    // Fetch stances for same-party politicians only (much smaller dataset)
    const { data: sameParyPols } = await supabase
      .from('politicians')
      .select('id')
      .eq('party', pol.party)
      .neq('id', pol.id)
      .limit(200)

    if (sameParyPols && sameParyPols.length > 0) {
      const samePartyIds = sameParyPols.map(p => p.id)
      const { data: partyStances } = await supabase
        .from('politician_issues')
        .select('politician_id, stance, issue_id')
        .in('politician_id', samePartyIds)

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
    url: `https://codexapp.org/politicians/${pol.slug}`,
    affiliation: {
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
      pol.youtube_url,
      pol.wiki_url,
    ].filter(Boolean),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--codex-sub)] transition-colors hover:text-[var(--codex-text)]"
        >
          &larr; Back to directory
        </Link>

        <div className="grid gap-10 md:grid-cols-[340px_1fr]">
          {/* Image -- large on desktop, hidden on mobile */}
          <div className="relative hidden overflow-hidden rounded-xl md:block">
            {pol.image_url ? (
              <Image
                src={pol.image_url}
                alt={pol.name}
                width={300}
                height={400}
                unoptimized
                className="aspect-[3/4] w-full object-cover object-top"
                style={{ filter: 'grayscale(20%)' }}
              />
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center bg-[var(--codex-card)] font-serif text-[120px] text-[var(--codex-text)] opacity-10" aria-hidden="true">
                {pol.name.charAt(0)}
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
                    style={{ filter: 'grayscale(20%)' }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-serif text-[64px] text-[var(--codex-text)] opacity-20" aria-hidden="true">
                    {pol.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <PartyPill party={pol.party} size="lg" />
                <h1 className="mt-1.5 font-serif text-[28px] font-normal leading-[1.05]">
                  {pol.name}
                </h1>
              </div>
            </div>

            {/* Desktop: party pill + name */}
            <div className="mb-3 hidden md:block">
              <PartyPill party={pol.party} size="lg" />
            </div>
            <h1 className="mb-4 hidden font-serif text-[38px] font-normal leading-[1.05] md:block">
              {pol.name}
            </h1>

            <div className="mb-7 flex flex-wrap items-center gap-3">
              <FollowButton politicianId={pol.id} />
              <LikeButton politicianId={pol.id} />
              <Link
                href={`/compare?a=${pol.slug}`}
                className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--codex-border)] px-3.5 text-[12px] font-medium text-[var(--codex-sub)] transition-all hover:border-[var(--codex-input-focus)] hover:text-[var(--codex-text)]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Compare
              </Link>
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
            <div className="mb-9 grid grid-cols-2 gap-2.5">
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

            {/* Stats grid */}
            <div className="border-t border-[var(--codex-border)] pt-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  ['State', pol.state],
                  ['Chamber', CHAMBER_LABELS[pol.chamber as ChamberKey] ?? pol.chamber],
                  ['Since', pol.since_year?.toString() ?? '--'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-1 text-[11px] uppercase tracking-[0.1em] text-[var(--codex-sub)]">
                      {label}
                    </div>
                    <div className="font-serif text-xl">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Party Alignment Gauge */}
            {alignmentScore >= 0 && (
              <div className="mt-8 border-t border-[var(--codex-border)] pt-6">
                <AlignmentGauge score={alignmentScore} party={pol.party} />
              </div>
            )}

            {/* Report Card — auth-gated */}
            <div className="mt-8 border-t border-[var(--codex-border)] pt-6">
              {isAuthenticated ? (
                <PoliticianReportCard
                  {...reportCard}
                  stanceCount={politicianStances.length}
                  voteCount={votingRecords.length}
                  committeeCount={committees.length}
                  yearsInOffice={pol.since_year ? new Date().getFullYear() - pol.since_year : undefined}
                />
              ) : (
                <div className="rounded-lg border border-[var(--codex-border)] bg-[var(--codex-card)] p-6 text-center">
                  <h3 className="mb-2 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
                    Report Card
                  </h3>
                  <div className="mb-3 font-serif text-lg text-[var(--codex-text)]">
                    Sign up to see the full report card
                  </div>
                  <p className="mb-4 text-[13px] text-[var(--codex-faint)]">
                    Get detailed scores on bipartisanship, transparency, and effectiveness
                  </p>
                  <Link
                    href="/signup"
                    className="inline-block rounded-md bg-[var(--codex-text)] px-5 py-2 text-[13px] font-medium text-[var(--codex-card)] no-underline transition-opacity hover:opacity-90"
                  >
                    Create Free Account
                  </Link>
                </div>
              )}
            </div>

            {/* Breaks from Party Line */}
            <StanceDeviation party={pol.party} stances={politicianStances as any} />

            {/* Like-Minded Officials */}
            <LikeMinded politicians={likeMinded} />

            {/* Committee Memberships */}
            {committees.length > 0 && (
              <div className="mt-8 border-t border-[var(--codex-border)] pt-6">
                <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
                  Committee Memberships
                </h2>
                <div className="space-y-2">
                  {committees.map((cm, i) => {
                    const roleLabels: Record<string, { label: string; style: string }> = {
                      chair: { label: 'Chair', style: 'text-green-400 bg-green-500/10' },
                      ranking_member: { label: 'Ranking Member', style: 'text-blue-400 bg-blue-500/10' },
                      member: { label: 'Member', style: 'text-[var(--codex-faint)] bg-[var(--codex-badge-bg)]' },
                    }
                    const r = roleLabels[cm.role] ?? roleLabels.member
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-md border border-[var(--codex-border)] px-4 py-2.5"
                      >
                        <span className="text-[13px] text-[var(--codex-text)]">
                          {cm.committees?.name}
                        </span>
                        <span className={`rounded-sm px-2 py-0.5 text-[11px] uppercase tracking-[0.06em] ${r.style}`}>
                          {r.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Issues & Stances */}
            {politicianStances.length > 0 && (
              <div className="mt-8 border-t border-[var(--codex-border)] pt-6">
                <h2 className="mb-1 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
                  Issues & Stances
                </h2>
                <p className="mb-4 text-[11px] text-[var(--codex-faint)]">
                  Positions based on voting record, public statements, and party platform
                </p>
                <div className="space-y-2">
                  {politicianStances.map((s) => {
                    const sc = stanceStyle(s.stance)
                    const isEstimated = !s.is_verified
                    const hasRealSummary = s.summary && !s.summary.includes('key aspects') && !s.summary.includes('Estimated position') && !s.summary.includes('generally been')
                    return (
                      <div
                        key={s.id}
                        className="overflow-hidden rounded-lg border border-[var(--codex-border)]"
                        style={{ borderLeftWidth: '3px', borderLeftColor: sc.color }}
                      >
                        <div className="px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <Link
                              href={`/issues/${s.issues?.slug}`}
                              className="flex items-center gap-2 text-[14px] font-medium hover:text-[var(--codex-text)]"
                            >
                              {s.issues?.icon && <IssueIcon icon={s.issues.icon} size={15} className="text-[var(--codex-sub)]" />}
                              {s.issues?.name}
                            </Link>
                            <div className="flex shrink-0 items-center gap-2">
                              {isEstimated && (
                                <span className="rounded bg-[var(--codex-badge-bg)] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[var(--codex-faint)]" title="Based on party platform — not yet verified">
                                  Est.
                                </span>
                              )}
                              <span
                                className="rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em]"
                                style={{ color: sc.color, backgroundColor: `${sc.color}15` }}
                              >
                                {sc.label}
                              </span>
                            </div>
                          </div>
                          {hasRealSummary && (
                            <p className="mt-2 text-[13px] leading-[1.6] text-[var(--codex-sub)]">{s.summary}</p>
                          )}
                          {isEstimated && !hasRealSummary && (
                            <p className="mt-1.5 text-[11px] italic text-[var(--codex-faint)]">Estimated from party affiliation — not yet verified</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Voting Record */}
            {/* Votes vs Stances */}
            <AccountabilityScore
              votes={votingRecords.map((v: any) => ({ bill_name: v.bill_name, bill_number: v.bill_number, vote: v.vote }))}
              stances={politicianStances as any}
            />

            <VotingHistory votes={votingRecords} />

            {/* Campaign Finance */}
            <CampaignFinance records={financeRecords} party={pol.party} />

            {/* Election History */}
            <ElectionHistory results={electionResults as any} party={pol.party} />
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}
