import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Verified (slug, year) pairs from fix_election_results.mjs
const VERIFIED = [
  { slug: 'donald-trump', year: 2024 },
  { slug: 'donald-trump', year: 2020 },
  { slug: 'donald-trump', year: 2016 },
  { slug: 'ted-cruz', year: 2024 },
  { slug: 'ted-cruz', year: 2018 },
  { slug: 'bernie-sanders', year: 2024 },
  { slug: 'bernie-sanders', year: 2018 },
  { slug: 'mitch-mcconnell', year: 2020 },
  { slug: 'chuck-schumer', year: 2022 },
  { slug: 'john-fetterman', year: 2022 },
  { slug: 'jon-ossoff', year: 2020 },
  { slug: 'raphael-warnock', year: 2022 },
  { slug: 'mark-kelly', year: 2022 },
  { slug: 'susan-collins', year: 2020 },
  { slug: 'lindsey-graham', year: 2020 },
  { slug: 'marco-rubio', year: 2022 },
  { slug: 'rand-paul', year: 2022 },
  { slug: 'tim-scott', year: 2022 },
  { slug: 'alex-padilla', year: 2022 },
  { slug: 'tammy-baldwin', year: 2024 },
  { slug: 'rick-scott', year: 2024 },
  { slug: 'dave-mccormick', year: 2024 },
  { slug: 'bernie-moreno', year: 2024 },
  { slug: 'jim-banks', year: 2024 },
  { slug: 'john-curtis', year: 2024 },
  { slug: 'gavin-newsom', year: 2022 },
  { slug: 'ron-desantis', year: 2022 },
  { slug: 'greg-abbott', year: 2022 },
  { slug: 'gretchen-whitmer', year: 2022 },
  { slug: 'josh-shapiro', year: 2022 },
  { slug: 'brian-kemp', year: 2022 },
  { slug: 'kathy-hochul', year: 2022 },
  { slug: 'jb-pritzker', year: 2022 },
  { slug: 'wes-moore', year: 2022 },
  { slug: 'tim-walz', year: 2022 },
  { slug: 'tony-evers', year: 2022 },
  { slug: 'katie-hobbs', year: 2022 },
  { slug: 'phil-scott', year: 2022 },
  { slug: 'kelly-ayotte', year: 2024 },
  { slug: 'josh-stein', year: 2024 },
  { slug: 'matt-meyer', year: 2024 },
  { slug: 'bob-ferguson', year: 2024 },
  { slug: 'kelly-armstrong', year: 2024 },
  { slug: 'mike-kehoe', year: 2024 },
  { slug: 'patrick-morrisey', year: 2024 },
  { slug: 'nancy-pelosi', year: 2022 },
  { slug: 'hakeem-jeffries', year: 2022 },
  { slug: 'kevin-mccarthy', year: 2022 },
  { slug: 'marjorie-taylor-greene', year: 2024 },
  { slug: 'alexandria-ocasio-cortez', year: 2024 },
  { slug: 'mike-lawler', year: 2024 },
  { slug: 'maxwell-frost', year: 2024 },
]

// Step 1: Get politician IDs for all verified slugs
const uniqueSlugs = [...new Set(VERIFIED.map(v => v.slug))]

console.log(`Looking up ${uniqueSlugs.length} politician slugs...`)

const { data: politicians, error: polError } = await supabase
  .from('politicians')
  .select('id, slug')
  .in('slug', uniqueSlugs)

if (polError) {
  console.error('Error fetching politicians:', polError.message)
  process.exit(1)
}

const slugToId = new Map(politicians.map(p => [p.slug, p.id]))

console.log(`Found ${politicians.length} of ${uniqueSlugs.length} politicians`)

// Step 2: Build the set of (politician_id, election_year) keys to KEEP
const keepSet = new Set()
for (const v of VERIFIED) {
  const id = slugToId.get(v.slug)
  if (id) {
    keepSet.add(`${id}|${v.year}`)
  } else {
    console.log(`  Warning: slug "${v.slug}" not found in politicians table`)
  }
}

console.log(`\nKeep set has ${keepSet.size} (politician_id, year) pairs`)

// Step 3: Count total election results before deletion
const { count: totalBefore, error: countError } = await supabase
  .from('election_results')
  .select('*', { count: 'exact', head: true })

if (countError) {
  console.error('Error counting results:', countError.message)
  process.exit(1)
}

console.log(`Total election_results before cleanup: ${totalBefore}`)

// Step 4: Fetch ALL election results (id, politician_id, election_year)
// Supabase returns max 1000 rows per request, so we paginate
let allResults = []
let from = 0
const pageSize = 1000

while (true) {
  const { data, error } = await supabase
    .from('election_results')
    .select('id, politician_id, election_year')
    .range(from, from + pageSize - 1)

  if (error) {
    console.error('Error fetching election results:', error.message)
    process.exit(1)
  }

  allResults = allResults.concat(data)

  if (data.length < pageSize) break
  from += pageSize
}

console.log(`Fetched ${allResults.length} election results total`)

// Step 5: Determine which IDs to delete (NOT in keep set)
const idsToDelete = allResults
  .filter(r => !keepSet.has(`${r.politician_id}|${r.election_year}`))
  .map(r => r.id)

console.log(`Results to KEEP: ${allResults.length - idsToDelete.length}`)
console.log(`Results to DELETE: ${idsToDelete.length}`)

if (idsToDelete.length === 0) {
  console.log('\nNothing to delete. Exiting.')
  process.exit(0)
}

// Step 6: Delete in batches (Supabase .in() has limits)
const batchSize = 100
let deleted = 0

for (let i = 0; i < idsToDelete.length; i += batchSize) {
  const batch = idsToDelete.slice(i, i + batchSize)
  const { error } = await supabase
    .from('election_results')
    .delete()
    .in('id', batch)

  if (error) {
    console.error(`Error deleting batch at offset ${i}:`, error.message)
    process.exit(1)
  }

  deleted += batch.length
  if (deleted % 200 === 0 || deleted === idsToDelete.length) {
    console.log(`  Deleted ${deleted} / ${idsToDelete.length}...`)
  }
}

// Step 7: Count after deletion
const { count: totalAfter, error: afterError } = await supabase
  .from('election_results')
  .select('*', { count: 'exact', head: true })

if (afterError) {
  console.error('Error counting results after:', afterError.message)
  process.exit(1)
}

console.log(`\n--- Summary ---`)
console.log(`Before: ${totalBefore} election results`)
console.log(`Deleted: ${deleted} fictional/unverified results`)
console.log(`After: ${totalAfter} election results (should be ${keepSet.size})`)
