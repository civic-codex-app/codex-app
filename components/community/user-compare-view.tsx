'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { stanceBucket, stanceDisplayBadge, type StanceBadge } from '@/lib/utils/stances'
import { loadQuizAnswers } from '@/lib/utils/quiz-storage'
import { IssueIcon } from '@/components/icons/issue-icon'
import { StanceAvatar } from './stance-avatar'

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

interface UserCompareViewProps {
  them: UserProfile
  me?: UserProfile | null // null if viewing two public profiles
  issues: Issue[]
  isAuthenticated: boolean
}

export function UserCompareView({ them, me: meProp, issues, isAuthenticated }: UserCompareViewProps) {
  const [myStances, setMyStances] = useState<Record<string, string>>(meProp?.stances ?? {})
  const [loaded, setLoaded] = useState(!!meProp)

  const displayIdThem = them.anonymousId.slice(0, 4).toUpperCase()
  const displayIdMe = meProp ? meProp.anonymousId.slice(0, 4).toUpperCase() : 'You'

  // Load current user's quiz answers if not provided (self-compare mode)
  useEffect(() => {
    if (meProp) return // Already have explicit "me" data

    // Try localStorage first
    const local = loadQuizAnswers()
    if (Object.keys(local).length > 0) {
      setMyStances(local)
      setLoaded(true)
      return
    }

    // Try server if authenticated
    if (isAuthenticated) {
      fetch('/api/quiz-answers')
        .then((r) => r.json())
        .then((data) => {
          if (data.answers && Object.keys(data.answers).length > 0) {
            setMyStances(data.answers)
          }
        })
        .catch(() => {})
        .finally(() => setLoaded(true))
    } else {
      setLoaded(true)
    }
  }, [meProp, isAuthenticated])

  const hasMyStances = Object.keys(myStances).length > 0
  const theirStances = them.stances

  // Build unified issue list
  const allSlugs = new Set([...Object.keys(myStances), ...Object.keys(theirStances)])
  const issueMap = new Map(issues.map((i) => [i.slug, i]))

  const comparableIssues = Array.from(allSlugs)
    .filter((slug) => myStances[slug] && theirStances[slug])
    .map((slug) => {
      const issue = issueMap.get(slug)
      return {
        slug,
        name: issue?.name ?? slug,
        icon: issue?.icon,
        myStance: myStances[slug],
        theirStance: theirStances[slug],
      }
    })

  // Agreement stats
  const agree = comparableIssues.filter(
    (i) => stanceBucket(i.myStance) === stanceBucket(i.theirStance)
  ).length
  const total = comparableIssues.length
  const agreePct = total > 0 ? Math.round((agree / total) * 100) : 0
  const disagree = total - agree

  if (!loaded) {
    return (
      <div className="py-20 text-center">
        <div className="h-4 w-48 mx-auto animate-pulse rounded bg-[var(--poli-border)]" />
      </div>
    )
  }

  // No quiz data — prompt to take quiz
  if (!hasMyStances && !meProp) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-[var(--poli-text)]">
          Take the quiz first
        </h2>
        <p className="mx-auto mb-5 max-w-[360px] text-[13px] text-[var(--poli-sub)]">
          Answer a few questions about your political views, then come back to see
          how you compare with Voter #{displayIdThem}.
        </p>
        <Link
          href="/quiz"
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-[13px] font-semibold text-white no-underline transition-all hover:bg-blue-700"
        >
          Take the Quiz
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Profile headers */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <ProfileHeader
          label={meProp ? `Voter #${displayIdMe}` : 'You'}
          stances={myStances}
          color="#3b82f6"
          seed={meProp?.anonymousId ?? 'me'}
        />
        <ProfileHeader
          label={`Voter #${displayIdThem}`}
          stances={theirStances}
          seed={them.anonymousId}
          color="#8b5cf6"
        />
      </div>

      {/* Agreement meter */}
      {total > 0 && (
        <div className="mb-8 rounded-md border border-[var(--poli-border)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--poli-sub)]">
              Issue Agreement
            </span>
            <span className="text-xl font-semibold">
              {agreePct}%
            </span>
          </div>
          <div className="mb-2 flex h-3 overflow-hidden rounded-full bg-[var(--poli-border)]">
            <div
              className="rounded-l-full transition-all"
              style={{
                width: `${agreePct}%`,
                background: 'linear-gradient(90deg, #3B82F688, #3B82F6)',
              }}
            />
            <div
              className="rounded-r-full transition-all"
              style={{
                width: `${100 - agreePct}%`,
                background: 'linear-gradient(90deg, #EF4444, #EF444488)',
              }}
            />
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-blue-400/70">{agree} agree</span>
            <span className="text-red-400/70">{disagree} disagree</span>
          </div>
        </div>
      )}

      {/* Issue-by-issue comparison */}
      {comparableIssues.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-semibold text-[var(--poli-sub)]">
            Issue Positions
          </h2>
          <div className="space-y-1">
            {/* Header */}
            <div className="hidden gap-2 px-4 pb-2 text-[11px] uppercase tracking-[0.08em] text-[var(--poli-faint)] sm:grid sm:grid-cols-[1fr_140px_140px]">
              <span>Issue</span>
              <span className="text-center">{meProp ? `#${displayIdMe}` : 'You'}</span>
              <span className="text-center">#{displayIdThem}</span>
            </div>

            {comparableIssues.map((issue) => {
              const myBucket = stanceBucket(issue.myStance)
              const theirBucket = stanceBucket(issue.theirStance)
              const match = myBucket === theirBucket

              return (
                <div
                  key={issue.slug}
                  className="grid grid-cols-[1fr] items-center gap-2 rounded-md px-4 py-3 sm:grid-cols-[1fr_140px_140px]"
                  style={{
                    backgroundColor: match ? 'rgba(59,130,246,0.04)' : 'transparent',
                  }}
                >
                  {/* Issue name */}
                  <div className="flex items-center gap-2.5">
                    <IssueIcon icon={issue.icon} size={16} />
                    <span className="text-[13px] font-medium text-[var(--poli-text)]">
                      {issue.name}
                    </span>
                    {match && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>

                  {/* My stance */}
                  <div className="flex justify-start sm:justify-center">
                    <BadgePill badge={stanceDisplayBadge(issue.myStance)} />
                  </div>

                  {/* Their stance */}
                  <div className="flex justify-start sm:justify-center">
                    <BadgePill badge={stanceDisplayBadge(issue.theirStance)} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Issues only one has answered */}
      {Array.from(allSlugs).filter((s) => !myStances[s] || !theirStances[s]).length > 0 && (
        <p className="mt-6 text-center text-[11px] text-[var(--poli-faint)]">
          {Array.from(allSlugs).filter((s) => !myStances[s] || !theirStances[s]).length} issues
          were only answered by one voter and are not shown above.
        </p>
      )}
    </div>
  )
}

function ProfileHeader({
  label,
  stances,
  seed,
}: {
  label: string
  stances: Record<string, string>
  color: string
  seed: string
}) {
  const entries = Object.values(stances)
  const total = entries.length
  const supports = entries.filter((s) => stanceBucket(s) === 'supports').length
  const opposes = entries.filter((s) => stanceBucket(s) === 'opposes').length
  const neutral = total - supports - opposes

  return (
    <div className="rounded-lg border border-[var(--poli-border)] p-4 text-center">
      <div className="mx-auto mb-2 flex justify-center">
        <StanceAvatar supports={supports} opposes={opposes} neutral={neutral} total={total} size={48} seed={seed} />
      </div>
      <div className="mb-1 text-[14px] font-semibold text-[var(--poli-text)]">{label}</div>
      <div className="text-[11px] text-[var(--poli-faint)]">
        {total} issues | {supports} support | {opposes} oppose
      </div>
    </div>
  )
}

function BadgePill({ badge }: { badge: StanceBadge }) {
  return (
    <span
      className="inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
      style={badge.style}
    >
      {badge.label}
    </span>
  )
}
