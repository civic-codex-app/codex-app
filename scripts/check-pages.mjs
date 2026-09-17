/**
 * Load every route in a real browser and report the failures the build cannot
 * see, then follow every internal link and report the ones that do not answer.
 *
 * Per route, in the browser:
 *   - the document's HTTP status, and where it redirected to, so an auth-gated
 *     page is not scored as /login under the wrong name
 *   - uncaught exceptions and console errors — this is where React reports a
 *     hydration mismatch, and where a server component that threw inside a
 *     Suspense boundary surfaces (the HTML still says 200)
 *   - same-origin requests that failed or returned 4xx/5xx: a client fetch to
 *     an /api route that errors, a missing asset, a favicon
 *   - images that finished loading with no pixels. Politician photos are
 *     rendered server-side with no fallback, so a dead upstream URL shows a
 *     broken-image icon to the voter
 *   - every internal link on the page, which feeds the second phase
 *
 * Then, without a browser, every internal link discovered is fetched and any
 * that does not answer 2xx is reported with the pages that link to it.
 * High-cardinality patterns (/politicians/*) are sampled and the sample size is
 * printed, so a partial check never reads as a full one.
 *
 * Usage:
 *   pnpm dev                                          # in another terminal
 *   node scripts/check-pages.mjs
 *   node scripts/check-pages.mjs --routes=/,/directory --links=0
 *   node scripts/check-pages.mjs --login=you@example.com:password    # gated pages, signed in
 *   node scripts/check-pages.mjs --ephemeral-admin                    # same, with a throwaway admin
 *                                                                     # created for the run and deleted after
 *   node scripts/check-pages.mjs --routes-file=urls.txt --links=0    # e.g. every /politicians/[slug]
 *   node scripts/check-pages.mjs --cap=200 --concurrency=8               # against a production build
 */
import { readFileSync } from 'node:fs'
import { arg, has } from './lib/cli.mjs'
import { createEphemeralAdmin } from './lib/ephemeral-admin.mjs'
import { launch, isSessionDeath, signIn } from './lib/browser.mjs'
import { ALL_ROUTES } from './lib/routes.mjs'

const BASE = arg('base', 'http://localhost:3000').replace(/\/$/, '')
const ORIGIN = new URL(BASE).origin
const WIDTH = Number(arg('width', '1280'))
const CAP = Number(arg('cap', '60'))
// Two at a time. The dev server renders concurrent heavy pages far slower
// than in sequence: the 22 issue pages take 2-7s each alone, 25-32s each two
// at a time, and time out at 120s six at a time. A timeout reported as a
// failure is worse than a slower gate. Raise it for a production build.
const CONCURRENCY = Number(arg('concurrency', '2'))
const FOLLOW_LINKS = arg('links', '1') !== '0'
let LOGIN = arg('login', null)
let ephemeral = null
if (has('ephemeral-admin')) {
  ephemeral = await createEphemeralAdmin()
  LOGIN = `${ephemeral.email}:${ephemeral.password}`
  console.log(`created ephemeral admin ${ephemeral.email}${ephemeral.removedStale ? ` (removed ${ephemeral.removedStale} left over from an earlier run)` : ''}`)
}
const cleanup = async () => { if (ephemeral) await ephemeral.cleanup() }
const routesFile = arg('routes-file', null)
const ROUTES = routesFile
  ? readFileSync(routesFile, 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'))
  : arg('routes', ALL_ROUTES.join(',')).split(',')

// Dev-server chatter that is not a page problem.
const NOISE = [/Download the React DevTools/, /\[Fast Refresh\]/, /\[HMR\]/, /hot-reloader|hmr/i]

let browser = await launch()
let page = await browser.newPage()

// Everything the listeners see during the current navigation lands here.
let cur = null
const fresh = () => ({ console: [], errors: [], failed: [], responses: [] })

function attach(p) {
  p.on('console', (m) => {
    if (!cur) return
    const type = m.type()
    if (type !== 'error' && type !== 'warning') return
    const text = m.text()
    if (NOISE.some((re) => re.test(text))) return
    cur.console.push({ type, text: text.replace(/\s+/g, ' ').slice(0, 300) })
  })
  p.on('pageerror', (e) => cur && cur.errors.push(String(e?.message ?? e).replace(/\s+/g, ' ').slice(0, 300)))
  p.on('requestfailed', (req) => {
    if (!cur) return
    const err = req.failure()?.errorText ?? ''
    // A navigation cancels in-flight fetches; that is not the resource failing.
    if (err === 'net::ERR_ABORTED') return
    cur.failed.push({ url: req.url(), type: req.resourceType(), err })
  })
  p.on('response', (res) => {
    if (!cur) return
    const status = res.status()
    if (status < 400) return
    const url = res.url()
    const type = res.request().resourceType()
    // The document's own status is reported separately. Off-origin failures
    // matter only for images (a dead photo URL); the rest is third-party.
    if (type === 'document') return
    if (!url.startsWith(ORIGIN) && type !== 'image') return
    cur.responses.push({ url, status, type })
  })
}
attach(page)

async function recover() {
  try { await browser.close() } catch {}
  browser = await launch()
  page = await browser.newPage()
  attach(page)
  await page.setViewport({ width: WIDTH, height: 900, deviceScaleFactor: 1 })
}
await page.setViewport({ width: WIDTH, height: 900, deviceScaleFactor: 1 })

if (LOGIN) {
  try {
    const { email, landed } = await signIn(page, BASE, LOGIN)
    console.log(`signed in as ${email}; landed on ${landed}\n`)
  } catch (e) {
    console.error(e.message)
    await browser.close()
    await cleanup()
    process.exit(1)
  }
}

const short = (u) => (u.startsWith(ORIGIN) ? u.slice(ORIGIN.length) : u).slice(0, 110)
const pathOf = (u) => { const x = new URL(u); return x.pathname + x.search }

/** Group a path so high-cardinality routes can be sampled and reported as such. */
function pattern(path) {
  const [p, q] = path.split('?')
  const segs = p.split('/').filter(Boolean)
  let key = segs.length === 0 ? '/' : `/${segs[0]}` + (segs.length > 1 ? '/*' : '')
  if (q) key += '?*'
  return key
}

let bad = 0
const linkedFrom = new Map() // internal path -> Set(seed route)

console.log(`${ROUTES.length} route(s) in the browser at ${WIDTH}px\n`)

for (const route of ROUTES) {
  let res = null
  let loaded = false
  for (let attempt = 0; attempt < 2 && !loaded; attempt++) {
    cur = fresh()
    try {
      res = await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 120000 })
      loaded = true
    } catch (e) {
      if (attempt === 0 && isSessionDeath(e)) { await recover(); continue }
      console.log(`  ${route.padEnd(60)} LOAD FAILED: ${e.message.slice(0, 80)}`)
      bad++
    }
  }
  if (!loaded) continue

  // Hydration finishes after the network goes quiet; give React a beat to log.
  await new Promise((r) => setTimeout(r, 400))

  const dom = await page.evaluate(async (origin) => {
    // Lazy images below the fold never start loading, so force every image to
    // load and wait for it; otherwise a broken photo further down goes unseen.
    const imgs = [...document.images].filter((i) => i.getAttribute('src'))
    for (const i of imgs) i.loading = 'eager'
    await Promise.race([
      Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }) })))),
      new Promise((r) => setTimeout(r, 10000)),
    ])
    const broken = imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => ({ src: (i.currentSrc || i.src).slice(0, 120), alt: (i.alt || '').slice(0, 40) }))
    const pending = imgs.filter((i) => !i.complete).length
    const links = new Set()
    for (const a of document.querySelectorAll('a[href]')) {
      let u
      try { u = new URL(a.getAttribute('href'), location.href) } catch { continue }
      if (u.origin !== origin) continue
      if (u.pathname.startsWith('/_next/') || u.pathname.startsWith('/api/')) continue
      u.hash = ''
      links.add(u.pathname + u.search)
    }
    return { title: document.title, broken, pending, images: imgs.length, links: [...links] }
  }, ORIGIN)

  const snapshot = cur
  cur = null

  const status = res?.status() ?? 0
  const landed = pathOf(page.url())
  const redirected = landed !== route ? `  -> ${landed}` : ''
  const errors = [...snapshot.errors.map((t) => ({ kind: 'uncaught', text: t })), ...snapshot.console.filter((c) => c.type === 'error').map((c) => ({ kind: 'console', text: c.text }))]
  const warnings = snapshot.console.filter((c) => c.type === 'warning')
  const resourceFails = [...snapshot.failed.map((f) => `${f.type} ${short(f.url)} ${f.err}`), ...snapshot.responses.map((r) => `${r.type} ${short(r.url)} HTTP ${r.status}`)]
  const problems = (status >= 400 ? 1 : 0) + errors.length + resourceFails.length + dom.broken.length
  if (problems) bad++

  const tag = status >= 400 ? `HTTP ${status}` : problems ? `${problems} problem(s)` : warnings.length ? `ok, ${warnings.length} warning(s)` : 'ok'
  console.log(`  ${route.padEnd(60)} ${String(status).padEnd(4)} ${tag}${redirected}`)
  if (!dom.title) console.log(`        no <title>`)
  for (const e of errors) console.log(`        ${e.kind}: ${e.text}`)
  for (const w of warnings) console.log(`        warning: ${w.text}`)
  for (const r of [...new Set(resourceFails)]) console.log(`        ${r}`)
  for (const b of dom.broken) console.log(`        broken image: ${b.src}${b.alt ? `  (alt "${b.alt}")` : ''}`)
  if (dom.pending) console.log(`        ${dom.pending} of ${dom.images} image(s) still loading after 10s — not checked`)

  for (const l of dom.links) {
    if (!linkedFrom.has(l)) linkedFrom.set(l, new Set())
    linkedFrom.get(l).add(route)
  }
}

await browser.close()

if (FOLLOW_LINKS) {
  const seeds = new Set(ROUTES)
  const discovered = [...linkedFrom.keys()].filter((l) => !seeds.has(l)).sort()

  // A link that appears on three or more pages is navigation — a sidebar, a
  // header, a footer — and a 404 there is on every screen. Those are always
  // checked. The rest of a high-cardinality pattern is sampled evenly, and
  // the report says so. (An even sample of 40 in 312 admin links missed both
  // dead sidebar entries the first time.)
  const NAV_MIN_PAGES = 3
  const byPattern = new Map()
  for (const l of discovered) { const k = pattern(l); if (!byPattern.has(k)) byPattern.set(k, []); byPattern.get(k).push(l) }
  const toCheck = []
  const sampled = []
  for (const [k, list] of [...byPattern].sort()) {
    const nav = list.filter((l) => linkedFrom.get(l).size >= NAV_MIN_PAGES)
    const rest = list.filter((l) => linkedFrom.get(l).size < NAV_MIN_PAGES)
    toCheck.push(...nav)
    if (rest.length <= CAP) { toCheck.push(...rest); continue }
    const step = rest.length / CAP
    for (let i = 0; i < CAP; i++) toCheck.push(rest[Math.floor(i * step)])
    sampled.push(`${k}: ${nav.length} nav + ${CAP} of ${rest.length}`)
  }

  console.log(`\n${discovered.length} internal link(s) discovered beyond the ${ROUTES.length} routes; fetching ${toCheck.length}${sampled.length ? ` (sampled — ${sampled.join(', ')})` : ''}, ${CONCURRENCY} at a time\n`)

  async function probe(path) {
    const t0 = Date.now()
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), 120000)
    try {
      const r = await fetch(BASE + path, { redirect: 'follow', signal: ctl.signal, headers: { accept: 'text/html' } })
      const body = await r.text()
      // React's streaming marker for "this boundary errored on the server,
      // client-render the fallback": the HTML is a 200 that contains an error.
      const streamedError = body.includes('$RX(')
      return { status: r.status, final: pathOf(r.url), ms: Date.now() - t0, streamedError }
    } catch (e) {
      return { status: 0, err: e.name === 'AbortError' ? 'timeout' : e.message, ms: Date.now() - t0 }
    } finally { clearTimeout(timer) }
  }

  const results = new Array(toCheck.length)
  let next = 0, done = 0
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (next < toCheck.length) {
      const k = next++
      results[k] = await probe(toCheck[k])
      done++
      if (done % 50 === 0) console.log(`  ... ${done}/${toCheck.length}`)
    }
  }))

  const tally = new Map()
  let linkBad = 0
  results.forEach((r, i) => {
    const path = toCheck[i]
    const key = r.status === 0 ? r.err : r.streamedError ? `${r.status} + streamed error` : String(r.status)
    tally.set(key, (tally.get(key) ?? 0) + 1)
    const ok = r.status >= 200 && r.status < 400 && !r.streamedError
    if (ok) return
    linkBad++
    const from = [...linkedFrom.get(path)].slice(0, 3).join(', ')
    console.log(`  ${path.padEnd(60)} ${key}${r.final && r.final !== path ? `  -> ${r.final}` : ''}  linked from ${from}`)
  })
  console.log(`\nlink results: ${[...tally].sort().map(([k, n]) => `${k} ×${n}`).join(', ')}`)
  bad += linkBad
}

await cleanup()
if (ephemeral) console.log(`\nephemeral admin ${ephemeral.email} deleted`)
console.log(`\n${bad ? `${bad} route(s)/link(s) with problems` : 'no problems found'}`)
process.exit(bad ? 1 : 0)
