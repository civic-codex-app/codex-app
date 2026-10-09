'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocation, type Rep } from '@/lib/hooks/use-location'
import { Card, Chip, SectionLabel } from '@/components/app/surface'
import { Face } from '@/components/app/face'
import { BottomSheet } from '@/components/app/sheet'
import { SearchInput } from '@/components/directory/search-input'
import { US_STATES, STATE_NAMES } from '@/lib/constants/us-states'

type Row = Rep & { district: string | null }

interface Payload {
  state: string
  stateName: string
  senate: Row[]
  governor: Row[]
  house: Row[]
}

const ROLE: Record<string, string> = { senate: 'Senator', house: 'Representative', governor: 'Governor' }

function roleLine(r: Row) {
  const role = ROLE[r.chamber] ?? r.title ?? r.chamber
  return r.chamber === 'house' && r.district ? `${role} · ${r.state}-${r.district}` : role
}

/**
 * Reps: one state, grouped by office, every row a face.
 *
 * The state is the visitor's own when a ZIP is known, otherwise whichever
 * the pill picks. The visitor's own officials carry the one Marker on the
 * screen; everyone else carries a tag only when something is unusual —
 * "Running again" is the default and is not written ten times down a list.
 */
export function DirectoryView({ initialState }: { initialState: string | null }) {
  const loc = useLocation()
  const [state, setState] = useState<string | null>(initialState)
  const [data, setData] = useState<Payload | null>(null)
  const [states, setStates] = useState(false)

  // The visitor's own state once the ZIP resolves, unless the URL named one.
  useEffect(() => {
    if (!initialState && loc.state) setState(loc.state)
  }, [initialState, loc.state])

  useEffect(() => {
    if (!state) return
    let cancelled = false
    setData(null)
    fetch(`/api/directory?state=${encodeURIComponent(state)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled && json) setData(json)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [state])

  // Senators and the governor are everyone's in the state; the Marker goes on
  // the one row that is specifically the visitor's — their House member.
  const mine = new Set((loc.reps ?? []).filter((r) => r.chamber === 'house').map((r) => r.id))
  const groups = data
    ? [
        { label: 'U.S. Senate', rows: data.senate },
        { label: 'Governor', rows: data.governor },
        { label: 'U.S. House', rows: data.house },
      ].filter((g) => g.rows.length)
    : []

  return (
    <>
      <header className="mb-3 flex items-center justify-between px-1">
        <h1 className="font-serif text-[40px] font-normal leading-[1.08] text-[var(--poli-text)]">Reps</h1>
        <button
          type="button"
          onClick={() => setStates(true)}
          className="inline-flex h-[34px] items-center gap-1.5 rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] px-3 text-[13px] font-semibold text-[var(--poli-text)]"
        >
          {state ? STATE_NAMES[state] ?? state : 'Choose a state'}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </header>

      <div className="mb-3">
        <Suspense>
          <SearchInput basePath="/directory" />
        </Suspense>
      </div>

      {!state && loc.ready && (
        <Card className="mb-3">
          <p className="text-[14.5px] leading-[1.5] text-[var(--poli-sub)]">
            Pick a state above, or <Link href="/" className="font-semibold text-[var(--poli-text)] no-underline">enter your ZIP on Home</Link> to start with your own.
          </p>
        </Card>
      )}

      {state && !data && (
        <Card flush className="mb-3 px-3.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`flex items-center gap-3 py-3 ${i < 3 ? 'border-b border-[var(--poli-border)]' : ''}`}>
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-[var(--poli-border)]" />
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 h-[16px] w-1/2 animate-pulse rounded bg-[var(--poli-border)]" />
                <div className="h-[14px] w-1/3 animate-pulse rounded bg-[var(--poli-border)]" />
              </div>
            </div>
          ))}
        </Card>
      )}

      {groups.map((g) => (
        <section key={g.label} className="mb-3">
          <SectionLabel right={<span className="text-[12px] text-[var(--poli-sub)]">{g.rows.length === 1 ? '1 person' : `${g.rows.length} people`}</span>}>
            {g.label}
          </SectionLabel>
          <Card flush className="px-3.5">
            {g.rows.map((r, i) => {
              const yours = mine.has(r.id)
              const tag = r.candidacy && r.candidacy.kind !== 'running' && r.candidacy.kind !== 'not_up' ? r.candidacy.label : null
              return (
                <Link key={r.id} href={`/politicians/${r.slug}`} className={`flex min-h-[60px] items-center gap-3 no-underline ${i < g.rows.length - 1 ? 'border-b border-[var(--poli-border)]' : ''}`}>
                  <Face src={r.image_url} alt={r.name} size={40} party={r.party} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-[var(--poli-text)]">{r.name}</span>
                    <span className="block truncate text-[12.5px] text-[var(--poli-sub)]">{roleLine(r)}</span>
                  </span>
                  {yours && <Chip tone="marker">Yours</Chip>}
                  {tag && <Chip>{tag}</Chip>}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-[var(--poli-faint)]"><path d="M9 6l6 6-6 6" /></svg>
                </Link>
              )
            })}
          </Card>
        </section>
      ))}

      <p className="mb-4 px-1 text-[12.5px] leading-[1.5] text-[var(--poli-sub)]">
        Congress and the governor. State legislators and local officials are in the{' '}
        <Link href="/directory?all=1" className="font-semibold text-[var(--poli-text)] no-underline">full directory</Link>.
      </p>

      <BottomSheet open={states} onClose={() => setStates(false)} label="Choose a state">
        <h2 className="font-serif text-[32px] font-normal leading-[1.08] text-[var(--poli-text)]">Another state</h2>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {US_STATES.map((s) => {
            const code = typeof s === 'string' ? s : (s as { code: string }).code
            const on = code === state
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setState(code)
                  setStates(false)
                  window.history.replaceState(null, '', `/directory?state=${code}`)
                }}
                className="h-11 rounded-xl text-[14px] font-semibold"
                style={{
                  background: on ? 'var(--poli-text)' : 'var(--poli-badge-bg)',
                  color: on ? 'var(--poli-card)' : 'var(--poli-text)',
                }}
              >
                {code}
              </button>
            )
          })}
        </div>
      </BottomSheet>
    </>
  )
}
