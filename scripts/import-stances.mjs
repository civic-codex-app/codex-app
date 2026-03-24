// Import stance JSON files into Supabase.
// Usage: node scripts/import-stances.mjs <chamber> [glob-pattern]
// Examples:
//   node scripts/import-stances.mjs senate scripts/stances/senate-batch-*.json
//   node scripts/import-stances.mjs house scripts/stances/house-batch-*.json
//   node scripts/import-stances.mjs governor scripts/stances/governor-batch-*.json

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

const chamber = process.argv[2]
const filePattern = process.argv[3] // e.g. "senate-batch" or "house-batch" or "governor-batch"

if (!chamber || !filePattern) {
  console.error('Usage: node import-stances.mjs <chamber> <file-prefix>')
  console.error('  chamber: senate, house, governor')
  console.error('  file-prefix: senate-batch, house-batch, governor-batch')
  process.exit(1)
}

async function run() {
  // 1. Load all issues
  const { data: issues } = await supabase.from('issues').select('id, slug')
  const issueMap = Object.fromEntries(issues.map(i => [i.slug, i.id]))
  console.log(`Loaded ${issues.length} issues`)

  // 2. Find all matching JSON files
  const stancesDir = join(process.cwd(), 'scripts', 'stances')
  const files = readdirSync(stancesDir)
    .filter(f => f.startsWith(filePattern) && f.endsWith('.json'))
    .sort()

  if (files.length === 0) {
    console.error(`No files matching "${filePattern}*.json" found in scripts/stances/`)
    process.exit(1)
  }

  console.log(`Found ${files.length} files: ${files.join(', ')}`)

  // 3. Load all politician data
  let allPols = [], from = 0
  while (true) {
    const { data } = await supabase
      .from('politicians')
      .select('id, name, state, chamber')
      .eq('chamber', chamber)
      .range(from, from + 999)
    if (!data?.length) break
    allPols.push(...data)
    from += 1000
  }
  console.log(`Loaded ${allPols.length} ${chamber} politicians from DB`)

  // Build name lookup (lowercase name -> politician)
  const polByName = {}
  for (const p of allPols) {
    polByName[p.name.toLowerCase()] = p
  }

  // 4. Process each file
  let totalUpdated = 0, totalFailed = 0, totalSkipped = 0, totalNotFound = 0

  for (const file of files) {
    const filePath = join(stancesDir, file)
    let stanceData
    try {
      stanceData = JSON.parse(readFileSync(filePath, 'utf8'))
    } catch (e) {
      console.error(`  ERROR parsing ${file}: ${e.message}`)
      continue
    }

    console.log(`\n--- ${file} (${stanceData.length} politicians) ---`)

    for (const pol of stanceData) {
      const dbPol = polByName[pol.name.toLowerCase()]
      if (!dbPol) {
        console.error(`  NOT FOUND: "${pol.name}"`)
        totalNotFound++
        continue
      }

      let updated = 0, failed = 0

      for (const [issueSlug, stanceInfo] of Object.entries(pol.stances)) {
        const issueId = issueMap[issueSlug]
        if (!issueId) {
          console.error(`  UNKNOWN ISSUE: ${issueSlug}`)
          failed++
          continue
        }

        // Validate stance value
        const validStances = [
          'strongly_supports', 'supports', 'leans_support', 'neutral',
          'mixed', 'leans_oppose', 'opposes', 'strongly_opposes', 'unknown'
        ]
        if (!validStances.includes(stanceInfo.stance)) {
          console.error(`  INVALID STANCE for ${pol.name}/${issueSlug}: "${stanceInfo.stance}"`)
          failed++
          continue
        }

        const { error } = await supabase
          .from('politician_issues')
          .update({
            stance: stanceInfo.stance,
            summary: stanceInfo.summary,
            is_verified: true,
          })
          .eq('politician_id', dbPol.id)
          .eq('issue_id', issueId)

        if (error) {
          // Try upsert if update didn't match
          const { error: err2 } = await supabase
            .from('politician_issues')
            .upsert({
              politician_id: dbPol.id,
              issue_id: issueId,
              stance: stanceInfo.stance,
              summary: stanceInfo.summary,
              is_verified: true,
            }, { onConflict: 'politician_id,issue_id' })

          if (err2) {
            console.error(`  UPSERT FAILED: ${pol.name}/${issueSlug}: ${err2.message}`)
            failed++
          } else {
            updated++
          }
        } else {
          updated++
        }
      }

      totalUpdated += updated
      totalFailed += failed
      if (updated === 0 && failed === 0) totalSkipped++
    }
  }

  console.log('\n=== SUMMARY ===')
  console.log(`Files processed: ${files.length}`)
  console.log(`Stances updated: ${totalUpdated}`)
  console.log(`Failed: ${totalFailed}`)
  console.log(`Not found in DB: ${totalNotFound}`)
  console.log(`Skipped (no stances): ${totalSkipped}`)
}

run().catch(console.error)
