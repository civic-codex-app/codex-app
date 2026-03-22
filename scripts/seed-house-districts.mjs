// Seed script: populate district column for US House members
// Uses the @unitedstates/congress-legislators data as authoritative source
//
// Usage:
//   cd "/Users/nick/Documents/Codex App"
//   node scripts/seed-house-districts.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// ── Load env ────────────────────────────────────────────────────
const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// ── State FIPS → abbreviation ───────────────────────────────────
const FIPS_TO_STATE = {
  AL: 'AL', AK: 'AK', AZ: 'AZ', AR: 'AR', CA: 'CA', CO: 'CO', CT: 'CT',
  DE: 'DE', FL: 'FL', GA: 'GA', HI: 'HI', ID: 'ID', IL: 'IL', IN: 'IN',
  IA: 'IA', KS: 'KS', KY: 'KY', LA: 'LA', ME: 'ME', MD: 'MD', MA: 'MA',
  MI: 'MI', MN: 'MN', MS: 'MS', MO: 'MO', MT: 'MT', NE: 'NE', NV: 'NV',
  NH: 'NH', NJ: 'NJ', NM: 'NM', NY: 'NY', NC: 'NC', ND: 'ND', OH: 'OH',
  OK: 'OK', OR: 'OR', PA: 'PA', RI: 'RI', SC: 'SC', SD: 'SD', TN: 'TN',
  TX: 'TX', UT: 'UT', VT: 'VT', VA: 'VA', WA: 'WA', WV: 'WV', WI: 'WI',
  WY: 'WY', DC: 'DC', AS: 'AS', GU: 'GU', MP: 'MP', PR: 'PR', VI: 'VI',
}

function normalize(name) {
  return name
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function lastName(name) {
  const parts = normalize(name).split(' ')
  // Handle suffixes like Jr., III, IV, Sr.
  const suffixes = ['jr', 'sr', 'ii', 'iii', 'iv', 'v']
  let last = parts[parts.length - 1]
  if (suffixes.includes(last) && parts.length > 1) {
    last = parts[parts.length - 2]
  }
  return last
}

async function main() {
  // ── 1. Check if district column exists ────────────────────────
  console.log('Checking if district column exists...')
  const { data: testRow, error: testErr } = await supabase
    .from('politicians')
    .select('id, district')
    .limit(1)

  if (testErr && testErr.message.includes('district')) {
    console.error('❌ The "district" column does not exist on the politicians table.')
    console.error('Please run this SQL in the Supabase dashboard:')
    console.error('  ALTER TABLE politicians ADD COLUMN IF NOT EXISTS district text;')
    process.exit(1)
  }
  console.log('✓ district column exists')

  // ── 2. Fetch congress-legislators data ────────────────────────
  console.log('Fetching congress-legislators data...')
  const URLS = [
    'https://raw.githubusercontent.com/unitedstates/congress-legislators/gh-pages/legislators-current.json',
    'https://theunitedstates.io/congress-legislators/legislators-current.json',
    'https://raw.githubusercontent.com/unitedstates/congress-legislators/main/legislators-current.json',
  ]

  let legislators = null
  for (const url of URLS) {
    try {
      console.log(`  Trying ${url} ...`)
      const res = await fetch(url)
      if (res.ok) {
        legislators = await res.json()
        console.log(`  ✓ Fetched from ${url}`)
        break
      }
      console.log(`  ✗ HTTP ${res.status}`)
    } catch (err) {
      console.log(`  ✗ ${err.message}`)
    }
  }
  if (!legislators) throw new Error('Failed to fetch legislators from all sources')

  // Filter to current House representatives
  const houseMembers = legislators.filter((leg) => {
    const currentTerm = leg.terms[leg.terms.length - 1]
    return currentTerm.type === 'rep'
  })

  console.log(`Found ${houseMembers.length} current House members in source data`)

  // Build lookup: { state+lastName -> { district, firstName, lastName, fullName } }
  const sourceLookup = new Map()
  for (const leg of houseMembers) {
    const term = leg.terms[leg.terms.length - 1]
    const state = term.state
    const district = String(term.district)
    const first = leg.name.first
    const last = leg.name.last
    const official = leg.name.official_full || `${first} ${last}`
    const key = `${state}:${lastName(last)}`

    if (!sourceLookup.has(key)) {
      sourceLookup.set(key, [])
    }
    sourceLookup.get(key).push({
      district,
      firstName: normalize(first),
      lastName: normalize(last),
      fullName: official,
      state,
    })
  }

  // ── 3. Fetch all House members from our DB ────────────────────
  console.log('Fetching House members from DB...')
  let allHouse = []
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await supabase
      .from('politicians')
      .select('id, name, state, chamber, district')
      .eq('chamber', 'house')
      .range(from, from + PAGE - 1)

    if (error) throw error
    if (!data || data.length === 0) break
    allHouse = allHouse.concat(data)
    if (data.length < PAGE) break
    from += PAGE
  }

  console.log(`Found ${allHouse.length} House members in DB`)

  // ── 4. Match and update ───────────────────────────────────────
  let matched = 0
  let skipped = 0
  let alreadySet = 0
  const unmatched = []

  for (const pol of allHouse) {
    if (pol.district) {
      alreadySet++
      continue
    }

    const last = lastName(pol.name)
    const key = `${pol.state}:${last}`
    const candidates = sourceLookup.get(key)

    if (!candidates || candidates.length === 0) {
      unmatched.push(pol.name + ' (' + pol.state + ')')
      skipped++
      continue
    }

    let match = null
    if (candidates.length === 1) {
      match = candidates[0]
    } else {
      // Multiple matches for same last name + state — match on first name
      const polFirst = normalize(pol.name).split(' ')[0]
      match = candidates.find((c) => c.firstName === polFirst)
      if (!match) {
        // Try partial first name match
        match = candidates.find((c) => c.firstName.startsWith(polFirst) || polFirst.startsWith(c.firstName))
      }
    }

    if (match) {
      const { error } = await supabase
        .from('politicians')
        .update({ district: match.district })
        .eq('id', pol.id)

      if (error) {
        console.error(`  ✗ Failed to update ${pol.name}: ${error.message}`)
        skipped++
      } else {
        console.log(`  ✓ ${pol.name} (${pol.state}) → District ${match.district}`)
        matched++
      }
    } else {
      unmatched.push(pol.name + ' (' + pol.state + ')')
      skipped++
    }
  }

  console.log('\n── Summary ──')
  console.log(`  Matched & updated: ${matched}`)
  console.log(`  Already had district: ${alreadySet}`)
  console.log(`  Unmatched/skipped: ${skipped}`)
  if (unmatched.length > 0) {
    console.log(`  Unmatched names:`)
    for (const n of unmatched) console.log(`    - ${n}`)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
