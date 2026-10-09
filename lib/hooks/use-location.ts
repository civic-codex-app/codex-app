'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Candidacy } from '@/lib/utils/candidacy'

/**
 * Where the visitor is, and who represents them there.
 *
 * One answer for every screen that is personal — Home, Ballot, Issues, Feed,
 * the directory — so they agree with each other. The ZIP comes from the
 * signed-in profile when there is one, otherwise from the one typed on Home
 * (localStorage), otherwise nothing: the hook never guesses a location.
 *
 * The ZIP itself lives in one module-level store that every mounted hook
 * subscribes to. Without that, Home's two islands each held a copy: typing a
 * ZIP into one left the other showing the national count until a reload.
 *
 * `ready` turns true once the first local read has happened. Until then a
 * screen should render neither the prompt nor the result, or every visitor
 * with a stored ZIP sees the prompt flash before their own officials appear.
 *
 * /api/representatives is CDN-cached for a day per ZIP, so several screens
 * calling this costs one origin hit, not several.
 */

export type Rep = {
  id: string
  name: string
  slug: string
  party: string | null
  state: string | null
  chamber: string
  district?: string | null
  title: string | null
  image_url: string | null
  candidacy?: Candidacy | null
}

export const ZIP_KEY = 'poli-zip'

export function readStoredZip(): string | null {
  try {
    const z = localStorage.getItem(ZIP_KEY)
    return z && /^\d{5}$/.test(z) ? z : null
  } catch {
    return null
  }
}

/* ── One ZIP for the whole page ─────────────────────────────────────── */

let current: string | null | undefined // undefined: storage not read yet
let profileChecked = false
const listeners = new Set<(z: string | null) => void>()

function publish(z: string | null) {
  current = z
  listeners.forEach((l) => l(z))
}

function ensureRead(): string | null {
  if (current === undefined) current = readStoredZip()
  return current
}

/** The signed-in profile's ZIP wins over a typed one; checked once per page. */
function checkProfileOnce() {
  if (profileChecked) return
  profileChecked = true
  createClient()
    .auth.getSession()
    .then(async ({ data }) => {
      const uid = data.session?.user?.id
      if (!uid) return
      const { data: profile } = await createClient()
        .from('profiles')
        .select('zip_code')
        .eq('id', uid)
        .maybeSingle()
      const z = profile?.zip_code ? String(profile.zip_code) : null
      if (z && /^\d{5}$/.test(z) && z !== current) publish(z)
    })
    .catch(() => {
      /* signed out, or offline — the typed ZIP still works */
    })
}

export function useLocation() {
  const [zip, setZipState] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<string | null>(null)
  const [districts, setDistricts] = useState<Array<{ state: string; district: string }>>([])
  const [reps, setReps] = useState<Rep[] | null>(null)

  useEffect(() => {
    setZipState(ensureRead())
    setReady(true)
    listeners.add(setZipState)
    checkProfileOnce()
    return () => {
      listeners.delete(setZipState)
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
    else {
      setReps(null)
      setDistricts([])
      setState(null)
    }
  }, [zip, load])

  const setZip = useCallback((z: string): boolean => {
    const trimmed = z.trim()
    if (!/^\d{5}$/.test(trimmed)) {
      setError('Enter a 5-digit ZIP code.')
      return false
    }
    try {
      localStorage.setItem(ZIP_KEY, trimmed)
    } catch {
      /* private browsing — it still works for this visit */
    }
    setError(null)
    publish(trimmed)
    return true
  }, [])

  const clearZip = useCallback(() => {
    try {
      localStorage.removeItem(ZIP_KEY)
    } catch {
      /* nothing to clear */
    }
    setError(null)
    publish(null)
  }, [])

  return { zip, ready, loading, error, state, districts, reps, setZip, clearZip }
}
