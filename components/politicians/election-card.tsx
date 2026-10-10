import Link from 'next/link'
import { Card } from '@/components/app/surface'
import { partyLabel } from '@/lib/constants/parties'
import type { Candidacy } from '@/lib/utils/candidacy'

export type Opponent = { name: string; party: string }

/**
 * What this person is doing in the next election, as one card with one
 * number. Rendered only when the tables say something: a running row, a
 * run for another office, a lost primary, or a race for the seat they are
 * not in. A senator mid-term gets no card rather than a guessed one.
 */
export function ElectionCard({
  name,
  candidacy,
  days,
  when,
  opponents,
}: {
  name: string
  candidacy: Candidacy | null
  days: number | null
  when: string | null
  /**
   * Everyone else with status running in the race the status refers to.
   * Named as a matchup only when `candidacy.confirmed`; otherwise they are
   * FEC filers, counted and not paired.
   */
  opponents: Opponent[]
}) {
  if (!candidacy || candidacy.kind === 'not_up') return null
  const last = (n: string) => n.trim().split(/\s+/).pop() ?? n
  const major = opponents.filter((o) => o.party === 'democrat' || o.party === 'republican')
  const named = (major.length ? major : opponents).slice(0, 2)
  const rest = opponents.length - named.length
  const versus = named.length
    ? `${named.map((o) => `${o.name} (${partyLabel(o.party)})`).join(', ')}${rest > 0 ? ` and ${rest} other${rest === 1 ? '' : 's'}` : ''}`
    : null

  const n = opponents.length
  const filed = `${n} other${n === 1 ? '' : 's'} filed · nominees not confirmed`

  let line: string
  if (candidacy.kind === 'running') line = !n ? 'No other candidate on record yet' : candidacy.confirmed ? `vs. ${versus}` : filed
  else if (candidacy.kind === 'other_race') line = `${candidacy.label}${!n ? '' : candidacy.confirmed ? ` · vs. ${versus}` : ` · ${filed}`}`
  else if (candidacy.kind === 'lost') line = `${last(name)} lost the primary for ${candidacy.raceName ?? 'this seat'}`
  else if (!n) line = `${last(name)} is not a candidate for this seat.`
  else if (candidacy.confirmed) line = `${last(name)} is not running. ${versus} are running for the seat.`
  else line = `${last(name)} is not running. ${n} filed for the seat · nominees not confirmed`

  return (
    <Card className="mb-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--poli-sub)]">Election</h2>
        {when && <span className="text-[12.5px] font-semibold text-[var(--poli-sub)]">{when}</span>}
      </div>
      {days !== null && (
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[44px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[var(--poli-text)]">{days}</span>
          <span className="text-[15px] font-medium text-[var(--poli-sub)]">{days === 1 ? 'day' : 'days'}</span>
        </div>
      )}
      <p className="mt-2.5 text-[14px] leading-[1.45] text-[var(--poli-text)]">{line}</p>
      <Link
        href={candidacy.raceSlug ? `/elections/${candidacy.raceSlug}` : '/ballot'}
        className="mt-3 flex h-11 items-center justify-center rounded-xl bg-[var(--poli-text)] text-[14px] font-semibold text-[var(--poli-card)] no-underline"
      >
        {candidacy.kind === 'running' || candidacy.kind === 'other_race' ? 'See the race' : 'See who is running'}
      </Link>
    </Card>
  )
}
