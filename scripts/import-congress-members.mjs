/**
 * Reconcile `politicians` against Congress.gov's current membership, and
 * optionally apply the corrections that are derivable from it.
 *
 * Companion to scripts/audit-congress-members.mjs, which only reports. This
 * one can write, but only in the three directions that Congress.gov settles
 * authoritatively:
 *
 *   insert   a member who is serving and that we do not hold
 *   correct  party and district on a member we do hold, where they differ
 *   stamp    source + is_verified + last_checked on every matched row
 *
 * It NEVER deletes. A row we hold for someone no longer serving is a product
 * question -- there is no is_active column, former members are referenced by
 * stances, finance and committees, and historical pages may want them -- so
 * departures are reported and left alone.
 *
 * Requires migration 026_politician_source.sql. Without it there is nowhere to
 * record where a row came from, which is the whole point.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/import-congress-members.mjs            # dry run
 *   node scripts/import-congress-members.mjs --apply
 *   node scripts/import-congress-members.mjs --verbose
 */
import { createClient } from '@supabase/supabase-js'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const APPLY = process.argv.includes('--apply')
const VERBOSE = process.argv.includes('--verbose')
const KEY = process.env.CONGRESS_API_KEY
const CACHE = '.congress-cache'
const FETCHED = new Date().toISOString().slice(0, 10)
const SOURCE = `Congress.gov API (member?currentMember=true, fetched ${FETCHED})`

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
if (!KEY) { console.error('CONGRESS_API_KEY is not set.'); process.exit(1) }

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
  'Puerto Rico':'PR',Guam:'GU','American Samoa':'AS','Virgin Islands':'VI',
  'Northern Mariana Islands':'MP',
}
const PARTY = { Democratic: 'democrat', Republican: 'republican', Independent: 'independent' }

const slugify = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const norm = (s) => (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
  .replace(/\b(jr|sr|ii|iii|iv|dr|mr|mrs|ms|rep|sen|gov)\b\.?/g,'')
  .replace(/[^a-z\s]/g,'').replace(/\s+/g,' ').trim()
const lastName = (s) => norm(s).split(' ').filter(Boolean).pop() || ''

/** Congress.gov ships "Carter, Earl L. \"Buddy\"" — flip, and keep the nickname. */
function flip(n) {
  const s = String(n || '').trim()
  if (!s.includes(',')) return s
  const last = s.slice(0, s.indexOf(','))
  const rest = s.slice(s.indexOf(',') + 1)
  return `${rest.trim()} ${last.trim()}`.replace(/\s+/g, ' ').trim()
}

/**
 * One record in 537 concatenates two absolute URLs:
 *   https://www.congress.gov/img/member/https://bioguide.congress.gov/photo/x.jpg
 * Taking from the last "https://" fixes that one and is a no-op on the rest.
 */
const cleanImage = (u) => {
  if (!u) return null
  const i = u.lastIndexOf('https://')
  return i > 0 ? u.slice(i) : u
}

async function members() {
  if (!existsSync(CACHE)) await mkdir(CACHE, { recursive: true })
  const out = []
  for (let offset = 0; ; offset += 250) {
    const f = `${CACHE}/current-${offset}.json`
    let json
    if (existsSync(f)) json = JSON.parse(await readFile(f, 'utf8'))
    else {
      const r = await fetch(`https://api.congress.gov/v3/member?currentMember=true&limit=250&offset=${offset}&api_key=${KEY}`)
      if (!r.ok) throw new Error(`Congress.gov HTTP ${r.status}`)
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
    out.push(...data); if (data.length < 1000) break
  }
  return out
}

console.log(`\n${APPLY ? '*** APPLYING ***' : '--- DRY RUN (pass --apply to write) ---'}\n`)

const { error: probe } = await sb.from('politicians').select('source').limit(1)
if (probe) {
  console.log('! politicians.source is missing — run supabase/migrations/026_politician_source.sql')
  if (APPLY) { console.log('  refusing to write unsourced rows. Exiting.'); process.exit(1) }
  console.log('  (dry run continues; --apply will refuse until the migration is run)\n')
}

const official = (await members()).map((m) => {
  const chambers = (m.terms?.item ?? []).map((t) => t.chamber || '')
  const isSenate = chambers.some((c) => /senate/i.test(c))
  return {
    bioguide: m.bioguideId,
    name: flip(m.name),
    state: ABBREV[m.state] ?? m.state,
    chamber: isSenate ? 'senate' : 'house',
    district: m.district != null ? String(m.district) : null,
    party: PARTY[m.partyName] ?? 'independent',
    image: cleanImage(m.depiction?.imageUrl),
  }
})

const ours = await pageAll('politicians', 'id,name,slug,state,chamber,district,party,image_url', (q) =>
  q.in('chamber', ['senate', 'house'])
)
const key = (state, chamber, name) => `${state}|${chamber}|${lastName(name)}`
const ourIdx = new Map()
for (const p of ours) {
  const k = key(p.state, p.chamber, p.name)
  if (!ourIdx.has(k)) ourIdx.set(k, [])
  ourIdx.get(k).push(p)
}
const allSlugs = new Set((await pageAll('politicians', 'slug')).map((p) => p.slug))

const toInsert = []
const toCorrect = []
const toStamp = []
let ambiguous = 0

for (const m of official) {
  const hits = ourIdx.get(key(m.state, m.chamber, m.name)) ?? []
  if (hits.length === 0) { toInsert.push(m); continue }
  if (hits.length > 1) { ambiguous++; continue }
  const p = hits[0]
  const fix = {}
  if (p.party !== m.party) fix.party = m.party
  // Only correct a district where both sides state one. Congress.gov reports
  // null for at-large and territory seats while we store "0" or "1", and that
  // difference is encoding, not error.
  const pd = p.district == null ? null : String(p.district).replace(/^0+/, '')
  const md = m.district == null ? null : String(m.district).replace(/^0+/, '')
  if (m.chamber === 'house' && md != null && pd != null && pd !== md) fix.district = m.district
  if (Object.keys(fix).length) toCorrect.push({ p, m, fix })
  else toStamp.push({ p, m })
}

const departed = ours.filter((p) => !official.some((m) => key(m.state, m.chamber, m.name) === key(p.state, p.chamber, p.name)))

console.log(`Congress.gov current members: ${official.length}`)
console.log(`our federal politicians:      ${ours.length}\n`)
console.log(`insert (serving, we lack)     ${toInsert.length}`)
console.log(`correct (party/district)      ${toCorrect.length}`)
console.log(`stamp only (already correct)  ${toStamp.length}`)
console.log(`ambiguous surname match       ${ambiguous}`)
console.log(`departed (reported, untouched) ${departed.length}`)

const show = (label, rows, fmt) => {
  if (!rows.length) return
  console.log(`\n${label}`)
  for (const r of (VERBOSE ? rows : rows.slice(0, 8))) console.log('  ' + fmt(r))
  if (!VERBOSE && rows.length > 8) console.log(`  ... and ${rows.length - 8} more (--verbose)`)
}
show('INSERT:', toInsert, (m) => `${m.state} ${m.chamber}${m.district ? ' ' + m.district : ''}  ${m.name} (${m.party})`)
show('CORRECT:', toCorrect, ({ p, fix }) => `${p.state} ${p.name}: ${JSON.stringify(fix)}`)
show('DEPARTED (left alone — needs a decision):', departed, (p) => `${p.state} ${p.chamber}  ${p.name}`)

if (!APPLY) { console.log('\nNothing written. Re-run with --apply.'); process.exit(0) }

let inserted = 0
for (const m of toInsert) {
  let slug = slugify(m.name)
  if (allSlugs.has(slug)) slug = `${slug}-${m.state.toLowerCase()}`
  if (allSlugs.has(slug)) slug = `${slug}-${m.bioguide.toLowerCase()}`
  allSlugs.add(slug)
  const { error } = await sb.from('politicians').insert({
    name: m.name,
    slug,
    state: m.state,
    chamber: m.chamber,
    district: m.district,
    party: m.party,
    title: m.chamber === 'senate' ? 'U.S. Senator' : 'U.S. Representative',
    image_url: m.image,
    source: SOURCE,
    is_verified: true,
    last_checked: new Date().toISOString(),
  })
  if (error) console.log(`  ! insert ${m.name}: ${error.message}`)
  else inserted++
}

let corrected = 0
for (const { p, fix } of toCorrect) {
  const { error } = await sb.from('politicians')
    .update({ ...fix, source: SOURCE, is_verified: true, last_checked: new Date().toISOString() })
    .eq('id', p.id)
  if (error) console.log(`  ! correct ${p.name}: ${error.message}`)
  else corrected++
}

let stamped = 0
for (let i = 0; i < toStamp.length; i += 100) {
  const ids = toStamp.slice(i, i + 100).map(({ p }) => p.id)
  const { error } = await sb.from('politicians')
    .update({ source: SOURCE, is_verified: true, last_checked: new Date().toISOString() })
    .in('id', ids)
  if (error) console.log(`  ! stamp batch: ${error.message}`)
  else stamped += ids.length
}

console.log(`\n=> inserted ${inserted}, corrected ${corrected}, stamped ${stamped}`)
console.log(`   ${departed.length} departed members left untouched`)
