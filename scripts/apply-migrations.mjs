/**
 * Apply pending SQL migrations over a direct Postgres connection.
 *
 * Migrations are DDL, and DDL does not go through PostgREST — the
 * `sb_secret_*` API keys in .env.local can read and write rows but cannot
 * ALTER TABLE or CREATE POLICY. That is why every migration up to 024 was
 * applied by hand in the Supabase SQL Editor, and why 001-010 and 016-024
 * never made it into this repo. This script closes that gap: give it
 * DATABASE_URL (Supabase dashboard -> Project Settings -> Database) and it can
 * apply migration files directly.
 *
 * Defaults to --validate, which runs everything inside a transaction and rolls
 * back, so you can prove a migration is valid against the real schema without
 * touching it. Pass --apply to commit.
 *
 * Reads .env.local itself rather than requiring `export $(grep ...)`, so the
 * invocation stays a single bare command.
 *
 * Usage:
 *   node scripts/apply-migrations.mjs                       # validate, rollback
 *   node scripts/apply-migrations.mjs --apply               # commit
 *   node scripts/apply-migrations.mjs --only=029,025        # subset, in the order given
 *
 * Ordering: PENDING below is deliberately not numeric. 029 is the security fix
 * (it closes anonymous INSERT/UPDATE/DELETE on the homepage news tables) and
 * runs first. The rest are independent of each other.
 */
import pg from 'pg'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MIGRATIONS = join(ROOT, 'supabase', 'migrations')

/** Security first, then the rest. Anything already applied is a no-op — every file is idempotent. */
const PENDING = [
  '029_fix_daily_topics_rls.sql',
  '025_candidate_source.sql',
  '026_politician_source.sql',
  '027_public_submissions.sql',
  '028_like_counts_view.sql',
]

const APPLY = process.argv.includes('--apply')
const onlyArg = process.argv.find((a) => a.startsWith('--only='))

// Resolve --only against the migrations directory, not just PENDING — a file
// added after PENDING was last edited is exactly the case you want to run in
// isolation, and matching only against PENDING made that impossible.
const onDisk = existsSync(MIGRATIONS) ? readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort() : []
const FILES = onlyArg
  ? onlyArg.split('=')[1].split(',').map((raw) => {
      const t = raw.trim()
      if (t.endsWith('.sql')) return t
      return onDisk.find((f) => f.startsWith(t)) ?? PENDING.find((f) => f.startsWith(t)) ?? t
    })
  : PENDING

function envLocal(key) {
  if (process.env[key]) return process.env[key]
  const f = join(ROOT, '.env.local')
  if (!existsSync(f)) return null
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/)
    if (m && m[1] === key) return m[2].trim()
  }
  return null
}

const url = envLocal('DATABASE_URL')
if (!url) {
  console.error('DATABASE_URL is not set and not in .env.local.')
  console.error('Supabase dashboard -> Project Settings -> Database -> Connection string (URI).')
  process.exit(1)
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
await client.connect()

const policyCount = async () =>
  (await client.query(`SELECT count(*)::int AS n FROM pg_policies WHERE schemaname='public'`)).rows[0].n

/** Policies granting every role full write access — the 013 mistake. */
const worldWritable = async () =>
  (await client.query(`
    SELECT tablename, policyname, roles::text AS roles
      FROM pg_policies
     WHERE schemaname='public' AND cmd='ALL' AND qual='true'
     ORDER BY tablename`)).rows

console.log(`\n${APPLY ? '*** APPLYING (changes will be committed) ***' : '--- VALIDATE ONLY (transaction will roll back) ---'}`)
console.log(`${client.host ?? 'db'} · ${FILES.length} migration(s)\n`)

const beforePolicies = await policyCount()
const beforeWide = await worldWritable()
console.log(`public RLS policies: ${beforePolicies}`)
console.log(`world-writable FOR ALL USING(true) policies: ${beforeWide.length}`)
for (const r of beforeWide) console.log(`  ${r.tablename.padEnd(26)} roles=${r.roles.padEnd(12)} "${r.policyname}"`)

console.log('\nrunning:')
let failed = null
await client.query('BEGIN')
for (const f of FILES) {
  const path = join(MIGRATIONS, f)
  if (!existsSync(path)) { failed = { f, msg: 'file not found' }; console.log(`  MISSING ${f}`); break }
  try {
    await client.query(readFileSync(path, 'utf8'))
    console.log(`  ok      ${f}`)
  } catch (e) {
    failed = { f, msg: e.message }
    console.log(`  ERROR   ${f}\n          ${e.message.slice(0, 220)}`)
    break
  }
}

if (failed) {
  await client.query('ROLLBACK')
  console.log(`\nrolled back — nothing changed. Fix ${failed.f} and re-run.`)
  await client.end()
  process.exit(1)
}

// Report from inside the transaction, so --validate shows the same numbers --apply would.
const afterPolicies = await policyCount()
const afterWide = await worldWritable()
const objs = (await client.query(`
  SELECT
    (SELECT count(*) FROM information_schema.columns WHERE table_name='candidates'  AND column_name='source')      AS cand_source,
    (SELECT count(*) FROM information_schema.columns WHERE table_name='politicians' AND column_name='source')      AS pol_source,
    (SELECT count(*) FROM information_schema.columns WHERE table_name='politicians' AND column_name='is_verified') AS pol_verified,
    (SELECT count(*) FROM information_schema.tables  WHERE table_name='public_submissions')                        AS submissions,
    (SELECT count(*) FROM information_schema.views   WHERE table_name='public_like_counts')                        AS like_view,
    (SELECT count(*) FROM pg_policies WHERE tablename='likes' AND policyname='Users read their own likes')         AS likes_own`)).rows[0]

console.log(`\n${APPLY ? 'result' : 'projected result'}:`)
console.log(`  public RLS policies:             ${beforePolicies} -> ${afterPolicies}`)
console.log(`  world-writable FOR ALL policies: ${beforeWide.length} -> ${afterWide.length}`)
for (const r of afterWide) console.log(`    still open: ${r.tablename} "${r.policyname}" roles=${r.roles}`)
const mark = (n) => (Number(n) ? 'present' : 'MISSING')
console.log(`  candidates.source        ${mark(objs.cand_source)}`)
console.log(`  politicians.source       ${mark(objs.pol_source)}`)
console.log(`  politicians.is_verified  ${mark(objs.pol_verified)}`)
console.log(`  public_submissions       ${mark(objs.submissions)}`)
console.log(`  public_like_counts       ${mark(objs.like_view)}`)
console.log(`  likes own-rows policy    ${mark(objs.likes_own)}`)

const dt = await client.query(`
  SELECT policyname, cmd, roles::text AS roles FROM pg_policies
   WHERE tablename='daily_topics' ORDER BY policyname`)
console.log('  daily_topics policies:')
for (const r of dt.rows) console.log(`    ${r.cmd.padEnd(7)} roles=${r.roles.padEnd(16)} "${r.policyname}"`)

if (APPLY) {
  await client.query('COMMIT')
  console.log('\nCOMMITTED.')
  console.log('Next: pnpm verify:rls · pnpm verify:selects · then the --apply importers.')
} else {
  await client.query('ROLLBACK')
  const restored = await policyCount()
  console.log(`\nROLLED BACK. public RLS policies: ${restored} (was ${beforePolicies}) — ${restored === beforePolicies ? 'unchanged' : 'MISMATCH, investigate'}`)
  console.log('Re-run with --apply to commit.')
}

await client.end()
