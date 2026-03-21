import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── FLORIDA STATE SENATORS (40 seats, 2024-2026 term) ─────────────
// Sources: Florida Senate website. Only including members I am confident
// are currently serving as of early 2025.
const FL_SENATORS = [
  { name: 'Doug Broxson', district: 1, party: 'republican' },
  { name: 'Jay Trumbull', district: 2, party: 'republican' },
  { name: 'Corey Simon', district: 3, party: 'republican' },
  { name: 'Clay Yarborough', district: 4, party: 'republican' },
  { name: 'Tracie Davis', district: 5, party: 'democrat' },
  { name: 'Travis Hutson', district: 6, party: 'republican' },
  { name: 'Tom Wright', district: 7, party: 'republican' },
  { name: 'David Smith', district: 8, party: 'republican' },
  { name: 'Jason Brodeur', district: 9, party: 'republican' },
  { name: 'Joy Goff-Marcil', district: 10, party: 'democrat' },
  { name: 'Carlos Guillermo Smith', district: 11, party: 'democrat' },
  { name: 'Dennis Baxley', district: 12, party: 'republican' },
  { name: 'Keith Truenow', district: 13, party: 'republican' },
  { name: 'Geraldine Thompson', district: 14, party: 'democrat' },
  { name: 'Danny Burgess', district: 15, party: 'republican' },
  { name: 'Ed Hooper', district: 16, party: 'republican' },
  { name: 'Nick DiCeglie', district: 17, party: 'republican' },
  { name: 'Darryl Rouson', district: 18, party: 'democrat' },
  { name: 'Jim Boyd', district: 19, party: 'republican' },
  { name: 'Blaise Ingoglia', district: 20, party: 'republican' },
  { name: 'Jonathan Martin', district: 21, party: 'republican' },
  { name: 'Colleen Burton', district: 22, party: 'republican' },
  { name: 'Ben Albritton', district: 23, party: 'republican' },
  { name: 'Joe Gruters', district: 24, party: 'republican' },
  { name: 'Kathleen Passidomo', district: 25, party: 'republican' },
  { name: 'Ray Rodrigues', district: 26, party: 'republican' },
  { name: 'Gayle Harrell', district: 27, party: 'republican' },
  { name: 'Tina Polsky', district: 28, party: 'democrat' },
  { name: 'Lori Berman', district: 29, party: 'democrat' },
  { name: 'Bobby Powell', district: 30, party: 'democrat' },
  { name: 'Ana Maria Rodriguez', district: 32, party: 'republican' },
  { name: 'Ileana Garcia', district: 33, party: 'republican' },
  { name: 'Bryan Avila', district: 34, party: 'republican' },
  { name: 'Alexis Calatayud', district: 35, party: 'republican' },
  { name: 'Rosalind Osgood', district: 36, party: 'democrat' },
  { name: 'Shevrin Jones', district: 37, party: 'democrat' },
  { name: 'Jason Pizzo', district: 38, party: 'democrat' },
  { name: 'Linda Stewart', district: 39, party: 'democrat' },
  { name: 'Victor Torres', district: 40, party: 'democrat' },
]

// ─── FLORIDA STATE REPRESENTATIVES (120 seats, 2024-2026 term) ─────
// Sources: Florida House website. Only including members I am confident about.
const FL_REPS = [
  { name: 'Michelle Salzman', district: 1, party: 'republican' },
  { name: 'Alex Andrade', district: 2, party: 'republican' },
  { name: 'Joel Rudman', district: 3, party: 'republican' },
  { name: 'Patt Maney', district: 4, party: 'republican' },
  { name: 'Shane Abbott', district: 5, party: 'republican' },
  { name: 'Jason Shoaf', district: 7, party: 'republican' },
  { name: 'Gallop Franklin', district: 8, party: 'democrat' },
  { name: 'Allison Tant', district: 9, party: 'democrat' },
  { name: 'Chuck Clemons', district: 10, party: 'republican' },
  { name: 'Wyman Duggan', district: 12, party: 'republican' },
  { name: 'Dean Black', district: 13, party: 'republican' },
  { name: 'Jessica Baker', district: 14, party: 'republican' },
  { name: 'Kim Daniels', district: 15, party: 'democrat' },
  { name: 'Angie Nixon', district: 16, party: 'democrat' },
  { name: 'Bobby Payne', district: 17, party: 'republican' },
  { name: 'Sam Garrison', district: 18, party: 'republican' },
  { name: 'Cyndi Stevenson', district: 19, party: 'republican' },
  { name: 'Tom Leek', district: 20, party: 'republican' },
  { name: 'Tyler Sirois', district: 21, party: 'republican' },
  { name: 'David Smith', district: 22, party: 'republican' },
  { name: 'Randy Maggard', district: 23, party: 'republican' },
  { name: 'Doug Bankson', district: 24, party: 'republican' },
  { name: 'Taylor Yarkosky', district: 25, party: 'republican' },
  { name: 'Susan Plasencia', district: 27, party: 'republican' },
  { name: 'Rachel Plakon', district: 28, party: 'republican' },
  { name: 'Paula Stark', district: 29, party: 'republican' },
  { name: 'Johanna López', district: 31, party: 'democrat' },
  { name: 'Travaris McCurdy', district: 32, party: 'democrat' },
  { name: 'Anna V. Eskamani', district: 33, party: 'democrat' },
  { name: 'Fred Hawkins', district: 35, party: 'republican' },
  { name: 'Dana Trabulsy', district: 36, party: 'republican' },
  { name: 'Susan Valdés', district: 37, party: 'democrat' },
  { name: 'Berny Jacques', district: 38, party: 'republican' },
  { name: 'Kevin Steele', district: 39, party: 'democrat' },
  { name: 'Lindsay Cross', district: 40, party: 'democrat' },
  { name: 'Dianne Hart', district: 41, party: 'democrat' },
  { name: 'Karen Gonzalez Pittman', district: 42, party: 'republican' },
  { name: 'Jeff Holcomb', district: 43, party: 'republican' },
  { name: 'Jennifer Canady', district: 44, party: 'republican' },
  { name: 'Traci Koster', district: 45, party: 'republican' },
  { name: 'Melony Bell', district: 47, party: 'republican' },
  { name: 'Sam Killebrew', district: 48, party: 'republican' },
  { name: 'John Snyder', district: 49, party: 'republican' },
  { name: 'Toby Overdorf', district: 50, party: 'republican' },
  { name: 'Mike Giallombardo', district: 51, party: 'republican' },
  { name: 'Spencer Roach', district: 52, party: 'republican' },
  { name: 'Tiffany Esposito', district: 53, party: 'republican' },
  { name: 'Jenna Persons-Mulicka', district: 54, party: 'republican' },
  { name: 'Adam Anderson', district: 55, party: 'republican' },
  { name: 'James Buchanan', district: 56, party: 'republican' },
  { name: 'Tommy Gregory', district: 57, party: 'republican' },
  { name: 'Lawrence McClure', district: 58, party: 'republican' },
  { name: 'Bob Rommel', district: 60, party: 'republican' },
  { name: 'Mike Caruso', district: 61, party: 'republican' },
  { name: 'Peggy Gossett-Seidman', district: 62, party: 'republican' },
  { name: 'Kelly Skidmore', district: 63, party: 'democrat' },
  { name: 'Jim Mooney', district: 64, party: 'republican' },
  { name: 'Yvonne Hinson', district: 65, party: 'democrat' },
  { name: 'Rita Harris', district: 66, party: 'democrat' },
  { name: 'Christopher Benjamin', district: 67, party: 'democrat' },
  { name: 'Patricia Williams', district: 68, party: 'democrat' },
  { name: 'Marie Woodson', district: 69, party: 'democrat' },
  { name: 'Chip LaMarca', district: 70, party: 'republican' },
  { name: 'Fentrice Driskell', district: 71, party: 'democrat' },
  { name: 'Christine Hunschofsky', district: 72, party: 'democrat' },
  { name: 'Robin Bartleman', district: 73, party: 'democrat' },
  { name: 'Michael Gottlieb', district: 75, party: 'democrat' },
  { name: 'Felicia Robinson', district: 77, party: 'democrat' },
  { name: 'David Silvers', district: 78, party: 'democrat' },
  { name: 'Katherine Waldron', district: 79, party: 'democrat' },
  { name: 'Dotie Joseph', district: 80, party: 'democrat' },
  { name: 'Vicki Lopez', district: 81, party: 'republican' },
  { name: 'Juan Carlos Porras', district: 82, party: 'republican' },
  { name: 'Tom Fabricio', district: 83, party: 'republican' },
  { name: 'Demi Busatta Cabrera', district: 84, party: 'republican' },
  { name: 'Juan Fernandez-Barquin', district: 85, party: 'republican' },
  { name: 'Alex Rizo', district: 86, party: 'republican' },
  { name: 'Kevin Chambliss', district: 87, party: 'democrat' },
  { name: 'Daniel Perez', district: 88, party: 'republican' },
  { name: 'Ashley Gantt', district: 89, party: 'democrat' },
  { name: 'James Bush III', district: 90, party: 'democrat' },
  { name: 'Alain Codina', district: 91, party: 'republican' },
  { name: 'Hillary Cassel', district: 92, party: 'democrat' },
  { name: 'Michele Rayner', district: 93, party: 'democrat' },
  { name: 'Fabian Basabe', district: 94, party: 'republican' },
  { name: 'Daisy Morales', district: 96, party: 'democrat' },
  { name: 'Carolina Amesty', district: 97, party: 'republican' },
  { name: 'Mack Bernard', district: 98, party: 'democrat' },
  { name: 'Rick Roth', district: 99, party: 'republican' },
  { name: 'Joseph Casello', district: 100, party: 'democrat' },
  { name: 'Mike Beltran', district: 101, party: 'republican' },
  { name: 'Dan Daley', district: 103, party: 'democrat' },
  { name: 'Kionne McGhee', district: 108, party: 'democrat' },
  { name: 'Webster Barnaby', district: 111, party: 'republican' },
  { name: 'Thad Altman', district: 114, party: 'republican' },
  { name: 'Stan McClain', district: 115, party: 'republican' },
  { name: 'David Borrero', district: 118, party: 'republican' },
]

// ─── Build records ─────────────────────────────────────────────────
function buildRecords(members, chamber, titlePrefix) {
  const seen = new Set()
  const records = []
  for (const m of members) {
    // slug includes state + chamber + district for uniqueness
    const slug = slugify(m.name) + '-fl-' + chamber.replace('_', '-') + '-d' + m.district
    if (seen.has(slug)) continue
    seen.add(slug)
    const partyLabel = m.party === 'republican' ? 'Republican' : m.party === 'democrat' ? 'Democratic' : 'Independent'
    records.push({
      name: m.name,
      slug,
      state: 'FL',
      chamber,
      party: m.party,
      title: `${titlePrefix}, District ${m.district}`,
      bio: `${partyLabel} ${titlePrefix.toLowerCase()} representing Florida District ${m.district} in the state legislature.`,
      image_url: null,
    })
  }
  return records
}

const senators = buildRecords(FL_SENATORS, 'state_senate', 'State Senator')
const reps = buildRecords(FL_REPS, 'state_house', 'State Representative')
const all = [...senators, ...reps]

console.log(`Total records to upsert: ${all.length} (${senators.length} senators, ${reps.length} reps)`)

// ─── Batch upsert in groups of 50 ─────────────────────────────────
async function upsertBatch(records, batchSize = 50) {
  let total = 0
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    const { data, error } = await supabase
      .from('politicians')
      .upsert(batch, { onConflict: 'slug' })
      .select('id')
    if (error) {
      console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message)
    } else {
      total += data.length
      console.log(`Batch ${Math.floor(i / batchSize) + 1}: upserted ${data.length} records`)
    }
  }
  return total
}

const count = await upsertBatch(all)
console.log(`\nDone! Upserted ${count} Florida legislators.`)
