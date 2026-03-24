import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import sharp from 'sharp';

// ---------------------------------------------------------------------------
// Load env
// ---------------------------------------------------------------------------
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

const UA = 'PoliApp/1.0 (civic-engagement-platform)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

/**
 * Try Ballotpedia to find a politician photo.
 * Looks for infobox image or og:image.
 */
async function tryBallotpedia(name) {
  const bpName = name.replace(/ /g, '_');
  const url = `https://ballotpedia.org/${encodeURIComponent(bpName)}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Strategy 1: Look for infobox image (class="infobox-image" or inside .infobox)
    // Pattern: <img ... src="https://..." in infobox area
    let imgUrl = null;

    // Try og:image first (often the best quality)
    const ogMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
      || html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);
    if (ogMatch && ogMatch[1] && !ogMatch[1].includes('Ballotpedia_logo')) {
      imgUrl = ogMatch[1];
    }

    // Try infobox image if no og:image
    if (!imgUrl) {
      // Look for the first real image in the infobox section
      const infoboxMatch = html.match(/<table[^>]*class="[^"]*infobox[^"]*"[^>]*>([\s\S]*?)<\/table>/i);
      if (infoboxMatch) {
        const infoboxHtml = infoboxMatch[1];
        const imgMatch = infoboxHtml.match(/<img[^>]+src="(https?:\/\/[^"]+)"/i);
        if (imgMatch && imgMatch[1] && !imgMatch[1].includes('logo') && !imgMatch[1].includes('icon')) {
          imgUrl = imgMatch[1];
        }
      }
    }

    // Strategy 2: Look for image in the main body with the person's name in alt text
    if (!imgUrl) {
      const lastName = name.split(' ').pop();
      const nameImgRegex = new RegExp(`<img[^>]+alt="[^"]*${lastName}[^"]*"[^>]+src="(https?:\\/\\/[^"]+)"`, 'i');
      const nameMatch = html.match(nameImgRegex);
      if (nameMatch && nameMatch[1]) {
        imgUrl = nameMatch[1];
      }
      // Also try src before alt
      if (!imgUrl) {
        const nameImgRegex2 = new RegExp(`<img[^>]+src="(https?:\\/\\/[^"]+)"[^>]+alt="[^"]*${lastName}[^"]*"`, 'i');
        const nameMatch2 = html.match(nameImgRegex2);
        if (nameMatch2 && nameMatch2[1]) {
          imgUrl = nameMatch2[1];
        }
      }
    }

    if (!imgUrl) return null;

    // Clean up the URL (Ballotpedia sometimes uses protocol-relative URLs)
    if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;

    return imgUrl;
  } catch {
    return null;
  }
}

/**
 * Try Wikipedia API for a portrait thumbnail.
 */
async function tryWikipedia(name) {
  const variants = [
    name.replace(/ /g, '_'),
    `${name.replace(/ /g, '_')}_(politician)`,
    `${name.replace(/ /g, '_')}_(American_politician)`,
  ];

  for (const variant of variants) {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(variant)}`,
        { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(10000) }
      );
      if (!res.ok) continue;
      const json = await res.json();
      if (json?.thumbnail?.source) {
        return json.thumbnail.source.replace(/\/\d+px-/, '/400px-');
      }
    } catch {
      // skip
    }
    await sleep(300);
  }
  return null;
}

/**
 * Download an image, resize to 400x400 WebP with sharp, return buffer.
 */
async function downloadAndOptimize(imageUrl) {
  const res = await fetch(imageUrl, {
    headers: { 'User-Agent': UA },
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) return null;

  const arrayBuf = await res.arrayBuffer();
  const buf = Buffer.from(arrayBuf);

  if (buf.length < 500) return null; // too small, probably an error page

  // Use sharp to resize and convert to WebP
  const optimized = await sharp(buf)
    .resize(400, 400, { fit: 'cover', position: 'top' })
    .webp({ quality: 80 })
    .toBuffer();

  return optimized;
}

/**
 * Upload buffer to R2 and return the public URL.
 */
async function uploadToR2(slug, buffer) {
  const key = `codex/politicians/${slug}.webp`;
  await R2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000, immutable',
  }));
  return `${PUBLIC_URL}/${key}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// Get all politicians without images (paginated)
let all = [], from = 0;
while (true) {
  const { data } = await sb
    .from('politicians')
    .select('id, name, slug')
    .is('image_url', null)
    .range(from, from + 999);
  if (!data || !data.length) break;
  all.push(...data);
  from += 1000;
}

console.log(`Found ${all.length} politicians without images\n`);

if (all.length === 0) {
  console.log('All politicians already have images!');
  process.exit(0);
}

let success = 0, failed = 0, bpHits = 0, wikiHits = 0;

for (let i = 0; i < all.length; i++) {
  const p = all[i];

  // Try Ballotpedia first (best source for state legislators)
  let imageUrl = await tryBallotpedia(p.name);
  let source = 'ballotpedia';

  // Fall back to Wikipedia
  if (!imageUrl) {
    await sleep(500);
    imageUrl = await tryWikipedia(p.name);
    source = 'wikipedia';
  }

  if (!imageUrl) {
    failed++;
    if ((i + 1) % 100 === 0 || i === all.length - 1) {
      console.log(`  [${i + 1}/${all.length}] success=${success} (bp=${bpHits}, wiki=${wikiHits}) failed=${failed}`);
    }
    await sleep(1000); // rate limit even on failures
    continue;
  }

  // Download, optimize, upload
  try {
    const optimized = await downloadAndOptimize(imageUrl);
    if (!optimized) {
      failed++;
      await sleep(1000);
      continue;
    }

    const r2Url = await uploadToR2(p.slug, optimized);
    await sb.from('politicians').update({ image_url: r2Url }).eq('id', p.id);

    success++;
    if (source === 'ballotpedia') bpHits++;
    else wikiHits++;

    if ((i + 1) % 10 === 0) {
      console.log(`  [${i + 1}/${all.length}] ${p.name} <- ${source} | success=${success} failed=${failed}`);
    }
  } catch (e) {
    failed++;
    if ((i + 1) % 50 === 0) {
      console.log(`  [${i + 1}/${all.length}] error for ${p.name}: ${e.message}`);
    }
  }

  // Rate limit: 1 second between requests
  await sleep(1000);

  if ((i + 1) % 100 === 0) {
    console.log(`\n  === Progress: ${i + 1}/${all.length} | success=${success} (bp=${bpHits}, wiki=${wikiHits}) failed=${failed} ===\n`);
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n========== SUMMARY ==========');
console.log(`Total without images:      ${all.length}`);
console.log(`Successfully fetched:      ${success}`);
console.log(`  - from Ballotpedia:      ${bpHits}`);
console.log(`  - from Wikipedia:        ${wikiHits}`);
console.log(`Failed / not found:        ${failed}`);
console.log(`Still missing images:      ${all.length - success}`);
console.log('==============================\n');
