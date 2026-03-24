'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { partyColor } from '@/lib/constants/parties'
import { stanceBucket, stanceDisplayBadge } from '@/lib/utils/stances'
import { IssueIcon } from '@/components/icons/issue-icon'
import { YourAlignment } from '@/components/politicians/your-alignment'
import { AlignmentGauge } from '@/components/politicians/alignment-gauge'
import { StanceDeviation } from '@/components/politicians/stance-deviation'
import { LikeMinded, type LikeMindedPolitician } from '@/components/politicians/like-minded'
import { AccountabilityScore } from '@/components/politicians/accountability-score'
import { VotingHistory } from '@/components/politicians/voting-history'
import { CampaignFinance } from '@/components/politicians/campaign-finance'
import { ElectionHistory } from '@/components/politicians/election-history'
import { PoliticianReportCard } from '@/components/politicians/report-card'
import { AskYourRep } from '@/components/politicians/ask-your-rep'
import { StanceTimeline } from '@/components/politicians/stance-timeline'
import { StanceTimelineToggle } from '@/components/politicians/stance-timeline-toggle'
import { getStanceContext } from '@/lib/data/educational-content'
import { InTheNews } from '@/components/politicians/in-the-news'
import type { NewsArticle } from '@/lib/utils/news'

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

const TABS = ['overview', 'stances', 'voting', 'finance', 'elections', 'news'] as const
type TabKey = (typeof TABS)[number]

const TAB_LABELS: Record<TabKey, string> = {
  overview: 'Overview',
  stances: 'Stances',
  voting: 'Voting Record',
  finance: 'Campaign Finance',
  elections: 'Election History',
  news: 'In the News',
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface PoliticianStance {
  id?: string
  issue_id?: string
  stance: string
  summary: string | null
  source_url: string | null
  is_verified: boolean | null
  issues?: {
    id: string
    name: string
    slug: string
    icon: string | null
    category?: string | null
  } | null
}

interface Committee {
  role: string
  committees?: { id: string; name: string; slug: string; chamber: string } | null
}

interface VoteRecord {
  [key: string]: any
}

interface FinanceRecord {
  [key: string]: any
}

interface ElectionResult {
  id?: string
  politician_id?: string
  election_year: number
  state: string
  chamber: string
  district?: string | null
  race_name: string
  party: string
  result: string
  vote_percentage: number
  total_votes: number
  opponent_name?: string | null
  opponent_party?: string | null
  opponent_vote_percentage?: number | null
}

interface ReportCardData {
  [key: string]: any
}

interface StanceHistoryEntry {
  id: string
  issue_id: string
  stance: string
  effective_date: string | null
  source_url: string | null
  source_description: string | null
}

export interface ProfileTabsProps {
  politician: {
    id: string
    name: string
    slug: string
    party: string
    state: string
    chamber: string
    title: string
    image_url: string | null
    website_url: string | null
    twitter_url?: string | null
    facebook_url?: string | null
    since_year?: number | null
  }
  isAuthenticated: boolean
  alignmentScore: number
  stances: PoliticianStance[]
  stanceHistoryByIssue: Record<string, StanceHistoryEntry[]>
  committees: Committee[]
  votingRecords: VoteRecord[]
  financeRecords: FinanceRecord[]
  electionResults: ElectionResult[]
  reportCard: ReportCardData
  likeMinded: LikeMindedPolitician[]
  newsArticles?: NewsArticle[]
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ProfileTabs({
  politician: pol,
  isAuthenticated,
  alignmentScore,
  stances,
  stanceHistoryByIssue,
  committees,
  votingRecords,
  financeRecords,
  electionResults,
  reportCard,
  likeMinded,
  newsArticles = [],
}: ProfileTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const rawTab = searchParams.get('tab') ?? 'overview'
  const activeTab: TabKey = (TABS as readonly string[]).includes(rawTab)
    ? (rawTab as TabKey)
    : 'overview'

  function switchTab(tab: TabKey) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (tab === 'overview') {
        params.delete('tab')
      } else {
        params.set('tab', tab)
      }
      router.replace(`?${params.toString()}`, { scroll: false })
    })
  }

  // Filter tabs: hide tabs with no data
  const visibleTabs = TABS.filter((t) => {
    if (t === 'overview') return true // always show
    if (t === 'stances') return stances.length > 0
    if (t === 'voting') return votingRecords.length > 0
    if (t === 'finance') return financeRecords.length > 0
    if (t === 'elections') return electionResults.length > 0
    if (t === 'news') return newsArticles.length > 0
    return true
  })

  return (
    <>
      {/* ── Tab Bar ── */}
      <div
        className="sticky top-[60px] z-30 border-b border-[var(--codex-border)] bg-[var(--codex-bg)]"
        role="tablist"
        aria-label="Profile sections"
      >
        {/* Mobile: pill scroller */}
        <div className="flex gap-2 overflow-x-auto pb-2 pt-2 sm:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleTabs.map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              role="tab"
              aria-selected={activeTab === t}
              className={cn(
                'flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-all',
                activeTab === t
                  ? 'bg-[var(--codex-text)] text-[var(--codex-bg)]'
                  : 'bg-[var(--codex-badge-bg)] text-[var(--codex-sub)]'
              )}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Desktop: underline tabs */}
        <div className="hidden min-w-max gap-0 sm:flex">
          {visibleTabs.map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              role="tab"
              aria-selected={activeTab === t}
              className={cn(
                'whitespace-nowrap border-b-2 px-4 py-3 font-sans text-[13px] transition-all sm:px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--codex-input-focus)]',
                activeTab === t
                  ? 'border-[var(--codex-text)] font-semibold text-[var(--codex-text)]'
                  : 'border-transparent font-normal text-[var(--codex-faint)] hover:text-[var(--codex-sub)]'
              )}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <OverviewTab
            pol={pol}
            isAuthenticated={isAuthenticated}
            alignmentScore={alignmentScore}
            stances={stances}
            reportCard={reportCard}
            votingRecords={votingRecords}
            committees={committees}
            likeMinded={likeMinded}
          />
        )}
        {activeTab === 'stances' && (
          <StancesTab
            pol={pol}
            stances={stances}
            stanceHistoryByIssue={stanceHistoryByIssue}
            committees={committees}
          />
        )}
        {activeTab === 'voting' && (
          <VotingTab
            stances={stances}
            votingRecords={votingRecords}
          />
        )}
        {activeTab === 'finance' && (
          <FinanceTab
            financeRecords={financeRecords}
            party={pol.party}
          />
        )}
        {activeTab === 'elections' && (
          <ElectionTab
            electionResults={electionResults}
            party={pol.party}
          />
        )}
        {activeTab === 'news' && (
          <InTheNews articles={newsArticles} politicianName={pol.name} party={pol.party} />
        )}
      </div>
    </>
  )
}

/* ================================================================== */
/*  Overview Tab                                                       */
/* ================================================================== */

function OverviewTab({
  pol,
  isAuthenticated,
  alignmentScore,
  stances,
  reportCard,
  votingRecords,
  committees,
  likeMinded,
}: {
  pol: ProfileTabsProps['politician']
  isAuthenticated: boolean
  alignmentScore: number
  stances: PoliticianStance[]
  reportCard: ReportCardData
  votingRecords: VoteRecord[]
  committees: Committee[]
  likeMinded: LikeMindedPolitician[]
}) {
  const verifiedCount = stances.filter((s) => s.is_verified).length

  return (
    <div className="space-y-0">
      {/* Your Alignment */}
      <YourAlignment
        politicianName={pol.name}
        politicianSlug={pol.slug}
        politicianStances={stances.map((s) => ({
          issue_slug: s.issues?.slug ?? '',
          issue_name: s.issues?.name ?? '',
          stance: s.stance,
          is_verified: s.is_verified === true,
        }))}
      />

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
            {...(reportCard as any)}
            stanceCount={stances.length}
            voteCount={votingRecords.length}
            committeeCount={committees.length}
            yearsInOffice={pol.since_year ? new Date().getFullYear() - pol.since_year : undefined}
          />
        ) : (
          <div className="relative overflow-hidden rounded-lg border border-[var(--codex-border)]">
            <div className="pointer-events-none select-none" aria-hidden="true" style={{ filter: 'blur(6px)' }}>
              <PoliticianReportCard
                {...(reportCard as any)}
                stanceCount={stances.length}
                voteCount={votingRecords.length}
                committeeCount={committees.length}
                yearsInOffice={pol.since_year ? new Date().getFullYear() - pol.since_year : undefined}
              />
            </div>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              style={{
                background: `linear-gradient(180deg, transparent 0%, var(--codex-card) 40%, var(--codex-card) 100%)`,
              }}
            >
              <div
                className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: `${partyColor(pol.party)}15`, color: partyColor(pol.party) }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="mb-1.5 text-[18px] font-bold text-[var(--codex-text)]">
                Civic Profile
              </h3>
              <p className="mb-5 max-w-[320px] text-[13px] leading-[1.6] text-[var(--codex-sub)]">
                Unlock detailed scores on bipartisanship, transparency, engagement, and effectiveness
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-[14px] font-semibold text-white no-underline shadow-lg transition-all hover:scale-[1.02] hover:bg-blue-700 hover:shadow-xl"
              >
                Create Free Account
              </Link>
              <p className="mt-3 text-[11px] text-[var(--codex-faint)]">
                Free forever. No credit card required.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Breaks from Party Line */}
      <StanceDeviation party={pol.party} stances={stances as any} />

      {/* Like-Minded Officials */}
      <LikeMinded politicians={likeMinded} />
    </div>
  )
}

/* ================================================================== */
/*  Stances Tab                                                        */
/* ================================================================== */

function StancesTab({
  pol,
  stances,
  stanceHistoryByIssue,
  committees,
}: {
  pol: ProfileTabsProps['politician']
  stances: PoliticianStance[]
  stanceHistoryByIssue: Record<string, StanceHistoryEntry[]>
  committees: Committee[]
}) {
  const grouped = {
    favors: stances.filter((s) => stanceBucket(s.stance) === 'supports'),
    mixed: stances.filter((s) => ['neutral', 'mixed'].includes(stanceBucket(s.stance))),
    opposes: stances.filter((s) => stanceBucket(s.stance) === 'opposes'),
  }

  return (
    <div>
      {/* Committee Memberships */}
      {committees.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
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

      {/* Stances grouped by bucket */}
      {stances.length > 0 ? (
        <div className="space-y-6">
          {grouped.favors.length > 0 && (
            <StanceGroup
              label="Favors"
              count={grouped.favors.length}
              stances={grouped.favors}
              stanceHistoryByIssue={stanceHistoryByIssue}
              accentColor="#047857"
              party={pol.party}
            />
          )}
          {grouped.mixed.length > 0 && (
            <StanceGroup
              label="Mixed / Neutral"
              count={grouped.mixed.length}
              stances={grouped.mixed}
              stanceHistoryByIssue={stanceHistoryByIssue}
              accentColor="#B45309"
              party={pol.party}
            />
          )}
          {grouped.opposes.length > 0 && (
            <StanceGroup
              label="Opposes"
              count={grouped.opposes.length}
              stances={grouped.opposes}
              stanceHistoryByIssue={stanceHistoryByIssue}
              accentColor="#B91C1C"
              party={pol.party}
            />
          )}
        </div>
      ) : (
        <p className="text-[13px] text-[var(--codex-faint)]">No stance data available yet.</p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Stance Group (collapsible accordion section)                       */
/* ------------------------------------------------------------------ */

function StanceGroup({
  label,
  count,
  stances,
  stanceHistoryByIssue,
  accentColor,
  party,
}: {
  label: string
  count: number
  stances: PoliticianStance[]
  stanceHistoryByIssue: Record<string, StanceHistoryEntry[]>
  accentColor: string
  party: string
}) {
  const [expanded, setExpanded] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  function toggleItem(id: string) {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mb-3 flex w-full items-center gap-2 text-left"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            'text-[var(--codex-faint)] transition-transform',
            expanded ? 'rotate-90' : 'rotate-0'
          )}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="text-[13px] font-semibold" style={{ color: accentColor }}>
          {label}
        </span>
        <span className="text-[12px] text-[var(--codex-faint)]">({count})</span>
      </button>

      {expanded && (
        <div className="space-y-2">
          {stances.map((s) => {
            const badge = stanceDisplayBadge(s.stance, party)
            const isEstimated = !s.is_verified
            const hasRealSummary =
              s.summary &&
              !s.summary.includes('key aspects') &&
              !s.summary.includes('Estimated position') &&
              !s.summary.includes('generally been')
            const itemKey = s.issues?.id ?? s.issues?.slug ?? s.stance
            const isOpen = expandedItems.has(itemKey)
            const issueHistory = s.issues?.id ? (stanceHistoryByIssue[s.issues.id] ?? []) : []
            const hasSummaryContent = hasRealSummary || isEstimated || (s.issues?.slug && getStanceContext(s.issues.slug, s.stance))

            return (
              <div
                key={itemKey}
                className="overflow-hidden rounded-xl border border-[var(--codex-border)] transition-all duration-200 hover:shadow-sm"
                style={{ backgroundColor: `${badge.color}06` }}
              >
                <button
                  onClick={() => hasSummaryContent && toggleItem(itemKey)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left',
                    hasSummaryContent && 'cursor-pointer'
                  )}
                >
                  <span className="flex items-center gap-2.5 text-[14px] font-medium text-[var(--codex-text)]">
                    {s.issues?.icon && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${badge.color}10` }}>
                        <IssueIcon icon={s.issues.icon} size={15} className="text-[var(--codex-sub)]" />
                      </span>
                    )}
                    {s.issues?.name}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    {isEstimated && (
                      <span className="rounded-full bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[9px] uppercase tracking-wider text-[var(--codex-faint)]">
                        Est.
                      </span>
                    )}
                    <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] border" style={badge.style}>
                      {badge.label}
                    </span>
                    {hasSummaryContent && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={cn(
                          'text-[var(--codex-faint)] transition-transform',
                          isOpen ? 'rotate-180' : 'rotate-0'
                        )}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-[var(--codex-border)] px-4 py-3">
                    {hasRealSummary && (
                      <p className="text-[13px] leading-[1.6] text-[var(--codex-sub)]">{s.summary}</p>
                    )}
                    {isEstimated && !hasRealSummary && (
                      <p className="text-[11px] italic text-[var(--codex-faint)]">
                        Estimated from party affiliation — not yet verified
                      </p>
                    )}
                    {!hasRealSummary && s.issues?.slug && getStanceContext(s.issues.slug, s.stance) && (
                      <p className="mt-1 text-[11px] leading-[1.5] text-[var(--codex-faint)]">
                        {getStanceContext(s.issues.slug, s.stance)}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {s.issues?.slug && (
                        <Link
                          href={`/issues/${s.issues.slug}`}
                          className="inline-block text-[12px] text-blue-500 hover:underline"
                        >
                          View all positions on {s.issues.name} &rarr;
                        </Link>
                      )}
                      {s.source_url && (
                        <a
                          href={s.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[var(--codex-faint)] hover:text-[var(--codex-sub)]"
                        >
                          Source
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      )}
                    </div>
                    {/* Stance change timeline */}
                    <StanceTimelineToggle hasHistory={issueHistory.length > 0}>
                      <StanceTimeline
                        entries={issueHistory.map((h) => ({
                          stance: h.stance,
                          effective_date: h.effective_date,
                          source_url: h.source_url,
                          source_description: h.source_description,
                        }))}
                        currentStance={s.stance}
                        issueName={s.issues?.name ?? 'this issue'}
                      />
                    </StanceTimelineToggle>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  Voting Tab                                                         */
/* ================================================================== */

function VotingTab({
  stances,
  votingRecords,
}: {
  stances: PoliticianStance[]
  votingRecords: VoteRecord[]
}) {
  return (
    <div>
      <AccountabilityScore
        votes={votingRecords.map((v) => ({
          bill_name: v.bill_name,
          bill_number: v.bill_number,
          vote: v.vote,
        }))}
        stances={stances as any}
      />
      <VotingHistory votes={votingRecords as any} />
    </div>
  )
}

/* ================================================================== */
/*  Finance Tab                                                        */
/* ================================================================== */

function FinanceTab({
  financeRecords,
  party,
}: {
  financeRecords: FinanceRecord[]
  party: string
}) {
  return <CampaignFinance records={financeRecords as any} party={party} />
}

/* ================================================================== */
/*  Elections Tab                                                      */
/* ================================================================== */

function ElectionTab({
  electionResults,
  party,
}: {
  electionResults: ElectionResult[]
  party: string
}) {
  return <ElectionHistory results={electionResults as any} party={party} />
}

