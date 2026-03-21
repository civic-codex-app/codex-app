import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const c = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

const { data } = await c.from('politicians').select('name, slug, chamber, image_url').is('image_url', null).order('chamber').order('name')
console.log(`Politicians missing images: ${data.length}`)
data.forEach(p => console.log(`  ${p.chamber.padEnd(13)} ${p.name}`))
