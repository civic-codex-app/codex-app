/**
 * Backfill missing original 14 issue stances for all politicians.
 * Only inserts where a politician is missing a stance on an original issue.
 * Uses party defaults, marked as is_verified: false.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/backfill-original-stances.mjs
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ORIGINAL_SLUGS = [
  'economy-and-jobs', 'healthcare-and-medicare', 'immigration-and-border-security',
  'education-and-student-debt', 'national-defense-and-military', 'climate-and-environment',
  'criminal-justice-reform', 'foreign-policy-and-diplomacy', 'technology-and-ai-regulation',
  'social-security-and-medicare', 'gun-policy-and-2nd-amendment', 'infrastructure-and-transportation',
  'housing-and-affordability', 'energy-policy-and-oil-gas',
]

const PARTY_DEFAULTS = {
  democrat: {
    'economy-and-jobs': 'supports', 'healthcare-and-medicare': 'strongly_supports',
    'immigration-and-border-security': 'leans_support', 'education-and-student-debt': 'strongly_supports',
    'national-defense-and-military': 'supports', 'climate-and-environment': 'strongly_supports',
    'criminal-justice-reform': 'strongly_supports', 'foreign-policy-and-diplomacy': 'supports',
    'technology-and-ai-regulation': 'supports', 'social-security-and-medicare': 'strongly_supports',
    'gun-policy-and-2nd-amendment': 'supports', 'infrastructure-and-transportation': 'supports',
    'housing-and-affordability': 'strongly_supports', 'energy-policy-and-oil-gas': 'leans_oppose',
  },
  republican: {
    'economy-and-jobs': 'supports', 'healthcare-and-medicare': 'opposes',
    'immigration-and-border-security': 'strongly_supports', 'education-and-student-debt': 'opposes',
    'national-defense-and-military': 'strongly_supports', 'climate-and-environment': 'strongly_opposes',
    'criminal-justice-reform': 'opposes', 'foreign-policy-and-diplomacy': 'supports',
    'technology-and-ai-regulation': 'leans_oppose', 'social-security-and-medicare': 'leans_support',
    'gun-policy-and-2nd-amendment': 'strongly_opposes', 'infrastructure-and-transportation': 'supports',
    'housing-and-affordability': 'leans_oppose', 'energy-policy-and-oil-gas': 'strongly_supports',
  },
  independent: {
    'economy-and-jobs': 'supports', 'healthcare-and-medicare': 'supports',
    'immigration-and-border-security': 'neutral', 'education-and-student-debt': 'supports',
    'national-defense-and-military': 'neutral', 'climate-and-environment': 'supports',
    'criminal-justice-reform': 'supports', 'foreign-policy-and-diplomacy': 'supports',
    'technology-and-ai-regulation': 'supports', 'social-security-and-medicare': 'supports',
    'gun-policy-and-2nd-amendment': 'leans_support', 'infrastructure-and-transportation': 'supports',
    'housing-and-affordability': 'supports', 'energy-policy-and-oil-gas': 'neutral',
  },
}

async function main() {
  // Get issue IDs
  const { data: issues } = await supabase.from('issues').select('id, slug').in('slug', ORIGINAL_SLUGS)
  if (!issues || issues.length === 0) { console.error('No issues found'); process.exit(1) }
  const issueMap = new Map(issues.map(i => [i.slug, i.id]))
  console.log(`Found ${issues.length} original issues`)

  // Get all politicians
  let allPols = []
  let from = 0
  while (true) {
    const { data } = await supabase.from('politicians').select('id, party').range(from, from + 999)
    if (!data || !data.length) break
    allPols = allPols.concat(data)
    if (data.length < 1000) break
    from += 1000
  }
  console.log(`Found ${allPols.length} politicians`)

  // Get existing stances on original issues
  const existing = new Set()
  from = 0
  const issueIdArr = [...issueMap.values()]
  while (true) {
    const { data } = await supabase.from('politician_issues').select('politician_id, issue_id').in('issue_id', issueIdArr).range(from, from + 999)
    if (!data || !data.length) break
    for (const r of data) existing.add(r.politician_id + ':' + r.issue_id)
    if (data.length < 1000) break
    from += 1000
  }
  console.log(`Existing original stance records: ${existing.size}`)

  // Build missing rows
  const rows = []
  for (const pol of allPols) {
    const party = (pol.party || 'independent').toLowerCase()
    const defaults = PARTY_DEFAULTS[party] || PARTY_DEFAULTS.independent
    for (const [slug, issueId] of issueMap) {
      if (existing.has(pol.id + ':' + issueId)) continue
      const stance = defaults[slug]
      if (!stance) continue
      rows.push({
        politician_id: pol.id,
        issue_id: issueId,
        stance,
        summary: `Estimated from ${pol.party} party platform`,
        is_verified: false,
      })
    }
  }
  console.log(`Missing stance records to insert: ${rows.length}`)

  if (rows.length === 0) { console.log('Nothing to do!'); return }

  // Insert in chunks
  const CHUNK = 500
  let inserted = 0
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const { error } = await supabase
      .from('politician_issues')
      .upsert(chunk, { onConflict: 'politician_id,issue_id', ignoreDuplicates: true })
    if (error) console.error(`Error at chunk ${i}:`, error.message)
    else inserted += chunk.length
    if ((i + CHUNK) % 5000 === 0 || i + CHUNK >= rows.length) {
      console.log(`  ${Math.min(inserted, rows.length)} / ${rows.length}`)
    }
  }
  console.log(`Done! Inserted ${inserted} missing stance records`)
}

main()
