'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/app/surface'
import { Disclosure } from '@/components/app/disclosure'
import { FaceStack } from '@/components/app/face'
import { useLocation } from '@/lib/hooks/use-location'

/**
 * Election Day: the biggest number on the screen and the one Marker button.
 *
 * The date and day count are real, from `elections`, computed on the server
 * so the number does not drift with the viewer's clock and disagree with the
 * prerendered HTML. The races are the visitor's own once a ZIP is known
 * (/api/ballot) and the national count before that — never a first row's
 * state attached to everyone, which is how "Alaska 2026 Elections" was once
 * shown to a voter in Chicago.
 *
 * Nothing claims a registration status or a count of races decided; there is
 * no source for either.
 */

export type BallotRace = {
  id: string
  name: string
  slug: string
  chamber: string
  district: string | null
  /** Reconciled against the state's certified listing; false means "filed with the FEC". */
  confirmed: boolean
  candidates: Array<{
    id: string
    name: string
    party: string
    status: string
    is_incumbent: boolean
    image_url: string | null
    politician_slug: string | null
  }>
}

export function raceTitle(r: { chamber: string; district: string | null; name: string }, state: string | null) {
  if (r.chamber === 'senate') return 'U.S. Senate'
  if (r.chamber === 'governor') return 'Governor'
  if (r.chamber === 'presidential') return 'President'
  if (r.chamber === 'house') return `U.S. House · ${state ?? ''}${r.district ? `-${r.district}` : ''}`
  return r.name
}

function lastName(name: string) {
  return name.trim().split(/\s+/).pop() ?? name
}

/** "El-Sayed vs. Rogers and 4 others · open seat", or "7 filed · nominees not confirmed". */
export function raceLine(r: BallotRace) {
  const running = r.candidates.filter((c) => c.status === 'running')
  if (!running.length) return 'No candidates on record yet'
  // Until the state's certified listing has been reconciled, "running" is
  // everyone who filed with the FEC, and two filers are not a matchup.
  if (!r.confirmed) return `${running.length} filed · nominees not confirmed`
  const major = running.filter((c) => c.party === 'democrat' || c.party === 'republican')
  const lead = (major.length ? major : running).slice(0, 2)
  const others = running.length - lead.length
  const openSeat = running.length > 0 && !running.some((c) => c.is_incumbent)
  const names = lead.map((c) => lastName(c.name)).join(' vs. ')
  const tail = others > 0 ? ` and ${others} other${others === 1 ? '' : 's'}` : ''
  return `${names}${tail}${openSeat ? ' · open seat' : ''}`
}

export function BallotCard({
  days,
  when,
  raceCount,
}: {
  days: number
  when: string
  raceCount: number
}) {
  const loc = useLocation()
  const [races, setRaces] = useState<BallotRace[] | null>(null)

  useEffect(() => {
    if (!loc.zip) {
      setRaces(null)
      return
    }
    let cancelled = false
    fetch(`/api/ballot?zip=${encodeURIComponent(loc.zip)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled) setRaces(json?.races ?? [])
      })
      .catch(() => {
        if (!cancelled) setRaces([])
      })
    return () => {
      cancelled = true
    }
  }, [loc.zip])

  const mine = loc.zip && races && races.length > 0

  return (
    <Card className="mb-5 pb-1.5">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--poli-sub)]">Election Day</h2>
        <span className="text-[12.5px] font-semibold text-[var(--poli-sub)]">{when}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-[56px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[var(--poli-text)]">{days}</span>
        <span className="text-[15px] font-medium text-[var(--poli-sub)]">{days === 1 ? 'day' : 'days'}</span>
      </div>

      <div className="mt-3 border-t border-[var(--poli-border)]">
        {mine ? (
          <Disclosure title={`${races.length} race${races.length === 1 ? '' : 's'} on your ballot`} last>
            {races.map((r) => {
              // An unconfirmed race shows the incumbent's face at most:
              // the other filers are a list, not the matchup.
              const faces = r.candidates
                .filter((c) => c.status === 'running' && c.image_url && (r.confirmed || c.is_incumbent))
                .slice(0, 2)
                .map((c) => ({ src: c.image_url, alt: c.name, party: c.party }))
              return (
                <Link key={r.id} href={`/elections/${r.slug}`} className="flex min-h-[52px] items-center gap-3 no-underline">
                  {faces.length > 0 && <FaceStack people={faces} size={30} max={2} />}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-semibold text-[var(--poli-text)]">{raceTitle(r, loc.state)}</span>
                    <span className="block truncate text-[12.5px] text-[var(--poli-sub)]">{raceLine(r)}</span>
                  </span>
                </Link>
              )
            })}
          </Disclosure>
        ) : (
          <p className="py-3 text-[13px] text-[var(--poli-sub)]">
            {loc.zip && races && races.length === 0
              ? 'No races on record for your ZIP yet'
              : raceCount > 0
                ? `${raceCount.toLocaleString()} races nationwide`
                : 'Races are still being confirmed'}
          </p>
        )}
      </div>

      {/* /ballot is public now, so the most prominent action on the screen
          no longer lands a first-time visitor on a sign-in form. Without a
          ZIP it goes to the national list instead. */}
      <Link
        href={loc.zip ? '/ballot' : '/elections'}
        className="mb-2.5 mt-1 flex h-11 items-center justify-center rounded-xl bg-[var(--poli-marker)] text-[14px] font-semibold text-[var(--poli-marker-ink)] no-underline"
      >
        {loc.zip ? 'Open my ballot' : 'See the races'}
      </Link>
    </Card>
  )
}
