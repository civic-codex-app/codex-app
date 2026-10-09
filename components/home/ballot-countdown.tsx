import Link from 'next/link'
import { Card } from '@/components/app/surface'

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
 *
 * It used to be the one dark card on a light screen. It is now the same card
 * as everything else, carrying the biggest number on the screen and the one
 * Marker button, which is how the system says "this is yours".
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
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <Card className="mb-6">
      {/* No election NAME here on purpose. The 52 election rows are per-state
          and all share the 2026-11-03 date, so taking the first one and
          printing its name showed "Alaska 2026 Elections" to a voter in
          Chicago. This page is prerendered and cannot know the visitor's
          state, so it says the thing that is true for all of them: the date. */}
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--poli-sub)]">
          Election Day
        </span>
        <span className="text-[12.5px] font-semibold text-[var(--poli-sub)]">{when}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-[56px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[var(--poli-text)]">
          {days}
        </span>
        <span className="text-[15px] font-medium text-[var(--poli-sub)]">
          {days === 1 ? 'day away' : 'days away'}
        </span>
      </div>

      {/* Races are counted across every state, so this is the national
          figure, not "your ballot". Scoping it needs the visitor's state,
          which lives in the reps island above, not here. */}
      <p className="mt-4 border-t border-[var(--poli-border)] pt-3 text-[13px] text-[var(--poli-sub)]">
        {raceCount > 0 ? `${raceCount} races nationwide` : 'Races are still being confirmed'}
      </p>

      {/* /elections, not /ballot: /ballot is auth-gated and redirects to
          /login, and this is the most prominent action on the home screen.
          Sending a first-time visitor from "45 days away" straight to a
          sign-in form is the wrong first move. */}
      <Link
        href="/elections"
        className="mt-3 flex h-11 items-center justify-center rounded-xl bg-[var(--poli-marker)] text-[14px] font-semibold text-[var(--poli-marker-ink)] no-underline"
      >
        See the races
      </Link>
    </Card>
  )
}
