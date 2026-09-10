/**
 * Delete the fabricated `election_results` rows.
 *
 * CLAUDE.md already listed these 271 rows as suspect (270 won / 1 lost with
 * every vote total populated). Probing them settles it -- this is invented
 * data, not merely unverified:
 *
 *   - 269 of 271 total_votes are exact multiples of 1000 (288,000; 700,000;
 *     2,900,000; 11,400,000). Real returns land on a round thousand about one
 *     time in a thousand, not 99.3% of the time.
 *   - `source` is NULL on all 271, so nothing is auditable.
 *   - 20 rows name the opponent "Various", which is not a person.
 *   - One row's `result` contradicts its own vote percentages.
 *   - A 2024 FL presidential row carries 77,303,000 total votes against Kamala
 *     Harris at 48.4% -- national popular-vote figures pasted onto a state row.
 *
 * These render on politician profiles (ElectionTimeline) and on /compare, so
 * they are voter-facing claims about real named people losing real elections.
 * CLAUDE.md rule 4: missing data beats invented data. Both consumers already
 * handle the empty case -- the profile hides its Elections tab entirely
 * (profile-tabs.tsx:178) and compare renders "No election history on record".
 *
 * Writes a timestamped JSON backup before deleting, so this is recoverable if
 * any subset later turns out to be real and sourceable.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/purge-fabricated-election-results.mjs           # dry run
 *   node scripts/purge-fabricated-election-results.mjs --apply   # writes
 */
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'

const APPLY = process.argv.includes('--apply')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const PAGE = 1000
const rows = []
for (let from = 0; ; from += PAGE) {
  const { data, error } = await sb.from('election_results').select('*').range(from, from + PAGE - 1)
  if (error) throw new Error(error.message)
  rows.push(...data)
  if (data.length < PAGE) break
}

// A row is kept only if it cites a source. Nothing currently does, but this
// keeps the script safe to re-run after a real import lands.
const sourced = rows.filter((r) => r.source && String(r.source).trim())
const targets = rows.filter((r) => !(r.source && String(r.source).trim()))

const roundThousand = targets.filter((r) => Number(r.total_votes) % 1000 === 0).length

console.log(`\n${APPLY ? '*** APPLYING ***' : '--- DRY RUN (pass --apply to write) ---'}\n`)
console.log(`election_results rows       ${rows.length}`)
console.log(`  sourced (keep)            ${sourced.length}`)
console.log(`  unsourced (delete)        ${targets.length}`)
console.log(`  ...of those, total_votes a round thousand: ${roundThousand} (${(roundThousand / Math.max(targets.length, 1) * 100).toFixed(1)}%)`)

const affected = new Set(targets.map((r) => r.politician_id))
console.log(`  politician profiles losing their Elections tab: ${affected.size}`)

if (!targets.length) {
  console.log('\nnothing to do')
  process.exit(0)
}

if (APPLY) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backup = `election-results-backup-${stamp}.json`
  writeFileSync(backup, JSON.stringify(targets, null, 2))
  console.log(`\nbacked up ${targets.length} rows -> ${backup}`)

  let deleted = 0
  const BATCH = 200
  for (let i = 0; i < targets.length; i += BATCH) {
    const ids = targets.slice(i, i + BATCH).map((r) => r.id)
    const { error } = await sb.from('election_results').delete().in('id', ids)
    if (error) console.log(`  ! batch ${i / BATCH}: ${error.message}`)
    else deleted += ids.length
  }
  console.log(`=> deleted ${deleted}`)
}
