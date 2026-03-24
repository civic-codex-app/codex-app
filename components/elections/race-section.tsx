'use client'

import { useState } from 'react'
import { RaceCard } from './race-card'

interface Race {
  id: string
  slug: string
  name: string
  state: string
  chamber: string
  district?: string | null
  description?: string | null
  incumbent_id?: string | null
  candidates?: Array<{
    id: string
    name: string
    party: string
    is_incumbent: boolean
    status: string
    image_url?: string | null
    politician_id?: string | null
  }>
  incumbent?: {
    id: string
    name: string
    party: string
    image_url?: string | null
    slug: string
  } | null
}

interface RaceSectionProps {
  label: string
  races: Race[]
  initialLimit?: number
}

export function RaceSection({ label, races, initialLimit = 20 }: RaceSectionProps) {
  const [showAll, setShowAll] = useState(false)
  const needsPagination = races.length > initialLimit
  const visibleRaces = showAll ? races : races.slice(0, initialLimit)

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-xs font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
        {label} Races
        <span className="ml-2 text-[var(--poli-faint)]">{races.length}</span>
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleRaces.map((race) => (
          <RaceCard key={race.id} race={race} />
        ))}
      </div>
      {needsPagination && !showAll && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAll(true)}
            className="rounded-sm border border-[var(--poli-border)] bg-[var(--poli-card)] px-6 py-2.5 text-[12px] font-medium tracking-wide text-[var(--poli-sub)] transition-all hover:border-[var(--poli-input-border)] hover:text-[var(--poli-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)]"
          >
            Show all {races.length} {label.toLowerCase()} races
          </button>
        </div>
      )}
      {showAll && needsPagination && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAll(false)}
            className="text-[12px] text-[var(--poli-faint)] transition-colors hover:text-[var(--poli-sub)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)]"
          >
            Show fewer
          </button>
        </div>
      )}
    </section>
  )
}
