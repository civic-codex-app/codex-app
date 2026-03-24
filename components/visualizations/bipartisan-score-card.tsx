'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'

interface PoliticianScore {
  name: string
  slug: string
  party: string
  state: string
  imageUrl?: string
  bipartisanScore: number
}

interface BipartisanScoreCardProps {
  politicians: PoliticianScore[]
  title?: string
  subtitle?: string
  limit?: number
}

export function BipartisanScoreCard({
  politicians,
  title = 'Bipartisan Index',
  subtitle,
  limit = 10,
}: BipartisanScoreCardProps) {
  const [mounted, setMounted] = useState(false)
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null)

  useEffect(() => {
    // Delay to trigger bar animation
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const sorted = politicians.slice(0, limit)

  const maxScore = Math.max(...sorted.map((p) => p.bipartisanScore), 1)

  return (
    <div className="w-full">
      <h3 className="mb-1 text-lg font-semibold text-[var(--poli-text)]">{title}</h3>
      {subtitle && (
        <p className="mb-5 text-[13px] text-[var(--poli-faint)]">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-5" />}

      <div className="space-y-1">
        {sorted.map((p, i) => {
          const color = partyColor(p.party)
          const barWidth = mounted ? (p.bipartisanScore / maxScore) * 100 : 0
          const isHovered = hoveredSlug === p.slug

          return (
            <Link
              key={p.slug}
              href={`/politicians/${p.slug}`}
              className="group flex items-center gap-3 rounded-md px-3 py-2 no-underline transition-colors hover:bg-[var(--poli-hover)]"
              onMouseEnter={() => setHoveredSlug(p.slug)}
              onMouseLeave={() => setHoveredSlug(null)}
              aria-label={`${p.name}, ${partyLabel(p.party)}, ${p.state} - bipartisan score ${p.bipartisanScore}%`}
            >
              {/* Rank */}
              <span className="w-5 shrink-0 text-right text-[13px] text-[var(--poli-faint)]">
                {i + 1}
              </span>

              {/* Avatar */}
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--poli-border)]"
                style={{ borderColor: isHovered ? color : undefined }}
              >
                <AvatarImage
                  src={p.imageUrl || ''}
                  alt={p.name}
                  size={32}
                  party={p.party}
                  fallbackColor={color}
                />
              </div>

              {/* Name + party pill */}
              <div className="min-w-0 shrink" style={{ width: 140 }}>
                <div className="truncate text-[13px] text-[var(--poli-text)] transition-colors group-hover:text-[var(--poli-text)]">
                  {p.name}
                </div>
                <div className="flex items-center gap-1.5">
                  <PartyIcon party={p.party} size={10} />
                  <span className="text-[10px] text-[var(--poli-faint)]">{p.state}</span>
                </div>
              </div>

              {/* Bar */}
              <div className="relative flex-1">
                <div className="h-5 overflow-hidden rounded-sm bg-[var(--poli-border)]" style={{ opacity: 0.3 }}>
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${barWidth}%`,
                      background: `linear-gradient(90deg, ${color}55, ${color}bb)`,
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                      transitionDelay: `${i * 50}ms`,
                    }}
                  />
                </div>
              </div>

              {/* Score */}
              <span
                className="w-12 shrink-0 text-right text-[14px] font-semibold transition-colors"
                style={{ color: isHovered ? color : 'var(--poli-sub)' }}
              >
                {p.bipartisanScore}%
              </span>
            </Link>
          )
        })}
      </div>

      {politicians.length === 0 && (
        <div className="py-10 text-center text-[var(--poli-faint)]">
          <span className="text-sm">No data available</span>
        </div>
      )}
    </div>
  )
}
