import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const c = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

let all = []
let from = 0
while (true) {
  const { data } = await c.from('politicians').select('name,slug,state,chamber,party').range(from, from + 999)
  if (!data || !data.length) break
  all.push(...data)
  if (data.length < 1000) break
  from += 1000
}

const grouped = {}
for (const p of all) {
  if (!grouped[p.chamber]) grouped[p.chamber] = []
  grouped[p.chamber].push(p)
}

for (const [chamber, pols] of Object.entries(grouped)) {
  console.log(`\n=== ${chamber.toUpperCase()} (${pols.length}) ===`)
  pols.sort((a, b) => a.name.localeCompare(b.name))
  for (const p of pols) {
    console.log(`${p.slug} | ${p.name} | ${p.party} | ${p.state}`)
  }
}
