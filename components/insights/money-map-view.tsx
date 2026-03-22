'use client'

import { useState } from 'react'
import Link from 'next/link'
import { USMap, STATE_NAMES } from '@/components/visualizations/us-map'
import { partyColor } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'

type Metric = 'raised' | 'spent' | 'cash'

interface StateFin {
  raised: number
  spent: number
  cash: number
  count: number
  politicians: Array<{
    name: string
    slug: string
    party: string
    raised: number
    spent: number
    cash: number
  }>
}

interface MoneyMapViewProps {
  stateFinance: Record<string, StateFin>
}

function formatMoney(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount.toLocaleString()}`
}

const METRIC_LABELS: Record<Metric, string> = {
  raised: 'Money Raised',
  spent: 'Money Spent',
  cash: 'Money Left to Spend',
}

export function MoneyMapView({ stateFinance }: MoneyMapViewProps) {
  const [metric, setMetric] = useState<Metric>('raised')
  const [selectedState, setSelectedState] = useState<string | null>(null)

  // Build state data with a 5-tier color scale based on percentile ranking
  const entries = Object.entries(stateFinance).map(([state, sf]) => ({
    state,
    val: sf[metric],
  }))
  const sorted = [...entries].sort((a, b) => a.val - b.val)
  const rankMap = new Map<string, number>()
  sorted.forEach((e, i) => rankMap.set(e.state, i / Math.max(sorted.length - 1, 1)))

  // Color tiers: light yellow → orange → deep red (heat map style)
  const COLORS = [
    '#FEF3C7', // very low — pale yellow
    '#FDE68A', // low — yellow
    '#FBBF24', // medium — amber
    '#F97316', // high — orange
    '#DC2626', // very high — red
  ]

  function getColor(percentile: number): string {
    const idx = Math.min(Math.floor(percentile * COLORS.length), COLORS.length - 1)
    return COLORS[idx]
  }

  const stateData: Record<string, { value: number; label?: string; color?: string }> = {}
  for (const [state, sf] of Object.entries(stateFinance)) {
    const val = sf[metric]
    const pct = rankMap.get(state) ?? 0
    stateData[state] = {
      value: val,
      label: formatMoney(val),
      color: val > 0 ? getColor(pct) : undefined,
    }
  }

  const selectedData = selectedState ? stateFinance[selectedState] : null

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-2 flex items-center gap-2 text-[12px] text-[var(--codex-faint)]">
        <Link href="/insights" className="hover:text-[var(--codex-text)]">Insights</Link>
        <span>/</span>
        <span>Money Map</span>
      </div>

      <h1 className="mb-2 text-[clamp(24px,4vw,36px)] font-bold leading-[1.1]">
        Money Map
      </h1>
      <p className="mb-6 text-[14px] leading-relaxed text-[var(--codex-sub)]">
        See how much money politicians raise and spend in each state. Click a state to see individual politician breakdowns.
      </p>

      {/* Metric selector */}
      <div className="mb-4 flex gap-2">
        {(Object.keys(METRIC_LABELS) as Metric[]).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${
              metric === m
                ? 'bg-[var(--codex-text)] text-[var(--codex-card)]'
                : 'border border-[var(--codex-border)] text-[var(--codex-sub)] hover:border-[var(--codex-text)] hover:text-[var(--codex-text)]'
            }`}
          >
            {METRIC_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="rounded-lg border border-[var(--codex-border)] p-4">
        <USMap
          stateData={stateData}
          onStateClick={(code) => setSelectedState(selectedState === code ? null : code)}
          legend={[
            { color: '#DC2626', label: 'Highest' },
            { color: '#F97316', label: 'High' },
            { color: '#FBBF24', label: 'Medium' },
            { color: '#FEF3C7', label: 'Low' },
            { color: 'var(--codex-hover)', label: 'No Data' },
          ]}
        />
        <p className="mt-2 text-center text-[12px] text-[var(--codex-faint)]">
          Darker color = more money
        </p>
      </div>

      {/* State detail panel */}
      {selectedState && selectedData && (
        <div className="mt-6 rounded-lg border border-[var(--codex-border)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {STATE_NAMES[selectedState] ?? selectedState}
            </h2>
            <button
              onClick={() => setSelectedState(null)}
              className="text-[var(--codex-faint)] hover:text-[var(--codex-text)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* State totals */}
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Money Raised</div>
              <div className="text-lg font-semibold text-[var(--codex-text)]">{formatMoney(selectedData.raised)}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Money Spent</div>
              <div className="text-lg font-semibold text-[var(--codex-text)]">{formatMoney(selectedData.spent)}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Money Left to Spend</div>
              <div className="text-lg font-semibold text-[var(--codex-text)]">{formatMoney(selectedData.cash)}</div>
            </div>
          </div>

          {/* Politician breakdown */}
          <h3 className="mb-2 text-sm font-semibold text-[var(--codex-sub)]">
            Politicians ({selectedData.count})
          </h3>
          <div className="space-y-1">
            {selectedData.politicians.slice(0, 15).map((p) => (
              <div key={p.slug} className="flex items-center gap-3 rounded-md border border-[var(--codex-border)] px-3 py-2">
                <PartyIcon party={p.party} size={12} />
                <Link href={`/politicians/${p.slug}`} className="flex-1 truncate text-[13px] font-medium text-[var(--codex-text)] hover:underline">
                  {p.name}
                </Link>
                <span className="text-[12px] tabular-nums text-[var(--codex-sub)]">
                  {formatMoney(p[metric])}
                </span>
              </div>
            ))}
            {selectedData.politicians.length > 15 && (
              <p className="pt-1 text-center text-[11px] text-[var(--codex-faint)]">
                +{selectedData.politicians.length - 15} more
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
