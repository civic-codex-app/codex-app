'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { PartyIcon } from '@/components/icons/party-icons'
import { STATE_NAMES } from '@/lib/constants/us-states'

const PARTY_OPTIONS = [
  { value: '', label: 'All Parties' },
  { value: 'democrat', label: 'Democrat' },
  { value: 'republican', label: 'Republican' },
  { value: 'independent', label: 'Independent' },
]

export function FeedFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentParty = searchParams.get('party') ?? ''
  const currentState = searchParams.get('state') ?? ''

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Reset page when filter changes
      params.delete('page')
      router.push(`/feed?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Party filter pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {PARTY_OPTIONS.map((opt) => {
          const isActive = currentParty === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateFilter('party', opt.value)}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                borderColor: isActive ? 'var(--codex-text)' : 'var(--codex-border)',
                backgroundColor: isActive ? 'var(--codex-hover)' : 'transparent',
                color: isActive ? 'var(--codex-text)' : 'var(--codex-sub)',
                cursor: 'pointer',
              }}
            >
              {opt.value && <PartyIcon party={opt.value} size={12} />}
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* State dropdown */}
      <select
        value={currentState}
        onChange={(e) => updateFilter('state', e.target.value)}
        className="rounded-lg border border-[var(--codex-border)] bg-transparent px-3 py-1.5 text-xs text-[var(--codex-text)] outline-none transition-colors focus:border-[var(--codex-input-focus)]"
        style={{ cursor: 'pointer' }}
      >
        <option value="">All States</option>
        {Object.entries(STATE_NAMES).map(([abbr, name]) => (
          <option key={abbr} value={abbr}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}
