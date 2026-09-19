'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StatePoliticianList } from '@/components/states/state-politician-list'

type Rep = {
  id: string
  name: string
  slug: string
  party: string
  state: string
  chamber: string
  title: string
  image_url: string | null
}

type Payload = {
  signedIn: boolean
  hasQuizAnswers: boolean
  representatives: Rep[]
}

/**
 * The signed-in part of the homepage, resolved on the client.
 *
 * This markup used to live in the page's server component, which had to read
 * the auth cookie to build it — and that single call made the whole homepage
 * dynamic for every visitor, so its `revalidate = 1800` never took effect.
 * Moving these four things out is what lets the rest of the page be static.
 *
 * Rendered below the party cards on purpose: it appears after hydration, so
 * anywhere higher would push the fold down for the signed-out majority who
 * will never see it. Nothing is reserved for it, so there is no gap either.
 */
export function PersonalStrip() {
  const [data, setData] = useState<Payload | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/me/home', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json: Payload | null) => {
        if (!cancelled && json?.signedIn) setData(json)
      })
      .catch(() => {
        // Signed out, offline, or the request failed: the homepage is
        // complete without this, so there is nothing to recover from.
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!data) return null

  return (
    <div className="mb-10 space-y-4 animate-fade-up">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--poli-border)] px-4 py-2 text-[13px] font-medium text-[var(--poli-sub)] no-underline transition-all hover:border-[var(--poli-text)] hover:text-[var(--poli-text)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </Link>
        <Link
          href="/ballot"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--poli-border)] px-4 py-2 text-[13px] font-medium text-[var(--poli-sub)] no-underline transition-all hover:border-[var(--poli-text)] hover:text-[var(--poli-text)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          My Ballot
        </Link>
      </div>

      {data.representatives.length > 0 && (
        <div>
          <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
            Your Representatives
          </h2>
          <StatePoliticianList politicians={data.representatives} pageSize={3} size="compact" />
        </div>
      )}

      {data.hasQuizAnswers ? (
        <Link
          href="/quiz"
          className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 no-underline transition-all hover:border-blue-500/40"
        >
          <div>
            <div className="text-[14px] font-semibold text-[var(--poli-text)]">Your Top Matches</div>
            <div className="text-[12px] text-[var(--poli-sub)]">See which officials align with your views</div>
          </div>
          <svg className="shrink-0 text-blue-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>
      ) : (
        <Link
          href="/quiz"
          className="flex items-center justify-between rounded-xl border border-[var(--poli-border)] bg-[var(--poli-hover)] p-4 no-underline transition-all hover:border-[var(--poli-text)]"
        >
          <div>
            <div className="text-[14px] font-semibold text-[var(--poli-text)]">Take the Quiz</div>
            <div className="text-[12px] text-[var(--poli-sub)]">Find out which officials match your views</div>
          </div>
          <svg className="shrink-0 text-[var(--poli-faint)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>
      )}
    </div>
  )
}
