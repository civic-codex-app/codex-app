/**
 * Migrate all politician & candidate images to R2.
 *
 * Downloads every external image_url, uploads to R2, and updates the DB.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/migrate-images-to-r2.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

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
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

const EXT_MAP = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
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
    if (ct.includes('svg') || ct.includes('html') || ct.includes('text')) return null

    const buf = Buffer.from(await resp.arrayBuffer())
    if (buf.length > MAX_SIZE || buf.length < 100) return null

    // Detect type from magic bytes
    let contentType = 'image/jpeg'
    if (buf[0] === 0x89 && buf[1] === 0x50) contentType = 'image/png'
    else if (buf[0] === 0x52 && buf[1] === 0x49 && buf[8] === 0x57) contentType = 'image/webp'
    else if (buf[0] === 0xff && buf[1] === 0xd8) contentType = 'image/jpeg'
    else if (buf[0] === 0x47 && buf[1] === 0x49) contentType = 'image/gif'
    else if (ct.includes('image/')) contentType = ct.split(';')[0].trim()
    else return null // Not a valid image

    return { buf, contentType }
  } catch {
    clearTimeout(timeout)
    return null
  }
}

async function uploadToR2(key, buf, contentType) {
  await R2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buf,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )
  return `${R2_PUBLIC}/${key}`
}

async function migrateTable(table, folder) {
  console.log(`\n--- Migrating ${table} ---`)

  let all = []
  let from = 0
  while (true) {
    const { data } = await sb
      .from(table)
      .select('id, name, image_url')
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
  const BATCH = 10

  for (let i = 0; i < all.length; i += BATCH) {
    const batch = all.slice(i, i + BATCH)
    const results = await Promise.allSettled(
      batch.map(async (row) => {
        const img = await downloadImage(row.image_url)
        if (!img) {
          skipped++
          return
        }

        const ext = EXT_MAP[img.contentType] || '.jpg'
        const key = `${folder}/${row.id}${ext}`

        try {
          const r2Url = await uploadToR2(key, img.buf, img.contentType)
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

    if ((i + BATCH) % 100 === 0 || i + BATCH >= all.length) {
      console.log(
        `  Progress: ${Math.min(i + BATCH, all.length)}/${all.length} | OK: ${success} | Failed: ${failed} | Skipped: ${skipped}`
      )
    }

    // Small delay between batches
    await new Promise((r) => setTimeout(r, 200))
  }

  console.log(`${table} done: ${success} migrated, ${failed} failed, ${skipped} skipped`)
  return { success, failed, skipped }
}

async function main() {
  console.log('=== R2 Image Migration ===')
  console.log(`R2 bucket: ${BUCKET}`)
  console.log(`R2 public URL: ${R2_PUBLIC}`)

  const pol = await migrateTable('politicians', 'politicians')
  const can = await migrateTable('candidates', 'candidates')

  console.log('\n=== Summary ===')
  console.log(`Politicians: ${pol.success} migrated, ${pol.failed} failed, ${pol.skipped} skipped`)
  console.log(`Candidates: ${can.success} migrated, ${can.failed} failed, ${can.skipped} skipped`)

  const { count } = await sb
    .from('politicians')
    .select('id', { count: 'exact', head: true })
    .not('image_url', 'is', null)
    .like('image_url', `${R2_PUBLIC}%`)
  console.log(`\nTotal politicians with R2 images: ${count}`)
}

main().catch(console.error)
