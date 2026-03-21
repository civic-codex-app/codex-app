/**
 * Ballotpedia image scraper — batched by offset.
 * Usage: node bp_batch.mjs <offset> <limit>
 */
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import sharp from 'sharp';

const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) { const [k,...v] = line.split('='); if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim(); }
const sb = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);
const baseEndpoint = vars.R2_ENDPOINT.replace(/\/codex$/, '');
const R2 = new S3Client({ region: 'auto', endpoint: baseEndpoint, credentials: { accessKeyId: vars.R2_ACCESS_KEY_ID, secretAccessKey: vars.R2_SECRET_ACCESS_KEY } });
const PUBLIC_URL = vars.R2_PUBLIC_URL;
const BUCKET = vars.R2_BUCKET_NAME;

const OFFSET = parseInt(process.argv[2] || '0', 10);
const LIMIT = parseInt(process.argv[3] || '1500', 10);

let all = [], from = 0;
while (true) {
  const { data } = await sb.from('politicians').select('id, name, slug, state, party').is('image_url', null).order('name').range(from, from + 999);
  if (!data || !data.length) break;
  all.push(...data);
  from += 1000;
}
all = all.slice(OFFSET, OFFSET + LIMIT);
console.log(`[bp ${OFFSET}-${OFFSET+LIMIT}] Processing ${all.length} politicians`);

let found = 0, missed = 0;

for (let i = 0; i < all.length; i++) {
  const p = all[i];
  const bpName = p.name.replace(/ /g, '_');
  let imageUrl = null;

  try {
    const html = execSync(
      `curl -sL "https://ballotpedia.org/${encodeURIComponent(bpName)}" --max-time 8`,
      { maxBuffer: 5*1024*1024, timeout: 12000 }
    ).toString();

    if (html.length > 1000 && !html.includes('There is currently no Ballotpedia article')) {
      // Try og:image
      const ogMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
      if (ogMatch && ogMatch[1] && !ogMatch[1].includes('Ballotpedia_logo') && !ogMatch[1].includes('favicon')) {
        imageUrl = ogMatch[1];
      }
      // Try infobox image
      if (!imageUrl) {
        const lastName = p.name.split(' ').pop().replace(/[^a-zA-Z]/g, '');
        const imgMatch = html.match(new RegExp(`<img[^>]+src="(https://[^"]+(?:${lastName}|headshot|portrait|official)[^"]*\\.(?:jpg|jpeg|png|webp))"`, 'i'));
        if (imgMatch) imageUrl = imgMatch[1];
      }
    }
  } catch(e) {}

  if (!imageUrl) { missed++; } 
  else {
    try {
      let url = imageUrl.startsWith('//') ? 'https:' + imageUrl : imageUrl;
      const imgData = execSync(`curl -sL "${url}" --max-time 8`, { maxBuffer: 20*1024*1024, timeout: 12000 });
      if (imgData.length > 1000) {
        const optimized = await sharp(imgData).resize(400, 400, { fit: 'cover', position: 'top', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
        const key = `codex/politicians/${p.slug}.webp`;
        await R2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: optimized, ContentType: 'image/webp', CacheControl: 'public, max-age=2592000, s-maxage=31536000' }));
        await sb.from('politicians').update({ image_url: `${PUBLIC_URL}/${key}` }).eq('id', p.id);
        found++;
      } else { missed++; }
    } catch(e) { missed++; }
  }

  // 2.5s delay to stay under radar
  await new Promise(r => setTimeout(r, 2500));
  if ((i+1) % 50 === 0) console.log(`  [bp ${OFFSET}] ${i+1}/${all.length} — ${found} found, ${missed} missed`);
}
console.log(`[bp ${OFFSET}-${OFFSET+LIMIT}] Done! Found: ${found}, Missed: ${missed}`);
