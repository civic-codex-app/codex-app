/**
 * Reconcile Michigan 2026 candidates against the state's official listings.
 *
 * The Michigan Department of State publishes an Official Candidate Listing for
 * the Aug 4 primary and the Nov 3 general, covering every state, federal and
 * legislative office. Those two reports settle what FEC filings cannot: who
 * actually reached the ballot, who won the primary, and who was disqualified.
 *
 * For each Poli race the listing covers (U.S. Senate, Governor, U.S. House,
 * State Senate, State House), every candidate row is resolved:
 *
 *   on the general listing            -> running, verified (a Nov 3 nominee)
 *   on the primary listing only       -> lost, verified (lost the Aug 4 primary)
 *   on the primary listing, DISQ/WITHD-> withdrawn, verified
 *   on neither, seed-generated, not   -> deleted (the seed invented them)
 *     the incumbent
 *   on neither, otherwise             -> withdrawn, verified (filed with the FEC
 *                                        or held the seat, never reached the ballot)
 *
 * General-election nominees Poli lacks are inserted, linked to an existing
 * politician when exactly one Michigan politician has that name. party_type
 * holds four values, so a nominee of any other party (Libertarian, U.S.
 * Taxpayers, Natural Law, Working Class) is reported and NOT inserted:
 * labelling them Independent would print a false party on the ballot.
 *
 * Every write stamps `source` with the report, the filing date and method.
 * Dry-run by default; --apply writes after backing up every Michigan
 * candidate row.
 *
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/reconcile-michigan-candidates.mjs
 *   node scripts/reconcile-michigan-candidates.mjs --apply
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'node:fs'
import { has } from './lib/cli.mjs'

const APPLY = has('apply')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const REPORT = 'https://mi-boe.entellitrak.com/etk-mi-boe-prod/page.request.do?page=page.miboePublicReport&electionYear=2026&electionType='
const TODAY = new Date().toISOString().slice(0, 10)

/* ---------- the official listings ---------- */

const decode = (s) =>
  s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim()

async function listing(type) {
  const res = await fetch(REPORT + type)
  if (!res.ok) throw new Error(`${type} listing: HTTP ${res.status}`)
  const html = await res.text()
  const rows = []
  let office = null
  for (const tr of html.match(/<tr\b[\s\S]*?<\/tr>/g) ?? []) {
    const spans = [...tr.matchAll(/<span\b[^>]*>([\s\S]*?)<\/span>/g)].map((m) => decode(m[1]))
    if (tr.includes('#28807C') && spans.length) { office = spans[0]; continue }
    if (spans.length === 5 && /^\d\d\/\d\d\/\d{4}$/.test(spans[3])) {
      const [status, party, name, filed, method] = spans
      rows.push({ office, status, party, name: name.split(' / ')[0].trim(), filed, method })
    }
  }
  // A listing that parses to nothing is a changed page, not an empty election.
  if (rows.length < 100) throw new Error(`${type} listing parsed to ${rows.length} rows; the page format may have changed`)
  return rows
}

const ordinal = (n) => {
  const v = n % 100
  return n + ((v >= 11 && v <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th'))
}

/** The listing's office heading for a Poli race, or null if it is not covered. */
function officeFor(race) {
  const d = Number(race.district)
  switch (race.chamber) {
    case 'senate': return 'U.S. Senate'
    case 'governor': return 'Governor / Lt. Governor'
    case 'house': return d ? `${ordinal(d)} District Representative in Congress` : null
    case 'state_senate': return d ? `${ordinal(d)} District State Senator` : null
    case 'state_house': return d ? `${ordinal(d)} District Representative in State Legislature` : null
    default: return null
  }
}

/* ---------- name matching ---------- */

const SUFFIX = /^(jr|sr|ii|iii|iv|v)\.?$/i
const NICK = { mike: 'michael', tom: 'thomas', tim: 'timothy', bill: 'william', jim: 'james', bob: 'robert', dan: 'daniel', dave: 'david', joe: 'joseph', chris: 'christopher', steve: 'steven', matt: 'matthew', pat: 'patrick', rick: 'richard', ron: 'ronald', don: 'donald', ken: 'kenneth', kim: 'kimberly', liz: 'elizabeth', sam: 'samuel', ben: 'benjamin', andy: 'andrew', tony: 'anthony', greg: 'gregory', jeff: 'jeffrey', jon: 'jonathan', nick: 'nicholas', alex: 'alexander' }
const canon = (f) => NICK[f] ?? f
const clean = (s) => s.toLowerCase().replace(/[^a-z\s'-]/g, ' ').replace(/\s+/g, ' ').trim()

/** "Rogers, Mike" or "Michael J Rogers" -> { first: 'michael', last: 'rogers' }. */
function parts(name, official) {
  let first, last
  if (official) {
    const [l, f = ''] = name.split(',')
    last = clean(l).split(' ').filter((t) => !SUFFIX.test(t)).pop()
    first = clean(f).split(' ')[0]
  } else {
    const toks = clean(name.replace(/^[\s,]+/, '')).split(' ').filter((t) => t && !SUFFIX.test(t))
    first = toks[0]
    last = toks[toks.length - 1]
  }
  return { first: canon(first ?? ''), last: last ?? '' }
}

/** Every given name in a Poli name, middle names included: "Steven Raymond Pooley" files as "Pooley, Ray". */
const givens = (name) =>
  clean(name.replace(/^[\s,]+/, '')).split(' ').filter((t) => t && !SUFFIX.test(t)).slice(0, -1).map(canon)
const sameGiven = (a, b) => a === b || (a.length > 1 && b.length > 1 && (a.startsWith(b) || b.startsWith(a)))

/** The one official entry this Poli candidate refers to, or null. Ambiguity counts as no match. */
function find(c, entries) {
  const p = parts(c.name, false)
  const g = givens(c.name)
  const sameLast = entries.filter((e) => parts(e.name, true).last === p.last)
  const hits = sameLast.filter((e) => {
    const o = parts(e.name, true)
    return g.some((x) => sameGiven(x, o.first)) || (sameLast.length === 1 && o.first[0] === p.first[0])
  })
  if (hits.length !== 1) return null
  const official = partyOf(hits[0].party)
  if (official && c.party && official !== c.party) {
    console.log(`! ${c.name}: Poli says ${c.party}, the listing says ${shortParty(hits[0].party)}; not matched`)
    return null
  }
  return hits[0]
}

const displayName = (official) => {
  const [l, f = ''] = official.split(',')
  return `${f.trim()} ${l.trim()}`.replace(/\s+/g, ' ').trim()
}
const iso = (mdy) => { const [m, d, y] = mdy.split('/'); return `${y}-${m}-${d}` }
const PARTY = {
  'Democratic Party': 'democrat',
  'Republican Party': 'republican',
  'Green Party': 'green',
  'No Party Affiliation': 'independent',
  'Libertarian Party': 'libertarian',
  'U.S. Taxpayers Party': 'us_taxpayers',
  'Natural Law Party': 'natural_law',
  'Working Class Party': 'working_class',
}
const partyOf = (label) => PARTY[label.replace(/\s*\(I\)\s*$/, '').trim()] ?? null
const shortParty = (label) => label.replace(/\s*\(I\)\s*$/, '').replace(/ Party$/, '').trim()

/* ---------- run ---------- */

const [GEN, PRI] = await Promise.all([listing('GEN'), listing('PRI')])
console.log(`${APPLY ? '--- APPLYING ---' : '--- DRY RUN (pass --apply to write) ---'}`)
console.log(`official listings: ${GEN.length} general, ${PRI.length} primary entries\n`)

const { data: elections } = await sb.from('elections').select('id').ilike('name', 'Michigan%')
const { data: races } = await sb.from('races').select('id, name, chamber, district, incumbent_id').in('election_id', elections.map((e) => e.id))
const { data: cands } = await sb.from('candidates').select('*').in('race_id', races.map((r) => r.id))
const { data: miPols } = await sb.from('politicians').select('id, name').eq('state', 'MI')

const plan = { verify: [], lose: [], withdraw: [], remove: [], insert: [], skippedParty: [], uncovered: [] }
const seen = new Map()

for (const race of races) {
  const office = officeFor(race)
  if (!office) { plan.uncovered.push(race.name); continue }
  const key = `${race.chamber}:${race.district ?? ''}`
  if (seen.has(key)) {
    console.log(`! duplicate race "${race.name}" (${race.id}) shares a seat with ${seen.get(key)}; left alone`)
    continue
  }
  seen.set(key, race.id)
  const gen = GEN.filter((e) => e.office.startsWith(office + ' '))
  const pri = PRI.filter((e) => e.office.startsWith(office + ' '))
  const inRace = cands.filter((c) => c.race_id === race.id)
  const matchedGen = new Set()

  for (const c of inRace) {
    const g = find(c, gen)
    if (g) {
      matchedGen.add(g)
      plan.verify.push({ c, race, status: 'running', source: `Michigan Dept. of State, Official Candidate Listing, General Election 2026-11-03: ${shortParty(g.party)} nominee, filed ${iso(g.filed)} by ${g.method.toLowerCase()} (fetched ${TODAY})` })
      continue
    }
    const p = find(c, pri)
    if (p && !p.status) {
      plan.lose.push({ c, race, status: 'lost', source: `Michigan Dept. of State, Official Candidate Listing, Primary 2026-08-04: on the ${shortParty(p.party)} primary ballot, not a Nov 3 nominee (fetched ${TODAY})` })
      continue
    }
    if (p) {
      const why = p.status === 'DISQ' ? 'disqualified from' : p.status === 'WITHD' ? 'withdrew from' : `${p.status} on`
      plan.withdraw.push({ c, race, status: 'withdrawn', source: `Michigan Dept. of State, Official Candidate Listing, Primary 2026-08-04: ${why} the ${shortParty(p.party)} primary ballot (fetched ${TODAY})` })
      continue
    }
    if ((c.source ?? '').startsWith('seed') && !c.is_incumbent) {
      plan.remove.push({ c, race })
      continue
    }
    plan.withdraw.push({ c, race, status: 'withdrawn', source: `Not on Michigan's Official Candidate Listing for the 2026-08-04 primary or 2026-11-03 general (fetched ${TODAY})` })
  }

  for (const g of gen) {
    if (matchedGen.has(g)) continue
    const party = partyOf(g.party)
    if (!party) { plan.skippedParty.push({ race, g }); continue }
    const name = displayName(g.name)
    const pol = miPols.filter((x) => parts(x.name, false).last === parts(g.name, true).last && parts(x.name, false).first === parts(g.name, true).first)
    const politician_id = pol.length === 1 ? pol[0].id : null
    plan.insert.push({
      race,
      row: {
        race_id: race.id, politician_id, name, party,
        is_incumbent: !!politician_id && politician_id === race.incumbent_id,
        status: 'running', is_verified: true,
        source: `Michigan Dept. of State, Official Candidate Listing, General Election 2026-11-03: ${shortParty(g.party)} nominee, filed ${iso(g.filed)} by ${g.method.toLowerCase()} (fetched ${TODAY})`,
      },
    })
  }
}

const line = (x) => `   ${x.race.name.padEnd(36)} ${x.c.name}${x.c.status !== x.status ? `  (${x.c.status} -> ${x.status})` : ''}`
console.log(`NOMINEES confirmed (running, verified): ${plan.verify.length}`); plan.verify.forEach((x) => console.log(line(x)))
console.log(`\nLOST the Aug 4 primary: ${plan.lose.length}`); plan.lose.forEach((x) => console.log(line(x)))
console.log(`\nNOT ON THE BALLOT (withdrawn): ${plan.withdraw.length}`); plan.withdraw.forEach((x) => console.log(line(x) + `\n      ${x.source}`))
console.log(`\nSEED-INVENTED, on neither listing (delete): ${plan.remove.length}`); plan.remove.forEach((x) => console.log(`   ${x.race.name.padEnd(36)} ${x.c.name}  [${x.c.source}]`))
console.log(`\nNOMINEES Poli lacks (insert): ${plan.insert.length}`); plan.insert.forEach((x) => console.log(`   ${x.race.name.padEnd(36)} ${x.row.name} (${x.row.party})${x.row.politician_id ? ' linked' : ''}`))
console.log(`\nNOMINEES whose party party_type cannot hold (not inserted): ${plan.skippedParty.length}`)
const byParty = plan.skippedParty.reduce((a, x) => ((a[shortParty(x.g.party)] = (a[shortParty(x.g.party)] ?? 0) + 1), a), {})
console.log(`   ${JSON.stringify(byParty)}`)
console.log(`\nRaces the state listing does not cover: ${plan.uncovered.join(', ') || 'none'}`)

if (!APPLY) { console.log('\nDry run complete — no writes.'); process.exit(0) }

const removedIds = plan.remove.map((x) => x.c.id)
const { data: removedIssues } = removedIds.length
  ? await sb.from('candidate_issues').select('*').in('candidate_id', removedIds)
  : { data: [] }
const backup = `michigan-candidates-backup-${TODAY}.json`
writeFileSync(backup, JSON.stringify({ candidates: cands, candidate_issues: removedIssues ?? [] }, null, 1))
console.log(`\nbacked up ${cands.length} Michigan candidate rows (+${removedIssues?.length ?? 0} candidate_issues) to ${backup}`)

const now = new Date().toISOString()
let ok = 0, failed = 0
for (const x of [...plan.verify, ...plan.lose, ...plan.withdraw]) {
  const { error } = await sb.from('candidates').update({ status: x.status, is_verified: true, last_checked: now, source: x.source }).eq('id', x.c.id)
  if (error) { failed++; console.log(`   ! ${x.c.name}: ${error.message}`) } else ok++
}
for (const x of plan.remove) {
  await sb.from('candidate_issues').delete().eq('candidate_id', x.c.id)
  const { error } = await sb.from('candidates').delete().eq('id', x.c.id).like('source', 'seed%')
  if (error) { failed++; console.log(`   ! delete ${x.c.name}: ${error.message}`) } else ok++
}
if (plan.insert.length) {
  const { error } = await sb.from('candidates').insert(plan.insert.map((x) => ({ ...x.row, last_checked: now })))
  if (error) { failed++; console.log(`   ! insert: ${error.message}`) } else ok += plan.insert.length
}
console.log(`\n=> ${ok} written, ${failed} failed`)
