#!/usr/bin/env node
/**
 * Link candidate rows to the politician they are, where the automatic match
 * could not: a nickname on the ballot ("John Bergman" for Jack Bergman), or
 * a sitting member running for another office under a row the importer
 * created from the state listing rather than from their profile.
 *
 * Each link is explicit — candidate id, the race it sits in, the name as
 * stored, the politician's slug, and why — because a loose name match is
 * how the seed invented people. The script checks every one of those
 * against the live row before writing, writes only where politician_id is
 * still NULL (so a re-run is a no-op), and backs up the rows it will change.
 *
 *   node scripts/link-candidate-rows.mjs           # dry run
 *   node scripts/link-candidate-rows.mjs --apply   # write
 *
 * Needs .env.local exported: export $(grep -v '^#' .env.local | xargs)
 */
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'node:fs'

const LINKS = [
  {
    candidate_id: '3d60d8b1-fdf5-435c-a68e-7cff20717318',
    race_slug: 'mi-1-house-2026',
    name: 'John Bergman',
    politician_slug: 'jack-bergman',
    reason: "Michigan's listing prints his legal first name; the race's incumbent_id is this row and the candidate row is flagged is_incumbent",
  },
  {
    candidate_id: '6fd6f357-acf0-42ec-8c2d-eb85b35f2ea6',
    race_slug: 'mi-senate-2026',
    name: 'Haley Stevens',
    politician_slug: 'haley-stevens',
    reason: 'Rep. MI-11 who ran for the open Senate seat and lost the Aug 4 primary; her MI-11 row (withdrawn) is already linked to the same profile',
  },
]

const apply = process.argv.includes('--apply')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  process.exit(1)
}
const db = createClient(url, key)

const plan = []
for (const link of LINKS) {
  const [{ data: cand, error: ce }, { data: pol, error: pe }] = await Promise.all([
    db.from('candidates').select('id, name, status, is_incumbent, politician_id, races:race_id(slug, state, incumbent_id)').eq('id', link.candidate_id).maybeSingle(),
    db.from('politicians').select('id, name, slug, state').eq('slug', link.politician_slug).maybeSingle(),
  ])
  if (ce || pe) {
    console.error(`  error reading ${link.name}:`, ce?.message ?? pe?.message)
    process.exit(1)
  }
  const problems = []
  if (!cand) problems.push('candidate row not found')
  else {
    if (cand.name !== link.name) problems.push(`name is "${cand.name}", expected "${link.name}"`)
    if (cand.races?.slug !== link.race_slug) problems.push(`race is ${cand.races?.slug}, expected ${link.race_slug}`)
  }
  if (!pol) problems.push(`politician ${link.politician_slug} not found`)
  else if (cand && pol.state !== cand.races?.state) problems.push(`politician is in ${pol.state}, race in ${cand.races?.state}`)

  if (cand && pol && cand.politician_id === pol.id) {
    console.log(`  already linked  ${link.name} → ${pol.name} (${pol.slug})`)
    continue
  }
  if (cand && cand.politician_id && pol && cand.politician_id !== pol.id) {
    problems.push(`already linked to a different politician (${cand.politician_id})`)
  }
  if (problems.length) {
    console.log(`  REFUSED         ${link.name}: ${problems.join('; ')}`)
    continue
  }
  plan.push({ link, before: cand, politician: pol })
  console.log(`  ${apply ? 'linking' : 'would link'}     ${cand.name} [${cand.races.slug}, ${cand.status}${cand.is_incumbent ? ', incumbent' : ''}] → ${pol.name} (${pol.slug})`)
  console.log(`                  ${link.reason}`)
}

if (!plan.length) {
  console.log('\nnothing to do')
  process.exit(0)
}
if (!apply) {
  console.log(`\nDry run — ${plan.length} link(s) would be written. Re-run with --apply.`)
  process.exit(0)
}

const stamp = new Date().toISOString().slice(0, 10)
const backup = `candidate-links-backup-${stamp}.json`
writeFileSync(backup, JSON.stringify(plan.map((p) => p.before), null, 2))
console.log(`\nbacked up ${plan.length} row(s) to ${backup}`)

let written = 0
for (const { link, politician } of plan) {
  // Conditioned on politician_id still being NULL: a row linked by someone
  // else between the read and the write is left as they set it.
  const { data, error } = await db
    .from('candidates')
    .update({ politician_id: politician.id })
    .eq('id', link.candidate_id)
    .is('politician_id', null)
    .select('id')
  if (error) {
    console.error(`  failed          ${link.name}: ${error.message}`)
    continue
  }
  if (!data?.length) {
    console.log(`  skipped         ${link.name}: politician_id was set by someone else meanwhile`)
    continue
  }
  written++
  console.log(`  linked          ${link.name} → ${politician.slug}`)
}
console.log(`\n${written} of ${plan.length} written`)
