// Download zip-to-congressional-district CSV and convert to JSON
//
// Usage:
//   node scripts/build-zip-district-json.mjs
//
// Output: lib/data/zip-to-district.json

import { writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'

const CSV_URL =
  'https://raw.githubusercontent.com/OpenSourceActivismTech/us-zipcodes-congress/master/zccd.csv'

// FIPS state codes → abbreviations
const FIPS = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY', '60': 'AS', '66': 'GU', '69': 'MP', '72': 'PR', '78': 'VI',
}

async function main() {
  console.log('Downloading zip-to-district CSV...')
  const res = await fetch(CSV_URL)
  if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`)
  const text = await res.text()

  const lines = text.trim().split('\n')
  const header = lines[0]
  console.log(`CSV header: ${header}`)
  console.log(`Total rows: ${lines.length - 1}`)

  // Parse CSV — format is: zcta,state_fips,cd
  // zcta = zip code tabulation area (5-digit)
  // state_fips = 2-digit state FIPS code
  // cd = congressional district number (00 = at-large, ZZ = unassigned)
  const lookup = {}
  let skipped = 0

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split(',')
    if (parts.length < 4) continue

    // CSV columns: state_fips, state_abbr, zcta, cd
    const stateFips = parts[0].trim()
    const zip = parts[2].trim().padStart(5, '0')
    const cd = parts[3].trim()

    const state = FIPS[stateFips]
    if (!state) {
      skipped++
      continue
    }

    // Skip ZZ (unassigned) districts
    if (cd === 'ZZ') {
      skipped++
      continue
    }

    // Convert district: "00" means at-large (single district states), store as "0"
    const district = cd === '00' ? '0' : String(parseInt(cd, 10))

    if (!lookup[zip]) {
      lookup[zip] = []
    }

    // Avoid duplicates
    const exists = lookup[zip].some((e) => e.state === state && e.district === district)
    if (!exists) {
      lookup[zip].push({ state, district })
    }
  }

  const zipCount = Object.keys(lookup).length
  console.log(`Parsed ${zipCount} unique zip codes`)
  console.log(`Skipped ${skipped} rows (unknown FIPS or ZZ district)`)

  // Write JSON
  const outPath = 'lib/data/zip-to-district.json'
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(lookup))
  console.log(`Written to ${outPath}`)

  // Stats
  const totalEntries = Object.values(lookup).reduce((sum, arr) => sum + arr.length, 0)
  const multiDistrict = Object.values(lookup).filter((arr) => arr.length > 1).length
  console.log(`Total entries: ${totalEntries}`)
  console.log(`Zips spanning multiple districts: ${multiDistrict}`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
