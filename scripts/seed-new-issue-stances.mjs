/**
 * Seed party-default stances for the 8 new issues across all politicians.
 * Stances are marked as is_verified: false (estimated from party defaults).
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/seed-new-issue-stances.mjs
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const NEW_ISSUE_SLUGS = [
  'reproductive-rights',
  'lgbtq-rights',
  'drug-policy',
  'voting-rights',
  'taxes-and-spending',
  'labor-and-unions',
  'privacy-and-surveillance',
  'trade-and-tariffs',
]

const PARTY_DEFAULTS = {
  democrat: {
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
    'reproductive-rights': 'supports',
    'lgbtq-rights': 'supports',
    'drug-policy': 'supports',
    'voting-rights': 'supports',
    'taxes-and-spending': 'neutral',
    'labor-and-unions': 'neutral',
    'privacy-and-surveillance': 'supports',
    'trade-and-tariffs': 'neutral',
  },
}

async function main() {
  // Get new issue IDs
  const { data: issues, error: issueErr } = await supabase
    .from('issues')
    .select('id, slug')
    .in('slug', NEW_ISSUE_SLUGS)

  if (issueErr) { console.error('Error fetching issues:', issueErr); process.exit(1) }
  if (!issues || issues.length === 0) {
    console.error('No new issues found in DB. Run 020_new_issues.sql first.')
    process.exit(1)
  }

  const issueMap = new Map(issues.map(i => [i.slug, i.id]))
  console.log(`Found ${issues.length} new issues in DB`)

  // Get all politicians
  let allPoliticians = []
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data } = await supabase
      .from('politicians')
      .select('id, party')
      .range(from, from + PAGE - 1)
    if (!data || data.length === 0) break
    allPoliticians = allPoliticians.concat(data)
    if (data.length < PAGE) break
    from += PAGE
  }
  console.log(`Found ${allPoliticians.length} politicians`)

  // Build rows
  const rows = []
  for (const pol of allPoliticians) {
    const party = pol.party?.toLowerCase()
    const defaults = PARTY_DEFAULTS[party] ?? PARTY_DEFAULTS.independent

    for (const slug of NEW_ISSUE_SLUGS) {
      const issueId = issueMap.get(slug)
      if (!issueId) continue
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

  console.log(`Inserting ${rows.length} stance records...`)

  // Insert in chunks (Supabase has row limits)
  const CHUNK = 500
  let inserted = 0
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const { error } = await supabase
      .from('politician_issues')
      .upsert(chunk, { onConflict: 'politician_id,issue_id', ignoreDuplicates: true })

    if (error) {
      console.error(`Error at chunk ${i}:`, error)
    } else {
      inserted += chunk.length
      console.log(`  ${inserted} / ${rows.length}`)
    }
  }

  console.log(`Done! Inserted ${inserted} stance records for ${allPoliticians.length} politicians across ${issues.length} issues.`)
}

main()
