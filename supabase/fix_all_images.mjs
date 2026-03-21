import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) { const [k, ...v] = line.split('='); if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim(); }
const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);

const delay = ms => new Promise(r => setTimeout(r, ms));

async function wikiImage(name) {
  // Try multiple name variations
  const variations = [
    name,
    name + ' (politician)',
    name + ' (American politician)',
    name + ' (Florida politician)',
    name + ' (Texas politician)',
    name + ' (New York politician)',
    name + ' (California politician)',
    name.replace(/ Jr\.?$/, ''),
    name.replace(/ Sr\.?$/, ''),
    name.replace(/^(\w+) (\w)\. /, '$1 '),  // Remove middle initial
    name.replace(/"[^"]+"\s*/, ''),  // Remove quoted nicknames
  ];

  for (const v of variations) {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(v)}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.thumbnail?.source) {
          // Check it's about a person/politician (not a city, etc.)
          const desc = (json.description || '').toLowerCase();
          const extract = (json.extract || '').toLowerCase();
          if (desc.includes('politician') || desc.includes('governor') || desc.includes('senator') ||
              desc.includes('representative') || desc.includes('mayor') || desc.includes('member') ||
              desc.includes('attorney') || desc.includes('secretary') || desc.includes('president') ||
              extract.includes('politician') || extract.includes('congress') || extract.includes('senate') ||
              extract.includes('governor') || extract.includes('representative') || extract.includes('mayor') ||
              v.includes('politician')) {
            return json.thumbnail.source.replace(/\/\d+px-/, '/440px-');
          }
        }
      }
      await delay(150);
    } catch {}
  }
  return null;
}

// === PART 1: Fix 108 politicians with ui-avatars ===
console.log('=== PART 1: Fix politicians with placeholder images ===');
let pols = [];
let from = 0;
while (true) {
  const { data } = await supabase.from('politicians').select('id, name, slug, chamber, image_url')
    .ilike('image_url', '%ui-avatars%').range(from, from + 999);
  if (!data || data.length === 0) break;
  pols.push(...data);
  from += 1000;
}
console.log(`Found ${pols.length} politicians with placeholder images`);

let polFixed = 0;
for (let i = 0; i < pols.length; i++) {
  const p = pols[i];
  const img = await wikiImage(p.name);
  if (img) {
    const { error } = await supabase.from('politicians').update({ image_url: img }).eq('id', p.id);
    if (!error) { polFixed++; console.log(`  [${i+1}/${pols.length}] ✓ ${p.name}`); }
    else console.log(`  [${i+1}/${pols.length}] ✗ ${p.name} — DB error`);
  } else {
    console.log(`  [${i+1}/${pols.length}] ✗ ${p.name} — no Wikipedia match`);
  }
  await delay(200);
}
console.log(`Fixed ${polFixed}/${pols.length} politicians\n`);

// === PART 2: Fix candidates with NULL images ===
console.log('=== PART 2: Fix candidates with NULL images ===');
const { data: nullCands } = await supabase.from('candidates').select('id, name, politician_id, image_url').is('image_url', null);
console.log(`Found ${nullCands?.length ?? 0} candidates with NULL images`);

let candFixed = 0;
for (const c of (nullCands || [])) {
  // First try linked politician
  if (c.politician_id) {
    const { data: pol } = await supabase.from('politicians').select('image_url').eq('id', c.politician_id).single();
    if (pol?.image_url && !pol.image_url.includes('ui-avatars')) {
      await supabase.from('candidates').update({ image_url: pol.image_url }).eq('id', c.id);
      candFixed++;
      console.log(`  ✓ ${c.name} — from linked politician`);
      continue;
    }
  }
  // Try Wikipedia
  const img = await wikiImage(c.name);
  if (img) {
    await supabase.from('candidates').update({ image_url: img }).eq('id', c.id);
    candFixed++;
    console.log(`  ✓ ${c.name} — from Wikipedia`);
  } else {
    // Fallback to ui-avatars
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&size=400&background=random&color=fff&bold=true`;
    await supabase.from('candidates').update({ image_url: avatar }).eq('id', c.id);
    console.log(`  ~ ${c.name} — fallback to avatar`);
  }
  await delay(200);
}
console.log(`Fixed ${candFixed}/${nullCands?.length ?? 0} candidates\n`);

// === PART 3: Copy politician images to their incumbent candidates ===
console.log('=== PART 3: Sync politician images to incumbent candidates ===');
let synced = 0;
from = 0;
while (true) {
  const { data: cands } = await supabase.from('candidates')
    .select('id, name, politician_id, image_url')
    .not('politician_id', 'is', null)
    .ilike('image_url', '%ui-avatars%')
    .range(from, from + 499);
  if (!data || data.length === 0) break;
  
  for (const c of cands) {
    const { data: pol } = await supabase.from('politicians').select('image_url').eq('id', c.politician_id).single();
    if (pol?.image_url && !pol.image_url.includes('ui-avatars')) {
      await supabase.from('candidates').update({ image_url: pol.image_url }).eq('id', c.id);
      synced++;
    }
  }
  from += 500;
}
console.log(`Synced ${synced} incumbent candidates with politician photos`);

// === SUMMARY ===
const { data: stillNull } = await supabase.from('candidates').select('id').is('image_url', null);
let stillAvatar = 0;
from = 0;
while (true) {
  const { data } = await supabase.from('candidates').select('id').ilike('image_url', '%ui-avatars%').range(from, from + 999);
  if (!data || data.length === 0) break;
  stillAvatar += data.length;
  from += 1000;
}
let polStillAvatar = 0;
from = 0;
while (true) {
  const { data } = await supabase.from('politicians').select('id').ilike('image_url', '%ui-avatars%').range(from, from + 999);
  if (!data || data.length === 0) break;
  polStillAvatar += data.length;
  from += 1000;
}
console.log('\n=== FINAL STATE ===');
console.log('Politicians still with placeholder:', polStillAvatar);
console.log('Candidates with NULL image:', stillNull?.length ?? 0);
console.log('Candidates with ui-avatars:', stillAvatar);
