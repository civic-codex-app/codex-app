const DATE_TYPE_LABELS: Record<string, string> = {
  registration_deadline: 'Registration Deadline',
  early_voting_start: 'Early Voting Begins',
  early_voting_end: 'Early Voting Ends',
  absentee_request_deadline: 'Absentee Ballot Deadline',
  election_day: 'Election Day',
}

interface KeyDate {
  date_type: string
  event_date: string
  description: string | null
  source_url: string | null
}

interface KeyDatesTimelineProps {
  dates: KeyDate[]
  electionDate: string
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function KeyDatesTimeline({ dates, electionDate }: KeyDatesTimelineProps) {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  // Build the list: provided dates + election day if not already present
  const hasElectionDay = dates.some(d => d.date_type === 'election_day')
  const allDates: KeyDate[] = [
    ...dates,
    ...(!hasElectionDay
      ? [
          {
            date_type: 'election_day',
            event_date: electionDate,
            description: null,
            source_url: null,
          },
        ]
      : []),
  ].sort((a, b) => a.event_date.localeCompare(b.event_date))

  if (allDates.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-[var(--codex-faint)]">
        Election Day: {formatDate(electionDate)}
      </div>
    )
  }

  // Find the index of the next upcoming date
  const nextUpcomingIdx = allDates.findIndex(d => d.event_date >= todayStr)

  return (
    <div className="relative pl-6">
      {/* Vertical connecting line */}
      <div
        className="absolute left-[9px] top-2 bottom-2 w-px"
        style={{ backgroundColor: 'var(--codex-border)' }}
      />

      <div className="flex flex-col gap-5">
        {allDates.map((d, i) => {
          const isPast = d.event_date < todayStr
          const isNextUpcoming = i === nextUpcomingIdx
          const isElectionDay = d.date_type === 'election_day'

          // Dot color
          let dotColor = 'bg-[var(--codex-faint)]' // past/default
          let dotRing = ''
          if (isElectionDay && !isPast) {
            dotColor = 'bg-green-500'
          } else if (isNextUpcoming) {
            dotColor = 'bg-amber-400'
            dotRing = 'ring-4 ring-amber-400/20'
          } else if (!isPast) {
            dotColor = 'bg-[var(--codex-sub)]'
          }

          const label =
            DATE_TYPE_LABELS[d.date_type] ||
            d.date_type
              .replace(/_/g, ' ')
              .replace(/\b\w/g, c => c.toUpperCase())

          return (
            <div key={`${d.date_type}-${d.event_date}`} className="relative flex gap-3">
              {/* Dot */}
              <div
                className={`absolute -left-6 top-[5px] h-[10px] w-[10px] rounded-full ${dotColor} ${dotRing} ${
                  isNextUpcoming ? 'animate-pulse' : ''
                }`}
              />

              <div className="min-w-0 flex-1">
                <div
                  className={`text-[12px] font-medium tabular-nums ${
                    isPast ? 'text-[var(--codex-faint)]' : 'text-[var(--codex-sub)]'
                  }`}
                >
                  {formatDate(d.event_date)}
                </div>
                <div
                  className={`text-[14px] font-semibold ${
                    isPast
                      ? 'text-[var(--codex-faint)] line-through'
                      : isElectionDay
                        ? 'text-green-400'
                        : isNextUpcoming
                          ? 'text-amber-300'
                          : 'text-[var(--codex-text)]'
                  }`}
                >
                  {label}
                </div>
                {d.description && (
                  <div
                    className={`mt-0.5 text-[13px] leading-snug ${
                      isPast ? 'text-[var(--codex-faint)]' : 'text-[var(--codex-sub)]'
                    }`}
                  >
                    {d.description}
                  </div>
                )}
                {d.source_url && !isPast && (
                  <a
                    href={d.source_url}
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
    </div>
  )
}
