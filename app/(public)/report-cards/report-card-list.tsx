'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { PartyIcon } from '@/components/icons/party-icons'
import { partyColor } from '@/lib/constants/parties'
import { gradeColor } from '@/lib/utils/report-card'
import type { RankedPolitician } from './page'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'senate', label: 'Senate' },
  { key: 'house', label: 'House' },
  { key: 'governor', label: 'Governor' },
] as const

type TabKey = (typeof TABS)[number]['key']

function barColor(value: number): string {
  if (value >= 75) return '#22C55E'
  if (value >= 55) return '#3B82F6'
  if (value >= 40) return '#EAB308'
  if (value >= 25) return '#F97316'
  return '#EF4444'
}

const DIMS = [
  { key: 'bipartisanship' as const, label: 'BP' },
  { key: 'engagement' as const, label: 'EN' },
  { key: 'transparency' as const, label: 'TR' },
  { key: 'effectiveness' as const, label: 'EF' },
]

export function ReportCardList({
  politicians,
}: {
  politicians: RankedPolitician[]
}) {
  const [tab, setTab] = useState<TabKey>('all')

  const filtered =
    tab === 'all'
      ? politicians
      : politicians.filter((p) => p.chamber === tab)

  return (
    <>
      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              tab === t.key
                ? 'bg-[var(--codex-text)] text-[var(--codex-card)]'
                : 'bg-[var(--codex-hover)] text-[var(--codex-sub)] hover:text-[var(--codex-text)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {filtered.map((p, idx) => {
          const rc = p.reportCard
          const color = gradeColor(rc.grade)
          const pColor = partyColor(p.party)

          return (
            <Link
              key={p.id}
              href={`/politicians/${p.slug}`}
              className="flex items-center gap-3 rounded-lg border border-[var(--codex-border)] bg-[var(--codex-card)] px-4 py-3 transition-colors hover:border-[var(--codex-text)]/10 md:gap-4"
            >
              {/* Rank */}
              <span className="w-7 flex-shrink-0 text-right text-xs font-medium text-[var(--codex-faint)]">
                {idx + 1}
              </span>

              {/* Avatar */}
              <div
                className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border"
                style={{ borderColor: `${pColor}30` }}
              >
                <AvatarImage
                  src={p.image_url}
                  alt={p.name}
                  size={40}
                  fallbackColor={pColor}
                  party={p.party}
                />
              </div>

              {/* Name + meta */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[var(--codex-text)]">
                  {p.name}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--codex-faint)]">
                  <PartyIcon party={p.party} size={10} />
                  <span>{p.state}</span>
                  <span className="text-[var(--codex-border)]">|</span>
                  <span className="capitalize">{p.chamber}</span>
                </div>
              </div>

              {/* Mini dimension bars (hidden on small screens) */}
              <div className="hidden flex-shrink-0 gap-2 sm:flex">
                {DIMS.map((dim) => {
                  const value = rc[dim.key]
                  return (
                    <div key={dim.key} className="flex w-14 flex-col items-center gap-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-[var(--codex-faint)]">
                        {dim.label}
                      </span>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--codex-border)]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${value}%`,
                            backgroundColor: barColor(value),
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Score + Grade */}
              <div className="flex flex-shrink-0 items-center gap-2.5">
                <span className="text-sm font-medium text-[var(--codex-sub)]">
                  {rc.score}
                </span>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{
                    border: `2px solid ${color}`,
                    background: `${color}10`,
                  }}
                >
                  <span
                    className="font-serif text-base font-bold leading-none"
                    style={{ color }}
                  >
                    {rc.grade}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--codex-faint)]">
            No politicians found for this filter.
          </div>
        )}
      </div>
    </>
  )
}
