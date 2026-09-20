#!/usr/bin/env node
/**
 * pnpm verify:skeletons — does each loading.tsx occupy the same space as the
 * page it stands in for?
 *
 * A skeleton exists to hold the layout still. If it is the wrong size, the
 * content jumps when it lands and the user pays for the wait twice: once
 * waiting, once re-reading a page that moved. Nothing else catches this —
 * TypeScript, the build and any snapshot test all see two individually valid
 * files.
 *
 * Method: navigate by CLICK (a direct goto never renders loading.tsx at all),
 * with speculative prefetch blocked so the hop is genuinely cold and the
 * skeleton actually mounts. Measure the top-level blocks of the skeleton, then
 * the top-level blocks of the real page, and compare y and height block by
 * block. Both are anchored to the shared max-w-[1200px] wrapper so the two
 * lists start at the same depth.
 *
 * Deliberately NOT measured:
 *
 *  - Total page height. Every skeleton here paints about a viewport and a half
 *    of list rows rather than all fifty, so the real page is always taller and
 *    the difference says nothing.
 *  - The height of the final block, for the same reason. Its POSITION is still
 *    checked, because that is what decides whether the list starts where the
 *    user was already looking.
 *  - Anything the real page has past the end of the skeleton's blocks, such as
 *    pagination below a truncated list.
 *  - Anything NESTED inside a block. Only top-level blocks are compared, so a
 *    route whose whole page is one container — /politicians/[slug] is two
 *    blocks in total — gets thinner coverage than one with six. A misplacement
 *    inside a block that leaves the block's own height alone will pass.
 *
 * An earlier version of this script compared the two screenshots pixel row by
 * pixel row instead. It does not work: a skeleton block is solid ink for its
 * full height while the text it stands for has ink only where the glyphs are,
 * so the comparison desynchronises inside the first heading. It scored a
 * directory skeleton that matches the real page within 2px on every block as
 * 46%. Geometry is the thing being checked, so measure geometry.
 */
import { launch } from './lib/browser.mjs'

const BASE = process.env.BASE_URL ?? 'http://localhost:3001'
const TOL = 8 // px a block's top may move before it counts as a jump

/**
 * Routes whose content genuinely cannot be pinned to the pixel, with the
 * reason. Keep this list short and never add to it to silence a fixable
 * mismatch — a skeleton that is the wrong size is the defect this gate exists
 * to find.
 */
const ROUTE_TOL = {
  // The news panel renders live Google News headlines. How many of the ten
  // wrap to a second line depends on the words in them that minute, and each
  // wrap is 18.2px. The residual sits ~1400px down the page, far below the
  // fold, and cannot be resolved from a static placeholder.
  '/feed': 36,
}
const SKEL = '[role="status"][aria-busy="true"]'
const WIDTHS = [390, 768]

// destination, and a page that can reach it. The link is clicked when one
// exists; otherwise one is injected, which still exercises the client router.
const ROUTES = [
  ['/directory', '/'],
  ['/elections', '/'],
  ['/feed', '/'],
  ['/community', '/'],
  ['/bills', '/'],
  ['/compare', '/'],
  ['/politicians/lisa-murkowski', '/directory'],
]

const PROBE = (rootSel) => {
  const root = document.querySelector(rootSel)
  if (!root) return null
  // Anchor on the shared page wrapper so the skeleton and the real page are
  // compared at the same depth. No tag in the selector: /community wraps in
  // <main> while the others use <div>, and a tag-qualified selector silently
  // missed it, fell back to the skeleton root, and compared the sr-only label
  // against the real <h1> — which reads as a 25px jump that is not there.
  const c0 = root.querySelector('[class*="max-w-[1200px]"]')
  if (!c0) return { error: 'no max-w-[1200px] wrapper under ' + rootSel }
  let c = c0
  while (c.children.length === 1) c = c.children[0]
  return [...c.children].map((el) => {
    const r = el.getBoundingClientRect()
    return {
      y: Math.round(r.top + window.scrollY),
      h: Math.round(r.height),
      txt: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28),
    }
  })
}

const browser = await launch()
const results = []

for (const W of WIDTHS) {
  for (const [to, from] of ROUTES) {
    const page = await browser.newPage()
    await page.setViewport({ width: W, height: 844, deviceScaleFactor: 1, isMobile: W < 700, hasTouch: W < 700 })
    await page.setRequestInterception(true)
    page.on('request', (r) => (r.headers()['next-router-prefetch'] === '1' ? r.abort() : r.continue()))
    try {
      // Install the capture on EVERY document, before any page script runs.
      // Two failure modes make this the only place it works: a fast route can
      // mount and drop the fallback inside a polling gap, and a hop that falls
      // back to an injected anchor is a full page load, which destroys an
      // observer installed in the previous document — that read as "resolved
      // without showing a skeleton" for routes whose skeleton was fine.
      const INSTALL = (sel, probeSrc, target) => {
        if (window.__installed) return
        window.__installed = true
        window.__capture = window.__capture ?? null
        const probe = eval('(' + probeSrc + ')')
        const tryCapture = () => {
          try {
            if (window.__capture) return
            if (location.pathname !== target) return
            if (!document.querySelector(sel)) return
            const r = probe(sel)
            if (Array.isArray(r) ? r.length : r) window.__capture = r
          } catch {
            /* a probe that throws must not kill the observer */
          }
        }
        // Observe `document`, not `document.documentElement`: at document-start
        // documentElement can still be null, and observe(null) throws — which
        // killed the whole installer silently and made every route report that
        // it "resolved without showing a skeleton", so the gate passed while
        // measuring nothing at all.
        new MutationObserver(tryCapture).observe(document, { childList: true, subtree: true })
        document.addEventListener('DOMContentLoaded', tryCapture)
        tryCapture()
      }

      // Installed on every document, before any page script. A hop that falls
      // back to an injected anchor is a full page load, which destroys an
      // observer installed in the previous document.
      await page.evaluateOnNewDocument(INSTALL, SKEL, PROBE.toString(), to)

      await page.goto(BASE + from, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await new Promise((r) => setTimeout(r, 1200))
      const cdp = await page.target().createCDPSession()
      await cdp.send('Network.enable')
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false, latency: 600,
        downloadThroughput: (300 * 1024) / 8, uploadThroughput: (300 * 1024) / 8,
      })

      // Belt and braces for the client-navigation case, where no new document
      // is created: if the document-start install did not take, this one does.
      await page.evaluate(INSTALL, SKEL, PROBE.toString(), to)

      await page.evaluate((href) => {
        // Exact href first. Matching on pathname alone picked the homepage
        // party card, which points at /directory?party=democrat — so the gate
        // was comparing an unfiltered skeleton against a filtered page, and
        // reported the extra "Clear all filters" row as a 32px skeleton bug.
        const links = [...document.querySelectorAll('a[href]')]
        const exact = links.find((a) => a.getAttribute('href') === href)
        const found = exact ?? links.find(
          (a) => new URL(a.href, location.origin).href === new URL(href, location.origin).href)
        if (found) return found.click()
        const a = document.createElement('a')
        a.href = href
        document.body.appendChild(a)
        a.click()
      }, to)

      await page.waitForFunction(
        (p, s) => location.pathname === p && !document.querySelector(s),
        { timeout: 60000, polling: 'raf' }, to, SKEL)
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
      await new Promise((r) => setTimeout(r, 1200))
      const skel = await page.evaluate(() => window.__capture)
      const real = await page.evaluate(PROBE, '#main-content')
      // A route that resolved without the fallback ever committing is not a
      // fit failure — there was no wait to cover. Reported separately so it
      // cannot quietly stand in for a passing measurement.
      if (!skel) { results.push({ W, to, noSkeleton: true }); await page.close(); continue }

      // A probe that found nothing must not pass by having no blocks to compare.
      if (skel?.error || real?.error) throw new Error(skel?.error ?? real.error)
      if (!skel?.length || !real?.length)
        throw new Error(`probe found ${skel?.length ?? 0} skeleton / ${real?.length ?? 0} real blocks`)
      const pairs = Math.min(skel.length, real.length)
      const jumps = []
      for (let i = 0; i < pairs; i++) {
        const tol = ROUTE_TOL[to] ?? TOL
        const dy = real[i].y - skel[i].y
        const dh = real[i].h - skel[i].h
        const lastBlock = i === pairs - 1
        if (Math.abs(dy) > tol) jumps.push({ i, dy, what: real[i].txt || '(block ' + i + ')' })
        else if (!lastBlock && Math.abs(dh) > tol)
          jumps.push({ i, dh, what: real[i].txt || '(block ' + i + ')' })
        // The final block is the truncated one — every skeleton here paints a
        // viewport and a half of list rows rather than all fifty — so it is
        // expected to be SHORTER than the real content and its height is not
        // checked in that direction. A final block that is TALLER than what
        // replaces it is a different thing entirely: the page collapses
        // upwards on swap, which is the failure a skeleton is supposed to
        // prevent. That direction is still checked.
        else if (lastBlock && dh < -tol)
          jumps.push({ i, dh, what: real[i].txt || '(block ' + i + ')' })
      }
      results.push({ W, to, blocks: pairs, skelBlocks: skel.length, realBlocks: real.length, jumps })
    } catch (e) {
      results.push({ W, to, err: e.message.split('\n')[0].slice(0, 58) })
    }
    await page.close()
  }
}
await browser.close()

console.log('\n  Skeleton fit — every top-level block, skeleton vs real\n')
let bad = 0
for (const r of results) {
  if (r.noSkeleton) {
    console.log(`  ${String(r.W).padStart(4)}  ${r.to.padEnd(28)} -       resolved without showing a skeleton`)
    continue
  }
  if (r.err) { console.log(`  ${String(r.W).padStart(4)}  ${r.to.padEnd(28)} ERROR  ${r.err}`); bad++; continue }
  if (!r.jumps.length) {
    console.log(`  ${String(r.W).padStart(4)}  ${r.to.padEnd(28)} ok      ${r.blocks} blocks aligned`)
    continue
  }
  bad++
  console.log(`  ${String(r.W).padStart(4)}  ${r.to.padEnd(28)} ${r.jumps.length} jump(s)`)
  for (const j of r.jumps) {
    const d = j.dy !== undefined
      ? `moves ${j.dy > 0 ? '+' : ''}${j.dy}px`
      : j.dh > 0
        ? `real is ${j.dh}px taller`
        : `skeleton is ${-j.dh}px TALLER than the real content`
    console.log(`          block ${j.i}  ${d.padEnd(20)} ${j.what}`)
  }
}
const verified = results.filter((r) => !r.err && !r.noSkeleton).length
const unverified = results.filter((r) => r.noSkeleton).length
console.log('')
console.log(`  ${verified} of ${results.length} pairs measured` +
  (unverified ? `, ${unverified} never showed a skeleton to measure` : ''))
if (bad) { console.log(`  ${bad} shift on swap`); process.exit(1) }
// A run that measured nothing is a broken gate, not a passing one. Every route
// here has a loading.tsx and a cold, throttled hop, so a whole sweep with no
// skeleton anywhere means the capture broke — which is exactly what happened
// when the observer was attached to a null documentElement and this printed
// "All 14 route/width pairs hold their layout".
if (!verified) {
  console.log('  NOTHING was measured — the capture is broken, not the skeletons.')
  process.exit(1)
}
console.log(`  No skeleton shifts its page on swap.`)
