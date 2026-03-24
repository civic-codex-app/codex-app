'use client'

import { useState, useMemo } from 'react'
import { IssueIcon } from '@/components/icons/issue-icon'

interface PartyStanceData {
  supports: number   // includes strongly_supports, supports, leans_support
  opposes: number    // includes strongly_opposes, opposes, leans_oppose
  neutral: number    // neutral stances
  mixed: number
}

interface IssueStanceRow {
  issue: string
  issueSlug: string
  icon: string
  parties: {
    democrat: PartyStanceData
    republican: PartyStanceData
    independent: PartyStanceData
  }
}

interface IssueHeatmapProps {
  stanceData: IssueStanceRow[]
}

type SortMode = 'divided' | 'consensus' | 'alphabetical'

const PARTY_COLUMNS: { key: 'democrat' | 'republican' | 'independent'; label: string; color: string }[] = [
  { key: 'democrat', label: 'Dem', color: '#2563EB' },
  { key: 'republican', label: 'Rep', color: '#DC2626' },
  { key: 'independent', label: 'Ind', color: '#7C3AED' },
]

function stanceTotal(data: PartyStanceData): number {
  return data.supports + data.opposes + data.mixed + (data.neutral ?? 0)
}

function stanceColor(data: PartyStanceData): string {
  const total = stanceTotal(data)
  if (total === 0) return 'var(--poli-border)'
  const supportPct = data.supports / total
  const opposePct = data.opposes / total
  if (supportPct > 0.6) return '#2563EB'
  if (opposePct > 0.6) return '#DC2626'
  return '#8B5CF6'
}

function stanceOpacity(data: PartyStanceData): number {
  const total = stanceTotal(data)
  if (total === 0) return 0.15
  const max = Math.max(data.supports, data.opposes, data.mixed, data.neutral ?? 0)
  return 0.35 + (max / total) * 0.65
}

function divisionScore(row: IssueStanceRow): number {
  const parties = [row.parties.democrat, row.parties.republican, row.parties.independent]
  const supportRatios = parties.map((p) => {
    const total = p.supports + p.opposes + p.mixed
    return total > 0 ? p.supports / total : 0.5
  })
  const max = Math.max(...supportRatios)
  const min = Math.min(...supportRatios)
  return max - min
}

export function IssueHeatmap({ stanceData }: IssueHeatmapProps) {
  const [sortMode, setSortMode] = useState<SortMode>('divided')
  const [activeCell, setActiveCell] = useState<{ issue: string; party: string } | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const sorted = useMemo(() => {
    const copy = [...stanceData]
    switch (sortMode) {
      case 'divided':
        return copy.sort((a, b) => divisionScore(b) - divisionScore(a))
      case 'consensus':
        return copy.sort((a, b) => divisionScore(a) - divisionScore(b))
      case 'alphabetical':
        return copy.sort((a, b) => a.issue.localeCompare(b.issue))
    }
  }, [stanceData, sortMode])

  return (
    <div className="w-full">
      {/* Sort controls */}
      <div className="mb-5 flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-[0.1em] text-[var(--poli-faint)]">Sort by</span>
        {(['divided', 'consensus', 'alphabetical'] as SortMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setSortMode(mode)}
            className={`rounded-sm px-2.5 py-1 text-[11px] uppercase tracking-[0.06em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)] ${
              sortMode === mode
                ? 'bg-[var(--poli-badge-bg)] text-[var(--poli-text)]'
                : 'text-[var(--poli-faint)] hover:text-[var(--poli-sub)]'
            }`}
            aria-pressed={sortMode === mode}
          >
            {mode === 'divided' ? 'Biggest Disagreements' : mode === 'consensus' ? 'Most Agreement' : 'A\u2013Z'}
          </button>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div>
          {/* Column headers */}
          <div className="mb-2 grid items-end gap-1" style={{ gridTemplateColumns: '1fr repeat(3, minmax(60px, 100px))' }}>
            <div />
            {PARTY_COLUMNS.map((col) => (
              <div
                key={col.key}
                className="text-center text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: col.color }}
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-[3px]">
            {sorted.map((row) => (
              <div
                key={row.issueSlug}
                className="grid items-center gap-1 rounded-sm"
                style={{ gridTemplateColumns: '1fr repeat(3, minmax(60px, 100px))' }}
              >
                {/* Issue label */}
                <div className="flex items-center gap-2 pr-3">
                  <IssueIcon icon={row.icon} size={15} className="flex-shrink-0 text-[var(--poli-sub)]" />
                  <span className="truncate text-[13px] font-semibold text-[var(--poli-sub)]">
                    {row.issue}
                  </span>
                </div>

                {/* Party cells */}
                {PARTY_COLUMNS.map((col) => {
                  const data = row.parties[col.key]
                  const total = stanceTotal(data)
                  const isActive = activeCell?.issue === row.issueSlug && activeCell?.party === col.key
                  const color = stanceColor(data)
                  const opacity = stanceOpacity(data)

                  return (
                    <div
                      key={col.key}
                      className="relative cursor-default"
                      onClick={() => setActiveCell(isActive ? null : { issue: row.issueSlug, party: col.key })}
                      onMouseEnter={() => setActiveCell({ issue: row.issueSlug, party: col.key })}
                      onMouseLeave={() => setActiveCell(null)}
                      tabIndex={0}
                      role="gridcell"
                      aria-label={`${row.issue}, ${col.label}: ${data.supports} support, ${data.neutral ?? 0} neutral, ${data.mixed} mixed, ${data.opposes} oppose`}
                    >
                      {/* Cell background */}
                      <div
                        className="flex h-9 items-center justify-center rounded-[3px] transition-all duration-200"
                        style={{
                          background: color,
                          opacity,
                          transform: isActive ? 'scale(1.04)' : 'scale(1)',
                          boxShadow: isActive ? `0 0 12px ${color}33` : 'none',
                        }}
                      >
                        {total > 0 && (
                          <div className="flex h-full w-full overflow-hidden rounded-[3px]">
                            {data.supports > 0 && (
                              <div
                                className="h-full"
                                style={{ width: `${(data.supports / total) * 100}%`, opacity: 0.85, backgroundColor: '#2563EB' }}
                              />
                            )}
                            {(data.neutral ?? 0) > 0 && (
                              <div
                                className="h-full"
                                style={{ width: `${((data.neutral ?? 0) / total) * 100}%`, opacity: 0.6, backgroundColor: '#9CA3AF' }}
                              />
                            )}
                            {data.mixed > 0 && (
                              <div
                                className="h-full"
                                style={{ width: `${(data.mixed / total) * 100}%`, opacity: 0.85, backgroundColor: '#8B5CF6' }}
                              />
                            )}
                            {data.opposes > 0 && (
                              <div
                                className="h-full"
                                style={{ width: `${(data.opposes / total) * 100}%`, opacity: 0.85, backgroundColor: '#DC2626' }}
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Tooltip */}
                      {isActive && total > 0 && (
                        <div
                          className="absolute -top-2 left-1/2 z-20 -translate-x-1/2 -translate-y-full rounded-md border border-[var(--poli-border)] bg-[var(--poli-card)] px-3 py-2 shadow-lg"
                          role="tooltip"
                        >
                          <div className="whitespace-nowrap text-center">
                            <div className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[var(--poli-faint)]">
                              {row.issue}
                            </div>
                            <div className="flex items-center gap-2 text-[12px]">
                              <span style={{ color: '#2563EB' }}>
                                {data.supports} <span className="text-[10px]">for</span>
                              </span>
                              {(data.neutral ?? 0) > 0 && (
                                <span style={{ color: '#9CA3AF' }}>
                                  {data.neutral} <span className="text-[10px]">neutral</span>
                                </span>
                              )}
                              <span style={{ color: '#8B5CF6' }}>
                                {data.mixed} <span className="text-[10px]">mixed</span>
                              </span>
                              <span style={{ color: '#DC2626' }}>
                                {data.opposes} <span className="text-[10px]">against</span>
                              </span>
                            </div>
                          </div>
                          {/* Tooltip arrow */}
                          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[var(--poli-card)]" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Tap hint for mobile */}
          <p className="mt-3 text-center text-[11px] text-[var(--poli-faint)] sm:hidden">
            Tap any colored bar to see the breakdown
          </p>

          {/* Legend */}
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--poli-border)] pt-4 sm:gap-5">
            <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--poli-faint)]">Legend</span>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm" style={{ opacity: 0.75, backgroundColor: '#2563EB' }} />
              <span className="text-[11px] text-[var(--poli-faint)]">Favors this issue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm" style={{ opacity: 0.75, backgroundColor: '#8B5CF6' }} />
              <span className="text-[11px] text-[var(--poli-faint)]">Mixed views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm" style={{ opacity: 0.75, backgroundColor: '#DC2626' }} />
              <span className="text-[11px] text-[var(--poli-faint)]">Opposes this issue</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
