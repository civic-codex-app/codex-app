import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const c = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

console.log('=== FULL DATA AUDIT ===\n')

// Politicians
const { count: polCount } = await c.from('politicians').select('*', { count: 'exact', head: true })
console.log(`Politicians: ${polCount}`)

// Issues
const { data: issues } = await c.from('issues').select('name, slug')
console.log(`\nIssues (${issues.length}):`)
issues.forEach(i => console.log(`  - ${i.name} (${i.slug})`))

// Politician stances
const { count: stanceCount } = await c.from('politician_issues').select('*', { count: 'exact', head: true })
console.log(`\nPolitician stances: ${stanceCount}`)
// Sample a few
const { data: sampleStances } = await c.from('politician_issues')
  .select('stance, summary, politicians:politician_id(name, party), issues:issue_id(name)')
  .limit(5)
console.log('Sample stances:')
sampleStances.forEach(s => console.log(`  ${s.politicians?.name} (${s.politicians?.party}) → ${s.issues?.name}: ${s.stance} | "${(s.summary || 'no summary').substring(0, 60)}..."`))

// Bills
const { data: bills, count: billCount } = await c.from('bills').select('title, status, introduced_date', { count: 'exact' })
console.log(`\nBills: ${billCount}`)
if (bills?.length > 0) {
  console.log('Sample bills:')
  bills.slice(0, 5).forEach(b => console.log(`  - ${b.title} (${b.status}, ${b.introduced_date})`))
}

// Votes
const { count: voteCount } = await c.from('votes').select('*', { count: 'exact', head: true })
console.log(`\nVotes (politician bill votes): ${voteCount}`)
if (voteCount > 0) {
  const { data: sampleVotes } = await c.from('votes')
    .select('vote, politicians:politician_id(name), bills:bill_id(title)')
    .limit(5)
  console.log('Sample votes:')
  sampleVotes.forEach(v => console.log(`  ${v.politicians?.name} voted ${v.vote} on "${(v.bills?.title || '').substring(0, 50)}"`))
}

// Campaign finance
const { count: finCount } = await c.from('campaign_finance').select('*', { count: 'exact', head: true })
console.log(`\nCampaign finance records: ${finCount}`)
if (finCount > 0) {
  const { data: sampleFin } = await c.from('campaign_finance')
    .select('cycle, raised, spent, cash_on_hand, politicians:politician_id(name)')
    .limit(5)
  console.log('Sample finance:')
  sampleFin.forEach(f => console.log(`  ${f.politicians?.name} ${f.cycle}: raised $${f.raised?.toLocaleString()}, spent $${f.spent?.toLocaleString()}`))
}

// Election results
const { count: erCount } = await c.from('election_results').select('*', { count: 'exact', head: true })
console.log(`\nElection results: ${erCount}`)

// Candidate issues
const { count: ciCount } = await c.from('candidate_issues').select('*', { count: 'exact', head: true })
console.log(`Candidate stances: ${ciCount}`)

// Committees
const { count: cmCount } = await c.from('committees').select('*', { count: 'exact', head: true })
console.log(`\nCommittees: ${cmCount}`)
const { count: pcCount } = await c.from('politician_committees').select('*', { count: 'exact', head: true })
console.log(`Politician-committee memberships: ${pcCount}`)

// Social media
const { count: smCount } = await c.from('social_media').select('*', { count: 'exact', head: true })
console.log(`Social media records: ${smCount}`)

// Elections/races/candidates
const { count: elCount } = await c.from('elections').select('*', { count: 'exact', head: true })
const { count: raceCount } = await c.from('races').select('*', { count: 'exact', head: true })
const { count: candCount } = await c.from('candidates').select('*', { count: 'exact', head: true })
console.log(`\nElections: ${elCount}`)
console.log(`Races: ${raceCount}`)
console.log(`Candidates: ${candCount}`)

console.log('\n=== DATA SOURCE ASSESSMENT ===')
console.log('Real/accurate:')
console.log('  - Politician names, states, parties, chambers ✓')
console.log('  - Issue topics and categories ✓')
console.log('  - Committee names ✓')
console.log('  - Election/race structure (2026 midterms) ✓')
console.log('')
console.log('Generated/synthetic (needs verification):')
console.log('  - Politician stances (party-default + random variation)')
console.log('  - Candidate stances (party-default + random variation)')
console.log('  - Bills (need to check if real)')
console.log('  - Vote records (need to check if real)')
console.log('  - Campaign finance numbers (need to check if real)')
console.log('  - Election results opponents (mostly fictional)')
console.log('  - Social media URLs (need to check)')
console.log('  - Challenger candidate names/bios (fictional)')
