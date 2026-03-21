'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PartyIcon } from '@/components/icons/party-icons'
import { partyColor } from '@/lib/constants/parties'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import type { Politician } from '@/lib/types/politician'

interface StanceData {
  supports: number
  opposes: number
  mixed: number
}

interface PoliticianCardProps {
  politician: Politician
  alignment?: number // 0-100, -1 = no data
  stances?: StanceData
}

const STANCE_COLORS = {
  supports: '#22C55E',
  opposes: '#EF4444',
  mixed: '#EAB308',
}

export function PoliticianCard({ politician, alignment, stances }: PoliticianCardProps) {
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)
  const color = partyColor(politician.party)
  const isAppointed = politician.chamber === 'presidential' &&
    !['President of the United States', 'Vice President of the United States'].includes(politician.title ?? '')

  const total = stances ? stances.supports + stances.opposes + stances.mixed : 0

  return (
    <Link
      href={`/politicians/${politician.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="grid grid-cols-[56px_1fr_auto] items-center gap-4 border-b border-[var(--codex-border)] px-3 py-[18px] transition-all duration-300"
      style={{ background: hovered ? 'var(--codex-hover)' : 'transparent' }}
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className="h-14 w-14 overflow-hidden rounded-full bg-[var(--codex-card)] transition-colors"
          style={{ border: `2px solid ${hovered ? color : 'var(--codex-border)'}` }}
        >
          {!imgError && politician.image_url ? (
            <Image
              src={politician.image_url}
              alt={politician.name}
              width={56}
              height={56}
              unoptimized
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-[filter] duration-300"
              style={{ filter: hovered ? 'none' : 'grayscale(40%)' }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-serif text-[22px] text-[var(--codex-text)] opacity-40" aria-hidden="true">
              {politician.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-[var(--codex-bg)] bg-[var(--codex-bg)]">
          <PartyIcon party={politician.party} size={12} />
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0">
        <div
          className="font-serif text-[19px] leading-tight transition-colors duration-200"
          style={{ color: hovered ? color : 'var(--codex-text)' }}
        >
          {politician.name}
        </div>
        <div className="mb-1.5 flex items-center gap-2 truncate text-[13px] text-[var(--codex-sub)]">
          <span className="truncate">{politician.title} &middot; {politician.state}</span>
          {isAppointed && (
            <span className="shrink-0 rounded bg-[var(--codex-badge-bg)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--codex-faint)]">
              Appointed
            </span>
          )}
        </div>

        {/* Stance dot strip + alignment */}
        {total > 0 && (
          <div className="flex items-center gap-2.5">
            {/* Mini stance bar */}
            <div className="flex h-[6px] w-24 overflow-hidden rounded-full bg-[var(--codex-border)]">
              {stances!.supports > 0 && (
                <div
                  style={{
                    width: `${(stances!.supports / total) * 100}%`,
                    background: STANCE_COLORS.supports,
                    opacity: 0.75,
                  }}
                />
              )}
              {stances!.mixed > 0 && (
                <div
                  style={{
                    width: `${(stances!.mixed / total) * 100}%`,
                    background: STANCE_COLORS.mixed,
                    opacity: 0.75,
                  }}
                />
              )}
              {stances!.opposes > 0 && (
                <div
                  style={{
                    width: `${(stances!.opposes / total) * 100}%`,
                    background: STANCE_COLORS.opposes,
                    opacity: 0.75,
                  }}
                />
              )}
            </div>
            <span className="text-[11px] tabular-nums text-[var(--codex-faint)]">
              {total} issues
            </span>
            {alignment !== undefined && alignment >= 0 && (
              <>
                <span className="text-[var(--codex-faint)]">·</span>
                <span
                  className="text-[11px] tabular-nums"
                  style={{ color: alignment >= 80 ? color : 'var(--codex-faint)' }}
                >
                  {alignment}% aligned
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Chamber + Arrow */}
      <div className="flex items-center gap-3">
        <span className="hidden text-[12px] tracking-[0.05em] text-[var(--codex-faint)] sm:inline">
          {CHAMBER_LABELS[politician.chamber as ChamberKey] ?? politician.chamber}
        </span>
        <span
          className="text-lg transition-all duration-200"
          style={{
            color: hovered ? 'var(--codex-sub)' : 'var(--codex-faint)',
            transform: hovered ? 'translateX(3px)' : 'none',
          }}
        >
          →
        </span>
      </div>
    </Link>
  )
}
