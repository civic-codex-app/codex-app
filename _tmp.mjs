import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) { const [k,...v] = line.split('='); if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim(); }
const sb = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);

// Find all webp URLs and check if they're broken
let broken = 0, ok = 0, fixed = 0;
let from = 0;
while (true) {
  const { data } = await sb.from('politicians').select('id, image_url').not('image_url', 'is', null).like('image_url', '%.webp').range(from, from + 99);
  if (!data || !data.length) break;
  
  for (const p of data) {
    try {
      const code = execSync(`curl -s -o /dev/null -w "%{http_code}" "${p.image_url}"`, { timeout: 5000 }).toString().trim();
      if (code === '200') { ok++; continue; }
    } catch(e) {}
    
    // Try .jpg version
    const jpgUrl = p.image_url.replace('.webp', '.jpg');
    try {
      const code = execSync(`curl -s -o /dev/null -w "%{http_code}" "${jpgUrl}"`, { timeout: 5000 }).toString().trim();
      if (code === '200') {
        await sb.from('politicians').update({ image_url: jpgUrl }).eq('id', p.id);
        fixed++;
        continue;
      }
    } catch(e) {}
    
    // Try .png version
    const pngUrl = p.image_url.replace('.webp', '.png');
    try {
      const code = execSync(`curl -s -o /dev/null -w "%{http_code}" "${pngUrl}"`, { timeout: 5000 }).toString().trim();
      if (code === '200') {
        await sb.from('politicians').update({ image_url: pngUrl }).eq('id', p.id);
        fixed++;
        continue;
      }
    } catch(e) {}
    
    // Truly broken — clear it
    await sb.from('politicians').update({ image_url: null }).eq('id', p.id);
    broken++;
  }
  
  from += 100;
  if (from % 500 < 100) console.log(`  Checked ${from}: ${ok} ok, ${fixed} fixed, ${broken} broken`);
}
console.log(`Done: ${ok} ok, ${fixed} fixed to jpg/png, ${broken} cleared`);
