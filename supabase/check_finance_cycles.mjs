import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}
const c = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

const { data } = await c.from('campaign_finance').select('cycle').limit(1000)
const cycles = {}
data.forEach(d => { cycles[d.cycle] = (cycles[d.cycle] || 0) + 1 })
console.log('Campaign finance by cycle:', JSON.stringify(cycles, null, 2))
console.log('Total records:', data.length)
