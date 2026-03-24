// Seed party-default stances for all politicians that have zero stances.
// Stances are marked as is_verified: false (estimated from party defaults).

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// All 22 issues with party defaults (from alignment.ts)
const PARTY_DEFAULTS = {
  democrat: {
    'economy-and-jobs': 'supports',
    'healthcare-and-medicare': 'strongly_supports',
    'immigration-and-border-security': 'leans_support',
    'education-and-student-debt': 'strongly_supports',
    'national-defense-and-military': 'supports',
    'climate-and-environment': 'strongly_supports',
    'criminal-justice-reform': 'strongly_supports',
    'foreign-policy-and-diplomacy': 'supports',
    'technology-and-ai-regulation': 'supports',
    'social-security-and-medicare': 'strongly_supports',
    'gun-policy-and-2nd-amendment': 'supports',
    'infrastructure-and-transportation': 'supports',
    'housing-and-affordability': 'strongly_supports',
    'energy-policy-and-oil-gas': 'leans_oppose',
    'reproductive-rights': 'strongly_supports',
    'lgbtq-rights': 'strongly_supports',
    'drug-policy': 'supports',
    'voting-rights': 'strongly_supports',
    'taxes-and-spending': 'strongly_supports',
    'labor-and-unions': 'strongly_supports',
    'privacy-and-surveillance': 'supports',
    'trade-and-tariffs': 'supports',
  },
  republican: {
    'economy-and-jobs': 'supports',
    'healthcare-and-medicare': 'opposes',
    'immigration-and-border-security': 'strongly_supports',
    'education-and-student-debt': 'opposes',
    'national-defense-and-military': 'strongly_supports',
    'climate-and-environment': 'strongly_opposes',
    'criminal-justice-reform': 'opposes',
    'foreign-policy-and-diplomacy': 'supports',
    'technology-and-ai-regulation': 'leans_oppose',
    'social-security-and-medicare': 'leans_support',
    'gun-policy-and-2nd-amendment': 'strongly_opposes',
    'infrastructure-and-transportation': 'supports',
    'housing-and-affordability': 'leans_oppose',
    'energy-policy-and-oil-gas': 'strongly_supports',
    'reproductive-rights': 'strongly_opposes',
    'lgbtq-rights': 'opposes',
    'drug-policy': 'opposes',
    'voting-rights': 'opposes',
    'taxes-and-spending': 'strongly_opposes',
    'labor-and-unions': 'opposes',
    'privacy-and-surveillance': 'opposes',
    'trade-and-tariffs': 'opposes',
  },
  independent: {
    'economy-and-jobs': 'supports',
    'healthcare-and-medicare': 'supports',
    'immigration-and-border-security': 'neutral',
    'education-and-student-debt': 'supports',
    'national-defense-and-military': 'neutral',
    'climate-and-environment': 'supports',
    'criminal-justice-reform': 'supports',
    'foreign-policy-and-diplomacy': 'supports',
    'technology-and-ai-regulation': 'supports',
    'social-security-and-medicare': 'supports',
    'gun-policy-and-2nd-amendment': 'leans_support',
    'infrastructure-and-transportation': 'supports',
    'housing-and-affordability': 'supports',
    'energy-policy-and-oil-gas': 'neutral',
    'reproductive-rights': 'supports',
    'lgbtq-rights': 'supports',
    'drug-policy': 'supports',
    'voting-rights': 'supports',
    'taxes-and-spending': 'neutral',
    'labor-and-unions': 'neutral',
    'privacy-and-surveillance': 'supports',
    'trade-and-tariffs': 'neutral',
  },
  green: {
    'economy-and-jobs': 'supports',
    'healthcare-and-medicare': 'strongly_supports',
    'immigration-and-border-security': 'supports',
    'education-and-student-debt': 'strongly_supports',
    'national-defense-and-military': 'opposes',
    'climate-and-environment': 'strongly_supports',
    'criminal-justice-reform': 'strongly_supports',
    'foreign-policy-and-diplomacy': 'supports',
    'technology-and-ai-regulation': 'strongly_supports',
    'social-security-and-medicare': 'strongly_supports',
    'gun-policy-and-2nd-amendment': 'supports',
    'infrastructure-and-transportation': 'strongly_supports',
    'housing-and-affordability': 'strongly_supports',
    'energy-policy-and-oil-gas': 'strongly_opposes',
    'reproductive-rights': 'strongly_supports',
    'lgbtq-rights': 'strongly_supports',
    'drug-policy': 'strongly_supports',
    'voting-rights': 'strongly_supports',
    'taxes-and-spending': 'strongly_supports',
    'labor-and-unions': 'strongly_supports',
    'privacy-and-surveillance': 'strongly_supports',
    'trade-and-tariffs': 'supports',
  },
}

async function run() {
  // 1. Get all issues
  const { data: issues } = await supabase.from('issues').select('id, slug')
  if (!issues?.length) { console.error('No issues found'); return }
  const issueMap = Object.fromEntries(issues.map(i => [i.slug, i.id]))
  console.log(`Found ${issues.length} issues`)

  // 2. Get all politician IDs that already have at least one stance
  let existingPolIds = new Set()
  let from = 0
  while (true) {
    const { data } = await supabase
      .from('politician_issues')
      .select('politician_id')
      .range(from, from + 999)
    if (!data || !data.length) break
    data.forEach(r => existingPolIds.add(r.politician_id))
    from += 1000
  }
  console.log(`Politicians with existing stances: ${existingPolIds.size}`)

  // 3. Get all politicians without stances
  let allPols = [], polFrom = 0
  while (true) {
    const { data } = await supabase
      .from('politicians')
      .select('id, name, party')
      .range(polFrom, polFrom + 999)
    if (!data || !data.length) break
    allPols.push(...data)
    polFrom += 1000
  }

  const needStances = allPols.filter(p => !existingPolIds.has(p.id))
  console.log(`Politicians needing stances: ${needStances.length}`)

  if (needStances.length === 0) {
    console.log('All politicians already have stances!')
    return
  }

  // 4. Build insert records
  let inserted = 0, failed = 0, skipped = 0
  const BATCH_SIZE = 500

  const allRecords = []
  for (const pol of needStances) {
    const defaults = PARTY_DEFAULTS[pol.party] || PARTY_DEFAULTS.independent
    for (const [slug, stance] of Object.entries(defaults)) {
      const issueId = issueMap[slug]
      if (!issueId) continue
      allRecords.push({
        politician_id: pol.id,
        issue_id: issueId,
        stance,
        summary: `Estimated based on ${pol.party} party platform`,
        is_verified: false,
      })
    }
  }

  console.log(`Inserting ${allRecords.length} stance records in batches of ${BATCH_SIZE}...`)

  for (let i = 0; i < allRecords.length; i += BATCH_SIZE) {
    const batch = allRecords.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('politician_issues').insert(batch)
    if (error) {
      // Try one by one for conflict resolution
      for (const record of batch) {
        const { error: err2 } = await supabase
          .from('politician_issues')
          .upsert(record, { onConflict: 'politician_id,issue_id' })
        if (err2) {
          failed++
        } else {
          inserted++
        }
      }
    } else {
      inserted += batch.length
    }
    if ((i + BATCH_SIZE) % 5000 === 0 || i + BATCH_SIZE >= allRecords.length) {
      console.log(`  Progress: ${Math.min(i + BATCH_SIZE, allRecords.length)}/${allRecords.length}`)
    }
  }

  console.log(`\n=== SUMMARY ===`)
  console.log(`Politicians processed: ${needStances.length}`)
  console.log(`Stances inserted: ${inserted}`)
  console.log(`Failed: ${failed}`)
}

run().catch(console.error)
