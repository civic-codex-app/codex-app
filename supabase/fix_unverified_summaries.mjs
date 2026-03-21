/**
 * Set honest summaries for unverified stances.
 * Verified stances keep their hand-written summaries.
 * Unverified stances get a clear disclaimer.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=');
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim();
}
const sb = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);

// Get all unverified stances
let count = 0;
let from = 0;
const BATCH = 1000;

while (true) {
  const { data } = await sb.from('politician_issues')
    .select('id')
    .eq('is_verified', false)
    .range(from, from + BATCH - 1);

  if (!data || !data.length) break;

  const ids = data.map(r => r.id);

  // Update all in this batch to honest summary
  const { error } = await sb.from('politician_issues')
    .update({ summary: 'Estimated position based on party affiliation and voting patterns. Not yet verified from official statements or voting records.' })
    .in('id', ids);

  if (error) console.error('Batch error:', error.message);

  count += data.length;
  if (count % 5000 < BATCH) console.log(`  Updated ${count} unverified stances`);

  if (data.length < BATCH) break;
  from += BATCH;
}

console.log(`\nDone! Updated ${count} unverified stance summaries.`);
