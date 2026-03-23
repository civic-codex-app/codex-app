'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { USMap, STATE_NAMES } from '@/components/visualizations/us-map'
import { partyColor } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'
import { AvatarImage } from '@/components/ui/avatar-image'

type Metric = 'raised' | 'spent' | 'cash'

interface Politician {
  name: string
  slug: string
  party: string
  raised: number
  spent: number
  cash: number
}

interface StateFin {
  raised: number
  spent: number
  cash: number
  count: number
  politicians: Politician[]
}

interface PartyTotal {
  raised: number
  spent: number
  cash: number
  count: number
}

interface MoneyMapViewProps {
  stateFinance: Record<string, StateFin>
  partyTotals: Record<string, PartyTotal>
  topRaised: Politician[]
  topSpent: Politician[]
  stateDominantParty: Record<string, string>
}

function formatMoney(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`
  return `$${amount.toLocaleString()}`
}

const METRIC_LABELS: Record<Metric, string> = {
  raised: 'Money Raised',
  spent: 'Money Spent',
  cash: 'Cash on Hand',
}

export function MoneyMapView({ stateFinance, partyTotals, topRaised, topSpent, stateDominantParty }: MoneyMapViewProps) {
  const [metric, setMetric] = useState<Metric>('raised')
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [rankTab, setRankTab] = useState<'raised' | 'spent'>('raised')

  // National totals
  const national = useMemo(() => {
    let raised = 0, spent = 0, cash = 0, count = 0
    for (const sf of Object.values(stateFinance)) {
      raised += sf.raised
      spent += sf.spent
      cash += sf.cash
      count += sf.count
    }
    return { raised, spent, cash, count }
  }, [stateFinance])

  // Sorted parties for bar chart
  const sortedParties = useMemo(() => {
    return Object.entries(partyTotals)
      .sort((a, b) => b[1][metric] - a[1][metric])
  }, [partyTotals, metric])

  const maxPartyVal = sortedParties[0]?.[1][metric] ?? 1

  // Build map colors — party-colored by dominant fundraiser
  const stateData: Record<string, { value: number; label?: string; color?: string }> = {}
  const entries = Object.entries(stateFinance).map(([state, sf]) => ({ state, val: sf[metric] }))
  const sortedEntries = [...entries].sort((a, b) => a.val - b.val)
  const rankMap = new Map<string, number>()
  sortedEntries.forEach((e, i) => rankMap.set(e.state, i / Math.max(sortedEntries.length - 1, 1)))

  for (const [state, sf] of Object.entries(stateFinance)) {
    const val = sf[metric]
    const dominantParty = stateDominantParty[state]
    const baseColor = partyColor(dominantParty)
    const pct = rankMap.get(state) ?? 0
    // Vary opacity by percentile rank (0.25 to 0.95)
    const opacity = 0.25 + pct * 0.7
    stateData[state] = {
      value: val,
      label: formatMoney(val),
      color: val > 0 ? baseColor + Math.round(opacity * 255).toString(16).padStart(2, '0') : undefined,
    }
  }

  const selectedData = selectedState ? stateFinance[selectedState] : null

  // Party breakdown for selected state
  const statePartyBreakdown = useMemo(() => {
    if (!selectedData) return []
    const map: Record<string, { raised: number; spent: number; cash: number; count: number }> = {}
    for (const p of selectedData.politicians) {
      if (!map[p.party]) map[p.party] = { raised: 0, spent: 0, cash: 0, count: 0 }
      map[p.party].raised += p.raised
      map[p.party].spent += p.spent
      map[p.party].cash += p.cash
      map[p.party].count++
    }
    return Object.entries(map).sort((a, b) => b[1][metric] - a[1][metric])
  }, [selectedData, metric])

  const rankList = rankTab === 'raised' ? topRaised : topSpent

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
        Follow the money in U.S. politics. Map is colored by which party raises the most per state.
      </p>

      {/* National stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md border border-[var(--codex-border)] p-3 text-center">
          <div className="text-2xl font-bold text-[var(--codex-text)]">{formatMoney(national.raised)}</div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Total Raised</div>
        </div>
        <div className="rounded-md border border-[var(--codex-border)] p-3 text-center">
          <div className="text-2xl font-bold text-[var(--codex-text)]">{formatMoney(national.spent)}</div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Total Spent</div>
        </div>
        <div className="rounded-md border border-[var(--codex-border)] p-3 text-center">
          <div className="text-2xl font-bold text-[var(--codex-text)]">{formatMoney(national.cash)}</div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Cash on Hand</div>
        </div>
        <div className="rounded-md border border-[var(--codex-border)] p-3 text-center">
          <div className="text-2xl font-bold text-[var(--codex-text)]">{national.count}</div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Politicians</div>
        </div>
      </div>

      {/* Party breakdown bars */}
      <div className="mb-6 rounded-md border border-[var(--codex-border)] p-4">
        <h2 className="mb-3 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
          By Party
        </h2>
        <div className="space-y-3">
          {sortedParties.map(([party, totals]) => {
            const val = totals[metric]
            const pct = (val / maxPartyVal) * 100
            const color = partyColor(party)
            return (
              <div key={party}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PartyIcon party={party} size={14} />
                    <span className="text-[13px] font-medium text-[var(--codex-text)]">
                      {totals.count} politicians
                    </span>
                  </div>
                  <span className="text-[13px] font-semibold tabular-nums" style={{ color }}>
                    {formatMoney(val)}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--codex-border)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
                <div className="mt-0.5 flex gap-4 text-[10px] text-[var(--codex-faint)]">
                  <span>Raised: {formatMoney(totals.raised)}</span>
                  <span>Spent: {formatMoney(totals.spent)}</span>
                  <span>Cash: {formatMoney(totals.cash)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

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
            { color: partyColor('democrat'), label: 'Democrat-dominated' },
            { color: partyColor('republican'), label: 'Republican-dominated' },
            { color: partyColor('independent'), label: 'Independent-dominated' },
            { color: 'var(--codex-hover)', label: 'No data' },
          ]}
        />
        <p className="mt-2 text-center text-[12px] text-[var(--codex-faint)]">
          Color = dominant party &middot; Intensity = amount &middot; Click a state for details
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
              className="rounded-full p-1 text-[var(--codex-faint)] hover:bg-[var(--codex-hover)] hover:text-[var(--codex-text)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* State totals */}
          <div className="mb-5 grid grid-cols-3 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Raised</div>
              <div className="text-lg font-semibold text-[var(--codex-text)]">{formatMoney(selectedData.raised)}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Spent</div>
              <div className="text-lg font-semibold text-[var(--codex-text)]">{formatMoney(selectedData.spent)}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">Cash on Hand</div>
              <div className="text-lg font-semibold text-[var(--codex-text)]">{formatMoney(selectedData.cash)}</div>
            </div>
          </div>

          {/* State party breakdown */}
          {statePartyBreakdown.length > 1 && (
            <div className="mb-5">
              <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--codex-faint)]">
                Party Breakdown
              </h3>
              {/* Stacked bar */}
              <div className="mb-2 flex h-3 overflow-hidden rounded-full">
                {statePartyBreakdown.map(([party, totals]) => {
                  const pct = (totals[metric] / selectedData[metric]) * 100
                  return (
                    <div
                      key={party}
                      style={{ width: `${pct}%`, backgroundColor: partyColor(party) }}
                      title={`${formatMoney(totals[metric])}`}
                    />
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-3">
                {statePartyBreakdown.map(([party, totals]) => (
                  <div key={party} className="flex items-center gap-1.5 text-[11px]">
                    <PartyIcon party={party} size={10} />
                    <span className="tabular-nums text-[var(--codex-sub)]">
                      {formatMoney(totals[metric])}
                    </span>
                    <span className="text-[var(--codex-faint)]">
                      ({Math.round((totals[metric] / selectedData[metric]) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Politician list with bars */}
          <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--codex-faint)]">
            Politicians ({selectedData.count})
          </h3>
          <div className="space-y-1">
            {selectedData.politicians.slice(0, 20).map((p, i) => {
              const maxInState = selectedData.politicians[0]?.[metric] ?? 1
              const barPct = (p[metric] / maxInState) * 100
              const color = partyColor(p.party)
              return (
                <Link
                  key={p.slug}
                  href={`/politicians/${p.slug}`}
                  className="group flex items-center gap-3 rounded-md border border-[var(--codex-border)] px-3 py-2.5 no-underline transition-colors hover:border-[var(--codex-input-border)] hover:bg-[var(--codex-hover)]"
                >
                  <span className="w-5 text-right text-[11px] tabular-nums text-[var(--codex-faint)]">
                    {i + 1}
                  </span>
                  <PartyIcon party={p.party} size={12} />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--codex-text)] group-hover:underline">
                    {p.name}
                  </span>
                  <div className="hidden w-24 sm:block">
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--codex-border)]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${barPct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                  <span className="text-[12px] font-semibold tabular-nums" style={{ color }}>
                    {formatMoney(p[metric])}
                  </span>
                </Link>
              )
            })}
            {selectedData.politicians.length > 20 && (
              <p className="pt-1 text-center text-[11px] text-[var(--codex-faint)]">
                +{selectedData.politicians.length - 20} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* National rankings */}
      <div className="mt-8 rounded-lg border border-[var(--codex-border)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
            National Rankings
          </h2>
          <div className="flex gap-1">
            {(['raised', 'spent'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setRankTab(t)}
                className={`rounded-sm px-2.5 py-1 text-[11px] uppercase tracking-[0.06em] transition-colors ${
                  rankTab === t
                    ? 'bg-[var(--codex-badge-bg)] text-[var(--codex-text)]'
                    : 'text-[var(--codex-faint)] hover:text-[var(--codex-sub)]'
                }`}
              >
                Top {t === 'raised' ? 'Fundraisers' : 'Spenders'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {rankList.map((p, i) => {
            const val = rankTab === 'raised' ? p.raised : p.spent
            const maxVal = rankTab === 'raised' ? topRaised[0]?.raised : topSpent[0]?.spent
            const barPct = (val / (maxVal || 1)) * 100
            const color = partyColor(p.party)
            return (
              <Link
                key={`${p.slug}-${i}`}
                href={`/politicians/${p.slug}`}
                className="group flex items-center gap-3 rounded-md px-3 py-2 no-underline transition-colors hover:bg-[var(--codex-hover)]"
              >
                <span className="w-5 text-right text-[12px] font-semibold tabular-nums text-[var(--codex-faint)]">
                  {i + 1}
                </span>
                <PartyIcon party={p.party} size={12} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--codex-text)] group-hover:underline">
                  {p.name}
                </span>
                <div className="hidden w-32 sm:block">
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--codex-border)]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${barPct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
                <span className="text-[12px] font-semibold tabular-nums" style={{ color }}>
                  {formatMoney(val)}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
