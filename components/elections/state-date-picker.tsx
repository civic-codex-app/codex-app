'use client'

import { useState } from 'react'
import { STATE_NAMES } from '@/lib/constants/us-states'
import { KeyDatesTimeline } from '@/components/elections/key-dates-timeline'

interface KeyDate {
  date_type: string
  event_date: string
  description: string | null
  source_url: string | null
  state: string | null
}

interface StateDatePickerProps {
  allKeyDates: KeyDate[]
  electionDate: string
  initialState: string | null
}

export function StateDatePicker({
  allKeyDates,
  electionDate,
  initialState,
}: StateDatePickerProps) {
  const [selectedState, setSelectedState] = useState<string>(initialState || '')

  // Filter dates for the selected state (state can be null for national-level dates)
  const filteredDates = selectedState
    ? allKeyDates.filter(
        d => d.state === selectedState || d.state === null
      )
    : []

  // Strip the `state` field for the timeline component
  const timelineDates = filteredDates.map(({ date_type, event_date, description, source_url }) => ({
    date_type,
    event_date,
    description,
    source_url,
  }))

  const stateEntries = Object.entries(STATE_NAMES).sort((a, b) =>
    a[1].localeCompare(b[1])
  )

  return (
    <div>
      {/* State selector */}
      <div className="mb-6">
        <label
          htmlFor="state-select"
          className="mb-2 block text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]"
        >
          Select your state
        </label>
        <select
          id="state-select"
          value={selectedState}
          onChange={e => setSelectedState(e.target.value)}
          className="w-full max-w-xs rounded-md border border-[var(--codex-input-border)] bg-[var(--codex-card)] px-3 py-2 text-sm text-[var(--codex-text)] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Choose a state...</option>
          {stateEntries.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      {selectedState ? (
        timelineDates.length > 0 ? (
          <div>
            <h3 className="mb-3 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              Key Dates for {STATE_NAMES[selectedState] || selectedState}
            </h3>
            <KeyDatesTimeline dates={timelineDates} electionDate={electionDate} />
          </div>
        ) : (
          <div className="rounded-md border border-[var(--codex-border)] bg-[var(--codex-hover)] px-4 py-6 text-center">
            <p className="text-sm text-[var(--codex-faint)]">
              No key dates available for {STATE_NAMES[selectedState] || selectedState} yet.
            </p>
            <p className="mt-1 text-[12px] text-[var(--codex-faint)]">
              Election Day is {new Date(electionDate + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}.
            </p>
          </div>
        )
      ) : (
        <div className="rounded-md border border-dashed border-[var(--codex-border)] px-4 py-8 text-center">
          <p className="text-sm text-[var(--codex-faint)]">
            Select a state above to see registration deadlines, early voting dates, and more.
          </p>
        </div>
      )}
    </div>
  )
}
