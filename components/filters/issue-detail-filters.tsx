'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'

const PARTIES = [
  { key: '', label: 'All Parties' },
  { key: 'democrat', label: 'Democrat', color: '#2563EB' },
  { key: 'republican', label: 'Republican', color: '#DC2626' },
  { key: 'independent', label: 'Independent', color: '#7C3AED' },
]

const CHAMBERS = [
  { key: '', label: 'All' },
  { key: 'senate', label: 'Senate' },
  { key: 'house', label: 'House' },
  { key: 'governor', label: 'Governor' },
]

export function IssueDetailFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const currentParty = searchParams.get('party') ?? ''
  const currentChamber = searchParams.get('chamber') ?? ''

  function updateParam(key: string, value: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="mb-8 flex animate-fade-up flex-wrap items-center gap-3">
      {/* Party pills */}
      <div className="flex gap-1.5" role="radiogroup" aria-label="Filter by party">
        {PARTIES.map((p) => (
          <button
            key={p.key}
            onClick={() => updateParam('party', p.key)}
            role="radio"
            aria-checked={currentParty === p.key}
            className={cn(
              'rounded-sm px-3 py-1.5 text-[11px] font-medium tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--codex-input-focus)]',
              currentParty === p.key
                ? 'text-[var(--codex-text)]'
                : 'text-[var(--codex-faint)] hover:text-[var(--codex-sub)]'
            )}
            style={
              currentParty === p.key && p.color
                ? { background: `${p.color}18`, border: `1px solid ${p.color}33` }
                : currentParty === p.key
                  ? { background: 'var(--codex-badge-bg)', border: '1px solid var(--codex-border)' }
                  : { background: 'transparent', border: '1px solid transparent' }
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-[var(--codex-border)]" />

      {/* Chamber pills */}
      <div className="flex gap-1.5" role="radiogroup" aria-label="Filter by chamber">
        {CHAMBERS.map((c) => (
          <button
            key={c.key}
            onClick={() => updateParam('chamber', c.key)}
            role="radio"
            aria-checked={currentChamber === c.key}
            className={cn(
              'rounded-sm px-3 py-1.5 text-[11px] font-medium tracking-wide transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--codex-input-focus)]',
              currentChamber === c.key
                ? 'bg-[var(--codex-badge-bg)] text-[var(--codex-text)] border-[var(--codex-border)]'
                : 'text-[var(--codex-faint)] hover:text-[var(--codex-sub)] border-transparent'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
