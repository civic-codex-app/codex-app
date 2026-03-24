import { createClient } from '@supabase/supabase-js'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const API_KEY = '79f4243e-ea5a-47f0-97bb-fa2297afb10b'
const GRAPHQL_URL = 'https://openstates.org/graphql'

const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia', PR: 'Puerto Rico',
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function lastName(name) {
  // Strip suffixes
  const cleaned = name.replace(/\s+(Jr\.?|Sr\.?|II|III|IV|V)$/i, '').trim()
  const parts = cleaned.split(' ')
  return parts[parts.length - 1].toLowerCase()
}

function firstName(name) {
  return name.split(' ')[0].toLowerCase()
}

async function fetchAllMissing() {
  const all = []
  let from = 0
  while (true) {
    const { data, error } = await sb.from('politicians')
      .select('id, name, state, chamber')
      .is('image_url', null)
      .order('state')
      .range(from, from + 999)
    if (error) { console.error('Supabase error:', error); break }
    if (!data || !data.length) break
    all.push(...data)
    if (data.length < 1000) break
    from += 1000
  }
  return all
}

async function fetchOpenStatesMembers(stateName) {
  const query = `{
    jurisdiction(name: "${stateName}") {
      organizations(classification: "legislature") {
        edges {
          node {
            children(first: 5) {
              edges {
                node {
                  name
                  currentMembers {
                    edges {
                      node {
                        person {
                          name
                          image
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }`

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': API_KEY,
    },
    body: JSON.stringify({ query }),
  })

  if (res.status === 429) {
    console.log('  Rate limited! Waiting 30 seconds...')
    await sleep(30000)
    return fetchOpenStatesMembers(stateName) // retry
  }

  if (!res.ok) {
    console.error(`  HTTP ${res.status}: ${await res.text()}`)
    return []
  }

  const json = await res.json()
  if (json.errors) {
    console.error(`  GraphQL errors:`, json.errors.map(e => e.message).join(', '))
    return []
  }

  // Extract all members from all chambers
  const members = []
  const jurisdiction = json.data?.jurisdiction
  if (!jurisdiction) return []

  const orgs = jurisdiction.organizations?.edges || []
  for (const orgEdge of orgs) {
    const children = orgEdge.node?.children?.edges || []
    for (const childEdge of children) {
      const currentMembers = childEdge.node?.currentMembers?.edges || []
      for (const memberEdge of currentMembers) {
        const person = memberEdge.node?.person
        if (person && person.image) {
          members.push({
            name: person.name,
            image: person.image,
          })
        }
      }
    }
  }
  return members
}

// Alternative simpler query using people search
async function fetchOpenStatesPeople(stateName) {
  const query = `{
    people(jurisdiction: "${stateName}", first: 200) {
      edges {
        node {
          name
          image
          currentMemberships {
            organization {
              name
              classification
            }
          }
        }
      }
    }
  }`

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': API_KEY,
    },
    body: JSON.stringify({ query }),
  })

  if (res.status === 429) {
    console.log('  Rate limited! Waiting 30 seconds...')
    await sleep(30000)
    return fetchOpenStatesPeople(stateName) // retry
  }

  if (!res.ok) {
    const text = await res.text()
    console.error(`  HTTP ${res.status}: ${text.slice(0, 200)}`)
    return []
  }

  const json = await res.json()
  if (json.errors) {
    console.error(`  GraphQL errors:`, json.errors.map(e => e.message).join(', '))
    return []
  }

  const members = []
  const edges = json.data?.people?.edges || []
  for (const edge of edges) {
    const node = edge.node
    if (node && node.image) {
      members.push({
        name: node.name,
        image: node.image,
      })
    }
  }
  return members
}

function findMatch(politician, osMembers) {
  const pLast = lastName(politician.name)
  const pFirst = firstName(politician.name)

  // Try exact last name match first
  const lastMatches = osMembers.filter(m => lastName(m.name) === pLast)

  if (lastMatches.length === 1) {
    return lastMatches[0]
  }

  // If multiple last name matches, try first name too
  if (lastMatches.length > 1) {
    const fullMatch = lastMatches.find(m => firstName(m.name) === pFirst)
    if (fullMatch) return fullMatch
    // Try first name starts with
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
  const missing = await fetchAllMissing()
  console.log(`Found ${missing.length} politicians without photos`)

  // Group by state
  const byState = {}
  for (const p of missing) {
    if (!p.state) continue
    if (!byState[p.state]) byState[p.state] = []
    byState[p.state].push(p)
  }

  const stateKeys = Object.keys(byState).sort()
  console.log(`Spread across ${stateKeys.length} states: ${stateKeys.join(', ')}`)
  console.log()

  let totalFound = 0
  let totalUpdated = 0
  let totalSkipped = 0

  for (let i = 0; i < stateKeys.length; i++) {
    const stateCode = stateKeys[i]
    const stateName = STATE_NAMES[stateCode]
    const politicians = byState[stateCode]

    if (!stateName) {
      console.log(`[${i + 1}/${stateKeys.length}] ${stateCode} - no state name mapping, skipping`)
      continue
    }

    // Skip non-state entries (federal-level without state)
    if (['DC', 'PR'].includes(stateCode)) {
      // DC and PR are fine for OpenStates
    }

    console.log(`[${i + 1}/${stateKeys.length}] ${stateName} (${stateCode}) - ${politicians.length} missing`)

    // Fetch OpenStates data
    const osMembers = await fetchOpenStatesPeople(stateName)
    console.log(`  OpenStates returned ${osMembers.length} members with photos`)

    if (osMembers.length === 0) {
      console.log(`  Skipping - no data`)
      if (i < stateKeys.length - 1) await sleep(2000)
      continue
    }

    // Match each politician
    let stateFound = 0
    for (const p of politicians) {
      const match = findMatch(p, osMembers)
      if (match) {
        stateFound++
        totalFound++

        // Update Supabase
        const { error } = await sb.from('politicians')
          .update({ image_url: match.image })
          .eq('id', p.id)

        if (error) {
          console.log(`  ERROR updating ${p.name}: ${error.message}`)
        } else {
          totalUpdated++
          console.log(`  ✓ ${p.name} → ${match.name} (${match.image.slice(0, 60)}...)`)
        }
      } else {
        totalSkipped++
        // Log unmatched for debugging
        console.log(`  ✗ ${p.name} - no match`)
      }
    }

    console.log(`  Found ${stateFound}/${politicians.length} matches`)

    // Rate limit delay
    if (i < stateKeys.length - 1) {
      await sleep(2000)
    }
  }

  console.log()
  console.log('=== SUMMARY ===')
  console.log(`Total politicians missing photos: ${missing.length}`)
  console.log(`Total matches found: ${totalFound}`)
  console.log(`Total updated in DB: ${totalUpdated}`)
  console.log(`Total unmatched: ${totalSkipped}`)
}

main().catch(console.error)
