/**
 * De-stale pass for the 2026 cycle.
 *
 * Only makes changes that are DERIVABLE from data already in the database.
 * It never invents candidates, results, or finance figures — those require an
 * authoritative external source (FEC / Congress.gov / state SoS).
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/destale-2026.mjs           # dry run, prints counts
 *   node scripts/destale-2026.mjs --apply   # writes
 */
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const POLL_END = '2026-12-31T23:59:59Z'

async function page(table, cols, tweak = (q) => q) {
  const PAGE = 1000
  let from = 0
  const out = []
  for (;;) {
    const { data, error } = await tweak(sb.from(table).select(cols)).range(from, from + PAGE - 1)
    if (error) throw new Error(`${table}: ${error.message}`)
    out.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }
  return out
}

const norm = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\b(jr|sr|ii|iii|iv|dr|mr|mrs|ms|rep|sen|gov)\b\.?/g, '')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const lastName = (s) => norm(s).split(' ').filter(Boolean).pop() || ''

console.log(`\n${APPLY ? '*** APPLYING ***' : '--- DRY RUN (pass --apply to write) ---'}\n`)

/* ---------- 1. expired polls still flagged active ---------- */
const polls = await page('polls', 'id,title,status,ends_at')
const NOW = new Date().toISOString()
const expired = polls.filter((p) => p.status === 'active' && p.ends_at && p.ends_at < NOW)
console.log(`1. POLLS active-but-expired: ${expired.length}`)
for (const p of expired) console.log(`   - "${p.title}" ended ${p.ends_at.slice(0, 10)} -> extend to ${POLL_END.slice(0, 10)}`)
if (APPLY && expired.length) {
  for (const p of expired) {
    const { error } = await sb.from('polls').update({ ends_at: POLL_END }).eq('id', p.id)
    if (error) console.log(`   ! ${p.id}: ${error.message}`)
  }
  console.log(`   => extended ${expired.length}`)
}

/* ---------- 2. candidate.status value drift ----------
 * Canonical vocabulary is ('running','withdrawn','won','lost') per
 * lib/validations/admin.ts + components/admin/candidate-form.tsx.
 * 'active' is in neither, so it broke STATUS_CONFIG lookups, failed
 * candidateSchema on admin save, and matched no <option> in the form. */
const CANONICAL_STATUS = ['running', 'withdrawn', 'won', 'lost']
const cands = await page('candidates', 'id,race_id,politician_id,name,party,status,is_incumbent')
const drift = cands.filter((c) => !CANONICAL_STATUS.includes(c.status))
console.log(`\n2. CANDIDATES with off-vocabulary status: ${drift.length}`)
console.log(`   ${JSON.stringify(drift.reduce((a, c) => ((a[c.status] = (a[c.status] || 0) + 1), a), {}))} -> 'running'`)
if (APPLY && drift.length) {
  const { error } = await sb.from('candidates').update({ status: 'running' }).eq('status', 'active')
  console.log(error ? `   ! ${error.message}` : `   => normalized ${drift.length}`)
}

/* ---------- 2b. incumbents who are not seeking reelection ----------
 * Hand-verified against public retirement announcements, all of which predate
 * the 2026-03-21 seed. The seed generated a candidate row for every incumbent
 * regardless, so these five appear as active candidates in their own open-seat
 * races. NOT AN EXHAUSTIVE LIST -- it only covers retirements confirmed by hand.
 * Anything announced after mid-2026 still needs an authoritative source. */
const NOT_SEEKING_REELECTION = [
  { name: 'Mitch McConnell', state: 'KY', announced: '2025-02-20' },
  { name: 'Dick Durbin', state: 'IL', announced: '2025-04-23' },
  { name: 'Tina Smith', state: 'MN', announced: '2025-02-13' },
  { name: 'Gary Peters', state: 'MI', announced: '2025-01-28' },
  { name: 'Jeanne Shaheen', state: 'NH', announced: '2025-03-12' },
]
const retiring = cands.filter(
  (c) => c.status !== 'withdrawn' && NOT_SEEKING_REELECTION.some((r) => norm(r.name) === norm(c.name))
)
console.log(`\n2b. INCUMBENTS listed as running but retiring: ${retiring.length} -> 'withdrawn'`)
for (const c of retiring) {
  const r = NOT_SEEKING_REELECTION.find((x) => norm(x.name) === norm(c.name))
  console.log(`   - ${c.name} (${r.state}) retirement announced ${r.announced}`)
}
if (APPLY && retiring.length) {
  let ok = 0
  for (const c of retiring) {
    const { error } = await sb.from('candidates').update({ status: 'withdrawn' }).eq('id', c.id)
    if (error) console.log(`   ! ${c.name}: ${error.message}`)
    else ok++
  }
  console.log(`   => marked ${ok} withdrawn`)
}

/* ---------- 2c. stamp verification provenance (needs migration 024) ---------- */
const { error: colErr } = await sb.from('candidates').select('is_verified').limit(1)
if (colErr) {
  console.log(`\n2c. VERIFICATION columns absent — run supabase/024_candidate_verification.sql, then re-run.`)
} else {
  // Stamp everything on the hand-verified list, not just rows that still need changing —
  // the five retirements stay verified across re-runs once already withdrawn.
  const handVerified = cands.filter((c) =>
    NOT_SEEKING_REELECTION.some((r) => norm(r.name) === norm(c.name))
  )
  console.log(`\n2c. VERIFICATION stamp: ${handVerified.length} hand-verified, rest left is_verified=false`)
  if (APPLY && handVerified.length) {
    const now = new Date().toISOString()
    let ok = 0
    for (const c of handVerified) {
      const { error } = await sb
        .from('candidates')
        .update({ is_verified: true, last_checked: now })
        .eq('id', c.id)
      if (error) console.log(`   ! ${c.name}: ${error.message}`)
      else ok++
    }
    console.log(`   => stamped ${ok} as verified`)
  }
}

/* ---------- 3. races missing incumbent_id (derivable join) ---------- */
const pols = await page('politicians', 'id,name,state,chamber,district,party,title')
const races = await page('races', 'id,name,state,chamber,district,description,incumbent_id')
const missing = races.filter((r) => !r.incumbent_id)

// index politicians by state|chamber|district and state|chamber
const byExact = new Map()
const byStateChamber = new Map()
for (const p of pols) {
  if (!p.state) continue
  const sc = `${p.state}|${p.chamber}`
  if (!byStateChamber.has(sc)) byStateChamber.set(sc, [])
  byStateChamber.get(sc).push(p)
  if (p.district != null && p.district !== '') {
    const k = `${sc}|${String(p.district).replace(/^0+/, '')}`
    if (!byExact.has(k)) byExact.set(k, [])
    byExact.get(k).push(p)
  }
}

const DISTRICTED = new Set(['house', 'state_house', 'state_senate'])
const PLACE_OFFICES = new Set(['mayor', 'county', 'school_board', 'city_council'])
const matches = []
const ambiguous = []
const nomatch = []

for (const r of missing) {
  let cands2 = null
  let how = ''

  if (DISTRICTED.has(r.chamber) && r.district != null && r.district !== '') {
    const k = `${r.state}|${r.chamber}|${String(r.district).replace(/^0+/, '')}`
    cands2 = byExact.get(k) || []
    how = 'state+chamber+district'
  }

  // fall back to an incumbent named in the description, verified against the table
  if ((!cands2 || cands2.length !== 1) && /incumbent/i.test(r.description || '')) {
    const m = (r.description || '').match(/incumbent\s+([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){0,3})/i)
    if (m) {
      const want = norm(m[1])
      const pool = byStateChamber.get(`${r.state}|${r.chamber}`) || []
      const hit = pool.filter((p) => norm(p.name) === want || lastName(p.name) === lastName(want))
      if (hit.length === 1) {
        cands2 = hit
        how = 'description-named + verified'
      }
    }
  }

  // At-large House seats are encoded three different ways. Races store "AL";
  // politicians store "1" in DE, ND, VT and AK but "0" in WY and SD; and
  // Congress.gov reports null. So the (state, chamber, district) join above
  // never matched a single-member state, leaving six races incumbent-less for
  // no reason other than spelling. If the state holds exactly one House member
  // there is nothing to disambiguate.
  if ((!cands2 || cands2.length !== 1) && r.chamber === 'house' && /^(al|0|1)$/i.test(String(r.district ?? '').trim())) {
    const pool = byStateChamber.get(`${r.state}|house`) || []
    if (pool.length === 1) {
      cands2 = pool
      how = 'at-large, sole House member for the state'
    }
  }

  // Local offices carry no district, and a state holds many of them, so
  // (state, chamber) is not a derivation -- it resolves uniquely only because
  // the table happens to hold one mayor per state, which would silently point
  // "Chicago Mayor" at whichever Illinois mayor we stored. Match the place
  // instead: the race name minus its office word, found in the officeholder's
  // title. "Chicago Mayor" -> "chicago" -> "Mayor of Chicago".
  if ((!cands2 || cands2.length !== 1) && PLACE_OFFICES.has(r.chamber)) {
    const place = norm(r.name)
      .replace(/\b(mayoral|mayor|county executive|county|school board|city council|district|election|race)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    // A place match alone is not enough. "Miami-Dade County Mayor" matched
    // the State Attorney for Miami-Dade County -- right place, wrong office --
    // so the title has to name the office too.
    const OFFICE_WORD = {
      mayor: /\bmayor\b/,
      county: /\bcounty (executive|commissioner|judge|mayor)\b/,
      school_board: /\bschool board\b/,
      city_council: /\bcity council|\bcouncil ?(member|man|woman)\b/,
    }[r.chamber]

    // And a race for a numbered seat ("School Board District 3") cannot be
    // derived from a board-wide title: the chair is not necessarily the member
    // for that district.
    const seatSpecific = /\bdistrict\s*\d+\b|\bward\s*\d+\b|\bseat\s*\d+\b/i.test(r.name)

    // Compare places for EQUALITY, not containment: "Las Vegas" is a substring
    // of "North Las Vegas", and those are different cities with different
    // mayors. Strip the office words off both sides and require a full match.
    if (place.length >= 4 && OFFICE_WORD && !seatSpecific) {
      const pool = byStateChamber.get(`${r.state}|${r.chamber}`) || []
      const hit = pool.filter((p) => {
        if (!p.title || !OFFICE_WORD.test(norm(p.title))) return false
        const titlePlace = norm(p.title)
          .replace(/\b(mayoral|mayor|county executive|county commissioner|county judge|county mayor|county|school board|city council|councilmember|councilman|councilwoman|president|chair|of|the)\b/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        return titlePlace === place
      })
      if (hit.length === 1) {
        cands2 = hit
        how = 'place + office in title'
      }
    }
  }

  if (cands2 && cands2.length === 1) matches.push({ race: r, pol: cands2[0], how })
  else if (cands2 && cands2.length > 1) ambiguous.push({ race: r, n: cands2.length })
  else nomatch.push(r)
}

console.log(`\n3. RACES missing incumbent_id: ${missing.length}`)
console.log(`   unique match (safe to set): ${matches.length}`)
const byHow = matches.reduce((a, m) => ((a[m.how] = (a[m.how] || 0) + 1), a), {})
console.log(`     by method: ${JSON.stringify(byHow)}`)
const byCham = matches.reduce((a, m) => ((a[m.race.chamber] = (a[m.race.chamber] || 0) + 1), a), {})
console.log(`     by chamber: ${JSON.stringify(byCham)}`)
console.log(`   ambiguous (left alone): ${ambiguous.length}`)
console.log(`   no match (left alone): ${nomatch.length}`)
console.log(
  `     no-match by chamber: ${JSON.stringify(
    nomatch.reduce((a, r) => ((a[r.chamber] = (a[r.chamber] || 0) + 1), a), {})
  )}`
)
for (const m of matches.slice(0, 8)) console.log(`     e.g. ${m.race.name} -> ${m.pol.name} (${m.pol.party}) [${m.how}]`)

if (APPLY && matches.length) {
  let ok = 0
  for (const m of matches) {
    const { error } = await sb.from('races').update({ incumbent_id: m.pol.id }).eq('id', m.race.id)
    if (error) console.log(`   ! ${m.race.name}: ${error.message}`)
    else ok++
  }
  console.log(`   => set incumbent_id on ${ok} races`)
}

/* ---------- 4. candidates not linked to a politician record ---------- */
const raceById = new Map(races.map((r) => [r.id, r]))
const unlinked = cands.filter((c) => !c.politician_id)
const cMatches = []
const cAmb = []
let cNo = 0

for (const c of unlinked) {
  const r = raceById.get(c.race_id)
  if (!r) { cNo++; continue }
  const pool = byStateChamber.get(`${r.state}|${r.chamber}`) || []
  const want = norm(c.name)
  let hit = pool.filter((p) => norm(p.name) === want)
  if (hit.length !== 1) {
    const wl = lastName(c.name)
    hit = pool.filter((p) => lastName(p.name) === wl && (!c.party || !p.party || p.party === c.party))
  }
  if (hit.length === 1) cMatches.push({ c, pol: hit[0], race: r })
  else if (hit.length > 1) cAmb.push(c)
  else cNo++
}

console.log(`\n4. CANDIDATES unlinked to politician_id: ${unlinked.length}`)
console.log(`   unique match (safe to link): ${cMatches.length}`)
console.log(`   ambiguous (left alone): ${cAmb.length}`)
console.log(`   no match (left alone): ${cNo}`)
for (const m of cMatches.slice(0, 8)) console.log(`     e.g. ${m.c.name} [${m.race.state} ${m.race.chamber}] -> ${m.pol.name}`)

if (APPLY && cMatches.length) {
  let ok = 0
  for (const m of cMatches) {
    const { error } = await sb.from('candidates').update({ politician_id: m.pol.id }).eq('id', m.c.id)
    if (error) console.log(`   ! ${m.c.name}: ${error.message}`)
    else ok++
  }
  console.log(`   => linked ${ok} candidates`)
}

/* ---------- 5. report-only: things needing an external source ---------- */
const withCands = new Set(cands.map((c) => c.race_id))
const emptyRaces = races.filter((r) => !withCands.has(r.id))
const fin = await page('campaign_finance', 'id,cycle')
console.log(`\n5. NEEDS AN AUTHORITATIVE SOURCE (not touched):`)
console.log(`   races with zero candidates: ${emptyRaces.length}`)
console.log(
  `     by chamber: ${JSON.stringify(
    emptyRaces.reduce((a, r) => ((a[r.chamber] = (a[r.chamber] || 0) + 1), a), {})
  )}`
)
console.log(`   campaign_finance rows for 2026 cycle: ${fin.filter((f) => f.cycle === '2026').length} (of ${fin.length} total)`)
console.log(`   -> 2026 primary outcomes cannot be verified from local data.`)
console.log(`\n${APPLY ? 'Done (applied).' : 'Dry run complete — no writes.'}\n`)
