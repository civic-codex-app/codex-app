/**
 * Every API route must require what it claims to require.
 *
 * The page gates say nothing about app/api: verify:pages skips /api links, and
 * a route handler is invisible to type-checking, tests and the build no matter
 * who can call it. That is how /api/admin/daily-topics came to have no auth
 * check at all — an anonymous POST reached the handler and ingested news into
 * daily_topics through the service role, which bypasses RLS, so migration 029
 * could not stop it. The proxy did not cover it either: `updateSession` tests
 * `startsWith('/admin')`, and "/api/admin/…" does not start with "/admin".
 *
 * Two passes.
 *
 * 1. Static. Read each route file, split it per exported verb, and check the
 *    handler contains the guard its classification demands. This runs no
 *    requests, so it can report an unguarded destructive handler without
 *    firing it.
 *
 * 2. Dynamic. Send one unauthenticated request per verb and check the answer:
 *    a guarded route must refuse with 401 or 403; a public one must answer
 *    without a server error. Only routes the static pass cleared are probed,
 *    so the gate never triggers the very hole it is looking for. Public write
 *    routes get an empty JSON body, which their own validation rejects before
 *    anything is written.
 *
 * Classification is the table below, not a guess from the path. A route with
 * no entry fails as "unclassified" — so adding a route forces a decision about
 * who may call it, which is the check that was missing.
 *
 * Usage:
 *   pnpm dev                       # in another terminal
 *   node scripts/check-api-routes.mjs
 *   node scripts/check-api-routes.mjs --static-only
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { arg, has } from './lib/cli.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const API_DIR = join(ROOT, 'app', 'api')
const BASE = arg('base', 'http://localhost:3000').replace(/\/$/, '')
const STATIC_ONLY = has('static-only')

/**
 * What each route requires of its caller.
 *
 *   admin  — a signed-in user whose profile role is 'admin'. Must call requireAdmin().
 *   cron   — the CRON_SECRET bearer token. Must refuse when the variable is unset.
 *   auth   — any signed-in user. Must check auth.getUser() and refuse without one.
 *   owner  — anyone may call it, but it must return only the caller's own rows
 *            and an empty result to an anonymous caller. Not "public": the
 *            check is that the query is scoped to the session user, which is
 *            what stops it becoming the per-user preference graph that view
 *            028 exists to avoid.
 *   public — deliberately callable by anyone. Reads, rate-limited computes, and
 *            the anonymous poll vote. Listed here so "public" is a decision on
 *            the record rather than an omission.
 */
const EXPECTED = {
  'admin/analytics': { GET: 'admin' },
  'admin/daily-topics': { POST: 'admin' },
  'admin/demo-users': { GET: 'admin', DELETE: 'admin' },
  'admin/settings': { PUT: 'admin' },
  'admin/submissions': { PATCH: 'admin' },
  'cron/daily-topics': { GET: 'cron' },
  'cron/weekly-maintenance': { GET: 'cron' },
  'analytics': { POST: 'public' }, // fire-and-forget event, attributed only if signed in
  'annotations': { POST: 'auth', GET: 'public' },
  'auth/delete-account': { POST: 'auth' },
  'auth/signout': { POST: 'public' }, // signing out without a session is harmless
  'engagement': { POST: 'auth', GET: 'auth' },
  'issue-follow': { GET: 'owner', POST: 'auth' }, // GET answers anonymous with an empty list
  'issues/[slug]/stances': { GET: 'public' },
  'match': { POST: 'public' },
  'me/home': { GET: 'owner' }, // homepage personal strip; anonymous gets signedIn:false and empty arrays // computes a match from a posted quiz, writes nothing
  'politicians': { GET: 'public' },
  'polls/vote': { POST: 'public' }, // anonymous voting by design; rate-limited and cookie-deduped
  'quiz-answers': { GET: 'auth', POST: 'auth' },
  'representatives': { GET: 'public' },
  'representatives/stances': { POST: 'public' }, // lookup by id, writes nothing
  'search': { GET: 'public' },
  'sharing': { GET: 'auth', POST: 'auth' },
  'submissions': { POST: 'auth' },
  'trending': { GET: 'public' },
  'upload': { POST: 'auth' },
  'upload/avatar': { POST: 'auth' },
}

/** Sample values for the dynamic pass, so a route gets a plausible URL. */
const SAMPLE = { '[slug]': 'economy-and-jobs' }

const VERBS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

function findRoutes(dir) {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...findRoutes(p))
    else if (e.name === 'route.ts' || e.name === 'route.js') out.push(p)
  }
  return out
}

/**
 * Comments stripped, because the patterns below are looked for in code.
 * Without this, the comment explaining that the fail-open `if (SECRET && …)`
 * shape was fixed made the detector report the fixed route as still broken.
 */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

/** The body of one exported handler: from its signature to the next export. */
function handlerBody(source, verb) {
  const start = source.search(new RegExp(`export\\s+async\\s+function\\s+${verb}\\b`))
  if (start === -1) return null
  const rest = source.slice(start + 1)
  const next = rest.search(/export\s+(async\s+)?(function|const)\s/)
  return stripComments(next === -1 ? source.slice(start) : source.slice(start, start + 1 + next))
}

const GUARDS = {
  admin: (body) => /requireAdmin\s*\(/.test(body),
  // Must reference the secret and must not be the fail-open `if (SECRET && …)`
  // shape, which skips the check entirely when the variable is unset.
  cron: (body) => /CRON_SECRET/.test(body) && !/if\s*\(\s*CRON_SECRET\s*&&/.test(body),
  auth: (body) => /auth\.getUser\s*\(/.test(body) && /(401|403)/.test(body),
  // Reads the session user and scopes the query to it. A route that fetched
  // every row and filtered later would fail this.
  owner: (body) => /auth\.getUser\s*\(/.test(body) && /user\.id/.test(body),
  public: () => true,
}

const routes = findRoutes(API_DIR).sort()
let fail = 0
const checked = []

console.log(`${routes.length} route file(s) under app/api\n`)
console.log('static pass — does each handler contain the guard its classification demands?')

for (const file of routes) {
  const name = relative(API_DIR, dirname(file)).split('\\').join('/')
  const source = readFileSync(file, 'utf8')
  const present = VERBS.filter((v) => new RegExp(`export\\s+async\\s+function\\s+${v}\\b`).test(source))
  const expected = EXPECTED[name]

  if (!expected) {
    console.log(`  UNCLASSIFIED  ${name.padEnd(30)} ${present.join(',')}`)
    console.log(`                add it to EXPECTED in this script and say who may call it`)
    fail++
    continue
  }

  for (const verb of present) {
    const want = expected[verb]
    if (!want) {
      console.log(`  UNCLASSIFIED  ${name.padEnd(30)} ${verb} is exported but not classified`)
      fail++
      continue
    }
    const body = handlerBody(source, verb)
    const ok = body !== null && GUARDS[want](body)
    if (!ok) {
      console.log(`  NO GUARD      ${name.padEnd(30)} ${verb} must require ${want}`)
      fail++
      continue
    }
    checked.push({ name, verb, want })
  }

  for (const verb of Object.keys(expected)) {
    if (!present.includes(verb)) {
      console.log(`  STALE ENTRY   ${name.padEnd(30)} ${verb} is classified but no longer exported`)
      fail++
    }
  }
}
console.log(`  ${checked.length} handler(s) carry the right guard; ${fail} problem(s)`)

if (STATIC_ONLY || fail) {
  if (fail && !STATIC_ONLY) console.log('\nskipping the dynamic pass: a route with no guard must not be probed, since probing it would run it')
  console.log(`\n${fail ? `${fail} problem(s)` : 'every route requires what it claims to'}`)
  process.exit(fail ? 1 : 0)
}

console.log('\ndynamic pass — unauthenticated, one request per handler')
const urlFor = (name) => `${BASE}/api/${name.split('/').map((s) => SAMPLE[s] ?? s).join('/')}`

for (const { name, verb, want } of checked) {
  let status, body = ''
  try {
    const res = await fetch(urlFor(name), {
      method: verb,
      redirect: 'manual',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      // An empty object: a public write rejects it in validation before it
      // writes anything, and a guarded route never gets that far.
      ...(verb === 'GET' || verb === 'DELETE' ? {} : { body: '{}' }),
    })
    status = res.status
    body = (await res.text()).slice(0, 80).replace(/\s+/g, ' ')
  } catch (e) {
    console.log(`  ERROR         ${name.padEnd(30)} ${verb.padEnd(6)} ${e.message.slice(0, 60)}`)
    fail++
    continue
  }

  const refused = status === 401 || status === 403
  if (want === 'owner') {
    // Anonymous is allowed through; what matters is that it comes back with
    // nothing. The static pass is what proves the query is scoped.
    const empty = /\[\s*\]/.test(body) || refused
    if (status >= 500) { console.log(`  SERVER ERROR  ${name.padEnd(30)} ${verb.padEnd(6)} HTTP ${status}  ${body}`); fail++ }
    else if (!empty) { console.log(`  LEAKS ROWS    ${name.padEnd(30)} ${verb.padEnd(6)} HTTP ${status} — anonymous caller got data  ${body}`); fail++ }
    else console.log(`  ok            ${name.padEnd(30)} ${verb.padEnd(6)} HTTP ${status} (owner-scoped, empty for anonymous)`)
  } else if (want === 'public') {
    // 4xx is fine: the handler ran and rejected the empty body. 5xx is not.
    const ok = status < 500
    if (!ok) { console.log(`  SERVER ERROR  ${name.padEnd(30)} ${verb.padEnd(6)} HTTP ${status}  ${body}`); fail++ }
    else console.log(`  ok            ${name.padEnd(30)} ${verb.padEnd(6)} HTTP ${status} (public)`)
  } else if (refused) {
    console.log(`  ok            ${name.padEnd(30)} ${verb.padEnd(6)} HTTP ${status} (refuses anonymous ${want})`)
  } else {
    console.log(`  REACHABLE     ${name.padEnd(30)} ${verb.padEnd(6)} HTTP ${status} — should require ${want}  ${body}`)
    fail++
  }
}

console.log(`\n${fail ? `${fail} problem(s)` : 'every route requires what it claims to'}`)
process.exit(fail ? 1 : 0)
