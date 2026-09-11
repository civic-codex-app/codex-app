/**
 * Reconcile our federal politicians against Congress.gov's current members.
 *
 * Why: `politicians` is the table everything else hangs off -- stances, race
 * incumbents, candidate links, report cards -- and it is the one table with no
 * provenance at all. No `source`, no `is_verified`, and every row's
 * `updated_at` is 2026-03-21, the seed date. Nothing has been refreshed since.
 *
 * Congress.gov publishes the current membership of both chambers, so for the
 * ~540 federal rows we can check names, party, state and district against an
 * authoritative list instead of trusting the seed. The ~8,000 state and local
 * rows have no equivalent free source and are out of scope here.
 *
 * REPORT ONLY. It writes nothing. Deciding what to do about a member we hold
 * who is no longer serving -- or one who is serving and we lack -- needs a
 * judgement call about the site, not a script.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/audit-congress-members.mjs
 *   node scripts/audit-congress-members.mjs --verbose   # list every mismatch
 */
import { createClient } from '@supabase/supabase-js'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const VERBOSE = process.argv.includes('--verbose')
const KEY = process.env.CONGRESS_API_KEY
const CACHE = '.congress-cache'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

if (!KEY) {
  console.error('CONGRESS_API_KEY is not set. Get one at https://api.congress.gov/sign-up/')
  process.exit(1)
}

const ABBREV = {
  Alabama:'AL',Alaska:'AK',Arizona:'AZ',Arkansas:'AR',California:'CA',Colorado:'CO',
  Connecticut:'CT',Delaware:'DE',Florida:'FL',Georgia:'GA',Hawaii:'HI',Idaho:'ID',
  Illinois:'IL',Indiana:'IN',Iowa:'IA',Kansas:'KS',Kentucky:'KY',Louisiana:'LA',
  Maine:'ME',Maryland:'MD',Massachusetts:'MA',Michigan:'MI',Minnesota:'MN',
  Mississippi:'MS',Missouri:'MO',Montana:'MT',Nebraska:'NE',Nevada:'NV',
  'New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM','New York':'NY',
  'North Carolina':'NC','North Dakota':'ND',Ohio:'OH',Oklahoma:'OK',Oregon:'OR',
  Pennsylvania:'PA','Rhode Island':'RI','South Carolina':'SC','South Dakota':'SD',
  Tennessee:'TN',Texas:'TX',Utah:'UT',Vermont:'VT',Virginia:'VA',Washington:'WA',
  'West Virginia':'WV',Wisconsin:'WI',Wyoming:'WY','District of Columbia':'DC',
  'Puerto Rico':'PR','Guam':'GU','American Samoa':'AS','Virgin Islands':'VI',
  'Northern Mariana Islands':'MP',
}
const PARTY = { Democratic: 'democrat', Republican: 'republican', Independent: 'independent' }

const norm = (s) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\b(jr|sr|ii|iii|iv|dr|mr|mrs|ms|rep|sen|gov)\b\.?/g, '')
    .replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim()
const lastName = (s) => norm(s).split(' ').filter(Boolean).pop() || ''

/** Congress.gov ships "Wahab, Aisha". */
const flip = (n) => {
  const s = String(n || '').trim()
  if (!s.includes(',')) return s
  const [last, rest] = [s.slice(0, s.indexOf(',')), s.slice(s.indexOf(',') + 1)]
  return `${rest.trim()} ${last.trim()}`.trim()
}

async function members() {
  if (!existsSync(CACHE)) await mkdir(CACHE, { recursive: true })
  const out = []
  for (let offset = 0; ; offset += 250) {
    const f = `${CACHE}/current-${offset}.json`
    let json
    if (existsSync(f)) {
      json = JSON.parse(await readFile(f, 'utf8'))
    } else {
      const url = `https://api.congress.gov/v3/member?currentMember=true&limit=250&offset=${offset}&api_key=${KEY}`
      const r = await fetch(url)
      if (!r.ok) throw new Error(`Congress.gov HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`)
      json = await r.json()
      await writeFile(f, JSON.stringify(json))
      console.log(`   fetched offset ${offset}`)
    }
    const batch = json.members ?? []
    out.push(...batch)
    if (batch.length < 250) break
  }
  return out
}

async function pageAll(table, cols, tweak = (q) => q) {
  const out = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await tweak(sb.from(table).select(cols)).range(from, from + 999)
    if (error) throw new Error(`${table}: ${error.message}`)
    out.push(...data)
    if (data.length < 1000) break
  }
  return out
}

console.log('\n--- REPORT ONLY (this script writes nothing) ---\n')

const raw = await members()
const official = raw.map((m) => {
  const chambers = (m.terms?.item ?? []).map((t) => t.chamber)
  const isSenate = chambers.some((c) => /senate/i.test(c || ''))
  return {
    bioguide: m.bioguideId,
    name: flip(m.name),
    state: ABBREV[m.state] ?? m.state,
    chamber: isSenate ? 'senate' : 'house',
    district: m.district != null ? String(m.district) : null,
    party: PARTY[m.partyName] ?? 'independent',
  }
})
console.log(`Congress.gov current members: ${official.length}`)

const ours = await pageAll('politicians', 'id,name,state,chamber,district,party', (q) =>
  q.in('chamber', ['senate', 'house'])
)
console.log(`our federal politicians:      ${ours.length}`)
console.log(`  senate ${ours.filter((p) => p.chamber === 'senate').length} · house ${ours.filter((p) => p.chamber === 'house').length}`)
console.log(`Congress.gov senate ${official.filter((m) => m.chamber === 'senate').length} · house ${official.filter((m) => m.chamber === 'house').length}\n`)

// Match on (state, chamber, last name) -- names differ in formatting far more
// than they differ in substance, and district can legitimately have changed.
const key = (state, chamber, name) => `${state}|${chamber}|${lastName(name)}`
const ourIdx = new Map()
for (const p of ours) {
  const k = key(p.state, p.chamber, p.name)
  if (!ourIdx.has(k)) ourIdx.set(k, [])
  ourIdx.get(k).push(p)
}
const offIdx = new Map()
for (const m of official) {
  const k = key(m.state, m.chamber, m.name)
  if (!offIdx.has(k)) offIdx.set(k, [])
  offIdx.get(k).push(m)
}

const missing = official.filter((m) => !ourIdx.has(key(m.state, m.chamber, m.name)))
const departed = ours.filter((p) => !offIdx.has(key(p.state, p.chamber, p.name)))

const partyMismatch = []
const districtMismatch = []
for (const m of official) {
  const hits = ourIdx.get(key(m.state, m.chamber, m.name)) ?? []
  if (hits.length !== 1) continue
  const p = hits[0]
  if (p.party !== m.party) partyMismatch.push({ m, p })
  const pd = p.district == null ? null : String(p.district).replace(/^0+/, '')
  const md = m.district == null ? null : String(m.district).replace(/^0+/, '')
  if (m.chamber === 'house' && pd !== md) districtMismatch.push({ m, p })
}

console.log(`serving per Congress.gov, absent from our table:  ${missing.length}`)
console.log(`in our table, not currently serving:              ${departed.length}`)
console.log(`matched but party differs:                        ${partyMismatch.length}`)
console.log(`matched but district differs:                     ${districtMismatch.length}`)

const show = (label, rows, fmt) => {
  if (!rows.length) return
  console.log(`\n${label}`)
  for (const r of (VERBOSE ? rows : rows.slice(0, 10))) console.log('  ' + fmt(r))
  if (!VERBOSE && rows.length > 10) console.log(`  ... and ${rows.length - 10} more (--verbose)`)
}
show('MISSING (serving, we do not have them):', missing, (m) => `${m.state} ${m.chamber}${m.district ? ' ' + m.district : ''}  ${m.name} (${m.party})`)
show('DEPARTED (we list them, they are not serving):', departed, (p) => `${p.state} ${p.chamber}${p.district ? ' ' + p.district : ''}  ${p.name} (${p.party})`)
show('PARTY MISMATCH (ours -> Congress.gov):', partyMismatch, ({ m, p }) => `${p.state} ${p.name}: ${p.party} -> ${m.party}`)
show('DISTRICT MISMATCH (ours -> Congress.gov):', districtMismatch, ({ m, p }) => `${p.state} ${p.name}: ${p.district} -> ${m.district}`)

console.log('\nNothing was written. Decide per category before acting.')
