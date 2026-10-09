'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocation } from '@/lib/hooks/use-location'
import { Card, Chip, SectionLabel } from '@/components/app/surface'
import { Disclosure } from '@/components/app/disclosure'
import { Face, FaceStack } from '@/components/app/face'
import { BottomSheet } from '@/components/app/sheet'
import { ZipForm } from '@/components/app/zip-form'
import { raceTitle, type BallotRace } from '@/components/home/ballot-card'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { STATE_NAMES } from '@/lib/constants/us-states'

/**
 * Your ballot, resolved from a ZIP.
 *
 * Public. The old page called getUser() and bounced anyone signed out to
 * /login, which put the one thing a first-time visitor came for — who is
 * running for Senate — behind an account. A profile ZIP still wins when the
 * visitor is signed in (lib/hooks/use-location.ts).
 *
 * Each race is a card whose header carries the nominees' faces and opens to
 * everyone on the ballot. Candidates marked lost or withdrawn in the
 * reconciled `candidates` table are not on the ballot and are not shown.
 */

const ORDER: Record<string, number> = { presidential: 0, senate: 1, governor: 2, house: 3 }

function isMajor(c: { party: string }) {
  return c.party === 'democrat' || c.party === 'republican'
}

export function BallotView({ days, when }: { days: number; when: string }) {
  const loc = useLocation()
  const [races, setRaces] = useState<BallotRace[] | null>(null)
  const [ambiguous, setAmbiguous] = useState(false)
  const [sheet, setSheet] = useState(false)

  useEffect(() => {
    if (!loc.zip) {
      setRaces(null)
      return
    }
    let cancelled = false
    setRaces(null)
    fetch(`/api/ballot?zip=${encodeURIComponent(loc.zip)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return
        setRaces(json?.races ?? [])
        setAmbiguous(!!json?.ambiguous)
      })
      .catch(() => {
        if (!cancelled) setRaces([])
      })
    return () => {
      cancelled = true
    }
  }, [loc.zip])

  if (!loc.ready) return null

  if (!loc.zip) {
    return (
      <>
        <header className="mb-4 px-1">
          <h1 className="font-serif text-[40px] font-normal leading-[1.08] text-[var(--poli-text)]">Your ballot</h1>
          <p className="mt-1 text-[14px] text-[var(--poli-sub)]">{when}</p>
        </header>
        <Card>
          <p className="mb-3 text-[14.5px] leading-[1.5] text-[var(--poli-sub)]">
            Enter your ZIP to see the federal and governor races you vote in on {when}.
          </p>
          <ZipForm onSubmit={loc.setZip} error={loc.error} />
        </Card>
      </>
    )
  }

  const stateName = loc.state ? STATE_NAMES[loc.state] ?? loc.state : null
  const sorted = [...(races ?? [])].sort((a, b) => (ORDER[a.chamber] ?? 9) - (ORDER[b.chamber] ?? 9))

  return (
    <>
      <header className="mb-3 px-1">
        <div className="flex items-center justify-between">
          <Chip tone="marker">{days} {days === 1 ? 'day' : 'days'}</Chip>
          <button type="button" onClick={loc.clearZip} className="min-h-[34px] text-[13px] font-semibold text-[var(--poli-sub)]">
            {loc.zip} · Change
          </button>
        </div>
        <h1 className="mt-2 font-serif text-[40px] font-normal leading-[1.08] text-[var(--poli-text)]">Your ballot</h1>
        <p className="mt-1 text-[14px] text-[var(--poli-sub)]">
          {when}
          {stateName ? ` · ${stateName}` : ''}
        </p>
      </header>

      {races === null && (
        <Card flush className="px-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`flex min-h-[72px] items-center gap-3 ${i < 2 ? 'border-b border-[var(--poli-border)]' : ''}`}>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 h-[18px] w-1/3 animate-pulse rounded bg-[var(--poli-border)]" />
                <div className="h-[14px] w-1/2 animate-pulse rounded bg-[var(--poli-border)]" />
              </div>
              <div className="h-8 w-14 animate-pulse rounded-full bg-[var(--poli-border)]" />
            </div>
          ))}
        </Card>
      )}

      {races !== null && sorted.length === 0 && (
        <Card>
          <p className="text-[14.5px] font-semibold text-[var(--poli-text)]">No races on record for {loc.zip} yet</p>
          <p className="mt-1 text-[13.5px] leading-[1.5] text-[var(--poli-sub)]">
            Poli lists federal and governor races it has confirmed against official filings. Your state publishes your exact sample ballot.
          </p>
        </Card>
      )}

      <div className="space-y-2.5">
        {sorted.map((r, idx) => {
          const running = r.candidates.filter((c) => c.status === 'running')
          const major = running.filter(isMajor)
          const lead = major.length >= 2 ? major : running.slice(0, Math.max(2, major.length))
          const rest = running.filter((c) => !lead.includes(c))
          const incumbent = running.find((c) => c.is_incumbent)
          const faces = lead.filter((c) => c.image_url).slice(0, 2).map((c) => ({ src: c.image_url, alt: c.name, party: c.party }))
          const sub = incumbent
            ? `${incumbent.name} is running again`
            : running.length
              ? 'Open seat'
              : 'No candidates on record yet'
          return (
            <Card key={r.id} flush className="px-4">
              <Disclosure
                last
                defaultOpen={idx === 0}
                title={<span className="text-[17px]">{raceTitle(r, loc.state)}</span>}
                meta={sub}
                trailing={faces.length ? <FaceStack people={faces} size={32} max={2} /> : undefined}
              >
                <div className="border-t border-[var(--poli-border)]">
                  {lead.map((c) => (
                    <Link
                      key={c.id}
                      href={c.politician_slug ? `/politicians/${c.politician_slug}` : `/candidates/${c.id}`}
                      className="flex min-h-[56px] items-center gap-3 no-underline"
                    >
                      {c.image_url ? (
                        <Face src={c.image_url} alt={c.name} size={40} party={c.party} />
                      ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--poli-badge-bg)]">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: partyColor(c.party) }} />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold text-[var(--poli-text)]">{c.name}</span>
                        <span className="block text-[12.5px] text-[var(--poli-sub)]">
                          {partyLabel(c.party)}
                          {c.is_incumbent ? ' · incumbent' : ''}
                        </span>
                      </span>
                    </Link>
                  ))}
                  {rest.length > 0 && (
                    <p className="mt-1 text-[12.5px] leading-[1.45] text-[var(--poli-sub)]">
                      Also running: {rest.map((c) => `${c.name} (${partyLabel(c.party)})`).join(', ')}.
                    </p>
                  )}
                  <Link
                    href={`/elections/${r.slug}`}
                    className="mt-3 flex h-11 items-center justify-center rounded-xl bg-[var(--poli-text)] text-[14px] font-semibold text-[var(--poli-card)] no-underline"
                  >
                    {lead.length >= 2 ? 'Compare them' : 'See the race'}
                  </Link>
                </div>
              </Disclosure>
            </Card>
          )
        })}
      </div>

      {ambiguous && (
        <p className="mt-2 px-1 text-[12px] leading-relaxed text-[var(--poli-faint)]">
          ZIP {loc.zip} covers more than one congressional district, so every House race it touches is listed. Only one is yours.
        </p>
      )}

      <button
        type="button"
        onClick={() => setSheet(true)}
        className="mt-3 flex min-h-[56px] w-full items-center gap-3 rounded-2xl border border-dashed border-[var(--poli-faint)] px-4 text-left"
      >
        <span className="flex-1 text-[15px] font-semibold text-[var(--poli-text)]">More on your ballot</span>
        <span className="text-[13px] text-[var(--poli-sub)]">Not in Poli yet</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-[var(--poli-faint)]">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      <BottomSheet open={sheet} onClose={() => setSheet(false)} label="More on your ballot">
        <h2 className="font-serif text-[32px] font-normal leading-[1.08] text-[var(--poli-text)]">Not in Poli yet</h2>
        <p className="mt-2 text-[14.5px] leading-[1.5] text-[var(--poli-sub)]">
          Your printed ballot has more races than these. Poli can match a ZIP to Congress and the governor&rsquo;s office; your state publishes your exact sample ballot.
        </p>
        <SectionLabel as="h3">Usually also on it</SectionLabel>
        <div className="mb-2">
          {['State legislature', 'Statewide offices like Secretary of State and Attorney General', 'Courts, county and school races'].map((t, i, arr) => (
            <div key={t} className={`flex min-h-[46px] items-center text-[15px] font-semibold text-[var(--poli-text)] ${i < arr.length - 1 ? 'border-b border-[var(--poli-border)]' : ''}`}>
              {t}
            </div>
          ))}
        </div>
        <a
          href="https://vote.gov"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex h-12 items-center justify-center gap-1.5 rounded-xl bg-[var(--poli-text)] text-[15px] font-semibold text-[var(--poli-card)] no-underline"
        >
          Find my sample ballot at vote.gov
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>
        </a>
      </BottomSheet>
    </>
  )
}
