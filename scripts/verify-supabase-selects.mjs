/**
 * Execute every Supabase query shape in the codebase and report the ones the
 * database would reject.
 *
 * Motivation: PostgREST rejects a request naming a column that does not exist,
 * and supabase-js surfaces that as `{ data: null, error }` rather than
 * throwing. Callers that ignore `error` -- most of them -- see an empty result
 * and render as though the data simply is not there. TypeScript cannot catch
 * it because it does not know the schema. This has produced four real
 * outages in this codebase:
 *
 *   campaign_finance.source_url   Finance tab hidden on every profile
 *   polls.question / .is_active   feed poll card never rendered
 *   poll_options.text/vote_count  same
 *   annotations -> profiles       admin annotations page permanently empty
 *
 * The first version of this script only validated .select() column lists. That
 * left a hole: .order(), the filter methods and insert/update payloads fail
 * exactly the same way. Everything now reduces to "does this column exist on
 * this table", probed with .select(col).limit(0) -- which tests existence
 * without writing anything, so insert and update payloads are checked without
 * attempting a real insert.
 *
 * Static extraction, so it is deliberately conservative. Anything built from a
 * variable or an interpolated template is reported as skipped rather than
 * guessed at.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   pnpm verify:selects
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

const FILTERS = 'eq|neq|gt|gte|lt|lte|like|ilike|is|in|contains|containedBy|overlaps|order'

/**
 * Balanced-brace slice for an object literal passed directly to a call.
 *
 * The "{" must be the first thing inside the parens. Searching forward for any
 * "{" instead walks past `.insert(chunk)` and lands on the function's own
 * `return { ... }`, whose keys then get reported as missing columns.
 */
function objectAt(src, from) {
  const open = src.indexOf('(', from)
  if (open === -1) return null
  const rest = src.slice(open + 1)
  const lead = rest.match(/^\s*/)[0].length
  if (rest[lead] !== '{') return null
  const start = open + 1 + lead
  let depth = 0
  for (let i = start; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(start, i + 1) }
  }
  return null
}

/** Top-level `key:` names of an object literal. Bails on spreads. */
function topLevelKeys(obj) {
  if (/\.\.\./.test(obj)) return null
  const body = obj.slice(1, -1)
  const keys = []
  let depth = 0
  let atTop = true
  let token = ''
  for (let i = 0; i < body.length; i++) {
    const c = body[i]
    if (c === '{' || c === '[' || c === '(') { depth++; continue }
    if (c === '}' || c === ']' || c === ')') { depth--; continue }
    if (depth !== 0) continue
    if (c === ',') { atTop = true; token = ''; continue }
    if (c === ':' && atTop) {
      const m = token.trim().match(/^['"`]?([A-Za-z_][A-Za-z0-9_]*)['"`]?$/)
      if (m) keys.push(m[1])
      atTop = false
      token = ''
      continue
    }
    token += c
  }
  return keys
}

const selects = []   // { file, line, table, cols }
const columns = new Map() // `${table}|${col}` -> { file, line, table, col, via }
const skipped = []

for (const root of ROOTS) {
  for (const file of await walk(root)) {
    const src = await readFile(file, 'utf8')
    for (const m of src.matchAll(/\.from\(\s*['"]([a-z_]+)['"]\s*\)/g)) {
      const table = m[1]
      const line = src.slice(0, m.index).split('\n').length
      // The chain belonging to THIS .from() ends where the next one begins.
      // Slicing a fixed window instead swallows the next query's .select() and
      // attributes it to this table -- which briefly had this script reporting
      // a voting_records column list as a failure on `politicians`.
      const nextFrom = src.indexOf('.from(', m.index + 6)
      const end = nextFrom === -1 ? Math.min(src.length, m.index + 900) : Math.min(nextFrom, m.index + 900)
      const chain = src.slice(m.index, end)

      // .select('literal')
      for (const s of chain.matchAll(/\.select\(\s*(['"`])([\s\S]*?)\1/g)) {
        const cols = s[2]
        if (cols.includes('${')) { skipped.push({ file, line, table, why: 'interpolated select' }); continue }
        selects.push({ file, line, table, cols: cols.replace(/\s+/g, ' ').trim() })
      }

      // .order('col') / .eq('col', …) and friends
      for (const f of chain.matchAll(new RegExp(`\\.(${FILTERS})\\(\\s*(['"\`])([^'"\`]+)\\2`, 'g'))) {
        const col = f[3]
        if (col.includes('${') || col.includes('(')) continue
        // Embedded filters like "issues.slug" target the joined table.
        const bare = col.includes('.') ? col.split('.').pop() : col
        const target = col.includes('.') ? col.split('.').slice(0, -1).pop() : table
        const key = `${target}|${bare}`
        if (!columns.has(key)) columns.set(key, { file, line, table: target, col: bare, via: `.${f[1]}()` })
      }

      // .insert({…}) / .update({…})
      for (const w of chain.matchAll(/\.(insert|update|upsert)\(/g)) {
        const obj = objectAt(chain, w.index)
        if (!obj) continue
        const keys = topLevelKeys(obj)
        if (keys === null) { skipped.push({ file, line, table, why: `spread in .${w[1]}()` }); continue }
        for (const k of keys) {
          const key = `${table}|${k}`
          if (!columns.has(key)) columns.set(key, { file, line, table, col: k, via: `.${w[1]}()` })
        }
      }
    }
  }
}

console.log(`\nextracted ${selects.length} literal selects and ${columns.size} distinct table/column references`)
console.log(`(${skipped.length} skipped as dynamic)\n`)

const failures = []

const seen = new Set()
let selOk = 0
for (const s of selects) {
  const sig = `${s.table}|${s.cols}`
  if (seen.has(sig)) continue
  seen.add(sig)
  const { error } = await sb.from(s.table).select(s.cols).limit(1)
  if (error) failures.push({ ...s, kind: 'select', message: error.message })
  else selOk++
}

let colOk = 0
for (const c of columns.values()) {
  // Selecting the column alone proves existence and writes nothing, so
  // insert/update payloads are validated without attempting an insert.
  const { error } = await sb.from(c.table).select(c.col).limit(0)
  if (error) failures.push({ ...c, kind: 'column', message: error.message, cols: `${c.col}  (via ${c.via})` })
  else colOk++
}

console.log(`select shapes : ${seen.size} checked, ${selOk} ok, ${seen.size - selOk} failing`)
console.log(`column refs   : ${columns.size} checked, ${colOk} ok, ${columns.size - colOk} failing\n`)

for (const f of failures) {
  console.log(`FAIL  ${f.file}:${f.line}  [${f.table}]  ${f.kind}`)
  console.log(`      ${f.message}`)
  console.log(`      ${String(f.cols).slice(0, 140)}\n`)
}

if (skipped.length) {
  console.log(`skipped (dynamic — check by hand): ${skipped.length}`)
  for (const s of skipped.slice(0, 10)) console.log(`  ${s.file}:${s.line} [${s.table}] ${s.why}`)
  if (skipped.length > 10) console.log(`  ... and ${skipped.length - 10} more`)
}

console.log(`\n${failures.length ? `${failures.length} FAILING` : 'all clear'}`)
process.exit(failures.length ? 1 : 0)
