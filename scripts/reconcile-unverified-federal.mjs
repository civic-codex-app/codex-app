/**
 * Reconcile the house/senate politician rows Congress.gov did not verify.
 *
 * scripts/import-congress-members.mjs stamps is_verified on every row it can
 * match to a current member. The rows it cannot match are still titled
 * "U.S. Representative" or "U.S. Senator", so their profile pages present
 * people who are not in office as if they were. Each such row is one of:
 *
 *   current    Congress.gov lists them as serving now and no verified row
 *              holds that seat -> stamp verified, with district and bioguide.
 *              (If a verified row for the seat exists this is a duplicate:
 *              reported here, merged with merge-duplicate-politicians.mjs.)
 *   former     Congress.gov lists them with an ended term -> retitle
 *              "Former U.S. Representative (ST-DD, 2013–2025)", one-line bio
 *              from their terms, since_year from their first term. is_verified
 *              stays false: /api/representatives reads it as "serving now".
 *   candidate  Not in Congress.gov; FEC lists them as a House or Senate
 *              candidate -> retitle "Candidate for U.S. House, 2024 (ST-DD)"
 *              with the FEC id as source.
 *   unknown    Neither source knows them. Reported, never written.
 *
 * Two rows for the same person are reported as a pair and left to the merge
 * script, which knows how to move likes, follows and stances without
 * collisions.
 *
 * Dry-run by default; --apply writes after backing up every row it changes.
 *
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/reconcile-unverified-federal.mjs
 *   node scripts/reconcile-unverified-federal.mjs --apply
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'node:fs'
import { has } from './lib/cli.mjs'

const APPLY = has('apply')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const CG = process.env.CONGRESS_API_KEY
const FEC = process.env.FEC_API_KEY
if (!CG || !FEC) { console.error('CONGRESS_API_KEY and FEC_API_KEY are required'); process.exit(1) }
const TODAY = new Date().toISOString().slice(0, 10)

const STATE_NAMES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia', PR: 'Puerto Rico', MP: 'Northern Mariana Islands', GU: 'Guam', VI: 'Virgin Islands', AS: 'American Samoa' }

/* ---------- names ---------- */

const NICK = { mike: 'michael', tom: 'thomas', tim: 'timothy', bill: 'william', jim: 'james', bob: 'robert', dan: 'daniel', dave: 'david', joe: 'joseph', chris: 'christopher', steve: 'steven', matt: 'matthew', pat: 'patrick', rick: 'richard', ron: 'ronald', don: 'donald', ken: 'kenneth', liz: 'elizabeth', sam: 'samuel', ben: 'benjamin', andy: 'andrew', tony: 'anthony', greg: 'gregory', jeff: 'jeffrey', jon: 'jonathan', nick: 'nicholas', alex: 'alexander', ed: 'edward', ted: 'edward', drew: 'andrew', jake: 'jacob', buddy: 'earl', dutch: 'c' }
const SUFFIX = /^(jr|sr|ii|iii|iv|v)$/
const clean = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z\s'-]/g, ' ').replace(/\s+/g, ' ').trim()
const toks = (s) => clean(s).split(' ').filter((t) => t && !SUFFIX.test(t))
const canon = (t) => NICK[t] ?? t
const sameGiven = (a, b) => canon(a) === canon(b) || (a.length > 1 && b.length > 1 && (a.startsWith(b) || b.startsWith(a)))

/** Congress.gov "Last, First M. "Nick"" -> { last, givens[] } with nicknames included. */
function cgParts(name) {
  const [lastRaw, rest = ''] = name.split(',')
  const nicks = [...rest.matchAll(/"([^"]+)"/g)].map((m) => m[1])
  const last = toks(lastRaw).pop()
  const givens = [...toks(rest.replace(/"[^"]+"/g, '')), ...nicks.flatMap(toks)]
  return { last, givens }
}

/** Our "First [Middle] Last" (or the odd "Last First") -> candidate { last, givens[] } readings. */
function ourReadings(name) {
  const t = toks(name)
  const out = [{ last: t[t.length - 1], givens: t.slice(0, -1) }]
  if (t.length === 2) out.push({ last: t[0], givens: [t[1]] }) // "Carmichael Dave"
  return out
}

function matchMember(row, members) {
  for (const r of ourReadings(row.name)) {
    const sameLast = members.filter((m) => cgParts(m.name).last === r.last)
    const hits = sameLast.filter((m) => {
      const g = cgParts(m.name).givens
      return r.givens.some((x) => g.some((y) => sameGiven(x, y)))
    })
    if (hits.length === 1) return hits[0]
    if (hits.length === 0 && sameLast.length === 1 && r.givens.length === 0) return sameLast[0]
  }
  return null
}

/* ---------- sources ---------- */

const cache = new Map()
async function cg(path) {
  if (cache.has(path)) return cache.get(path)
  const res = await fetch(`https://api.congress.gov/v3${path}${path.includes('?') ? '&' : '?'}api_key=${CG}&format=json`)
  if (!res.ok) throw new Error(`Congress.gov ${path}: HTTP ${res.status}`)
  const json = await res.json()
  cache.set(path, json)
  return json
}

/**
 * Every member Congress.gov holds for a state, current or not, one entry per
 * person. currentMember=false is not "former": it returns sitting members
 * too, so without the dedupe a sitting member appears twice and the
 * one-match rule rejects them (Carter, Austin Scott and Turner, first run).
 */
async function stateMembers(st) {
  const byId = new Map()
  for (const current of ['true', 'false']) {
    for (let offset = 0; ; offset += 250) {
      const j = await cg(`/member/${st}?currentMember=${current}&limit=250&offset=${offset}`)
      for (const m of j.members ?? []) if (!byId.has(m.bioguideId)) byId.set(m.bioguideId, { ...m, current: current === 'true' })
      if (!j.pagination?.next) break
    }
  }
  return [...byId.values()]
}

async function fecCandidates(row) {
  const office = row.chamber === 'senate' ? 'S' : 'H'
  const found = []
  for (const r of ourReadings(row.name)) {
    const res = await fetch(`https://api.open.fec.gov/v1/candidates/?api_key=${FEC}&state=${row.state}&office=${office}&name=${encodeURIComponent(r.last)}&per_page=50`)
    if (!res.ok) continue
    const j = await res.json()
    for (const c of j.results ?? []) {
      // FEC is also "LAST, FIRST", but the surname part can be compound
      // ("VILLAFANE RAMOS, WILLIAM ELY"), so match any token of it.
      const [lastPart, rest = ''] = c.name.split(',')
      const lastToks = toks(lastPart)
      const givens = toks(rest.replace(/\b(mr|mrs|ms|dr|rep|sen)\b/gi, ''))
      if (lastToks.includes(r.last) && r.givens.some((x) => givens.some((y) => sameGiven(x, y)))) found.push(c)
    }
  }
  return found
}

/* ---------- run ---------- */

const { data: rows } = await sb.from('politicians').select('*').in('chamber', ['house', 'senate']).eq('is_verified', false).order('state')
const { data: verified } = await sb.from('politicians').select('id, name, state, chamber, district').in('chamber', ['house', 'senate']).eq('is_verified', true)
console.log(`${APPLY ? '--- APPLYING ---' : '--- DRY RUN (pass --apply to write) ---'}`)
console.log(`${rows.length} unverified house/senate rows\n`)

const plan = { current: [], former: [], candidate: [], unknown: [], pairs: [], done: [] }
const byState = {}
for (const r of rows) {
  // Already retitled by an earlier run: a former member or a candidate stays
  // unverified by design, so re-runs must not touch them again.
  if (/^(Former |Candidate for )/.test(r.title ?? '')) { plan.done.push(r); continue }
  ;(byState[r.state] ??= []).push(r)
}
console.log(`${plan.done.length} already reconciled (titled Former… or Candidate for…), skipped\n`)

for (const [st, group] of Object.entries(byState)) {
  const members = await stateMembers(st)
  const seen = new Map() // bioguide -> first row, to spot pairs
  for (const row of group) {
    const m = matchMember(row, members)
    if (m) {
      if (seen.has(m.bioguideId)) { plan.pairs.push({ a: seen.get(m.bioguideId), b: row, official: m.name, bioguide: m.bioguideId }); continue }
      seen.set(m.bioguideId, row)
      const terms = (m.terms?.item ?? []).filter((t) => (row.chamber === 'senate' ? t.chamber === 'Senate' : t.chamber === 'House of Representatives'))
      const chamberTerms = terms.length ? terms : (m.terms?.item ?? [])
      const start = Math.min(...chamberTerms.map((t) => t.startYear))
      const ended = chamberTerms.every((t) => t.endYear)
      const end = ended ? Math.max(...chamberTerms.map((t) => t.endYear)) : null
      if (m.current && !ended) {
        const seatTaken = verified.find((v) => v.state === st && v.chamber === row.chamber && (row.chamber === 'senate' ? cgParts(m.name).last === toks(v.name).pop() : String(v.district) === String(m.district)))
        if (seatTaken) plan.pairs.push({ a: seatTaken, b: row, official: m.name, bioguide: m.bioguideId, verifiedSurvivor: true })
        else plan.current.push({ row, m, start })
      } else {
        plan.former.push({ row, m, start, end })
      }
      continue
    }
    const fec = await fecCandidates(row)
    if (fec.length) {
      const c = fec.sort((a, b) => Math.max(...b.election_years) - Math.max(...a.election_years))[0]
      plan.candidate.push({ row, c })
    } else {
      plan.unknown.push({ row })
    }
  }
}

const seat = (st, d) => (d == null || d === '' || Number(d) === 0 ? st : `${st}-${d}`)
const isSen = (row) => row.chamber === 'senate'
// Territories send a Delegate (PR a Resident Commissioner), not a Representative.
const TERRITORY = { PR: 'Resident Commissioner', MP: 'Delegate to Congress', GU: 'Delegate to Congress', VI: 'Delegate to Congress', AS: 'Delegate to Congress', DC: 'Delegate to Congress' }
const houseTitle = (st) => TERRITORY[st] ?? 'U.S. Representative'

console.log(`CURRENT members Congress.gov lists but the import missed (stamp verified): ${plan.current.length}`)
for (const x of plan.current) console.log(`   ${x.row.state} ${x.row.name.padEnd(26)} -> ${x.m.name} ${x.m.bioguideId} ${seat(x.row.state, x.m.district)} since ${x.start}`)

console.log(`\nFORMER members (retitle, keep): ${plan.former.length}`)
for (const x of plan.former) console.log(`   ${x.row.state} ${x.row.name.padEnd(26)} -> ${x.m.name} ${x.m.bioguideId} ${seat(x.row.state, x.m.district)} ${x.start}–${x.end}`)

console.log(`\nNEVER SERVED, FEC candidates (retitle): ${plan.candidate.length}`)
for (const x of plan.candidate) console.log(`   ${x.row.state} ${x.row.name.padEnd(26)} -> ${x.c.name} ${x.c.candidate_id} ${x.c.office}-${x.c.district ?? ''} ${x.c.election_years.join('/')}`)

console.log(`\nPAIRS, same person twice (merge with merge-duplicate-politicians.mjs): ${plan.pairs.length}`)
for (const p of plan.pairs) console.log(`   ${p.b.state} "${p.a.name}" + "${p.b.name}" -> ${p.official} ${p.bioguide}${p.verifiedSurvivor ? ' (verified row survives)' : ''}`)

console.log(`\nUNKNOWN to both Congress.gov and FEC (not touched): ${plan.unknown.length}`)
for (const x of plan.unknown) console.log(`   ${x.row.state} ${x.row.name}  since ${x.row.since_year}  [${(x.row.source ?? '').slice(0, 40)}]`)

if (!APPLY) { console.log('\nDry run complete — no writes.'); process.exit(0) }

const touched = [...plan.current, ...plan.former, ...plan.candidate].map((x) => x.row)
const backup = `unverified-federal-backup-${TODAY}.json`
writeFileSync(backup, JSON.stringify(touched, null, 1))
console.log(`\nbacked up ${touched.length} rows to ${backup}`)

const now = new Date().toISOString()
let ok = 0, failed = 0
const write = async (row, patch) => {
  const { error } = await sb.from('politicians').update({ ...patch, last_checked: now }).eq('id', row.id).eq('title', row.title)
  if (error) { failed++; console.log(`   ! ${row.name}: ${error.message}`) } else ok++
}
for (const { row, m, start } of plan.current) {
  await write(row, {
    is_verified: true, district: isSen(row) ? null : String(m.district), since_year: start,
    source: `Congress.gov member ${m.bioguideId} (currentMember=true, fetched ${TODAY})`,
  })
}
for (const { row, m, start, end } of plan.former) {
  const name = STATE_NAMES[row.state] ?? row.state
  const where = isSen(row) ? name : (m.district ? `${name}'s ${m.district}${ordinal(m.district)} district` : name)
  await write(row, {
    title: `Former ${isSen(row) ? 'U.S. Senator' : houseTitle(row.state)} (${seat(row.state, m.district)}, ${start}–${end})`,
    bio: isSen(row) ? `Served as U.S. Senator from ${name}, ${start}–${end}.` : `Represented ${where} in the U.S. House${TERRITORY[row.state] ? ` as ${TERRITORY[row.state]}` : ''}, ${start}–${end}.`,
    since_year: start, district: isSen(row) ? null : (m.district ? String(m.district) : row.district),
    source: `Congress.gov member ${m.bioguideId}, terms ${start}–${end}; not a current member (fetched ${TODAY})`,
  })
}
for (const { row, c } of plan.candidate) {
  const year = Math.max(...c.election_years)
  const office = c.office === 'S' ? 'U.S. Senate' : (TERRITORY[row.state] ? TERRITORY[row.state] : 'U.S. House')
  const d = c.office === 'S' ? row.state : seat(row.state, Number(c.district))
  await write(row, {
    title: `Candidate for ${office}, ${year} (${d})`,
    bio: `${c.party === 'DEM' ? 'Democratic' : c.party === 'REP' ? 'Republican' : c.party} candidate for ${office}${c.office === 'H' ? ` in ${d}` : ''}, ${c.election_years.join(', ')}. Not a member of Congress.`,
    since_year: null,
    source: `FEC candidate ${c.candidate_id} (${c.office}, ${d}, ${c.election_years.join('/')}); not on Congress.gov member lists (checked ${TODAY})`,
  })
}
// --delete-unknown: a seed-generated row that neither Congress.gov nor the FEC
// has ever heard of is an invention, and an invented officeholder on a
// voter-facing site is worse than a missing one. Only seed rows, only when no
// candidate or race points at them; dependents are backed up and removed first.
if (has('delete-unknown')) {
  const victims = []
  for (const { row } of plan.unknown) {
    if (!(row.source ?? '').startsWith('seed')) { console.log(`   keep ${row.name}: source is not seed`); continue }
    const { count: c } = await sb.from('candidates').select('*', { count: 'exact', head: true }).eq('politician_id', row.id)
    const { count: r } = await sb.from('races').select('*', { count: 'exact', head: true }).eq('incumbent_id', row.id)
    if (c || r) { console.log(`   keep ${row.name}: referenced by ${c} candidate(s), ${r} race(s)`); continue }
    victims.push(row)
  }
  const deps = {}
  for (const row of victims) {
    deps[row.id] = {}
    for (const t of ['politician_issues', 'likes', 'follows', 'campaign_finance', 'stance_history', 'politician_committees']) {
      const { data } = await sb.from(t).select('*').eq('politician_id', row.id)
      deps[row.id][t] = data ?? []
    }
  }
  writeFileSync(`unverified-federal-deleted-${TODAY}.json`, JSON.stringify({ rows: victims, dependents: deps }, null, 1))
  for (const row of victims) {
    for (const t of Object.keys(deps[row.id])) if (deps[row.id][t].length) await sb.from(t).delete().eq('politician_id', row.id)
    const { error } = await sb.from('politicians').delete().eq('id', row.id).like('source', 'seed%')
    if (error) { failed++; console.log(`   ! delete ${row.name}: ${error.message}`) } else { ok++; console.log(`   deleted ${row.name} (${row.state}) and ${Object.values(deps[row.id]).reduce((n, a) => n + a.length, 0)} dependent rows`) }
  }
}

console.log(`\n=> ${ok} written, ${failed} failed`)

function ordinal(n) { const v = n % 100; return (v >= 11 && v <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th') }
