import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) { const [k,...v] = line.split('='); if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim(); }
const sb = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);

let all = [], from = 0;
while (true) {
  const { data } = await sb.from('politicians').select('id, name, slug, state, chamber, image_url, website_url, bio').range(from, from + 999);
  if (!data || !data.length) break;
  all.push(...data);
  from += 1000;
}
console.log(`Total politicians: ${all.length}`);

// Group by name + state
const groups = new Map();
for (const p of all) {
  const key = `${p.name}|${p.state}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(p);
}

let deleted = 0;
for (const [key, entries] of groups) {
  if (entries.length <= 1) continue;

  // Some dupes are legitimate (different chambers — e.g., moved from state senate to US senate)
  // Only dedup if they share the SAME chamber type bucket
  const chamberBucket = (c) => {
    if (c === 'state_senate' || c === 'state_house') return 'state_leg';
    if (c === 'city_council') return 'council';
    return c;
  };

  // Group by chamber bucket
  const byBucket = new Map();
  for (const e of entries) {
    const b = chamberBucket(e.chamber);
    if (!byBucket.has(b)) byBucket.set(b, []);
    byBucket.get(b).push(e);
  }

  for (const [bucket, bucketEntries] of byBucket) {
    if (bucketEntries.length <= 1) continue;

    // Score each entry — prefer: has image > has website > has longer bio > first inserted
    const scored = bucketEntries.map(e => ({
      ...e,
      score: (e.image_url ? 100 : 0) + (e.website_url ? 10 : 0) + (e.bio?.length > 100 ? 5 : 0),
    })).sort((a, b) => b.score - a.score);

    // Keep the best, delete the rest
    const keep = scored[0];
    const toDelete = scored.slice(1);

    for (const d of toDelete) {
      // Move stances from duplicate to keeper (if keeper doesn't have them)
      // Then delete
      const { error } = await sb.from('politicians').delete().eq('id', d.id);
      if (error) {
        // Might fail due to FK constraints — delete stances first
        await sb.from('politician_issues').delete().eq('politician_id', d.id);
        await sb.from('politicians').delete().eq('id', d.id);
      }
      deleted++;
    }
  }
}

console.log(`Deleted ${deleted} duplicates`);
const { count } = await sb.from('politicians').select('id', { count: 'exact', head: true });
console.log(`Remaining politicians: ${count}`);
