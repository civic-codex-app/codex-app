import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const c = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

const { data: candidates, count } = await c.from('candidates').select('id, name, party, is_incumbent, status, politician_id, bio, website_url, image_url', { count: 'exact' })

console.log('Total candidates:', count)
const withPol = candidates.filter(c => c.politician_id)
const withoutPol = candidates.filter(c => !c.politician_id)
console.log('Linked to politician record:', withPol.length)
console.log('Standalone (no politician record):', withoutPol.length)
console.log('Incumbents:', candidates.filter(c => c.is_incumbent).length)
console.log('Challengers:', candidates.filter(c => !c.is_incumbent).length)
console.log('')

if (withoutPol.length > 0) {
  console.log('Standalone candidates (no profile page):')
  withoutPol.forEach(c => console.log(`  - ${c.name} (${c.party}) ${c.is_incumbent ? 'INCUMBENT' : 'challenger'} | bio: ${!!c.bio} | img: ${!!c.image_url}`))
} else {
  console.log('All candidates are linked to politician records')
}

console.log('')
console.log('All candidates:')
candidates.forEach(c => console.log(`  ${c.is_incumbent ? '★' : ' '} ${c.name.padEnd(25)} ${c.party.padEnd(12)} ${c.politician_id ? '→ linked' : '✗ no profile'}`))
