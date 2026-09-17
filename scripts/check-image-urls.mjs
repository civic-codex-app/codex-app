/**
 * Does every stored image_url still show a picture in a browser?
 *
 * Politician and candidate photos render server-side with no fallback, so a
 * URL that has died — or that its host now refuses to serve cross-origin —
 * shows the voter a broken-image icon. Most photos live on our own R2 bucket;
 * the rest point at state-legislature sites, which move files and add
 * hotlink protection without notice.
 *
 * Each URL ends up in one bucket:
 *
 *   dead        Chrome will draw the broken icon. Not 2xx after redirects
 *               (404/403/400), a body that is not an image (Opaque Response
 *               Blocking drops a cross-origin <img> whose body is text/html —
 *               what a "page not found" served as 200 looks like), a
 *               Cross-Origin-Resource-Policy header forbidding embedding, a
 *               host that no longer resolves, or a certificate a browser would
 *               reject (expired, wrong name).
 *   cert-chain  The server omits its intermediate certificate. Node refuses
 *               it; Chrome and Safari fetch the missing link themselves and
 *               show the image, Firefox may not. Confirmed with verification
 *               off. Reported, not counted dead.
 *   unreachable Timed out or rate-limited (429) even after a retry at low
 *               concurrency. Unknown, not dead — re-run before acting.
 *
 * The first run of this reported 584 R2 photos dead: they were 429s from
 * probing our own bucket 12-wide, and 240 more were cert-chain hosts. Per-host
 * concurrency is capped at 2 and 429s retry, so the number that comes out is
 * one you can act on.
 *
 * Report-only. Writes the affected rows to --out for clear-dead-image-urls.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/check-image-urls.mjs [--out=dead-images.json] [--concurrency=12] [--table=politicians]
 */
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'node:fs'
import { arg } from './lib/cli.mjs'

const OUT = arg('out', './dead-images.json')
const CONCURRENCY = Number(arg('concurrency', '12'))
const PER_HOST = 2
const TABLES = arg('table', 'politicians,candidates').split(',')

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const rows = []
for (const table of TABLES) {
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from(table).select('id,name,image_url').not('image_url', 'is', null).range(from, from + 999)
    if (error) throw new Error(`${table}: ${error.message}`)
    for (const r of data) rows.push({ table, ...r })
    if (data.length < 1000) break
  }
}
const urls = [...new Set(rows.map((r) => r.image_url))]
const count = (t) => rows.filter((r) => r.table === t).length
console.log(`${rows.length} rows with image_url (${TABLES.map((t) => `${count(t)} ${t}`).join(', ')}); ${urls.length} distinct URLs\n`)

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
const hostOf = (u) => { try { return new URL(u).host } catch { return '(invalid URL)' } }

async function attempt(url) {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), 20000)
  try {
    // GET, not HEAD: hosts answer HEAD differently or not at all, and the
    // Cross-Origin-Resource-Policy header only reliably appears on GET.
    const r = await fetch(url, { redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': UA, accept: 'image/avif,image/webp,image/*,*/*;q=0.8' } })
    try { await r.body?.cancel() } catch {}
    return { status: r.status, ct: (r.headers.get('content-type') ?? '').split(';')[0].trim(), corp: r.headers.get('cross-origin-resource-policy') ?? '' }
  } catch (e) {
    return { status: 0, ct: '', corp: '', code: e.name === 'AbortError' ? 'timeout' : (e.cause?.code ?? e.code ?? e.message) }
  } finally { clearTimeout(t) }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const RETRYABLE = (r) => r.status === 429 || r.status >= 500 || r.code === 'timeout' || r.code === 'UND_ERR_CONNECT_TIMEOUT' || r.code === 'ECONNRESET'

function classify(r) {
  if (r.status === 0) {
    if (r.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') return { bucket: 'cert-chain', why: 'intermediate certificate missing' }
    if (/CERT|TLS|SSL|ALTNAME|SELF_SIGNED/i.test(r.code)) return { bucket: 'dead', why: `certificate rejected (${r.code})` }
    if (r.code === 'ENOTFOUND' || r.code === 'EAI_AGAIN') return { bucket: 'dead', why: 'host does not resolve' }
    return { bucket: 'unreachable', why: r.code }
  }
  if (r.status === 429 || r.status >= 500) return { bucket: 'unreachable', why: `HTTP ${r.status}` }
  if (r.status < 200 || r.status >= 300) return { bucket: 'dead', why: `HTTP ${r.status}` }
  if (r.ct && !/^image\//.test(r.ct) && r.ct !== 'application/octet-stream' && r.ct !== 'binary/octet-stream') return { bucket: 'dead', why: `not an image (${r.ct})` }
  if (/same-origin|same-site/i.test(r.corp)) return { bucket: 'dead', why: `Cross-Origin-Resource-Policy: ${r.corp}` }
  return { bucket: 'ok', why: null }
}

// Scheduler: CONCURRENCY workers, at most PER_HOST requests in flight per host.
async function sweep(list, onResult) {
  const inFlight = new Map()
  let next = 0, done = 0
  const pending = [...list]
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (true) {
      const i = pending.findIndex((u) => (inFlight.get(hostOf(u)) ?? 0) < PER_HOST)
      if (i === -1) { if (pending.length === 0) return; await sleep(100); continue }
      const [url] = pending.splice(i, 1)
      const h = hostOf(url)
      inFlight.set(h, (inFlight.get(h) ?? 0) + 1)
      let r = await attempt(url)
      for (let retry = 0; retry < 2 && RETRYABLE(r); retry++) { await sleep(3000 * (retry + 1)); r = await attempt(url) }
      inFlight.set(h, inFlight.get(h) - 1)
      onResult(url, r)
      if (++done % 500 === 0) console.log(`  ... ${done}/${list.length}`)
    }
  }))
}

const results = new Map()
await sweep(urls, (url, r) => results.set(url, { ...r, ...classify(r) }))

// Second look at hosts with an incomplete chain: with verification off, does
// the URL actually serve an image? Sequential and brief; the env toggle is
// process-wide.
const chain = [...results].filter(([, r]) => r.bucket === 'cert-chain').map(([u]) => u)
if (chain.length) {
  console.log(`\nre-checking ${chain.length} URL(s) on hosts with an incomplete certificate chain, verification off`)
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  const saved = CONCURRENCY
  await sweep(chain, (url, r) => {
    const c = classify(r)
    results.set(url, c.bucket === 'ok'
      ? { ...r, bucket: 'cert-chain', why: 'loads in Chrome/Safari; intermediate certificate missing' }
      : { ...r, ...c, why: `${c.why} (and intermediate certificate missing)` })
  })
  delete process.env.NODE_TLS_REJECT_UNAUTHORIZED
  void saved
}

// Report by host.
const byHost = new Map()
for (const [url, r] of results) {
  const h = hostOf(url)
  if (!byHost.has(h)) byHost.set(h, { total: 0, dead: 0, chain: 0, unreachable: 0, why: new Map() })
  const b = byHost.get(h); b.total++
  if (r.bucket === 'dead') b.dead++
  if (r.bucket === 'cert-chain') b.chain++
  if (r.bucket === 'unreachable') b.unreachable++
  if (r.bucket !== 'ok') b.why.set(r.why, (b.why.get(r.why) ?? 0) + 1)
}
console.log('\n' + 'host'.padEnd(46) + ' urls  dead chain unrch  why')
for (const [h, b] of [...byHost].sort((a, c) => c[1].dead - a[1].dead || c[1].total - a[1].total)) {
  if (!b.dead && !b.chain && !b.unreachable) continue
  console.log(`${h.padEnd(45)} ${String(b.total).padStart(5)} ${String(b.dead).padStart(5)} ${String(b.chain).padStart(5)} ${String(b.unreachable).padStart(5)}  ${[...b.why].map(([k, n]) => `${k} ×${n}`).join(', ')}`)
}
console.log(`(${[...byHost.values()].filter((b) => !b.dead && !b.chain && !b.unreachable).length} host(s) with nothing to report not listed)`)

const flagged = rows.filter((r) => results.get(r.image_url)?.bucket !== 'ok').map((r) => { const x = results.get(r.image_url); return { ...r, bucket: x.bucket, why: x.why, status: x.status } })
writeFileSync(OUT, JSON.stringify(flagged, null, 1))
const n = (bucket) => [...results.values()].filter((r) => r.bucket === bucket).length
const nr = (bucket) => flagged.filter((r) => r.bucket === bucket).length
console.log(`\n${urls.length} URLs: ${n('ok')} ok · ${n('dead')} dead (${nr('dead')} rows) · ${n('cert-chain')} cert-chain (${nr('cert-chain')} rows, load in Chrome/Safari) · ${n('unreachable')} unreachable (${nr('unreachable')} rows, unknown)`)
console.log(`rows written to ${OUT}`)
process.exit(n('dead') ? 1 : 0)
