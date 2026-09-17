/**
 * A throwaway admin account, so a gate can check the auth-gated pages.
 *
 * Signed out, every /admin and /dashboard route redirects to /login, so a
 * sweep sees the login page under 31 different names and the gated layouts go
 * unchecked. The demo accounts have no password. This creates one admin with a
 * random password for the duration of a run and deletes it afterwards:
 *
 *   - email  pages-check-<random>@poli-check.local, never a real domain
 *   - password 32 random bytes, never printed
 *   - deleted in cleanup(), on SIGINT, and any survivor from a crashed run is
 *     removed at the start of the next one (auth.users -> profiles cascades)
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY: the auth admin API and the profiles.role
 * update both bypass RLS. Reads .env.local itself.
 */
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const CHECK_DOMAIN = 'poli-check.local'

function envLocal(key) {
  if (process.env[key]) return process.env[key]
  const f = join(ROOT, '.env.local')
  if (!existsSync(f)) return null
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/)
    if (m && m[1] === key) return m[2].trim()
  }
  return null
}

export async function createEphemeralAdmin() {
  const url = envLocal('NEXT_PUBLIC_SUPABASE_URL')
  const key = envLocal('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are needed, in the environment or .env.local')
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  // Anything a crashed earlier run left behind goes first.
  let removedStale = 0
  for (let page = 1; ; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 500 })
    if (error) throw new Error(`listUsers: ${error.message}`)
    for (const u of data.users) {
      if (u.email?.endsWith(`@${CHECK_DOMAIN}`)) {
        const { error: e } = await sb.auth.admin.deleteUser(u.id)
        if (e) throw new Error(`could not delete stale ${u.email}: ${e.message}`)
        removedStale++
      }
    }
    if (data.users.length < 500) break
  }

  const email = `pages-check-${randomBytes(4).toString('hex')}@${CHECK_DOMAIN}`
  const password = randomBytes(32).toString('base64url')
  const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { display_name: 'pages-check' } })
  if (error) throw new Error(`createUser: ${error.message}`)
  const id = data.user.id

  let cleaned = false
  const cleanup = async () => {
    if (cleaned) return
    cleaned = true
    const { error: e } = await sb.auth.admin.deleteUser(id)
    if (e) console.error(`\nFAILED to delete the ephemeral admin ${email} (${id}): ${e.message}. Delete it by hand in Supabase -> Authentication.`)
  }

  // The on_auth_user_created trigger has already inserted the profile row.
  const { error: e2 } = await sb.from('profiles').update({ role: 'admin' }).eq('id', id)
  const { data: prof } = await sb.from('profiles').select('role').eq('id', id).maybeSingle()
  if (e2 || prof?.role !== 'admin') {
    await cleanup()
    throw new Error(`could not grant the admin role: ${e2?.message ?? `profile role is ${prof?.role ?? 'missing'}`}`)
  }

  process.once('SIGINT', async () => { await cleanup(); process.exit(130) })
  return { email, password, id, removedStale, cleanup }
}
