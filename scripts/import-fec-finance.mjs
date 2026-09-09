/**
 * Import real 2026-cycle campaign finance from the FEC API.
 *
 * Source of truth: https://api.open.fec.gov/v1/candidates/totals/
 * Nothing here is invented — every figure comes from the FEC response, and rows
 * are stamped with source + last_updated so the vintage is auditable.
 *
 * Get a free key (instant, 1000 req/hr) at https://api.data.gov/signup/
 * DEMO_KEY works but is capped at 10 req/hr, so responses are cached to disk.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/import-fec-finance.mjs --office=S            # dry run
 *   node scripts/import-fec-finance.mjs --office=S --apply
 *   node scripts/import-fec-finance.mjs --office=S,H,P --apply
 */
import { createClient } from '@supabase/supabase-js'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const APPLY = process.argv.includes('--apply')
const officeArg = (process.argv.find((a) => a.startsWith('--office=')) || '--office=S').split('=')[1]
const OFFICES = officeArg.split(',').map((s) => s.trim().toUpperCase())
const MAX_PAGES = Number((process.argv.find((a) => a.startsWith('--max-pages=')) || '--max-pages=100').split('=')[1])

const KEY = process.env.FEC_API_KEY || 'DEMO_KEY'
const CYCLE = (process.argv.find((a) => a.startsWith('--cycle=')) || '--cycle=2026').split('=')[1]
const CACHE = '.fec-cache'
const OFFICE_CHAMBER = { S: 'senate', H: 'house', P: 'presidential' }

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const norm = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\b(jr|sr|ii|iii|iv|dr|mr|mrs|ms|rep|sen|gov)\b\.?/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// FEC formats names "LAST, FIRST MIDDLE" — pull the surname off the front.
const fecLast = (s) => norm((s || '').split(',')[0])
const fecFirst = (s) => {
  const parts = (s || '').split(',')
  return parts.length > 1 ? norm(parts[1]).split(' ').filter(Boolean) : []
}
const ourLast = (s) => norm(s).split(' ').filter(Boolean).pop() || ''
const ourFirst = (s) => norm(s).split(' ').filter(Boolean)[0] || ''

async function fecPage(office, page) {
  if (!existsSync(CACHE)) await mkdir(CACHE, { recursive: true })
  const f = `${CACHE}/totals-${CYCLE}-${office}-p${page}.json`
  if (existsSync(f)) return JSON.parse(await readFile(f, 'utf8'))

  const url =
    `https://api.open.fec.gov/v1/candidates/totals/?api_key=${KEY}` +
    `&election_year=${CYCLE}&office=${office}&per_page=100&page=${page}&sort=-receipts`
  const resp = await fetch(url)
  if (!resp.ok) {
    const body = await resp.text()
    throw new Error(`FEC HTTP ${resp.status} (office=${office} page=${page}): ${body.slice(0, 200)}`)
  }
  const json = await resp.json()
  await writeFile(f, JSON.stringify(json))
  const rem = resp.headers.get('x-ratelimit-remaining')
  console.log(`   fetched ${office} page ${page} (rate-limit remaining: ${rem ?? 'n/a'})`)
  return json
}

async function page(table, cols) {
  const PAGE = 1000
  let from = 0
  const out = []
  for (;;) {
    const { data, error } = await sb.from(table).select(cols).range(from, from + PAGE - 1)
    if (error) throw new Error(`${table}: ${error.message}`)
    out.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }
  return out
}

console.log(`\n${APPLY ? '*** APPLYING ***' : '--- DRY RUN (pass --apply to write) ---'}`)
console.log(`FEC key: ${KEY === 'DEMO_KEY' ? 'DEMO_KEY (10 req/hr — get a free key at api.data.gov/signup)' : 'custom key'}`)

const pols = await page('politicians', 'id,name,state,chamber,district,party')
const existing = await page('campaign_finance', 'id,politician_id,cycle')
const existingCycle = new Map(existing.filter((f) => f.cycle === CYCLE).map((f) => [f.politician_id, f.id]))

const idx = new Map()
for (const p of pols) {
  if (!p.state) continue
  const k = `${ourLast(p.name)}|${p.state}|${p.chamber}`
  if (!idx.has(k)) idx.set(k, [])
  idx.get(k).push(p)
}

let fetched = 0
const matched = []
const unmatched = []
const ambiguous = []

for (const office of OFFICES) {
  const chamber = OFFICE_CHAMBER[office]
  if (!chamber) { console.log(`skipping unknown office ${office}`); continue }
  console.log(`\n=== office ${office} -> chamber ${chamber} ===`)

  let pageNo = 1
  for (;;) {
    let json
    try {
      json = await fecPage(office, pageNo)
    } catch (e) {
      console.log(`   ! ${e.message}`)
      console.log(`   (stopping this office; cached pages so far are still usable)`)
      break
    }
    const results = json.results || []
    fetched += results.length
    if (pageNo === 1) console.log(`   FEC reports ${json.pagination?.count} candidates for ${CYCLE} office=${office}`)

    for (const r of results) {
      const last = fecLast(r.name)
      const st = r.state
      let hits = idx.get(`${last}|${st}|${chamber}`) || []

      // For House, disambiguate same-surname pairs by district.
      if (hits.length > 1 && office === 'H' && r.district_number != null) {
        const d = String(r.district_number)
        const byDist = hits.filter((p) => String(p.district).replace(/^0+/, '') === d.replace(/^0+/, ''))
        if (byDist.length) hits = byDist
      }
      // Otherwise try to disambiguate on first name.
      if (hits.length > 1) {
        const fn = fecFirst(r.name)
        const byFirst = hits.filter((p) => fn.includes(ourFirst(p.name)))
        if (byFirst.length) hits = byFirst
      }

      if (hits.length === 1) {
        matched.push({ pol: hits[0], fec: r })
      } else if (hits.length > 1) {
        ambiguous.push({ name: r.name, state: st, n: hits.length })
      } else {
        unmatched.push({ name: r.name, state: st, office, receipts: r.receipts })
      }
    }

    const pages = json.pagination?.pages ?? 1
    if (pageNo >= Math.min(pages, MAX_PAGES)) break
    pageNo++
  }
}

console.log(`\n--- matching ---`)
console.log(`FEC rows seen:        ${fetched}`)
console.log(`matched to a politician: ${matched.length}`)
console.log(`ambiguous (skipped):     ${ambiguous.length}`)
console.log(`no local politician:     ${unmatched.length}  (challengers we don't track — expected)`)

// Dedupe: keep the highest-receipts FEC record per politician.
const best = new Map()
for (const m of matched) {
  const prev = best.get(m.pol.id)
  if (!prev || (m.fec.receipts || 0) > (prev.fec.receipts || 0)) best.set(m.pol.id, m)
}
console.log(`unique politicians:      ${best.size}`)

const num = (v) => {
  if (v == null || v === '') return null
  const n = typeof v === 'number' ? v : parseFloat(v)
  return Number.isFinite(n) ? n : null
}

const rows = [...best.values()].map(({ pol, fec }) => ({
  politician_id: pol.id,
  cycle: CYCLE,
  total_raised: num(fec.receipts),
  total_spent: num(fec.disbursements),
  cash_on_hand: num(fec.cash_on_hand_end_period),
  // Record the FEC reporting period so the vintage of each figure is auditable.
  source: `FEC API (candidates/totals, cycle ${CYCLE}${fec.coverage_end_date ? `, through ${fec.coverage_end_date}` : ''})`,
  last_updated: new Date().toISOString(),
  _name: pol.name,
}))

console.log(`\ntop 12 by receipts:`)
for (const r of [...rows].sort((a, b) => (b.total_raised || 0) - (a.total_raised || 0)).slice(0, 12)) {
  const m = (n) => (n == null ? 'n/a' : '$' + (n / 1e6).toFixed(2) + 'M')
  console.log(`   ${r._name.padEnd(26)} raised ${m(r.total_raised).padEnd(10)} spent ${m(r.total_spent).padEnd(10)} coh ${m(r.cash_on_hand)}`)
}
console.log(`\nwould insert ${rows.filter((r) => !existingCycle.has(r.politician_id)).length}, update ${rows.filter((r) => existingCycle.has(r.politician_id)).length}`)

if (APPLY) {
  let ins = 0, upd = 0, err = 0
  for (const r of rows) {
    const { _name, ...row } = r
    const id = existingCycle.get(row.politician_id)
    const { error } = id
      ? await sb.from('campaign_finance').update(row).eq('id', id)
      : await sb.from('campaign_finance').insert(row)
    if (error) { err++; if (err <= 5) console.log(`   ! ${_name}: ${error.message}`) }
    else if (id) upd++
    else ins++
  }
  console.log(`\n=> inserted ${ins}, updated ${upd}, errors ${err}`)
} else {
  console.log(`\nDry run — no writes.`)
}
