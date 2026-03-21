import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const c = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Check stance quality
console.log('=== SAMPLE STANCES (20) ===')
const { data: stances } = await c.from('politician_issues')
  .select('stance, summary, politicians:politician_id(name, party), issues:issue_id(name, slug)')
  .limit(20)

stances.forEach(s => console.log(`  ${s.politicians?.party?.padEnd(12)} | ${s.issues?.slug?.padEnd(25)} | ${s.stance?.padEnd(20)} | ${(s.summary || 'null').substring(0, 70)}`))

// Check if Republicans all have same stance on gun-policy
console.log('\n=== GUN POLICY STANCES BY PARTY ===')
const allGun = []
let from = 0
while (true) {
  const { data } = await c.from('politician_issues')
    .select('stance, politicians:politician_id(party), issues:issue_id(slug)')
    .range(from, from + 999)
  if (!data || data.length === 0) break
  allGun.push(...data.filter(s => s.issues?.slug === 'gun-policy'))
  if (data.length < 1000) break
  from += 1000
}

const grouped = {}
allGun.forEach(s => {
  if (!s.politicians || !s.issues) return
  const key = s.politicians.party
  if (!grouped[key]) grouped[key] = {}
  if (!grouped[key][s.stance]) grouped[key][s.stance] = 0
  grouped[key][s.stance]++
})
console.log(JSON.stringify(grouped, null, 2))

// Same for immigration
console.log('\n=== IMMIGRATION STANCES BY PARTY ===')
const allImm = []
from = 0
while (true) {
  const { data } = await c.from('politician_issues')
    .select('stance, politicians:politician_id(party), issues:issue_id(slug)')
    .range(from, from + 999)
  if (!data || data.length === 0) break
  allImm.push(...data.filter(s => s.issues?.slug === 'immigration'))
  if (data.length < 1000) break
  from += 1000
}
const grouped2 = {}
allImm.forEach(s => {
  if (!s.politicians || !s.issues) return
  const key = s.politicians.party
  if (!grouped2[key]) grouped2[key] = {}
  if (!grouped2[key][s.stance]) grouped2[key][s.stance] = 0
  grouped2[key][s.stance]++
})
console.log(JSON.stringify(grouped2, null, 2))

// Check if summaries are unique or identical
console.log('\n=== ARE SUMMARIES UNIQUE? (gun-policy, first 10 Republicans) ===')
const { data: repGun } = await c.from('politician_issues')
  .select('summary, politicians:politician_id(name, party), issues:issue_id(slug)')
  .limit(500)

const repGunFiltered = repGun.filter(s => s.politicians?.party === 'republican' && s.issues?.slug === 'gun-policy').slice(0, 10)
repGunFiltered.forEach(s => console.log(`  ${s.politicians.name}: "${(s.summary || 'null').substring(0, 80)}"`))

// Campaign finance
console.log('\n=== CAMPAIGN FINANCE SAMPLE ===')
const { data: fin } = await c.from('campaign_finance')
  .select('cycle, raised, spent, cash_on_hand, source, politicians:politician_id(name, chamber)')
  .limit(15)
fin.forEach(f => console.log(`  ${f.politicians?.name} (${f.politicians?.chamber}) ${f.cycle}: raised=$${f.raised?.toLocaleString()} spent=$${f.spent?.toLocaleString()} source=${f.source}`))

// Bills
console.log('\n=== BILLS ===')
const { data: bills } = await c.from('bills').select('title, status, introduced_date, congress_number, bill_number').limit(25)
bills.forEach(b => console.log(`  ${b.bill_number || 'N/A'} | ${b.title} | ${b.status} | ${b.introduced_date}`))

// Votes
console.log('\n=== VOTES ===')
const { count: voteCount } = await c.from('votes').select('*', { count: 'exact', head: true })
console.log(`Total votes: ${voteCount}`)
