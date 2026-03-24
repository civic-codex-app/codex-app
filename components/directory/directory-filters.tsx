'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { PartyIcon } from '@/components/icons/party-icons'

interface FilterCounts {
  parties: Record<string, number>
  chambers: Record<string, number>
  states: Record<string, number>
}

interface Props {
  counts: FilterCounts
  stateNames: Record<string, string>
}

const CHAMBER_GROUPS = [
  {
    label: 'Federal',
    chambers: [
      { key: 'senate', label: 'Senate' },
      { key: 'house', label: 'House' },
      { key: 'governor', label: 'Governor' },
    ],
  },
  {
    label: 'State & Local',
    chambers: [
      { key: 'state_senate', label: 'State Senate' },
      { key: 'state_house', label: 'State House' },
      { key: 'mayor', label: 'Mayor' },
      { key: 'city_council', label: 'City Council' },
      { key: 'county', label: 'County' },
      { key: 'school_board', label: 'School Board' },
      { key: 'other_local', label: 'Other' },
    ],
  },
]

const PARTIES = [
  { key: 'democrat', label: 'Democrat' },
  { key: 'republican', label: 'Republican' },
  { key: 'independent', label: 'Independent' },
]

export function DirectoryFilters({ counts, stateNames }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentParty = searchParams.get('party') ?? ''
  const currentChamber = searchParams.get('chamber') ?? ''
  const currentState = searchParams.get('state') ?? ''

  function setFilter(key: string, value: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Reset page when filters change
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  function clearAll() {
    startTransition(() => {
      router.push(pathname)
    })
  }

  const hasFilters = currentParty || currentChamber || currentState

  // Filter states to only those with results
  const activeStates = Object.entries(counts.states)
    .filter(([, count]) => count > 0)
    .sort((a, b) => {
      const nameA = stateNames[a[0]] ?? a[0]
      const nameB = stateNames[b[0]] ?? b[0]
      return nameA.localeCompare(nameB)
    })

  return (
    <div
      className="mb-6 space-y-4"
      style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 150ms' }}
    >
      {/* Party filter */}
      <div>
        <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--poli-faint)]">
          Party
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter('party', '')}
            className="rounded-md px-3 py-1.5 text-[12px] font-medium transition-all"
            style={
              !currentParty
                ? { background: 'var(--poli-badge-bg)', color: 'var(--poli-text)', border: '1px solid var(--poli-border)' }
                : { background: 'transparent', color: 'var(--poli-faint)', border: '1px solid transparent' }
            }
          >
            All
          </button>
          {PARTIES.map((p) => {
            const count = counts.parties[p.key] ?? 0
            if (count === 0) return null
            const isActive = currentParty === p.key
            return (
              <button
                key={p.key}
                onClick={() => setFilter('party', isActive ? '' : p.key)}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-all"
                style={
                  isActive
                    ? { background: 'var(--poli-badge-bg)', color: 'var(--poli-text)', border: '1px solid var(--poli-border)' }
                    : { background: 'transparent', color: 'var(--poli-faint)', border: '1px solid transparent' }
                }
              >
                <PartyIcon party={p.key} size={11} />
                {p.label}
                <span className="text-[10px] tabular-nums opacity-50">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chamber filter */}
      <div>
        <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--poli-faint)]">
          Level
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter('chamber', '')}
            className="rounded-md px-3 py-1.5 text-[12px] font-medium transition-all"
            style={
              !currentChamber
                ? { background: 'var(--poli-badge-bg)', color: 'var(--poli-text)', border: '1px solid var(--poli-border)' }
                : { background: 'transparent', color: 'var(--poli-faint)', border: '1px solid transparent' }
            }
          >
            All
          </button>
          {CHAMBER_GROUPS.map((group) => {
            const visibleChambers = group.chambers.filter((c) => (counts.chambers[c.key] ?? 0) > 0)
            if (visibleChambers.length === 0) return null
            return visibleChambers.map((c) => {
              const count = counts.chambers[c.key] ?? 0
              const isActive = currentChamber === c.key
              return (
                <button
                  key={c.key}
                  onClick={() => setFilter('chamber', isActive ? '' : c.key)}
                  className="rounded-md px-3 py-1.5 text-[12px] font-medium transition-all"
                  style={
                    isActive
                      ? { background: 'var(--poli-badge-bg)', color: 'var(--poli-text)', border: '1px solid var(--poli-border)' }
                      : { background: 'transparent', color: 'var(--poli-faint)', border: '1px solid transparent' }
                  }
                >
                  {c.label}
                  <span className="ml-1 text-[10px] tabular-nums opacity-50">{count}</span>
                </button>
              )
            })
          })}
        </div>
      </div>

      {/* State filter */}
      <div>
        <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--poli-faint)]">
          State
        </div>
        <select
          value={currentState}
          onChange={(e) => setFilter('state', e.target.value)}
          className="h-9 rounded-md border border-[var(--poli-border)] bg-transparent px-3 pr-8 text-[12px] text-[var(--poli-text)] outline-none transition-colors focus:border-[var(--poli-text)] appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
          }}
        >
          <option value="">All States ({activeStates.reduce((s, [, c]) => s + c, 0)})</option>
          {activeStates.map(([abbr, count]) => (
            <option key={abbr} value={abbr}>
              {stateNames[abbr] ?? abbr} ({count})
            </option>
          ))}
        </select>
      </div>

      {/* Active filters / clear */}
      {hasFilters && (
        <div className="flex items-center gap-2">
          <button
            onClick={clearAll}
            className="text-[11px] text-[var(--poli-faint)] underline underline-offset-2 transition-colors hover:text-[var(--poli-text)]"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
