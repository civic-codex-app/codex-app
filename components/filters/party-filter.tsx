'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'

const PARTIES = [
  { key: '', label: 'All' },
  { key: 'democrat', label: 'Democrat', color: '#2563EB' },
  { key: 'republican', label: 'Republican', color: '#DC2626' },
  { key: 'independent', label: 'Independent', color: '#7C3AED' },
]

export function PartyFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const current = searchParams.get('party') ?? ''

  function handleClick(party: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (party) {
        params.set('party', party)
      } else {
        params.delete('party')
      }
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="Filter by party">
      {PARTIES.map((p) => (
        <button
          key={p.key}
          onClick={() => handleClick(p.key)}
          role="radio"
          aria-checked={current === p.key}
          className={cn(
            'rounded-sm px-3 py-1.5 text-[11px] font-medium tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)]',
            current === p.key
              ? 'text-[var(--poli-text)]'
              : 'text-[var(--poli-faint)] hover:text-[var(--poli-sub)]'
          )}
          style={
            current === p.key && p.color
              ? { background: `${p.color}18`, border: `1px solid ${p.color}33` }
              : current === p.key
                ? { background: 'var(--poli-badge-bg)', border: '1px solid var(--poli-border)' }
                : { background: 'transparent', border: '1px solid transparent' }
          }
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
