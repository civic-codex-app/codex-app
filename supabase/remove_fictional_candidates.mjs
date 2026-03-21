import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) { const [k, ...v] = line.split('='); if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim(); }
const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);

// Remove all candidates that:
// 1. Have no politician_id (not linked to a real politician) AND
// 2. Were NOT inserted by the real_candidates_2026 seed (which has real people)
// 
// Strategy: Keep candidates that either:
// - Have a politician_id (real incumbent linked to DB)
// - Are in races that were updated by seed_real_candidates_2026 (Senate, Governor, major mayoral)
// - Have a Wikipedia image (not ui-avatars) — these are confirmed real people
//
// Delete candidates that have ui-avatars images AND no politician_id
// These are the generated fictional challengers

console.log('=== Remove fictional candidates ===');

// Count before
const { count: before } = await supabase.from('candidates').select('*', { count: 'exact', head: true });
console.log('Total candidates before:', before);

// Find fictional candidates: no politician_id AND ui-avatars image
let toDelete = [];
let from = 0;
while (true) {
  const { data, error } = await supabase.from('candidates')
    .select('id, name, party, image_url, politician_id, is_incumbent, races!inner(name, chamber)')
    .is('politician_id', null)
    .ilike('image_url', '%ui-avatars%')
    .range(from, from + 999);
  if (error || !data || data.length === 0) break;
  toDelete.push(...data);
  from += 1000;
}

console.log(`Found ${toDelete.length} candidates with no politician link and placeholder image`);

// Show breakdown by chamber
const byChamber = {};
toDelete.forEach(c => {
  const ch = c.races?.chamber || 'unknown';
  byChamber[ch] = (byChamber[ch] || 0) + 1;
});
console.log('By chamber:', byChamber);

// Delete in batches
const BATCH = 100;
let deleted = 0;
for (let i = 0; i < toDelete.length; i += BATCH) {
  const batch = toDelete.slice(i, i + BATCH);
  const ids = batch.map(c => c.id);
  const { error } = await supabase.from('candidates').delete().in('id', ids);
  if (error) {
    console.error('Delete error:', error.message);
  } else {
    deleted += batch.length;
    console.log(`  Deleted ${deleted}/${toDelete.length}`);
  }
}

// Count after
const { count: after } = await supabase.from('candidates').select('*', { count: 'exact', head: true });
console.log(`\nTotal candidates after: ${after}`);
console.log(`Removed ${before - after} fictional candidates`);

// Show what's left
let remaining = [];
from = 0;
while (true) {
  const { data } = await supabase.from('candidates')
    .select('id, name, party, is_incumbent, politician_id, races!inner(chamber)')
    .range(from, from + 999);
  if (!data || data.length === 0) break;
  remaining.push(...data);
  from += 1000;
}

const remainByChamber = {};
remaining.forEach(c => {
  const ch = c.races?.chamber || 'unknown';
  remainByChamber[ch] = (remainByChamber[ch] || 0) + 1;
});
console.log('\nRemaining candidates by chamber:', remainByChamber);

const withPolId = remaining.filter(c => c.politician_id).length;
const incumbents = remaining.filter(c => c.is_incumbent).length;
console.log(`With politician link: ${withPolId}`);
console.log(`Marked as incumbent: ${incumbents}`);
