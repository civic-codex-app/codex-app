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
  if (score >= 80) return '#22C55E'
  if (score >= 65) return '#3B82F6'
  if (score >= 50) return '#8B5CF6'
  if (score >= 35) return '#EAB308'
  return '#9CA3AF'
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

const DIMENSIONS: { key: 'bipartisanship' | 'engagement' | 'transparency' | 'effectiveness'; label: string; icon: string }[] = [
  { key: 'bipartisanship', label: 'Bipartisanship', icon: '🤝' },
  { key: 'engagement', label: 'Engagement', icon: '🗳️' },
  { key: 'transparency', label: 'Transparency', icon: '🔍' },
  { key: 'effectiveness', label: 'Effectiveness', icon: '⚡' },
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
      <h3 className="mb-5 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
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
            <span className="font-serif text-2xl font-bold leading-none" style={{ color }}>
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
              <div className="font-serif text-lg text-[var(--codex-text)]">{stanceCount}</div>
              <div className="text-[10px] text-[var(--codex-faint)]">Issues</div>
            </div>
          )}
          {voteCount != null && voteCount > 0 && (
            <div className="rounded-md bg-[var(--codex-hover)] px-3 py-2 text-center">
              <div className="font-serif text-lg text-[var(--codex-text)]">{voteCount}</div>
              <div className="text-[10px] text-[var(--codex-faint)]">Votes Cast</div>
            </div>
          )}
          {committeeCount != null && committeeCount > 0 && (
            <div className="rounded-md bg-[var(--codex-hover)] px-3 py-2 text-center">
              <div className="font-serif text-lg text-[var(--codex-text)]">{committeeCount}</div>
              <div className="text-[10px] text-[var(--codex-faint)]">Committees</div>
            </div>
          )}
          {yearsInOffice != null && yearsInOffice > 0 && (
            <div className="rounded-md bg-[var(--codex-hover)] px-3 py-2 text-center">
              <div className="font-serif text-lg text-[var(--codex-text)]">{yearsInOffice}</div>
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
                  <span className="text-sm">{dim.icon}</span>
                  <span className="text-[13px] font-medium text-[var(--codex-text)]">{dim.label}</span>
                </div>
                <span className="font-serif text-[15px] font-semibold" style={{ color: dimColor }}>
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
