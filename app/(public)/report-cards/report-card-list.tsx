'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { PartyIcon } from '@/components/icons/party-icons'
import { partyColor } from '@/lib/constants/parties'
import type { RankedPolitician } from './page'

const CHAMBER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'senate', label: 'Senate' },
  { key: 'house', label: 'House' },
  { key: 'governor', label: 'Governor' },
] as const

const PARTY_TABS = [
  { key: 'all', label: 'All Parties' },
  { key: 'democrat', label: 'Democratic' },
  { key: 'republican', label: 'Republican' },
  { key: 'independent', label: 'Independent' },
] as const

type ChamberKey = (typeof CHAMBER_TABS)[number]['key']
type PartyKey = (typeof PARTY_TABS)[number]['key']

function tierColor(score: number): string {
  if (score >= 80) return '#22C55E'
  if (score >= 65) return '#3B82F6'
  if (score >= 50) return '#8B5CF6'
  if (score >= 35) return '#EAB308'
  return '#9CA3AF'
}

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

const PAGE_SIZE = 50

export function ReportCardList({ politicians }: { politicians: RankedPolitician[] }) {
  const [chamber, setChamber] = useState<ChamberKey>('all')
  const [party, setParty] = useState<PartyKey>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let list = politicians
    if (chamber !== 'all') list = list.filter((p) => p.chamber === chamber)
    if (party !== 'all') list = list.filter((p) => p.party === party)
    return list
  }, [politicians, chamber, party])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // Reset page when filters change
  const handleChamber = (key: ChamberKey) => { setChamber(key); setPage(1) }
  const handleParty = (key: PartyKey) => { setParty(key); setPage(1) }

  return (
    <>
      {/* Filter rows */}
      <div className="mb-3 flex flex-wrap gap-2">
        {CHAMBER_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleChamber(t.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              chamber === t.key
                ? 'bg-[var(--poli-text)] text-[var(--poli-card)]'
                : 'bg-[var(--poli-hover)] text-[var(--poli-sub)] hover:text-[var(--poli-text)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {PARTY_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleParty(t.key)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              party === t.key
                ? 'border border-[var(--poli-text)] text-[var(--poli-text)]'
                : 'border border-[var(--poli-border)] text-[var(--poli-faint)] hover:text-[var(--poli-sub)]'
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto self-center text-[11px] text-[var(--poli-faint)]">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {pageItems.map((p, idx) => {
          const rc = p.reportCard
          const color = tierColor(rc.score)
          const pColor = partyColor(p.party)
          const rank = (safePage - 1) * PAGE_SIZE + idx + 1

          return (
            <Link
              key={p.id}
              href={`/politicians/${p.slug}`}
              className="flex items-center gap-3 rounded-lg border border-[var(--poli-border)] bg-[var(--poli-card)] px-4 py-3 no-underline transition-colors hover:border-[var(--poli-text)]/10 md:gap-4"
            >
              <span className="w-7 flex-shrink-0 text-right text-xs font-medium text-[var(--poli-faint)]">
                {rank}
              </span>
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
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[var(--poli-text)]">
                  {p.name}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--poli-faint)]">
                  <PartyIcon party={p.party} size={10} />
                  <span>{p.state}</span>
                  <span className="text-[var(--poli-border)]">|</span>
                  <span className="capitalize">{p.chamber}</span>
                </div>
              </div>

              {/* Mini dimension bars (desktop) */}
              <div className="hidden flex-shrink-0 gap-2 sm:flex">
                {DIMS.map((dim) => {
                  const value = rc[dim.key]
                  if (value < 0) return null
                  return (
                    <div key={dim.key} className="flex w-14 flex-col items-center gap-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-[var(--poli-faint)]">
                        {dim.label}
                      </span>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--poli-border)]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${value}%`, backgroundColor: barColor(value) }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <span className="flex-shrink-0 text-lg font-semibold font-bold" style={{ color }}>
                {rc.score}
              </span>
            </Link>
          )
        })}

        {pageItems.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--poli-faint)]">
            No politicians found for these filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <span className="text-[11px] text-[var(--poli-faint)]">
            Page {safePage} of {totalPages}
          </span>
          <div className="flex gap-2">
            {safePage > 1 && (
              <button
                onClick={() => setPage(safePage - 1)}
                className="rounded-md border border-[var(--poli-border)] px-3 py-1.5 text-sm text-[var(--poli-sub)] hover:bg-[var(--poli-hover)]"
              >
                Previous
              </button>
            )}
            {safePage < totalPages && (
              <button
                onClick={() => setPage(safePage + 1)}
                className="rounded-md border border-[var(--poli-border)] px-3 py-1.5 text-sm text-[var(--poli-sub)] hover:bg-[var(--poli-hover)]"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
