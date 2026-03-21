// Seed script for: Alaska, Wyoming, Vermont
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
  return name.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ─── ALASKA State Senate (20 members) ─────────────────
const akSenators = [
  { name: 'Gary Stevens', district: 'P', party: 'republican' },
  { name: 'Cathy Giessel', district: 'N', party: 'republican' },
  { name: 'Bert Stedman', district: 'R', party: 'republican' },
  { name: 'Click Bishop', district: 'C', party: 'republican' },
  { name: 'David Wilson', district: 'K', party: 'republican' },
  { name: 'James Kaufman', district: 'F', party: 'republican' },
  { name: 'Jesse Bjorkman', district: 'O', party: 'republican' },
  { name: 'Kelly Merrick', district: 'G', party: 'republican' },
  { name: 'Mike Shower', district: 'E', party: 'republican' },
  { name: 'Robert Myers', district: 'B', party: 'republican' },
  { name: 'Shelley Hughes', district: 'D', party: 'republican' },
  { name: 'Bill Wielechowski', district: 'H', party: 'democrat' },
  { name: 'Forrest Dunbar', district: 'J', party: 'democrat' },
  { name: 'Jesse Kiehl', district: 'Q', party: 'democrat' },
  { name: 'Loki Tobin', district: 'I', party: 'democrat' },
  { name: 'Matt Claman', district: 'L', party: 'democrat' },
  { name: 'Scott Kawasaki', district: 'A', party: 'democrat' },
  { name: 'Löki Gale Tobin', district: 'I', party: 'democrat' },
  { name: 'Donny Olson', district: 'T', party: 'democrat' },
]

// ─── ALASKA State House (40 members) ─────────────────
const akReps = [
  { name: 'Cathy Tilton', district: 12, party: 'republican' },
  { name: 'Ben Carpenter', district: 29, party: 'republican' },
  { name: 'Craig Johnson', district: 28, party: 'republican' },
  { name: 'David Eastman', district: 10, party: 'republican' },
  { name: 'George Rauscher', district: 9, party: 'republican' },
  { name: 'Jesse Sumner', district: 31, party: 'republican' },
  { name: 'Kevin McCabe', district: 8, party: 'republican' },
  { name: 'Laddie Shaw', district: 30, party: 'republican' },
  { name: 'Mike Cronk', district: 6, party: 'republican' },
  { name: 'Mike Prax', district: 3, party: 'republican' },
  { name: 'Sarah Vance', district: 31, party: 'republican' },
  { name: 'Alyse Galvin', district: 20, party: 'democrat' },
  { name: 'Andy Josephson', district: 17, party: 'democrat' },
  { name: 'Bryce Edgmon', district: 37, party: 'democrat' },
  { name: 'Calvin Schrage', district: 25, party: 'democrat' },
  { name: 'Cliff Groh', district: 15, party: 'democrat' },
  { name: 'Donna Mears', district: 18, party: 'democrat' },
  { name: 'Geran Tarr', district: 19, party: 'democrat' },
  { name: 'Jennie Armstrong', district: 16, party: 'democrat' },
  { name: 'Maxine Dibert', district: 5, party: 'democrat' },
  { name: 'Rebecca Himschoot', district: 34, party: 'democrat' },
  { name: 'Andi Story', district: 33, party: 'democrat' },
  { name: 'Ashley Carrick', district: 22, party: 'democrat' },
  { name: 'Zack Fields', district: 20, party: 'democrat' },
]

// ─── WYOMING State Senate (31 members) ─────────────────
const wySenators = [
  { name: 'Ogden Driskill', district: 1, party: 'republican' },
  { name: 'Larry Hicks', district: 11, party: 'republican' },
  { name: 'Bo Biteman', district: 21, party: 'republican' },
  { name: 'Brian Boner', district: 2, party: 'republican' },
  { name: 'Cheri Steinmetz', district: 3, party: 'republican' },
  { name: 'Chris Rothfuss', district: 9, party: 'democrat' },
  { name: 'Cale Case', district: 25, party: 'republican' },
  { name: 'Dan Dockstader', district: 16, party: 'republican' },
  { name: 'Dave Kinskey', district: 22, party: 'republican' },
  { name: 'Drew Perkins', district: 29, party: 'republican' },
  { name: 'Ed Cooper', district: 18, party: 'republican' },
  { name: 'Eric Barlow', district: 19, party: 'republican' },
  { name: 'Fred Baldwin', district: 30, party: 'republican' },
  { name: 'Jeff Wasserburger', district: 17, party: 'republican' },
  { name: 'Jim Anderson', district: 28, party: 'republican' },
  { name: 'John Kolb', district: 12, party: 'republican' },
  { name: 'Lynn Hutchings', district: 5, party: 'republican' },
  { name: 'Mike Gierau', district: 4, party: 'democrat' },
  { name: 'R.J. Kost', district: 15, party: 'republican' },
  { name: 'Stephan Pappas', district: 20, party: 'republican' },
  { name: 'Tim French', district: 6, party: 'republican' },
  { name: 'Tim Salazar', district: 27, party: 'republican' },
  { name: 'Troy McKeown', district: 24, party: 'republican' },
  { name: 'Wendy Schuler', district: 14, party: 'republican' },
]

// ─── WYOMING State House (62 members — leadership + notable) ─────────────────
const wyReps = [
  { name: 'Albert Sommers', district: 20, party: 'republican' },
  { name: 'Chip Neiman', district: 1, party: 'republican' },
  { name: 'Barry Crago', district: 40, party: 'republican' },
  { name: 'Bill Henderson', district: 41, party: 'republican' },
  { name: 'Bob Nicholas', district: 46, party: 'republican' },
  { name: 'Clark Stith', district: 48, party: 'republican' },
  { name: 'Ember Oakley', district: 27, party: 'republican' },
  { name: 'Hans Hunt', district: 2, party: 'republican' },
  { name: 'Jared Olsen', district: 11, party: 'republican' },
  { name: 'Jeremy Haroldson', district: 30, party: 'republican' },
  { name: 'John Bear', district: 31, party: 'republican' },
  { name: 'John Eklund', district: 10, party: 'republican' },
  { name: 'Landon Brown', district: 8, party: 'republican' },
  { name: 'Lloyd Larsen', district: 54, party: 'republican' },
  { name: 'Mark Jennings', district: 34, party: 'republican' },
  { name: 'Martha Lawley', district: 50, party: 'republican' },
  { name: 'Mike Yin', district: 16, party: 'democrat' },
  { name: 'Karlee Provenza', district: 45, party: 'democrat' },
  { name: 'Trey Sherwood', district: 43, party: 'democrat' },
  { name: 'Liz Storer', district: 42, party: 'democrat' },
  { name: 'Ken Pendergraft', district: 29, party: 'republican' },
  { name: 'Rachel Rodriguez-Williams', district: 52, party: 'republican' },
  { name: 'Scott Heiner', district: 56, party: 'republican' },
  { name: 'Tony Locke', district: 38, party: 'republican' },
]

// ─── VERMONT State Senate (30 members) ─────────────────
const vtSenators = [
  { name: 'Philip Baruth', district: 0, party: 'democrat' },
  { name: 'Virginia Lyons', district: 0, party: 'democrat' },
  { name: 'Becca Balint', district: 0, party: 'democrat' },
  { name: 'Alison Clarkson', district: 0, party: 'democrat' },
  { name: 'Ann Cummings', district: 0, party: 'democrat' },
  { name: 'Brian Campion', district: 0, party: 'democrat' },
  { name: 'Christopher Pearson', district: 0, party: 'democrat' },
  { name: 'Dick McCormack', district: 0, party: 'democrat' },
  { name: 'Kesha Ram Hinsdale', district: 0, party: 'democrat' },
  { name: 'Mark MacDonald', district: 0, party: 'democrat' },
  { name: 'Michael Sirotkin', district: 0, party: 'democrat' },
  { name: 'Martine Gulick', district: 0, party: 'democrat' },
  { name: 'Ruth Hardy', district: 0, party: 'democrat' },
  { name: 'Tanya Vyhovsky', district: 0, party: 'democrat' },
  { name: 'Thomas Chittenden', district: 0, party: 'democrat' },
  { name: 'Andrew Perchlik', district: 0, party: 'democrat' },
  { name: 'Irene Wrenner', district: 0, party: 'democrat' },
  { name: 'Wendy Harrison', district: 0, party: 'democrat' },
  { name: 'Nader Hashim', district: 0, party: 'democrat' },
  { name: 'Anne Watson', district: 0, party: 'democrat' },
  { name: 'Randy Brock', district: 0, party: 'republican' },
  { name: 'Russ Ingalls', district: 0, party: 'republican' },
  { name: 'Robert Norris', district: 0, party: 'republican' },
  { name: 'Robert Starr', district: 0, party: 'democrat' },
]

// ─── VERMONT State House (150 members — leadership + notable) ─────────────────
const vtReps = [
  { name: 'Jill Krowinski', district: 0, party: 'democrat' },
  { name: 'Emily Long', district: 0, party: 'democrat' },
  { name: 'Diane Lanpher', district: 0, party: 'democrat' },
  { name: 'Janet Ancel', district: 0, party: 'democrat' },
  { name: 'Mary Hooper', district: 0, party: 'democrat' },
  { name: 'Mike McCarthy', district: 0, party: 'democrat' },
  { name: 'Peter Anthony', district: 0, party: 'democrat' },
  { name: 'Sarah Copeland Hanzas', district: 0, party: 'democrat' },
  { name: 'Selene Colburn', district: 0, party: 'democrat' },
  { name: 'Tiff Bluemle', district: 0, party: 'democrat' },
  { name: 'Theresa Wood', district: 0, party: 'democrat' },
  { name: 'Taylor Small', district: 0, party: 'democrat' },
  { name: 'William Notte', district: 0, party: 'democrat' },
  { name: 'Martin LaLonde', district: 0, party: 'democrat' },
  { name: 'Amy Sheldon', district: 0, party: 'democrat' },
  { name: 'Barbara Rachelson', district: 0, party: 'democrat' },
  { name: 'Chip Troiano', district: 0, party: 'democrat' },
  { name: 'Brian Cina', district: 0, party: 'democrat' },
  { name: 'Kate Logan', district: 0, party: 'democrat' },
  { name: 'Tommy Walz', district: 0, party: 'democrat' },
  { name: 'Avram Patt', district: 0, party: 'democrat' },
  { name: 'Anne Donahue', district: 0, party: 'republican' },
  { name: 'Butch Shaw', district: 0, party: 'republican' },
  { name: 'Heidi Scheuermann', district: 0, party: 'republican' },
  { name: 'Lucy Rogers', district: 0, party: 'democrat' },
  { name: 'Marcia Martel', district: 0, party: 'republican' },
  { name: 'Mark Higley', district: 0, party: 'republican' },
  { name: 'Patrick Seymour', district: 0, party: 'republican' },
  { name: 'Samantha Lefebvre', district: 0, party: 'republican' },
  { name: 'Scott Beck', district: 0, party: 'republican' },
]

// ─── Build rows and upsert ───────────────────────────────────────────
function buildRows(members, state, chamber, titlePrefix) {
  return members.map(m => ({
    name: m.name,
    slug: slugify(m.name),
    state,
    chamber,
    party: m.party,
    title: m.district === 0 ? titlePrefix : `${titlePrefix}, District ${m.district}`,
    bio: `${m.name} is a ${m.party === 'democrat' ? 'Democratic' : m.party === 'republican' ? 'Republican' : 'Independent'} member of the ${state} state legislature.`,
    image_url: null,
  }))
}

async function upsertBatch(rows) {
  const seen = new Set()
  const unique = rows.filter(r => {
    if (seen.has(r.slug)) return false
    seen.add(r.slug)
    return true
  })
  for (let i = 0; i < unique.length; i += 50) {
    const batch = unique.slice(i, i + 50)
    const { error } = await supabase.from('politicians').upsert(batch, { onConflict: 'slug' })
    if (error) console.error(`  Error batch ${i}:`, error.message)
    else console.log(`  Upserted ${batch.length} rows (batch ${i / 50 + 1})`)
  }
}

async function main() {
  console.log('=== Seeding Alaska ===')
  await upsertBatch([
    ...buildRows(akSenators, 'AK', 'state_senate', 'AK State Senator'),
    ...buildRows(akReps, 'AK', 'state_house', 'AK State Representative'),
  ])

  console.log('=== Seeding Wyoming ===')
  await upsertBatch([
    ...buildRows(wySenators, 'WY', 'state_senate', 'WY State Senator'),
    ...buildRows(wyReps, 'WY', 'state_house', 'WY State Representative'),
  ])

  console.log('=== Seeding Vermont ===')
  await upsertBatch([
    ...buildRows(vtSenators, 'VT', 'state_senate', 'VT State Senator'),
    ...buildRows(vtReps, 'VT', 'state_house', 'VT State Representative'),
  ])

  console.log('Done!')
}

main().catch(console.error)
