'use client'

import { useState } from 'react'
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
  initialCount?: number
  size?: 'default' | 'compact'
}

const GRID_CLASS = 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'

export function StatePoliticianList({ politicians, initialCount = 6, size = 'default' }: Props) {
  const [visible, setVisible] = useState(initialCount)
  const total = politicians.length
  const showing = Math.min(visible, total)
  const hasMore = showing < total
  const remaining = total - showing

  if (total === 0) return null

  const isCompact = size === 'compact'
  const avatarSize = isCompact ? 44 : 56
  const padding = isCompact ? 'p-3' : 'p-4'
  const avatarDim = isCompact ? 'h-[44px] w-[44px]' : 'h-[56px] w-[56px]'
  const nameSize = isCompact ? 'text-[13px]' : 'text-[15px]'

  return (
    <div>
      <div className={GRID_CLASS}>
        {politicians.slice(0, showing).map((pol) => {
          const color = partyColor(pol.party)
          return (
            <Link
              key={pol.id}
              href={`/politicians/${pol.slug}`}
              className="group overflow-hidden rounded-xl border border-[var(--codex-border)] no-underline transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{ backgroundColor: `${color}08` }}
            >
              <div className={`flex items-center gap-${isCompact ? '3' : '4'} ${padding}`}>
                <div
                  className={`${avatarDim} flex-shrink-0 overflow-hidden rounded-xl bg-[var(--codex-card)]`}
                  style={{ border: `${isCompact ? '1.5' : '2'}px solid ${color}33` }}
                >
                  <AvatarImage
                    src={pol.image_url}
                    alt={pol.name}
                    size={avatarSize}
                    party={pol.party}
                    fallbackColor={color}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
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
              </div>
            </Link>
          )
        })}
      </div>
      {hasMore && (
        <button
          onClick={() => setVisible((v) => v + (initialCount || 6))}
          className="mt-3 w-full rounded-lg border border-[var(--codex-border)] py-2.5 text-[13px] font-medium text-[var(--codex-sub)] transition-all hover:border-[var(--codex-text)] hover:text-[var(--codex-text)]"
        >
          Show {Math.min(remaining, initialCount)} more of {total}
        </button>
      )}
    </div>
  )
}
