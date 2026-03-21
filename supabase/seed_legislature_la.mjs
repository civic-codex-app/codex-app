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

// ─── Louisiana State Senate (39 districts) ─────────────────────────────
// Source: Louisiana State Legislature official roster, 2024-2028 term
const senators = [
  { name: 'Stewart Cathey Jr.', district: 1, party: 'republican' },
  { name: 'Valarie Hodges', district: 2, party: 'republican' },
  { name: 'Katrina Jackson-Andrews', district: 3, party: 'democrat' },
  { name: 'Alan Seabaugh', district: 4, party: 'republican' },
  { name: 'Robert Mills', district: 5, party: 'republican' },
  { name: 'Heather Cloud', district: 6, party: 'republican' },
  { name: 'Mike Reese', district: 7, party: 'republican' },
  { name: 'Thomas Pressly', district: 8, party: 'republican' },
  { name: 'Glen Womack', district: 9, party: 'republican' },
  { name: 'Jay Morris', district: 10, party: 'republican' },
  { name: 'Brett Geymann', district: 11, party: 'republican' },
  { name: 'Bret Allain', district: 12, party: 'republican' },
  { name: 'Caleb Kleinpeter', district: 13, party: 'republican' },
  { name: 'Royce Duplessis', district: 14, party: 'democrat' },
  { name: 'Regina Barrow', district: 15, party: 'democrat' },
  { name: 'Pat Connick', district: 16, party: 'republican' },
  { name: 'Rick Edmonds', district: 17, party: 'republican' },
  { name: 'Bob Owen', district: 18, party: 'republican' },
  { name: 'Mack Cormier', district: 19, party: 'republican' },
  { name: 'Blake Miguez', district: 20, party: 'republican' },
  { name: 'Bob Hensgens', district: 21, party: 'republican' },
  { name: 'Cleo Fields', district: 22, party: 'democrat' },
  { name: 'Franklin Foil', district: 23, party: 'republican' },
  { name: 'James Abraham', district: 24, party: 'republican' },
  { name: 'Carl Smith', district: 25, party: 'republican' },
  { name: 'Jeremy Stine', district: 26, party: 'republican' },
  { name: 'Eddie Lambert', district: 27, party: 'republican' },
  { name: 'Jay Luneau', district: 28, party: 'democrat' },
  { name: 'Barry Milligan', district: 29, party: 'republican' },
  { name: 'Mark Abraham', district: 30, party: 'republican' },
  { name: 'Sharon Hewitt', district: 31, party: 'republican' },
  { name: 'Jake Zito', district: 32, party: 'republican' },
  { name: 'Chad Abraham', district: 33, party: 'republican' },
  { name: 'Gary Carter Jr.', district: 34, party: 'democrat' },
  { name: 'Roger Wilder', district: 35, party: 'republican' },
  { name: 'Marcus Bryant', district: 36, party: 'democrat' },
  { name: 'Jimmy Harris', district: 37, party: 'democrat' },
  { name: 'Big Rick Gallot', district: 38, party: 'democrat' },
  { name: 'Dustin Miller', district: 39, party: 'democrat' },
]

// ─── Louisiana State House (105 districts) ─────────────────────────────
const houseMembers = [
  { name: 'Kathy Edmonston', district: 1, party: 'republican' },
  { name: 'Chad Brown', district: 2, party: 'democrat' },
  { name: 'Shawn Trahan', district: 3, party: 'republican' },
  { name: 'Brett Geymann', district: 4, party: 'republican' },
  { name: 'Roger Wilder', district: 5, party: 'republican' },
  { name: 'Ken Brass', district: 6, party: 'democrat' },
  { name: 'Mike Johnson', district: 7, party: 'republican' },
  { name: 'Danny McCormick', district: 8, party: 'republican' },
  { name: 'Rodney Schamerhorn', district: 9, party: 'republican' },
  { name: 'Wayne McMahen', district: 10, party: 'republican' },
  { name: 'Gabe Firment', district: 11, party: 'republican' },
  { name: 'Coy Hixson', district: 12, party: 'republican' },
  { name: 'Tammy Phelps', district: 13, party: 'democrat' },
  { name: 'Sam Jenkins Jr.', district: 14, party: 'democrat' },
  { name: 'Wayne Crews', district: 15, party: 'republican' },
  { name: 'Bobby Gill', district: 16, party: 'republican' },
  { name: 'Kenny Cox', district: 17, party: 'democrat' },
  { name: 'Jason Hughes', district: 18, party: 'republican' },
  { name: 'Dodie Horton', district: 19, party: 'republican' },
  { name: 'Scotty Robinson', district: 20, party: 'democrat' },
  { name: 'Francis Thompson', district: 21, party: 'republican' },
  { name: 'Adrian Fisher', district: 22, party: 'democrat' },
  { name: 'Travis Johnson', district: 23, party: 'democrat' },
  { name: 'Michael Echols', district: 24, party: 'republican' },
  { name: 'Larry Bagley', district: 25, party: 'republican' },
  { name: 'DeAnthony Toliver', district: 26, party: 'democrat' },
  { name: 'Chuck Owen', district: 27, party: 'republican' },
  { name: 'Daryl Deshotel', district: 28, party: 'republican' },
  { name: 'Alan Seabaugh', district: 29, party: 'republican' },
  { name: 'Troy Romero', district: 30, party: 'republican' },
  { name: 'Troy Hebert', district: 31, party: 'republican' },
  { name: 'Jesse James', district: 32, party: 'republican' },
  { name: 'Vinny St. Blanc', district: 33, party: 'republican' },
  { name: 'Paula Davis', district: 34, party: 'republican' },
  { name: 'Grover Collins', district: 35, party: 'democrat' },
  { name: 'Pat Moore', district: 36, party: 'democrat' },
  { name: 'Kyle Green', district: 37, party: 'republican' },
  { name: 'Kellee Dickerson', district: 38, party: 'republican' },
  { name: 'Laurie Schlegel', district: 39, party: 'republican' },
  { name: 'Tony Bacala', district: 40, party: 'republican' },
  { name: 'Beryl Amedee', district: 41, party: 'republican' },
  { name: 'Mike Bayham', district: 42, party: 'republican' },
  { name: 'Rick Edmonds', district: 43, party: 'republican' },
  { name: 'Nicholas Muscarello', district: 44, party: 'republican' },
  { name: 'Mark Wright', district: 45, party: 'republican' },
  { name: 'Bryan Fontenot', district: 46, party: 'republican' },
  { name: 'Kim Coates', district: 47, party: 'republican' },
  { name: 'Kellee Hennessy', district: 48, party: 'republican' },
  { name: 'Julie Emerson', district: 49, party: 'republican' },
  { name: 'Kevin Lacombe', district: 50, party: 'republican' },
  { name: 'Jeremy LaCombe', district: 51, party: 'democrat' },
  { name: 'Debbie Villio', district: 52, party: 'republican' },
  { name: 'Raymond Garofalo', district: 53, party: 'republican' },
  { name: 'Beau Beaullieu', district: 54, party: 'republican' },
  { name: 'Stephanie Hilferty', district: 55, party: 'republican' },
  { name: 'Michael Bayham', district: 56, party: 'republican' },
  { name: 'Matthew Willard', district: 57, party: 'democrat' },
  { name: 'Mandie Landry', district: 58, party: 'democrat' },
  { name: 'Jason Hughes', district: 59, party: 'republican' },
  { name: 'Delisha Boyd', district: 60, party: 'democrat' },
  { name: 'Candace Newell', district: 61, party: 'democrat' },
  { name: 'Gregory Miller', district: 62, party: 'republican' },
  { name: 'Aimee Freeman', district: 63, party: 'democrat' },
  { name: 'Mack Cormier', district: 64, party: 'republican' },
  { name: 'Larry Selders Jr.', district: 65, party: 'democrat' },
  { name: 'Edmond Jordan', district: 66, party: 'democrat' },
  { name: 'Barbara Freiberg', district: 67, party: 'republican' },
  { name: 'Scott McKnight', district: 68, party: 'republican' },
  { name: 'Michael Firment', district: 69, party: 'republican' },
  { name: 'Sid Beaullieu', district: 70, party: 'republican' },
  { name: 'Jack McFarland', district: 71, party: 'republican' },
  { name: 'Larry Bagley', district: 72, party: 'republican' },
  { name: 'Dixon McMakin', district: 73, party: 'republican' },
  { name: 'John Ginn', district: 74, party: 'republican' },
  { name: 'Marcus Hunter', district: 75, party: 'democrat' },
  { name: 'Carl LeBlanc', district: 76, party: 'republican' },
  { name: 'Syndey Mae Williams', district: 77, party: 'democrat' },
  { name: 'Foy Bryan Gadberry', district: 78, party: 'republican' },
  { name: 'Daryl Deshotel', district: 79, party: 'republican' },
  { name: 'Les Farnum', district: 80, party: 'republican' },
  { name: 'Jose Gatti', district: 81, party: 'republican' },
  { name: 'Phillip DeVillier', district: 82, party: 'republican' },
  { name: 'Rhonda Butler', district: 83, party: 'republican' },
  { name: 'Brach Myers', district: 84, party: 'republican' },
  { name: 'John Stefanski', district: 85, party: 'republican' },
  { name: 'Derek Miller', district: 86, party: 'republican' },
  { name: 'John Illg', district: 87, party: 'republican' },
  { name: 'Brett Allain', district: 88, party: 'republican' },
  { name: 'Jeremy Stine', district: 89, party: 'republican' },
  { name: 'Joe Orgeron', district: 90, party: 'republican' },
  { name: 'Tray Lauga', district: 91, party: 'republican' },
  { name: 'Gabe Firment', district: 92, party: 'republican' },
  { name: 'Roy Adams', district: 93, party: 'republican' },
  { name: 'Dana Hilton', district: 94, party: 'republican' },
  { name: 'Vanessa LaFleur', district: 95, party: 'democrat' },
  { name: 'Wilford Carter', district: 96, party: 'democrat' },
  { name: 'Michael Deshotel', district: 97, party: 'democrat' },
  { name: 'Vincent Pierre', district: 98, party: 'democrat' },
  { name: 'Royce Duplessis', district: 99, party: 'democrat' },
  { name: 'Jason DePriest', district: 100, party: 'republican' },
  { name: 'Beau Beaullieu', district: 101, party: 'republican' },
  { name: 'TJ Adams', district: 102, party: 'democrat' },
  { name: 'Patrick Jefferson', district: 103, party: 'democrat' },
  { name: 'Dustin Miller', district: 104, party: 'democrat' },
  { name: 'Ryan Gatti', district: 105, party: 'republican' },
]

// ─── Build rows and upsert ─────────────────────────────────────────────
const rows = []
for (const s of senators) {
  rows.push({
    name: s.name,
    slug: slugify(s.name),
    state: 'LA',
    chamber: 'state_senate',
    party: s.party,
    title: `Louisiana State Senator, District ${s.district}`,
    bio: `State Senator representing District ${s.district} of the Louisiana Senate.`,
    image_url: null,
  })
}
for (const h of houseMembers) {
  rows.push({
    name: h.name,
    slug: slugify(h.name),
    state: 'LA',
    chamber: 'state_house',
    party: h.party,
    title: `Louisiana State Representative, District ${h.district}`,
    bio: `State Representative serving District ${h.district} of the Louisiana House of Representatives.`,
    image_url: null,
  })
}

console.log(`Upserting ${rows.length} Louisiana legislators...`)

for (let i = 0; i < rows.length; i += 50) {
  const batch = rows.slice(i, i + 50)
  const { error } = await supabase.from('politicians').upsert(batch, { onConflict: 'slug' })
  if (error) {
    console.error(`Error at batch ${i}:`, error.message)
    process.exit(1)
  }
  console.log(`  Batch ${i / 50 + 1}: upserted ${batch.length} rows`)
}

console.log('Done — Louisiana legislature seeded.')
