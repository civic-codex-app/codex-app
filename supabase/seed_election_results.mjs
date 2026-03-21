import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// State partisan lean (higher = more Republican)
const STATE_LEAN = {
  AL: 0.72, AK: 0.62, AZ: 0.51, AR: 0.68, CA: 0.32, CO: 0.45, CT: 0.40, DE: 0.42,
  FL: 0.54, GA: 0.50, HI: 0.30, ID: 0.72, IL: 0.38, IN: 0.62, IA: 0.56, KS: 0.64,
  KY: 0.66, LA: 0.62, ME: 0.44, MD: 0.34, MA: 0.30, MI: 0.49, MN: 0.46, MS: 0.64,
  MO: 0.60, MT: 0.62, NE: 0.66, NV: 0.49, NH: 0.48, NJ: 0.40, NM: 0.44, NY: 0.36,
  NC: 0.52, ND: 0.70, OH: 0.56, OK: 0.72, OR: 0.42, PA: 0.50, RI: 0.38, SC: 0.60,
  SD: 0.68, TN: 0.66, TX: 0.56, UT: 0.66, VT: 0.32, VA: 0.46, WA: 0.40, WV: 0.72,
  WI: 0.49, WY: 0.74, DC: 0.10,
}

// Opponent first names and last names for generating fictional opponents
const FIRST_NAMES = [
  'James', 'Robert', 'Patricia', 'Linda', 'Michael', 'Barbara', 'William', 'Elizabeth',
  'David', 'Jennifer', 'Richard', 'Maria', 'Joseph', 'Susan', 'Thomas', 'Margaret',
  'Sarah', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Helen', 'Anthony', 'Donna',
  'Mark', 'Carol', 'Steven', 'Ruth', 'Andrew', 'Sharon', 'Paul', 'Michelle',
  'Kevin', 'Laura', 'Brian', 'Christine', 'George', 'Dorothy', 'Timothy', 'Lisa',
]

const LAST_NAMES = [
  'Anderson', 'Mitchell', 'Campbell', 'Roberts', 'Thompson', 'Garcia', 'Martinez',
  'Robinson', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez',
  'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker',
  'Nelson', 'Carter', 'Turner', 'Phillips', 'Parker', 'Evans', 'Edwards',
  'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan',
  'Bell', 'Murphy', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward',
]

// Simple seeded random based on string hash
function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function seededRandom(seed) {
  const h = hashStr(seed)
  return (h % 10000) / 10000
}

function getOpponentName(seed) {
  const h1 = hashStr(seed + 'first')
  const h2 = hashStr(seed + 'last')
  return FIRST_NAMES[h1 % FIRST_NAMES.length] + ' ' + LAST_NAMES[h2 % LAST_NAMES.length]
}

function getOpponentParty(polParty) {
  if (polParty === 'democrat') return 'republican'
  if (polParty === 'republican') return 'democrat'
  return seededRandom('opp') > 0.5 ? 'democrat' : 'republican'
}

// Election cycle logic
function getElectionYears(chamber, sinceYear) {
  const years = []
  const cycleLength = chamber === 'senate' ? 6 : chamber === 'house' ? 2 : chamber === 'governor' ? 4 : 4

  // Work backward from the most recent election year at or before 2024
  // Senators have class-based cycles: start from sinceYear and step by 6
  let startYear = sinceYear
  if (startYear % 2 !== 0) startYear-- // Elections are in even years

  for (let y = startYear; y <= 2024; y += cycleLength) {
    if (y >= 2000 && y <= 2024) {
      years.push(y)
    }
  }

  // If no years found, at least include the most recent valid election
  if (years.length === 0 && sinceYear) {
    let y = sinceYear
    if (y % 2 !== 0) y--
    if (y >= 2000 && y <= 2024) years.push(y)
  }

  return years
}

function generateVotePercentage(polParty, state, seed) {
  const lean = STATE_LEAN[state] ?? 0.50
  const r = seededRandom(seed)

  let baseWinPct
  if (polParty === 'republican') {
    // Higher lean = easier win for R
    baseWinPct = 45 + lean * 25 + r * 8
  } else if (polParty === 'democrat') {
    baseWinPct = 45 + (1 - lean) * 25 + r * 8
  } else {
    baseWinPct = 40 + r * 20
  }

  // Clamp to realistic range
  return Math.min(Math.max(baseWinPct, 42), 78)
}

function generateTotalVotes(chamber, state, seed) {
  const r = seededRandom(seed)
  const base = chamber === 'senate' ? 2000000 : chamber === 'house' ? 300000 : chamber === 'governor' ? 1800000 : 70000000
  // Vary by ±40%
  return Math.round(base * (0.6 + r * 0.8))
}

// Fetch all politicians
const { data: politicians } = await supabase
  .from('politicians')
  .select('id, name, slug, state, chamber, party, since_year')
  .order('name')

console.log(`Found ${politicians.length} politicians`)

// Check existing
const { data: existing } = await supabase.from('election_results').select('politician_id, election_year, chamber')
const existingSet = new Set((existing ?? []).map(e => `${e.politician_id}:${e.election_year}:${e.chamber}`))
console.log(`Existing results: ${existing?.length ?? 0}`)

const rows = []

for (const pol of politicians) {
  const sinceYear = pol.since_year || 2020
  const years = getElectionYears(pol.chamber, sinceYear)

  for (const year of years) {
    const key = `${pol.id}:${year}:${pol.chamber}`
    if (existingSet.has(key)) continue

    const seed = `${pol.slug}:${year}`
    const votePct = Number(generateVotePercentage(pol.party, pol.state, seed).toFixed(1))
    const oppParty = getOpponentParty(pol.party)
    const oppPct = Number((100 - votePct - (seededRandom(seed + 'third') * 4)).toFixed(1))
    const totalVotes = generateTotalVotes(pol.chamber, pol.state, seed)
    const oppName = getOpponentName(seed)

    let raceName = `${pol.state} `
    if (pol.chamber === 'senate') raceName += 'Senate'
    else if (pol.chamber === 'house') raceName += 'House'
    else if (pol.chamber === 'governor') raceName += 'Governor'
    else if (pol.chamber === 'presidential') raceName = 'U.S. Presidential'

    // Most elections are wins (they're current officials), but add some losses for realism
    let result = 'won'
    const lossChance = seededRandom(seed + 'loss')
    // ~8% chance a non-current-cycle result is a loss (e.g., they lost before winning later)
    if (year < sinceYear && lossChance < 0.08) {
      result = 'lost'
    }

    const isSpecial = seededRandom(seed + 'special') < 0.04

    rows.push({
      politician_id: pol.id,
      election_year: year,
      state: pol.state,
      chamber: pol.chamber,
      race_name: raceName,
      party: pol.party,
      result,
      vote_percentage: votePct,
      total_votes: totalVotes,
      opponent_name: oppName,
      opponent_party: oppParty,
      opponent_vote_percentage: Math.max(oppPct, 15),
      is_special_election: isSpecial,
      is_runoff: false,
      notes: isSpecial ? 'Special election' : result === 'lost' ? 'Lost before eventual win' : null,
    })
  }
}

console.log(`\nInserting ${rows.length} election results...`)

const BATCH = 200
let inserted = 0
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH)
  const { error } = await supabase.from('election_results').insert(batch)
  if (error) {
    console.error('Error:', error.message)
    // Log the first row of the failed batch for debugging
    console.error('First row:', JSON.stringify(batch[0], null, 2))
    break
  }
  inserted += batch.length
  process.stdout.write(`\r  Inserted ${inserted}/${rows.length}`)
}

console.log('\nDone!')

const { count } = await supabase.from('election_results').select('*', { count: 'exact', head: true })
console.log(`Total election results in DB: ${count}`)
