import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import { partyLabel, partyColor } from '@/lib/constants/parties'

interface BackgroundComparisonProps {
  polA: any
  polB: any
}

export function BackgroundComparison({ polA, polB }: BackgroundComparisonProps) {
  // Wrapper has mb-8 applied via parent
  const currentYear = new Date().getFullYear()

  const yearsA = polA.since_year ? currentYear - polA.since_year : null
  const yearsB = polB.since_year ? currentYear - polB.since_year : null

  const rows: { label: string; a: string; b: string; colorA?: string; colorB?: string }[] = [
    {
      label: 'Title',
      a: polA.title ?? '—',
      b: polB.title ?? '—',
    },
    {
      label: 'State',
      a: polA.state ?? '—',
      b: polB.state ?? '—',
    },
    {
      label: 'Chamber',
      a: CHAMBER_LABELS[polA.chamber as ChamberKey] ?? polA.chamber ?? '—',
      b: CHAMBER_LABELS[polB.chamber as ChamberKey] ?? polB.chamber ?? '—',
    },
    {
      label: 'Party',
      a: partyLabel(polA.party),
      b: partyLabel(polB.party),
      colorA: partyColor(polA.party),
      colorB: partyColor(polB.party),
    },
    {
      label: 'Years in Office',
      a: yearsA !== null ? `${yearsA} year${yearsA !== 1 ? 's' : ''}` : '—',
      b: yearsB !== null ? `${yearsB} year${yearsB !== 1 ? 's' : ''}` : '—',
    },
  ]

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--codex-sub)]">
        Background
      </h2>
      <div className="overflow-hidden rounded-md border border-[var(--codex-border)]">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className="grid grid-cols-[100px_1fr_1fr] items-center gap-2 px-4 py-2.5 text-[13px] sm:grid-cols-[140px_1fr_1fr]"
            style={{
              borderTop: i > 0 ? '1px solid var(--codex-border)' : undefined,
            }}
          >
            <span className="text-[12px] text-[var(--codex-faint)]">{row.label}</span>
            <span
              className="truncate text-[var(--codex-text)]"
              style={row.colorA ? { color: row.colorA } : undefined}
            >
              {row.a}
            </span>
            <span
              className="truncate text-[var(--codex-text)]"
              style={row.colorB ? { color: row.colorB } : undefined}
            >
              {row.b}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
