import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// ---------------------------------------------------------------------------
// Load env
// ---------------------------------------------------------------------------
const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Fetch a Wikipedia page summary and return the thumbnail URL (up-sized).
 * Returns null if no thumbnail exists or the request fails.
 */
async function fetchWikipediaThumbnail(searchName) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchName)}`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    const src = json?.thumbnail?.source
    if (!src) return null
    // Replace the width portion (e.g. /320px-) with /440px- for a larger image
    return src.replace(/\/\d+px-/, '/440px-')
  } catch {
    return null
  }
}

/**
 * Try several Wikipedia name variations to find a portrait.
 */
async function findPortrait(name) {
  // 1) Exact name
  let thumb = await fetchWikipediaThumbnail(name)
  if (thumb) return thumb

  await sleep(200)

  // 2) Name (politician)
  thumb = await fetchWikipediaThumbnail(`${name} (politician)`)
  if (thumb) return thumb

  await sleep(200)

  // 3) Name (American politician)
  thumb = await fetchWikipediaThumbnail(`${name} (American politician)`)
  if (thumb) return thumb

  return null
}

// ---------------------------------------------------------------------------
// Fetch all politicians with ui-avatars placeholder images (paginated)
// ---------------------------------------------------------------------------
console.log('Fetching politicians with ui-avatars placeholder images...\n')

const PAGE_SIZE = 500
let allPoliticians = []
let from = 0

while (true) {
  const { data, error } = await supabase
    .from('politicians')
    .select('id, name, slug, image_url')
    .like('image_url', '%ui-avatars.com%')
    .range(from, from + PAGE_SIZE - 1)

  if (error) {
    console.error('Error fetching politicians:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) break
  allPoliticians = allPoliticians.concat(data)
  if (data.length < PAGE_SIZE) break
  from += PAGE_SIZE
}

console.log(`Found ${allPoliticians.length} politicians with placeholder images.\n`)

if (allPoliticians.length === 0) {
  console.log('Nothing to do — all politicians already have real images!')
  process.exit(0)
}

// ---------------------------------------------------------------------------
// Look up Wikipedia portraits and collect updates
// ---------------------------------------------------------------------------
let successCount = 0
let failCount = 0
const updates = [] // { id, image_url }

for (let i = 0; i < allPoliticians.length; i++) {
  const p = allPoliticians[i]
  const thumb = await findPortrait(p.name)

  if (thumb) {
    updates.push({ id: p.id, image_url: thumb })
    successCount++
    console.log(`  [${i + 1}/${allPoliticians.length}] ✓ ${p.name}`)
  } else {
    failCount++
    console.log(`  [${i + 1}/${allPoliticians.length}] ✗ ${p.name} — no Wikipedia portrait found`)
  }

  // Rate-limit between politicians (the findPortrait helper already sleeps
  // between retries, so only add a delay before the next politician)
  await sleep(200)
}

// ---------------------------------------------------------------------------
// Update Supabase in batches of 50
// ---------------------------------------------------------------------------
console.log(`\nUpdating ${updates.length} politicians in Supabase...`)

const BATCH_SIZE = 50
let updatedCount = 0
let updateErrors = 0

for (let i = 0; i < updates.length; i += BATCH_SIZE) {
  const batch = updates.slice(i, i + BATCH_SIZE)

  for (const item of batch) {
    const { error } = await supabase
      .from('politicians')
      .update({ image_url: item.image_url })
      .eq('id', item.id)

    if (error) {
      console.log(`  ✗ Failed to update id=${item.id}: ${error.message}`)
      updateErrors++
    } else {
      updatedCount++
    }
  }

  if (i + BATCH_SIZE < updates.length) {
    console.log(`  ... updated ${Math.min(i + BATCH_SIZE, updates.length)} of ${updates.length}`)
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n========== SUMMARY ==========')
console.log(`Total with placeholder images: ${allPoliticians.length}`)
console.log(`Wikipedia portraits found:     ${successCount}`)
console.log(`Still using placeholder:       ${failCount}`)
console.log(`Successfully updated in DB:    ${updatedCount}`)
if (updateErrors > 0) {
  console.log(`Update errors:                 ${updateErrors}`)
}
console.log('==============================\n')
