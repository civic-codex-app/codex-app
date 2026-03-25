'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { stanceBucket, stanceDisplayBadge, STANCE_NUMERIC, type StanceBadge } from '@/lib/utils/stances'
import { computeAlignment, alignmentMeta } from '@/lib/utils/alignment'
import { loadQuizAnswers } from '@/lib/utils/quiz-storage'
import { IssueIcon } from '@/components/icons/issue-icon'
import { StanceAvatar } from './stance-avatar'
import { AvatarImage } from '@/components/ui/avatar-image'
import { STATE_NAMES } from '@/lib/constants/us-states'
import { partyColor } from '@/lib/constants/parties'

interface UserProfile {
  anonymousId: string
  state?: string | null
  stances: Record<string, string>
}

interface Issue {
  slug: string
  name: string
  icon?: string
}

interface Politician {
  name: string
  slug: string
  party: string
  state: string
  chamber: string
  image_url: string | null
}

interface IssueFollow {
  name: string
  slug: string
  icon?: string
}

interface UserCompareViewProps {
  them: UserProfile
  me?: UserProfile | null
  issues: Issue[]
  isAuthenticated: boolean
  themFollows: Politician[]
  themIssueFollows: IssueFollow[]
  themLikes: Politician[]
  meFollows: Politician[]
  meIssueFollows: IssueFollow[]
  meLikes: Politician[]
}

export function UserCompareView({
  them, me: meProp, issues, isAuthenticated,
  themFollows, themIssueFollows, themLikes,
  meFollows, meIssueFollows, meLikes,
}: UserCompareViewProps) {
  const [myStances, setMyStances] = useState<Record<string, string>>(meProp?.stances ?? {})
  const [loaded, setLoaded] = useState(!!meProp)

  const displayIdThem = them.anonymousId.slice(0, 4).toUpperCase()
  const displayIdMe = meProp ? meProp.anonymousId.slice(0, 4).toUpperCase() : 'You'

  useEffect(() => {
    if (meProp) return
    const local = loadQuizAnswers()
    if (Object.keys(local).length > 0) {
      setMyStances(local)
      setLoaded(true)
      return
    }
    if (isAuthenticated) {
      fetch('/api/quiz-answers')
        .then((r) => r.json())
        .then((data) => {
          if (data.answers && Object.keys(data.answers).length > 0) setMyStances(data.answers)
        })
        .catch(() => {})
        .finally(() => setLoaded(true))
    } else {
      setLoaded(true)
    }
  }, [meProp, isAuthenticated])

  const hasMyStances = Object.keys(myStances).length > 0
  const theirStances = them.stances
  const issueMap = new Map(issues.map((i) => [i.slug, i]))

  // Build comparable issues with distance
  const comparableIssues = Array.from(new Set([...Object.keys(myStances), ...Object.keys(theirStances)]))
    .filter((slug) => myStances[slug] && theirStances[slug])
    .map((slug) => {
      const issue = issueMap.get(slug)
      const myNum = STANCE_NUMERIC[myStances[slug]] ?? 3
      const theirNum = STANCE_NUMERIC[theirStances[slug]] ?? 3
      return {
        slug,
        name: issue?.name ?? slug,
        icon: issue?.icon,
        myStance: myStances[slug],
        theirStance: theirStances[slug],
        distance: Math.abs(myNum - theirNum),
        match: stanceBucket(myStances[slug]) === stanceBucket(theirStances[slug]),
      }
    })

  const agree = comparableIssues.filter((i) => i.match).length
  const total = comparableIssues.length
  const agreePct = total > 0 ? Math.round((agree / total) * 100) : 0

  // Sort by distance for biggest agreements/disagreements
  const biggestAgreements = comparableIssues.filter((i) => i.distance <= 1).sort((a, b) => a.distance - b.distance).slice(0, 5)
  const biggestDisagreements = comparableIssues.filter((i) => i.distance >= 3).sort((a, b) => b.distance - a.distance).slice(0, 5)

  // Shared follows
  const themFollowSlugs = new Set(themFollows.map(p => p.slug))
  const sharedFollows = meFollows.filter(p => themFollowSlugs.has(p.slug))
  const themLikeSlugs = new Set(themLikes.map(p => p.slug))
  const sharedLikes = meLikes.filter(p => themLikeSlugs.has(p.slug))
  const themIssueSlugs = new Set(themIssueFollows.map(i => i.slug))
  const sharedIssueFollows = meIssueFollows.filter(i => themIssueSlugs.has(i.slug))

  // Alignment labels
  const themStanceArray = Object.entries(theirStances).map(([slug, stance]) => ({ stance, issues: { slug } }))
  const themDem = computeAlignment('democrat', themStanceArray)
  const themRep = computeAlignment('republican', themStanceArray)
  const themDiff = themDem - themRep
  const themLean = Math.abs(themDiff) < 15 ? 'Centrist' : themDiff > 0 ? 'Leans Left' : 'Leans Right'
  const themLeanColor = Math.abs(themDiff) < 15 ? 'var(--poli-faint)' : themDiff > 0 ? '#60a5fa' : '#f87171'

  if (!loaded) {
    return <div className="py-20 text-center"><div className="h-4 w-48 mx-auto animate-pulse rounded bg-[var(--poli-border)]" /></div>
  }

  if (!hasMyStances && !meProp) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-[var(--poli-text)]">Take the quiz first</h2>
        <p className="mx-auto mb-5 max-w-[360px] text-[13px] text-[var(--poli-sub)]">
          Answer a few questions about your political views, then come back to compare with Voter #{displayIdThem}.
        </p>
        <Link href="/quiz" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-[13px] font-semibold text-white no-underline transition-all hover:bg-blue-700">
          Take the Quiz
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Profile headers */}
      <div className="grid grid-cols-2 gap-4">
        <ProfileCard
          label={meProp ? `Voter #${displayIdMe}` : 'You'}
          stances={myStances}
          seed={meProp?.anonymousId ?? 'me'}
          state={meProp?.state}
          followCount={meFollows.length}
          likeCount={meLikes.length}
          issueFollowCount={meIssueFollows.length}
        />
        <ProfileCard
          label={`Voter #${displayIdThem}`}
          stances={theirStances}
          seed={them.anonymousId}
          state={them.state}
          lean={themLean}
          leanColor={themLeanColor}
          followCount={themFollows.length}
          likeCount={themLikes.length}
          issueFollowCount={themIssueFollows.length}
        />
      </div>

      {/* Agreement meter */}
      {total > 0 && (
        <div className="rounded-lg border border-[var(--poli-border)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">Overall Agreement</span>
            <span className="text-2xl font-bold" style={{ color: agreePct >= 60 ? '#34d399' : agreePct >= 40 ? '#fbbf24' : '#f87171' }}>
              {agreePct}%
            </span>
          </div>
          <div className="mb-2 flex h-3 overflow-hidden rounded-full bg-[var(--poli-border)]">
            <div className="rounded-l-full" style={{ width: `${agreePct}%`, background: 'linear-gradient(90deg, #34d39988, #34d399)' }} />
            <div className="rounded-r-full" style={{ width: `${100 - agreePct}%`, background: 'linear-gradient(90deg, #f87171, #f8717188)' }} />
          </div>
          <div className="flex justify-between text-[11px] text-[var(--poli-faint)]">
            <span>{agree} of {total} issues aligned</span>
            <span>{total - agree} differ</span>
          </div>
        </div>
      )}

      {/* Biggest Agreements */}
      {biggestAgreements.length > 0 && (
        <div>
          <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
            Where You Agree
          </h2>
          <div className="space-y-2">
            {biggestAgreements.map((issue) => (
              <div key={issue.slug} className="flex items-center gap-3 rounded-lg bg-emerald-500/5 px-4 py-3">
                <IssueIcon icon={issue.icon} size={18} />
                <span className="flex-1 text-[13px] font-medium text-[var(--poli-text)]">{issue.name}</span>
                <BadgePill badge={stanceDisplayBadge(issue.myStance)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Biggest Disagreements */}
      {biggestDisagreements.length > 0 && (
        <div>
          <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
            Where You Differ
          </h2>
          <div className="space-y-2">
            {biggestDisagreements.map((issue) => (
              <div key={issue.slug} className="flex items-center gap-3 rounded-lg bg-red-500/5 px-4 py-3">
                <IssueIcon icon={issue.icon} size={18} />
                <span className="min-w-0 flex-1 text-[13px] font-medium text-[var(--poli-text)]">{issue.name}</span>
                <div className="flex items-center gap-2">
                  <BadgePill badge={stanceDisplayBadge(issue.myStance)} />
                  <span className="text-[10px] text-[var(--poli-faint)]">vs</span>
                  <BadgePill badge={stanceDisplayBadge(issue.theirStance)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shared Politicians */}
      {sharedLikes.length > 0 && (
        <div>
          <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
            Politicians You Both Like
          </h2>
          <div className="flex flex-wrap gap-2">
            {sharedLikes.map((pol) => (
              <Link
                key={pol.slug}
                href={`/politicians/${pol.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--poli-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--poli-text)] no-underline transition-colors hover:bg-[var(--poli-hover)]"
              >
                {pol.image_url ? (
                  <img src={pol.image_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: partyColor(pol.party) }}>
                    {pol.name[0]}
                  </span>
                )}
                {pol.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {sharedFollows.length > 0 && sharedLikes.length === 0 && (
        <div>
          <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
            Politicians You Both Follow
          </h2>
          <div className="flex flex-wrap gap-2">
            {sharedFollows.map((pol) => (
              <Link
                key={pol.slug}
                href={`/politicians/${pol.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--poli-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--poli-text)] no-underline transition-colors hover:bg-[var(--poli-hover)]"
              >
                {pol.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Shared Issues */}
      {sharedIssueFollows.length > 0 && (
        <div>
          <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
            Issues You Both Follow
          </h2>
          <div className="flex flex-wrap gap-2">
            {sharedIssueFollows.map((issue) => (
              <Link
                key={issue.slug}
                href={`/issues/${issue.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--poli-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--poli-text)] no-underline transition-colors hover:bg-[var(--poli-hover)]"
              >
                <IssueIcon icon={issue.icon} size={14} />
                {issue.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Their follows (if no shared data) */}
      {sharedLikes.length === 0 && sharedFollows.length === 0 && themLikes.length > 0 && (
        <div>
          <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
            #{displayIdThem} Likes
          </h2>
          <div className="flex flex-wrap gap-2">
            {themLikes.slice(0, 10).map((pol) => (
              <Link
                key={pol.slug}
                href={`/politicians/${pol.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--poli-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--poli-text)] no-underline transition-colors hover:bg-[var(--poli-hover)]"
              >
                {pol.image_url ? (
                  <img src={pol.image_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: partyColor(pol.party) }}>
                    {pol.name[0]}
                  </span>
                )}
                {pol.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Their issue follows */}
      {sharedIssueFollows.length === 0 && themIssueFollows.length > 0 && (
        <div>
          <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
            #{displayIdThem} Follows These Issues
          </h2>
          <div className="flex flex-wrap gap-2">
            {themIssueFollows.map((issue) => (
              <Link
                key={issue.slug}
                href={`/issues/${issue.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--poli-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--poli-text)] no-underline transition-colors hover:bg-[var(--poli-hover)]"
              >
                <IssueIcon icon={issue.icon} size={14} />
                {issue.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Collapsible full stance list */}
      {comparableIssues.length > 0 && <FullStanceList issues={comparableIssues} displayIdMe={displayIdMe} displayIdThem={displayIdThem} hasMeProp={!!meProp} />}
    </div>
  )
}

function FullStanceList({ issues, displayIdMe, displayIdThem, hasMeProp }: {
  issues: Array<{ slug: string; name: string; icon?: string; myStance: string; theirStance: string; match: boolean }>
  displayIdMe: string
  displayIdThem: string
  hasMeProp: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-lg border border-[var(--poli-border)] px-4 py-3 text-left text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)] transition-colors hover:bg-[var(--poli-hover)]"
      >
        <span>All {issues.length} Issue Positions</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-2 space-y-1">
          <div className="hidden gap-2 px-4 pb-2 text-[11px] uppercase tracking-[0.08em] text-[var(--poli-faint)] sm:grid sm:grid-cols-[1fr_120px_120px]">
            <span>Issue</span>
            <span className="text-center">{hasMeProp ? `#${displayIdMe}` : 'You'}</span>
            <span className="text-center">#{displayIdThem}</span>
          </div>
          {issues.map((issue) => (
            <div
              key={issue.slug}
              className="grid grid-cols-[1fr] items-center gap-2 rounded-md px-4 py-2.5 sm:grid-cols-[1fr_120px_120px]"
              style={{ backgroundColor: issue.match ? 'rgba(52,211,153,0.04)' : 'transparent' }}
            >
              <div className="flex items-center gap-2">
                <IssueIcon icon={issue.icon} size={14} />
                <span className="text-[13px] text-[var(--poli-text)]">{issue.name}</span>
                {issue.match && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div className="flex justify-start sm:justify-center"><BadgePill badge={stanceDisplayBadge(issue.myStance)} /></div>
              <div className="flex justify-start sm:justify-center"><BadgePill badge={stanceDisplayBadge(issue.theirStance)} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProfileCard({
  label, stances, seed, state, lean, leanColor, followCount, likeCount, issueFollowCount,
}: {
  label: string
  stances: Record<string, string>
  seed: string
  state?: string | null
  lean?: string
  leanColor?: string
  followCount: number
  likeCount: number
  issueFollowCount: number
}) {
  const entries = Object.values(stances)
  const total = entries.length
  const supports = entries.filter((s) => stanceBucket(s) === 'supports').length
  const opposes = entries.filter((s) => stanceBucket(s) === 'opposes').length
  const neutral = total - supports - opposes
  const stateName = state ? STATE_NAMES[state as keyof typeof STATE_NAMES] ?? state : null

  return (
    <div className="rounded-lg border border-[var(--poli-border)] p-4 text-center">
      <div className="mx-auto mb-2 flex justify-center">
        <StanceAvatar supports={supports} opposes={opposes} neutral={neutral} total={total} size={48} seed={seed} />
      </div>
      <div className="mb-0.5 text-[14px] font-semibold text-[var(--poli-text)]">{label}</div>
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[11px] text-[var(--poli-faint)]">
        {stateName && <span>{stateName}</span>}
        {lean && <span style={{ color: leanColor }}>{lean}</span>}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 text-[10px] text-[var(--poli-faint)]">
        {likeCount > 0 && <span>{likeCount} liked</span>}
        {followCount > 0 && <span>{followCount} following</span>}
        {issueFollowCount > 0 && <span>{issueFollowCount} issues</span>}
      </div>
    </div>
  )
}

function BadgePill({ badge }: { badge: StanceBadge }) {
  return (
    <span
      className="inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium"
      style={badge.style}
    >
      {badge.label}
    </span>
  )
}
