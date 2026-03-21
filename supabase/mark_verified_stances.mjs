import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const c = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// First, fetch all stances with their summaries
console.log('Fetching all stances...')
const allStances = []
let from = 0
while (true) {
  const { data } = await c.from('politician_issues')
    .select('id, summary, issue_id')
    .range(from, from + 999)
  if (!data || data.length === 0) break
  allStances.push(...data)
  if (data.length < 1000) break
  from += 1000
}
console.log(`Total stances: ${allStances.length}`)

// Count how many times each summary appears per issue
const summaryCount = {}
allStances.forEach(s => {
  const key = `${s.issue_id}::${s.summary || 'NULL'}`
  summaryCount[key] = (summaryCount[key] || 0) + 1
})

// A stance is "verified" (personalized) if its summary appears fewer than 10 times
// for that issue. Template summaries appear 100+ times.
const verifiedIds = []
const templateIds = []

allStances.forEach(s => {
  const key = `${s.issue_id}::${s.summary || 'NULL'}`
  const count = summaryCount[key]
  if (s.summary && count < 10) {
    verifiedIds.push(s.id)
  } else {
    templateIds.push(s.id)
  }
})

console.log(`Verified (personalized): ${verifiedIds.length}`)
console.log(`Template/unverified: ${templateIds.length}`)

// Mark verified stances
if (verifiedIds.length > 0) {
  const BATCH = 200
  let updated = 0
  for (let i = 0; i < verifiedIds.length; i += BATCH) {
    const batch = verifiedIds.slice(i, i + BATCH)
    const { error } = await c.from('politician_issues')
      .update({ is_verified: true })
      .in('id', batch)
    if (error) {
      console.log('Error:', error.message)
      break
    }
    updated += batch.length
  }
  console.log(`Marked ${updated} stances as verified`)
}

console.log('Done!')
