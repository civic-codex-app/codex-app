import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}
const c = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Get all stances with politician info
const allStances = []
let from = 0
while (true) {
  const { data } = await c.from('politician_issues')
    .select('summary, politician_id, issue_id')
    .range(from, from + 999)
  if (!data || data.length === 0) break
  allStances.push(...data)
  if (data.length < 1000) break
  from += 1000
}

// Get all politicians
const { data: pols } = await c.from('politicians').select('id, name, slug, party').limit(1000)
const polMap = Object.fromEntries(pols.map(p => [p.id, p]))

// Get all issues
const { data: issues } = await c.from('issues').select('id, slug, name')
const issueMap = Object.fromEntries(issues.map(i => [i.id, i]))

// Find the party-default summaries (most common per issue)
const summaryCount = {}
allStances.forEach(s => {
  const key = `${s.issue_id}:${s.summary}`
  summaryCount[key] = (summaryCount[key] || 0) + 1
})

// Get the most common summary per issue (these are the templates)
const templateSummaries = new Set()
const issueTemplateCounts = {}
issues.forEach(issue => {
  const issueSummaries = Object.entries(summaryCount)
    .filter(([k]) => k.startsWith(issue.id + ':'))
    .sort((a, b) => b[1] - a[1])

  // Top 2 summaries per issue are likely the party templates (one for R, one for D)
  issueSummaries.slice(0, 3).forEach(([key, count]) => {
    if (count > 10) { // if used more than 10 times, it's a template
      templateSummaries.add(key.split(':').slice(1).join(':'))
      issueTemplateCounts[issue.slug] = (issueTemplateCounts[issue.slug] || 0) + count
    }
  })
})

console.log('Template summaries identified:', templateSummaries.size)
console.log('Template usage by issue:')
Object.entries(issueTemplateCounts).forEach(([slug, count]) => console.log(`  ${slug}: ${count} template uses`))

// Count personalized vs template stances per politician
const polStanceCounts = {}
allStances.forEach(s => {
  const pol = polMap[s.politician_id]
  if (!pol) return
  if (!polStanceCounts[pol.slug]) polStanceCounts[pol.slug] = { name: pol.name, personalized: 0, template: 0, null: 0 }
  if (!s.summary) {
    polStanceCounts[pol.slug].null++
  } else if (templateSummaries.has(s.summary)) {
    polStanceCounts[pol.slug].template++
  } else {
    polStanceCounts[pol.slug].personalized++
  }
})

// Sort by personalized count
const sorted = Object.entries(polStanceCounts).sort((a, b) => b[1].personalized - a[1].personalized)

console.log('\n=== POLITICIANS WITH PERSONALIZED STANCES ===')
sorted.filter(([, v]) => v.personalized > 0).forEach(([slug, v]) => {
  console.log(`  ${v.name.padEnd(30)} personalized=${v.personalized} template=${v.template} null=${v.null}`)
})

console.log('\n=== TOTAL ===')
const totalPersonalized = sorted.reduce((sum, [, v]) => sum + v.personalized, 0)
const totalTemplate = sorted.reduce((sum, [, v]) => sum + v.template, 0)
const totalNull = sorted.reduce((sum, [, v]) => sum + v.null, 0)
console.log(`Personalized: ${totalPersonalized}`)
console.log(`Template: ${totalTemplate}`)
console.log(`Null: ${totalNull}`)
console.log(`Total: ${allStances.length}`)
