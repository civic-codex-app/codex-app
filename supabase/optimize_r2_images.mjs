/**
 * Download all images from R2, optimize them (resize + compress), and reupload.
 *
 * Prerequisites:
 *   brew install sharp-cli   (or: pnpm add sharp)
 *
 * What it does:
 *   1. Lists all objects in the R2 bucket under codex/politicians/ and codex/candidates/
 *   2. Downloads each to /tmp/codex-images/original/
 *   3. Optimizes with sharp: resize to max 400x400, compress as JPEG quality 80
 *   4. Uploads optimized versions back to R2 (same keys)
 *   5. Reports size savings
 */

import { createClient } from '@supabase/supabase-js';
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, mkdirSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=');
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim();
}

const baseEndpoint = vars.R2_ENDPOINT.replace(/\/codex$/, '');
const R2 = new S3Client({
  region: 'auto',
  endpoint: baseEndpoint,
  credentials: { accessKeyId: vars.R2_ACCESS_KEY_ID, secretAccessKey: vars.R2_SECRET_ACCESS_KEY },
});
const BUCKET = vars.R2_BUCKET_NAME;
const PUBLIC_URL = vars.R2_PUBLIC_URL;
const sb = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY);

const DOWNLOAD_DIR = '/tmp/codex-images/original';
const OPTIMIZED_DIR = '/tmp/codex-images/optimized';
mkdirSync(DOWNLOAD_DIR, { recursive: true });
mkdirSync(OPTIMIZED_DIR, { recursive: true });

// List all objects
console.log('Listing R2 objects...');
let allKeys = [];
let continuationToken;
do {
  const cmd = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: 'codex/',
    MaxKeys: 1000,
    ContinuationToken: continuationToken,
  });
  const result = await R2.send(cmd);
  if (result.Contents) {
    allKeys.push(...result.Contents.map(o => ({ key: o.Key, size: o.Size })));
  }
  continuationToken = result.NextContinuationToken;
} while (continuationToken);

console.log(`Found ${allKeys.length} images in R2`);
const totalOriginalSize = allKeys.reduce((s, o) => s + o.size, 0);
console.log(`Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(1)} MB`);

// Process in batches
let processed = 0, optimized = 0, errors = 0;
let totalSaved = 0;

for (const obj of allKeys) {
  try {
    // Download
    const getResult = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: obj.key }));
    const chunks = [];
    for await (const chunk of getResult.Body) chunks.push(chunk);
    const originalBuffer = Buffer.concat(chunks);

    // Optimize with sharp
    const optimizedBuffer = await sharp(originalBuffer)
      .resize(400, 400, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const saved = originalBuffer.length - optimizedBuffer.length;

    // Only reupload if we actually saved space
    if (saved > 0) {
      // Change extension to .webp
      const newKey = obj.key.replace(/\.(png|jpg|jpeg|avif)$/i, '.webp');

      await R2.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: newKey,
        Body: optimizedBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=2592000, s-maxage=31536000',
      }));

      totalSaved += saved;
      optimized++;

      // Update DB URLs if extension changed
      if (newKey !== obj.key) {
        const oldUrl = `${PUBLIC_URL}/${obj.key}`;
        const newUrl = `${PUBLIC_URL}/${newKey}`;
        await sb.from('politicians').update({ image_url: newUrl }).eq('image_url', oldUrl);
        await sb.from('candidates').update({ image_url: newUrl }).eq('image_url', oldUrl);
      }
    }

    processed++;
    if (processed % 100 === 0) {
      console.log(`  [${processed}/${allKeys.length}] ${optimized} optimized, saved ${(totalSaved / 1024 / 1024).toFixed(1)} MB`);
    }
  } catch (e) {
    errors++;
    processed++;
  }
}

console.log(`\n=== DONE ===`);
console.log(`Processed: ${processed}`);
console.log(`Optimized: ${optimized}`);
console.log(`Errors: ${errors}`);
console.log(`Total saved: ${(totalSaved / 1024 / 1024).toFixed(1)} MB`);
console.log(`Original total: ${(totalOriginalSize / 1024 / 1024).toFixed(1)} MB`);
console.log(`New total: ${((totalOriginalSize - totalSaved) / 1024 / 1024).toFixed(1)} MB`);
