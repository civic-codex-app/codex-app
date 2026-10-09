'use client'

import { useState } from 'react'

/**
 * Arrival: the Home a visitor sees before they have told us where they are.
 *
 * A wall of real faces scrolls up behind one question and one field. The
 * faces are sitting senators with a photo on file, which is what the app is
 * made of; nothing here is illustration. The wall is three columns, each its
 * six faces twice so translateY(-50%) loops seamlessly, and it fades into the
 * ground at the top and the bottom so the headline sits on a calm surface.
 * Reduced-motion stops it.
 *
 * The one Marker on the screen is the button.
 */
export type WallFace = { src: string; alt: string }

const COLS = [
  { left: '5%', top: -40, duration: '64s', delay: '0s' },
  { left: '36.5%', top: -110, duration: '76s', delay: '-28s' },
  { left: '68%', top: -70, duration: '70s', delay: '-12s' },
]

export function Arrival({
  faces,
  electionLine,
  onSubmit,
  error,
}: {
  faces: WallFace[]
  /** "Election Day · Nov 3 · 25 days", or null when there is no date to show. */
  electionLine: string | null
  onSubmit: (zip: string) => boolean
  error: string | null
}) {
  const [draft, setDraft] = useState('')

  // Six faces per column; a short list is reused across columns rather than
  // leaving a column empty.
  const columns = COLS.map((c, i) => {
    const six = Array.from({ length: 6 }, (_, k) => faces[(i * 6 + k) % Math.max(faces.length, 1)]).filter(Boolean)
    return { ...c, tiles: [...six, ...six] }
  })

  return (
    <section className="relative -mx-4 mb-6 overflow-hidden px-4">
      {faces.length > 0 && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[320px] overflow-hidden">
          {columns.map((c, i) => (
            <div
              key={i}
              className="poli-wall-col absolute flex w-[27%] flex-col gap-2.5 pb-2.5"
              style={{ left: c.left, top: c.top, animationDuration: c.duration, animationDelay: c.delay }}
            >
              {c.tiles.map((f, k) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={k}
                  src={f.src}
                  alt=""
                  loading={k < 4 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="aspect-[106/140] w-full rounded-xl object-cover object-top"
                />
              ))}
            </div>
          ))}
          <div
            className="absolute inset-x-0 top-0 h-[90px]"
            style={{ background: 'linear-gradient(to bottom, var(--poli-bg) 20%, transparent)' }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[170px]"
            style={{ background: 'linear-gradient(to top, var(--poli-bg) 45%, transparent)' }}
          />
        </div>
      )}

      <div className={`relative ${faces.length ? 'pt-[232px]' : 'pt-2'}`}>
        {electionLine && (
          <span className="inline-flex items-center rounded-sm border border-[var(--poli-border)] bg-[var(--poli-card)] px-2.5 py-1.5 text-[12.5px] font-semibold text-[var(--poli-sub)]">
            {electionLine}
          </span>
        )}
        <h1 className="mt-3.5 font-serif text-[46px] font-normal leading-[1.08] text-[var(--poli-text)]">
          Who works for you?
        </h1>
        <p className="mt-3 text-[15px] leading-[1.5] text-[var(--poli-sub)]">
          Your senators, representative and governor: what they raised, which
          seats are on your ballot, and what Congress just did. One ZIP code.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (onSubmit(draft)) setDraft('')
          }}
          className="mt-5 flex gap-2"
        >
          <label htmlFor="arrival-zip" className="sr-only">
            ZIP code
          </label>
          <input
            id="arrival-zip"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            placeholder="ZIP code"
            className="h-[52px] min-w-0 flex-1 rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] px-4 text-[17px] font-semibold tracking-[0.06em] text-[var(--poli-text)] outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-[var(--poli-faint)] focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)]"
          />
          <button
            type="submit"
            className="h-[52px] shrink-0 rounded-xl bg-[var(--poli-marker)] px-5 text-[15px] font-semibold text-[var(--poli-marker-ink)]"
          >
            Show me
          </button>
        </form>
        {error && <p className="mt-2 text-[12.5px] text-[var(--poli-app-warn-ink)]">{error}</p>}
        <p className="mt-3 text-[12.5px] leading-[1.45] text-[var(--poli-sub)]">
          Money from the FEC. Bills from Congress.gov. Anything we estimated says so.
        </p>
      </div>
    </section>
  )
}
