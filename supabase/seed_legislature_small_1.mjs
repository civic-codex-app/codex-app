// Seed script for: Nevada, New Mexico, Utah, Nebraska, West Virginia
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

// ─── NEVADA State Senate (21 members) ─────────────────
const nvSenators = [
  { name: 'Chris Brooks', district: 3, party: 'democrat' },
  { name: 'Nicole Cannizzaro', district: 6, party: 'democrat' },
  { name: 'Dallas Harris', district: 11, party: 'democrat' },
  { name: 'Dina Neal', district: 4, party: 'democrat' },
  { name: 'Fabian Doñate', district: 10, party: 'democrat' },
  { name: 'James Ohrenschall', district: 12, party: 'democrat' },
  { name: 'Marilyn Dondero Loop', district: 8, party: 'democrat' },
  { name: 'Pat Spearman', district: 1, party: 'democrat' },
  { name: 'Roberta Lange', district: 7, party: 'democrat' },
  { name: 'Edgar Flores', district: 2, party: 'democrat' },
  { name: 'Julie Pazina', district: 13, party: 'democrat' },
  { name: 'Rochelle Nguyen', district: 5, party: 'democrat' },
  { name: 'Jeff Stone', district: 20, party: 'republican' },
  { name: 'Ira Hansen', district: 14, party: 'republican' },
  { name: 'Keith Pickard', district: 20, party: 'republican' },
  { name: 'Carrie Buck', district: 5, party: 'republican' },
  { name: 'Scott Hammond', district: 18, party: 'republican' },
  { name: 'Pete Goicoechea', district: 19, party: 'republican' },
  { name: 'Lisa Krasner', district: 16, party: 'republican' },
  { name: 'Robin Titus', district: 17, party: 'republican' },
  { name: 'Heidi Ganahl', district: 9, party: 'republican' },
]

// ─── NEVADA State Assembly (42 members) ─────────────────
const nvReps = [
  { name: 'Steve Yeager', district: 9, party: 'democrat' },
  { name: 'Sandra Jauregui', district: 41, party: 'democrat' },
  { name: 'Jason Frierson', district: 8, party: 'democrat' },
  { name: 'Brittney Miller', district: 5, party: 'democrat' },
  { name: 'Cecelia González', district: 16, party: 'democrat' },
  { name: 'Dina Neal', district: 7, party: 'democrat' },
  { name: 'Elaine Marzola', district: 21, party: 'democrat' },
  { name: 'Howard Watts', district: 15, party: 'democrat' },
  { name: 'Lesley Cohen', district: 29, party: 'democrat' },
  { name: 'Michelle Gorelow', district: 35, party: 'democrat' },
  { name: 'Natha Anderson', district: 30, party: 'democrat' },
  { name: 'Rochelle Nguyen', district: 10, party: 'democrat' },
  { name: 'Selena Torres', district: 3, party: 'democrat' },
  { name: 'Shea Backus', district: 37, party: 'democrat' },
  { name: 'Tracy Brown-May', district: 42, party: 'democrat' },
  { name: 'Venicia Considine', district: 17, party: 'democrat' },
  { name: 'Danielle Gallant', district: 25, party: 'republican' },
  { name: 'Gregory Hafen', district: 36, party: 'republican' },
  { name: 'Heidi Kasama', district: 2, party: 'republican' },
  { name: 'Jill Dickman', district: 31, party: 'republican' },
  { name: 'Ken Gray', district: 39, party: 'republican' },
  { name: 'Melissa Hardy', district: 22, party: 'republican' },
  { name: 'PK O\'Neill', district: 40, party: 'republican' },
  { name: 'Richard McArthur', district: 4, party: 'republican' },
  { name: 'Toby Yurek', district: 26, party: 'republican' },
]

// ─── NEW MEXICO State Senate (42 members) ─────────────────
const nmSenators = [
  { name: 'Mimi Stewart', district: 17, party: 'democrat' },
  { name: 'Peter Wirth', district: 25, party: 'democrat' },
  { name: 'Michael Padilla', district: 14, party: 'democrat' },
  { name: 'Gerald Ortiz y Pino', district: 12, party: 'democrat' },
  { name: 'Linda Lopez', district: 11, party: 'democrat' },
  { name: 'Bill Tallman', district: 18, party: 'democrat' },
  { name: 'Jeff Steinborn', district: 36, party: 'democrat' },
  { name: 'Joseph Cervantes', district: 31, party: 'democrat' },
  { name: 'Katy Duhigg', district: 10, party: 'democrat' },
  { name: 'Leo Jaramillo', district: 6, party: 'democrat' },
  { name: 'Liz Stefanics', district: 39, party: 'democrat' },
  { name: 'Martin Hickey', district: 21, party: 'democrat' },
  { name: 'Nancy Rodriguez', district: 24, party: 'democrat' },
  { name: 'Brenda McKenna', district: 9, party: 'democrat' },
  { name: 'Antoinette Sedillo Lopez', district: 16, party: 'democrat' },
  { name: 'Carrie Hamblen', district: 38, party: 'democrat' },
  { name: 'Harold Pope Jr.', district: 23, party: 'democrat' },
  { name: 'Shannon Pinto', district: 3, party: 'democrat' },
  { name: 'Benny Shendo Jr.', district: 22, party: 'democrat' },
  { name: 'Roberto Gonzales', district: 19, party: 'democrat' },
  { name: 'Crystal Diamond', district: 35, party: 'republican' },
  { name: 'Craig Brandt', district: 40, party: 'republican' },
  { name: 'David Gallegos', district: 41, party: 'republican' },
  { name: 'Greg Baca', district: 29, party: 'republican' },
  { name: 'Joshua Sanchez', district: 30, party: 'republican' },
  { name: 'Mark Moores', district: 21, party: 'republican' },
  { name: 'Pat Woods', district: 7, party: 'republican' },
  { name: 'Steven Neville', district: 2, party: 'republican' },
  { name: 'William Burt', district: 33, party: 'republican' },
  { name: 'William Sharer', district: 1, party: 'republican' },
  { name: 'Cliff Pirtle', district: 32, party: 'republican' },
  { name: 'Gay Kernan', district: 42, party: 'republican' },
]

// ─── NEW MEXICO State House (70 members) ─────────────────
const nmReps = [
  { name: 'Javier Martínez', district: 11, party: 'democrat' },
  { name: 'Gail Chasey', district: 18, party: 'democrat' },
  { name: 'Joy Garratt', district: 29, party: 'democrat' },
  { name: 'Marian Matthews', district: 27, party: 'democrat' },
  { name: 'Natalie Figueroa', district: 30, party: 'democrat' },
  { name: 'Patricia Roybal Caballero', district: 13, party: 'democrat' },
  { name: 'Reena Szczepanski', district: 47, party: 'democrat' },
  { name: 'Tara Lujan', district: 48, party: 'democrat' },
  { name: 'Andrea Romero', district: 46, party: 'democrat' },
  { name: 'Christine Chandler', district: 43, party: 'democrat' },
  { name: 'Derrick Lente', district: 65, party: 'democrat' },
  { name: 'Dayan Hochman-Vigil', district: 15, party: 'democrat' },
  { name: 'Eleanor Chavez', district: 14, party: 'democrat' },
  { name: 'Kristina Ortez', district: 42, party: 'democrat' },
  { name: 'Linda Serrato', district: 45, party: 'democrat' },
  { name: 'Liz Thomson', district: 24, party: 'democrat' },
  { name: 'Matthew McQueen', district: 50, party: 'democrat' },
  { name: 'Miguel Garcia', district: 14, party: 'democrat' },
  { name: 'Ambrose Castellano', district: 70, party: 'democrat' },
  { name: 'Raymundo Lara', district: 34, party: 'democrat' },
  { name: 'Doreen Gallegos', district: 32, party: 'democrat' },
  { name: 'Willie Madrid', district: 53, party: 'democrat' },
  { name: 'Nathan Small', district: 36, party: 'democrat' },
  { name: 'Kathleen Cates', district: 40, party: 'democrat' },
  { name: 'Rod Montoya', district: 1, party: 'republican' },
  { name: 'James Townsend', district: 54, party: 'republican' },
  { name: 'Cathrynn Brown', district: 55, party: 'republican' },
  { name: 'Greg Nibert', district: 59, party: 'republican' },
  { name: 'Larry Scott', district: 62, party: 'republican' },
  { name: 'Luis Terrazas', district: 64, party: 'republican' },
  { name: 'Stefani Lord', district: 22, party: 'republican' },
  { name: 'Alan Martinez', district: 69, party: 'republican' },
  { name: 'John Block', district: 51, party: 'republican' },
  { name: 'Randall Pettigrew', district: 61, party: 'republican' },
  { name: 'Joshua Hernandez', district: 60, party: 'republican' },
]

// ─── UTAH State Senate (29 members) ─────────────────
const utSenators = [
  { name: 'Stuart Adams', district: 22, party: 'republican' },
  { name: 'Todd Weiler', district: 23, party: 'republican' },
  { name: 'Curt Bramble', district: 16, party: 'republican' },
  { name: 'Wayne Harper', district: 6, party: 'republican' },
  { name: 'Dan McCay', district: 11, party: 'republican' },
  { name: 'Kirk Cullimore', district: 9, party: 'republican' },
  { name: 'Mike Kennedy', district: 14, party: 'republican' },
  { name: 'Keith Grover', district: 15, party: 'republican' },
  { name: 'Lincoln Fillmore', district: 10, party: 'republican' },
  { name: 'Evan Vickers', district: 28, party: 'republican' },
  { name: 'David Hinkins', district: 27, party: 'republican' },
  { name: 'Scott Sandall', district: 17, party: 'republican' },
  { name: 'Mike McKell', district: 8, party: 'republican' },
  { name: 'Chris Wilson', district: 25, party: 'republican' },
  { name: 'Derrin Owens', district: 29, party: 'republican' },
  { name: 'Don Ipson', district: 29, party: 'republican' },
  { name: 'Ann Millner', district: 18, party: 'republican' },
  { name: 'John Johnson', district: 3, party: 'republican' },
  { name: 'Ron Winterton', district: 26, party: 'republican' },
  { name: 'Daniel Thatcher', district: 12, party: 'republican' },
  { name: 'Jen Plumb', district: 7, party: 'democrat' },
  { name: 'Kathleen Riebe', district: 4, party: 'democrat' },
  { name: 'Luz Escamilla', district: 1, party: 'democrat' },
  { name: 'Nate Blouin', district: 5, party: 'democrat' },
  { name: 'Stephanie Pitcher', district: 2, party: 'democrat' },
]

// ─── UTAH State House (75 members — leadership + notable) ─────────────────
const utReps = [
  { name: 'Mike Schultz', district: 12, party: 'republican' },
  { name: 'Jefferson Moss', district: 2, party: 'republican' },
  { name: 'Mike Petersen', district: 14, party: 'republican' },
  { name: 'Candice Pierucci', district: 52, party: 'republican' },
  { name: 'Karianne Lisonbee', district: 14, party: 'republican' },
  { name: 'Brady Brammer', district: 27, party: 'republican' },
  { name: 'Cheryl Acton', district: 38, party: 'republican' },
  { name: 'Casey Snider', district: 5, party: 'republican' },
  { name: 'Joel Ferry', district: 1, party: 'republican' },
  { name: 'Jordan Teuscher', district: 42, party: 'republican' },
  { name: 'Ken Ivory', district: 47, party: 'republican' },
  { name: 'Rex Shipp', district: 72, party: 'republican' },
  { name: 'Steve Waldrip', district: 8, party: 'republican' },
  { name: 'Trevor Lee', district: 25, party: 'republican' },
  { name: 'Tyler Clancy', district: 39, party: 'republican' },
  { name: 'Brian King', district: 28, party: 'democrat' },
  { name: 'Angela Romero', district: 26, party: 'democrat' },
  { name: 'Sandra Hollins', district: 23, party: 'democrat' },
  { name: 'Carol Spackman Moss', district: 37, party: 'democrat' },
  { name: 'Joel Briscoe', district: 25, party: 'democrat' },
  { name: 'Rosemary Lesser', district: 24, party: 'democrat' },
]

// ─── NEBRASKA Unicameral Legislature (49 senators) ─────────────────
const neSenators = [
  { name: 'Tom Brewer', district: 43, party: 'republican' },
  { name: 'Robert Clements', district: 2, party: 'republican' },
  { name: 'Joni Albrecht', district: 17, party: 'republican' },
  { name: 'Bruce Bostelman', district: 23, party: 'republican' },
  { name: 'Tom Briese', district: 41, party: 'republican' },
  { name: 'Robert Dover', district: 19, party: 'republican' },
  { name: 'Steve Erdman', district: 47, party: 'republican' },
  { name: 'Steve Halloran', district: 33, party: 'republican' },
  { name: 'Mike Jacobson', district: 42, party: 'republican' },
  { name: 'Lou Ann Linehan', district: 39, party: 'republican' },
  { name: 'Kathleen Kauth', district: 31, party: 'republican' },
  { name: 'Dave Murman', district: 38, party: 'republican' },
  { name: 'Brad von Gillern', district: 4, party: 'republican' },
  { name: 'Rita Sanders', district: 45, party: 'republican' },
  { name: 'Julie Slama', district: 1, party: 'republican' },
  { name: 'Barry DeKay', district: 40, party: 'republican' },
  { name: 'Jana Hughes', district: 24, party: 'republican' },
  { name: 'Myron Dorn', district: 30, party: 'republican' },
  { name: 'Loren Lippincott', district: 34, party: 'republican' },
  { name: 'Brian Hardin', district: 48, party: 'republican' },
  { name: 'Rick Holdcroft', district: 36, party: 'republican' },
  { name: 'Ben Hansen', district: 16, party: 'republican' },
  { name: 'R. Brad von Gillern', district: 4, party: 'republican' },
  { name: 'Beau Ballard', district: 21, party: 'republican' },
  { name: 'Teresa Ibach', district: 44, party: 'republican' },
  { name: 'Eliot Bostar', district: 29, party: 'democrat' },
  { name: 'Machaela Cavanaugh', district: 6, party: 'democrat' },
  { name: 'John Cavanaugh', district: 9, party: 'democrat' },
  { name: 'Jen Day', district: 49, party: 'democrat' },
  { name: 'Wendy DeBoer', district: 10, party: 'democrat' },
  { name: 'Danielle Conrad', district: 46, party: 'democrat' },
  { name: 'George Dungan', district: 26, party: 'democrat' },
  { name: 'Terrell McKinney', district: 11, party: 'democrat' },
  { name: 'John Fredrickson', district: 20, party: 'democrat' },
  { name: 'Tony Vargas', district: 7, party: 'democrat' },
  { name: 'Justin Wayne', district: 13, party: 'democrat' },
  { name: 'Anna Wishart', district: 27, party: 'democrat' },
  { name: 'Mike McDonnell', district: 5, party: 'democrat' },
]

// ─── WEST VIRGINIA State Senate (34 members) ─────────────────
const wvSenators = [
  { name: 'Craig Blair', district: 15, party: 'republican' },
  { name: 'Tom Takubo', district: 17, party: 'republican' },
  { name: 'Ryan Weld', district: 1, party: 'republican' },
  { name: 'Charles Trump', district: 15, party: 'republican' },
  { name: 'Dave Stover', district: 9, party: 'republican' },
  { name: 'Eric Tarr', district: 4, party: 'republican' },
  { name: 'Jack Woodrum', district: 10, party: 'republican' },
  { name: 'Jay Taylor', district: 7, party: 'republican' },
  { name: 'Mark Maynard', district: 6, party: 'republican' },
  { name: 'Mike Maroney', district: 2, party: 'republican' },
  { name: 'Mike Oliverio', district: 13, party: 'republican' },
  { name: 'Rollan Roberts', district: 9, party: 'republican' },
  { name: 'Rupie Phillips', district: 7, party: 'republican' },
  { name: 'Vince Deeds', district: 8, party: 'republican' },
  { name: 'Amy Grady', district: 4, party: 'republican' },
  { name: 'Bill Hamilton', district: 11, party: 'republican' },
  { name: 'Mike Azinger', district: 3, party: 'republican' },
  { name: 'Randy Smith', district: 14, party: 'republican' },
  { name: 'Robert Karnes', district: 11, party: 'republican' },
  { name: 'Buck Smith', district: 16, party: 'republican' },
  { name: 'Glenn Jeffries', district: 8, party: 'democrat' },
  { name: 'Mike Woelfel', district: 5, party: 'democrat' },
  { name: 'Richard Lindsay', district: 13, party: 'democrat' },
  { name: 'Robert Plymale', district: 5, party: 'democrat' },
  { name: 'William Ihlenfeld', district: 1, party: 'democrat' },
]

// ─── WEST VIRGINIA House of Delegates (100 members — leadership + notable) ─────
const wvReps = [
  { name: 'Roger Hanshaw', district: 33, party: 'republican' },
  { name: 'Amy Summers', district: 49, party: 'republican' },
  { name: 'Moore Capito', district: 35, party: 'republican' },
  { name: 'Brandon Steele', district: 29, party: 'republican' },
  { name: 'Chris Phillips', district: 19, party: 'republican' },
  { name: 'Daniel Linville', district: 40, party: 'republican' },
  { name: 'Geoff Foster', district: 15, party: 'republican' },
  { name: 'Joe Ellington', district: 27, party: 'republican' },
  { name: 'John Hardy', district: 47, party: 'republican' },
  { name: 'Kayla Young', district: 35, party: 'democrat' },
  { name: 'Mike Pushkin', district: 37, party: 'democrat' },
  { name: 'Evan Hansen', district: 51, party: 'democrat' },
  { name: 'Shawn Fluharty', district: 1, party: 'democrat' },
  { name: 'Lisa Zukoff', district: 3, party: 'democrat' },
  { name: 'Doug Skaff', district: 26, party: 'democrat' },
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
  // dedupe by slug
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
  console.log('=== Seeding Nevada ===')
  await upsertBatch([
    ...buildRows(nvSenators, 'NV', 'state_senate', 'NV State Senator'),
    ...buildRows(nvReps, 'NV', 'state_house', 'NV State Assembly Member'),
  ])

  console.log('=== Seeding New Mexico ===')
  await upsertBatch([
    ...buildRows(nmSenators, 'NM', 'state_senate', 'NM State Senator'),
    ...buildRows(nmReps, 'NM', 'state_house', 'NM State Representative'),
  ])

  console.log('=== Seeding Utah ===')
  await upsertBatch([
    ...buildRows(utSenators, 'UT', 'state_senate', 'UT State Senator'),
    ...buildRows(utReps, 'UT', 'state_house', 'UT State Representative'),
  ])

  console.log('=== Seeding Nebraska (Unicameral) ===')
  await upsertBatch(buildRows(neSenators, 'NE', 'state_senate', 'NE State Senator'))

  console.log('=== Seeding West Virginia ===')
  await upsertBatch([
    ...buildRows(wvSenators, 'WV', 'state_senate', 'WV State Senator'),
    ...buildRows(wvReps, 'WV', 'state_house', 'WV State Delegate'),
  ])

  console.log('Done!')
}

main().catch(console.error)
