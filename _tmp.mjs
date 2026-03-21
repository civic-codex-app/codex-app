import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) { const [k,...v] = line.split('='); if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim(); }
const sb = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);
const { count: bills } = await sb.from('bills').select('id', { count: 'exact', head: true });
const { count: votes } = await sb.from('voting_records').select('id', { count: 'exact', head: true });
const { data: sample } = await sb.from('bills').select('bill_number, name, status, congress').limit(5);
console.log(`Bills: ${bills} | Voting records: ${votes}`);
console.log('\nSample:');
for (const b of sample) console.log(`  ${b.bill_number} | ${b.name?.substring(0,50)} | ${b.status} | ${b.congress}`);
