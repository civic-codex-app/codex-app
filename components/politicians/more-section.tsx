'use client'

import Link from 'next/link'
import { Card, SectionLabel } from '@/components/app/surface'
import { Disclosure } from '@/components/app/disclosure'
import { useSessionUser } from '@/lib/hooks/use-session-user'
import { partyLabel } from '@/lib/constants/parties'
import { YourAlignment } from '@/components/politicians/your-alignment'
import { AlignmentGauge } from '@/components/politicians/alignment-gauge'
import { StanceDeviation } from '@/components/politicians/stance-deviation'
import { LikeMinded, type LikeMindedPolitician } from '@/components/politicians/like-minded'
import { ElectionHistory } from '@/components/politicians/election-history'
import { PoliticianReportCard } from '@/components/politicians/report-card'
import { InTheNews } from '@/components/politicians/in-the-news'
import { ExportPdfButton } from '@/components/politicians/export-pdf-button'
import { UpdatePoliticianButton } from '@/components/forms/update-politician-modal'
import type { NewsArticle } from '@/lib/utils/news'

/**
 * Everything the profile used to spread across six tabs, kept and hidden.
 *
 * The quiet profile shows four cards. These modules — the quiz-based
 * alignment, the party gauge, the civic profile, breaks from the party line,
 * like-minded officials, committees, election history, the news — are real
 * and some visitors use them, so each is one row that opens in place rather
 * than a tab that competes with the cards. A row with nothing behind it is
 * not rendered.
 */
export function MoreSection({
  pol,
  alignmentScore,
  stances,
  committees,
  votingRecords,
  electionResults,
  reportCard,
  likeMinded,
  newsArticles,
}: {
  pol: {
    id: string
    name: string
    slug: string
    party: string
    since_year?: number | null
    website_url: string | null
    wiki_url: string | null
    donate_url: string | null
    twitter_url: string | null
    facebook_url: string | null
    instagram_url: string | null
    youtube_url: string | null
  }
  alignmentScore: number
  stances: any[]
  committees: Array<{ role: string; committees?: { name: string } | null }>
  votingRecords: any[]
  electionResults: any[]
  reportCard: any
  likeMinded: LikeMindedPolitician[]
  newsArticles: NewsArticle[]
}) {
  const userId = useSessionUser()
  const signedIn = userId != null
  const sessionResolved = userId !== undefined
  const last = pol.name.trim().split(/\s+/).pop() ?? pol.name

  const links = [
    pol.website_url && { href: pol.website_url, label: 'Official website' },
    pol.wiki_url && { href: pol.wiki_url, label: 'Wikipedia' },
    pol.donate_url && { href: pol.donate_url, label: 'Donate' },
    pol.twitter_url && { href: pol.twitter_url, label: 'X (Twitter)' },
    pol.facebook_url && { href: pol.facebook_url, label: 'Facebook' },
    pol.instagram_url && { href: pol.instagram_url, label: 'Instagram' },
    pol.youtube_url && { href: pol.youtube_url, label: 'YouTube' },
  ].filter(Boolean) as Array<{ href: string; label: string }>

  const reportCardProps = {
    ...(reportCard as any),
    stanceCount: stances.length,
    voteCount: votingRecords.length,
    committeeCount: committees.length,
    yearsInOffice: pol.since_year ? new Date().getFullYear() - pol.since_year : undefined,
  }

  const items: Array<{ key: string; title: string; meta?: string; body: React.ReactNode }> = []

  items.push({
    key: 'align',
    title: 'Your alignment',
    meta: 'From your quiz answers, once you have taken it',
    body: (
      <YourAlignment
        politicianName={pol.name}
        politicianSlug={pol.slug}
        politicianParty={pol.party}
        politicianStances={stances.map((s: any) => ({
          issue_slug: s.issues?.slug ?? '',
          issue_name: s.issues?.name ?? '',
          stance: s.stance,
          is_verified: s.is_verified === true,
        }))}
      />
    ),
  })

  if (alignmentScore >= 0) {
    items.push({
      key: 'party',
      title: 'Party alignment',
      meta: `${alignmentScore}% with the ${partyLabel(pol.party)} platform, from estimated stances`,
      body: <AlignmentGauge score={alignmentScore} party={pol.party} />,
    })
  }

  items.push({
    key: 'civic',
    title: 'Civic profile',
    meta: 'Bipartisanship, transparency, effectiveness',
    body: signedIn ? (
      <PoliticianReportCard {...reportCardProps} />
    ) : (
      <div className="relative overflow-hidden rounded-xl border border-[var(--poli-border)]">
        <div className="pointer-events-none select-none" aria-hidden="true" style={{ filter: 'blur(6px)' }}>
          <PoliticianReportCard {...reportCardProps} />
        </div>
        {sessionResolved && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
            style={{ background: 'linear-gradient(180deg, transparent 0%, var(--poli-card) 40%, var(--poli-card) 100%)' }}
          >
            <p className="text-[15px] font-semibold text-[var(--poli-text)]">Sign in to see the civic profile</p>
            <p className="mt-1 max-w-[300px] text-[13px] leading-[1.5] text-[var(--poli-sub)]">
              Free. Scores on bipartisanship, transparency and effectiveness, with the working shown.
            </p>
            <Link
              href="/signup"
              className="mt-4 flex h-11 items-center justify-center rounded-xl bg-[var(--poli-text)] px-6 text-[14px] font-semibold text-[var(--poli-card)] no-underline"
            >
              Create a free account
            </Link>
          </div>
        )}
      </div>
    ),
  })

  items.push({
    key: 'deviation',
    title: 'Breaks from the party line',
    body: <StanceDeviation party={pol.party} stances={stances as any} />,
  })

  if (likeMinded.length > 0) {
    items.push({
      key: 'like',
      title: 'Like-minded officials',
      meta: `${likeMinded.length} with similar stances`,
      body: <LikeMinded politicians={likeMinded} />,
    })
  }

  if (committees.length > 0) {
    items.push({
      key: 'committees',
      title: 'Committees',
      meta: `${committees.length}`,
      body: committees.map((c, i) => (
        <div key={i} className={`flex min-h-[44px] items-center justify-between gap-3 ${i < committees.length - 1 ? 'border-b border-[var(--poli-border)]' : ''}`}>
          <span className="text-[14px] text-[var(--poli-text)]">{c.committees?.name}</span>
          <span className="text-[12px] font-semibold capitalize text-[var(--poli-sub)]">{c.role.replace(/_/g, ' ')}</span>
        </div>
      )),
    })
  }

  if (electionResults.length > 0) {
    items.push({
      key: 'history',
      title: 'Election history',
      meta: `${electionResults.length} result${electionResults.length === 1 ? '' : 's'}`,
      body: <ElectionHistory results={electionResults as any} party={pol.party} />,
    })
  }

  if (newsArticles.length > 0) {
    items.push({
      key: 'news',
      title: 'In the news',
      meta: `${newsArticles.length} stories`,
      body: <InTheNews articles={newsArticles} politicianName={pol.name} party={pol.party} />,
    })
  }

  if (links.length > 0) {
    items.push({
      key: 'links',
      title: 'Links',
      meta: links.map((l) => l.label).join(' · '),
      body: links.map((l, i) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex min-h-[44px] items-center justify-between text-[14px] font-semibold text-[var(--poli-text)] no-underline ${i < links.length - 1 ? 'border-b border-[var(--poli-border)]' : ''}`}
        >
          {l.label}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-[var(--poli-faint)]"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>
        </a>
      )),
    })
  }

  return (
    <section className="mb-5">
      <SectionLabel>More about {last}</SectionLabel>
      <Card flush className="px-4">
        {items.map((it, i) => (
          <Disclosure key={it.key} title={it.title} meta={it.meta} last={i === items.length - 1}>
            {it.body}
          </Disclosure>
        ))}
      </Card>
      <div className="mt-3 flex flex-wrap items-center gap-3 px-1 print:hidden">
        <ExportPdfButton />
        <UpdatePoliticianButton politicianId={pol.id} politicianName={pol.name} />
      </div>
    </section>
  )
}
