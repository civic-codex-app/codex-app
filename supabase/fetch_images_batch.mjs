/**
 * Fetch images from Wikidata for a specific chamber subset.
 * Usage: node fetch_images_batch.mjs <chamber> [offset]
 * Example: node fetch_images_batch.mjs state_senate 0
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

const CHAMBER = process.argv[2] || 'state_senate';
const OFFSET = parseInt(process.argv[3] || '0', 10);

// Get politicians without images for this chamber
let all = [], from = 0;
while (true) {
  let query = sb.from('politicians').select('id, name, slug, state').is('image_url', null);
  if (CHAMBER === 'local') {
    query = query.in('chamber', ['mayor', 'city_council', 'county', 'school_board', 'other_local']);
  } else {
    query = query.eq('chamber', CHAMBER);
  }
  const { data } = await query.range(from, from + 999);
  if (!data || !data.length) break;
  all.push(...data);
  from += 1000;
}

// Apply offset
all = all.slice(OFFSET);
console.log(`[${CHAMBER}] Processing ${all.length} politicians (offset ${OFFSET})`);

let migrated = 0, failed = 0;

for (let i = 0; i < all.length; i++) {
  const p = all[i];
  let imageUrl = null;

  // Wikidata entity search + P18
  try {
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(p.name)}&language=en&limit=3&format=json`;
    const searchResult = execSync(
      `curl -s -H "User-Agent: CivicDataProject/1.0" "${searchUrl}"`,
      { timeout: 8000 }
    ).toString();
    const searchJson = JSON.parse(searchResult);

    for (const entity of (searchJson.search || [])) {
      const desc = (entity.description || '').toLowerCase();
      if (!desc.includes('politic') && !desc.includes('legislat') && !desc.includes('senator') &&
          !desc.includes('representative') && !desc.includes('member') && !desc.includes('mayor') &&
          !desc.includes('governor') && !desc.includes('attorney') && !desc.includes('sheriff') &&
          !desc.includes('judge') && !desc.includes('council') && !desc.includes('american')) continue;

      const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${entity.id}&property=P18&format=json`;
      const claimsResult = execSync(
        `curl -s -H "User-Agent: CivicDataProject/1.0" "${entityUrl}"`,
        { timeout: 8000 }
      ).toString();
      const claims = JSON.parse(claimsResult);
      const imageClaims = claims?.claims?.P18;
      if (imageClaims && imageClaims.length > 0) {
        const filename = imageClaims[0].mainsnak?.datavalue?.value;
        if (filename) {
          imageUrl = `https://commons.wikimedia.org/w/thumb.php?width=400&f=${encodeURIComponent(filename.replace(/ /g, '_'))}`;
          break;
        }
      }
    }
  } catch (e) {}

  // Fallback: Wikipedia REST API with name variants
  if (!imageUrl) {
    const wikiName = p.name.replace(/ /g, '_');
    for (const variant of [wikiName, `${wikiName}_(politician)`, `${wikiName}_(${p.state}_politician)`]) {
      try {
        const json = execSync(
          `curl -s -H "User-Agent: CivicDataProject/1.0" "https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(variant)}"`,
          { timeout: 6000 }
        ).toString();
        const data = JSON.parse(json);
        if (data.thumbnail?.source) {
          imageUrl = data.thumbnail.source.replace(/\/\d+px-/, '/400px-');
          break;
        }
      } catch (e) {}
    }
  }

  if (!imageUrl) {
    failed++;
    if ((i + 1) % 100 === 0) console.log(`  [${CHAMBER}] [${i+1}/${all.length}] ${migrated} found, ${failed} missed`);
    await new Promise(r => setTimeout(r, 300));
    continue;
  }

  try {
    const imgData = execSync(`curl -sL -H "User-Agent: CivicDataProject/1.0" "${imageUrl}" --max-time 10`, {
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
  } catch (e) { failed++; }

  await new Promise(r => setTimeout(r, 500));
  if ((i + 1) % 100 === 0) console.log(`  [${CHAMBER}] [${i+1}/${all.length}] ${migrated} found, ${failed} missed`);
}

console.log(`\n[${CHAMBER}] Done! Found: ${migrated}, Missed: ${failed}`);
