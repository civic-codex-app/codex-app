import Link from 'next/link'
import { InkCard } from '@/components/app/surface'

/**
 * The one thing on the screen with a deadline.
 *
 * Every number here is real: the date comes from `elections`, the day count is
 * computed from it, and the race count is `races` for that election. The design
 * also showed "Registered / Confirmed" and "3 of 7 races decided" — neither is
 * rendered, because there is no voter-registration source anywhere in this
 * product and no per-user record of ballot choices. A registration badge that
 * is not backed by a registration check is the most dangerous kind of thing
 * this app could display.
 */
export function BallotCountdown({
  date,
  raceCount,
}: {
  date: string
  raceCount: number
}) {
  // Whole days, computed in UTC so the number does not change with the
  // viewer's timezone and disagree with the server-rendered HTML.
  const today = new Date()
  const utcToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  const [y, m, d] = date.split('-').map(Number)
  const days = Math.max(0, Math.round((Date.UTC(y, m - 1, d) - utcToday) / 86400000))

  const when = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <InkCard className="mb-6">
      {/* No election NAME here on purpose. The 52 election rows are per-state
          and all share the 2026-11-03 date, so taking the first one and
          printing its name showed "Alaska 2026 Elections" to a voter in
          Chicago. This page is prerendered and cannot know the visitor's
          state, so it says the thing that is true for all of them: the date. */}
      <div className="mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">
          Midterm election · {when}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-[44px] font-bold leading-none tracking-[-0.02em] tabular-nums">
          {days}
        </span>
        <span className="text-[15px] font-medium text-white/70">
          {days === 1 ? 'day away' : 'days away'}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        {/* Races are counted across every state, so this is the national
            figure, not "your ballot". Scoping it needs the visitor's state,
            which lives in the reps island above, not here. */}
        <span className="text-[13px] text-white/70">
          {raceCount > 0 ? `${raceCount} races nationwide` : 'Races are still being confirmed'}
        </span>
        <Link
          href="/ballot"
          className="shrink-0 text-[13px] font-semibold text-white no-underline"
        >
          Open ballot
        </Link>
      </div>
    </InkCard>
  )
}
