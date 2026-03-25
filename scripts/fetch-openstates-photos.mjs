/**
 * Fetch photos from OpenStates REST API v3 for politicians missing images.
 * Usage: export $(grep -v '^#' .env.local | xargs) && node scripts/fetch-openstates-photos.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const sb = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)
const API_KEY = vars.OPENSTATES_API_KEY || '79f4243e-ea5a-47f0-97bb-fa2297afb10b'

const STATE_NAMES = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
  HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',
  KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',
  MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',
  MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',
  NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',
  OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
  SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',
  VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
  DC:'District of Columbia',PR:'Puerto Rico',
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function lastName(name) {
  return name.replace(/\s+(Jr\.?|Sr\.?|II|III|IV|V)$/i, '').trim().split(' ').pop().toLowerCase()
}
function firstName(name) {
  return name.split(' ')[0].toLowerCase()
}

async function fetchOpenStatesPeople(stateName) {
  const allPeople = []
  let page = 1

  while (true) {
    const url = `https://v3.openstates.org/people?jurisdiction=${encodeURIComponent(stateName)}&per_page=50&page=${page}&apikey=${API_KEY}`
    const res = await fetch(url)

    if (res.status === 429) {
      console.log('  Rate limited, waiting 30s...')
      await sleep(30000)
      continue
    }

    if (!res.ok) {
      console.error(`  HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
      break
    }

    const json = await res.json()
    const results = json.results || []

    for (const person of results) {
      if (person.image) {
        allPeople.push({ name: person.name, image: person.image })
      }
    }

    // Check if there are more pages
    if (results.length < 50) break
    page++
    await sleep(500) // Be polite
  }

  return allPeople
}

function findMatch(politician, osMembers) {
  const pLast = lastName(politician.name)
  const pFirst = firstName(politician.name)

  const lastMatches = osMembers.filter(m => lastName(m.name) === pLast)

  if (lastMatches.length === 1) return lastMatches[0]

  if (lastMatches.length > 1) {
    const fullMatch = lastMatches.find(m => firstName(m.name) === pFirst)
    if (fullMatch) return fullMatch
    const partialMatch = lastMatches.find(m =>
      firstName(m.name).startsWith(pFirst.slice(0, 3)) ||
      pFirst.startsWith(firstName(m.name).slice(0, 3))
    )
    if (partialMatch) return partialMatch
  }

  return null
}

async function main() {
  console.log('Fetching politicians with missing photos...')
  const all = []
  let from = 0
  while (true) {
    const { data } = await sb.from('politicians')
      .select('id, name, state, chamber')
      .is('image_url', null)
      .order('state')
      .range(from, from + 999)
    if (!data?.length) break
    all.push(...data)
    from += 1000
  }
  console.log(`Found ${all.length} politicians without photos`)

  // Group by state
  const byState = {}
  for (const p of all) {
    if (!p.state) continue
    if (!byState[p.state]) byState[p.state] = []
    byState[p.state].push(p)
  }

  const stateKeys = Object.keys(byState).sort()
  console.log(`Across ${stateKeys.length} states\n`)

  let totalFound = 0, totalUpdated = 0, totalSkipped = 0

  for (let i = 0; i < stateKeys.length; i++) {
    const stateCode = stateKeys[i]
    const stateName = STATE_NAMES[stateCode]
    const politicians = byState[stateCode]

    if (!stateName) {
      console.log(`[${i + 1}/${stateKeys.length}] ${stateCode} - no mapping, skipping`)
      continue
    }

    console.log(`[${i + 1}/${stateKeys.length}] ${stateName} (${stateCode}) - ${politicians.length} missing`)

    const osMembers = await fetchOpenStatesPeople(stateName)
    console.log(`  OpenStates: ${osMembers.length} members with photos`)

    if (osMembers.length === 0) {
      console.log(`  Skipping`)
      await sleep(1500)
      continue
    }

    let stateFound = 0
    for (const p of politicians) {
      const match = findMatch(p, osMembers)
      if (match) {
        stateFound++
        totalFound++
        const { error } = await sb.from('politicians').update({ image_url: match.image }).eq('id', p.id)
        if (error) {
          console.log(`  ERROR ${p.name}: ${error.message}`)
        } else {
          totalUpdated++
        }
      } else {
        totalSkipped++
      }
    }

    console.log(`  Matched ${stateFound}/${politicians.length}`)
    await sleep(1500)
  }

  console.log('\n=== SUMMARY ===')
  console.log(`Missing: ${all.length}`)
  console.log(`Matched: ${totalFound}`)
  console.log(`Updated: ${totalUpdated}`)
  console.log(`Unmatched: ${totalSkipped}`)
}

main().catch(console.error)
