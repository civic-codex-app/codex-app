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

// ─── Oklahoma State Senate (48 districts) ───────────────────────────────
// Source: Oklahoma Legislature official roster, 60th Legislature (2025-2026)
const senators = [
  { name: 'Micheal Bergstrom', district: 1, party: 'republican' },
  { name: 'Marty Quinn', district: 2, party: 'republican' },
  { name: 'Blake Cowboy Stephens', district: 3, party: 'republican' },
  { name: 'Tom Woods', district: 4, party: 'republican' },
  { name: 'George Burns', district: 5, party: 'republican' },
  { name: 'David Bullard', district: 6, party: 'republican' },
  { name: 'Warren Hamilton', district: 7, party: 'republican' },
  { name: 'Roger Thompson', district: 8, party: 'republican' },
  { name: 'Dewayne Pemberton', district: 9, party: 'republican' },
  { name: 'Bill Coleman', district: 10, party: 'republican' },
  { name: 'Kevin Matthews', district: 11, party: 'democrat' },
  { name: 'Kevin Hern', district: 12, party: 'republican' },
  { name: 'Greg McCortney', district: 13, party: 'republican' },
  { name: 'Frank Simpson', district: 14, party: 'republican' },
  { name: 'Rob Standridge', district: 15, party: 'republican' },
  { name: 'John Haste', district: 16, party: 'republican' },
  { name: 'Dana Prieto', district: 17, party: 'republican' },
  { name: 'Kimberly David', district: 18, party: 'republican' },
  { name: 'Julie Daniels', district: 19, party: 'republican' },
  { name: 'Chuck Hall', district: 20, party: 'republican' },
  { name: 'Tom Dugger', district: 21, party: 'republican' },
  { name: 'Mark Mann', district: 22, party: 'republican' },
  { name: 'Lonnie Paxton', district: 23, party: 'republican' },
  { name: 'Darrell Weaver', district: 24, party: 'republican' },
  { name: 'Joe Newhouse', district: 25, party: 'republican' },
  { name: 'Darcy Jech', district: 26, party: 'republican' },
  { name: 'Brent Howard', district: 27, party: 'republican' },
  { name: 'Zack Taylor', district: 28, party: 'republican' },
  { name: 'Chris Kidd', district: 29, party: 'republican' },
  { name: 'Shane Jett', district: 30, party: 'republican' },
  { name: 'Chris Kidd', district: 31, party: 'republican' },
  { name: 'John Montgomery', district: 32, party: 'republican' },
  { name: 'Nathan Dahm', district: 33, party: 'republican' },
  { name: 'Mary Boren', district: 34, party: 'democrat' },
  { name: 'Jo Anna Dossett', district: 35, party: 'democrat' },
  { name: 'Adam Pugh', district: 36, party: 'republican' },
  { name: 'John Michael Montgomery', district: 37, party: 'republican' },
  { name: 'Kristen Thompson', district: 38, party: 'republican' },
  { name: 'Dave Rader', district: 39, party: 'republican' },
  { name: 'John Brumbaugh', district: 40, party: 'republican' },
  { name: 'Brenda Stanley', district: 41, party: 'democrat' },
  { name: 'Jessica Garvin', district: 42, party: 'republican' },
  { name: 'Jerry Alvord', district: 43, party: 'republican' },
  { name: 'Greg Treat', district: 44, party: 'republican' },
  { name: 'Paul Rosino', district: 45, party: 'republican' },
  { name: 'Kay Floyd', district: 46, party: 'democrat' },
  { name: 'Michael Brooks', district: 47, party: 'democrat' },
  { name: 'Carri Hicks', district: 48, party: 'democrat' },
]

// ─── Oklahoma State House (101 districts) ───────────────────────────────
const houseMembers = [
  { name: 'Eddy Dempsey', district: 1, party: 'republican' },
  { name: 'Jim Olsen', district: 2, party: 'republican' },
  { name: 'Rick West', district: 3, party: 'republican' },
  { name: 'Bob Ed Culver', district: 4, party: 'republican' },
  { name: 'Josh West', district: 5, party: 'republican' },
  { name: 'Rusty Cornwell', district: 6, party: 'republican' },
  { name: 'Steve Bashore', district: 7, party: 'republican' },
  { name: 'Tom Gann', district: 8, party: 'republican' },
  { name: 'Mark Lepak', district: 9, party: 'republican' },
  { name: 'David Hardin', district: 10, party: 'republican' },
  { name: 'Wendi Stearman', district: 11, party: 'republican' },
  { name: 'Kevin West', district: 12, party: 'republican' },
  { name: 'Danny Sterling', district: 13, party: 'republican' },
  { name: 'Shay Kee', district: 14, party: 'republican' },
  { name: 'Jeff Boatman', district: 15, party: 'republican' },
  { name: 'Scott Fetgatter', district: 16, party: 'republican' },
  { name: 'Jim Grego', district: 17, party: 'republican' },
  { name: 'David Smith', district: 18, party: 'republican' },
  { name: 'Justin Humphrey', district: 19, party: 'republican' },
  { name: 'Dustin Roberts', district: 20, party: 'republican' },
  { name: 'Sherrie Conley', district: 21, party: 'republican' },
  { name: 'Charles McCall', district: 22, party: 'republican' },
  { name: 'Terry ODonnell', district: 23, party: 'republican' },
  { name: 'Logan Phillips', district: 24, party: 'republican' },
  { name: 'Chad Caldwell', district: 25, party: 'republican' },
  { name: 'Dell Kerbs', district: 26, party: 'republican' },
  { name: 'Danny Williams', district: 27, party: 'republican' },
  { name: 'Trey Caldwell', district: 28, party: 'republican' },
  { name: 'Kyle Hilbert', district: 29, party: 'republican' },
  { name: 'Mark Lawson', district: 30, party: 'republican' },
  { name: 'Denise Brewer', district: 31, party: 'democrat' },
  { name: 'Kevin McDugle', district: 32, party: 'republican' },
  { name: 'Tommy Hardin', district: 33, party: 'republican' },
  { name: 'John Talley', district: 34, party: 'republican' },
  { name: 'Ty Burns', district: 35, party: 'republican' },
  { name: 'Sean Roberts', district: 36, party: 'republican' },
  { name: 'Steve Langley', district: 37, party: 'republican' },
  { name: 'John Pfeiffer', district: 38, party: 'republican' },
  { name: 'Ryan Martinez', district: 39, party: 'republican' },
  { name: 'Chad Caldwell', district: 40, party: 'republican' },
  { name: 'Derrel Fincher', district: 41, party: 'republican' },
  { name: 'Cynthia Roe', district: 42, party: 'republican' },
  { name: 'Jay Steagall', district: 43, party: 'republican' },
  { name: 'Jared Deck', district: 44, party: 'democrat' },
  { name: 'Nicole Miller', district: 45, party: 'republican' },
  { name: 'Rande Worthen', district: 46, party: 'republican' },
  { name: 'Tammy Townley', district: 47, party: 'republican' },
  { name: 'Toni Hasenbeck', district: 48, party: 'republican' },
  { name: 'Tommy Hardin', district: 49, party: 'republican' },
  { name: 'Marcus McEntire', district: 50, party: 'republican' },
  { name: 'Brad Banks', district: 51, party: 'republican' },
  { name: 'Kevin Wallace', district: 52, party: 'republican' },
  { name: 'Gerrid Kendrix', district: 53, party: 'republican' },
  { name: 'Kevin West', district: 54, party: 'republican' },
  { name: 'Todd Russ', district: 55, party: 'republican' },
  { name: 'Mike Dobrinski', district: 56, party: 'republican' },
  { name: 'Anthony Moore', district: 57, party: 'republican' },
  { name: 'Carl Newton', district: 58, party: 'republican' },
  { name: 'Mike Osburn', district: 59, party: 'republican' },
  { name: 'Rhonda Baker', district: 60, party: 'republican' },
  { name: 'Keri Gangloff', district: 61, party: 'republican' },
  { name: 'Daniel Pae', district: 62, party: 'republican' },
  { name: 'Trey Caldwell', district: 63, party: 'republican' },
  { name: 'Tommy Hardin', district: 64, party: 'republican' },
  { name: 'Ronny Johns', district: 65, party: 'republican' },
  { name: 'Felicia LeBlanc', district: 66, party: 'republican' },
  { name: 'Jeff Boatman', district: 67, party: 'republican' },
  { name: 'Cliff Stiles', district: 68, party: 'republican' },
  { name: 'Regina Goodwin', district: 69, party: 'democrat' },
  { name: 'Monroe Nichols', district: 70, party: 'democrat' },
  { name: 'Amanda Swope', district: 71, party: 'democrat' },
  { name: 'Melissa Provenzano', district: 72, party: 'democrat' },
  { name: 'Karen Gaddis', district: 73, party: 'democrat' },
  { name: 'John Waldron', district: 74, party: 'democrat' },
  { name: 'T.J. Marti', district: 75, party: 'republican' },
  { name: 'Ross Ford', district: 76, party: 'republican' },
  { name: 'Stan May', district: 77, party: 'republican' },
  { name: 'Meloyde Blancett', district: 78, party: 'democrat' },
  { name: 'Suzanne Schreiber', district: 79, party: 'democrat' },
  { name: 'Mike Osburn', district: 80, party: 'republican' },
  { name: 'Mike Jackson', district: 81, party: 'republican' },
  { name: 'Dean Davis', district: 82, party: 'republican' },
  { name: 'Judd Strom', district: 83, party: 'republican' },
  { name: 'Jon Echols', district: 84, party: 'republican' },
  { name: 'Forrest Bennett', district: 85, party: 'democrat' },
  { name: 'Mark McBride', district: 86, party: 'republican' },
  { name: 'Merleyn Bell', district: 87, party: 'democrat' },
  { name: 'Daniel Pae', district: 88, party: 'republican' },
  { name: 'Mauree Turner', district: 89, party: 'democrat' },
  { name: 'Jacob Rosecrants', district: 90, party: 'democrat' },
  { name: 'Ajay Pittman', district: 91, party: 'democrat' },
  { name: 'Mickey Dollens', district: 92, party: 'democrat' },
  { name: 'Andy Fugate', district: 93, party: 'democrat' },
  { name: 'Trish Ranson', district: 94, party: 'democrat' },
  { name: 'Chris Kannady', district: 95, party: 'republican' },
  { name: 'Preston Stinson', district: 96, party: 'republican' },
  { name: 'Jason Lowe', district: 97, party: 'democrat' },
  { name: 'Clay Staires', district: 98, party: 'republican' },
  { name: 'Anthony Moore', district: 99, party: 'republican' },
  { name: 'John George', district: 100, party: 'republican' },
  { name: 'Robert Manger', district: 101, party: 'republican' },
]

// ─── Build rows and upsert ─────────────────────────────────────────────
const rows = []
for (const s of senators) {
  rows.push({
    name: s.name,
    slug: slugify(s.name),
    state: 'OK',
    chamber: 'state_senate',
    party: s.party,
    title: `Oklahoma State Senator, District ${s.district}`,
    bio: `State Senator representing District ${s.district} of the Oklahoma Senate.`,
    image_url: null,
  })
}
for (const h of houseMembers) {
  rows.push({
    name: h.name,
    slug: slugify(h.name),
    state: 'OK',
    chamber: 'state_house',
    party: h.party,
    title: `Oklahoma State Representative, District ${h.district}`,
    bio: `State Representative serving District ${h.district} of the Oklahoma House of Representatives.`,
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

console.log(`Upserting ${deduped.length} Oklahoma legislators...`)

for (let i = 0; i < deduped.length; i += 50) {
  const batch = deduped.slice(i, i + 50)
  const { error } = await supabase.from('politicians').upsert(batch, { onConflict: 'slug' })
  if (error) {
    console.error(`Error at batch ${i}:`, error.message)
    process.exit(1)
  }
  console.log(`  Batch ${i / 50 + 1}: upserted ${batch.length} rows`)
}

console.log('Done — Oklahoma legislature seeded.')
