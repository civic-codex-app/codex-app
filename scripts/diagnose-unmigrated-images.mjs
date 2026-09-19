/**
 * Which photos did the R2 migration leave behind, and why?
 *
 * migrate-images-to-r2 reports a skip count, not which rows. A skip is any of:
 * a non-2xx response, a body that is not an image, a file outside the size
 * bounds, or a thrown request — a TLS chain Node will not complete being the
 * common one. The row keeps its original URL, so nothing is lost, but the
 * photo stays on a host that may drop it.
 *
 * This diffs a run's backup against the current rows to find what did not
 * move, then re-probes each one and groups the reasons by host, so the
 * follow-up is a decision per host rather than per photo.
 *
 * It decodes what it downloads, because the migration skips at two different
 * points and reports one number for both. An earlier version of this checked
 * only the download and so called three files "fine" that the migration could
 * not convert: legis.ga.gov serves some portraits as octet-stream bodies of
 * 1,938 bytes and exactly 1,048,576 bytes — truncated, not images. Saying the
 * host is flaky when the file is broken sends the next person to the wrong
 * place.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/diagnose-unmigrated-images.mjs [--backup=image-urls-backup-….json]
 */
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { readFileSync, readdirSync } from 'node:fs'
import { arg } from './lib/cli.mjs'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const backupFile = arg('backup', readdirSync('.').filter((f) => /^image-urls-backup-.*\.json$/.test(f)).sort().pop())
if (!backupFile) { console.error('no image-urls-backup-*.json found; pass --backup='); process.exit(1) }
const backup = JSON.parse(readFileSync(backupFile, 'utf8'))
console.log(`${backupFile}: ${backup.length} row(s) were external when the run started\n`)

const byTable = new Map()
for (const r of backup) { if (!byTable.has(r.table)) byTable.set(r.table, []); byTable.get(r.table).push(r) }

const stuck = []
for (const [table, rows] of byTable) {
  for (let i = 0; i < rows.length; i += 200) {
    const slice = rows.slice(i, i + 200)
    const { data, error } = await sb.from(table).select('id, name, image_url').in('id', slice.map((r) => r.id))
    if (error) throw new Error(`${table}: ${error.message}`)
    for (const row of data ?? []) {
      const before = slice.find((b) => b.id === row.id)
      if (before && row.image_url === before.image_url) stuck.push({ table, ...row })
    }
  }
}
console.log(`${backup.length - stuck.length} moved to R2; ${stuck.length} did not\n`)
if (!stuck.length) process.exit(0)

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
const HEADERS = {
  'user-agent': UA,
  accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  referer: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://getpoli.app/',
  'sec-fetch-dest': 'image', 'sec-fetch-mode': 'no-cors', 'sec-fetch-site': 'cross-site',
}
const hostOf = (u) => { try { return new URL(u).host } catch { return '(invalid)' } }

async function why(url) {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), 20000)
  try {
    const r = await fetch(url, { redirect: 'follow', signal: ctl.signal, headers: HEADERS })
    const ct = (r.headers.get('content-type') ?? '').split(';')[0].trim()
    const buf = Buffer.from(await r.arrayBuffer())
    if (!r.ok) return `HTTP ${r.status}`
    if (/svg|html|text\/plain/.test(ct)) return `not a raster image (${ct})`
    if (buf.length < 100) return `body too small (${buf.length}B)`
    if (buf.length > 25 * 1024 * 1024) return `body too large (${(buf.length / 1048576).toFixed(1)}MB)`
    // The migration converts before it uploads, so a body that decodes to
    // nothing is a skip even though the download succeeded.
    try {
      const meta = await sharp(buf).metadata()
      if (!meta.width || !meta.height) throw new Error('no dimensions')
      return `downloads and decodes fine now (${meta.format} ${meta.width}x${meta.height}) — transient at run time`
    } catch (e) {
      return `body is not a decodable image (${ct}, ${buf.length}B: ${String(e.message).slice(0, 40)})`
    }
  } catch (e) {
    const code = e.name === 'AbortError' ? 'timeout' : (e.cause?.code ?? e.code ?? e.message)
    if (code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') return 'incomplete certificate chain (browsers complete it, Node will not)'
    return String(code).slice(0, 60)
  } finally { clearTimeout(t) }
}

const groups = new Map()
let done = 0
const queue = [...stuck]
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const row = queue.shift()
    const reason = await why(row.image_url)
    const host = hostOf(row.image_url)
    if (!groups.has(host)) groups.set(host, new Map())
    const g = groups.get(host)
    g.set(reason, (g.get(reason) ?? 0) + 1)
    if (++done % 100 === 0) console.log(`  ... ${done}/${stuck.length}`)
  }
}))

console.log('\n' + 'host'.padEnd(40) + 'left  why')
let chainHosts = []
for (const [host, reasons] of [...groups].sort((a, b) => [...b[1].values()].reduce((x, y) => x + y, 0) - [...a[1].values()].reduce((x, y) => x + y, 0))) {
  const total = [...reasons.values()].reduce((a, b) => a + b, 0)
  console.log(`${host.padEnd(39)} ${String(total).padStart(4)}  ${[...reasons].map(([r, n]) => `${r} ×${n}`).join('; ')}`)
  if ([...reasons.keys()].some((r) => r.startsWith('incomplete certificate chain'))) chainHosts.push(host)
}
if (chainHosts.length) {
  console.log(`\n${chainHosts.length} host(s) only fail Node's certificate check. Re-run for those with:`)
  console.log(`  node scripts/migrate-images-to-r2.mjs --only-host=${chainHosts.join(',')} --accept-incomplete-chain --apply`)
}
