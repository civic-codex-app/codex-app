/**
 * Find horizontal overflow on a set of routes, at real viewport widths.
 *
 * A page whose scrollWidth exceeds its clientWidth scrolls sideways, which on a
 * phone means text and controls sit off-screen with no indication they are
 * there. It is invisible to type-checking, tests and the build, and it is easy
 * to reintroduce: the homepage "Today in Politics" strip did it via a single
 * 279-character tracking URL stored as body text.
 *
 * Reports, per route and width, whether the document overflows and which
 * elements are the widest offenders, so the fix targets a specific node rather
 * than a guess.
 *
 * Drives the system Chrome via puppeteer-core — no browser download. The route
 * list lives in scripts/lib/routes.mjs and is shared with check-pages.
 *
 * Usage:
 *   pnpm dev            # in another terminal
 *   node scripts/check-overflow.mjs
 *   node scripts/check-overflow.mjs --base=http://localhost:3000 --widths=375,768,1440
 *   node scripts/check-overflow.mjs --routes=/elections/il-senate-2026,/
 *   node scripts/check-overflow.mjs --login=you@example.com:password   # measure the gated pages signed in
 *   node scripts/check-overflow.mjs --ephemeral-admin                   # same, with a throwaway admin
 */
import { arg, has } from './lib/cli.mjs'
import { launch, isSessionDeath, signIn } from './lib/browser.mjs'
import { createEphemeralAdmin } from './lib/ephemeral-admin.mjs'
import { ALL_ROUTES } from './lib/routes.mjs'

const BASE = arg('base', 'http://localhost:3000')
const WIDTHS = arg('widths', '375,768,1440').split(',').map(Number)
const ROUTES = arg('routes', ALL_ROUTES.join(',')).split(',')

let LOGIN = arg('login', null)
let ephemeral = null
if (has('ephemeral-admin')) {
  ephemeral = await createEphemeralAdmin()
  LOGIN = `${ephemeral.email}:${ephemeral.password}`
  console.log(`created ephemeral admin ${ephemeral.email}`)
}
const cleanup = async () => { if (ephemeral) await ephemeral.cleanup() }

let browser = await launch()
// One page, reused. Opening and closing a target per measurement killed the
// browser session partway through a 32-route sweep ("Session with given id not
// found"), which looks like a page bug but is just target churn.
let page = await browser.newPage()

// Cookies live on the browser, so a recovery relaunch has to sign in again.
async function authenticate() {
  if (!LOGIN) return
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
await authenticate()

async function recover() {
  try { await browser.close() } catch {}
  browser = await launch()
  page = await browser.newPage()
  await authenticate()
}

let anyOverflow = false
let failures = 0

for (const route of ROUTES) {
  for (const width of WIDTHS) {
    let loaded = false
    for (let attempt = 0; attempt < 2 && !loaded; attempt++) {
      try {
        await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
        await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 120000 })
        loaded = true
      } catch (e) {
        if (attempt === 0 && isSessionDeath(e)) {
          await recover()
          continue
        }
        console.log(`  ${route.padEnd(42)} @${String(width).padEnd(5)} LOAD FAILED: ${e.message.slice(0, 60)}`)
        failures++
      }
    }
    if (!loaded) continue

    const result = await page.evaluate(() => {
      const doc = document.documentElement
      const over = doc.scrollWidth - doc.clientWidth
      const offenders = []
      if (over > 0) {
        // Any element whose right edge lands beyond the viewport is a cause.
        // Report the deepest such nodes; ancestors are usually just containers
        // stretched by a child.
        // An element inside a scroll container is clipped by it and does not
        // widen the page, so reporting it is a false lead — the issue heatmap
        // legitimately renders a grid wider than the phone inside its own
        // overflow-x-auto wrapper.
        const insideScroller = (el) => {
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const ox = getComputedStyle(p).overflowX
            if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return true
          }
          return false
        }
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0) continue
          if (r.right <= doc.clientWidth + 1) continue
          if (insideScroller(el)) continue
          if ([...el.children].some((c) => c.getBoundingClientRect().right > doc.clientWidth + 1)) continue
          offenders.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className || '').toString().slice(0, 70),
            right: Math.round(r.right),
            width: Math.round(r.width),
            text: (el.textContent || '').trim().slice(0, 48),
          })
        }
        offenders.sort((a, b) => b.right - a.right)
      }
      return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, over, offenders: offenders.slice(0, 5) }
    })

    // A route that redirects is measuring a different page than requested —
    // say so, rather than reporting /login as though it were /dashboard.
    const landed = new URL(page.url()).pathname + new URL(page.url()).search
    const want = route.split('#')[0]
    const redirected = landed !== want ? `  (redirected -> ${landed})` : ''

    const tag = result.over > 0 ? `OVERFLOW +${result.over}px` : 'ok'
    console.log(`  ${route.padEnd(42)} @${String(width).padEnd(5)} ${result.clientWidth}px viewport, ${result.scrollWidth}px content  ${tag}${redirected}`)
    if (result.over > 0) {
      anyOverflow = true
      for (const o of result.offenders) {
        console.log(`        <${o.tag}> right=${o.right} w=${o.width}  ${o.cls ? '.' + o.cls.split(/\s+/).slice(0, 3).join('.') : ''}`)
        if (o.text) console.log(`          "${o.text}"`)
      }
    }
  }
}

await browser.close()
await cleanup()
if (ephemeral) console.log(`\nephemeral admin ${ephemeral.email} deleted`)
if (failures) console.log(`\n${failures} route/width combination(s) failed to load`)
console.log(`${anyOverflow ? 'horizontal overflow found' : 'no horizontal overflow at any tested width'}`)
process.exit(anyOverflow || failures ? 1 : 0)
