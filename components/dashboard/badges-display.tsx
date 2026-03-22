'use client'

import { useState } from 'react'
import { BADGES } from '@/lib/constants/badges'

interface BadgesDisplayProps {
  earnedBadges: string[]
}

export function BadgesDisplay({ earnedBadges }: BadgesDisplayProps) {
  const earnedSet = new Set(earnedBadges)
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null)

  return (
    <div className="rounded-lg border border-[var(--codex-border)] p-5">
      <h3 className="mb-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
        Badges
      </h3>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {BADGES.map((badge) => {
          const earned = earnedSet.has(badge.id)
          return (
            <div
              key={badge.id}
              className="relative"
              onMouseEnter={() => setHoveredBadge(badge.id)}
              onMouseLeave={() => setHoveredBadge(null)}
            >
              <div
                className="flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all"
                style={{
                  borderColor: earned
                    ? 'rgba(251,191,36,0.4)'
                    : 'var(--codex-border)',
                  background: earned
                    ? 'rgba(251,191,36,0.06)'
                    : 'transparent',
                  opacity: earned ? 1 : 0.4,
                  boxShadow: earned
                    ? '0 0 12px rgba(251,191,36,0.1)'
                    : 'none',
                }}
              >
                <div className="relative text-2xl leading-none">
                  {badge.icon}
                  {!earned && (
                    <div className="absolute -bottom-0.5 -right-1 text-[11px]">
                      {'\u{1F512}'}
                    </div>
                  )}
                </div>
                <span
                  className="text-[11px] font-medium leading-tight"
                  style={{
                    color: earned
                      ? 'var(--codex-text)'
                      : 'var(--codex-faint)',
                  }}
                >
                  {badge.name}
                </span>
              </div>

              {/* Tooltip */}
              {hoveredBadge === badge.id && (
                <div
                  className="absolute -top-2 left-1/2 z-10 w-48 -translate-x-1/2 -translate-y-full rounded-lg border border-[var(--codex-border)] px-3 py-2 text-center shadow-lg"
                  style={{ background: 'var(--codex-card)' }}
                >
                  <p className="text-[12px] font-medium text-[var(--codex-text)]">
                    {badge.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--codex-faint)]">
                    {earned ? badge.description : badge.requirement}
                  </p>
                  <div
                    className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-[var(--codex-border)]"
                    style={{ background: 'var(--codex-card)' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress summary */}
      <p className="mt-4 text-center text-[12px] text-[var(--codex-faint)]">
        {earnedBadges.length} of {BADGES.length} badges earned
      </p>
    </div>
  )
}
