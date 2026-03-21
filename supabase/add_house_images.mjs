import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load env vars from .env.local
const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

const BATCH_SIZE = 50

function avatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=random&color=fff&bold=true`
}

async function fetchAllMissing(chamber) {
  // Paginate to handle Supabase 1000-row limit
  const all = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('politicians')
      .select('id, name, slug, chamber')
      .eq('chamber', chamber)
      .is('image_url', null)
      .order('name')
      .range(from, from + 999)

    if (error) {
      console.error(`Error fetching ${chamber}:`, error.message)
      break
    }
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < 1000) break
    from += 1000
  }
  return all
}

async function updateBatch(politicians) {
  let updated = 0
  let failed = 0

  for (let i = 0; i < politicians.length; i += BATCH_SIZE) {
    const batch = politicians.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(politicians.length / BATCH_SIZE)
    console.log(`  Batch ${batchNum}/${totalBatches} (${batch.length} politicians)...`)

    for (const p of batch) {
      const url = avatarUrl(p.name)
      const { error } = await supabase
        .from('politicians')
        .update({ image_url: url })
        .eq('id', p.id)

      if (error) {
        console.log(`    x ${p.name} (${p.slug}): ${error.message}`)
        failed++
      } else {
        updated++
      }
    }
    console.log(`    Done - ${updated} updated so far`)
  }

  return { updated, failed }
}

// --- Main ---
console.log('=== Add Missing Profile Images ===\n')

// 1. House members
const house = await fetchAllMissing('house')
console.log(`House members missing images: ${house.length}`)
if (house.length > 0) {
  const result = await updateBatch(house)
  console.log(`  Updated: ${result.updated}, Failed: ${result.failed}\n`)
} else {
  console.log('  None missing!\n')
}

// 2. Senate
const senate = await fetchAllMissing('senate')
console.log(`Senators missing images: ${senate.length}`)
if (senate.length > 0) {
  const result = await updateBatch(senate)
  console.log(`  Updated: ${result.updated}, Failed: ${result.failed}\n`)
} else {
  console.log('  None missing!\n')
}

// 3. Governor
const governors = await fetchAllMissing('governor')
console.log(`Governors missing images: ${governors.length}`)
if (governors.length > 0) {
  const result = await updateBatch(governors)
  console.log(`  Updated: ${result.updated}, Failed: ${result.failed}\n`)
} else {
  console.log('  None missing!\n')
}

// 4. Presidential
const presidential = await fetchAllMissing('presidential')
console.log(`Presidential missing images: ${presidential.length}`)
if (presidential.length > 0) {
  const result = await updateBatch(presidential)
  console.log(`  Updated: ${result.updated}, Failed: ${result.failed}\n`)
} else {
  console.log('  None missing!\n')
}

// 5. Any other chambers (local offices, etc.)
const otherChambers = ['mayor', 'city_council', 'state_senate', 'state_house', 'county', 'school_board', 'other_local']
for (const chamber of otherChambers) {
  const missing = await fetchAllMissing(chamber)
  if (missing.length > 0) {
    console.log(`${chamber} missing images: ${missing.length}`)
    const result = await updateBatch(missing)
    console.log(`  Updated: ${result.updated}, Failed: ${result.failed}\n`)
  }
}

// Final verification
console.log('=== Final Verification ===')
const { data: stillMissing } = await supabase
  .from('politicians')
  .select('name, slug, chamber')
  .is('image_url', null)
  .order('name')

if (!stillMissing || stillMissing.length === 0) {
  console.log('All politicians have images!')
} else {
  console.log(`Still missing images: ${stillMissing.length}`)
  stillMissing.forEach(p => console.log(`  x ${p.name} (${p.slug}) [${p.chamber}]`))
}
