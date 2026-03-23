'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { PartyIcon } from '@/components/icons/party-icons'
import { partyColor } from '@/lib/constants/parties'
import { CHAMBER_LABELS } from '@/lib/constants/chambers'

interface Politician {
  id: string
  name: string
  slug: string
  state: string
  chamber: string
  party: string
  title: string | null
  image_url: string | null
}

interface Props {
  politicians: Politician[]
  pageSize?: number
  size?: 'default' | 'compact'
}

export function StatePoliticianList({ politicians, pageSize = 6, size = 'default' }: Props) {
  const [page, setPage] = useState(0)
  const touchStartX = useRef(0)
  const total = politicians.length
  const totalPages = Math.ceil(total / pageSize)
  const start = page * pageSize
  const visible = politicians.slice(start, start + pageSize)

  const prev = useCallback(() => setPage((p) => Math.max(0, p - 1)), [])
  const next = useCallback(() => setPage((p) => Math.min(totalPages - 1, p + 1)), [totalPages])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) next()
      else prev()
    }
  }, [next, prev])

  if (total === 0) return null
  if (totalPages <= 1) {
    return <Grid politicians={visible} size={size} />
  }

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <Grid politicians={visible} size={size} />

      {/* Pagination controls */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] tabular-nums text-[var(--codex-faint)]">
          {start + 1}–{Math.min(start + pageSize, total)} of {total}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={prev}
            disabled={page === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--codex-border)] text-[var(--codex-sub)] transition-all hover:border-[var(--codex-text)] hover:text-[var(--codex-text)] disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Previous page"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={next}
            disabled={page >= totalPages - 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--codex-border)] text-[var(--codex-sub)] transition-all hover:border-[var(--codex-text)] hover:text-[var(--codex-text)] disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Next page"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function Grid({ politicians, size }: { politicians: Politician[]; size: 'default' | 'compact' }) {
  const isCompact = size === 'compact'
  const avatarW = 'w-[68px]'
  const avatarPx = 68
  const nameSize = isCompact ? 'text-[13px]' : 'text-[15px]'

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {politicians.map((pol) => {
        const color = partyColor(pol.party)
        return (
          <Link
            key={pol.id}
            href={`/politicians/${pol.slug}`}
            className="group flex overflow-hidden rounded-xl no-underline transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            style={{ backgroundColor: `${color}08`, border: `1.5px solid ${color}22` }}
          >
            <div
              className={`${avatarW} flex-shrink-0 self-stretch overflow-hidden bg-[var(--codex-card)]`}
            >
              <AvatarImage
                src={pol.image_url}
                alt={pol.name}
                size={avatarPx * 2}
                party={pol.party}
                fallbackColor={color}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className={`min-w-0 flex-1 ${isCompact ? 'px-3 py-2.5' : 'px-4 py-3'}`}>
              <div className={`truncate ${nameSize} font-semibold text-[var(--codex-text)]`}>
                {pol.name}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                {pol.image_url && <PartyIcon party={pol.party} size={isCompact ? 10 : 12} />}
                {isCompact ? (
                  <span className="truncate text-[11px] text-[var(--codex-faint)]">
                    {CHAMBER_LABELS[pol.chamber as keyof typeof CHAMBER_LABELS] ?? pol.chamber}
                  </span>
                ) : (
                  <span className="text-[12px] text-[var(--codex-sub)]">{pol.state}</span>
                )}
              </div>
              {pol.title && (
                <div className="mt-0.5 truncate text-[12px] text-[var(--codex-faint)]">
                  {pol.title}
                </div>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
