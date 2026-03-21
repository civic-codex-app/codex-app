import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const c = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

const { data } = await c.from('politicians').select('chamber').order('chamber')
const chambers = {}
data.forEach(p => { chambers[p.chamber] = (chambers[p.chamber] || 0) + 1 })
console.log('Chamber breakdown:', chambers)

// Check the chamber_type enum
const { data: types } = await c.from('politicians').select('chamber').order('chamber')
const uniqueChambers = [...new Set(types.map(t => t.chamber))]
console.log('Unique chambers:', uniqueChambers)
