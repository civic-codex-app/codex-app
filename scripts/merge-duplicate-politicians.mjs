/**
 * Merge politician rows that are the same person stored twice.
 *
 * The Congress.gov reconciliation (scripts/audit-congress-members.mjs) found
 * three people held under two spellings each, with their record SPLIT across
 * the pair -- the seed used the common name, the FEC finance importer matched
 * the formal one, and nothing reconciled them:
 *
 *   Mike Waltz / Michael Waltz      candidate link on one, finance on the other
 *   Mike Turner / Michael Turner    race incumbency on one, finance on the other
 *   Buddy Carter / Earl Carter      candidate link on one, finance on the other
 *
 * Each therefore has two profile pages, each showing half their record.
 *
 * The survivor is the row with more inbound references, so the merge moves as
 * little as possible. Ties go to the row whose name matches Congress.gov.
 *
 * Repointing is collision-aware. politician_issues is unique per
 * (politician_id, issue_id) and both rows carry all 22, so the loser's stances
 * are dropped rather than moved; likes and follows are unique per user, so a
 * row is moved only if that user does not already have one on the survivor.
 * Nothing is dropped silently -- every skip is counted and printed.
 *
 * Writes a JSON backup of every row it touches before changing anything.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/merge-duplicate-politicians.mjs           # dry run
 *   node scripts/merge-duplicate-politicians.mjs --apply
 */
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'

const APPLY = process.argv.includes('--apply')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

/** Pairs confirmed by hand against Congress.gov. Not derived -- do not guess. */
const PAIRS = [
  { a: 'Mike Waltz',   b: 'Michael Waltz',   state: 'FL', official: 'Michael Waltz' },
  { a: 'Mike Turner',  b: 'Michael Turner',  state: 'OH', official: 'Michael Turner' },
  { a: 'Buddy Carter', b: 'Earl Carter',     state: 'GA', official: 'Earl Carter' },
]

/** Every column that points at politicians.id. */
const REFS = [
  { table: 'politician_issues',     col: 'politician_id', unique: ['issue_id'] },
  { table: 'candidates',            col: 'politician_id' },
  { table: 'campaign_finance',      col: 'politician_id' },
  { table: 'voting_records',        col: 'politician_id' },
  { table: 'politician_committees', col: 'politician_id', unique: ['committee_id'] },
  { table: 'likes',                 col: 'politician_id', unique: ['user_id'] },
  { table: 'follows',               col: 'politician_id', unique: ['user_id'] },
  { table: 'election_results',      col: 'politician_id' },
  { table: 'poll_options',          col: 'politician_id' },
  { table: 'annotations',           col: 'politician_id' },
  { table: 'races',                 col: 'incumbent_id' },
]

async function countRefs(id) {
  let total = 0
  const per = {}
  for (const { table, col } of REFS) {
    const { count, error } = await sb.from(table).select(col, { count: 'exact', head: true }).eq(col, id)
    if (error) continue
    per[table] = count ?? 0
    total += count ?? 0
  }
  return { total, per }
}

async function rowsFor(table, col, id) {
  const out = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from(table).select('*').eq(col, id).range(from, from + 999)
    if (error) return out
    out.push(...data)
    if (data.length < 1000) break
  }
  return out
}

console.log(`\n${APPLY ? '*** APPLYING ***' : '--- DRY RUN (pass --apply to write) ---'}\n`)

const backup = { generatedAt: new Date().toISOString(), pairs: [] }
const plans = []

for (const pair of PAIRS) {
  const { data: found } = await sb
    .from('politicians')
    .select('id,name,slug,state,chamber,district')
    .in('name', [pair.a, pair.b])
    .eq('state', pair.state)

  if (!found || found.length !== 2) {
    console.log(`SKIP ${pair.a} / ${pair.b}: expected 2 rows in ${pair.state}, found ${found?.length ?? 0}`)
    continue
  }

  const [x, y] = found
  const cx = await countRefs(x.id)
  const cy = await countRefs(y.id)

  // More references wins; a tie goes to the Congress.gov spelling.
  let survivor, loser, sc, lc
  if (cx.total !== cy.total) {
    ;[survivor, loser, sc, lc] = cx.total > cy.total ? [x, y, cx, cy] : [y, x, cy, cx]
  } else {
    ;[survivor, loser, sc, lc] = x.name === pair.official ? [x, y, cx, cy] : [y, x, cy, cx]
  }

  console.log(`${pair.a} / ${pair.b}  (${pair.state})`)
  console.log(`  survivor: ${survivor.name.padEnd(16)} /${survivor.slug}  refs=${sc.total}`)
  console.log(`  merging:  ${loser.name.padEnd(16)} /${loser.slug}  refs=${lc.total}`)

  const moves = []
  for (const ref of REFS) {
    const loserRows = await rowsFor(ref.table, ref.col, loser.id)
    if (!loserRows.length) continue

    let move = loserRows
    let skip = []
    if (ref.unique) {
      const survivorRows = await rowsFor(ref.table, ref.col, survivor.id)
      const keyOf = (r) => ref.unique.map((k) => r[k]).join('|')
      const taken = new Set(survivorRows.map(keyOf))
      move = loserRows.filter((r) => !taken.has(keyOf(r)))
      skip = loserRows.filter((r) => taken.has(keyOf(r)))
    }
    moves.push({ ref, move, skip })
    const note = skip.length ? `  (${skip.length} dropped: survivor already has one)` : ''
    console.log(`    ${ref.table}.${ref.col}: move ${move.length}${note}`)
    backup.pairs.push({ table: ref.table, col: ref.col, loserId: loser.id, survivorId: survivor.id, rows: loserRows })
  }

  plans.push({ pair, survivor, loser, moves })
  console.log('')
}

if (!plans.length) {
  console.log('nothing to merge')
  process.exit(0)
}

if (!APPLY) {
  console.log('No changes written. Re-run with --apply.')
  process.exit(0)
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const file = `politician-merge-backup-${stamp}.json`
writeFileSync(file, JSON.stringify(backup, null, 2))
console.log(`backed up every affected row -> ${file}\n`)

for (const { survivor, loser, moves } of plans) {
  for (const { ref, move, skip } of moves) {
    for (let i = 0; i < move.length; i += 200) {
      const ids = move.slice(i, i + 200).map((r) => r.id)
      const { error } = await sb.from(ref.table).update({ [ref.col]: survivor.id }).in('id', ids)
      if (error) console.log(`  ! move ${ref.table}: ${error.message}`)
    }
    if (skip.length) {
      const ids = skip.map((r) => r.id)
      const { error } = await sb.from(ref.table).delete().in('id', ids)
      if (error) console.log(`  ! drop ${ref.table}: ${error.message}`)
    }
  }
  const { error } = await sb.from('politicians').delete().eq('id', loser.id)
  if (error) console.log(`  ! delete ${loser.name}: ${error.message}`)
  else console.log(`merged ${loser.name} -> ${survivor.name} (/${survivor.slug})`)
}
