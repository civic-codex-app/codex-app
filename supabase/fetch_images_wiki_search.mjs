/**
 * Fetch politician images using Wikipedia's SEARCH API (fuzzy matching).
 * Previous scripts used the summary API which requires exact article titles.
 * The search API finds articles like "John Smith (Ohio politician)" that
 * the exact-match approach misses.
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

// State name lookup
const STATES = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',
  CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',
  IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',
  ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',
  MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',
  NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',
  OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',
  TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',
  WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'District of Columbia'
};

// Get all politicians without images
let all = [], from = 0;
while (true) {
  const { data } = await sb.from('politicians').select('id, name, slug, state, chamber, title').is('image_url', null).range(from, from + 999);
  if (!data || !data.length) break;
  all.push(...data);
  from += 1000;
}
console.log(`Found ${all.length} politicians without images`);

let migrated = 0, failed = 0;

for (let i = 0; i < all.length; i++) {
  const p = all[i];
  const stateName = STATES[p.state] || p.state;

  // Search Wikipedia with name + state context
  const searchQueries = [
    `${p.name} ${stateName} politician`,
    `${p.name} ${stateName} legislator`,
    `${p.name} politician`,
  ];

  let imageUrl = null;

  for (const query of searchQueries) {
    if (imageUrl) break;

    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=3&format=json`;
      const searchResult = execSync(
        `curl -s -H "User-Agent: PoliApp/1.0" "${searchUrl}"`,
        { timeout: 8000 }
      ).toString();

      const searchJson = JSON.parse(searchResult);
      const results = searchJson?.query?.search || [];

      for (const result of results) {
        // Check if the title contains the person's last name
        const lastName = p.name.split(' ').pop();
        if (!result.title.includes(lastName)) continue;

        // Get the page summary to find the image
        const title = encodeURIComponent(result.title.replace(/ /g, '_'));
        const summaryResult = execSync(
          `curl -s -H "User-Agent: PoliApp/1.0" "https://en.wikipedia.org/api/rest_v1/page/summary/${title}"`,
          { timeout: 8000 }
        ).toString();

        const summary = JSON.parse(summaryResult);
        if (summary.thumbnail?.source) {
          // Verify it's about the right person (check snippet for state or title)
          const snippet = (result.snippet || '').toLowerCase();
          const isMatch = snippet.includes(stateName.toLowerCase()) ||
                         snippet.includes('representative') ||
                         snippet.includes('senator') ||
                         snippet.includes('legislat') ||
                         snippet.includes('politician') ||
                         snippet.includes('mayor') ||
                         snippet.includes('governor');

          if (isMatch) {
            imageUrl = summary.thumbnail.source.replace(/\/\d+px-/, '/400px-');
            break;
          }
        }
      }
    } catch (e) {
      // search failed, try next query
    }
  }

  if (!imageUrl) {
    failed++;
    if ((i + 1) % 500 === 0 || i === all.length - 1)
      console.log(`  [${i+1}/${all.length}] ${migrated} migrated, ${failed} failed`);
    continue;
  }

  // Download, optimize to WebP, upload to R2
  try {
    const imgData = execSync(`curl -sL -H "User-Agent: PoliApp/1.0" "${imageUrl}" --max-time 10`, {
      maxBuffer: 20 * 1024 * 1024,
      timeout: 15000
    });

    if (imgData.length < 1000) { failed++; continue; }

    const optimized = await sharp(imgData)
      .resize(400, 400, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const key = `codex/politicians/${p.slug}.webp`;

    await R2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: optimized,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=2592000, s-maxage=31536000',
    }));

    await sb.from('politicians').update({ image_url: `${PUBLIC_URL}/${key}` }).eq('id', p.id);
    migrated++;
  } catch (e) {
    failed++;
  }

  // Rate limit
  await new Promise(r => setTimeout(r, 600));

  if ((i + 1) % 500 === 0 || i === all.length - 1)
    console.log(`  [${i+1}/${all.length}] ${migrated} migrated, ${failed} failed`);
}

console.log(`\nDone! Migrated: ${migrated}, Failed: ${failed}`);
