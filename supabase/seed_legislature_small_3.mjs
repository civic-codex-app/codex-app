// Seed script for: New Hampshire, Rhode Island, Delaware, South Dakota, North Dakota
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

// ─── NEW HAMPSHIRE State Senate (24 members) ─────────────────
const nhSenators = [
  { name: 'Jeb Bradley', district: 3, party: 'republican' },
  { name: 'Sharon Carson', district: 14, party: 'republican' },
  { name: 'Bob Giuda', district: 2, party: 'republican' },
  { name: 'Bill Gannon', district: 23, party: 'republican' },
  { name: 'Harold French', district: 7, party: 'republican' },
  { name: 'Howard Pearl', district: 17, party: 'republican' },
  { name: 'James Gray', district: 6, party: 'republican' },
  { name: 'Kevin Avard', district: 12, party: 'republican' },
  { name: 'Denise Ricciardi', district: 9, party: 'republican' },
  { name: 'Regina Birdsell', district: 19, party: 'republican' },
  { name: 'Tim Lang', district: 16, party: 'republican' },
  { name: 'Lou D\'Allesandro', district: 20, party: 'democrat' },
  { name: 'Becky Whitley', district: 15, party: 'democrat' },
  { name: 'Cindy Rosenwald', district: 13, party: 'democrat' },
  { name: 'Debra Altschiller', district: 24, party: 'democrat' },
  { name: 'Donna Soucy', district: 18, party: 'democrat' },
  { name: 'Jay Kahn', district: 10, party: 'democrat' },
  { name: 'Rebecca Perkins Kwoka', district: 21, party: 'democrat' },
  { name: 'Shannon Chandley', district: 11, party: 'democrat' },
  { name: 'Sue Prentiss', district: 5, party: 'democrat' },
  { name: 'Tom Sherman', district: 24, party: 'democrat' },
  { name: 'David Watters', district: 4, party: 'democrat' },
]

// ─── NEW HAMPSHIRE State House (400 members — leadership + notable, largest US state house)
const nhReps = [
  // Speaker and leadership
  { name: 'Sherman Packard', district: 1, party: 'republican' },
  { name: 'Jason Osborne', district: 1, party: 'republican' },
  { name: 'Ross Berry', district: 1, party: 'republican' },
  { name: 'Michael Vose', district: 1, party: 'republican' },
  { name: 'Al Baldasaro', district: 5, party: 'republican' },
  { name: 'Keith Ammon', district: 1, party: 'republican' },
  { name: 'Bob Lynn', district: 1, party: 'republican' },
  { name: 'Carol McGuire', district: 1, party: 'republican' },
  { name: 'Dan McGuire', district: 1, party: 'republican' },
  { name: 'David Bickford', district: 3, party: 'republican' },
  { name: 'Fred Doucette', district: 1, party: 'republican' },
  { name: 'Glenn Cordelli', district: 4, party: 'republican' },
  { name: 'James Spillane', district: 1, party: 'republican' },
  { name: 'Jess Edwards', district: 1, party: 'republican' },
  { name: 'Joe Alexander', district: 2, party: 'republican' },
  { name: 'Josh Yokela', district: 1, party: 'republican' },
  { name: 'Kim Rice', district: 1, party: 'republican' },
  { name: 'Lino Avellani', district: 1, party: 'republican' },
  { name: 'Mark Alliegro', district: 1, party: 'republican' },
  { name: 'Mark McLean', district: 1, party: 'republican' },
  { name: 'Michael Harrington', district: 1, party: 'republican' },
  { name: 'Mike Belcher', district: 2, party: 'republican' },
  { name: 'Peter Torosian', district: 1, party: 'republican' },
  { name: 'Rick Ladd', district: 1, party: 'republican' },
  { name: 'Terry Roy', district: 1, party: 'republican' },
  { name: 'Tim Egan', district: 1, party: 'republican' },
  { name: 'Tom Lanzara', district: 1, party: 'republican' },
  { name: 'Bonnie Ham', district: 1, party: 'republican' },
  { name: 'Aidan Ankarberg', district: 1, party: 'republican' },
  { name: 'Alicia Lekas', district: 1, party: 'republican' },
  // Democratic leadership + notable
  { name: 'David Cote', district: 1, party: 'democrat' },
  { name: 'Marjorie Smith', district: 1, party: 'democrat' },
  { name: 'Mary Jane Wallner', district: 1, party: 'democrat' },
  { name: 'Robert Renny Cushing', district: 1, party: 'democrat' },
  { name: 'Timothy Horrigan', district: 1, party: 'democrat' },
  { name: 'Katherine Rogers', district: 1, party: 'democrat' },
  { name: 'Peter Somssich', district: 1, party: 'democrat' },
  { name: 'Sherry Dutzy', district: 1, party: 'democrat' },
  { name: 'Susan Almy', district: 1, party: 'democrat' },
  { name: 'Wendy Thomas', district: 1, party: 'democrat' },
  { name: 'Gerri Cannon', district: 1, party: 'democrat' },
  { name: 'Linda Tanner', district: 1, party: 'democrat' },
  { name: 'Matt Wilhelm', district: 1, party: 'democrat' },
  { name: 'Mel Myler', district: 1, party: 'democrat' },
  { name: 'Ellen Read', district: 1, party: 'democrat' },
  { name: 'Charlotte DiLorenzo', district: 1, party: 'democrat' },
  { name: 'Lucy Weber', district: 1, party: 'democrat' },
  { name: 'Diane Pauer', district: 1, party: 'democrat' },
  { name: 'Casey Conley', district: 1, party: 'democrat' },
  { name: 'Safiya Wazir', district: 1, party: 'democrat' },
]

// ─── RHODE ISLAND State Senate (38 members) ─────────────────
const riSenators = [
  { name: 'Dominick Ruggerio', district: 4, party: 'democrat' },
  { name: 'Michael McCaffrey', district: 29, party: 'democrat' },
  { name: 'Maryellen Goodwin', district: 1, party: 'democrat' },
  { name: 'Frank Lombardi', district: 26, party: 'democrat' },
  { name: 'Hanna Gallo', district: 27, party: 'democrat' },
  { name: 'Joshua Miller', district: 28, party: 'democrat' },
  { name: 'Leonidas Raptakis', district: 33, party: 'democrat' },
  { name: 'Melissa Murray', district: 24, party: 'democrat' },
  { name: 'Roger Picard', district: 20, party: 'democrat' },
  { name: 'Samuel Zurier', district: 3, party: 'democrat' },
  { name: 'Sandra Cano', district: 8, party: 'democrat' },
  { name: 'Tiara Mack', district: 6, party: 'democrat' },
  { name: 'Valarie Lawson', district: 14, party: 'democrat' },
  { name: 'Victoria Gu', district: 38, party: 'democrat' },
  { name: 'Alana DiMario', district: 36, party: 'democrat' },
  { name: 'Ana Quezada', district: 2, party: 'democrat' },
  { name: 'Bridget Valverde', district: 35, party: 'democrat' },
  { name: 'Cynthia Coyne', district: 32, party: 'democrat' },
  { name: 'Dawn Euer', district: 13, party: 'democrat' },
  { name: 'Jonathon Acosta', district: 16, party: 'democrat' },
  { name: 'Linda Ujifusa', district: 11, party: 'democrat' },
  { name: 'Louis DiPalma', district: 12, party: 'democrat' },
  { name: 'Mark McKenney', district: 30, party: 'democrat' },
  { name: 'Matthew LaMountain', district: 25, party: 'democrat' },
  { name: 'Meghan Kallman', district: 15, party: 'democrat' },
  { name: 'Thomas Paolino', district: 17, party: 'republican' },
  { name: 'Gordon Rogers', district: 21, party: 'republican' },
  { name: 'Elaine Morgan', district: 34, party: 'republican' },
  { name: 'Jessica de la Cruz', district: 23, party: 'republican' },
]

// ─── RHODE ISLAND State House (75 members — leadership + notable) ─────
const riReps = [
  { name: 'K. Joseph Shekarchi', district: 23, party: 'democrat' },
  { name: 'Christopher Blazejewski', district: 2, party: 'democrat' },
  { name: 'Anastasia Williams', district: 9, party: 'democrat' },
  { name: 'Arthur Handy', district: 18, party: 'democrat' },
  { name: 'Brian Kennedy', district: 38, party: 'democrat' },
  { name: 'David Bennett', district: 20, party: 'democrat' },
  { name: 'Dennis Canario', district: 71, party: 'democrat' },
  { name: 'Edith Ajello', district: 1, party: 'democrat' },
  { name: 'Gregg Amore', district: 65, party: 'democrat' },
  { name: 'Jason Knight', district: 67, party: 'democrat' },
  { name: 'Joseph Solomon', district: 22, party: 'democrat' },
  { name: 'Karen Alzate', district: 60, party: 'democrat' },
  { name: 'Mia Ackerman', district: 45, party: 'democrat' },
  { name: 'Michelle McGaw', district: 70, party: 'democrat' },
  { name: 'Patricia Morgan', district: 26, party: 'republican' },
  { name: 'Michael Chippendale', district: 40, party: 'republican' },
  { name: 'Brian Newberry', district: 48, party: 'republican' },
  { name: 'David Place', district: 47, party: 'republican' },
  { name: 'Julie Casimiro', district: 31, party: 'independent' },
]

// ─── DELAWARE State Senate (21 members) ─────────────────
const deSenators = [
  { name: 'David Sokola', district: 8, party: 'democrat' },
  { name: 'Nicole Poore', district: 12, party: 'democrat' },
  { name: 'Bryan Townsend', district: 11, party: 'democrat' },
  { name: 'Elizabeth Lockman', district: 3, party: 'democrat' },
  { name: 'Jack Walsh', district: 9, party: 'democrat' },
  { name: 'Kyle Evans Gay', district: 5, party: 'democrat' },
  { name: 'Laura Sturgeon', district: 4, party: 'democrat' },
  { name: 'Marie Pinkney', district: 13, party: 'democrat' },
  { name: 'Sarah McBride', district: 1, party: 'democrat' },
  { name: 'Spiros Mantzavinos', district: 14, party: 'democrat' },
  { name: 'Trey Paradee', district: 17, party: 'democrat' },
  { name: 'Darius Brown', district: 2, party: 'democrat' },
  { name: 'S. Elizabeth Lockman', district: 3, party: 'democrat' },
  { name: 'Eric Buckson', district: 16, party: 'republican' },
  { name: 'Brian Pettyjohn', district: 19, party: 'republican' },
  { name: 'Colin Bonini', district: 16, party: 'republican' },
  { name: 'Dave Lawson', district: 15, party: 'republican' },
  { name: 'Gerald Hocker', district: 20, party: 'republican' },
  { name: 'Dave Wilson', district: 18, party: 'republican' },
]

// ─── DELAWARE State House (41 members) ─────────────────
const deReps = [
  { name: 'Valerie Longhurst', district: 15, party: 'democrat' },
  { name: 'Pete Schwartzkopf', district: 14, party: 'democrat' },
  { name: 'Stephanie Bolden', district: 2, party: 'democrat' },
  { name: 'Paul Baumbach', district: 23, party: 'democrat' },
  { name: 'John Kowalko', district: 25, party: 'democrat' },
  { name: 'Kendra Johnson', district: 5, party: 'democrat' },
  { name: 'Kim Williams', district: 19, party: 'democrat' },
  { name: 'Krista Griffith', district: 12, party: 'democrat' },
  { name: 'Larry Mitchell', district: 13, party: 'democrat' },
  { name: 'Madinah Wilson-Anton', district: 26, party: 'democrat' },
  { name: 'Mike Smith', district: 4, party: 'democrat' },
  { name: 'Nnamdi Chukwuocha', district: 1, party: 'democrat' },
  { name: 'Sherae Lott', district: 3, party: 'democrat' },
  { name: 'Eric Morrison', district: 27, party: 'democrat' },
  { name: 'Kevin Hensley', district: 9, party: 'republican' },
  { name: 'Mike Ramone', district: 21, party: 'republican' },
  { name: 'Rich Collins', district: 41, party: 'republican' },
  { name: 'Shannon Morris', district: 36, party: 'republican' },
  { name: 'Tim Dukes', district: 40, party: 'republican' },
  { name: 'Jeff Hilovsky', district: 38, party: 'republican' },
  { name: 'Bryan Shupe', district: 36, party: 'republican' },
]

// ─── SOUTH DAKOTA State Senate (35 members) ─────────────────
const sdSenators = [
  { name: 'Lee Schoenbeck', district: 5, party: 'republican' },
  { name: 'Casey Crabtree', district: 8, party: 'republican' },
  { name: 'Al Novstrup', district: 3, party: 'republican' },
  { name: 'Arch Beal', district: 12, party: 'republican' },
  { name: 'David Wheeler', district: 22, party: 'republican' },
  { name: 'Erin Tobin', district: 21, party: 'republican' },
  { name: 'Gary Cammack', district: 29, party: 'republican' },
  { name: 'Herman Otten', district: 6, party: 'republican' },
  { name: 'Jack Kolbeck', district: 13, party: 'republican' },
  { name: 'Jean Hunhoff', district: 18, party: 'republican' },
  { name: 'Jim Bolin', district: 16, party: 'republican' },
  { name: 'Jim Mehlhaff', district: 24, party: 'republican' },
  { name: 'Julie Frye-Mueller', district: 30, party: 'republican' },
  { name: 'Larry Zikmund', district: 14, party: 'republican' },
  { name: 'Mary Duvall', district: 24, party: 'republican' },
  { name: 'Michael Rohl', district: 1, party: 'republican' },
  { name: 'Randy Deibert', district: 26, party: 'republican' },
  { name: 'Tim Reed', district: 7, party: 'republican' },
  { name: 'Tom Pischke', district: 25, party: 'republican' },
  { name: 'Troy Heinert', district: 26, party: 'democrat' },
  { name: 'Reynold Nesiba', district: 15, party: 'democrat' },
  { name: 'Red Dawn Foster', district: 27, party: 'democrat' },
  { name: 'Shawn Bordeaux', district: 26, party: 'democrat' },
]

// ─── SOUTH DAKOTA State House (70 members — leadership + notable) ─────
const sdReps = [
  { name: 'Hugh Bartels', district: 5, party: 'republican' },
  { name: 'Jon Hansen', district: 25, party: 'republican' },
  { name: 'Spencer Gosch', district: 23, party: 'republican' },
  { name: 'Chris Karr', district: 11, party: 'republican' },
  { name: 'Fred Deutsch', district: 4, party: 'republican' },
  { name: 'Kent Peterson', district: 19, party: 'republican' },
  { name: 'Mike Derby', district: 3, party: 'republican' },
  { name: 'Sue Peterson', district: 13, party: 'republican' },
  { name: 'Taylor Rehfeldt', district: 14, party: 'republican' },
  { name: 'Will Mortenson', district: 24, party: 'republican' },
  { name: 'Linda Duba', district: 15, party: 'democrat' },
  { name: 'Oren Lesmeister', district: 28, party: 'democrat' },
  { name: 'Peri Pourier', district: 27, party: 'democrat' },
  { name: 'Kadyn Wittman', district: 15, party: 'democrat' },
]

// ─── NORTH DAKOTA State Senate (47 members) ─────────────────
const ndSenators = [
  { name: 'David Hogue', district: 38, party: 'republican' },
  { name: 'Jerry Klein', district: 14, party: 'republican' },
  { name: 'Ray Holmberg', district: 17, party: 'republican' },
  { name: 'Brad Bekkedahl', district: 1, party: 'republican' },
  { name: 'Dale Patten', district: 39, party: 'republican' },
  { name: 'Dave Clemens', district: 16, party: 'republican' },
  { name: 'Dick Dever', district: 32, party: 'republican' },
  { name: 'Donald Schaible', district: 31, party: 'republican' },
  { name: 'Doug Larsen', district: 34, party: 'republican' },
  { name: 'Jay Elkin', district: 10, party: 'republican' },
  { name: 'Jeff Magrum', district: 8, party: 'republican' },
  { name: 'Janne Myrdal', district: 10, party: 'republican' },
  { name: 'Kent Weston', district: 9, party: 'republican' },
  { name: 'Larry Luick', district: 25, party: 'republican' },
  { name: 'Mark Weber', district: 22, party: 'republican' },
  { name: 'Nicole Poolman', district: 7, party: 'republican' },
  { name: 'Rich Wardner', district: 37, party: 'republican' },
  { name: 'Scott Meyer', district: 18, party: 'republican' },
  { name: 'Terry Wanzek', district: 29, party: 'republican' },
  { name: 'Tim Mathern', district: 11, party: 'democrat' },
  { name: 'Tracy Potter', district: 35, party: 'democrat' },
  { name: 'Kathy Hogan', district: 21, party: 'democrat' },
  { name: 'JoNell Bakke', district: 43, party: 'democrat' },
  { name: 'Erin Oban', district: 35, party: 'democrat' },
  { name: 'Merrill Piepkorn', district: 44, party: 'democrat' },
]

// ─── NORTH DAKOTA State House (94 members — leadership + notable) ─────
const ndReps = [
  { name: 'Mike Lefor', district: 37, party: 'republican' },
  { name: 'Dennis Johnson', district: 15, party: 'republican' },
  { name: 'Kim Koppelman', district: 13, party: 'republican' },
  { name: 'Lawrence Klemin', district: 47, party: 'republican' },
  { name: 'Dan Ruby', district: 38, party: 'republican' },
  { name: 'Jeff Hoverson', district: 3, party: 'republican' },
  { name: 'Rick Becker', district: 7, party: 'republican' },
  { name: 'Scott Louser', district: 5, party: 'republican' },
  { name: 'Shannon Roers Jones', district: 46, party: 'republican' },
  { name: 'Steve Vetter', district: 18, party: 'republican' },
  { name: 'Thomas Beadle', district: 27, party: 'republican' },
  { name: 'Karla Rose Hanson', district: 44, party: 'democrat' },
  { name: 'Corey Mock', district: 18, party: 'democrat' },
  { name: 'Joshua Boschee', district: 44, party: 'democrat' },
  { name: 'Gretchen Dobervich', district: 11, party: 'democrat' },
  { name: 'Mary Schneider', district: 21, party: 'democrat' },
]

// ─── Build rows and upsert ───────────────────────────────────────────
function buildRows(members, state, chamber, titlePrefix) {
  return members.map(m => ({
    name: m.name,
    slug: slugify(m.name),
    state,
    chamber,
    party: m.party,
    title: `${titlePrefix}, District ${m.district}`,
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
  console.log('=== Seeding New Hampshire ===')
  await upsertBatch([
    ...buildRows(nhSenators, 'NH', 'state_senate', 'NH State Senator'),
    ...buildRows(nhReps, 'NH', 'state_house', 'NH State Representative'),
  ])

  console.log('=== Seeding Rhode Island ===')
  await upsertBatch([
    ...buildRows(riSenators, 'RI', 'state_senate', 'RI State Senator'),
    ...buildRows(riReps, 'RI', 'state_house', 'RI State Representative'),
  ])

  console.log('=== Seeding Delaware ===')
  await upsertBatch([
    ...buildRows(deSenators, 'DE', 'state_senate', 'DE State Senator'),
    ...buildRows(deReps, 'DE', 'state_house', 'DE State Representative'),
  ])

  console.log('=== Seeding South Dakota ===')
  await upsertBatch([
    ...buildRows(sdSenators, 'SD', 'state_senate', 'SD State Senator'),
    ...buildRows(sdReps, 'SD', 'state_house', 'SD State Representative'),
  ])

  console.log('=== Seeding North Dakota ===')
  await upsertBatch([
    ...buildRows(ndSenators, 'ND', 'state_senate', 'ND State Senator'),
    ...buildRows(ndReps, 'ND', 'state_house', 'ND State Representative'),
  ])

  console.log('Done!')
}

main().catch(console.error)
