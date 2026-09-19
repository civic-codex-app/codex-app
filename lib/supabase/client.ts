import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * The signed-in user, read from the JWT this client already holds locally.
 *
 * Deliberately shaped like `auth.getUser()` so a call site swaps one
 * identifier and keeps its destructuring — but `getUser()` makes a network
 * round-trip to GoTrue to revalidate the token, and `getSession()` does not.
 * For deciding what to *show*, local is the right answer: the server
 * revalidates on every write, which is where it actually matters.
 *
 * Eleven client components were calling `getUser()` for exactly this, two of
 * them (the header and the bottom tab bar) on every page view.
 *
 * Server components must keep using `auth.getUser()`. On the server the
 * cookie is attacker-controllable, so revalidating is the point; Supabase
 * documents `getSession()` as unsafe there.
 */
export async function getLocalUser(client: ReturnType<typeof createClient>) {
  const { data } = await client.auth.getSession()
  return { data: { user: data.session?.user ?? null } }
}
