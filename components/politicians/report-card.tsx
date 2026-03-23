import type { ReportCard } from '@/lib/utils/report-card'

interface CivicProfileProps extends ReportCard {
  stanceCount?: number
  voteCount?: number
  committeeCount?: number
  yearsInOffice?: number
}

function tierLabel(score: number): string {
  if (score >= 80) return 'Highly Active'
  if (score >= 65) return 'Engaged'
  if (score >= 50) return 'Moderate'
  if (score >= 35) return 'Developing'
  return 'Limited Data'
}

function tierColor(score: number): string {
  // Stoplight gradient with forgiving curve:
  // 60+ is green, 40-60 is yellow, under 40 is red
  // Most politicians should land in green/yellow territory
  if (score >= 70) return '#16A34A' // green-600
  if (score >= 55) return '#65A30D' // lime-600
  if (score >= 40) return '#CA8A04' // yellow-600
  if (score >= 25) return '#EA580C' // orange-600
  return '#DC2626' // red-600
}

function dimensionInsight(key: string, value: number): string {
  if (value < 0) return ''
  switch (key) {
    case 'bipartisanship':
      if (value >= 80) return 'Frequently works across party lines'
      if (value >= 60) return 'Occasionally breaks from party'
      if (value >= 40) return 'Generally follows party positions'
      return 'Strong party loyalist'
    case 'engagement':
      if (value >= 90) return 'Votes on nearly every bill'
      if (value >= 70) return 'Active voting participation'
      if (value >= 50) return 'Moderate voting attendance'
      return 'Limited voting participation'
    case 'transparency':
      if (value >= 80) return 'Clear positions on most issues'
      if (value >= 60) return 'Positions available on key issues'
      if (value >= 40) return 'Some positions on record'
      return 'Few public positions documented'
    case 'effectiveness':
      if (value >= 80) return 'Strong committee involvement'
      if (value >= 60) return 'Active committee participation'
      if (value >= 40) return 'Moderate committee presence'
      return 'Building committee presence'
    default:
      return ''
  }
}

function DimIcon({ name, size = 16 }: { name: string; size?: number }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'bipartisanship':
      return <svg {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    case 'engagement':
      return <svg {...props}><path d="M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" /><path d="m9 12 2 2 4-4" /></svg>
    case 'transparency':
      return <svg {...props}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
    case 'effectiveness':
      return <svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
    default:
      return null
  }
}

const DIMENSIONS: { key: 'bipartisanship' | 'engagement' | 'transparency' | 'effectiveness'; label: string }[] = [
  { key: 'bipartisanship', label: 'Bipartisanship' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'transparency', label: 'Transparency' },
  { key: 'effectiveness', label: 'Effectiveness' },
]

export function PoliticianReportCard({
  score,
  bipartisanship,
  engagement,
  transparency,
  effectiveness,
  stanceCount,
  voteCount,
  committeeCount,
  yearsInOffice,
}: CivicProfileProps) {
  const color = tierColor(score)
  const label = tierLabel(score)
  const dims = { bipartisanship, engagement, transparency, effectiveness }

  // SVG ring progress
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference

  return (
    <div className="rounded-lg border border-[var(--codex-border)] bg-[var(--codex-card)] p-5">
      <h3 className="mb-5 text-sm font-semibold text-[var(--codex-sub)]">
        Civic Profile
      </h3>

      {/* Score ring + tier */}
      <div className="mb-6 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <svg width="90" height="90" viewBox="0 0 90 90">
            {/* Background ring */}
            <circle
              cx="45" cy="45" r={radius}
              fill="none"
              stroke="var(--codex-border)"
              strokeWidth="5"
            />
            {/* Progress ring */}
            <circle
              cx="45" cy="45" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              transform="rotate(-90 45 45)"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-bold leading-none" style={{ color }}>
              {score}
            </span>
          </div>
        </div>

        <div>
          <div
            className="mb-1 inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]"
            style={{ color, background: `${color}15` }}
          >
            {label}
          </div>
          <div className="text-[12px] text-[var(--codex-faint)]">
            Civic Activity Score
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      {(stanceCount != null || voteCount != null || committeeCount != null || yearsInOffice != null) && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stanceCount != null && stanceCount > 0 && (
            <div className="rounded-md bg-[var(--codex-hover)] px-3 py-2 text-center">
              <div className="text-lg font-semibold text-[var(--codex-text)]">{stanceCount}</div>
              <div className="text-[10px] text-[var(--codex-faint)]">Issues</div>
            </div>
          )}
          {voteCount != null && voteCount > 0 && (
            <div className="rounded-md bg-[var(--codex-hover)] px-3 py-2 text-center">
              <div className="text-lg font-semibold text-[var(--codex-text)]">{voteCount}</div>
              <div className="text-[10px] text-[var(--codex-faint)]">Votes Cast</div>
            </div>
          )}
          {committeeCount != null && committeeCount > 0 && (
            <div className="rounded-md bg-[var(--codex-hover)] px-3 py-2 text-center">
              <div className="text-lg font-semibold text-[var(--codex-text)]">{committeeCount}</div>
              <div className="text-[10px] text-[var(--codex-faint)]">Committees</div>
            </div>
          )}
          {yearsInOffice != null && yearsInOffice > 0 && (
            <div className="rounded-md bg-[var(--codex-hover)] px-3 py-2 text-center">
              <div className="text-lg font-semibold text-[var(--codex-text)]">{yearsInOffice}</div>
              <div className="text-[10px] text-[var(--codex-faint)]">Years</div>
            </div>
          )}
        </div>
      )}

      {/* Dimension cards */}
      <div className="space-y-3">
        {DIMENSIONS.map((dim) => {
          const value = dims[dim.key]
          if (value < 0) return null
          const insight = dimensionInsight(dim.key, value)
          const dimColor = tierColor(value)

          return (
            <div key={dim.key} className="rounded-md border border-[var(--codex-border)] px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DimIcon name={dim.key} />
                  <span className="text-[13px] font-medium text-[var(--codex-text)]">{dim.label}</span>
                </div>
                <span className="text-[15px] font-semibold font-semibold" style={{ color: dimColor }}>
                  {value}
                </span>
              </div>
              <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--codex-border)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${value}%`, backgroundColor: dimColor }}
                />
              </div>
              <p className="text-[11px] text-[var(--codex-faint)]">{insight}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
