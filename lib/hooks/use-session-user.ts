'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * The signed-in user's id, resolved on the client.
 *
 * Returns `undefined` while unresolved, `null` for a signed-out visitor, and
 * the id otherwise. Callers should render nothing for `undefined` rather than
 * assuming signed-out, or a control will flash in and out on every load.
 *
 * Uses getSession(), not getUser(). getSession reads the JWT that
 * @supabase/ssr already holds locally; getUser makes a network round-trip to
 * GoTrue to revalidate it. For deciding what to *show*, local is correct — the
 * server revalidates on every write, which is where it matters. The app had
 * eight components calling getUser() for exactly this purpose, two of them
 * (the header and the bottom tab bar) on every single page view.
 *
 * @supabase/ssr 0.5.2 returns one cached browser client, so mounting this in
 * many components costs one resolution, not many.
 */
export function useSessionUser(): string | null | undefined {
  const [userId, setUserId] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setUserId(data.session?.user.id ?? null)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setUserId(session?.user.id ?? null)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  return userId
}
