import { stanceStyle, stanceBucket, stanceDisplayBadge } from '@/lib/utils/stances'

interface StanceTimelineEntry {
  stance: string
  effective_date: string | null
  source_url: string | null
  source_description: string | null
}

interface StanceTimelineProps {
  entries: StanceTimelineEntry[]
  currentStance: string
  issueName: string
  party?: string
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Unknown date'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/** Detect if a stance change crosses the support/oppose divide */
function isFlip(prevStance: string, nextStance: string): boolean {
  const prevBucket = stanceBucket(prevStance)
  const nextBucket = stanceBucket(nextStance)
  if (prevBucket === 'unknown' || nextBucket === 'unknown') return false
  if (prevBucket === 'mixed' || nextBucket === 'mixed') return false
  return prevBucket !== nextBucket
}

export function StanceTimeline({ entries, currentStance, issueName, party }: StanceTimelineProps) {
  const currentStyle = stanceStyle(currentStance)

  // Sort historical entries reverse-chronological (most recent first)
  const sorted = [...entries].sort((a, b) => {
    if (!a.effective_date && !b.effective_date) return 0
    if (!a.effective_date) return 1
    if (!b.effective_date) return -1
    return b.effective_date.localeCompare(a.effective_date)
  })

  // Build the full timeline: current stance at top, then historical
  const allNodes: Array<{
    stance: string
    date: string | null
    source_url: string | null
    source_description: string | null
    isCurrent: boolean
    isFlip: boolean
  }> = [
    {
      stance: currentStance,
      date: null,
      source_url: null,
      source_description: null,
      isCurrent: true,
      isFlip: false,
    },
    ...sorted.map((entry, i) => {
      // Compare this historical entry to the one above it in the timeline
      const aboveStance = i === 0 ? currentStance : sorted[i - 1].stance
      return {
        stance: entry.stance,
        date: entry.effective_date,
        source_url: entry.source_url,
        source_description: entry.source_description,
        isCurrent: false,
        isFlip: isFlip(entry.stance, aboveStance),
      }
    }),
  ]

  const hasHistory = sorted.length > 0

  return (
    <div className="py-2">
      <div className="relative pl-7">
        {/* Vertical timeline line */}
        {allNodes.length > 1 && (
          <div
            className="absolute left-[7px] top-[6px] w-px"
            style={{
              height: 'calc(100% - 12px)',
              backgroundColor: 'var(--poli-border)',
            }}
          />
        )}

        {allNodes.map((node, i) => {
          const style = stanceStyle(node.stance)
          const badge = stanceDisplayBadge(node.stance, party)
          return (
            <div key={i} className="relative mb-4 last:mb-0">
              {/* Stance dot */}
              <div
                className="absolute -left-7 top-[3px] h-3 w-3 rounded-full border-2"
                style={{
                  backgroundColor: badge.color,
                  borderColor: node.isCurrent ? 'var(--poli-text)' : badge.color,
                  boxShadow: node.isCurrent ? `0 0 0 2px ${badge.color}33` : undefined,
                }}
              />

              {/* Flip indicator */}
              {node.isFlip && (
                <div
                  className="absolute -left-[42px] top-[1px] flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px]"
                  style={{ backgroundColor: 'var(--poli-hover)' }}
                  title="Stance changed direction"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 7L5 3L8 7"
                      stroke="var(--poli-text)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 3L5 7L8 3"
                      stroke="var(--poli-text)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.4"
                    />
                  </svg>
                </div>
              )}

              {/* Content */}
              <div>
                {/* Date / Current label */}
                <div className="flex items-center gap-2">
                  {node.isCurrent ? (
                    <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--poli-sub)]">
                      Current
                    </span>
                  ) : (
                    <span className="text-[11px] tabular-nums text-[var(--poli-faint)]">
                      {formatDate(node.date)}
                    </span>
                  )}
                  {node.isFlip && (
                    <span className="rounded-sm bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-amber-400">
                      Changed
                    </span>
                  )}
                </div>

                {/* Stance label */}
                <div className="mt-0.5 text-[13px] font-medium" style={{ color: badge.color }}>
                  {badge.label}
                </div>

                {/* Source description */}
                {node.source_description && (
                  <div className="mt-0.5 text-[11px] leading-snug text-[var(--poli-faint)]">
                    {node.source_description}
                  </div>
                )}

                {/* Source link */}
                {node.source_url && (
                  <a
                    href={node.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-block text-[11px] text-blue-400 hover:underline"
                  >
                    Source
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!hasHistory && (
        <p className="mt-1 text-[11px] text-[var(--poli-faint)]">
          No stance changes on record
        </p>
      )}
    </div>
  )
}
