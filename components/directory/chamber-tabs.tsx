'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { CHAMBERS, CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { cn } from '@/lib/utils'

export function ChamberTabs() {
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
      router.push(`/?${params.toString()}`)
    })
  }

  return (
    <div className="mb-9 -mx-6 animate-fade-up overflow-x-auto border-b border-[var(--codex-border)] px-6 sm:mx-0 sm:px-0" role="tablist" aria-label="Filter by chamber">
      <div className="flex min-w-max gap-0">
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
          </button>
        ))}
      </div>
    </div>
  )
}
