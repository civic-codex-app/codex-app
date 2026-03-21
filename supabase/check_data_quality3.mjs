import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const c = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Campaign finance with correct column names
console.log('=== CAMPAIGN FINANCE ===')
const { data: fin } = await c.from('campaign_finance')
  .select('cycle, total_raised, total_spent, cash_on_hand, source, politician_id')
  .limit(20)

const finPolIds = [...new Set(fin.map(f => f.politician_id))]
const { data: finPols } = await c.from('politicians').select('id, name').in('id', finPolIds)
const finPolMap = Object.fromEntries(finPols.map(p => [p.id, p]))

fin.forEach(f => {
  const pol = finPolMap[f.politician_id]
  console.log(`  ${pol?.name?.padEnd(25)} ${f.cycle}: raised=$${f.total_raised?.toLocaleString()?.padEnd(15)} spent=$${f.total_spent?.toLocaleString()?.padEnd(15)} source=${f.source}`)
})

// Check if amounts look realistic
console.log('\nRaised amounts for first 20:')
fin.forEach(f => console.log(`  ${f.total_raised}`))

// Bills with correct columns
console.log('\n=== BILLS ===')
const { data: bills, count: billCount } = await c.from('bills').select('number, title, status, introduced_date, congress_session', { count: 'exact' })
console.log(`Total bills: ${billCount}`)
if (bills) bills.forEach(b => console.log(`  ${(b.number || 'N/A').padEnd(12)} | ${b.title?.substring(0, 55)?.padEnd(55)} | ${b.status?.padEnd(12)} | ${b.congress_session}`))

// Committees
console.log('\n=== COMMITTEES ===')
const { data: committees, count: cmCount } = await c.from('committees').select('name, chamber, committee_type', { count: 'exact' })
console.log(`Total committees: ${cmCount}`)
if (committees) committees.slice(0, 15).forEach(cm => console.log(`  ${cm.chamber?.padEnd(10)} | ${cm.committee_type?.padEnd(12)} | ${cm.name}`))

// Politician-committee memberships
const { count: pcCount } = await c.from('politician_committees').select('*', { count: 'exact', head: true })
console.log(`\nPolitician-committee memberships: ${pcCount}`)

// Stance summary uniqueness across ALL issues
console.log('\n=== STANCE SUMMARY UNIQUENESS ===')
const allStances = []
let from = 0
while (true) {
  const { data } = await c.from('politician_issues')
    .select('summary, issue_id')
    .range(from, from + 999)
  if (!data || data.length === 0) break
  allStances.push(...data)
  if (data.length < 1000) break
  from += 1000
}
const uniqueSummaries = new Set(allStances.map(s => s.summary))
console.log(`Total stances: ${allStances.length}`)
console.log(`Unique summaries: ${uniqueSummaries.size}`)
console.log(`Ratio: ${(uniqueSummaries.size / allStances.length * 100).toFixed(1)}% unique`)

// How many have null summaries?
const nullCount = allStances.filter(s => !s.summary).length
console.log(`Null summaries: ${nullCount}`)
