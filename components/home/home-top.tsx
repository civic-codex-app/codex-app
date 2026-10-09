'use client'

import Link from 'next/link'
import { useLocation, type Rep } from '@/lib/hooks/use-location'
import { Card, Chip, SectionLabel } from '@/components/app/surface'
import { Face } from '@/components/app/face'
import { Arrival, type WallFace } from '@/components/home/arrival'

/**
 * The top of Home: who works for you.
 *
 * Before a ZIP is known this is the Arrival screen; after, it is the date,
 * the ZIP pill, the headline and one card of your officials, each with what
 * they are doing in the next election. Everything personal on Home resolves
 * on the client so the page itself stays prerendered (see app/(public)/page.tsx).
 *
 * Honesty constraints carried over from the previous version:
 *  - 7,299 of 33,774 ZIPs straddle two or more districts. When one does, every
 *    House member it touches is listed and the note below says so, rather
 *    than a coin flip presented as a fact.
 *  - State legislators and local officials are not listed: none of the 6,592
 *    state-legislature rows carries a district, so they cannot be matched.
 */

const ROLE: Record<string, string> = {
  senate: 'Senator',
  house: 'U.S. House',
  governor: 'Governor',
}

function roleLine(r: Rep) {
  const role = ROLE[r.chamber] ?? r.title ?? r.chamber
  if (r.chamber === 'house' && r.district) return `${role} · ${r.state}-${r.district}`
  return role
}

export function HomeTop({
  today,
  faces,
  electionLine,
}: {
  today: string
  faces: WallFace[]
  electionLine: string | null
}) {
  const loc = useLocation()

  if (!loc.ready) {
    return (
      <header className="mb-5 px-1">
        <p className="mb-1 text-[13px] font-medium text-[var(--poli-sub)]">{today}</p>
        <h1 className="font-serif text-[40px] font-normal leading-[1.08] text-[var(--poli-text)]">Your government</h1>
      </header>
    )
  }

  if (!loc.zip) {
    return <Arrival faces={faces} electionLine={electionLine} onSubmit={loc.setZip} error={loc.error} />
  }

  const reps = loc.reps ?? []
  const house = reps.filter((r) => r.chamber === 'house')
  const ambiguous = loc.districts.length > 1

  return (
    <>
      <header className="mb-5 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="mb-1 text-[13px] font-medium text-[var(--poli-sub)]">{today}</p>
          <h1 className="font-serif text-[40px] font-normal leading-[1.08] text-[var(--poli-text)]">Your government</h1>
        </div>
        <button
          type="button"
          onClick={loc.clearZip}
          aria-label={`ZIP ${loc.zip}. Change location`}
          className="mb-1.5 inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] px-3 text-[13px] font-semibold text-[var(--poli-text)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          {loc.zip}
        </button>
      </header>

      <section className="mb-5">
        <SectionLabel>Who works for you</SectionLabel>
        <Card flush className="px-3.5">
          {loc.loading && !loc.reps &&
            [0, 1, 2].map((i) => (
              <div key={i} className={`flex items-center gap-3 py-3 ${i < 2 ? 'border-b border-[var(--poli-border)]' : ''}`}>
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-[var(--poli-border)]" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 h-[17px] w-1/2 animate-pulse rounded bg-[var(--poli-border)]" />
                  <div className="h-[15px] w-1/3 animate-pulse rounded bg-[var(--poli-border)]" />
                </div>
              </div>
            ))}

          {!loc.loading && reps.length === 0 && (
            <p className="py-5 text-[14px] text-[var(--poli-sub)]">
              {loc.error ?? `We do not have current officials on file for ${loc.zip}.`}
            </p>
          )}

          {reps.map((r, i) => (
            <Link
              key={r.id}
              href={`/politicians/${r.slug}`}
              className={`flex min-h-[64px] items-center gap-3 no-underline ${i < reps.length - 1 ? 'border-b border-[var(--poli-border)]' : ''}`}
            >
              <Face src={r.image_url} alt={r.name} size={44} party={r.party} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold leading-[1.25] text-[var(--poli-text)]">{r.name}</span>
                <span className="mt-0.5 block truncate text-[12.5px] text-[var(--poli-sub)]">{roleLine(r)}</span>
              </span>
              {r.candidacy?.label && <Chip>{r.candidacy.label}</Chip>}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-[var(--poli-faint)]">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          ))}
        </Card>

        {ambiguous && house.length > 1 && (
          <p className="mt-2 px-1 text-[12px] leading-relaxed text-[var(--poli-faint)]">
            ZIP {loc.zip} covers {loc.districts.length} congressional districts
            {loc.state ? ` in ${loc.state}` : ''}, so {house.length} House members are listed. Only one of them is yours.
          </p>
        )}
      </section>
    </>
  )
}
