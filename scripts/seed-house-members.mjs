/**
 * Seed missing U.S. House members from theunitedstates.io legislators data.
 * Data source: https://theunitedstates.io/congress-legislators/legislators-current.json
 * Photos: https://theunitedstates.io/images/congress/450x550/{bioguideId}.jpg
 *
 * Usage:
 *   cd "Codex App"
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/seed-house-members.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// ---------- env ----------
const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}
const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// ---------- helpers ----------
function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/['']/g, '')           // remove apostrophes
    .replace(/[^a-z0-9]+/g, '-')   // non-alphanum → hyphen
    .replace(/(^-|-$)/g, '')        // trim leading/trailing hyphens
}

const STATE_ABBR = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY',
  // territories / DC
  'District of Columbia': 'DC', 'Puerto Rico': 'PR', 'Guam': 'GU',
  'American Samoa': 'AS', 'U.S. Virgin Islands': 'VI',
  'Northern Mariana Islands': 'MP',
}

function mapParty(p) {
  if (!p) return 'independent'
  const lp = p.toLowerCase()
  if (lp === 'democrat') return 'democrat'
  if (lp === 'republican') return 'republican'
  return 'independent'
}

// ---------- fetch current legislators ----------
async function fetchLegislators() {
  const url = 'https://theunitedstates.io/congress-legislators/legislators-current.json'
  console.log(`Fetching legislators from ${url} ...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ---------- fetch existing house members ----------
async function fetchExistingHouse() {
  const names = new Set()
  const slugs = new Set()
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await supabase
      .from('politicians')
      .select('name, slug')
      .eq('chamber', 'house')
      .range(from, from + PAGE - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    for (const r of data) {
      names.add(r.name.toLowerCase())
      slugs.add(r.slug)
    }
    if (data.length < PAGE) break
    from += PAGE
  }
  return { names, slugs }
}

// ---------- main ----------
async function main() {
  const legislators = await fetchLegislators()
  console.log(`Got ${legislators.length} total legislators`)

  // Filter to current House reps (type "rep")
  const houseMembers = legislators.filter(l => {
    const latest = l.terms[l.terms.length - 1]
    return latest.type === 'rep'
  })
  console.log(`${houseMembers.length} current House members from API`)

  const { names: existingNames, slugs: existingSlugs } = await fetchExistingHouse()
  console.log(`${existingNames.size} existing House members in DB`)

  const toInsert = []

  for (const m of houseMembers) {
    const latest = m.terms[m.terms.length - 1]
    const firstName = m.name.official_full
      ? m.name.official_full.split(' ')[0]
      : m.name.first
    const fullName = m.name.official_full || `${m.name.first} ${m.name.last}`

    // Skip non-voting delegates from territories
    const state = latest.state
    if (!['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].includes(state)) {
      continue
    }

    // Check if already in DB
    if (existingNames.has(fullName.toLowerCase())) continue

    const slug = slugify(fullName)
    // If slug already exists, append district
    let finalSlug = slug
    if (existingSlugs.has(slug)) {
      finalSlug = `${slug}-${state.toLowerCase()}-${latest.district || 'al'}`
    }

    const bioguideId = m.id.bioguide
    const imageUrl = bioguideId
      ? `https://theunitedstates.io/images/congress/450x550/${bioguideId}.jpg`
      : null

    const party = mapParty(latest.party)
    const district = latest.district ? `${state}-${latest.district}` : `${state}-AL`
    const startYear = latest.start ? new Date(latest.start).getFullYear() : null

    const websiteUrl = latest.url || null
    const twitterHandle = (m.id.twitter || m.id['twitter_id'] || null)
      ? (m.id.twitter || m.id['twitter_id']) : null

    // Build a simple bio
    const districtLabel = latest.district
      ? `${getOrdinal(latest.district)} congressional district`
      : 'at-large congressional district'
    const bio = `U.S. Representative for ${state}'s ${districtLabel}${startYear ? `, serving since ${startYear}` : ''}.`

    toInsert.push({
      name: fullName,
      slug: finalSlug,
      state,
      chamber: 'house',
      party,
      title: 'U.S. Representative',
      image_url: imageUrl,
      bio,
      website_url: websiteUrl,
      twitter_handle: twitterHandle,
    })

    existingSlugs.add(finalSlug)
    existingNames.add(fullName.toLowerCase())
  }

  console.log(`${toInsert.length} new House members to insert`)

  if (toInsert.length === 0) {
    console.log('Nothing to insert.')
    return
  }

  // Insert in batches of 50
  let inserted = 0
  const BATCH = 50
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH)
    const { data, error } = await supabase
      .from('politicians')
      .upsert(batch, { onConflict: 'slug', ignoreDuplicates: true })
      .select('id')
    if (error) {
      console.error(`Batch ${i / BATCH + 1} error:`, error.message)
      // Try one by one for failed batch
      for (const row of batch) {
        const { error: e2 } = await supabase
          .from('politicians')
          .upsert(row, { onConflict: 'slug', ignoreDuplicates: true })
        if (e2) {
          console.error(`  Failed: ${row.name} — ${e2.message}`)
        } else {
          inserted++
        }
      }
    } else {
      inserted += batch.length
      console.log(`  Inserted batch ${Math.floor(i / BATCH) + 1} (${batch.length} members)`)
    }
  }

  console.log(`\nDone! Inserted ${inserted} new House members.`)

  // Final count
  const { count } = await supabase
    .from('politicians')
    .select('*', { count: 'exact', head: true })
    .eq('chamber', 'house')
  console.log(`Total House members in DB now: ${count}`)
}

function getOrdinal(n) {
  const num = parseInt(n, 10)
  const s = ['th', 'st', 'nd', 'rd']
  const v = num % 100
  return num + (s[(v - 20) % 10] || s[v] || s[0])
}

main().catch(e => { console.error(e); process.exit(1) })
