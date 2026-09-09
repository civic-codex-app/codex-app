/**
 * Replace the fabricated bills table with real Congress.gov records, and drop
 * the voting_records that were built on top of it.
 *
 * WHY: an audit against api.congress.gov found ~73% of the seeded bills paired a
 * real bill number with the wrong title (e.g. S.1 stored as "For the People Act
 * of 2023" when S.1 in the 118th is the Freedom to Vote Act; S.14 stored as the
 * "Laken Riley Act" when S.14 does not exist). All 3,838 voting_records join to
 * those rows, so every displayed vote attributed a real member's position to
 * misidentified legislation. Fabricated civic data is worse than missing data,
 * so it goes.
 *
 * Voting records are deleted, not rebuilt: Congress.gov exposes House roll calls
 * only (beta), and Senate roll calls exist solely as XML on senate.gov. A
 * House-only rebuild would read as complete while silently omitting the Senate.
 *
 * Bill `status` is DERIVED from latestAction text -- the API has no status field.
 * Everything else is verbatim from Congress.gov.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/rebuild-bills-from-congress.mjs          # dry run
 *   node scripts/rebuild-bills-from-congress.mjs --apply
 */
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const CONGRESS = 119
const SESSION = '119th'
const EXTRA_ACTIVE = Number((process.argv.find((a) => a.startsWith('--active=')) || '--active=80').split('=')[1])
const SCAN = Number((process.argv.find((a) => a.startsWith('--scan=')) || '--scan=2000').split('=')[1])

const K = process.env.CONGRESS_API_KEY
if (!K) throw new Error('CONGRESS_API_KEY missing')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const TYPE_LABEL = { hr: 'H.R.', s: 'S.', hres: 'H.Res.', sres: 'S.Res.', hjres: 'H.J.Res.', sjres: 'S.J.Res.' }

async function api(path, params = {}) {
  const q = new URLSearchParams({ format: 'json', api_key: K, ...params })
  const r = await fetch(`https://api.congress.gov/v3/${path}?${q}`)
  if (!r.ok) throw new Error(`congress HTTP ${r.status} on ${path}`)
  return r.json()
}

async function paginate(path, { limit = 250, max = Infinity, ...params } = {}) {
  const out = []
  let offset = 0
  for (;;) {
    const j = await api(path, { ...params, limit: String(limit), offset: String(offset) })
    const batch = j.bills || []
    out.push(...batch)
    if (batch.length < limit || out.length >= max) break
    offset += limit
  }
  return out.slice(0, max === Infinity ? undefined : max)
}

/** Derive the app's status vocabulary from the latest action text. */
function deriveStatus(b) {
  const t = (b.latestAction?.text || '').toLowerCase()
  if (b.laws?.length || /became public law|signed by president/.test(t)) return 'signed_into_law'
  if (/vetoed|veto message/.test(t)) return 'failed'
  if (/failed|rejected|motion to table agreed/.test(t)) return 'failed'
  if (/passed senate|agreed to in senate|resolution agreed to in senate/.test(t)) return 'passed_senate'
  if (/passed house|agreed to in house|on passage passed|received in the senate/.test(t)) return 'passed_house'
  return 'in_committee'
}

console.log(`\n${APPLY ? '*** APPLYING ***' : '--- DRY RUN (pass --apply to write) ---'}\n`)

// 1. every public law of this Congress -- the genuinely significant set
console.log(`fetching public laws for the ${SESSION} Congress...`)
const laws = await paginate(`law/${CONGRESS}`, { limit: 250 })
console.log(`  ${laws.length} public laws`)

// 2. top up with in-progress bills so the tracker isn't only enacted laws.
// Congress.gov can't filter by action stage, so scan a wide recent window and
// keep the ones with objective floor movement.
console.log(`fetching recently-updated bills...`)
const active = await paginate(`bill/${CONGRESS}`, { limit: 250, max: SCAN, sort: 'updateDate+desc' })
console.log(`  ${active.length} recently-updated bills considered`)

const seen = new Set()
const picked = []
for (const b of [...laws, ...active]) {
  const key = `${b.type?.toLowerCase()}-${b.number}`
  if (seen.has(key)) continue
  const status = deriveStatus(b)
  // keep every law; from the active pool keep only bills with real floor movement
  const isLaw = status === 'signed_into_law'
  if (!isLaw && picked.filter((p) => p._status !== 'signed_into_law').length >= EXTRA_ACTIVE) continue
  if (!isLaw && status === 'in_committee') continue
  seen.add(key)
  picked.push({ ...b, _status: status })
}

console.log(`\nselected ${picked.length} real bills`)
console.log(
  `  by status: ${JSON.stringify(picked.reduce((a, b) => ((a[b._status] = (a[b._status] || 0) + 1), a), {}))}`
)

// 3. pull CRS summaries (best effort -- many bills have none)
console.log(`\nfetching summaries...`)
let withSummary = 0
for (const b of picked) {
  const t = b.type.toLowerCase()
  try {
    const j = await api(`bill/${CONGRESS}/${t}/${b.number}/summaries`)
    const s = (j.summaries || []).at(-1)
    if (s?.text) {
      b._summary = s.text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000)
      withSummary++
    }
  } catch {
    /* summary is optional */
  }
}
console.log(`  ${withSummary}/${picked.length} have a CRS summary`)

const rows = picked.map((b) => ({
  number: `${TYPE_LABEL[b.type.toLowerCase()] ?? b.type + '.'}${b.number}`,
  title: b.title,
  summary: b._summary ?? null,
  status: b._status,
  introduced_date: b.introducedDate || null,
  last_action_date: b.latestAction?.actionDate || null,
  congress_session: SESSION,
}))

console.log(`\nsample of what will be inserted:`)
for (const r of rows.slice(0, 8)) {
  console.log(`  ${r.number.padEnd(11)} ${r.status.padEnd(16)} ${(r.title || '').slice(0, 62)}`)
}

// 4. what gets destroyed
const { count: vrCount } = await sb.from('voting_records').select('*', { count: 'exact', head: true })
const { count: billCount } = await sb.from('bills').select('*', { count: 'exact', head: true })
console.log(`\nDESTRUCTIVE: delete ${vrCount} voting_records + ${billCount} fabricated bills`)
console.log(`             insert ${rows.length} real bills`)

if (!APPLY) {
  console.log(`\nDry run -- nothing written.\n`)
  process.exit(0)
}

// voting_records first: they carry a bill_id FK
console.log(`\ndeleting voting_records...`)
{
  const { error } = await sb.from('voting_records').delete().not('id', 'is', null)
  if (error) throw new Error(`voting_records delete: ${error.message}`)
}
console.log(`deleting old bills...`)
{
  const { error } = await sb.from('bills').delete().not('id', 'is', null)
  if (error) throw new Error(`bills delete: ${error.message}`)
}
console.log(`inserting real bills...`)
let ins = 0
for (let i = 0; i < rows.length; i += 100) {
  const chunk = rows.slice(i, i + 100)
  const { error } = await sb.from('bills').insert(chunk)
  if (error) console.log(`  ! chunk ${i}: ${error.message}`)
  else ins += chunk.length
}

const { count: vrAfter } = await sb.from('voting_records').select('*', { count: 'exact', head: true })
const { count: bAfter } = await sb.from('bills').select('*', { count: 'exact', head: true })
console.log(`\n=> bills: ${bAfter} (inserted ${ins}), voting_records: ${vrAfter}\n`)
