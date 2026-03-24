'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import { US_STATES, STATE_NAMES } from '@/lib/constants/us-states'

interface ChamberTab {
  key: string
  label: string
  count: number
}

interface ElectionFiltersProps {
  chamberCounts?: Record<string, number>
}

const CHAMBER_ORDER = [
  { key: 'all', label: 'All Races' },
  { key: 'senate', label: 'Senate' },
  { key: 'house', label: 'House' },
  { key: 'governor', label: 'Governor' },
  { key: 'mayor', label: 'Mayor' },
  { key: 'state_senate', label: 'State Senate' },
  { key: 'state_house', label: 'State House' },
  { key: 'city_council', label: 'City Council' },
  { key: 'county', label: 'County' },
  { key: 'school_board', label: 'School Board' },
  { key: 'other_local', label: 'Other Local' },
]

export function ElectionFilters({ chamberCounts = {} }: ElectionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const currentChamber = searchParams.get('chamber') ?? 'all'
  const currentState = searchParams.get('state') ?? ''

  function updateParam(key: string, value: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/elections?${params.toString()}`)
    })
  }

  // Only show chamber tabs that have races (or always show 'all')
  const totalCount = Object.values(chamberCounts).reduce((a, b) => a + b, 0)
  const visibleTabs = CHAMBER_ORDER.filter(
    (c) => c.key === 'all' || (chamberCounts[c.key] ?? 0) > 0
  )

  return (
    <div className="mb-8 flex animate-fade-up flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      {/* Chamber tabs */}
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Filter by chamber">
        {visibleTabs.map((c) => {
          const count = c.key === 'all' ? totalCount : (chamberCounts[c.key] ?? 0)
          return (
            <button
              key={c.key}
              onClick={() => updateParam('chamber', c.key)}
              role="radio"
              aria-checked={currentChamber === c.key}
              className={cn(
                'rounded-sm px-3 py-1.5 text-[11px] font-medium tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)]',
                currentChamber === c.key
                  ? 'bg-[var(--poli-badge-bg)] text-[var(--poli-text)] border border-[var(--poli-border)]'
                  : 'text-[var(--poli-faint)] hover:text-[var(--poli-sub)] border border-transparent'
              )}
            >
              {c.label}
              {count > 0 && (
                <span className={cn(
                  'ml-1.5 tabular-nums',
                  currentChamber === c.key
                    ? 'text-[var(--poli-sub)]'
                    : 'text-[var(--poli-faint)]'
                )}>
                  ({count})
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="hidden h-5 w-px bg-[var(--poli-border)] sm:block" />

      {/* State dropdown */}
      <label htmlFor="election-state-filter" className="sr-only">Filter by state</label>
      <select
        id="election-state-filter"
        value={currentState}
        onChange={(e) => updateParam('state', e.target.value)}
        className="h-9 rounded-sm border border-[var(--poli-border)] bg-[var(--poli-input-bg)] px-3 pr-7 text-[12px] text-[var(--poli-text)] outline-none transition-colors focus:border-[var(--poli-input-focus)] focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)] appearance-none cursor-pointer"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
      >
        <option value="">All States</option>
        {US_STATES.map((s) => (
          <option key={s} value={s}>
            {s} — {STATE_NAMES[s]}
          </option>
        ))}
      </select>
    </div>
  )
}
