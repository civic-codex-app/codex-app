/**
 * Fetch politician images from Wikidata (broader coverage than Wikipedia).
 * Wikidata has images for many state legislators that don't have Wikipedia articles.
 * Uses the Wikidata SPARQL endpoint to find images by name.
 */
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
  const { data } = await sb.from('politicians').select('id, name, slug, state, chamber').is('image_url', null).range(from, from + 999);
  if (!data || !data.length) break;
  all.push(...data);
  from += 1000;
}
console.log(`Found ${all.length} politicians without images`);

let migrated = 0, failed = 0;

for (let i = 0; i < all.length; i++) {
  const p = all[i];

  // Query Wikidata SPARQL for image by name
  const sparql = `
    SELECT ?image WHERE {
      ?person wdt:P31 wd:Q5 ;
              rdfs:label "${p.name}"@en ;
              wdt:P18 ?image .
    } LIMIT 1
  `.trim();

  let imageUrl = null;
  try {
    const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`;
    const result = execSync(
      `curl -s -H "User-Agent: PoliApp/1.0 (civic-engagement-platform)" -H "Accept: application/json" "${url}"`,
      { timeout: 10000 }
    ).toString();

    const json = JSON.parse(result);
    const bindings = json?.results?.bindings;
    if (bindings && bindings.length > 0 && bindings[0].image) {
      // Wikidata gives Wikimedia Commons URL like:
      // http://commons.wikimedia.org/wiki/Special:FilePath/Filename.jpg
      const commonsUrl = bindings[0].image.value;
      // Convert to direct thumbnail URL (400px)
      const filename = commonsUrl.split('/').pop();
      imageUrl = `https://commons.wikimedia.org/w/thumb.php?width=400&f=${filename}`;
    }
  } catch (e) {
    // SPARQL query failed
  }

  if (!imageUrl) {
    failed++;
    if ((i + 1) % 500 === 0 || i === all.length - 1)
      console.log(`  [${i+1}/${all.length}] ${migrated} migrated, ${failed} failed`);
    continue;
  }

  // Download and upload to R2
  try {
    const imgData = execSync(`curl -sL -H "User-Agent: PoliApp/1.0" "${imageUrl}" --max-time 10`, {
      maxBuffer: 20 * 1024 * 1024,
      timeout: 15000
    });

    if (imgData.length < 1000) {
      failed++;
      continue;
    }

    const key = `codex/politicians/${p.slug}.webp`;

    // Convert to webp via sharp-cli if available, otherwise upload as-is
    let uploadBuffer = imgData;
    let contentType = 'image/jpeg';
    try {
      // Try to import sharp for optimization
      const sharp = (await import('sharp')).default;
      uploadBuffer = await sharp(imgData)
        .resize(400, 400, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      contentType = 'image/webp';
    } catch (e) {
      // sharp not available, upload raw
    }

    await R2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: uploadBuffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=2592000, s-maxage=31536000',
    }));

    await sb.from('politicians').update({ image_url: `${PUBLIC_URL}/${key}` }).eq('id', p.id);
    migrated++;
  } catch (e) {
    failed++;
  }

  // Rate limit — Wikidata SPARQL is more generous but still throttles
  await new Promise(r => setTimeout(r, 800));

  if ((i + 1) % 500 === 0 || i === all.length - 1)
    console.log(`  [${i+1}/${all.length}] ${migrated} migrated, ${failed} failed`);
}

console.log(`\nDone! Migrated: ${migrated}, Failed: ${failed}`);
