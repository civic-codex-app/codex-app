/**
 * Probe, as an anonymous visitor, which tables accept writes.
 *
 * 013_daily_topics.sql created a policy named "Service role full access" with
 * no TO clause, so it applied to every role and FOR ALL covered INSERT, UPDATE
 * and DELETE. Anyone holding the anon key -- which ships in the client bundle
 * -- could add, edit and remove homepage news. The obvious follow-up is
 * whether the same mistake exists elsewhere. The direct answer lives in
 * pg_policies, but nothing here can execute SQL: no connection string, no
 * psql, no Supabase CLI, and PostgREST exposes neither pg_policies nor an
 * exec_sql RPC. So probe it from outside instead.
 *
 * Method matters. DELETE is useless as a probe: an RLS DELETE policy acts as a
 * row filter, so a delete matching nothing has nothing to reject and returns
 * success whether or not a policy exists. Sweeping with it reported all 24
 * tables as writable, which was an artefact -- deleting a real politician row
 * as anon returns no error and leaves the row in place.
 *
 * INSERT is the reliable signal, because WITH CHECK is evaluated against the
 * row being inserted. The payload for each table is built from a real row so
 * every type is valid, with foreign keys repointed at a nonexistent uuid, so a
 * permitted insert fails on the foreign key rather than on a cast -- a cast
 * error would be raised before RLS is ever consulted and would read as a false
 * negative.
 *
 * If an insert nevertheless succeeds, the row is deleted immediately and the
 * table is reported as writable.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/audit-anon-write-access.mjs
 */
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const pub = createClient(URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const svc = createClient(URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const ZERO = '00000000-0000-0000-0000-000000000000'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const TABLES = [
  'politicians', 'politician_issues', 'bills', 'candidates', 'races', 'elections',
  'daily_topics', 'daily_topic_politicians', 'campaign_finance', 'polls',
  'poll_options', 'poll_votes', 'annotations', 'profiles', 'likes', 'follows',
  'bill_follows', 'issue_follows', 'committees', 'politician_committees',
  'issues', 'stance_history', 'voting_records', 'election_results',
]

/**
 * Minimal payloads for tables with no rows to copy, and for `politicians`,
 * whose `fts` column is generated and rejects any supplied value before RLS is
 * reached. Foreign keys point at a uuid that cannot exist.
 */
const FALLBACK = {
  daily_topic_politicians: { topic_id: ZERO, politician_id: ZERO },
  poll_votes:              { poll_id: ZERO, option_id: ZERO, user_id: ZERO },
  bill_follows:            { bill_id: ZERO, user_id: ZERO },
  stance_history:          { politician_id: ZERO, issue_id: ZERO, stance: 'neutral' },
  voting_records:          { politician_id: ZERO, bill_id: ZERO, vote: 'yea' },
  election_results:        { politician_id: ZERO, election_year: 2026, state: 'XX', chamber: 'senate', race_name: 'probe', party: 'independent', result: 'won' },
}

/** Generated/computed columns that cannot be written at all. */
const UNWRITABLE = new Set(['fts'])

const results = { blocked: [], permitted: [], writable: [], unknown: [] }

for (const table of TABLES) {
  const { data: sample, error: readErr } = await svc.from(table).select('*').limit(1)
  if (readErr) { results.unknown.push([table, readErr.message]); continue }

  let row
  if (sample?.length) {
    // Copy a real row so every column type is valid, then aim the foreign keys
    // at a uuid that cannot exist so the write can only fail, never land.
    row = { ...sample[0] }
    delete row.id
    delete row.created_at
    delete row.updated_at
    for (const k of UNWRITABLE) delete row[k]
    for (const [k, v] of Object.entries(row)) {
      if (k.endsWith('_id') && typeof v === 'string' && UUID.test(v)) row[k] = ZERO
      if (k === 'user_id') row[k] = ZERO
    }
  } else if (FALLBACK[table]) {
    row = { ...FALLBACK[table] }
  } else {
    results.unknown.push([table, 'table is empty and no fallback payload is defined'])
    continue
  }

  const { data: made, error } = await pub.from(table).insert(row).select('id')
  const msg = error?.message ?? ''

  if (!error) {
    // Should be unreachable; clean up at once if it is not.
    const ids = (made ?? []).map((r) => r.id).filter(Boolean)
    if (ids.length) await svc.from(table).delete().in('id', ids)
    results.writable.push([table, `insert succeeded — removed ${ids.length} row(s)`])
  } else if (/row-level security/i.test(msg)) {
    results.blocked.push([table, ''])
  } else if (/foreign key|violates foreign key/i.test(msg)) {
    results.permitted.push([table, 'RLS allowed it; only the foreign key stopped it'])
  } else {
    results.unknown.push([table, msg.slice(0, 80)])
  }
}

const show = (label, rows) => {
  console.log(`\n${label}: ${rows.length}`)
  for (const [t, note] of rows) console.log(`  ${t.padEnd(26)}${note}`)
}

console.log('\nanonymous INSERT probe — nothing is left behind\n' + '='.repeat(52))
show('WRITABLE BY ANON (insert landed)', results.writable)
show('RLS PERMITS WRITES (only a constraint stopped it)', results.permitted)
show('blocked by RLS', results.blocked)
show('inconclusive', results.unknown)

const bad = results.writable.length + results.permitted.length
console.log(`\n${bad ? `${bad} table(s) accept anonymous writes` : 'no table accepts an anonymous write'}`)
process.exit(bad ? 1 : 0)
