/**
 * Migrate politician and candidate photos to our own R2 bucket.
 *
 * - Downloads every image_url not already on R2
 * - Converts to WebP via sharp (quality 80), 800x1000, cover crop from the top
 * - Uploads as {folder}/{slug}.webp and rewrites image_url to the public URL
 *
 * Why it matters: ~840 photos still point at state-legislature sites, which
 * move files, add hotlink protection, and let certificates lapse. 579 rows had
 * to be nulled on 2026-09-17 because their URLs had died (see
 * scripts/check-image-urls.mjs). Re-hosting ends that class of breakage.
 *
 * CANNOT RUN AS CONFIGURED. .env.local carries placeholders:
 *
 *   R2_ENDPOINT    https://<account-id>.r2.cloudflarestorage.com
 *   R2_PUBLIC_URL  https://images.yourcodexdomain.com    (NXDOMAIN)
 *
 * while every hosted photo is actually served from
 * https://pub-c78794c371154ba4a897d0c125928acf.r2.dev/codex/... — so the
 * public URL needs the r2.dev origin AND the /codex key prefix. With those
 * values the S3 client throws "Invalid URL" on the first upload, and, worse,
 * the placeholder public URL matches none of the 5,501 rows, so the script
 * would treat photos already on R2 as external, re-upload them, and rewrite
 * every one to a domain that does not resolve.
 *
 * preflight() therefore refuses to run until the configuration is proven: it
 * rejects placeholder values, then takes a photo already on R2, derives its
 * key, and checks the bucket holds that key and that the public URL built from
 * it actually serves an image. Nothing is written until that passes.
 *
 * Dry-run by default; --apply writes, after backing up every URL it will
 * change. The upload path is UNVERIFIED — it has never run with working
 * credentials. Do a --limit run first.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/migrate-images-to-r2.mjs                 # dry run
 *   node scripts/migrate-images-to-r2.mjs --limit=20 --apply
 *   node scripts/migrate-images-to-r2.mjs --apply
 *   node scripts/migrate-images-to-r2.mjs --only-host=cdn.ilga.gov --apply
 *   node scripts/migrate-images-to-r2.mjs --batch=2 --delay=2000 --apply   # gently, for hosts that 503
 *   node scripts/migrate-images-to-r2.mjs --only-host=cdn.ilga.gov \
 *     --accept-incomplete-chain --apply     # hosts whose TLS chain Node rejects
 */

import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'
import { arg, has } from './lib/cli.mjs'

const APPLY = has('apply')
const LIMIT = Number(arg('limit', '0')) || Infinity
const ONLY_HOSTS = arg('only-host', '').split(',').map((h) => h.trim()).filter(Boolean)
// Pacing. The defaults move 800 photos in about half an hour, but they also
// drew 503s from malegislature.gov and 429s from docs.legis.wisconsin.gov —
// a sustained eight-at-a-time burst is more than a state legislature's photo
// server expects. Retry those with --batch=2 --delay=2000.
const BATCH_SIZE = Math.max(1, Number(arg('batch', '8')))
const BATCH_DELAY = Math.max(0, Number(arg('delay', '250')))

/**
 * Accept a server that omits its intermediate certificate.
 *
 * Several state legislatures serve photos over a chain Node rejects and
 * browsers complete themselves — 207 photos across billstatus.ls.state.ms.us,
 * legislature.ohio.gov, cdn.ilga.gov, house.mi.gov and cga.ct.gov. They are
 * real images that real visitors can see, and a strict run skips every one,
 * leaving them on hosts that will eventually drop them.
 *
 * The trade is worth making only narrowly: the file is fetched, checked to be
 * an image, re-encoded through sharp, and served from our own bucket
 * afterwards, so a tampered response would have to survive decoding to do
 * anything, and the exposure ends with this download. It is therefore
 * refused unless --only-host names the hosts, so it can never be a blanket
 * relaxation of a full run.
 */
const INSECURE = has('accept-incomplete-chain')
if (INSECURE) {
  if (!ONLY_HOSTS.length) {
    console.error('--accept-incomplete-chain requires --only-host=<host,…>, so it cannot relax a whole run.')
    process.exit(1)
  }
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  console.log(`!! certificate verification disabled for this run, limited to: ${ONLY_HOSTS.join(', ')}`)
}

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
const R2_PUBLIC = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')

/**
 * Key prefix, derived in preflight from a photo already hosted rather than
 * configured. The bucket's existing objects are keyed "codex/politicians/…"
 * while R2_PUBLIC_URL is the bucket root, so a script that built keys as
 * "politicians/…" would scatter new photos beside the old ones instead of
 * among them. Reading it off a real object keeps one layout and needs no
 * fifth environment variable to get wrong.
 */
let KEY_PREFIX = ''
// 25MB. The 10MB cap this replaces rejected 14 legislature portraits that
// were simply scanned large — 10.0 to 18.4MB — and they are exactly the ones
// worth re-hosting, since sharp turns each into a ~7KB WebP. The cap exists to
// stop a runaway download, not to judge source quality.
const MAX_DOWNLOAD = 25 * 1024 * 1024

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

// What Chrome sends for a cross-site <img>. Hotlink protection keys on these:
// akleg.gov serves a bare request the photo and a request carrying a Referer a
// 403, so a plain fetch here would save files the browser cannot display.
const IMG_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
  Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  Referer: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://getpoli.app/',
  'Sec-Fetch-Dest': 'image',
  'Sec-Fetch-Mode': 'no-cors',
  'Sec-Fetch-Site': 'cross-site',
}

async function downloadImage(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: IMG_HEADERS,
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

  if (ONLY_HOSTS.length) {
    const before = all.length
    all = all.filter((r) => { try { return ONLY_HOSTS.includes(new URL(r.image_url).host) } catch { return false } })
    console.log(`--only-host: ${all.length} of ${before} row(s) match`)
  }

  if (all.length > LIMIT) {
    console.log(`Found ${all.length} with external images; --limit=${LIMIT} so only the first ${LIMIT} will be handled`)
    all = all.slice(0, LIMIT)
  } else {
    console.log(`Found ${all.length} with external images`)
  }
  if (!APPLY) {
    const hosts = new Map()
    for (const r of all) { let h; try { h = new URL(r.image_url).host } catch { h = '(invalid)' } hosts.set(h, (hosts.get(h) ?? 0) + 1) }
    for (const [h, n] of [...hosts].sort((a, b) => b[1] - a[1]).slice(0, 10)) console.log(`  ${String(n).padStart(5)}  ${h}`)
    console.log(`  (dry run — nothing downloaded, uploaded or written)`)
    return { success: 0, failed: 0, skipped: all.length }
  }

  let success = 0
  let failed = 0
  let skipped = 0
  const BATCH = BATCH_SIZE
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
          const key = KEY_PREFIX ? `${KEY_PREFIX}/${folder}/${filename}.webp` : `${folder}/${filename}.webp`

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
    await new Promise((r) => setTimeout(r, BATCH_DELAY))
  }

  console.log(`\n${table} done: ${success} migrated, ${failed} failed, ${skipped} skipped`)
  return { success, failed, skipped }
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

/**
 * Refuse to run until the R2 configuration is proven to work.
 *
 * The failure this exists to prevent is silent and total: with a public URL
 * that matches no stored row, every photo looks external, so the script
 * re-uploads all 5,501 and rewrites them to a domain that may not resolve.
 * Checking a real object first turns that into a refusal.
 */
async function preflight() {
  const problems = []
  const placeholder = (v) => !v || /<[^>]+>|yourcodexdomain|your-|example\.com|changeme/i.test(v)
  if (placeholder(process.env.R2_ENDPOINT)) problems.push(`R2_ENDPOINT is a placeholder: ${process.env.R2_ENDPOINT ?? '(unset)'}`)
  if (placeholder(R2_PUBLIC)) problems.push(`R2_PUBLIC_URL is a placeholder: ${R2_PUBLIC || '(unset)'}`)
  if (!process.env.R2_ACCESS_KEY_ID) problems.push('R2_ACCESS_KEY_ID is unset')
  if (!process.env.R2_SECRET_ACCESS_KEY) problems.push('R2_SECRET_ACCESS_KEY is unset')
  if (problems.length) return problems

  // A photo already hosted on R2 tells us the real key scheme and origin.
  const { data: sample } = await sb
    .from('politicians')
    .select('image_url')
    .like('image_url', `${R2_PUBLIC}%`)
    .limit(1)
  if (!sample?.length) {
    problems.push(`no stored image_url starts with R2_PUBLIC_URL (${R2_PUBLIC}).`)
    const { data: any } = await sb.from('politicians').select('image_url').not('image_url', 'is', null).like('image_url', '%r2.dev%').limit(1)
    if (any?.length) problems.push(`  a hosted photo looks like: ${any[0].image_url}`)
    problems.push('  R2_PUBLIC_URL must be the origin AND key prefix those URLs actually use,')
    problems.push('  or every already-hosted photo will be treated as external and rewritten.')
    return problems
  }

  const key = sample[0].image_url.slice(R2_PUBLIC.length).replace(/^\//, '')
  // "codex/politicians/james-comer.webp" -> "codex"; "politicians/x.webp" -> ""
  const folderAt = key.search(/(^|\/)(politicians|candidates)\//)
  KEY_PREFIX = folderAt <= 0 ? '' : key.slice(0, folderAt)
  try {
    await R2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }))
  } catch (e) {
    problems.push(`the bucket "${BUCKET}" has no object "${key}" (${e.name}) — endpoint, bucket and public URL disagree`)
    return problems
  }
  const res = await fetch(`${R2_PUBLIC}/${key}`, { headers: IMG_HEADERS }).catch((e) => ({ ok: false, status: 0, statusText: e.message }))
  if (!res.ok) problems.push(`${R2_PUBLIC}/${key} does not serve (HTTP ${res.status} ${res.statusText ?? ''})`)
  if (!problems.length) console.log(`preflight: key prefix "${KEY_PREFIX || '(none)'}" derived from ${key}`)
  return problems
}

async function main() {
  console.log('=== R2 Image Migration ===')
  console.log(APPLY ? '*** APPLYING ***' : '--- DRY RUN (pass --apply to write) ---')
  console.log(`Bucket: ${BUCKET}`)
  console.log(`Public URL: ${R2_PUBLIC}`)
  console.log(`Output: WebP @ quality ${WEBP_QUALITY}`)
  console.log(`Sizes: 800x1000 @2x retina (displays 400x500, cover crop, top-aligned)`)
  console.log()

  const problems = await preflight()
  if (problems.length) {
    console.error('REFUSING TO RUN — the R2 configuration is not usable:\n')
    for (const p of problems) console.error('  ' + p)
    console.error('\nFix .env.local and re-run. Nothing was read or written.')
    process.exit(1)
  }
  console.log('preflight: endpoint, bucket and public URL agree on a real object\n')

  if (APPLY) {
    const backup = []
    for (const table of ['politicians', 'candidates']) {
      for (let from = 0; ; from += 1000) {
        const { data } = await sb.from(table).select('id, image_url').not('image_url', 'is', null).not('image_url', 'like', `${R2_PUBLIC}%`).range(from, from + 999)
        if (!data?.length) break
        backup.push(...data.map((r) => ({ table, ...r })))
        if (data.length < 1000) break
      }
    }
    const path = `image-urls-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`
    writeFileSync(path, JSON.stringify(backup, null, 1))
    console.log(`backed up ${backup.length} image_url value(s) to ${path}\n`)
  }

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
