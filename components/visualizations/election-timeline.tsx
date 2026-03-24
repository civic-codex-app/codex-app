'use client'

import { useState } from 'react'
import { partyColor } from '@/lib/constants/parties'

interface ElectionResult {
  election_year: number
  result: string // 'won' | 'lost'
  vote_percentage: number
  opponent_name: string
  opponent_vote_percentage: number
  chamber: string
  state: string
  notes?: string
}

interface ElectionTimelineProps {
  results: ElectionResult[]
  party: string
}

export function ElectionTimeline({ results, party }: ElectionTimelineProps) {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null)

  const color = partyColor(party)
  const sorted = [...results].sort((a, b) => a.election_year - b.election_year)

  if (sorted.length === 0) {
    return (
      <div className="py-10 text-center text-[var(--poli-faint)]">
        <span className="text-sm">No election history available</span>
      </div>
    )
  }

  return (
    <div className="w-full" role="list" aria-label="Election history timeline">
      {sorted.map((result, i) => {
        const isWon = result.result.toLowerCase() === 'won'
        const isHovered = hoveredYear === result.election_year
        const nodeColor = isWon ? '#22C55E' : '#EF4444'
        const maxPct = Math.max(result.vote_percentage, result.opponent_vote_percentage, 1)

        return (
          <div
            key={`${result.election_year}-${i}`}
            className="group relative flex gap-5"
            onMouseEnter={() => setHoveredYear(result.election_year)}
            onMouseLeave={() => setHoveredYear(null)}
            role="listitem"
            aria-label={`${result.election_year}: ${result.result} with ${result.vote_percentage}% of the vote`}
          >
            {/* Timeline spine */}
            <div className="relative flex flex-col items-center" style={{ width: 32 }}>
              {/* Vertical line */}
              {i < sorted.length - 1 && (
                <div
                  className="absolute left-1/2 top-5 w-px -translate-x-1/2"
                  style={{
                    height: 'calc(100% - 4px)',
                    background: `linear-gradient(to bottom, ${nodeColor}44, var(--poli-border))`,
                  }}
                />
              )}
              {/* Dot above line if not first */}
              {i > 0 && (
                <div
                  className="absolute -top-1 left-1/2 w-px -translate-x-1/2"
                  style={{
                    height: 8,
                    background: 'var(--poli-border)',
                  }}
                />
              )}

              {/* Node circle */}
              <div
                className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200"
                style={{
                  borderColor: nodeColor,
                  background: isHovered ? `${nodeColor}22` : 'var(--poli-card)',
                  transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {isWon ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={nodeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={nodeColor} strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </div>
            </div>

            {/* Content */}
            <div
              className="flex-1 rounded-md border border-[var(--poli-border)] bg-[var(--poli-card)] p-4 transition-all duration-200"
              style={{
                marginBottom: 16,
                borderColor: isHovered ? `${nodeColor}33` : undefined,
              }}
            >
              {/* Year + result badge */}
              <div className="mb-3 flex items-center gap-3">
                <span className="text-xl font-semibold text-[var(--poli-text)]">
                  {result.election_year}
                </span>
                <span
                  className="rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{
                    color: nodeColor,
                    background: `${nodeColor}18`,
                  }}
                >
                  {result.result.toUpperCase()}
                </span>
                <span className="text-[11px] text-[var(--poli-faint)]">
                  {result.chamber} | {result.state}
                </span>
              </div>

              {/* Vote comparison bars */}
              <div className="space-y-2">
                {/* Candidate bar */}
                <div>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-[11px] font-medium text-[var(--poli-sub)]">Candidate</span>
                    <span className="text-[14px] font-semibold" style={{ color }}>
                      {result.vote_percentage}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--poli-border)]" style={{ opacity: 0.5 }}>
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${(result.vote_percentage / maxPct) * 100}%`,
                        background: `linear-gradient(90deg, ${color}77, ${color})`,
                      }}
                    />
                  </div>
                </div>

                {/* Opponent bar */}
                <div>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-[11px] text-[var(--poli-faint)]">
                      {result.opponent_name || 'Opponent'}
                    </span>
                    <span className="text-[13px] text-[var(--poli-faint)]">
                      {result.opponent_vote_percentage}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--poli-border)]" style={{ opacity: 0.5 }}>
                    <div
                      className="h-full rounded-full bg-[var(--poli-faint)] transition-all duration-700 ease-out"
                      style={{
                        width: `${(result.opponent_vote_percentage / maxPct) * 100}%`,
                        opacity: 0.4,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              {result.notes && (
                <p className="mt-2 text-[11px] italic text-[var(--poli-faint)]">
                  {result.notes}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
