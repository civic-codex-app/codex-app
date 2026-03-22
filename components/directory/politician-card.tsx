'use client'

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
  const color = partyColor(politician.party)
  const isAppointed = politician.chamber === 'presidential' &&
    !['President of the United States', 'Vice President of the United States'].includes(politician.title ?? '')

  const total = stances ? stances.supports + stances.opposes + stances.mixed : 0

  return (
    <Link
      href={`/politicians/${politician.slug}`}
      className="touch-feedback group grid grid-cols-[48px_1fr_auto] items-center gap-3 border-b border-[var(--codex-border)] px-3 py-[14px] no-underline transition-all duration-300 sm:grid-cols-[56px_1fr_auto] sm:gap-4 sm:py-[18px] hover:bg-[var(--codex-hover)]"
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className="h-12 w-12 overflow-hidden rounded-lg bg-[var(--codex-card)] transition-colors sm:h-14 sm:w-14"
          style={{ border: `2px solid var(--codex-border)` }}
        >
          {politician.image_url ? (
            <Image
              src={politician.image_url}
              alt={politician.name}
              width={56}
              height={56}
              unoptimized
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ background: `${color}08` }}>
              <PartyIcon party={politician.party} size={20} />
            </div>
          )}
        </div>
        {politician.image_url && (
          <div className="absolute -bottom-0.5 -right-0.5 flex h-[20px] w-[20px] items-center justify-center rounded-full border-2 border-[var(--codex-bg)] bg-[var(--codex-bg)] sm:h-[22px] sm:w-[22px]">
            <PartyIcon party={politician.party} size={11} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <div className="truncate text-[17px] font-semibold leading-tight text-[var(--codex-text)] transition-colors duration-200 group-hover:text-[var(--codex-sub)] sm:text-[19px]">
          {politician.name}
        </div>
        <div className="mb-1 flex items-center gap-2 truncate text-[12px] text-[var(--codex-sub)] sm:mb-1.5 sm:text-[13px]">
          <span className="truncate">{politician.title} &middot; {politician.state}</span>
          {isAppointed && (
            <span className="hidden shrink-0 rounded bg-[var(--codex-badge-bg)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--codex-faint)] sm:inline">
              Appointed
            </span>
          )}
        </div>

        {/* Stance dot strip + alignment */}
        {total > 0 && (
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Mini stance bar */}
            <div className="flex h-[5px] w-16 overflow-hidden rounded-full bg-[var(--codex-border)] sm:h-[6px] sm:w-24">
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
            <span className="hidden text-[11px] tabular-nums text-[var(--codex-faint)] sm:inline">
              {total} issues
            </span>
            {alignment !== undefined && alignment >= 0 && (
              <>
                <span className="hidden text-[var(--codex-faint)] sm:inline">·</span>
                <span
                  className="hidden text-[11px] tabular-nums sm:inline"
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
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden text-[12px] tracking-[0.05em] text-[var(--codex-faint)] sm:inline">
          {CHAMBER_LABELS[politician.chamber as ChamberKey] ?? politician.chamber}
        </span>
        <span className="text-lg text-[var(--codex-faint)] transition-all duration-200 group-hover:text-[var(--codex-sub)] sm:group-hover:translate-x-[3px]">
          →
        </span>
      </div>
    </Link>
  )
}
