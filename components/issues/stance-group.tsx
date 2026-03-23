'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'

export interface StanceEntry {
  summary: string | null
  politicians: {
    id: string
    name: string
    slug: string
    party: string
    chamber: string
    state: string
    title: string
    image_url: string | null
  }[]
}

interface StanceGroupProps {
  label: string
  color: string
  bgClass: string
  textClass: string
  entries: StanceEntry[]
  totalCount: number
  initialLimit?: number
}

const INITIAL_LIMIT = 6

export function StanceGroup({ label, color, bgClass, textClass, entries, totalCount, initialLimit = INITIAL_LIMIT }: StanceGroupProps) {
  const [visibleCount, setVisibleCount] = useState(initialLimit)

  if (entries.length === 0) return null

  const visible = entries.slice(0, visibleCount)
  const hasMore = visibleCount < entries.length
  const remaining = entries.length - visibleCount

  return (
    <section className="mb-10">
      <h2 className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
        <span className={`rounded-sm px-2 py-0.5 text-[10px] ${bgClass} ${textClass}`}>
          {label}
        </span>
        <span className="text-[var(--codex-faint)]">{totalCount}</span>
      </h2>
      <div className="space-y-2">
        {visible.map((entry, i) => {
          const rep = entry.politicians[0]
          const othersCount = entry.politicians.length - 1
          const hasSummary = entry.summary && entry.summary.trim().length > 0

          return (
            <div key={i} className="rounded-md border border-[var(--codex-border)] p-4">
              {/* Representative politician */}
              <Link
                href={`/politicians/${rep.slug}`}
                className="group flex items-center gap-3 no-underline"
              >
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--codex-card)]">
                  <AvatarImage
                    src={rep.image_url}
                    alt={rep.name}
                    size={40}
                    party={rep.party}
                    fallbackColor={partyColor(rep.party)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium transition-colors group-hover:text-[var(--codex-text)]">
                      {rep.name}
                    </span>
                    <PartyIcon party={rep.party} size={10} />
                  </div>
                  <div className="text-[11px] text-[var(--codex-faint)]">
                    {rep.title} &middot; {rep.state}
                  </div>
                </div>
              </Link>

              {/* Summary text */}
              {hasSummary && (
                <p className="mt-2 text-[12px] leading-[1.6] text-[var(--codex-sub)]">
                  {entry.summary}
                </p>
              )}

              {/* "and X others" */}
              {othersCount > 0 && (
                <OthersRow politicians={entry.politicians.slice(1)} />
              )}
            </div>
          )
        })}
      </div>

      {/* Show more */}
      {hasMore && (
        <button
          onClick={() => setVisibleCount((v) => v + initialLimit)}
          className="mt-3 w-full rounded-lg border border-[var(--codex-border)] py-2.5 text-[13px] font-medium text-[var(--codex-sub)] transition-all hover:border-[var(--codex-text)] hover:text-[var(--codex-text)]"
        >
          Show {Math.min(remaining, initialLimit)} more of {entries.length}
        </button>
      )}
    </section>
  )
}

/** Collapsed row showing "and X others share this stance" with mini avatars */
function OthersRow({ politicians }: { politicians: StanceEntry['politicians'] }) {
  const [showAll, setShowAll] = useState(false)
  const PREVIEW_COUNT = 5
  const visible = showAll ? politicians : politicians.slice(0, PREVIEW_COUNT)
  const remainingCount = politicians.length - PREVIEW_COUNT

  return (
    <div className="mt-2 border-t border-[var(--codex-border)] pt-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-[var(--codex-faint)]">
          and {politicians.length} other{politicians.length !== 1 ? 's' : ''}:
        </span>
        {visible.map((pol) => (
          <Link
            key={pol.id}
            href={`/politicians/${pol.slug}`}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--codex-border)] px-2 py-0.5 text-[11px] no-underline transition-colors hover:border-[var(--codex-input-border)]"
            title={`${pol.name} (${partyLabel(pol.party)}, ${pol.state})`}
          >
            <div className="h-4 w-4 flex-shrink-0 overflow-hidden rounded-full bg-[var(--codex-card)]">
              <AvatarImage
                src={pol.image_url}
                alt={pol.name}
                size={16}
                party={pol.party}
                fallbackColor={partyColor(pol.party)}
              />
            </div>
            <span className="text-[var(--codex-sub)]">{pol.name.split(' ').pop()}</span>
          </Link>
        ))}
        {!showAll && remainingCount > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="text-[11px] text-[var(--codex-faint)] underline hover:text-[var(--codex-sub)]"
          >
            +{remainingCount} more
          </button>
        )}
      </div>
    </div>
  )
}
