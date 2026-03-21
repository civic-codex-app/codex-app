'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { CHAMBERS, CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { cn } from '@/lib/utils'

interface ChamberTabsProps {
  chamberCounts?: Partial<Record<ChamberKey, number>>
}

export function ChamberTabs({ chamberCounts }: ChamberTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const current = (searchParams.get('chamber') ?? 'all') as ChamberKey

  function handleClick(chamber: ChamberKey) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (chamber === 'all') {
        params.delete('chamber')
      } else {
        params.set('chamber', chamber)
      }
      params.delete('page')
      router.push(`/?${params.toString()}`)
    })
  }

  return (
    <div className="mb-6 -mx-6 animate-fade-up px-6 sm:mx-0 sm:mb-9 sm:border-b sm:border-[var(--codex-border)] sm:px-0" role="tablist" aria-label="Filter by chamber">
      {/* Mobile: pill scroller */}
      <div className="scroll-x-momentum flex gap-2 pb-2 sm:hidden snap-x snap-mandatory">
        {CHAMBERS.map((c) => (
          <button
            key={c}
            onClick={() => handleClick(c)}
            role="tab"
            aria-selected={current === c}
            className={cn(
              'touch-feedback flex-shrink-0 snap-start whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-all',
              current === c
                ? 'bg-[var(--codex-text)] text-[var(--codex-bg)]'
                : 'bg-[var(--codex-badge-bg)] text-[var(--codex-sub)]'
            )}
          >
            {CHAMBER_LABELS[c]}
            {chamberCounts && c !== 'all' && chamberCounts[c] ? (
              <span className={cn('ml-1.5 text-[11px]', current === c ? 'opacity-70' : 'opacity-50')}>
                {chamberCounts[c]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Desktop: underline tabs */}
      <div className="hidden min-w-max gap-0 sm:flex">
        {CHAMBERS.map((c) => (
          <button
            key={c}
            onClick={() => handleClick(c)}
            role="tab"
            aria-selected={current === c}
            className={cn(
              'whitespace-nowrap border-b-2 px-4 py-3 font-sans text-[13px] transition-all sm:px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--codex-input-focus)]',
              current === c
                ? 'border-[var(--codex-text)] font-semibold text-[var(--codex-text)]'
                : 'border-transparent font-normal text-[var(--codex-faint)] hover:text-[var(--codex-sub)]'
            )}
          >
            {CHAMBER_LABELS[c]}
            {chamberCounts && c !== 'all' && chamberCounts[c] ? (
              <span className="ml-1.5 text-[11px] text-[var(--codex-faint)]">
                {chamberCounts[c]}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}
