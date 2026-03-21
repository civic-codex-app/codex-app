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

// ─── Mississippi State Senate (52 districts) ────────────────────────────
// Source: Mississippi Legislature official roster, 2024-2027 term
const senators = [
  { name: 'Briggs Hopson', district: 1, party: 'republican' },
  { name: 'Nicole Boyd', district: 2, party: 'republican' },
  { name: 'Kevin Blackwell', district: 3, party: 'republican' },
  { name: 'Michael McLendon', district: 4, party: 'republican' },
  { name: 'Brice Wiggins', district: 5, party: 'republican' },
  { name: 'David Jordan', district: 6, party: 'democrat' },
  { name: 'Hob Bryan', district: 7, party: 'democrat' },
  { name: 'Chad McMahan', district: 8, party: 'republican' },
  { name: 'Ben Suber', district: 9, party: 'republican' },
  { name: 'Neil Whaley', district: 10, party: 'republican' },
  { name: 'J. Walter Michel', district: 11, party: 'republican' },
  { name: 'Chris Massey', district: 12, party: 'republican' },
  { name: 'Derrick Simmons', district: 13, party: 'democrat' },
  { name: 'Rod Hickman', district: 14, party: 'democrat' },
  { name: 'Jeremy England', district: 15, party: 'republican' },
  { name: 'Angela Burks Hill', district: 16, party: 'republican' },
  { name: 'Mike Seymour', district: 17, party: 'republican' },
  { name: 'W. Briggs Hopson III', district: 18, party: 'republican' },
  { name: 'Dean Kirby', district: 19, party: 'republican' },
  { name: 'Jenifer Branning', district: 20, party: 'republican' },
  { name: 'Lydia Chassaniol', district: 21, party: 'republican' },
  { name: 'Sollie Norwood', district: 22, party: 'democrat' },
  { name: 'Juan Barnett', district: 23, party: 'democrat' },
  { name: 'Albert Butler', district: 24, party: 'democrat' },
  { name: 'Jason Barrett', district: 25, party: 'republican' },
  { name: 'Tyler McCaughn', district: 26, party: 'republican' },
  { name: 'Daniel Sparks', district: 27, party: 'republican' },
  { name: 'Hillman Frazier', district: 28, party: 'democrat' },
  { name: 'David Blount', district: 29, party: 'democrat' },
  { name: 'Tammy Witherspoon', district: 30, party: 'democrat' },
  { name: 'Joseph Thomas', district: 31, party: 'democrat' },
  { name: 'John Horhn', district: 32, party: 'democrat' },
  { name: 'Willie Simmons', district: 33, party: 'democrat' },
  { name: 'Rita Potts Parks', district: 34, party: 'democrat' },
  { name: 'Jeff Tate', district: 35, party: 'republican' },
  { name: 'Sally Doty', district: 36, party: 'republican' },
  { name: 'Joey Fillingane', district: 37, party: 'republican' },
  { name: 'Chris Johnson', district: 38, party: 'democrat' },
  { name: 'Josh Harkins', district: 39, party: 'republican' },
  { name: 'Bart Williams', district: 40, party: 'republican' },
  { name: 'Scott DeLano', district: 41, party: 'republican' },
  { name: 'Dennis DeBar', district: 42, party: 'republican' },
  { name: 'Kathy Chism', district: 43, party: 'republican' },
  { name: 'Philip Moran', district: 44, party: 'republican' },
  { name: 'John Polk', district: 45, party: 'republican' },
  { name: 'Bobby Martin', district: 46, party: 'republican' },
  { name: 'Joseph Seymour', district: 47, party: 'republican' },
  { name: 'Mike Thompson', district: 48, party: 'republican' },
  { name: 'Robert Jackson', district: 49, party: 'democrat' },
  { name: 'Chuck Younger', district: 50, party: 'republican' },
  { name: 'Tyler McCaughn', district: 51, party: 'republican' },
  { name: 'Jason White', district: 52, party: 'republican' },
]

// ─── Mississippi State House (122 districts) ────────────────────────────
const houseMembers = [
  { name: 'Jerry Turner', district: 1, party: 'republican' },
  { name: 'Steve Hopkins', district: 2, party: 'republican' },
  { name: 'Brent Powell', district: 3, party: 'republican' },
  { name: 'Nick Bain', district: 4, party: 'republican' },
  { name: 'Carl Mickens', district: 5, party: 'democrat' },
  { name: 'Chris Brown', district: 6, party: 'republican' },
  { name: 'Dana Criswell', district: 7, party: 'republican' },
  { name: 'Trey Lamar', district: 8, party: 'republican' },
  { name: 'Larry Byrd', district: 9, party: 'republican' },
  { name: 'Fred Shanks', district: 10, party: 'republican' },
  { name: 'Donnie Scoggin', district: 11, party: 'republican' },
  { name: 'Lester Carpenter', district: 12, party: 'republican' },
  { name: 'Steve Massengill', district: 13, party: 'republican' },
  { name: 'Bill Kinkade', district: 14, party: 'republican' },
  { name: 'Rob Roberson', district: 15, party: 'republican' },
  { name: 'Wanda Jennings', district: 16, party: 'republican' },
  { name: 'Nick Bain', district: 17, party: 'republican' },
  { name: 'Joey Hood', district: 18, party: 'republican' },
  { name: 'Jansen Owen', district: 19, party: 'republican' },
  { name: 'Daryl Porter Jr.', district: 20, party: 'democrat' },
  { name: 'Karl Oliver', district: 21, party: 'republican' },
  { name: 'Oscar Denton', district: 22, party: 'democrat' },
  { name: 'Cedric Burnett', district: 23, party: 'democrat' },
  { name: 'Abe Hudson Jr.', district: 24, party: 'democrat' },
  { name: 'Orlando Paden', district: 25, party: 'democrat' },
  { name: 'Tyrone Ellis', district: 26, party: 'democrat' },
  { name: 'Bryant Clark', district: 27, party: 'democrat' },
  { name: 'Zakiya Summers', district: 28, party: 'democrat' },
  { name: 'Earle Banks', district: 29, party: 'democrat' },
  { name: 'Alyce Clarke', district: 30, party: 'democrat' },
  { name: 'Ronnie Crudup Jr.', district: 31, party: 'democrat' },
  { name: 'Cedric Burnett', district: 32, party: 'democrat' },
  { name: 'Chris Bell', district: 33, party: 'democrat' },
  { name: 'Angela Cockerham', district: 34, party: 'democrat' },
  { name: 'Jessica Upshaw', district: 35, party: 'republican' },
  { name: 'Sam Mims', district: 36, party: 'republican' },
  { name: 'Jody Steverson', district: 37, party: 'republican' },
  { name: 'Gene Newman', district: 38, party: 'republican' },
  { name: 'Robert Foster', district: 39, party: 'republican' },
  { name: 'Kevin Horan', district: 40, party: 'democrat' },
  { name: 'John Thomas', district: 41, party: 'republican' },
  { name: 'Vince Mangold', district: 42, party: 'republican' },
  { name: 'Richard Bennett', district: 43, party: 'republican' },
  { name: 'Tracy Arnold', district: 44, party: 'republican' },
  { name: 'John Hines Sr.', district: 45, party: 'democrat' },
  { name: 'Oscar Denton', district: 46, party: 'democrat' },
  { name: 'Bryant Clark', district: 47, party: 'democrat' },
  { name: 'Otis Anthony', district: 48, party: 'democrat' },
  { name: 'Percy Watson', district: 49, party: 'democrat' },
  { name: 'Shanda Yates', district: 50, party: 'independent' },
  { name: 'Jill Ford', district: 51, party: 'republican' },
  { name: 'Stanford Johnson', district: 52, party: 'democrat' },
  { name: 'Kimberly Campbell', district: 53, party: 'democrat' },
  { name: 'Philip Gunn', district: 54, party: 'republican' },
  { name: 'Kevin Felsher', district: 55, party: 'republican' },
  { name: 'Jeffrey Hulum', district: 56, party: 'democrat' },
  { name: 'Ed Blackmon Jr.', district: 57, party: 'democrat' },
  { name: 'Larry Byrd', district: 58, party: 'republican' },
  { name: 'Robert Johnson III', district: 59, party: 'democrat' },
  { name: 'Stacey Hobbs', district: 60, party: 'democrat' },
  { name: 'Greg Haney', district: 61, party: 'republican' },
  { name: 'Brady Williamson', district: 62, party: 'republican' },
  { name: 'Noah Sanford', district: 63, party: 'republican' },
  { name: 'Bill Pigott', district: 64, party: 'republican' },
  { name: 'Becky Currie', district: 65, party: 'republican' },
  { name: 'Missy McGee', district: 66, party: 'republican' },
  { name: 'Robert Zuber', district: 67, party: 'republican' },
  { name: 'Kenneth Walker', district: 68, party: 'democrat' },
  { name: 'Landon Britt', district: 69, party: 'republican' },
  { name: 'Bo Brown', district: 70, party: 'democrat' },
  { name: 'LaTonya Merrell', district: 71, party: 'democrat' },
  { name: 'Sonya Williams-Barnes', district: 72, party: 'democrat' },
  { name: 'Kabir Karriem', district: 73, party: 'democrat' },
  { name: 'Solomon Osborne', district: 74, party: 'democrat' },
  { name: 'Manly Barton', district: 75, party: 'republican' },
  { name: 'Timmy Ladner', district: 76, party: 'republican' },
  { name: 'Casey Eure', district: 77, party: 'republican' },
  { name: 'Patricia Willis', district: 78, party: 'democrat' },
  { name: 'Cheikh Taylor', district: 79, party: 'democrat' },
  { name: 'Chris Johnson', district: 80, party: 'democrat' },
  { name: 'Tom Weathersby', district: 81, party: 'republican' },
  { name: 'Daryl Porter', district: 82, party: 'democrat' },
  { name: 'Mark Baker', district: 83, party: 'republican' },
  { name: 'Jeffrey Harness', district: 84, party: 'republican' },
  { name: 'Mac Huddleston', district: 85, party: 'republican' },
  { name: 'Charles Jim Beckett', district: 86, party: 'republican' },
  { name: 'Larry Byrd', district: 87, party: 'republican' },
  { name: 'Lee Yancey', district: 88, party: 'republican' },
  { name: 'Sam Creekmore', district: 89, party: 'republican' },
  { name: 'Dan Eubanks', district: 90, party: 'republican' },
  { name: 'Rickey Thompson', district: 91, party: 'democrat' },
  { name: 'William Tracy Arnold', district: 92, party: 'republican' },
  { name: 'Randy Boyd', district: 93, party: 'republican' },
  { name: 'Jeff Guice', district: 94, party: 'republican' },
  { name: 'Jeffrey Hulum', district: 95, party: 'democrat' },
  { name: 'Tom Miles', district: 96, party: 'democrat' },
  { name: 'Daryl Porter', district: 97, party: 'democrat' },
  { name: 'Fabian Nelson', district: 98, party: 'democrat' },
  { name: 'Jarvis Dortch', district: 99, party: 'democrat' },
  { name: 'Otis Anthony', district: 100, party: 'democrat' },
  { name: 'Robert Sanders III', district: 101, party: 'democrat' },
  { name: 'Lemuel Jackson', district: 102, party: 'democrat' },
  { name: 'Sam Mims', district: 103, party: 'republican' },
  { name: 'Nolan Mettetal', district: 104, party: 'republican' },
  { name: 'Gene Newman', district: 105, party: 'republican' },
  { name: 'C. Scott Bounds', district: 106, party: 'republican' },
  { name: 'Vince Mangold', district: 107, party: 'republican' },
  { name: 'Shane Aguirre', district: 108, party: 'republican' },
  { name: 'Dale Goodin', district: 109, party: 'republican' },
  { name: 'John Read', district: 110, party: 'republican' },
  { name: 'Bill Kinkade', district: 111, party: 'republican' },
  { name: 'Bubba Carpenter', district: 112, party: 'republican' },
  { name: 'Steve Massengill', district: 113, party: 'republican' },
  { name: 'Donnie Bell', district: 114, party: 'republican' },
  { name: 'Jeffrey Guice', district: 115, party: 'republican' },
  { name: 'Brent Anderson', district: 116, party: 'republican' },
  { name: 'Kevin Felsher', district: 117, party: 'republican' },
  { name: 'Jeramey Anderson', district: 118, party: 'democrat' },
  { name: 'Kenneth Walker', district: 119, party: 'democrat' },
  { name: 'Stacey Hobbs', district: 120, party: 'democrat' },
  { name: 'Angela Cockerham', district: 121, party: 'democrat' },
  { name: 'Omeria Scott', district: 122, party: 'democrat' },
]

// ─── Build rows and upsert ─────────────────────────────────────────────
const rows = []
for (const s of senators) {
  rows.push({
    name: s.name,
    slug: slugify(s.name),
    state: 'MS',
    chamber: 'state_senate',
    party: s.party,
    title: `Mississippi State Senator, District ${s.district}`,
    bio: `State Senator representing District ${s.district} of the Mississippi Senate.`,
    image_url: null,
  })
}
for (const h of houseMembers) {
  rows.push({
    name: h.name,
    slug: slugify(h.name),
    state: 'MS',
    chamber: 'state_house',
    party: h.party,
    title: `Mississippi State Representative, District ${h.district}`,
    bio: `State Representative serving District ${h.district} of the Mississippi House of Representatives.`,
    image_url: null,
  })
}

// Deduplicate by slug
const seen = new Set()
const deduped = rows.filter(r => {
  if (seen.has(r.slug)) return false
  seen.add(r.slug)
  return true
})

console.log(`Upserting ${deduped.length} Mississippi legislators...`)

for (let i = 0; i < deduped.length; i += 50) {
  const batch = deduped.slice(i, i + 50)
  const { error } = await supabase.from('politicians').upsert(batch, { onConflict: 'slug' })
  if (error) {
    console.error(`Error at batch ${i}:`, error.message)
    process.exit(1)
  }
  console.log(`  Batch ${i / 50 + 1}: upserted ${batch.length} rows`)
}

console.log('Done — Mississippi legislature seeded.')
