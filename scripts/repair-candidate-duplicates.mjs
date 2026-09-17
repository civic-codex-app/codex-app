/**
 * Undo the duplicate candidate rows created by the 2026-09-16 FEC import.
 *
 * That import matched existing rows by normalised name. FEC ships
 * "MARKEY, EDWARD SEN." and the seed held "Ed Markey"; those do not normalise
 * to the same string, so a second row was inserted for a person already
 * present. Result: 125 races listing the same candidate twice, and 235 races
 * showing more than one incumbent -- more incumbents than there are seats.
 * Eight stored names also carry a leaked office honorific ("Thom R Sen
 * Tillis"), because SEN/REP/GOV were missing from the honorific list.
 *
 * Two deletions, then a clean re-import:
 *
 * 1. Unverified seed rows in FEDERAL races (senate/house/presidential). Every
 *    one sits in a race where FEC has now supplied an authoritative roster --
 *    none is alone in its race, checked before writing this. Such a row is
 *    either a spelling variant of somebody FEC lists, or someone the seed
 *    assumed would run who never filed. CLAUDE.md rule 1 says use FEC or leave
 *    the row absent, and rule 4 says missing beats invented. Seed rows in
 *    non-federal races are KEPT: FEC covers no state or local office, because
 *    those candidates file with state agencies.
 *
 * 2. Rows the import itself inserted, identified by source = FEC with no
 *    politician_id. Re-importing is free -- responses are cached in
 *    .fec-cache/ -- and rebuilding is the only way to fix the eight mangled
 *    names, since stamping updates verification but never the name.
 *
 * Rows the import STAMPED rather than inserted (source = FEC and politician_id
 * present) are left alone. Those are original seed rows that FEC confirmed,
 * and they carry the candidate -> politician link, which is worth keeping.
 *
 * Writes a JSON backup of every deleted row first.
 *
 * Run AFTER 030_candidate_fec_id.sql, then re-run import-fec-candidates.mjs
 * --apply, which now keys on the FEC candidate id and is idempotent.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/repair-candidate-duplicates.mjs           # dry run
 *   node scripts/repair-candidate-duplicates.mjs --apply
 */
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'node:fs'

const APPLY = process.argv.includes('--apply')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const FEDERAL = new Set(['senate', 'house', 'presidential'])

async function pageAll(table, cols) {
  const out = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from(table).select(cols).range(from, from + 999)
    if (error) throw new Error(`${table}: ${error.message}`)
    out.push(...data)
    if (data.length < 1000) break
  }
  return out
}

const races = await pageAll('races', 'id,chamber')
const chamberOf = new Map(races.map((r) => [r.id, r.chamber]))
const candidates = await pageAll('candidates', '*')

const isFec = (c) => (c.source || '').startsWith('FEC API')
const isFederal = (c) => FEDERAL.has(chamberOf.get(c.race_id))

const seedInFederal = candidates.filter((c) => isFederal(c) && !isFec(c))
const importInserted = candidates.filter((c) => isFec(c) && !c.politician_id)
const importStamped = candidates.filter((c) => isFec(c) && c.politician_id)
const seedNonFederal = candidates.filter((c) => !isFederal(c) && !isFec(c))

console.log(`\n${APPLY ? '*** APPLYING ***' : '--- DRY RUN (pass --apply to write) ---'}\n`)
console.log(`candidates total                       ${candidates.length}`)
console.log(`  seed rows in federal races           ${seedInFederal.length}   -> delete (FEC is authoritative there)`)
console.log(`  rows this import inserted            ${importInserted.length}   -> delete, then re-import cleanly`)
console.log(`  rows this import stamped             ${importStamped.length}   -> keep (carry the politician link)`)
console.log(`  seed rows in non-federal races       ${seedNonFederal.length}   -> keep (FEC cannot cover these)`)

// Safety: a federal seed row alone in its race would mean deleting the only
// candidate that race has. Verified as zero when this was written; re-check.
const byRace = new Map()
for (const c of candidates) {
  if (!byRace.has(c.race_id)) byRace.set(c.race_id, [])
  byRace.get(c.race_id).push(c)
}
const orphaned = seedInFederal.filter((c) => !(byRace.get(c.race_id) ?? []).some(isFec))
if (orphaned.length) {
  console.log(`\nREFUSING: ${orphaned.length} federal seed row(s) are the only candidate in their race.`)
  console.log('Deleting them would empty those races. Investigate before re-running.')
  process.exit(1)
}

const doomed = [...seedInFederal, ...importInserted]
console.log(`\ntotal rows to delete: ${doomed.length}`)
const incBefore = candidates.filter((c) => c.is_incumbent).length
console.log(`incumbent-flagged rows: ${incBefore} -> ${candidates.filter((c) => c.is_incumbent).length - doomed.filter((c) => c.is_incumbent).length} after deletion, before re-import`)

if (!APPLY) {
  console.log('\nsample of seed rows in federal races that would go:')
  for (const c of seedInFederal.slice(0, 6)) console.log(`  ${c.name}`)
  console.log('\nNothing written. Re-run with --apply, then:')
  console.log('  node scripts/import-fec-candidates.mjs --apply')
  process.exit(0)
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const backup = `candidate-repair-backup-${stamp}.json`
writeFileSync(backup, JSON.stringify({ seedInFederal, importInserted }, null, 2))
console.log(`\nbacked up ${doomed.length} rows -> ${backup}`)

let deleted = 0
for (let i = 0; i < doomed.length; i += 200) {
  const ids = doomed.slice(i, i + 200).map((c) => c.id)
  const { error } = await sb.from('candidates').delete().in('id', ids)
  if (error) console.log(`  ! batch ${i / 200}: ${error.message}`)
  else deleted += ids.length
}
console.log(`=> deleted ${deleted}`)
console.log('\nNow re-import:  node scripts/import-fec-candidates.mjs --apply')
