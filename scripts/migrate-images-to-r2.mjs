/**
 * Migrate all politician & candidate images to R2.
 *
 * - Downloads every external image_url
 * - Converts to WebP via sharp (quality 80)
 * - Resizes: 400x500 for politicians (3:4 portrait), 400x500 for candidates
 * - Names: politicians/{slug}.webp, candidates/{slug}.webp
 * - Updates DB with R2 public URL
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/migrate-images-to-r2.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME ?? 'codex'
const R2_PUBLIC = process.env.R2_PUBLIC_URL ?? ''
const MAX_DOWNLOAD = 10 * 1024 * 1024 // 10MB max download

// Output sizes (2x for retina — displays at 400x500 but saves at 800x1000)
const SIZES = {
  politicians: { width: 800, height: 1000 },  // 4:5 portrait @2x
  candidates: { width: 800, height: 1000 },
}

const WEBP_QUALITY = 80

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function downloadImage(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'PoliApp/1.0 (civic-engagement-tool)' },
    })
    clearTimeout(timeout)
    if (!resp.ok) return null

    const ct = resp.headers.get('content-type') || ''
    if (ct.includes('svg') || ct.includes('html') || ct.includes('text/plain')) return null

    const buf = Buffer.from(await resp.arrayBuffer())
    if (buf.length > MAX_DOWNLOAD || buf.length < 100) return null

    return buf
  } catch {
    clearTimeout(timeout)
    return null
  }
}

async function convertToWebp(inputBuf, size) {
  try {
    const img = sharp(inputBuf)
    const meta = await img.metadata()

    // Only resize if source is large enough — never upscale
    const opts = {}
    if (meta.width && meta.height && (meta.width >= size.width / 2 || meta.height >= size.height / 2)) {
      // Resize to target, cover crop from top (faces are at top of portraits)
      opts.resize = {
        width: Math.min(size.width, meta.width * 2),   // Don't upscale beyond 2x source
        height: Math.min(size.height, meta.height * 2),
        fit: 'cover',
        position: 'top',
      }
    }

    let pipeline = sharp(inputBuf)
    if (opts.resize) pipeline = pipeline.resize(opts.resize)
    return await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer()
  } catch {
    // If resize fails (e.g., animated gif), try without resize
    try {
      return await sharp(inputBuf, { animated: false })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer()
    } catch {
      return null
    }
  }
}

async function uploadToR2(key, buf) {
  await R2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buf,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )
  return `${R2_PUBLIC}/${key}`
}

/* ------------------------------------------------------------------ */
/*  Migration                                                          */
/* ------------------------------------------------------------------ */

async function migrateTable(table, folder) {
  console.log(`\n--- Migrating ${table} ---`)

  // Fetch all rows with external (non-R2) images
  let all = []
  let from = 0
  while (true) {
    const { data } = await sb
      .from(table)
      .select('id, name, slug, image_url')
      .not('image_url', 'is', null)
      .not('image_url', 'like', `${R2_PUBLIC}%`)
      .range(from, from + 999)
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < 1000) break
    from += 1000
  }

  console.log(`Found ${all.length} with external images`)

  let success = 0
  let failed = 0
  let skipped = 0
  const BATCH = 8
  const size = SIZES[folder] || SIZES.politicians

  for (let i = 0; i < all.length; i += BATCH) {
    const batch = all.slice(i, i + BATCH)
    await Promise.allSettled(
      batch.map(async (row) => {
        try {
          // 1. Download
          const rawBuf = await downloadImage(row.image_url)
          if (!rawBuf) { skipped++; return }

          // 2. Convert to WebP + resize
          const webpBuf = await convertToWebp(rawBuf, size)
          if (!webpBuf) { skipped++; return }

          // 3. Generate clean filename from slug or name
          const filename = row.slug || slugify(row.name)
          const key = `${folder}/${filename}.webp`

          // 4. Upload to R2
          const r2Url = await uploadToR2(key, webpBuf)

          // 5. Update DB
          const { error } = await sb
            .from(table)
            .update({ image_url: r2Url })
            .eq('id', row.id)
          if (error) throw error

          success++
        } catch (e) {
          failed++
        }
      })
    )

    if ((i + BATCH) % 100 < BATCH || i + BATCH >= all.length) {
      const pct = Math.round(((i + BATCH) / all.length) * 100)
      console.log(
        `  ${pct}% (${Math.min(i + BATCH, all.length)}/${all.length}) | OK: ${success} | Failed: ${failed} | Skipped: ${skipped}`
      )
    }

    // Delay between batches to be nice to source servers
    await new Promise((r) => setTimeout(r, 250))
  }

  console.log(`\n${table} done: ${success} migrated, ${failed} failed, ${skipped} skipped`)
  return { success, failed, skipped }
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  console.log('=== R2 Image Migration ===')
  console.log(`Bucket: ${BUCKET}`)
  console.log(`Public URL: ${R2_PUBLIC}`)
  console.log(`Output: WebP @ quality ${WEBP_QUALITY}`)
  console.log(`Sizes: 800x1000 @2x retina (displays 400x500, cover crop, top-aligned)`)
  console.log()

  const pol = await migrateTable('politicians', 'politicians')
  const can = await migrateTable('candidates', 'candidates')

  console.log('\n=== Summary ===')
  console.log(`Politicians: ${pol.success} OK, ${pol.failed} failed, ${pol.skipped} skipped`)
  console.log(`Candidates:  ${can.success} OK, ${can.failed} failed, ${can.skipped} skipped`)
  console.log(`Total migrated: ${pol.success + can.success}`)

  const { count } = await sb
    .from('politicians')
    .select('id', { count: 'exact', head: true })
    .not('image_url', 'is', null)
    .like('image_url', `${R2_PUBLIC}%`)
  console.log(`\nPoliticians now on R2: ${count}`)
}

main().catch(console.error)
