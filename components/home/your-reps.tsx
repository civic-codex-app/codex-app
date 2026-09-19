'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { Card, SectionLabel } from '@/components/app/surface'
import { partyColor } from '@/lib/constants/parties'
import { createClient } from '@/lib/supabase/client'

/**
 * "Your representatives" — the spine of the redesigned Home.
 *
 * A client island on purpose. The page around it is prerendered and served
 * from the CDN; this is the only part that varies per visitor, so it resolves
 * after hydration rather than making the whole route dynamic. Same pattern as
 * components/home/personal-strip.tsx.
 *
 * Where the location comes from, in order: the signed-in profile's zip_code,
 * then a zip the visitor typed here before (localStorage), then nothing, in
 * which case this asks. It never guesses.
 *
 * Two honesty constraints, both measured rather than assumed:
 *
 *  - 7,299 of the 33,774 zips in lib/data/zip-to-district.json straddle two or
 *    more congressional districts. The design draws exactly one House member.
 *    When a zip is ambiguous this says so and lists the candidates rather than
 *    silently picking the first, because picking would be a coin flip
 *    presented as a fact.
 *  - The endpoint returns senators and a governor for the state and House
 *    members for the district. It does not return state legislators or local
 *    officials: none of the 6,592 state-legislature rows carries a district,
 *    so they cannot be matched to a voter at all. The heading counts what is
 *    actually shown rather than promising five.
 */

type Rep = {
  id: string
  name: string
  slug: string
  party: string | null
  state: string | null
  chamber: string
  district?: string | null
  title: string | null
  image_url: string | null
}

const ZIP_KEY = 'poli-zip'

const ROLE: Record<string, string> = {
  senate: 'Senator',
  house: 'Representative',
  governor: 'Governor',
}

function roleLine(r: Rep) {
  const role = ROLE[r.chamber] ?? r.title ?? r.chamber
  const where = r.chamber === 'house' && r.district ? `${r.state}-${r.district}` : r.state
  const party = r.party ? r.party.charAt(0).toUpperCase() : null
  return [role, party ? `${party} · ${where}` : where].filter(Boolean).join(' · ')
}

export function YourReps() {
  const [zip, setZip] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [reps, setReps] = useState<Rep[] | null>(null)
  const [districts, setDistricts] = useState<Array<{ state: string; district: string }>>([])
  const [state, setState] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Resolve a starting zip: profile first, then whatever was typed before.
  useEffect(() => {
    let cancelled = false
    const stored = (() => {
      try {
        return localStorage.getItem(ZIP_KEY)
      } catch {
        return null
      }
    })()
    if (stored) setZip(stored)

    createClient()
      .auth.getSession()
      .then(async ({ data }) => {
        const uid = data.session?.user?.id
        if (!uid || cancelled) return
        const { data: profile } = await createClient()
          .from('profiles')
          .select('zip_code')
          .eq('id', uid)
          .maybeSingle()
        if (!cancelled && profile?.zip_code) setZip(String(profile.zip_code))
      })
      .catch(() => {
        /* signed out, or offline — the typed zip still works */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const load = useCallback(async (z: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/representatives?zip=${encodeURIComponent(z)}`)
      if (!res.ok) throw new Error('lookup failed')
      const json = await res.json()
      setReps(json.representatives ?? [])
      setDistricts(json.districts ?? [])
      setState(json.state ?? null)
    } catch {
      setError('Could not look that up just now.')
      setReps(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (zip) load(zip)
  }, [zip, load])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const z = draft.trim()
    if (!/^\d{5}$/.test(z)) {
      setError('Enter a 5-digit ZIP code.')
      return
    }
    try {
      localStorage.setItem(ZIP_KEY, z)
    } catch {
      /* private browsing — it still works for this visit */
    }
    setZip(z)
  }

  /* ── No location yet ─────────────────────────────────────────────── */
  if (!zip) {
    return (
      <section className="mb-6">
        <SectionLabel>Your representatives</SectionLabel>
        <Card>
          <p className="mb-3 text-[14px] leading-relaxed text-[var(--poli-sub)]">
            Enter your ZIP code to see who represents you in Washington and who
            is on your ballot.
          </p>
          <form onSubmit={submit} className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              placeholder="ZIP code"
              aria-label="ZIP code"
              className="h-11 min-w-0 flex-1 rounded-xl bg-[var(--poli-hover)] px-4 text-[15px] text-[var(--poli-text)] outline-none placeholder:text-[var(--poli-faint)] focus-visible:ring-2 focus-visible:ring-[var(--poli-input-focus)]"
            />
            <button
              type="submit"
              className="h-11 shrink-0 rounded-xl bg-[var(--poli-app-ink)] px-5 text-[14px] font-semibold text-white"
            >
              Show me
            </button>
          </form>
          {error && (
            <p className="mt-2 text-[12px] text-[var(--poli-app-warn-ink)]">{error}</p>
          )}
        </Card>
      </section>
    )
  }

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (loading && !reps) {
    return (
      <section className="mb-6">
        <SectionLabel>Your representatives</SectionLabel>
        <Card flush>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 ${i < 2 ? 'border-b border-[var(--poli-border)]' : ''}`}
            >
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-[var(--poli-border)]" />
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 h-[17px] w-1/2 animate-pulse rounded bg-[var(--poli-border)]" />
                <div className="h-[15px] w-1/3 animate-pulse rounded bg-[var(--poli-border)]" />
              </div>
            </div>
          ))}
        </Card>
      </section>
    )
  }

  const list = reps ?? []
  const house = list.filter((r) => r.chamber === 'house')
  const ambiguous = districts.length > 1

  return (
    <section className="mb-6">
      <SectionLabel
        right={
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.removeItem(ZIP_KEY)
              } catch {
                /* nothing to clear */
              }
              setZip(null)
              setReps(null)
              setDraft('')
            }}
            className="text-[12px] font-semibold text-[var(--poli-input-focus)]"
          >
            Change
          </button>
        }
      >
        {list.length ? `Your ${list.length} representatives` : 'Your representatives'}
      </SectionLabel>

      <Card flush>
        {list.length === 0 && (
          <p className="px-4 py-5 text-[14px] text-[var(--poli-sub)]">
            {error ?? `We do not have current officials on file for ${zip}.`}
          </p>
        )}

        {list.map((r, i) => (
          <Link
            key={r.id}
            href={`/politicians/${r.slug}`}
            className={`flex items-center gap-3 px-4 py-3 no-underline ${
              i < list.length - 1 ? 'border-b border-[var(--poli-border)]' : ''
            }`}
          >
            <span className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[var(--poli-hover)]">
              <AvatarImage
                src={r.image_url}
                alt={r.name}
                size={44}
                party={r.party ?? undefined}
                fallbackColor={partyColor(r.party ?? '')}
                className="h-full w-full object-cover object-top"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15.5px] font-semibold text-[var(--poli-text)]">
                {r.name}
              </span>
              <span className="block truncate text-[13px] text-[var(--poli-sub)]">
                {roleLine(r)}
              </span>
            </span>
            <svg
              width="8"
              height="14"
              viewBox="0 0 8 14"
              fill="none"
              aria-hidden="true"
              className="shrink-0 text-[var(--poli-faint)]"
            >
              <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </Link>
        ))}
      </Card>

      {/* A zip that spans districts cannot name one House member. Say so. */}
      {ambiguous && house.length > 1 && (
        <p className="mt-2 px-1 text-[12px] leading-relaxed text-[var(--poli-faint)]">
          ZIP {zip} covers {districts.length} congressional districts
          {state ? ` in ${state}` : ''}, so {house.length} House members are
          listed. Only one of them is yours.
        </p>
      )}
    </section>
  )
}
