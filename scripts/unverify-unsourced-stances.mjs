/**
 * Clear `is_verified` on stance rows that cite no source.
 *
 * CLAUDE.md rule 3: is_verified is true ONLY for rows confirmed against an
 * authoritative source. scripts/generate-stances.mjs violated that -- it
 * hardcodes `is_verified: true` on every row it writes (line 73) and never
 * records a source_url, so model-generated positions were indistinguishable
 * from sourced ones.
 *
 * What this does NOT do is move anyone's match percentage. voter-match.ts
 * weights verified stances 1.0 and estimated ones 0.5, but that multiplier is
 * applied to both the numerator and the denominator of the score, so a flag
 * set uniformly -- all true, as now, or all false, as after this runs --
 * cancels out entirely. See the "uniform verification weight cancels out"
 * test in tests/lib/utils/voter-match.test.ts. The weighting only bites once
 * some rows are genuinely sourced and others are not.
 *
 * So the value here is honesty, not arithmetic: is_verified stops asserting
 * something false, the 0.5x down-weighting becomes meaningful the moment real
 * sourced stances land, and nothing downstream can keep treating model output
 * as confirmed fact.
 *
 * Only ever clears the flag -- never sets it, never touches stance text. A row
 * that genuinely carries a source_url is left alone, so re-running after a
 * real import is safe.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/unverify-unsourced-stances.mjs           # dry run
 *   node scripts/unverify-unsourced-stances.mjs --apply   # writes
 */
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const PAGE = 1000
const TABLES = ['politician_issues', 'candidate_issues']

async function pageAll(table, cols) {
  const out = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb.from(table).select(cols).range(from, from + PAGE - 1)
    if (error) throw new Error(`${table}: ${error.message}`)
    out.push(...data)
    if (data.length < PAGE) break
  }
  return out
}

const hasSource = (r) => Boolean(r.source_url && String(r.source_url).trim())

console.log(`\n${APPLY ? '*** APPLYING ***' : '--- DRY RUN (pass --apply to write) ---'}\n`)

for (const table of TABLES) {
  const rows = await pageAll(table, 'id,is_verified,source_url')
  const targets = rows.filter((r) => r.is_verified === true && !hasSource(r))
  const keep = rows.filter((r) => r.is_verified === true && hasSource(r))

  console.log(`${table}`)
  console.log(`  rows                      ${rows.length}`)
  console.log(`  verified, sourced (keep)  ${keep.length}`)
  console.log(`  verified, unsourced       ${targets.length}  -> is_verified = false`)

  if (!targets.length) {
    console.log('')
    continue
  }

  if (APPLY) {
    // Update by explicit id batches rather than a blanket filter, so a row that
    // gains a source_url mid-run can never be caught by a stale predicate.
    let done = 0
    const BATCH = 500
    for (let i = 0; i < targets.length; i += BATCH) {
      const ids = targets.slice(i, i + BATCH).map((r) => r.id)
      const { error } = await sb.from(table).update({ is_verified: false }).in('id', ids)
      if (error) console.log(`  ! batch ${i / BATCH}: ${error.message}`)
      else done += ids.length
    }
    console.log(`  => cleared ${done}`)
  }
  console.log('')
}
