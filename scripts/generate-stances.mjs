// Generate nuanced stances for a batch of politicians.
// Usage: node scripts/generate-stances.mjs <chamber> <offset> <limit>
// Example: node scripts/generate-stances.mjs senate 0 50
//
// Takes a JSON file of stance data from stdin or --file argument and upserts to DB.
// If no file provided, outputs the politicians that need stances for the given batch.

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

const chamber = process.argv[2]
const inputFile = process.argv[3]

if (!chamber) {
  console.error('Usage: node generate-stances.mjs <chamber> [input-file.json]')
  process.exit(1)
}

const ISSUES = [
  'economy-and-jobs', 'healthcare-and-medicare', 'immigration-and-border-security',
  'education-and-student-debt', 'national-defense-and-military', 'climate-and-environment',
  'criminal-justice-reform', 'foreign-policy-and-diplomacy', 'technology-and-ai-regulation',
  'social-security-and-medicare', 'gun-policy-and-2nd-amendment', 'infrastructure-and-transportation',
  'housing-and-affordability', 'energy-policy-and-oil-gas', 'reproductive-rights',
  'lgbtq-rights', 'drug-policy', 'voting-rights', 'taxes-and-spending',
  'labor-and-unions', 'privacy-and-surveillance', 'trade-and-tariffs',
]

async function run() {
  const { data: issues } = await supabase.from('issues').select('id, slug')
  const issueMap = Object.fromEntries(issues.map(i => [i.slug, i.id]))

  if (inputFile && existsSync(inputFile)) {
    // Mode 2: Read stance data from JSON file and upsert
    const stanceData = JSON.parse(readFileSync(inputFile, 'utf8'))
    let updated = 0, failed = 0

    for (const pol of stanceData) {
      // Find politician by name + chamber
      const { data: matches } = await supabase
        .from('politicians')
        .select('id')
        .eq('name', pol.name)
        .eq('chamber', chamber)
        .limit(1)

      if (!matches?.length) {
        console.error(`  NOT FOUND: ${pol.name}`)
        failed++
        continue
      }

      const polId = matches[0].id

      for (const [issueSlug, stanceInfo] of Object.entries(pol.stances)) {
        const issueId = issueMap[issueSlug]
        if (!issueId) continue

        const { error } = await supabase
          .from('politician_issues')
          .update({
            stance: stanceInfo.stance,
            summary: stanceInfo.summary,
            is_verified: true,
          })
          .eq('politician_id', polId)
          .eq('issue_id', issueId)

        if (error) {
          failed++
        } else {
          updated++
        }
      }
    }

    console.log(`Updated: ${updated}, Failed: ${failed}`)
  } else {
    // Mode 1: Output politicians that need stances
    let allPols = [], from = 0
    while (true) {
      const { data } = await supabase
        .from('politicians')
        .select('id, name, state, party')
        .eq('chamber', chamber)
        .order('state')
        .range(from, from + 999)
      if (!data?.length) break
      allPols.push(...data)
      from += 1000
    }

    // Filter to only unverified
    const needsWork = []
    for (const pol of allPols) {
      const { count } = await supabase
        .from('politician_issues')
        .select('*', { count: 'exact', head: true })
        .eq('politician_id', pol.id)
        .eq('is_verified', true)
      if (count < 22) {
        needsWork.push({ ...pol, verified_count: count })
      }
    }

    console.log(JSON.stringify(needsWork, null, 2))
  }
}

run().catch(console.error)
