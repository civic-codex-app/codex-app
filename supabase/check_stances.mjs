import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load env
const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const c = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

const { count: totalPols } = await c.from('politicians').select('*', { count: 'exact', head: true })
const { data: stances } = await c.from('politician_issues').select('politician_id')
const unique = new Set(stances.map(s => s.politician_id))

console.log('Total politicians:', totalPols)
console.log('WITH stances:', unique.size)
console.log('WITHOUT stances:', totalPols - unique.size)

const { data: allPols } = await c.from('politicians').select('id, name, party').order('name')
const missing = allPols.filter(p => !unique.has(p.id))
console.log(`\nMissing stances (${missing.length}):`)
missing.forEach(p => console.log(` - ${p.name} (${p.party})`))
