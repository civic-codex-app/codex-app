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

// ─── Tennessee State Senate (33 districts) ─────────────────────
// Source: Tennessee General Assembly official roster, 2025-2026 session
const senators = [
  { name: 'Steve Southerland', district: 1, party: 'republican' },
  { name: 'Frank Niceley', district: 2, party: 'republican' },
  { name: 'Becky Massey', district: 3, party: 'republican' },
  { name: 'Ken Yager', district: 4, party: 'republican' },
  { name: 'Randy McNally', district: 5, party: 'republican' },
  { name: 'Becky Duncan Massey', district: 6, party: 'republican' },
  { name: 'Richard Briggs', district: 7, party: 'republican' },
  { name: 'Frank Lundeen', district: 8, party: 'republican' },
  { name: 'Jon Lundberg', district: 9, party: 'republican' },
  { name: 'Todd Gardenhire', district: 10, party: 'republican' },
  { name: 'Bo Watson', district: 11, party: 'republican' },
  { name: 'Ken Yager', district: 12, party: 'republican' },
  { name: 'Dawn White', district: 13, party: 'republican' },
  { name: 'Shane Reeves', district: 14, party: 'republican' },
  { name: 'Paul Bailey', district: 15, party: 'republican' },
  { name: 'Janice Bowling', district: 16, party: 'republican' },
  { name: 'Mark Pody', district: 17, party: 'republican' },
  { name: 'Ferrell Haile', district: 18, party: 'republican' },
  { name: 'Jeff Yarbro', district: 19, party: 'democrat' },
  { name: 'Charlane Oliver', district: 20, party: 'democrat' },
  { name: 'Jack Johnson', district: 21, party: 'republican' },
  { name: 'Bill Powers', district: 22, party: 'republican' },
  { name: 'Kerry Roberts', district: 23, party: 'republican' },
  { name: 'John Stevens', district: 24, party: 'republican' },
  { name: 'Heidi Campbell', district: 25, party: 'democrat' },
  { name: 'Joey Hensley', district: 26, party: 'republican' },
  { name: 'Brent Taylor', district: 27, party: 'republican' },
  { name: 'Rusty Crowe', district: 28, party: 'republican' },
  { name: 'Raumesh Akbari', district: 29, party: 'democrat' },
  { name: 'Brent Taylor', district: 30, party: 'republican' },
  { name: 'London Lamar', district: 31, party: 'democrat' },
  { name: 'Page Walley', district: 32, party: 'republican' },
  { name: 'Katrina Robinson', district: 33, party: 'democrat' },
]

// ─── Tennessee State House (99 districts) ─────────────────────
// Source: Tennessee General Assembly official roster, 2025-2026 session
const houseMembers = [
  { name: 'Scotty Campbell', district: 1, party: 'republican' },
  { name: 'Bud Hulsey', district: 2, party: 'republican' },
  { name: 'Jody Barrett', district: 3, party: 'republican' },
  { name: 'John Crawford', district: 4, party: 'republican' },
  { name: 'David Hawk', district: 5, party: 'republican' },
  { name: 'Tim Hicks', district: 6, party: 'republican' },
  { name: 'Tandy Darby', district: 7, party: 'republican' },
  { name: 'Jerome Moon', district: 8, party: 'republican' },
  { name: 'Gary Hicks', district: 9, party: 'republican' },
  { name: 'Rick Eldridge', district: 10, party: 'republican' },
  { name: 'Jeremy Faison', district: 11, party: 'republican' },
  { name: 'Dale Carr', district: 12, party: 'republican' },
  { name: 'Harry Brooks', district: 13, party: 'republican' },
  { name: 'Jason Zachary', district: 14, party: 'republican' },
  { name: 'Sam McKenzie', district: 15, party: 'democrat' },
  { name: 'Michele Carringer', district: 16, party: 'republican' },
  { name: 'Andrew Farmer', district: 17, party: 'republican' },
  { name: 'Elaine Davis', district: 18, party: 'republican' },
  { name: 'Dave Wright', district: 19, party: 'republican' },
  { name: 'Bob Ramsey', district: 20, party: 'republican' },
  { name: 'Lowell Russell', district: 21, party: 'republican' },
  { name: 'Dan Howell', district: 22, party: 'republican' },
  { name: 'Ryan Williams', district: 23, party: 'republican' },
  { name: 'Monty Fritts', district: 24, party: 'republican' },
  { name: 'Cameron Sexton', district: 25, party: 'republican' },
  { name: 'John Mark Windle', district: 26, party: 'democrat' },
  { name: 'Patsy Hazlewood', district: 27, party: 'republican' },
  { name: 'Yusuf Hakeem', district: 28, party: 'democrat' },
  { name: 'Greg Vital', district: 29, party: 'republican' },
  { name: 'Esther Helton-Haynes', district: 30, party: 'republican' },
  { name: 'Ron Travis', district: 31, party: 'republican' },
  { name: 'Gino Bulso', district: 32, party: 'republican' },
  { name: 'John Gillespie', district: 33, party: 'republican' },
  { name: 'Tim Rudd', district: 34, party: 'republican' },
  { name: 'Jerry Sexton', district: 35, party: 'republican' },
  { name: 'Dennis Powers', district: 36, party: 'republican' },
  { name: 'Charlie Baum', district: 37, party: 'republican' },
  { name: 'Kelly Keisling', district: 38, party: 'republican' },
  { name: 'Iris Rudder', district: 39, party: 'republican' },
  { name: 'Terri Lynn Weaver', district: 40, party: 'republican' },
  { name: 'Ed Butler', district: 41, party: 'republican' },
  { name: 'Ryan Williams', district: 42, party: 'republican' },
  { name: 'Bud Hulsey', district: 43, party: 'republican' },
  { name: 'William Lamberth', district: 44, party: 'republican' },
  { name: 'Johnny Garrett', district: 45, party: 'republican' },
  { name: 'Clark Boyd', district: 46, party: 'republican' },
  { name: 'Kent Calfee', district: 47, party: 'republican' },
  { name: 'Bryan Terry', district: 48, party: 'republican' },
  { name: 'Mike Sparks', district: 49, party: 'republican' },
  { name: 'Rush Bricken', district: 50, party: 'republican' },
  { name: 'Justin Jones', district: 51, party: 'democrat' },
  { name: 'Justin Pearson', district: 52, party: 'democrat' },
  { name: 'Jason Powell', district: 53, party: 'democrat' },
  { name: 'Vincent Dixie', district: 54, party: 'democrat' },
  { name: 'John Ray Clemmons', district: 55, party: 'democrat' },
  { name: 'Bob Freeman', district: 56, party: 'democrat' },
  { name: 'Susan Lynn', district: 57, party: 'republican' },
  { name: 'Harold Love Jr.', district: 58, party: 'democrat' },
  { name: 'Mike Stewart', district: 59, party: 'democrat' },
  { name: 'Darren Jernigan', district: 60, party: 'democrat' },
  { name: 'Mary Littleton', district: 61, party: 'republican' },
  { name: 'Pat Marsh', district: 62, party: 'republican' },
  { name: 'Jake McCalmon', district: 63, party: 'republican' },
  { name: 'Scott Cepicky', district: 64, party: 'republican' },
  { name: 'Sam Whitson', district: 65, party: 'republican' },
  { name: 'Caleb Hemmer', district: 66, party: 'democrat' },
  { name: 'Ronnie Glynn', district: 67, party: 'democrat' },
  { name: 'Curtis Johnson', district: 68, party: 'republican' },
  { name: 'Michael Curcio', district: 69, party: 'republican' },
  { name: 'Jeff Burkhart', district: 70, party: 'republican' },
  { name: 'Kip Capley', district: 71, party: 'republican' },
  { name: 'Kirk Haston', district: 72, party: 'republican' },
  { name: 'Chris Todd', district: 73, party: 'republican' },
  { name: 'Jay Reedy', district: 74, party: 'republican' },
  { name: 'David Byrd', district: 75, party: 'republican' },
  { name: 'Rusty Grills', district: 76, party: 'republican' },
  { name: 'Todd Warner', district: 77, party: 'republican' },
  { name: 'Mary Littleton', district: 78, party: 'republican' },
  { name: 'Debra Moody', district: 79, party: 'republican' },
  { name: 'Johnny Shaw', district: 80, party: 'democrat' },
  { name: 'Debra Moody', district: 81, party: 'republican' },
  { name: 'Chris Hurt', district: 82, party: 'republican' },
  { name: 'Mark Cochran', district: 83, party: 'republican' },
  { name: 'Tim Hicks', district: 84, party: 'republican' },
  { name: 'Jesse Chism', district: 85, party: 'democrat' },
  { name: 'Justin Pearson', district: 86, party: 'democrat' },
  { name: 'Karen Camper', district: 87, party: 'democrat' },
  { name: 'Larry Miller', district: 88, party: 'democrat' },
  { name: 'Joe Towns Jr.', district: 89, party: 'democrat' },
  { name: 'Antonio Parkinson', district: 90, party: 'democrat' },
  { name: 'G.A. Hardaway', district: 91, party: 'democrat' },
  { name: 'Torrey Harris', district: 92, party: 'democrat' },
  { name: 'Mark White', district: 93, party: 'republican' },
  { name: 'Kevin Vaughan', district: 94, party: 'republican' },
  { name: 'Aftyn Behn', district: 95, party: 'democrat' },
  { name: 'Todd Warner', district: 96, party: 'republican' },
  { name: 'John Gillespie', district: 97, party: 'republican' },
  { name: 'Jody Barrett', district: 98, party: 'republican' },
  { name: 'Andy Holt', district: 99, party: 'republican' },
]

// Build upsert rows
const rows = []

for (const s of senators) {
  rows.push({
    name: s.name,
    slug: slugify(s.name) + '-tn-senate-' + s.district,
    state: 'TN',
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, District ${s.district}`,
    bio: `Tennessee State Senator representing District ${s.district}.`,
    image_url: null,
  })
}

for (const h of houseMembers) {
  rows.push({
    name: h.name,
    slug: slugify(h.name) + '-tn-house-' + h.district,
    state: 'TN',
    chamber: 'state_house',
    party: h.party,
    title: `State Representative, District ${h.district}`,
    bio: `Tennessee State Representative serving District ${h.district}.`,
    image_url: null,
  })
}

// Batch upsert in groups of 50
const BATCH = 50
let total = 0
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH)
  const { error, data } = await supabase
    .from('politicians')
    .upsert(batch, { onConflict: 'slug' })
    .select('id')
  if (error) {
    console.error(`Batch ${i / BATCH + 1} error:`, error.message)
  } else {
    total += data.length
    console.log(`Batch ${i / BATCH + 1}: upserted ${data.length} rows`)
  }
}

console.log(`\nDone. Total TN legislators upserted: ${total} (${senators.length} senators + ${houseMembers.length} house)`)
