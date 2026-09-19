/**
 * Move stored image URLs from one origin to another, keeping the path.
 *
 * Used when the R2 bucket gained the custom domain cdn.getpoli.app: 5,430
 * photos were stored against the pub-….r2.dev development hostname, which
 * Cloudflare rate-limits and does not intend for production traffic. The
 * object keys are identical, so this is a hostname swap, not a re-upload.
 *
 * Refuses unless a sample of the rows it would change actually serves an
 * image at the new origin — a rewrite to a domain that is not wired up would
 * break every photo on the site at once, and that failure is invisible until
 * someone loads a page.
 *
 * Dry-run by default; --apply writes, after backing up every row it changes.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/rewrite-image-origin.mjs --from=https://old.example --to=https://new.example
 *   node scripts/rewrite-image-origin.mjs --from=… --to=… --apply
 */
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'node:fs'
import { arg, has } from './lib/cli.mjs'

const FROM = (arg('from', '') || '').replace(/\/$/, '')
const TO = (arg('to', '') || '').replace(/\/$/, '')
const APPLY = has('apply')
const TABLES = arg('table', 'politicians,candidates').split(',')
const SAMPLE_SIZE = 5

if (!FROM || !TO) {
  console.error('--from and --to are both required, each a scheme and host (and any key prefix).')
  process.exit(1)
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const rows = []
for (const table of TABLES) {
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from(table).select('id, name, image_url').like('image_url', `${FROM}%`).range(from, from + 999)
    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...data.map((r) => ({ table, ...r })))
    if (data.length < 1000) break
  }
}

console.log(`${APPLY ? '*** APPLYING ***' : '--- DRY RUN (pass --apply to write) ---'}\n`)
console.log(`${FROM}\n  -> ${TO}\n`)
for (const t of TABLES) console.log(`  ${t.padEnd(14)} ${rows.filter((r) => r.table === t).length} row(s) to rewrite`)
if (!rows.length) { console.log('\nNothing matches; nothing to do.'); process.exit(0) }

// Prove the new origin serves before touching anything.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
const step = Math.max(1, Math.floor(rows.length / SAMPLE_SIZE))
const sample = Array.from({ length: Math.min(SAMPLE_SIZE, rows.length) }, (_, i) => rows[i * step])
console.log(`\nchecking ${sample.length} sample(s) at the new origin:`)
let bad = 0
for (const r of sample) {
  const url = TO + r.image_url.slice(FROM.length)
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'image/*' } }).catch((e) => ({ status: 0, statusText: e.message, headers: new Map() }))
  const ct = res.headers?.get?.('content-type') ?? ''
  const ok = res.status === 200 && /^image\//.test(ct)
  if (!ok) bad++
  console.log(`  ${ok ? 'ok ' : 'BAD'} HTTP ${res.status} ${ct}  ${url.slice(0, 96)}`)
}
if (bad) {
  console.error(`\n${bad} of ${sample.length} sample(s) do not serve an image at the new origin. Refusing — a rewrite now would break every photo.`)
  process.exit(1)
}

if (!APPLY) {
  console.log('\nNothing written. Re-run with --apply.')
  process.exit(0)
}

const backup = `image-origin-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`
writeFileSync(backup, JSON.stringify(rows, null, 1))
console.log(`\nbacked up ${rows.length} row(s) to ${backup}`)

let done = 0, failed = 0
const queue = [...rows]
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const r = queue.shift()
    const next = TO + r.image_url.slice(FROM.length)
    const { error } = await sb.from(r.table).update({ image_url: next }).eq('id', r.id).eq('image_url', r.image_url)
    if (error) { failed++; console.log(`  FAILED ${r.table} ${r.id}: ${error.message}`) }
    else if (++done % 500 === 0) console.log(`  ... ${done}/${rows.length}`)
  }
}))
console.log(`\nrewrote ${done}, ${failed} failed`)
process.exit(failed ? 1 : 0)
