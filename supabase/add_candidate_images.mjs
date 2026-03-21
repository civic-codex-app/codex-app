// Add profile photo URLs to all candidates missing image_url
// Usage: node supabase/add_candidate_images.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=');
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim();
}

const supabase = createClient(
  vars.NEXT_PUBLIC_SUPABASE_URL,
  vars.SUPABASE_SERVICE_ROLE_KEY
);

const BATCH_SIZE = 50;

async function fetchAllCandidatesWithoutImages() {
  const candidates = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('candidates')
      .select('id, name, politician_id')
      .is('image_url', null)
      .range(from, from + 999);
    if (error) throw new Error(`Failed to fetch candidates: ${error.message}`);
    if (!data || data.length === 0) break;
    candidates.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return candidates;
}

async function fetchPoliticianImages(politicianIds) {
  if (politicianIds.length === 0) return {};
  const imageMap = {};
  let from = 0;
  while (from < politicianIds.length) {
    const batch = politicianIds.slice(from, from + 1000);
    const { data, error } = await supabase
      .from('politicians')
      .select('id, image_url')
      .in('id', batch)
      .not('image_url', 'is', null);
    if (error) throw new Error(`Failed to fetch politicians: ${error.message}`);
    if (data) {
      for (const p of data) {
        imageMap[p.id] = p.image_url;
      }
    }
    from += 1000;
  }
  return imageMap;
}

function generateAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=random&color=fff&bold=true`;
}

async function updateBatch(updates) {
  const results = { success: 0, failed: 0 };
  for (const { id, image_url } of updates) {
    const { error } = await supabase
      .from('candidates')
      .update({ image_url })
      .eq('id', id);
    if (error) {
      console.error(`  Failed to update candidate ${id}: ${error.message}`);
      results.failed++;
    } else {
      results.success++;
    }
  }
  return results;
}

async function main() {
  console.log('Fetching candidates without images...');
  const candidates = await fetchAllCandidatesWithoutImages();
  console.log(`Found ${candidates.length} candidates without image_url`);

  if (candidates.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  // Gather politician IDs to look up linked images
  const politicianIds = candidates
    .filter((c) => c.politician_id)
    .map((c) => c.politician_id);
  const uniquePoliticianIds = [...new Set(politicianIds)];

  console.log(`Looking up images for ${uniquePoliticianIds.length} linked politicians...`);
  const politicianImages = await fetchPoliticianImages(uniquePoliticianIds);
  console.log(`Found ${Object.keys(politicianImages).length} politician images to reuse`);

  // Build update list
  const updates = [];
  let fromPolitician = 0;
  let fromAvatar = 0;

  for (const candidate of candidates) {
    let imageUrl;
    if (candidate.politician_id && politicianImages[candidate.politician_id]) {
      imageUrl = politicianImages[candidate.politician_id];
      fromPolitician++;
    } else {
      imageUrl = generateAvatarUrl(candidate.name);
      fromAvatar++;
    }
    updates.push({ id: candidate.id, image_url: imageUrl });
  }

  console.log(`\nImage sources:`);
  console.log(`  From linked politician: ${fromPolitician}`);
  console.log(`  From UI Avatars:        ${fromAvatar}`);
  console.log(`\nUpdating in batches of ${BATCH_SIZE}...`);

  let totalSuccess = 0;
  let totalFailed = 0;

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(updates.length / BATCH_SIZE);
    console.log(`  Batch ${batchNum}/${totalBatches} (${batch.length} candidates)...`);

    const results = await updateBatch(batch);
    totalSuccess += results.success;
    totalFailed += results.failed;
  }

  console.log(`\nDone!`);
  console.log(`  Updated: ${totalSuccess}`);
  if (totalFailed > 0) console.log(`  Failed:  ${totalFailed}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
