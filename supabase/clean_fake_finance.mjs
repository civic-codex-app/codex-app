import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}
const c = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Delete ALL campaign finance - it's all generated with fake amounts
const { count: before } = await c.from('campaign_finance').select('*', { count: 'exact', head: true })
console.log(`Campaign finance records before: ${before}`)

// Delete in batches
let deleted = 0
while (true) {
  const { data } = await c.from('campaign_finance').select('id').limit(200)
  if (!data || data.length === 0) break
  const ids = data.map(d => d.id)
  const { error } = await c.from('campaign_finance').delete().in('id', ids)
  if (error) {
    console.log('Error:', error.message)
    break
  }
  deleted += ids.length
  console.log(`  Deleted ${deleted}...`)
}

const { count: after } = await c.from('campaign_finance').select('*', { count: 'exact', head: true })
console.log(`\nCampaign finance records after: ${after}`)
console.log('All generated campaign finance data removed.')
