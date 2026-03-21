import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) { const [k, ...v] = line.split('='); if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim(); }
const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);

console.log('=== Sync politician images to incumbent candidates ===');
let synced = 0;
let from = 0;
while (true) {
  const { data: cands, error } = await supabase.from('candidates')
    .select('id, name, politician_id, image_url')
    .not('politician_id', 'is', null)
    .ilike('image_url', '%ui-avatars%')
    .range(from, from + 499);
  if (error || !cands || cands.length === 0) break;
  
  for (const c of cands) {
    const { data: pol } = await supabase.from('politicians').select('image_url').eq('id', c.politician_id).single();
    if (pol?.image_url && !pol.image_url.includes('ui-avatars')) {
      await supabase.from('candidates').update({ image_url: pol.image_url }).eq('id', c.id);
      synced++;
      console.log(`  ✓ ${c.name}`);
    }
  }
  from += 500;
}
console.log(`\nSynced ${synced} incumbent candidates with real politician photos`);

// Final counts
const { data: stillNull } = await supabase.from('candidates').select('id').is('image_url', null);
let polPlaceholder = 0;
from = 0;
while (true) {
  const { data } = await supabase.from('politicians').select('id').ilike('image_url', '%ui-avatars%').range(from, from + 999);
  if (!data || data.length === 0) break;
  polPlaceholder += data.length;
  from += 1000;
}
console.log('\n=== FINAL STATE ===');
console.log('Politicians still with placeholder:', polPlaceholder);
console.log('Candidates with NULL image:', stillNull?.length ?? 0);
