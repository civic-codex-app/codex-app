/**
 * Stamp Michigan's reconciled races as ballot-confirmed (migration 032).
 *
 * scripts/reconcile-michigan-candidates.mjs does this itself on every run
 * now. This exists because on the day the columns were added the Bureau of
 * Elections report it reads (mi-boe.entellitrak.com) answered 503, so the
 * stamp for the reconcile that ran that morning (2026-10-09) could not be
 * written by re-running it. Coverage is the reconcile's own rule: U.S.
 * Senate, Governor, and every House, State Senate and State House race with
 * a district, first row per seat. Michigan only, by design: a stamp means
 * "checked against the state's certified listing", and nothing here checks
 * anything, so it must not be pointed at a state that has not been.
 *
 * Each write is conditioned on the column still being NULL. Dry-run by
 * default.
 *
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/stamp-michigan-ballot-confirmed.mjs
 *   node scripts/stamp-michigan-ballot-confirmed.mjs --apply
 */
import { createClient } from '@supabase/supabase-js'
import { has } from './lib/cli.mjs'

const APPLY = has('apply')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const RECONCILED = '2026-10-09'
const SOURCE = `Michigan Dept. of State, Official Candidate Listing, General Election 2026-11-03 (fetched ${RECONCILED})`

const { data: elections } = await sb.from('elections').select('id, name').ilike('name', 'Michigan%')
const { data: races } = await sb
  .from('races')
  .select('id, name, chamber, district, ballot_confirmed_at')
  .in('election_id', elections.map((e) => e.id))
  .order('name')

const covered = (r) =>
  r.chamber === 'senate' || r.chamber === 'governor' || (['house', 'state_senate', 'state_house'].includes(r.chamber) && Number(r.district) > 0)
const seen = new Set()
const todo = [], already = [], skipped = []
for (const r of races) {
  if (!covered(r)) { skipped.push(r); continue }
  const key = `${r.chamber}:${r.district ?? ''}`
  if (seen.has(key)) { skipped.push(r); continue }
  seen.add(key)
  ;(r.ballot_confirmed_at ? already : todo).push(r)
}

console.log(APPLY ? '--- APPLYING ---' : '--- DRY RUN (pass --apply to write) ---')
console.log(`Michigan races: ${races.length} · covered by the listing: ${todo.length + already.length} · already stamped: ${already.length} · not covered or a duplicate seat: ${skipped.length}`)
for (const r of skipped) console.log(`   skip  ${r.name} (${r.chamber}${r.district ? ' ' + r.district : ''})`)
const byChamber = todo.reduce((a, r) => ((a[r.chamber] = (a[r.chamber] ?? 0) + 1), a), {})
console.log(`to stamp: ${todo.length} ${JSON.stringify(byChamber)}`)
if (!APPLY) process.exit(0)

const now = new Date().toISOString()
let ok = 0, failed = 0
for (const r of todo) {
  const { error } = await sb
    .from('races')
    .update({ ballot_confirmed_source: SOURCE, ballot_confirmed_at: now })
    .eq('id', r.id)
    .is('ballot_confirmed_at', null)
  if (error) { failed++; console.log(`   ! ${r.name}: ${error.message}`) } else ok++
}
console.log(`=> ${ok} stamped, ${failed} failed`)
