/**
 * Execute every Supabase .select() in the codebase and report the ones that error.
 *
 * Motivation: /politicians/[slug] asked campaign_finance for `source_url`, a
 * column that does not exist. PostgREST rejects the whole request, so the
 * query returned zero rows rather than throwing anywhere visible, and the
 * Finance tab quietly hid itself on every profile. 1,893 rows of real FEC data
 * were invisible for as long as that typo survived.
 *
 * Nothing catches that: TypeScript does not know the schema, the row type was
 * `[key: string]: any`, and an empty result is indistinguishable from "this
 * politician has no finance data". So check it directly -- run each select
 * against the real database and see which ones PostgREST refuses.
 *
 * Static extraction, so it is deliberately conservative: it only picks up
 * .from('table').select('literal string') pairs. Selects built from variables
 * or template literals with interpolation are listed as skipped rather than
 * guessed at.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/verify-supabase-selects.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const ROOTS = ['app', 'lib', 'components']

async function walk(dir) {
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(p)))
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p)
  }
  return out
}

// .from('x') ... .select('...') where the select literal is a plain string.
const PAIR = /\.from\(\s*['"]([a-z_]+)['"]\s*\)([\s\S]{0,400}?)\.select\(\s*(['"`])([\s\S]*?)\3/g

const found = []
const skipped = []
for (const root of ROOTS) {
  for (const file of await walk(root)) {
    const src = await readFile(file, 'utf8')
    for (const m of src.matchAll(PAIR)) {
      const [, table, , quote, cols] = m
      const line = src.slice(0, m.index).split('\n').length
      if (quote === '`' && cols.includes('${')) { skipped.push({ file, line, table, why: 'interpolated' }); continue }
      if (cols.includes('${')) { skipped.push({ file, line, table, why: 'interpolated' }); continue }
      found.push({ file, line, table, cols: cols.replace(/\s+/g, ' ').trim() })
    }
  }
}

console.log(`\nextracted ${found.length} literal selects (${skipped.length} skipped as dynamic)\n`)

const seen = new Set()
const failures = []
let okCount = 0
for (const f of found) {
  const sig = `${f.table}|${f.cols}`
  if (seen.has(sig)) continue
  seen.add(sig)
  const { error } = await sb.from(f.table).select(f.cols).limit(1)
  if (error) failures.push({ ...f, message: error.message })
  else okCount++
}

console.log(`distinct select shapes checked: ${seen.size}`)
console.log(`  ok      ${okCount}`)
console.log(`  FAILING ${failures.length}\n`)

for (const f of failures) {
  console.log(`FAIL  ${f.file}:${f.line}  [${f.table}]`)
  console.log(`      ${f.message}`)
  console.log(`      select: ${f.cols.slice(0, 140)}${f.cols.length > 140 ? '…' : ''}\n`)
}

if (skipped.length) {
  console.log('skipped (select built dynamically — check by hand):')
  for (const s of skipped.slice(0, 15)) console.log(`  ${s.file}:${s.line} [${s.table}]`)
  if (skipped.length > 15) console.log(`  ... and ${skipped.length - 15} more`)
}

process.exit(failures.length ? 1 : 0)
