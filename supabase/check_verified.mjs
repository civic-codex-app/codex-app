import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Test if is_verified column exists
const { data, error } = await supabase
  .from('politician_issues')
  .select('id, is_verified')
  .limit(3)

if (error) {
  console.log('Column does NOT exist:', error.message)
} else {
  console.log('Column exists! Sample:', data)

  // Count verified
  const { count } = await supabase
    .from('politician_issues')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', true)
  console.log('Verified count:', count)

  const { count: total } = await supabase
    .from('politician_issues')
    .select('*', { count: 'exact', head: true })
  console.log('Total count:', total)
}
