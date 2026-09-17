/**
 * Null out image_url where check-image-urls found the photo dead.
 *
 * A dead URL renders as a browser broken-image icon: politician photos are
 * server-rendered <Image unoptimized> with no onError fallback. With the
 * column null, the same components draw the party mark instead. Missing beats
 * broken, the same way missing beats invented.
 *
 * Only rows in the `dead` bucket are touched — not 2xx, not an image, host
 * gone, certificate a browser would reject, embedding forbidden. The
 * `cert-chain` bucket (loads in Chrome/Safari) and `unreachable` (timeouts,
 * 429s: unknown) are left alone. Each update is conditioned on the URL still
 * being the one that was checked, so a photo replaced since the sweep is
 * never cleared by mistake.
 *
 * Dry-run by default. --apply writes, after backing the affected rows up next
 * to the input file. Restoring is one UPDATE per row from that backup.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/check-image-urls.mjs --out=dead-images.json
 *   node scripts/clear-dead-image-urls.mjs --in=dead-images.json [--apply]
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'node:fs'
import { arg, has } from './lib/cli.mjs'

const IN = arg('in', './dead-images.json')
const APPLY = has('apply')
const CONCURRENCY = 8

const all = JSON.parse(readFileSync(IN, 'utf8'))
const dead = all.filter((r) => r.bucket === 'dead')
const skipped = all.length - dead.length

const byTable = new Map()
const byWhy = new Map()
for (const r of dead) {
  byTable.set(r.table, (byTable.get(r.table) ?? 0) + 1)
  const w = r.why.replace(/\(.*\)/, '').trim()
  byWhy.set(w, (byWhy.get(w) ?? 0) + 1)
}
console.log(`${APPLY ? '*** APPLYING ***' : '--- DRY RUN (pass --apply to write) ---'}\n`)
console.log(`${dead.length} row(s) with a dead photo URL${skipped ? ` (${skipped} cert-chain/unreachable rows in the file left alone)` : ''}:`)
for (const [t, n] of byTable) console.log(`  ${t.padEnd(12)} ${n}`)
console.log('by cause:')
for (const [w, n] of [...byWhy].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(5)}  ${w}`)

if (!APPLY) {
  console.log('\nNothing written.')
  process.exit(0)
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// "-backup-" so .gitignore's *-backup-*.json rule keeps it out of the repo.
const backup = IN.replace(/\.json$/, '') + `-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`
writeFileSync(backup, JSON.stringify(dead.map(({ table, id, name, image_url }) => ({ table, id, name, image_url })), null, 1))
console.log(`\nbackup of ${dead.length} row(s): ${backup}`)

let cleared = 0, unchanged = 0, failed = 0
let next = 0
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (next < dead.length) {
    const r = dead[next++]
    const { data, error } = await sb.from(r.table).update({ image_url: null }).eq('id', r.id).eq('image_url', r.image_url).select('id')
    if (error) { failed++; console.log(`  FAILED ${r.table} ${r.id}: ${error.message}`); continue }
    if (data.length === 0) unchanged++ // URL changed since the sweep — left as is
    else cleared++
  }
}))
console.log(`\ncleared ${cleared}, left ${unchanged} whose URL had changed since the sweep, ${failed} failed`)
process.exit(failed ? 1 : 0)
