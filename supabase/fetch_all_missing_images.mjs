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
  const { data } = await sb.from('politicians').select('id, name, slug, state, chamber, title').is('image_url', null).range(from, from + 999);
  if (!data || !data.length) break;
  all.push(...data);
  from += 1000;
}
console.log(`Found ${all.length} politicians without images`);

// Try multiple Wikipedia name variants
function getVariants(name, state, title) {
  const wiki = name.replace(/ /g, '_');
  const variants = [wiki];

  // Try with state
  if (state) variants.push(`${wiki}_(${state}_politician)`);

  // Try common disambiguators
  variants.push(`${wiki}_(politician)`);
  variants.push(`${wiki}_(American_politician)`);

  // For state legislators, try with chamber info
  if (title) {
    if (title.includes('State Senator')) variants.push(`${wiki}_(${state}_state_senator)`);
    if (title.includes('State Representative') || title.includes('Delegate') || title.includes('Assembly')) {
      variants.push(`${wiki}_(${state}_politician)`);
    }
  }

  return variants;
}

let migrated = 0, failed = 0;
const DELAY = 500; // 500ms between requests

for (let i = 0; i < all.length; i++) {
  const p = all[i];
  const variants = getVariants(p.name, p.state, p.title);

  let imageUrl = null;
  for (const variant of variants) {
    try {
      const json = execSync(
        `curl -s -H "User-Agent: CodexApp/1.0 (civic-engagement-platform)" "https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(variant)}"`,
        { timeout: 8000 }
      ).toString();
      const data = JSON.parse(json);
      if (data.thumbnail && data.thumbnail.source) {
        imageUrl = data.thumbnail.source.replace(/\/\d+px-/, '/400px-');
        break;
      }
    } catch (e) {
      // skip
    }
  }

  if (!imageUrl) {
    failed++;
    if ((i + 1) % 500 === 0 || i === all.length - 1)
      console.log(`  [${i+1}/${all.length}] ${migrated} migrated, ${failed} failed`);
    continue;
  }

  // Download and upload to R2
  try {
    const imgData = execSync(`curl -sL -H "User-Agent: CodexApp/1.0" "${imageUrl}" --max-time 10`, {
      maxBuffer: 20 * 1024 * 1024,
      timeout: 15000
    });

    if (imgData.length < 1000) {
      failed++;
      continue;
    }

    const ext = imageUrl.includes('.png') ? 'png' : 'jpg';
    const key = `codex/politicians/${p.slug}.${ext}`;

    await R2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: imgData,
      ContentType: ext === 'png' ? 'image/png' : 'image/jpeg',
      CacheControl: 'public, max-age=2592000, s-maxage=31536000',
    }));

    await sb.from('politicians').update({ image_url: `${PUBLIC_URL}/${key}` }).eq('id', p.id);
    migrated++;
  } catch (e) {
    failed++;
  }

  await new Promise(r => setTimeout(r, DELAY));

  if ((i + 1) % 500 === 0 || i === all.length - 1)
    console.log(`  [${i+1}/${all.length}] ${migrated} migrated, ${failed} failed`);
}

console.log(`\nDone! Migrated: ${migrated}, Failed: ${failed}`);
