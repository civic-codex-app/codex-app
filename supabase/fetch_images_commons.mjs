/**
 * Fetch politician images from Wikimedia Commons categories.
 * State legislatures have category pages with member photos.
 * Also tries Wikidata property P18 (image) via entity search.
 */
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import sharp from 'sharp';

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
  const { data } = await sb.from('politicians').select('id, name, slug, state').is('image_url', null).range(from, from + 999);
  if (!data || !data.length) break;
  all.push(...data);
  from += 1000;
}
console.log(`Found ${all.length} politicians without images`);

let migrated = 0, failed = 0;

for (let i = 0; i < all.length; i++) {
  const p = all[i];
  let imageUrl = null;

  // Approach 1: Wikidata entity search + P18 property
  try {
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(p.name)}&language=en&limit=3&format=json`;
    const searchResult = execSync(
      `curl -s -H "User-Agent: PoliCivicApp/1.0" "${searchUrl}"`,
      { timeout: 8000 }
    ).toString();
    const searchJson = JSON.parse(searchResult);

    for (const entity of (searchJson.search || [])) {
      // Check if description mentions politician/legislator/senator/representative
      const desc = (entity.description || '').toLowerCase();
      if (!desc.includes('politic') && !desc.includes('legislat') && !desc.includes('senator') &&
          !desc.includes('representative') && !desc.includes('member') && !desc.includes('mayor') &&
          !desc.includes('governor') && !desc.includes('attorney') && !desc.includes('sheriff') &&
          !desc.includes('judge') && !desc.includes('council')) continue;

      // Get entity details with P18 (image) claim
      const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${entity.id}&property=P18&format=json`;
      const claimsResult = execSync(
        `curl -s -H "User-Agent: PoliCivicApp/1.0" "${entityUrl}"`,
        { timeout: 8000 }
      ).toString();
      const claims = JSON.parse(claimsResult);

      const imageClaims = claims?.claims?.P18;
      if (imageClaims && imageClaims.length > 0) {
        const filename = imageClaims[0].mainsnak?.datavalue?.value;
        if (filename) {
          // Convert to Commons thumbnail URL
          const encoded = encodeURIComponent(filename.replace(/ /g, '_'));
          imageUrl = `https://commons.wikimedia.org/w/thumb.php?width=400&f=${encoded}`;
          break;
        }
      }
    }
  } catch (e) {
    // Wikidata search failed
  }

  if (!imageUrl) {
    failed++;
    if ((i + 1) % 200 === 0 || i === all.length - 1)
      console.log(`  [${i+1}/${all.length}] ${migrated} migrated, ${failed} failed`);
    await new Promise(r => setTimeout(r, 500));
    continue;
  }

  // Download, optimize, upload
  try {
    const imgData = execSync(`curl -sL -H "User-Agent: PoliCivicApp/1.0" "${imageUrl}" --max-time 10`, {
      maxBuffer: 20 * 1024 * 1024, timeout: 15000
    });

    if (imgData.length < 1000) { failed++; continue; }

    const optimized = await sharp(imgData)
      .resize(400, 400, { fit: 'cover', position: 'top', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const key = `codex/politicians/${p.slug}.webp`;
    await R2.send(new PutObjectCommand({
      Bucket: BUCKET, Key: key, Body: optimized,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=2592000, s-maxage=31536000',
    }));

    await sb.from('politicians').update({ image_url: `${PUBLIC_URL}/${key}` }).eq('id', p.id);
    migrated++;
  } catch (e) {
    failed++;
  }

  await new Promise(r => setTimeout(r, 800));

  if ((i + 1) % 200 === 0 || i === all.length - 1)
    console.log(`  [${i+1}/${all.length}] ${migrated} migrated, ${failed} failed`);
}

console.log(`\nDone! Migrated: ${migrated}, Failed: ${failed}`);
