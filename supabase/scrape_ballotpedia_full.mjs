/**
 * Enhanced Ballotpedia scraper — grabs photo, website, social media, bio from each page.
 * Skips politicians that already have images (from previous run).
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

// Get all politicians — we'll update data for ALL, but only fetch images for those without
let all = [], from = 0;
while (true) {
  const { data } = await sb.from('politicians')
    .select('id, name, slug, state, party, chamber, image_url, website_url, twitter_url, bio')
    .range(from, from + 999);
  if (!data || !data.length) break;
  all.push(...data);
  from += 1000;
}

// Prioritize those without images, then those missing website/bio
const needsImage = all.filter(p => !p.image_url);
const hasImage = all.filter(p => p.image_url && (!p.website_url || !p.twitter_url));
const toProcess = [...needsImage, ...hasImage];

console.log(`Total politicians: ${all.length}`);
console.log(`Need images: ${needsImage.length}`);
console.log(`Have image but missing website/social: ${hasImage.length}`);
console.log(`Total to process: ${toProcess.length}`);

let imgSuccess = 0, dataSuccess = 0, failed = 0;

function extractFromHtml(html, name) {
  const result = { imageUrl: null, website: null, twitter: null, facebook: null, bio: null };

  // Extract og:image
  const ogMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  if (ogMatch && ogMatch[1] && !ogMatch[1].includes('Ballotpedia_logo')) {
    result.imageUrl = ogMatch[1];
  }

  // If no og:image, try infobox image
  if (!result.imageUrl) {
    const infoboxImg = html.match(/<img[^>]+class="[^"]*thumb[^"]*"[^>]+src="([^"]+)"/i);
    if (infoboxImg) result.imageUrl = infoboxImg[1];
  }

  // Try any image with the person's last name
  if (!result.imageUrl) {
    const lastName = name.split(' ').pop().replace(/[^a-zA-Z]/g, '');
    const nameRegex = new RegExp(`<img[^>]+src="(https://[^"]+${lastName}[^"]*\\.(?:jpg|jpeg|png|webp))"`, 'i');
    const nameMatch = html.match(nameRegex);
    if (nameMatch) result.imageUrl = nameMatch[1];
  }

  // Extract official website from infobox
  const websiteMatch = html.match(/Website[^<]*<[^>]*>[^<]*<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>(?:Official|Website|Link)/i);
  if (websiteMatch) result.website = websiteMatch[1];

  // Try alternate website pattern
  if (!result.website) {
    const altWebsite = html.match(/<a[^>]+href="(https?:\/\/(?:www\.)?[^"]*\.gov[^"]*)"[^>]*class="external/i);
    if (altWebsite) result.website = altWebsite[1];
  }

  // Extract Twitter
  const twitterMatch = html.match(/twitter\.com\/([a-zA-Z0-9_]+)/i) || html.match(/x\.com\/([a-zA-Z0-9_]+)/i);
  if (twitterMatch && twitterMatch[1] !== 'share' && twitterMatch[1] !== 'intent') {
    result.twitter = twitterMatch[1];
  }

  // Extract Facebook
  const fbMatch = html.match(/facebook\.com\/([a-zA-Z0-9.]+)/i);
  if (fbMatch && fbMatch[1] !== 'sharer' && fbMatch[1] !== 'share') {
    result.facebook = `https://facebook.com/${fbMatch[1]}`;
  }

  // Extract bio — first paragraph of the main content
  const bioMatch = html.match(/<div[^>]*id="mw-content-text"[^>]*>.*?<p>([^<]{50,500})/s);
  if (bioMatch) {
    // Clean HTML tags
    result.bio = bioMatch[1]
      .replace(/<[^>]+>/g, '')
      .replace(/\[\d+\]/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  return result;
}

for (let i = 0; i < toProcess.length; i++) {
  const p = toProcess[i];
  const bpName = p.name.replace(/ /g, '_');
  const bpUrl = `https://ballotpedia.org/${encodeURIComponent(bpName)}`;

  let html = '';
  try {
    html = execSync(
      `curl -sL -H "User-Agent: CodexApp/1.0 (civic-engagement-platform)" "${bpUrl}" --max-time 10`,
      { maxBuffer: 5 * 1024 * 1024, timeout: 15000 }
    ).toString();
  } catch (e) {
    failed++;
    if ((i + 1) % 100 === 0) console.log(`  === [${i+1}/${toProcess.length}] img=${imgSuccess} data=${dataSuccess} failed=${failed} ===`);
    await new Promise(r => setTimeout(r, 1000));
    continue;
  }

  if (!html || html.length < 1000 || html.includes('There is currently no Ballotpedia article')) {
    failed++;
    if ((i + 1) % 100 === 0) console.log(`  === [${i+1}/${toProcess.length}] img=${imgSuccess} data=${dataSuccess} failed=${failed} ===`);
    await new Promise(r => setTimeout(r, 1000));
    continue;
  }

  const extracted = extractFromHtml(html, p.name);

  // Build update object
  const update = {};

  // Image — only if they don't have one
  if (!p.image_url && extracted.imageUrl) {
    try {
      let imgUrl = extracted.imageUrl;
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;

      const imgData = execSync(`curl -sL -H "User-Agent: CodexApp/1.0" "${imgUrl}" --max-time 10`, {
        maxBuffer: 20 * 1024 * 1024, timeout: 15000
      });

      if (imgData.length > 1000) {
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

        update.image_url = `${PUBLIC_URL}/${key}`;
        imgSuccess++;
      }
    } catch (e) { /* image download failed */ }
  }

  // Website — only if missing
  if (!p.website_url && extracted.website) {
    update.website_url = extracted.website;
  }

  // Twitter — only if missing
  if (!p.twitter_url && extracted.twitter) {
    update.twitter_url = "https://x.com/" + extracted.twitter;
  }

  // Facebook — only if missing
  if (!p.facebook_url && extracted.facebook) {
    update.facebook_url = extracted.facebook;
  }

  // Bio — only update if current bio is generic/short
  if (extracted.bio && extracted.bio.length > 50) {
    const currentBio = p.bio || '';
    const isGeneric = currentBio.length < 80 ||
      currentBio.includes('State Senator') ||
      currentBio.includes('State Representative') ||
      currentBio.includes('representing District');
    if (isGeneric) {
      update.bio = extracted.bio.substring(0, 500);
    }
  }

  if (Object.keys(update).length > 0) {
    await sb.from('politicians').update(update).eq('id', p.id);
    dataSuccess++;
  } else {
    failed++;
  }

  if ((i + 1) % 100 === 0)
    console.log(`  === [${i+1}/${toProcess.length}] img=${imgSuccess} data=${dataSuccess} failed=${failed} ===`);

  await new Promise(r => setTimeout(r, 1000));
}

console.log(`\n=== DONE ===`);
console.log(`Images found: ${imgSuccess}`);
console.log(`Data updated: ${dataSuccess}`);
console.log(`Failed: ${failed}`);
