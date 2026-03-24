'use client'

import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor } from '@/lib/constants/parties'

interface Candidate {
  name: string
  party: string
  image_url: string | null
}

interface Props {
  race: {
    id: string
    name: string
    slug: string
    state: string
    chamber: string
    election_slug: string
    election_date: string
    candidates: Candidate[]
  }
}

export function ElectionCountdownCard({ race }: Props) {
  const now = new Date()
  const electionDate = new Date(race.election_date + 'T00:00:00')
  const diffMs = electionDate.getTime() - now.getTime()
  const daysLeft = Math.max(0, Math.ceil(diffMs / 86400000))

  const dateLabel = electionDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-amber-500">
            Upcoming Race
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-[20px] font-bold text-amber-500">{daysLeft}</span>
          <span className="text-[11px] text-amber-500/70">days</span>
        </div>
      </div>

      <p className="mb-1 text-[15px] font-semibold leading-[1.3] text-[var(--codex-text)]">
        {race.name}
      </p>
      <p className="mb-3 text-[12px] text-[var(--codex-faint)]">
        {race.state} &middot; {dateLabel}
      </p>

      {/* Candidate avatars */}
      {race.candidates.length > 0 && (
        <div className="mb-3 flex -space-x-2">
          {race.candidates.slice(0, 6).map((c, i) => (
            <div
              key={i}
              className="h-8 w-8 overflow-hidden rounded-full border-2"
              style={{ borderColor: partyColor(c.party) + '44' }}
            >
              <AvatarImage
                src={c.image_url}
                alt={c.name}
                size={32}
                party={c.party}
                fallbackColor={partyColor(c.party)}
              />
            </div>
          ))}
          {race.candidates.length > 6 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--codex-border)] bg-[var(--codex-bg)] text-[10px] font-medium text-[var(--codex-faint)]">
              +{race.candidates.length - 6}
            </div>
          )}
        </div>
      )}

      <Link
        href={`/elections/${race.election_slug}`}
        className="text-[12px] font-medium text-amber-500 no-underline hover:underline"
      >
        View race &rarr;
      </Link>
    </div>
  )
}
