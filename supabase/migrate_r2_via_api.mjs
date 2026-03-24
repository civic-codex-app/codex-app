// ============================================================
// Migrate images to R2 — uses curl (avoids Node.js HTTP/2 rate limits)
// Run with: node supabase/migrate_r2_via_api.mjs
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readFileSync } from 'fs'
import { execSync } from 'child_process'

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

// Use curl instead of fetch to avoid Node.js HTTP/2 connection pooling rate limits
function curlDownload(url) {
  try {
    const buf = execSync(
      `curl -s -L -A "PoliApp/1.0" -H "Accept: image/*" --max-time 30 --fail "${url}"`,
      { maxBuffer: 20 * 1024 * 1024 }
    )
    return buf.length > 1000 ? buf : null // Skip tiny error pages
  } catch {
    return null
  }
}

function curlStatus(url) {
  try {
    return execSync(
      `curl -s -o /dev/null -w "%{http_code}" -A "PoliApp/1.0" --max-time 10 "${url}"`,
      { encoding: 'utf8' }
    ).trim()
  } catch {
    return '0'
  }
}

async function getWikipediaOriginalImage(name) {
  const variants = [
    name.replace(/ /g, '_'),
    `${name}_(politician)`.replace(/ /g, '_'),
    `${name}_(American_politician)`.replace(/ /g, '_'),
  ]

  for (const variant of variants) {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(variant)}`,
        { headers: { 'User-Agent': 'PoliApp/1.0 (civic engagement platform)' } }
      )
      if (!res.ok) continue
      const data = await res.json()
      const origUrl = data.originalimage?.source
      if (origUrl) return origUrl
    } catch {
      continue
    }
    await delay(150)
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
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function detectContentType(buffer) {
  // Check magic bytes
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'image/jpeg'
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png'
  if (buffer[0] === 0x47 && buffer[1] === 0x49) return 'image/gif'
  if (buffer[0] === 0x52 && buffer[1] === 0x49) return 'image/webp'
  return 'image/jpeg'
}

// ============================================================
// PART 1: Migrate remaining politician images
// ============================================================
console.log('=== Migrating politician images (curl + API) ===\n')

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

let polSuccess = 0
let polFailed = 0
const failedNames = []

for (let i = 0; i < toMigrate.length; i++) {
  const p = toMigrate[i]
  const key = `politicians/${p.slug}.jpg`

  try {
    // Get fresh original URL from Wikipedia API
    const freshUrl = await getWikipediaOriginalImage(p.name)
    let buf = null

    if (freshUrl) {
      buf = curlDownload(freshUrl)
    }

    // Fallback: try the stored URL with curl
    if (!buf) {
      buf = curlDownload(p.image_url)
    }

    if (!buf) {
      polFailed++
      failedNames.push(p.name)
      if (polFailed <= 20) console.log(`  [${i + 1}/${toMigrate.length}] ✗ ${p.name}`)
      await delay(300)
      continue
    }

    const contentType = detectContentType(buf)
    const r2Url = await uploadToR2(key, buf, contentType)

    const { error } = await supabase
      .from('politicians')
      .update({ image_url: r2Url })
      .eq('id', p.id)

    if (error) {
      polFailed++
    } else {
      polSuccess++
      if (polSuccess % 25 === 0 || polSuccess === 1) {
        console.log(`  [${i + 1}/${toMigrate.length}] ✓ ${polSuccess} migrated`)
      }
    }
  } catch (err) {
    polFailed++
    failedNames.push(p.name)
  }

  // 1s between items
  await delay(1000)
}

console.log(`\nPoliticians: ${polSuccess} migrated, ${polFailed} failed`)
if (failedNames.length > 0 && failedNames.length <= 40) {
  console.log('Failed:', failedNames.join(', '))
}

// ============================================================
// PART 2: Migrate candidate images
// ============================================================
console.log('\n=== Migrating candidate images ===\n')

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
    if (candCopied % 100 === 0) {
      console.log(`  Copied ${candCopied} from politicians...`)
    }
    continue
  }

  const key = `candidates/${slugify(c.name)}-${c.id.slice(0, 8)}.jpg`

  try {
    // Get fresh URL from Wikipedia API
    const freshUrl = await getWikipediaOriginalImage(c.name)
    let buf = null

    if (freshUrl) {
      buf = curlDownload(freshUrl)
    }

    // Fallback: try stored URL
    if (!buf) {
      buf = curlDownload(c.image_url)
    }

    if (!buf) {
      candFailed++
      await delay(300)
      continue
    }

    const contentType = detectContentType(buf)
    const r2Url = await uploadToR2(key, buf, contentType)
    const { error } = await supabase
      .from('candidates')
      .update({ image_url: r2Url })
      .eq('id', c.id)

    if (error) {
      candFailed++
    } else {
      candSuccess++
      if ((candSuccess - candCopied) % 25 === 0) {
        console.log(`  [${i + 1}/${candsToMigrate.length}] ✓ ${candSuccess} total (${candCopied} copied, ${candSuccess - candCopied} downloaded)`)
      }
    }
  } catch {
    candFailed++
  }

  await delay(1000)
}

console.log(`\nCandidates: ${candSuccess} migrated (${candCopied} copied), ${candFailed} failed`)

// ============================================================
// SUMMARY
// ============================================================
console.log('\n=== FINAL SUMMARY ===')
console.log(`Politicians: ${polSuccess}/${toMigrate.length} newly migrated`)
console.log(`Candidates: ${candSuccess}/${candsToMigrate.length} migrated (${candCopied} copied)`)
console.log(`R2 bucket: ${BUCKET}`)
console.log(`Public URL: ${PUBLIC_URL}`)
