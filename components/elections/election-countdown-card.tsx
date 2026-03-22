'use client'

import Link from 'next/link'
import { ElectionCountdown } from '@/components/elections/election-countdown'
import { KeyDatesTimeline } from '@/components/elections/key-dates-timeline'

interface KeyDate {
  date_type: string
  event_date: string
  description: string | null
  source_url: string | null
}

interface ElectionCountdownCardProps {
  electionName: string
  electionSlug: string
  electionDate: string
  keyDates: KeyDate[]
  userState: string | null
}

export function ElectionCountdownCard({
  electionName,
  electionSlug,
  electionDate,
  keyDates,
  userState,
}: ElectionCountdownCardProps) {
  return (
    <div className="rounded-md border border-[var(--codex-border)] p-5">
      {/* Title */}
      <h2 className="mb-1 font-serif text-xl font-bold text-[var(--codex-text)]">
        {electionName}
      </h2>
      <p className="mb-4 text-[12px] uppercase tracking-[0.1em] text-[var(--codex-faint)]">
        Countdown
      </p>

      {/* Timer */}
      <div className="mb-5">
        <ElectionCountdown electionDate={electionDate} />
      </div>

      {/* Key dates */}
      {userState ? (
        keyDates.length > 0 ? (
          <div className="mb-4">
            <div className="mb-3 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              Key Dates {userState ? `for ${userState}` : ''}
            </div>
            <KeyDatesTimeline dates={keyDates} electionDate={electionDate} />
          </div>
        ) : (
          <div className="mb-4">
            <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              Key Dates
            </div>
            <p className="text-sm text-[var(--codex-faint)]">
              No key dates available for {userState} yet.
            </p>
          </div>
        )
      ) : (
        <div className="mb-4 rounded border border-[var(--codex-border)] bg-[var(--codex-hover)] px-3 py-2.5 text-[13px] text-[var(--codex-sub)]">
          Set your state to see key dates for your area
        </div>
      )}

      {/* Link */}
      <Link
        href="/elections"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-400 hover:underline"
      >
        View all races
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5"
        >
          <path
            fillRule="evenodd"
            d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    </div>
  )
}
