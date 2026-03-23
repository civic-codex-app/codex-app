'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
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
  size?: 'default' | 'compact'
}

export function StatePoliticianList({ politicians, size = 'default' }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll, { passive: true })
    const observer = new ResizeObserver(checkScroll)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      observer.disconnect()
    }
  }, [checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.querySelector('a')?.offsetWidth ?? 280
    const gap = 12
    const scrollAmount = (cardWidth + gap) * 3
    el.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' })
  }

  if (politicians.length === 0) return null

  const isCompact = size === 'compact'
  const avatarSize = isCompact ? 44 : 56
  const padding = isCompact ? 'p-3' : 'p-4'
  const avatarDim = isCompact ? 'h-[44px] w-[44px]' : 'h-[56px] w-[56px]'
  const nameSize = isCompact ? 'text-[13px]' : 'text-[15px]'
  const cardWidth = isCompact ? 'w-[240px]' : 'w-[280px]'

  return (
    <div className="relative">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-[var(--codex-border)] bg-[var(--codex-card)] p-2 shadow-md transition-all hover:border-[var(--codex-text)] md:flex"
          aria-label="Scroll left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-[var(--codex-border)] bg-[var(--codex-card)] p-2 shadow-md transition-all hover:border-[var(--codex-text)] md:flex"
          aria-label="Scroll right"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-2 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {politicians.map((pol) => {
          const color = partyColor(pol.party)
          return (
            <Link
              key={pol.id}
              href={`/politicians/${pol.slug}`}
              className={`${cardWidth} flex-shrink-0 overflow-hidden rounded-xl border border-[var(--codex-border)] no-underline transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
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
    </div>
  )
}
