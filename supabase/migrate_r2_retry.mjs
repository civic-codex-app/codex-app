// ============================================================
// Retry R2 migration — adaptive delays for Wikimedia rate limits
// Run with: node supabase/migrate_r2_retry.mjs
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

// Adaptive delay - starts at 2s, increases on 429s, decreases on success
let currentDelay = 2000
let consecutive429s = 0

async function downloadImage(url) {
  // Single attempt — we handle retries at the outer level
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'PoliApp/1.0 (civic engagement; getpoli.app)',
        Accept: 'image/*',
      },
    })
    if (res.status === 429) {
      consecutive429s++
      // Exponential backoff on consecutive 429s
      currentDelay = Math.min(currentDelay * 1.5, 15000)
      return { rateLimited: true }
    }
    if (!res.ok) return null

    // Success! Gradually reduce delay
    consecutive429s = 0
    currentDelay = Math.max(currentDelay * 0.9, 2000)

    const buffer = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    return { buffer, contentType }
  } catch {
    return null
  }
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
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function migrateItem(item, key, table) {
  // Try up to 3 times with increasing waits between attempts
  for (let attempt = 0; attempt < 3; attempt++) {
    const result = await downloadImage(item.image_url)

    if (result?.rateLimited) {
      // Wait extra long on rate limit
      const wait = 5000 * (attempt + 1) + currentDelay
      console.log(`    ⏳ Rate limited, cooling down ${(wait / 1000).toFixed(0)}s (delay now ${(currentDelay / 1000).toFixed(1)}s)...`)
      await delay(wait)
      continue
    }

    if (!result) {
      if (attempt < 2) {
        await delay(3000)
        continue
      }
      return false
    }

    // Got image, upload to R2
    const r2Url = await uploadToR2(key, result.buffer, result.contentType)
    const { error } = await supabase
      .from(table)
      .update({ image_url: r2Url })
      .eq('id', item.id)

    return !error
  }
  return false
}

// ============================================================
// PART 1: Migrate remaining politician images
// ============================================================
console.log('=== Migrating remaining politician images to R2 ===\n')

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

const toMigrate = politicians.filter(
  (p) => p.image_url && !p.image_url.startsWith(PUBLIC_URL)
)
console.log(`Total politicians: ${politicians.length}`)
console.log(`Already on R2: ${politicians.length - toMigrate.length}`)
console.log(`To migrate: ${toMigrate.length}\n`)

// Initial cooldown — Wikimedia may still be rate-limiting from previous run
console.log('Waiting 30s for Wikimedia rate limit to reset...')
await delay(30000)

let polSuccess = 0
let polFailed = 0

for (let i = 0; i < toMigrate.length; i++) {
  const p = toMigrate[i]
  const key = `politicians/${p.slug}.jpg`

  const ok = await migrateItem(p, key, 'politicians')
  if (ok) {
    polSuccess++
    if (polSuccess % 25 === 0) {
      console.log(`  [${i + 1}/${toMigrate.length}] ✓ ${polSuccess} migrated (delay: ${(currentDelay / 1000).toFixed(1)}s)`)
    }
  } else {
    polFailed++
    if (polFailed <= 10) console.log(`  [${i + 1}/${toMigrate.length}] ✗ ${p.name} — failed`)
  }

  await delay(currentDelay)

  // Every 50 items, take a 10s breather
  if ((i + 1) % 50 === 0) {
    console.log(`  ... pausing 10s at item ${i + 1} ...`)
    await delay(10000)
  }
}

console.log(`\nPoliticians: ${polSuccess} migrated, ${polFailed} failed\n`)

// ============================================================
// PART 2: Migrate candidate images
// ============================================================
console.log('=== Migrating candidate images to R2 ===\n')

// Refresh politician R2 URLs
const polR2Urls = {}
let pfrom = 0
while (true) {
  const { data } = await supabase
    .from('politicians')
    .select('id, image_url')
    .range(pfrom, pfrom + 999)
  if (!data || data.length === 0) break
  for (const p of data) {
    if (p.image_url && p.image_url.startsWith(PUBLIC_URL)) {
      polR2Urls[p.id] = p.image_url
    }
  }
  pfrom += 1000
}
console.log(`Politicians with R2 URLs: ${Object.keys(polR2Urls).length}`)

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
let candCopied = 0

for (let i = 0; i < candsToMigrate.length; i++) {
  const c = candsToMigrate[i]

  // If linked to a politician with R2 URL, just copy it
  if (c.politician_id && polR2Urls[c.politician_id]) {
    await supabase.from('candidates').update({ image_url: polR2Urls[c.politician_id] }).eq('id', c.id)
    candSuccess++
    candCopied++
    continue
  }

  const key = `candidates/${slugify(c.name)}-${c.id.slice(0, 8)}.jpg`

  const ok = await migrateItem(c, key, 'candidates')
  if (ok) {
    candSuccess++
    if ((candSuccess - candCopied) % 25 === 0) {
      console.log(`  [${i + 1}/${candsToMigrate.length}] ✓ ${candSuccess} total (${candCopied} copied, ${candSuccess - candCopied} downloaded)`)
    }
  } else {
    candFailed++
  }

  await delay(currentDelay)

  if ((i + 1) % 50 === 0 && i > candCopied) {
    console.log(`  ... pausing 10s at item ${i + 1} ...`)
    await delay(10000)
  }
}

console.log(`\nCandidates: ${candSuccess} migrated (${candCopied} copied from politicians), ${candFailed} failed`)

// ============================================================
// SUMMARY
// ============================================================
console.log('\n=== FINAL SUMMARY ===')
console.log(`Politicians: ${polSuccess}/${toMigrate.length} newly migrated`)
console.log(`Candidates: ${candSuccess}/${candsToMigrate.length} migrated (${candCopied} copied)`)
console.log(`R2 bucket: ${BUCKET}`)
console.log(`Public URL: ${PUBLIC_URL}`)
