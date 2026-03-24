'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor, partyLabel } from '@/lib/constants/parties'

interface SurpriseMatch {
  id: string
  name: string
  slug: string
  party: string
  state: string
  chamber: string
  image_url: string | null
  score: number
  matched: number
}

interface SurpriseMatchesProps {
  matches: SurpriseMatch[]
}

export function SurpriseMatches({ matches }: SurpriseMatchesProps) {
  const [revealed, setRevealed] = useState(false)

  if (matches.length === 0) return null

  return (
    <section className="mb-10">
      <h2 className="mb-1 text-sm font-semibold text-[var(--poli-sub)]">
        Across the Aisle
      </h2>
      <p className="mb-4 text-xs text-[var(--poli-faint)]">
        Politicians from the other party you might not expect to agree with
      </p>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="w-full rounded-md border border-dashed border-[var(--poli-border)] py-8 text-center transition-colors hover:border-[var(--poli-sub)] hover:bg-[var(--poli-hover)]"
          style={{ background: 'none', cursor: 'pointer' }}
        >
          <div className="mb-2 text-2xl">?</div>
          <div className="text-sm font-medium text-[var(--poli-text)]">
            Reveal your surprise matches
          </div>
          <div className="mt-1 text-xs text-[var(--poli-faint)]">
            Based on your quiz answers
          </div>
        </button>
      ) : (
        <div className="divide-y divide-[var(--poli-border)] rounded-md border border-[var(--poli-border)]">
          {matches.map((m) => (
            <Link
              key={m.id}
              href={`/politicians/${m.slug}`}
              className="flex items-center gap-3 px-4 py-3 no-underline transition-colors hover:bg-[var(--poli-hover)]"
            >
              <div
                className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full"
                style={{ border: `2px solid ${partyColor(m.party)}33` }}
              >
                <AvatarImage
                  src={m.image_url}
                  alt={m.name}
                  size={36}
                  fallbackColor={partyColor(m.party)}
                  party={m.party}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-[var(--poli-text)]">
                    {m.name}
                  </span>
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: partyColor(m.party) }}
                  />
                </div>
                <div className="text-xs text-[var(--poli-sub)]">
                  {m.state} &middot; {m.matched} issues compared
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span
                  className="text-lg font-bold tabular-nums"
                  style={{
                    color: m.score >= 70 ? '#22C55E' : m.score >= 40 ? '#EAB308' : '#EF4444',
                  }}
                >
                  {m.score}%
                </span>
                <span className="text-[10px] text-[var(--poli-faint)]">match</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
