// ============================================================
// Migrate all Wikimedia images to Cloudflare R2
// Downloads each image and uploads to R2, then updates the DB URL
// Run with: node supabase/migrate_images_to_r2.mjs
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

const R2 = new S3Client({
  region: 'auto',
  endpoint: vars.R2_ENDPOINT,
  credentials: {
    accessKeyId: vars.R2_ACCESS_KEY_ID,
    secretAccessKey: vars.R2_SECRET_ACCESS_KEY,
  },
})

const BUCKET = vars.R2_BUCKET_NAME || 'codex-images'
const PUBLIC_URL = vars.R2_PUBLIC_URL

if (!PUBLIC_URL) {
  console.error('Missing R2_PUBLIC_URL in .env.local')
  process.exit(1)
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

async function downloadImage(url, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'PoliApp/1.0 (civic engagement platform)',
          Accept: 'image/*',
        },
      })
      if (res.status === 429) {
        // Rate limited — wait longer and retry
        await delay(2000 * (attempt + 1))
        continue
      }
      if (!res.ok) return null
      const buffer = Buffer.from(await res.arrayBuffer())
      const contentType = res.headers.get('content-type') || 'image/jpeg'
      return { buffer, contentType }
    } catch {
      await delay(1000 * (attempt + 1))
    }
  }
  return null
}

async function uploadToR2(key, buffer, contentType) {
  await R2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  )
  return `${PUBLIC_URL}/${key}`
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ============================================================
// PART 1: Migrate politician images
// ============================================================
console.log('=== Migrating politician images to R2 ===\n')

let politicians = []
let from = 0
while (true) {
  const { data } = await supabase
    .from('politicians')
    .select('id, name, slug, image_url')
    .range(from, from + 999)
  if (!data || data.length === 0) break
  politicians.push(...data)
  from += 1000
}

// Filter to only wikimedia/ui-avatars (skip any already on R2)
const toMigrate = politicians.filter(
  (p) => p.image_url && !p.image_url.startsWith(PUBLIC_URL)
)
console.log(`Total politicians: ${politicians.length}`)
console.log(`Already on R2: ${politicians.length - toMigrate.length}`)
console.log(`To migrate: ${toMigrate.length}\n`)

let polSuccess = 0
let polFailed = 0

for (let i = 0; i < toMigrate.length; i++) {
  const p = toMigrate[i]
  const key = `politicians/${p.slug}.jpg`

  try {
    const img = await downloadImage(p.image_url)
    if (!img) {
      console.log(`  [${i + 1}/${toMigrate.length}] ✗ ${p.name} — download failed`)
      polFailed++
      await delay(300)
      continue
    }

    const r2Url = await uploadToR2(key, img.buffer, img.contentType)

    const { error } = await supabase
      .from('politicians')
      .update({ image_url: r2Url })
      .eq('id', p.id)

    if (error) {
      console.log(`  [${i + 1}/${toMigrate.length}] ✗ ${p.name} — DB update failed`)
      polFailed++
    } else {
      polSuccess++
      if (polSuccess % 25 === 0 || i === toMigrate.length - 1) {
        console.log(`  [${i + 1}/${toMigrate.length}] ✓ ${polSuccess} migrated so far...`)
      }
    }
  } catch (err) {
    console.log(`  [${i + 1}/${toMigrate.length}] ✗ ${p.name} — ${err.message}`)
    polFailed++
  }

  // Rate limit: 500ms between downloads to avoid Wikimedia 429s
  await delay(500)
}

console.log(`\nPoliticians: ${polSuccess} migrated, ${polFailed} failed\n`)

// ============================================================
// PART 2: Migrate candidate images
// ============================================================
console.log('=== Migrating candidate images to R2 ===\n')

let candidates = []
from = 0
while (true) {
  const { data } = await supabase
    .from('candidates')
    .select('id, name, image_url, politician_id')
    .range(from, from + 999)
  if (!data || data.length === 0) break
  candidates.push(...data)
  from += 1000
}

const candsToMigrate = candidates.filter(
  (c) => c.image_url && !c.image_url.startsWith(PUBLIC_URL)
)
console.log(`Total candidates: ${candidates.length}`)
console.log(`Already on R2: ${candidates.length - candsToMigrate.length}`)
console.log(`To migrate: ${candsToMigrate.length}\n`)

let candSuccess = 0
let candFailed = 0

for (let i = 0; i < candsToMigrate.length; i++) {
  const c = candsToMigrate[i]

  // If candidate is linked to a politician, check if politician already has R2 URL
  if (c.politician_id) {
    const { data: pol } = await supabase
      .from('politicians')
      .select('image_url, slug')
      .eq('id', c.politician_id)
      .single()

    if (pol?.image_url?.startsWith(PUBLIC_URL)) {
      // Just copy the politician's R2 URL
      await supabase.from('candidates').update({ image_url: pol.image_url }).eq('id', c.id)
      candSuccess++
      continue
    }
  }

  const key = `candidates/${slugify(c.name)}-${c.id.slice(0, 8)}.jpg`

  try {
    const img = await downloadImage(c.image_url)
    if (!img) {
      console.log(`  [${i + 1}/${candsToMigrate.length}] ✗ ${c.name} — download failed`)
      candFailed++
      await delay(300)
      continue
    }

    const r2Url = await uploadToR2(key, img.buffer, img.contentType)

    const { error } = await supabase
      .from('candidates')
      .update({ image_url: r2Url })
      .eq('id', c.id)

    if (error) {
      candFailed++
    } else {
      candSuccess++
      if (candSuccess % 25 === 0 || i === candsToMigrate.length - 1) {
        console.log(`  [${i + 1}/${candsToMigrate.length}] ✓ ${candSuccess} migrated so far...`)
      }
    }
  } catch (err) {
    console.log(`  [${i + 1}/${candsToMigrate.length}] ✗ ${c.name} — ${err.message}`)
    candFailed++
  }

  await delay(500)
}

console.log(`\nCandidates: ${candSuccess} migrated, ${candFailed} failed`)

// ============================================================
// SUMMARY
// ============================================================
console.log('\n=== FINAL SUMMARY ===')
console.log(`Politicians: ${polSuccess}/${toMigrate.length} migrated to R2`)
console.log(`Candidates: ${candSuccess}/${candsToMigrate.length} migrated to R2`)
console.log(`R2 bucket: ${BUCKET}`)
console.log(`Public URL: ${PUBLIC_URL}`)
