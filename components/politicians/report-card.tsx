import { gradeColor } from '@/lib/utils/report-card'
import type { ReportCard } from '@/lib/utils/report-card'

interface ReportCardProps extends ReportCard {}

type DimensionKey = 'bipartisanship' | 'engagement' | 'transparency' | 'effectiveness'
const DIMENSIONS: { key: DimensionKey; label: string }[] = [
  { key: 'bipartisanship', label: 'Bipartisanship' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'transparency', label: 'Transparency' },
  { key: 'effectiveness', label: 'Effectiveness' },
]

function barColor(value: number): string {
  if (value >= 75) return '#22C55E'
  if (value >= 55) return '#3B82F6'
  if (value >= 40) return '#EAB308'
  if (value >= 25) return '#F97316'
  return '#EF4444'
}

export function PoliticianReportCard({
  grade,
  score,
  bipartisanship,
  engagement,
  transparency,
  effectiveness,
}: ReportCardProps) {
  const color = gradeColor(grade)
  const dims = { bipartisanship, engagement, transparency, effectiveness }

  return (
    <div className="rounded-lg border border-[var(--codex-border)] bg-[var(--codex-card)] p-5">
      {/* Section header */}
      <h3 className="mb-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
        Report Card
      </h3>

      {/* Grade + Score row */}
      <div className="mb-5 flex items-center gap-4">
        {/* Large grade circle */}
        <div
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full"
          style={{ border: `3px solid ${color}`, background: `${color}10` }}
        >
          <span
            className="font-serif text-3xl font-bold leading-none"
            style={{ color }}
          >
            {grade}
          </span>
        </div>

        <div>
          <div className="text-2xl font-semibold text-[var(--codex-text)]">
            {score}
            <span className="ml-1 text-sm font-normal text-[var(--codex-sub)]">
              / 100
            </span>
          </div>
          <div className="text-xs text-[var(--codex-faint)]">Overall Score</div>
        </div>
      </div>

      {/* Dimension bars */}
      <div className="flex flex-col gap-3">
        {DIMENSIONS.map((dim) => {
          const value = dims[dim.key] as number
          if (value < 0) return null // Skip N/A dimensions (e.g. engagement for executives)
          return (
            <div key={dim.key} className="flex items-center gap-3">
              <span className="w-[110px] flex-shrink-0 text-xs text-[var(--codex-sub)]">
                {dim.label}
              </span>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[var(--codex-border)]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{
                    width: `${value}%`,
                    backgroundColor: barColor(value),
                  }}
                />
              </div>
              <span className="w-8 text-right text-xs font-medium text-[var(--codex-text)]">
                {value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
