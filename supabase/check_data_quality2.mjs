import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const c = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Get the gun-policy issue ID
const { data: gunIssue } = await c.from('issues').select('id, slug').eq('slug', 'gun-policy-and-2nd-amendment').single()
console.log('Gun policy issue:', gunIssue)

// Get all stances for this issue
const { data: gunStances } = await c.from('politician_issues')
  .select('stance, summary, politician_id')
  .eq('issue_id', gunIssue.id)
  .limit(500)

// Get the politicians for those
const polIds = [...new Set(gunStances.map(s => s.politician_id))]
const { data: pols } = await c.from('politicians').select('id, name, party').in('id', polIds)
const polMap = Object.fromEntries(pols.map(p => [p.id, p]))

// Check unique summaries
const summaries = new Set()
const stanceByParty = {}
gunStances.forEach(s => {
  const pol = polMap[s.politician_id]
  if (!pol) return
  summaries.add(s.summary)
  const key = pol.party
  if (!stanceByParty[key]) stanceByParty[key] = {}
  if (!stanceByParty[key][s.stance]) stanceByParty[key][s.stance] = 0
  stanceByParty[key][s.stance]++
})

console.log('\n=== GUN POLICY: Unique summaries:', summaries.size, 'out of', gunStances.length, 'stances ===')
summaries.forEach(s => console.log(`  "${(s || 'null').substring(0, 100)}"`))

console.log('\n=== GUN POLICY: Stances by party ===')
console.log(JSON.stringify(stanceByParty, null, 2))

// Campaign finance - check if table exists and has data
console.log('\n=== CAMPAIGN FINANCE ===')
const { data: fin, error: finErr } = await c.from('campaign_finance')
  .select('cycle, raised, spent, cash_on_hand, source, politician_id')
  .limit(15)

if (finErr) {
  console.log('Error:', finErr.message)
} else if (!fin || fin.length === 0) {
  console.log('No campaign finance records')
} else {
  const finPolIds = [...new Set(fin.map(f => f.politician_id))]
  const { data: finPols } = await c.from('politicians').select('id, name').in('id', finPolIds)
  const finPolMap = Object.fromEntries(finPols.map(p => [p.id, p]))

  fin.forEach(f => {
    const pol = finPolMap[f.politician_id]
    console.log(`  ${pol?.name} ${f.cycle}: raised=$${f.raised?.toLocaleString()} spent=$${f.spent?.toLocaleString()} source=${f.source}`)
  })

  // Check if amounts look realistic or suspiciously round
  console.log('\nAll raised amounts (first 20):')
  const { data: allFin } = await c.from('campaign_finance').select('raised, spent').limit(20)
  allFin.forEach(f => console.log(`  raised=${f.raised} spent=${f.spent}`))
}

// Bills
console.log('\n=== BILLS ===')
const { data: bills } = await c.from('bills').select('title, status, introduced_date, congress_number, bill_number').limit(30)
if (bills && bills.length > 0) {
  bills.forEach(b => console.log(`  ${b.bill_number || 'N/A'} | ${b.title?.substring(0, 60)} | ${b.status} | ${b.introduced_date}`))
} else {
  console.log('No bills')
}

// Votes
console.log('\n=== VOTES ===')
const { count: voteCount } = await c.from('votes').select('*', { count: 'exact', head: true })
console.log(`Total votes: ${voteCount}`)

// Committees
console.log('\n=== COMMITTEES ===')
const { data: committees } = await c.from('committees').select('name, chamber, type').limit(20)
if (committees) committees.forEach(cm => console.log(`  ${cm.chamber} | ${cm.type} | ${cm.name}`))

// Social media
console.log('\n=== SOCIAL MEDIA ===')
const { count: smCount } = await c.from('social_media').select('*', { count: 'exact', head: true })
console.log(`Total social media records: ${smCount}`)
if (smCount > 0) {
  const { data: sm } = await c.from('social_media').select('platform, url').limit(5)
  sm.forEach(s => console.log(`  ${s.platform}: ${s.url}`))
}
