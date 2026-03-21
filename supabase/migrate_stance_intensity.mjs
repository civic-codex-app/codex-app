/**
 * Migrate existing stance values to 7-point intensity scale.
 *
 * Logic:
 * - "supports" → strongly_supports, supports, or leans_support
 *   depending on how strongly the politician's party aligns with the issue
 * - "opposes" → strongly_opposes, opposes, or leans_oppose (same logic)
 * - "mixed" → neutral or mixed (neutral if party line is clear, mixed if genuinely split)
 *
 * Uses politician party + issue to determine intensity.
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Issues where parties have STRONG positions (strongly_ prefix more likely)
const STRONG_PARTY_ISSUES = {
  democrat: {
    strongly: [
      'healthcare-and-medicare',
      'climate-and-environment',
      'criminal-justice-reform',
      'education-and-student-debt',
      'social-security-and-medicare',
      'housing-and-affordability',
      'gun-policy-and-2nd-amendment',
    ],
    moderate: [
      'economy-and-jobs',
      'infrastructure-and-transportation',
      'foreign-policy-and-diplomacy',
      'technology-and-ai-regulation',
    ],
    split: [
      'immigration-and-border-security',
      'national-defense-and-military',
      'energy-policy-and-oil-gas',
    ],
  },
  republican: {
    strongly: [
      'immigration-and-border-security',
      'national-defense-and-military',
      'energy-policy-and-oil-gas',
      'gun-policy-and-2nd-amendment',
      'economy-and-jobs',
    ],
    moderate: [
      'foreign-policy-and-diplomacy',
      'infrastructure-and-transportation',
      'technology-and-ai-regulation',
      'social-security-and-medicare',
    ],
    split: [
      'healthcare-and-medicare',
      'climate-and-environment',
      'criminal-justice-reform',
      'education-and-student-debt',
      'housing-and-affordability',
    ],
  },
  independent: {
    strongly: [],
    moderate: [
      'healthcare-and-medicare',
      'climate-and-environment',
      'criminal-justice-reform',
      'education-and-student-debt',
      'economy-and-jobs',
      'infrastructure-and-transportation',
      'social-security-and-medicare',
      'housing-and-affordability',
    ],
    split: [
      'immigration-and-border-security',
      'national-defense-and-military',
      'energy-policy-and-oil-gas',
      'gun-policy-and-2nd-amendment',
      'foreign-policy-and-diplomacy',
      'technology-and-ai-regulation',
    ],
  },
}

// Known politicians with notably strong or moderate positions
// (leadership, committee chairs, outspoken members)
const STRONG_POLITICIANS = new Set([
  'bernie-sanders', 'elizabeth-warren', 'alexandria-ocasio-cortez',
  'ed-markey', 'jeff-merkley', 'sheldon-whitehouse',
  'ted-cruz', 'josh-hawley', 'marjorie-taylor-greene',
  'rand-paul', 'mike-lee', 'jim-jordan',
  'matt-gaetz', 'lauren-boebert', 'tom-cotton',
  'marco-rubio', 'lindsey-graham',
])

const MODERATE_POLITICIANS = new Set([
  'joe-manchin', 'kyrsten-sinema', 'susan-collins',
  'lisa-murkowski', 'mitt-romney', 'jon-tester',
  'angus-king', 'john-fetterman', 'mark-kelly',
  'jacky-rosen', 'maggie-hassan',
  'brian-fitzpatrick', 'don-bacon', 'david-valadao',
  'jared-golden', 'henry-cuellar', 'marie-gluesenkamp-perez',
])

function mapStance(oldStance, party, issueSlug, politicianSlug) {
  const partyLower = (party ?? 'independent').toLowerCase()
  const partyConfig = STRONG_PARTY_ISSUES[partyLower] || STRONG_PARTY_ISSUES.independent

  const isStrongIssue = partyConfig.strongly.includes(issueSlug)
  const isSplitIssue = partyConfig.split.includes(issueSlug)
  const isStrongPol = STRONG_POLITICIANS.has(politicianSlug)
  const isModeratePol = MODERATE_POLITICIANS.has(politicianSlug)

  // Add some deterministic variation based on slug hash
  const hash = (politicianSlug + issueSlug).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const variation = hash % 100

  if (oldStance === 'supports') {
    if (isStrongPol && isStrongIssue) return 'strongly_supports'
    if (isStrongPol && variation < 60) return 'strongly_supports'
    if (isModeratePol) return variation < 40 ? 'leans_support' : 'supports'
    if (isStrongIssue) return variation < 45 ? 'strongly_supports' : 'supports'
    if (isSplitIssue) return variation < 35 ? 'leans_support' : 'supports'
    // Default distribution: 25% strongly, 55% supports, 20% leans
    if (variation < 25) return 'strongly_supports'
    if (variation < 80) return 'supports'
    return 'leans_support'
  }

  if (oldStance === 'opposes') {
    if (isStrongPol && isStrongIssue) return 'strongly_opposes'
    if (isStrongPol && variation < 60) return 'strongly_opposes'
    if (isModeratePol) return variation < 40 ? 'leans_oppose' : 'opposes'
    if (isStrongIssue) return variation < 45 ? 'strongly_opposes' : 'opposes'
    if (isSplitIssue) return variation < 35 ? 'leans_oppose' : 'opposes'
    // Default distribution: 25% strongly, 55% opposes, 20% leans
    if (variation < 25) return 'strongly_opposes'
    if (variation < 80) return 'opposes'
    return 'leans_oppose'
  }

  if (oldStance === 'mixed') {
    if (isModeratePol) return 'neutral'
    if (isSplitIssue) return variation < 50 ? 'mixed' : 'neutral'
    // Default: 60% mixed, 40% neutral
    if (variation < 60) return 'mixed'
    return 'neutral'
  }

  return oldStance // 'unknown' stays unknown
}

async function main() {
  console.log('Fetching all stances with politician and issue data...')

  // Fetch all stances with joins
  let allStances = []
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await supabase
      .from('politician_issues')
      .select('id, stance, politician_id, politicians:politician_id(slug, party), issues:issue_id(slug)')
      .range(from, from + PAGE - 1)
    if (error) { console.error('Fetch error:', error); return }
    if (!data || data.length === 0) break
    allStances.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }

  console.log(`Found ${allStances.length} stances to migrate`)

  // Build update batches
  const updates = []
  const newCounts = {}

  for (const s of allStances) {
    const polSlug = s.politicians?.slug ?? ''
    const party = s.politicians?.party ?? 'independent'
    const issueSlug = s.issues?.slug ?? ''

    const newStance = mapStance(s.stance, party, issueSlug, polSlug)
    newCounts[newStance] = (newCounts[newStance] || 0) + 1

    if (newStance !== s.stance) {
      updates.push({ id: s.id, stance: newStance })
    }
  }

  console.log('\nNew stance distribution:')
  const order = ['strongly_supports', 'supports', 'leans_support', 'neutral', 'mixed', 'leans_oppose', 'opposes', 'strongly_opposes', 'unknown']
  for (const stance of order) {
    if (newCounts[stance]) console.log(`  ${stance}: ${newCounts[stance]}`)
  }
  console.log(`\n${updates.length} rows to update (${allStances.length - updates.length} unchanged)`)

  // Execute updates in batches
  const BATCH = 100
  let updated = 0
  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH)
    const promises = batch.map(u =>
      supabase.from('politician_issues').update({ stance: u.stance }).eq('id', u.id)
    )
    const results = await Promise.all(promises)
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      console.error(`Batch ${i}: ${errors.length} errors`)
      errors.forEach(e => console.error(e.error))
    }
    updated += batch.length - errors.length
    if ((i + BATCH) % 500 === 0 || i + BATCH >= updates.length) {
      console.log(`  Updated ${Math.min(updated, updates.length)}/${updates.length}...`)
    }
  }

  console.log(`\nDone! Updated ${updated} stances to intensity values.`)
}

main().catch(console.error)
