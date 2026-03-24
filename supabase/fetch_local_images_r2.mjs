import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=');
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim();
}

const sb = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);
const baseEndpoint = vars.R2_ENDPOINT.replace(/\/codex$/, '');
const R2 = new S3Client({
  region: 'auto',
  endpoint: baseEndpoint,
  credentials: { accessKeyId: vars.R2_ACCESS_KEY_ID, secretAccessKey: vars.R2_SECRET_ACCESS_KEY },
});
const PUBLIC_URL = vars.R2_PUBLIC_URL;
const BUCKET = vars.R2_BUCKET_NAME;

// Get all politicians without images
let all = [], from = 0;
while (true) {
  const { data } = await sb.from('politicians').select('id, name, slug').is('image_url', null).range(from, from + 999);
  if (!data || !data.length) break;
  all.push(...data);
  from += 1000;
}
console.log(`Found ${all.length} politicians without images`);

let migrated = 0, failed = 0;

for (let i = 0; i < all.length; i++) {
  const p = all[i];
  const wikiName = p.name.replace(/ /g, '_');
  
  // Try Wikipedia API for image
  const variants = [
    wikiName,
    `${wikiName}_(politician)`,
    `${wikiName}_(American_politician)`,
  ];
  
  let imageUrl = null;
  for (const variant of variants) {
    try {
      const json = execSync(
        `curl -s -H "User-Agent: PoliApp/1.0" "https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(variant)}"`,
        { timeout: 10000 }
      ).toString();
      const data = JSON.parse(json);
      if (data.thumbnail && data.thumbnail.source) {
        // Get higher res version
        imageUrl = data.thumbnail.source.replace(/\/\d+px-/, '/400px-');
        break;
      }
    } catch (e) {
      // skip
    }
  }
  
  if (!imageUrl) {
    failed++;
    if ((i + 1) % 25 === 0 || i === all.length - 1) 
      console.log(`  [${i+1}/${all.length}] ${migrated} migrated, ${failed} failed`);
    continue;
  }
  
  // Download image
  try {
    const imgData = execSync(`curl -sL -H "User-Agent: PoliApp/1.0" "${imageUrl}" --max-time 15`, { 
      maxBuffer: 20 * 1024 * 1024,
      timeout: 20000 
    });
    
    if (imgData.length < 1000) {
      failed++;
      continue;
    }
    
    const ext = imageUrl.includes('.png') ? 'png' : 'jpg';
    const key = `codex/politicians/${p.slug}.${ext}`;
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
    
    await R2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: imgData,
      ContentType: contentType,
      CacheControl: 'public, max-age=2592000, s-maxage=31536000',
    }));
    
    const r2Url = `${PUBLIC_URL}/${key}`;
    await sb.from('politicians').update({ image_url: r2Url }).eq('id', p.id);
    migrated++;
  } catch (e) {
    failed++;
  }
  
  // Rate limit - 1.5s between requests
  await new Promise(r => setTimeout(r, 1500));
  
  if ((i + 1) % 25 === 0 || i === all.length - 1)
    console.log(`  [${i+1}/${all.length}] ${migrated} migrated, ${failed} failed`);
}

console.log(`\nDone! Migrated: ${migrated}, Failed: ${failed}`);
