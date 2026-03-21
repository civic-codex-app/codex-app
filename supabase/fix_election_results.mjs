import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Real opponents for notable races
// Format: { slug, year, opponent_name, opponent_party, vote_pct, opponent_pct, total_votes, notes }
const FIXES = [
  // Presidential
  { slug: 'donald-trump', year: 2024, opponent_name: 'Kamala Harris', opponent_party: 'democrat', vote_pct: 49.9, opponent_pct: 48.4, total_votes: 77303000, race_name: 'U.S. Presidential', notes: 'Won Electoral College 312-226' },
  { slug: 'donald-trump', year: 2020, opponent_name: 'Joe Biden', opponent_party: 'democrat', vote_pct: 46.9, opponent_pct: 51.3, total_votes: 74216000, race_name: 'U.S. Presidential', result: 'lost', notes: 'Lost Electoral College 232-306' },
  { slug: 'donald-trump', year: 2016, opponent_name: 'Hillary Clinton', opponent_party: 'democrat', vote_pct: 46.1, opponent_pct: 48.2, total_votes: 62984828, race_name: 'U.S. Presidential', notes: 'Won Electoral College 304-227' },

  // High-profile Senate races
  { slug: 'ted-cruz', year: 2024, opponent_name: 'Colin Allred', opponent_party: 'democrat', vote_pct: 53.4, opponent_pct: 44.8, total_votes: 5521000 },
  { slug: 'ted-cruz', year: 2018, opponent_name: "Beto O'Rourke", opponent_party: 'democrat', vote_pct: 50.9, opponent_pct: 48.3, total_votes: 4260553 },
  { slug: 'bernie-sanders', year: 2024, opponent_name: 'Gerald Malloy', opponent_party: 'republican', vote_pct: 63.1, opponent_pct: 27.2, total_votes: 356000 },
  { slug: 'bernie-sanders', year: 2018, opponent_name: 'Lawrence Zupan', opponent_party: 'republican', vote_pct: 67.4, opponent_pct: 27.5, total_votes: 290000 },
  { slug: 'mitch-mcconnell', year: 2020, opponent_name: 'Amy McGrath', opponent_party: 'democrat', vote_pct: 57.8, opponent_pct: 38.2, total_votes: 1233315 },
  { slug: 'chuck-schumer', year: 2022, opponent_name: 'Joe Pinion', opponent_party: 'republican', vote_pct: 56.4, opponent_pct: 42.0, total_votes: 5293000 },
  { slug: 'john-fetterman', year: 2022, opponent_name: 'Mehmet Oz', opponent_party: 'republican', vote_pct: 51.2, opponent_pct: 46.3, total_votes: 3396000, notes: 'Flipped seat from Republican' },
  { slug: 'jon-ossoff', year: 2020, opponent_name: 'David Perdue', opponent_party: 'republican', vote_pct: 50.6, opponent_pct: 49.4, total_votes: 4486000, notes: 'Runoff election' },
  { slug: 'raphael-warnock', year: 2022, opponent_name: 'Herschel Walker', opponent_party: 'republican', vote_pct: 51.4, opponent_pct: 48.6, total_votes: 3948000, notes: 'Runoff election' },
  { slug: 'mark-kelly', year: 2022, opponent_name: 'Blake Masters', opponent_party: 'republican', vote_pct: 51.4, opponent_pct: 46.5, total_votes: 2560000 },
  { slug: 'susan-collins', year: 2020, opponent_name: 'Sara Gideon', opponent_party: 'democrat', vote_pct: 51.0, opponent_pct: 42.4, total_votes: 801000 },
  { slug: 'lindsey-graham', year: 2020, opponent_name: 'Jaime Harrison', opponent_party: 'democrat', vote_pct: 54.4, opponent_pct: 44.2, total_votes: 1369000 },
  { slug: 'marco-rubio', year: 2022, opponent_name: 'Val Demings', opponent_party: 'democrat', vote_pct: 57.7, opponent_pct: 41.0, total_votes: 5536000 },
  { slug: 'rand-paul', year: 2022, opponent_name: 'Charles Booker', opponent_party: 'democrat', vote_pct: 61.8, opponent_pct: 36.0, total_votes: 1135000 },
  { slug: 'tim-scott', year: 2022, opponent_name: 'Krystle Matthews', opponent_party: 'democrat', vote_pct: 62.9, opponent_pct: 37.1, total_votes: 1457000 },
  { slug: 'alex-padilla', year: 2022, opponent_name: 'Mark Meuser', opponent_party: 'republican', vote_pct: 60.5, opponent_pct: 39.5, total_votes: 9822000 },
  { slug: 'tammy-baldwin', year: 2024, opponent_name: 'Eric Hovde', opponent_party: 'republican', vote_pct: 49.4, opponent_pct: 48.7, total_votes: 3200000 },
  { slug: 'rick-scott', year: 2024, opponent_name: 'Debbie Mucarsel-Powell', opponent_party: 'democrat', vote_pct: 55.9, opponent_pct: 43.2, total_votes: 5750000 },
  { slug: 'dave-mccormick', year: 2024, opponent_name: 'Bob Casey', opponent_party: 'democrat', vote_pct: 48.9, opponent_pct: 48.5, total_votes: 6900000, notes: 'Defeated incumbent' },
  { slug: 'bernie-moreno', year: 2024, opponent_name: 'Sherrod Brown', opponent_party: 'democrat', vote_pct: 50.2, opponent_pct: 46.4, total_votes: 5600000, notes: 'Defeated incumbent' },
  { slug: 'jim-banks', year: 2024, opponent_name: 'Valerie McCray', opponent_party: 'democrat', vote_pct: 59.5, opponent_pct: 37.8, total_votes: 3000000 },
  { slug: 'john-curtis', year: 2024, opponent_name: 'Caroline Gleich', opponent_party: 'democrat', vote_pct: 60.1, opponent_pct: 32.5, total_votes: 1300000 },

  // High-profile Governor races
  { slug: 'gavin-newsom', year: 2022, opponent_name: 'Brian Dahle', opponent_party: 'republican', vote_pct: 59.2, opponent_pct: 40.8, total_votes: 11200000 },
  { slug: 'ron-desantis', year: 2022, opponent_name: 'Charlie Crist', opponent_party: 'democrat', vote_pct: 59.4, opponent_pct: 40.0, total_votes: 7500000, notes: 'Largest Republican margin in FL since 1868' },
  { slug: 'greg-abbott', year: 2022, opponent_name: "Beto O'Rourke", opponent_party: 'democrat', vote_pct: 54.8, opponent_pct: 43.8, total_votes: 7700000 },
  { slug: 'gretchen-whitmer', year: 2022, opponent_name: 'Tudor Dixon', opponent_party: 'republican', vote_pct: 54.5, opponent_pct: 43.8, total_votes: 4400000 },
  { slug: 'josh-shapiro', year: 2022, opponent_name: 'Doug Mastriano', opponent_party: 'republican', vote_pct: 56.5, opponent_pct: 41.7, total_votes: 5400000 },
  { slug: 'brian-kemp', year: 2022, opponent_name: 'Stacey Abrams', opponent_party: 'democrat', vote_pct: 53.4, opponent_pct: 45.9, total_votes: 3900000 },
  { slug: 'kathy-hochul', year: 2022, opponent_name: 'Lee Zeldin', opponent_party: 'republican', vote_pct: 52.9, opponent_pct: 47.1, total_votes: 6100000 },
  { slug: 'jb-pritzker', year: 2022, opponent_name: 'Darren Bailey', opponent_party: 'republican', vote_pct: 54.9, opponent_pct: 42.6, total_votes: 4200000 },
  { slug: 'wes-moore', year: 2022, opponent_name: 'Dan Cox', opponent_party: 'republican', vote_pct: 63.7, opponent_pct: 33.6, total_votes: 2300000 },
  { slug: 'tim-walz', year: 2022, opponent_name: 'Scott Jensen', opponent_party: 'republican', vote_pct: 52.3, opponent_pct: 44.6, total_votes: 2600000 },
  { slug: 'tony-evers', year: 2022, opponent_name: 'Tim Michels', opponent_party: 'republican', vote_pct: 51.2, opponent_pct: 47.8, total_votes: 2700000 },
  { slug: 'katie-hobbs', year: 2022, opponent_name: 'Kari Lake', opponent_party: 'republican', vote_pct: 50.3, opponent_pct: 49.7, total_votes: 2560000 },
  { slug: 'phil-scott', year: 2022, opponent_name: 'Brenda Siegel', opponent_party: 'democrat', vote_pct: 72.1, opponent_pct: 23.3, total_votes: 276000 },
  { slug: 'kelly-ayotte', year: 2024, opponent_name: 'Joyce Craig', opponent_party: 'democrat', vote_pct: 52.2, opponent_pct: 45.6, total_votes: 770000 },
  { slug: 'josh-stein', year: 2024, opponent_name: 'Mark Robinson', opponent_party: 'republican', vote_pct: 55.5, opponent_pct: 43.0, total_votes: 5700000 },
  { slug: 'matt-meyer', year: 2024, opponent_name: 'Mike Ramone', opponent_party: 'republican', vote_pct: 55.8, opponent_pct: 44.2, total_votes: 480000 },
  { slug: 'bob-ferguson', year: 2024, opponent_name: 'Dave Reichert', opponent_party: 'republican', vote_pct: 56.4, opponent_pct: 43.6, total_votes: 4100000 },
  { slug: 'kelly-armstrong', year: 2024, opponent_name: 'Merrill Piepkorn', opponent_party: 'democrat', vote_pct: 67.3, opponent_pct: 29.0, total_votes: 360000 },
  { slug: 'mike-kehoe', year: 2024, opponent_name: 'Crystal Quade', opponent_party: 'democrat', vote_pct: 58.5, opponent_pct: 37.8, total_votes: 2900000 },
  { slug: 'patrick-morrisey', year: 2024, opponent_name: 'Steve Williams', opponent_party: 'democrat', vote_pct: 55.8, opponent_pct: 41.2, total_votes: 700000 },

  // Notable House races
  { slug: 'nancy-pelosi', year: 2022, opponent_name: 'John Dennis', opponent_party: 'republican', vote_pct: 83.6, opponent_pct: 16.4, total_votes: 291000 },
  { slug: 'hakeem-jeffries', year: 2022, opponent_name: 'Yuri Dashevsky', opponent_party: 'republican', vote_pct: 73.6, opponent_pct: 24.3, total_votes: 229000 },
  { slug: 'kevin-mccarthy', year: 2022, opponent_name: 'Marisa Wood', opponent_party: 'democrat', vote_pct: 66.0, opponent_pct: 34.0, total_votes: 218000 },
  { slug: 'marjorie-taylor-greene', year: 2024, opponent_name: 'Shawn Harris', opponent_party: 'democrat', vote_pct: 65.3, opponent_pct: 34.7, total_votes: 355000 },
  { slug: 'alexandria-ocasio-cortez', year: 2024, opponent_name: 'Tina Forte', opponent_party: 'republican', vote_pct: 68.8, opponent_pct: 25.8, total_votes: 288000 },
  { slug: 'mike-lawler', year: 2024, opponent_name: 'Mondaire Jones', opponent_party: 'democrat', vote_pct: 53.5, opponent_pct: 46.5, total_votes: 340000 },
  { slug: 'maxwell-frost', year: 2024, opponent_name: 'Thomas Chalifoux', opponent_party: 'republican', vote_pct: 57.7, opponent_pct: 42.3, total_votes: 350000 },
]

console.log(`Fixing ${FIXES.length} election results with real opponents...`)

let updated = 0
let notFound = 0

for (const fix of FIXES) {
  // Find the politician
  const { data: pol } = await supabase
    .from('politicians')
    .select('id')
    .eq('slug', fix.slug)
    .single()

  if (!pol) {
    console.log(`  ✗ ${fix.slug}: politician not found`)
    notFound++
    continue
  }

  // Try to update existing result for this year
  const updateData = {
    opponent_name: fix.opponent_name,
    opponent_party: fix.opponent_party,
    vote_percentage: fix.vote_pct,
    opponent_vote_percentage: fix.opponent_pct,
    total_votes: fix.total_votes,
  }

  if (fix.race_name) updateData.race_name = fix.race_name
  if (fix.notes) updateData.notes = fix.notes
  if (fix.result) updateData.result = fix.result

  const { data: existing } = await supabase
    .from('election_results')
    .select('id')
    .eq('politician_id', pol.id)
    .eq('election_year', fix.year)
    .limit(1)

  if (existing && existing.length > 0) {
    const { error } = await supabase
      .from('election_results')
      .update(updateData)
      .eq('id', existing[0].id)

    if (error) {
      console.log(`  ✗ ${fix.slug} ${fix.year}: ${error.message}`)
    } else {
      updated++
      console.log(`  ✓ ${fix.slug} ${fix.year}: vs ${fix.opponent_name}`)
    }
  } else {
    // Insert new result (e.g., Trump 2016, 2020)
    const { error } = await supabase.from('election_results').insert({
      politician_id: pol.id,
      election_year: fix.year,
      state: fix.slug === 'donald-trump' ? 'US' : (await supabase.from('politicians').select('state').eq('id', pol.id).single()).data.state,
      chamber: fix.slug === 'donald-trump' ? 'presidential' : (await supabase.from('politicians').select('chamber').eq('id', pol.id).single()).data.chamber,
      race_name: fix.race_name || `${fix.year} Race`,
      party: (await supabase.from('politicians').select('party').eq('id', pol.id).single()).data.party,
      result: fix.result || 'won',
      ...updateData,
      is_special_election: false,
      is_runoff: false,
    })

    if (error) {
      console.log(`  ✗ ${fix.slug} ${fix.year} (insert): ${error.message}`)
    } else {
      updated++
      console.log(`  ✓ ${fix.slug} ${fix.year}: vs ${fix.opponent_name} (new)`)
    }
  }
}

console.log(`\nUpdated/inserted ${updated} results, ${notFound} not found`)
