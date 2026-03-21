import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Get all senator IDs
const { data: senators } = await supabase
  .from('politicians')
  .select('id')
  .eq('chamber', 'senate')

const senatorIds = senators.map(s => s.id)

// Mark their stances as verified in batches
const BATCH = 50
let updated = 0
for (let i = 0; i < senatorIds.length; i += BATCH) {
  const batch = senatorIds.slice(i, i + BATCH)
  const { error, count } = await supabase
    .from('politician_issues')
    .update({ is_verified: true })
    .in('politician_id', batch)
  if (error) {
    console.error('Error:', error.message)
  } else {
    updated += count || 0
  }
}

console.log(`Marked ${updated} senate stances as verified`)
