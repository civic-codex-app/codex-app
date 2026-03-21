// Seed script for: Hawaii, Idaho, Montana, Maine
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

// ─── HAWAII State Senate (25 members) ─────────────────
const hiSenators = [
  { name: 'Ronald Kouchi', district: 8, party: 'democrat' },
  { name: 'Jarrett Keohokalole', district: 24, party: 'democrat' },
  { name: 'Donna Mercado Kim', district: 14, party: 'democrat' },
  { name: 'Sharon Moriwaki', district: 12, party: 'democrat' },
  { name: 'Karl Rhoads', district: 13, party: 'democrat' },
  { name: 'Maile Shimabukuro', district: 21, party: 'democrat' },
  { name: 'Brian Taniguchi', district: 10, party: 'democrat' },
  { name: 'Les Ihara', district: 9, party: 'democrat' },
  { name: 'Gilbert Keith-Agaran', district: 5, party: 'democrat' },
  { name: 'Joy San Buenaventura', district: 2, party: 'democrat' },
  { name: 'Lorraine Inouye', district: 1, party: 'democrat' },
  { name: 'Dru Kanuha', district: 3, party: 'democrat' },
  { name: 'Donovan Dela Cruz', district: 17, party: 'democrat' },
  { name: 'Brandon Elefante', district: 16, party: 'democrat' },
  { name: 'Michelle Kidani', district: 18, party: 'democrat' },
  { name: 'Lynn DeCoite', district: 7, party: 'democrat' },
  { name: 'Carol Fukunaga', district: 11, party: 'democrat' },
  { name: 'Henry Aquino', district: 19, party: 'democrat' },
  { name: 'Stanley Chang', district: 9, party: 'democrat' },
  { name: 'Chris Lee', district: 25, party: 'democrat' },
  { name: 'Mike Gabbard', district: 20, party: 'republican' },
  { name: 'Brenton Awa', district: 22, party: 'republican' },
]

// ─── HAWAII State House (51 members) ─────────────────
const hiReps = [
  { name: 'Scott Saiki', district: 26, party: 'democrat' },
  { name: 'Nadine Nakamura', district: 14, party: 'democrat' },
  { name: 'Troy Hashimoto', district: 8, party: 'democrat' },
  { name: 'Linda Ichiyama', district: 32, party: 'democrat' },
  { name: 'Della Au Belatti', district: 24, party: 'democrat' },
  { name: 'Mark Nakashima', district: 1, party: 'democrat' },
  { name: 'Nicole Lowen', district: 7, party: 'democrat' },
  { name: 'Dee Morikawa', district: 16, party: 'democrat' },
  { name: 'David Tarnas', district: 7, party: 'democrat' },
  { name: 'Gregg Takayama', district: 34, party: 'democrat' },
  { name: 'Aaron Johanson', district: 31, party: 'democrat' },
  { name: 'Andrew Takuya Garrett', district: 21, party: 'democrat' },
  { name: 'Bertrand Kobayashi', district: 19, party: 'democrat' },
  { name: 'Daniel Holt', district: 28, party: 'democrat' },
  { name: 'Jackson Sayama', district: 20, party: 'democrat' },
  { name: 'Jenna Takenouchi', district: 37, party: 'democrat' },
  { name: 'John Mizuno', district: 30, party: 'democrat' },
  { name: 'Justine Tate', district: 36, party: 'democrat' },
  { name: 'Kim Coco Iwamoto', district: 33, party: 'democrat' },
  { name: 'Lisa Marten', district: 46, party: 'democrat' },
  { name: 'Matthew Lopresti', district: 41, party: 'democrat' },
  { name: 'Micah Aiu', district: 25, party: 'democrat' },
  { name: 'Patrick Pihana Branco', district: 50, party: 'democrat' },
  { name: 'Sean Quinlan', district: 47, party: 'democrat' },
  { name: 'Trish La Chica', district: 40, party: 'democrat' },
  { name: 'Gene Ward', district: 17, party: 'republican' },
  { name: 'Diamond Garcia', district: 42, party: 'republican' },
  { name: 'Elijah Pierick', district: 44, party: 'republican' },
  { name: 'David Alcos', district: 41, party: 'republican' },
]

// ─── IDAHO State Senate (35 members) ─────────────────
const idSenators = [
  { name: 'Chuck Winder', district: 20, party: 'republican' },
  { name: 'Kelly Anthon', district: 27, party: 'republican' },
  { name: 'Abby Lee', district: 9, party: 'republican' },
  { name: 'Ben Adams', district: 34, party: 'republican' },
  { name: 'Brian Lenney', district: 13, party: 'republican' },
  { name: 'C. Scott Grow', district: 14, party: 'republican' },
  { name: 'Carl Crabtree', district: 7, party: 'republican' },
  { name: 'Chris Trakel', district: 35, party: 'republican' },
  { name: 'Cindy Carlson', district: 31, party: 'republican' },
  { name: 'Dan Foreman', district: 6, party: 'republican' },
  { name: 'Dave Lent', district: 33, party: 'republican' },
  { name: 'Doug Ricks', district: 34, party: 'republican' },
  { name: 'Fred Martin', district: 15, party: 'republican' },
  { name: 'Geoff Schroeder', district: 17, party: 'republican' },
  { name: 'Jim Guthrie', district: 28, party: 'republican' },
  { name: 'Jim Rice', district: 10, party: 'republican' },
  { name: 'Jeff Agenbroad', district: 12, party: 'republican' },
  { name: 'Julie VanOrden', district: 31, party: 'republican' },
  { name: 'Lori Den Hartog', district: 22, party: 'republican' },
  { name: 'Mark Harris', district: 32, party: 'republican' },
  { name: 'Melissa Wintrow', district: 19, party: 'democrat' },
  { name: 'Ali Rabe', district: 18, party: 'democrat' },
  { name: 'David Nelson', district: 16, party: 'democrat' },
  { name: 'Grant Burgoyne', district: 16, party: 'democrat' },
  { name: 'Janie Ward-Engelking', district: 18, party: 'democrat' },
  { name: 'Rick Just', district: 15, party: 'democrat' },
]

// ─── IDAHO State House (70 members — leadership + notable) ─────────────────
const idReps = [
  { name: 'Mike Moyle', district: 10, party: 'republican' },
  { name: 'Jason Monks', district: 22, party: 'republican' },
  { name: 'Brent Crane', district: 13, party: 'republican' },
  { name: 'Bruce Skaug', district: 12, party: 'republican' },
  { name: 'Dustin Manwaring', district: 29, party: 'republican' },
  { name: 'Greg Chaney', district: 10, party: 'republican' },
  { name: 'Heather Scott', district: 1, party: 'republican' },
  { name: 'Joe Palmer', district: 20, party: 'republican' },
  { name: 'John Vander Woude', district: 22, party: 'republican' },
  { name: 'Josh Tanner', district: 35, party: 'republican' },
  { name: 'Julianne Young', district: 31, party: 'republican' },
  { name: 'Lance Clow', district: 24, party: 'republican' },
  { name: 'Megan Blanksma', district: 23, party: 'republican' },
  { name: 'Sage Dixon', district: 1, party: 'republican' },
  { name: 'Todd Jones', district: 17, party: 'republican' },
  { name: 'Brooke Green', district: 18, party: 'democrat' },
  { name: 'Chris Mathias', district: 19, party: 'democrat' },
  { name: 'Colin Nash', district: 16, party: 'democrat' },
  { name: 'Ilana Rubel', district: 18, party: 'democrat' },
  { name: 'John Gannon', district: 17, party: 'democrat' },
  { name: 'Lauren Necochea', district: 19, party: 'democrat' },
  { name: 'Steve Berch', district: 15, party: 'democrat' },
  { name: 'Sonia Galaviz', district: 17, party: 'democrat' },
]

// ─── MONTANA State Senate (50 members) ─────────────────
const mtSenators = [
  { name: 'Jason Ellsworth', district: 33, party: 'republican' },
  { name: 'Steve Fitzpatrick', district: 10, party: 'republican' },
  { name: 'Greg Hertz', district: 6, party: 'republican' },
  { name: 'Bob Keenan', district: 5, party: 'republican' },
  { name: 'Cary Smith', district: 27, party: 'republican' },
  { name: 'Chris Friedel', district: 23, party: 'republican' },
  { name: 'Daniel Emrich', district: 11, party: 'republican' },
  { name: 'Duane Ankney', district: 20, party: 'republican' },
  { name: 'Forrest Mandeville', district: 18, party: 'republican' },
  { name: 'Jeremy Trebas', district: 38, party: 'republican' },
  { name: 'Keith Regier', district: 3, party: 'republican' },
  { name: 'Ken Bogner', district: 14, party: 'republican' },
  { name: 'Mike Lang', district: 17, party: 'republican' },
  { name: 'Russ Tempel', district: 15, party: 'republican' },
  { name: 'Scott Sales', district: 35, party: 'republican' },
  { name: 'Shelley Vance', district: 34, party: 'republican' },
  { name: 'Steve Hinebauch', district: 19, party: 'republican' },
  { name: 'Terry Gauthier', district: 40, party: 'republican' },
  { name: 'Tom McGillvray', district: 12, party: 'republican' },
  { name: 'Brad Molnar', district: 28, party: 'republican' },
  { name: 'Carl Glimm', district: 2, party: 'republican' },
  { name: 'Dennis Lenz', district: 43, party: 'republican' },
  { name: 'Ellie Boldman', district: 46, party: 'democrat' },
  { name: 'Janet Ellis', district: 41, party: 'democrat' },
  { name: 'Andrea Olsen', district: 49, party: 'democrat' },
  { name: 'Chris Pope', district: 48, party: 'democrat' },
  { name: 'Denise Hayman', district: 42, party: 'democrat' },
  { name: 'Edith McClafferty', district: 45, party: 'democrat' },
  { name: 'Mary Ann Dunwell', district: 42, party: 'democrat' },
  { name: 'Pat Flowers', district: 32, party: 'democrat' },
  { name: 'Shannon O\'Brien', district: 46, party: 'democrat' },
  { name: 'Susan Webber', district: 50, party: 'democrat' },
]

// ─── MONTANA State House (100 members — leadership + notable) ─────────────────
const mtReps = [
  { name: 'Matt Regier', district: 4, party: 'republican' },
  { name: 'Brandon Ler', district: 35, party: 'republican' },
  { name: 'Bill Mercer', district: 46, party: 'republican' },
  { name: 'Casey Knudsen', district: 34, party: 'republican' },
  { name: 'David Bedey', district: 44, party: 'republican' },
  { name: 'Ed Buttrey', district: 20, party: 'republican' },
  { name: 'Jerry Schillinger', district: 50, party: 'republican' },
  { name: 'Jim Hamilton', district: 87, party: 'democrat' },
  { name: 'Jonathan Windy Boy', district: 32, party: 'democrat' },
  { name: 'SJ Howell', district: 95, party: 'democrat' },
  { name: 'Zooey Zephyr', district: 100, party: 'democrat' },
  { name: 'Alice Buckley', district: 94, party: 'democrat' },
  { name: 'Ed Stafman', district: 62, party: 'democrat' },
  { name: 'Marta Bertoglio', district: 97, party: 'democrat' },
]

// ─── MAINE State Senate (35 members) ─────────────────
const meSenators = [
  { name: 'Troy Jackson', district: 1, party: 'democrat' },
  { name: 'Eloise Vitelli', district: 23, party: 'democrat' },
  { name: 'Mattie Daughtry', district: 24, party: 'democrat' },
  { name: 'Ben Chipman', district: 27, party: 'democrat' },
  { name: 'Anne Carney', district: 29, party: 'democrat' },
  { name: 'Donna Bailey', district: 30, party: 'democrat' },
  { name: 'Jill Duson', district: 28, party: 'democrat' },
  { name: 'Joe Baldacci', district: 9, party: 'democrat' },
  { name: 'Mike Tipping', district: 7, party: 'democrat' },
  { name: 'Nicole Grohoski', district: 11, party: 'democrat' },
  { name: 'Peggy Rotundo', district: 16, party: 'democrat' },
  { name: 'Stacy Brenner', district: 26, party: 'democrat' },
  { name: 'Teresa Pierce', district: 25, party: 'democrat' },
  { name: 'Craig Hickman', district: 14, party: 'democrat' },
  { name: 'Cameron Reny', district: 22, party: 'democrat' },
  { name: 'David LaFountain', district: 17, party: 'democrat' },
  { name: 'Chip Curry', district: 15, party: 'democrat' },
  { name: 'Eric Brakey', district: 20, party: 'republican' },
  { name: 'Jeff Timberlake', district: 18, party: 'republican' },
  { name: 'Lisa Keim', district: 12, party: 'republican' },
  { name: 'Matthew Pouliot', district: 13, party: 'republican' },
  { name: 'Rick Bennett', district: 19, party: 'republican' },
  { name: 'Stacey Guerin', district: 8, party: 'republican' },
  { name: 'Trey Stewart', district: 2, party: 'republican' },
  { name: 'Harold Stewart III', district: 3, party: 'republican' },
  { name: 'Peter Lyford', district: 10, party: 'republican' },
  { name: 'Jim Libby', district: 21, party: 'republican' },
  { name: 'Tim Nangle', district: 31, party: 'democrat' },
]

// ─── MAINE State House (151 members — leadership + notable) ─────────────────
const meReps = [
  { name: 'Rachel Talbot Ross', district: 40, party: 'democrat' },
  { name: 'Matt Moonen', district: 38, party: 'democrat' },
  { name: 'Kristen Cloutier', district: 94, party: 'democrat' },
  { name: 'Morgan Rielly', district: 34, party: 'democrat' },
  { name: 'Michele Meyer', district: 59, party: 'democrat' },
  { name: 'Amy Roeder', district: 37, party: 'democrat' },
  { name: 'Lois Reckitt', district: 43, party: 'democrat' },
  { name: 'Laura Supica', district: 114, party: 'democrat' },
  { name: 'Billy Bob Faulkingham', district: 6, party: 'republican' },
  { name: 'Amy Arata', district: 90, party: 'republican' },
  { name: 'Joel Stetkis', district: 105, party: 'republican' },
  { name: 'MaryAnne Kinney', district: 89, party: 'republican' },
  { name: 'Laurel Libby', district: 70, party: 'republican' },
  { name: 'Jack Ducharme', district: 109, party: 'republican' },
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
  console.log('=== Seeding Hawaii ===')
  await upsertBatch([
    ...buildRows(hiSenators, 'HI', 'state_senate', 'HI State Senator'),
    ...buildRows(hiReps, 'HI', 'state_house', 'HI State Representative'),
  ])

  console.log('=== Seeding Idaho ===')
  await upsertBatch([
    ...buildRows(idSenators, 'ID', 'state_senate', 'ID State Senator'),
    ...buildRows(idReps, 'ID', 'state_house', 'ID State Representative'),
  ])

  console.log('=== Seeding Montana ===')
  await upsertBatch([
    ...buildRows(mtSenators, 'MT', 'state_senate', 'MT State Senator'),
    ...buildRows(mtReps, 'MT', 'state_house', 'MT State Representative'),
  ])

  console.log('=== Seeding Maine ===')
  await upsertBatch([
    ...buildRows(meSenators, 'ME', 'state_senate', 'ME State Senator'),
    ...buildRows(meReps, 'ME', 'state_house', 'ME State Representative'),
  ])

  console.log('Done!')
}

main().catch(console.error)
