'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { USMap, STATE_NAMES } from '@/components/visualizations/us-map'
import { IssueIcon } from '@/components/icons/issue-icon'
import { stanceStyle, STANCE_STYLES } from '@/lib/utils/stances'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { X, MapPin, ChevronDown } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Issue {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface PoliticianStance {
  name: string
  slug: string
  stance: string
  party: string
  image_url: string | null
}

interface IssueMapViewProps {
  issues: Issue[]
  /** { [issueSlug]: { [stateCode]: averageNumeric } } */
  stateIssueAverages: Record<string, Record<string, number>>
  /** { [issueSlug]: { [stateCode]: politicians[] } } */
  politiciansByStateIssue: Record<
    string,
    Record<string, PoliticianStance[]>
  >
}

/* ------------------------------------------------------------------ */
/*  Color scale: 0-6 numeric stance -> hex color                       */
/* ------------------------------------------------------------------ */

function stanceColorScale(value: number): string {
  // 6 = strongly supports (deep green)
  // 5 = supports (green)
  // 4 = leans support (light green)
  // 3 = neutral/mixed (gray)
  // 2 = leans oppose (light red)
  // 1 = opposes (red)
  // 0 = strongly opposes (deep red)
  if (value >= 5.5) return '#059669' // emerald-600
  if (value >= 4.5) return '#10B981' // emerald-500
  if (value >= 3.5) return '#6EE7B7' // emerald-300
  if (value >= 2.5) return '#9CA3AF' // gray-400
  if (value >= 1.5) return '#FCA5A5' // red-300
  if (value >= 0.5) return '#EF4444' // red-500
  return '#DC2626' // red-600
}

function stanceLabelFromAvg(value: number): string {
  if (value >= 5.5) return 'Strongly Supports'
  if (value >= 4.5) return 'Supports'
  if (value >= 3.5) return 'Leans Support'
  if (value >= 2.5) return 'Neutral / Mixed'
  if (value >= 1.5) return 'Leans Oppose'
  if (value >= 0.5) return 'Opposes'
  return 'Strongly Opposes'
}

/* ------------------------------------------------------------------ */
/*  Legend                                                              */
/* ------------------------------------------------------------------ */

const LEGEND = [
  { color: '#059669', label: 'Strongly Supports' },
  { color: '#10B981', label: 'Supports' },
  { color: '#6EE7B7', label: 'Leans Support' },
  { color: '#9CA3AF', label: 'Neutral / Mixed' },
  { color: '#FCA5A5', label: 'Leans Oppose' },
  { color: '#EF4444', label: 'Opposes' },
  { color: '#DC2626', label: 'Strongly Opposes' },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function IssueMapView({
  issues,
  stateIssueAverages,
  politiciansByStateIssue,
}: IssueMapViewProps) {
  const [selectedIssue, setSelectedIssue] = useState<string>(
    issues[0]?.slug ?? '',
  )
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const currentIssue = useMemo(
    () => issues.find((i) => i.slug === selectedIssue),
    [issues, selectedIssue],
  )

  // Build stateData for the USMap
  const stateData = useMemo(() => {
    const averages = stateIssueAverages[selectedIssue] ?? {}
    const result: Record<
      string,
      { value: number; label?: string; color?: string }
    > = {}

    for (const [stateCode, avg] of Object.entries(averages)) {
      result[stateCode] = {
        value: avg,
        label: stanceLabelFromAvg(avg),
        color: stanceColorScale(avg),
      }
    }

    return result
  }, [stateIssueAverages, selectedIssue])

  // Politicians for selected state + issue
  const statePoliticians = useMemo(() => {
    if (!selectedState) return []
    return (
      politiciansByStateIssue[selectedIssue]?.[selectedState] ?? []
    ).sort((a, b) => a.name.localeCompare(b.name))
  }, [politiciansByStateIssue, selectedIssue, selectedState])

  const handleStateClick = useCallback((stateCode: string) => {
    setSelectedState((prev) => (prev === stateCode ? null : stateCode))
  }, [])

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[var(--codex-sub)] text-sm mb-1">
          <MapPin size={14} />
          <Link href="/issues" className="hover:text-[var(--codex-text)] transition-colors">
            Issues
          </Link>
          <span>/</span>
          <span>Map</span>
        </div>
        <h1 className="font-serif text-[clamp(1.5rem,4vw,2.25rem)] font-bold leading-tight text-[var(--codex-text)]">
          Issue Explorer Map
        </h1>
        <p className="mt-1 text-[var(--codex-sub)] text-sm max-w-2xl">
          See how politicians across each state stand on key issues.
          Select an issue and click a state to explore individual stances.
        </p>
      </div>

      {/* Issue selector */}
      <div className="relative mb-6 max-w-sm">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex w-full items-center gap-2 rounded-lg border border-[var(--codex-input-border)] bg-[var(--codex-card)] px-3 py-2.5 text-left text-sm text-[var(--codex-text)] transition-colors hover:border-[var(--codex-sub)]"
        >
          {currentIssue && (
            <IssueIcon
              icon={currentIssue.icon}
              size={16}
              className="shrink-0 text-[var(--codex-sub)]"
            />
          )}
          <span className="flex-1 truncate">
            {currentIssue?.name ?? 'Select an issue'}
          </span>
          <ChevronDown
            size={14}
            className={`shrink-0 text-[var(--codex-sub)] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 z-40 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-[var(--codex-border)] bg-[var(--codex-card)] py-1 shadow-lg">
            {issues.map((issue) => (
              <button
                key={issue.slug}
                onClick={() => {
                  setSelectedIssue(issue.slug)
                  setSelectedState(null)
                  setDropdownOpen(false)
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--codex-hover)] ${
                  issue.slug === selectedIssue
                    ? 'text-[var(--codex-text)] font-medium'
                    : 'text-[var(--codex-sub)]'
                }`}
              >
                <IssueIcon
                  icon={issue.icon}
                  size={14}
                  className="shrink-0"
                />
                <span className="truncate">{issue.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="rounded-xl border border-[var(--codex-border)] bg-[var(--codex-card)] p-4 sm:p-6">
        <USMap
          stateData={stateData}
          onStateClick={handleStateClick}
          legend={LEGEND}
        />
      </div>

      {/* State detail panel */}
      {selectedState && (
        <div className="mt-6 rounded-xl border border-[var(--codex-border)] bg-[var(--codex-card)] p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-lg font-semibold text-[var(--codex-text)]">
                {STATE_NAMES[selectedState] ?? selectedState}
              </h2>
              <p className="text-xs text-[var(--codex-sub)]">
                {currentIssue?.name} &mdash;{' '}
                {statePoliticians.length} politician
                {statePoliticians.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setSelectedState(null)}
              className="rounded-md p-1 text-[var(--codex-sub)] transition-colors hover:bg-[var(--codex-hover)] hover:text-[var(--codex-text)]"
              aria-label="Close panel"
            >
              <X size={18} />
            </button>
          </div>

          {statePoliticians.length === 0 ? (
            <p className="text-sm text-[var(--codex-faint)]">
              No stance data available for this state on this issue.
            </p>
          ) : (
            <div className="grid gap-2">
              {statePoliticians.map((pol) => {
                const style = stanceStyle(pol.stance)
                return (
                  <Link
                    key={pol.slug}
                    href={`/politicians/${pol.slug}`}
                    className="flex items-center gap-3 rounded-lg border border-[var(--codex-border)] px-3 py-2.5 transition-colors hover:bg-[var(--codex-hover)]"
                  >
                    {/* Avatar */}
                    {pol.image_url ? (
                      <img
                        src={pol.image_url}
                        alt={pol.name}
                        className="h-8 w-8 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--codex-hover)] text-xs font-medium text-[var(--codex-sub)]">
                        {pol.name
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                    )}

                    {/* Name + party */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--codex-text)] truncate">
                        {pol.name}
                      </div>
                      <div className="text-xs text-[var(--codex-sub)]">
                        <span
                          className="inline-block h-2 w-2 rounded-full mr-1"
                          style={{ background: partyColor(pol.party) }}
                        />
                        {partyLabel(pol.party)}
                      </div>
                    </div>

                    {/* Stance badge */}
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
                    >
                      {style.shortLabel}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
