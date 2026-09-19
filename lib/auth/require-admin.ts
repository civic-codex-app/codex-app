import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

/**
 * The admin gate for API routes.
 *
 * Every route under /api/admin must call this before it does anything else.
 * The proxy matcher does not cover them the way it covers the /admin pages:
 * `updateSession` tests `pathname.startsWith('/admin')`, and "/api/admin/…"
 * does not start with "/admin". Each of these routes therefore defends itself,
 * and /api/admin/daily-topics did not — an anonymous POST reached the handler
 * and refreshed the homepage news strip with the service role, which bypasses
 * RLS entirely, so migration 029 could not stop it.
 *
 * The check was copy-pasted into five files in four shapes (`isAdmin`,
 * `verifyAdmin`, and twice inline), which is how one of them came to be
 * missing. One implementation now, so there is one place to get it right.
 *
 * Reads the role with the service-role client on purpose: `profiles` is closed
 * to anon, and an admin reading their own role through RLS would need a policy
 * that exists only for this. The id it looks up comes from the verified
 * session, never from the request body.
 */
export type AdminCheck =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }

export async function requireAdmin(): Promise<AdminCheck> {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const service = createServiceRoleClient()
  const { data: profile, error } = await service
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  // A failed lookup denies. Treating an error as "not an admin" is the safe
  // direction; `.single()` also threw here when a profile row was missing.
  if (error || profile?.role !== 'admin') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { ok: true, userId: user.id }
}
