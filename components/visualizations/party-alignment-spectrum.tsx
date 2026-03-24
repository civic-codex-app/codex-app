'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'
import { AvatarImage } from '@/components/ui/avatar-image'

interface PoliticianDot {
  name: string
  slug: string
  party: string
  state: string
  chamber: string
  alignment: number
  imageUrl?: string
}

interface PartyAlignmentSpectrumProps {
  politicians: PoliticianDot[]
}

type ChamberFilter = 'all' | 'senate' | 'house'
type PartyFilter = 'all' | 'democrat' | 'republican' | 'independent'

const TIERS = [
  { key: 'maverick', label: 'Mavericks', description: 'Often votes against their own party', min: 0, max: 25, color: '#EF4444' },
  { key: 'independent', label: 'Independent Streak', description: 'Breaks from party on many issues', min: 25, max: 50, color: '#F97316' },
  { key: 'moderate', label: 'Moderates', description: 'Sometimes crosses party lines', min: 50, max: 70, color: '#A855F7' },
  { key: 'aligned', label: 'Mostly Aligned', description: 'Usually votes with their party', min: 70, max: 85, color: '#60A5FA' },
  { key: 'loyalist', label: 'Party Loyalists', description: 'Almost always follows the party position', min: 85, max: 101, color: '#3B82F6' },
]

export function PartyAlignmentSpectrum({ politicians }: PartyAlignmentSpectrumProps) {
  const [chamber, setChamber] = useState<ChamberFilter>('all')
  const [party, setParty] = useState<PartyFilter>('all')
  const [expandedTier, setExpandedTier] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = politicians
    if (chamber !== 'all') result = result.filter((p) => p.chamber.toLowerCase() === chamber)
    if (party !== 'all') result = result.filter((p) => p.party.toLowerCase() === party)
    return result
  }, [politicians, chamber, party])

  const tieredData = useMemo(() => {
    return TIERS.map((tier) => {
      const members = filtered
        .filter((p) => p.alignment >= tier.min && p.alignment < tier.max)
        .sort((a, b) => a.alignment - b.alignment)
      return { ...tier, members }
    })
  }, [filtered])

  // Notable callouts: the biggest mavericks and most loyal
  const topMavericks = useMemo(() => {
    return [...filtered].sort((a, b) => a.alignment - b.alignment).slice(0, 3)
  }, [filtered])

  const topLoyalists = useMemo(() => {
    return [...filtered].sort((a, b) => b.alignment - a.alignment).slice(0, 3)
  }, [filtered])

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-[0.1em] text-[var(--poli-faint)]">Chamber</span>
        {(['all', 'senate', 'house'] as ChamberFilter[]).map((c) => (
          <button
            key={c}
            onClick={() => setChamber(c)}
            className={`rounded-sm px-2.5 py-1 text-[11px] uppercase tracking-[0.06em] transition-colors ${
              chamber === c
                ? 'bg-[var(--poli-badge-bg)] text-[var(--poli-text)]'
                : 'text-[var(--poli-faint)] hover:text-[var(--poli-sub)]'
            }`}
          >
            {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
        <span className="ml-3 text-[11px] uppercase tracking-[0.1em] text-[var(--poli-faint)]">Party</span>
        {(['all', 'democrat', 'republican', 'independent'] as PartyFilter[]).map((p) => (
          <button
            key={p}
            onClick={() => setParty(p)}
            className={`flex items-center gap-1 rounded-sm px-2.5 py-1 text-[11px] uppercase tracking-[0.06em] transition-colors ${
              party === p
                ? 'bg-[var(--poli-badge-bg)] text-[var(--poli-text)]'
                : 'text-[var(--poli-faint)] hover:text-[var(--poli-sub)]'
            }`}
          >
            {p !== 'all' && <PartyIcon party={p} size={10} />}
            {p === 'all' ? 'All' : ''}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-[var(--poli-faint)]">
          {filtered.length} officials
        </span>
      </div>

      {/* Notable callouts */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {/* Biggest mavericks */}
        <div className="rounded-lg border border-[var(--poli-border)] bg-[var(--poli-card)] p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span className="text-[13px] font-semibold text-[var(--poli-text)]">Biggest Mavericks</span>
          </div>
          <p className="mb-3 text-[12px] text-[var(--poli-faint)]">These politicians break from their party the most</p>
          <div className="space-y-2">
            {topMavericks.map((p) => (
              <Link key={p.slug} href={`/politicians/${p.slug}`} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 no-underline transition-colors hover:bg-[var(--poli-hover)]">
                <AvatarImage src={p.imageUrl ?? null} alt={p.name} size={28} fallbackColor={partyColor(p.party)} party={p.party} className="h-7 w-7 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-[var(--poli-text)]">{p.name}</div>
                  <div className="flex items-center gap-1 text-[11px] text-[var(--poli-faint)]">
                    <PartyIcon party={p.party} size={9} />
                    <span>{p.state}</span>
                  </div>
                </div>
                <span className="text-[13px] font-semibold tabular-nums" style={{ color: '#EF4444' }}>{p.alignment}%</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Most loyal */}
        <div className="rounded-lg border border-[var(--poli-border)] bg-[var(--poli-card)] p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span className="text-[13px] font-semibold text-[var(--poli-text)]">Most Party Loyal</span>
          </div>
          <p className="mb-3 text-[12px] text-[var(--poli-faint)]">These politicians almost never break from their party</p>
          <div className="space-y-2">
            {topLoyalists.map((p) => (
              <Link key={p.slug} href={`/politicians/${p.slug}`} className="flex items-center gap-2.5 rounded-md px-2 py-1.5 no-underline transition-colors hover:bg-[var(--poli-hover)]">
                <AvatarImage src={p.imageUrl ?? null} alt={p.name} size={28} fallbackColor={partyColor(p.party)} party={p.party} className="h-7 w-7 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-[var(--poli-text)]">{p.name}</div>
                  <div className="flex items-center gap-1 text-[11px] text-[var(--poli-faint)]">
                    <PartyIcon party={p.party} size={9} />
                    <span>{p.state}</span>
                  </div>
                </div>
                <span className="text-[13px] font-semibold tabular-nums" style={{ color: '#3B82F6' }}>{p.alignment}%</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Tier breakdown */}
      <div className="space-y-2">
        {tieredData.filter((tier) => tier.members.length > 0).map((tier) => {
          const isExpanded = expandedTier === tier.key
          const showMembers = tier.members.slice(0, isExpanded ? 20 : 0)
          const pct = filtered.length > 0 ? Math.round((tier.members.length / filtered.length) * 100) : 0

          return (
            <div key={tier.key} className="rounded-lg border border-[var(--poli-border)] bg-[var(--poli-card)]">
              <button
                onClick={() => setExpandedTier(isExpanded ? null : tier.key)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--poli-hover)]"
              >
                {/* Color indicator */}
                <div className="h-8 w-1 rounded-full" style={{ backgroundColor: tier.color }} />

                {/* Tier info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-[var(--poli-text)]">{tier.label}</span>
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${tier.color}15`, color: tier.color }}>
                      {tier.members.length}
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--poli-faint)]">{tier.description}</p>
                </div>

                {/* Distribution bar */}
                <div className="hidden w-32 items-center gap-2 sm:flex">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--poli-border)]">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: tier.color }} />
                  </div>
                  <span className="text-[11px] font-medium tabular-nums text-[var(--poli-faint)]">{pct}%</span>
                </div>

                {/* Expand arrow */}
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--poli-faint)" strokeWidth="2" strokeLinecap="round"
                  className={`shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded member list */}
              {isExpanded && tier.members.length > 0 && (
                <div className="border-t border-[var(--poli-border)] px-4 py-3">
                  {/* Party mini-breakdown */}
                  <div className="mb-3 flex flex-wrap gap-2">
                    {(['democrat', 'republican', 'independent'] as const).map((p) => {
                      const count = tier.members.filter((m) => m.party === p).length
                      if (count === 0) return null
                      return (
                        <span key={p} className="flex items-center gap-1 text-[11px] text-[var(--poli-faint)]">
                          <PartyIcon party={p} size={10} />
                          {count}
                        </span>
                      )
                    })}
                  </div>

                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {showMembers.map((p) => {
                      const pColor = partyColor(p.party)
                      return (
                        <Link
                          key={p.slug}
                          href={`/politicians/${p.slug}`}
                          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 no-underline transition-colors hover:bg-[var(--poli-hover)]"
                        >
                          <AvatarImage src={p.imageUrl ?? null} alt={p.name} size={24} fallbackColor={pColor} party={p.party} className="h-6 w-6 rounded-full" />
                          <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--poli-text)]">{p.name}</span>
                          <div className="flex items-center gap-1">
                            <PartyIcon party={p.party} size={10} />
                            <span className="text-[11px] text-[var(--poli-faint)]">{p.state}</span>
                          </div>
                          <span className="text-[12px] font-medium tabular-nums" style={{ color: tier.color }}>{p.alignment}%</span>
                        </Link>
                      )
                    })}
                  </div>
                  {tier.members.length > 20 && !isExpanded && (
                    <p className="mt-2 text-center text-[11px] text-[var(--poli-faint)]">
                      +{tier.members.length - 20} more
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
