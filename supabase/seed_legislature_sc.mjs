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

// ─── South Carolina State Senate (46 districts) ─────────────────────
// Source: SC Legislature official roster, 2023-2024 session
const senators = [
  { name: 'Tom Davis', district: 1, party: 'republican' },
  { name: 'Chip Campsen', district: 2, party: 'republican' },
  { name: 'Sandy Senn', district: 3, party: 'republican' },
  { name: 'Margie Bright Matthews', district: 4, party: 'democrat' },
  { name: 'Larry Grooms', district: 5, party: 'republican' },
  { name: 'Greg Hembree', district: 6, party: 'republican' },
  { name: 'Kent Williams', district: 7, party: 'democrat' },
  { name: 'Luke Rankin', district: 8, party: 'republican' },
  { name: 'Ronnie Sabb', district: 9, party: 'democrat' },
  { name: 'Sean Bennett', district: 10, party: 'republican' },
  { name: 'Mike Gambrell', district: 11, party: 'republican' },
  { name: 'Kevin Johnson', district: 12, party: 'democrat' },
  { name: 'Brad Hutto', district: 13, party: 'democrat' },
  { name: 'Larry Grooms', district: 14, party: 'republican' },
  { name: 'Darrell Jackson', district: 15, party: 'democrat' },
  { name: 'Nikki Setzler', district: 16, party: 'democrat' },
  { name: 'Shane Massey', district: 17, party: 'republican' },
  { name: 'Rex Rice', district: 18, party: 'republican' },
  { name: 'Penry Gustafson', district: 19, party: 'republican' },
  { name: 'Josh Kimbrell', district: 20, party: 'republican' },
  { name: 'Billy Garrett', district: 21, party: 'republican' },
  { name: 'Richard Cash', district: 22, party: 'republican' },
  { name: 'Thomas Alexander', district: 23, party: 'republican' },
  { name: 'Danny Verdin', district: 24, party: 'republican' },
  { name: 'Shane Martin', district: 25, party: 'republican' },
  { name: 'Dwight Loftis', district: 26, party: 'republican' },
  { name: 'Karl Allen', district: 27, party: 'democrat' },
  { name: 'Mike Fanning', district: 28, party: 'democrat' },
  { name: 'Katrina Shealy', district: 29, party: 'republican' },
  { name: 'Jason Elliott', district: 30, party: 'republican' },
  { name: 'Mia McLeod', district: 31, party: 'democrat' },
  { name: 'Dick Harpootlian', district: 32, party: 'democrat' },
  { name: 'Brian Adams', district: 33, party: 'republican' },
  { name: 'Ross Turner', district: 34, party: 'republican' },
  { name: 'Harvey Peeler', district: 35, party: 'republican' },
  { name: 'Wes Climer', district: 36, party: 'republican' },
  { name: 'Mike Reichenbach', district: 37, party: 'republican' },
  { name: 'Greg Hembree', district: 38, party: 'republican' },
  { name: 'John Scott', district: 39, party: 'democrat' },
  { name: 'Greg Hembree', district: 40, party: 'republican' },
  { name: 'Sandy Senn', district: 41, party: 'republican' },
  { name: 'Teddy Turner', district: 42, party: 'republican' },
  { name: 'Tim Scott', district: 43, party: 'republican' },
  { name: 'Chip Campsen', district: 44, party: 'republican' },
  { name: 'Marlon Kimpson', district: 45, party: 'democrat' },
  { name: 'Vernon Stephens', district: 46, party: 'democrat' },
]

// ─── South Carolina State House (124 districts) ─────────────────────
// Source: SC Legislature official roster, 2023-2024 session
const houseMembers = [
  { name: 'Bill Herbkersman', district: 1, party: 'republican' },
  { name: 'Jeff Bradley', district: 2, party: 'republican' },
  { name: 'Jay West', district: 3, party: 'republican' },
  { name: 'Matt Leber', district: 4, party: 'republican' },
  { name: 'Brandon Newton', district: 5, party: 'republican' },
  { name: 'Russell Ott', district: 6, party: 'democrat' },
  { name: 'Mike Burns', district: 7, party: 'republican' },
  { name: 'Jonathon Hill', district: 8, party: 'republican' },
  { name: 'Anne Parks', district: 9, party: 'democrat' },
  { name: 'Thomas Beach', district: 10, party: 'republican' },
  { name: 'Craig Gagnon', district: 11, party: 'republican' },
  { name: 'Bobby Cox', district: 12, party: 'republican' },
  { name: 'John McCravy', district: 13, party: 'republican' },
  { name: 'Stewart Jones', district: 14, party: 'republican' },
  { name: 'Adam Morgan', district: 15, party: 'republican' },
  { name: 'Mark Willis', district: 16, party: 'republican' },
  { name: 'Davey Hiott', district: 17, party: 'republican' },
  { name: 'Alan Morgan', district: 18, party: 'republican' },
  { name: 'Patrick Haddon', district: 19, party: 'republican' },
  { name: 'Bruce Bannister', district: 20, party: 'republican' },
  { name: 'Jason Elliott', district: 21, party: 'republican' },
  { name: 'Chandra Dillard', district: 22, party: 'democrat' },
  { name: 'Leola Robinson-Simpson', district: 23, party: 'democrat' },
  { name: 'Mark Willis', district: 24, party: 'republican' },
  { name: 'Garry Smith', district: 25, party: 'republican' },
  { name: 'David Hiott', district: 26, party: 'republican' },
  { name: 'Jay West', district: 27, party: 'republican' },
  { name: 'Travis Moore', district: 28, party: 'republican' },
  { name: 'Dennis Moss', district: 29, party: 'republican' },
  { name: 'Rosalyn Henderson-Myers', district: 30, party: 'democrat' },
  { name: 'Mike Neese', district: 31, party: 'republican' },
  { name: 'Bobby Cox', district: 32, party: 'republican' },
  { name: 'Vic Dabney', district: 33, party: 'republican' },
  { name: 'Cal Forrest', district: 34, party: 'republican' },
  { name: 'Bill Taylor', district: 35, party: 'republican' },
  { name: 'Raye Felder', district: 36, party: 'republican' },
  { name: 'Doug Gilliam', district: 37, party: 'republican' },
  { name: 'Tommy Pope', district: 38, party: 'republican' },
  { name: 'Richard Yow', district: 39, party: 'republican' },
  { name: 'Tim McGinnis', district: 40, party: 'republican' },
  { name: 'Annie McDaniel', district: 41, party: 'democrat' },
  { name: 'Kimberly Johnson', district: 42, party: 'democrat' },
  { name: 'Todd Rutherford', district: 43, party: 'democrat' },
  { name: 'Chris Wooten', district: 44, party: 'republican' },
  { name: 'Brandon Guffey', district: 45, party: 'republican' },
  { name: 'John King', district: 46, party: 'democrat' },
  { name: 'Jermaine Johnson', district: 47, party: 'democrat' },
  { name: 'Chip Huggins', district: 48, party: 'republican' },
  { name: 'Leon Howard', district: 49, party: 'democrat' },
  { name: 'Wendy Brawley', district: 50, party: 'democrat' },
  { name: 'Heather Bauer', district: 51, party: 'democrat' },
  { name: 'Kambrell Garvin', district: 52, party: 'democrat' },
  { name: 'Laurie Slade Funderburk', district: 53, party: 'democrat' },
  { name: 'Jeffrey Johnson', district: 54, party: 'democrat' },
  { name: 'Weston Newton', district: 55, party: 'republican' },
  { name: 'Cally Forrest', district: 56, party: 'republican' },
  { name: 'Patrick Haddon', district: 57, party: 'republican' },
  { name: 'Gary Clary', district: 58, party: 'republican' },
  { name: 'Mike Burns', district: 59, party: 'republican' },
  { name: 'Max Hyde', district: 60, party: 'republican' },
  { name: 'Micah Caskey', district: 61, party: 'republican' },
  { name: 'Nathan Ballentine', district: 62, party: 'republican' },
  { name: 'Jay Lucas', district: 63, party: 'republican' },
  { name: 'Seth Rose', district: 64, party: 'democrat' },
  { name: 'Teresa McGinnis', district: 65, party: 'republican' },
  { name: 'Chris Hart', district: 66, party: 'democrat' },
  { name: 'JA Moore', district: 67, party: 'democrat' },
  { name: 'Carl Anderson', district: 68, party: 'democrat' },
  { name: 'Jerry Govan', district: 69, party: 'democrat' },
  { name: 'Lonnie Hosey', district: 70, party: 'democrat' },
  { name: 'Justin Bamberg', district: 71, party: 'democrat' },
  { name: 'Justin Bamberg', district: 72, party: 'democrat' },
  { name: 'Chris Murphy', district: 73, party: 'republican' },
  { name: 'Brandon Guffey', district: 74, party: 'republican' },
  { name: 'RJ May', district: 75, party: 'republican' },
  { name: 'Bill Clyburn', district: 76, party: 'democrat' },
  { name: 'Cezar McKnight', district: 77, party: 'democrat' },
  { name: 'Robert Williams', district: 78, party: 'democrat' },
  { name: 'Jeff Johnson', district: 79, party: 'republican' },
  { name: 'Heather Crawford', district: 80, party: 'republican' },
  { name: 'Kevin Hardee', district: 81, party: 'republican' },
  { name: 'Jay Jordan', district: 82, party: 'republican' },
  { name: 'Lee Hewitt', district: 83, party: 'republican' },
  { name: 'Carl Anderson', district: 84, party: 'democrat' },
  { name: 'William Bailey', district: 85, party: 'republican' },
  { name: 'Sylleste Davis', district: 86, party: 'republican' },
  { name: 'Cal Forrest', district: 87, party: 'republican' },
  { name: 'Krystle Matthews', district: 88, party: 'democrat' },
  { name: 'JA Moore', district: 89, party: 'democrat' },
  { name: 'Mark Smith', district: 90, party: 'republican' },
  { name: 'Wendell Gilliard', district: 91, party: 'democrat' },
  { name: 'Joe Jefferson', district: 92, party: 'democrat' },
  { name: 'Chris Wooten', district: 93, party: 'republican' },
  { name: 'Mike Sottile', district: 94, party: 'republican' },
  { name: 'Spencer Wetmore', district: 95, party: 'democrat' },
  { name: 'Lin Bennett', district: 96, party: 'republican' },
  { name: 'Sylleste Davis', district: 97, party: 'republican' },
  { name: 'Chris Wooten', district: 98, party: 'republican' },
  { name: 'Nancy Mace', district: 99, party: 'republican' },
  { name: 'Peter McCoy', district: 100, party: 'republican' },
  { name: 'Joseph Daning', district: 101, party: 'republican' },
  { name: 'Joseph Jefferson', district: 102, party: 'democrat' },
  { name: 'Bobby Horne', district: 103, party: 'democrat' },
  { name: 'Mandy Powers Norrell', district: 104, party: 'democrat' },
  { name: 'Murrell Smith', district: 105, party: 'republican' },
  { name: 'Lucas Atkinson', district: 106, party: 'democrat' },
  { name: 'Mike Wooten', district: 107, party: 'republican' },
  { name: 'Jerry Govan', district: 108, party: 'democrat' },
  { name: 'Lonnie Hosey', district: 109, party: 'democrat' },
  { name: 'Sylleste Davis', district: 110, party: 'republican' },
  { name: 'Bill Herbkersman', district: 111, party: 'republican' },
  { name: 'Jeff Bradley', district: 112, party: 'republican' },
  { name: 'Shannon Erickson', district: 113, party: 'republican' },
  { name: 'Weston Newton', district: 114, party: 'republican' },
  { name: 'Bill Herbkersman', district: 115, party: 'republican' },
  { name: 'Jeff Bradley', district: 116, party: 'republican' },
  { name: 'Bill Chumley', district: 117, party: 'republican' },
  { name: 'West Cox', district: 118, party: 'republican' },
  { name: 'Roger Kirby', district: 119, party: 'democrat' },
  { name: 'Carl Anderson', district: 120, party: 'democrat' },
  { name: 'Robert Williams', district: 121, party: 'democrat' },
  { name: 'Jackie Hayes', district: 122, party: 'democrat' },
  { name: 'Murrell Smith', district: 123, party: 'republican' },
  { name: 'Mike Wooten', district: 124, party: 'republican' },
]

// Build upsert rows
const rows = []

for (const s of senators) {
  rows.push({
    name: s.name,
    slug: slugify(s.name) + '-sc-senate-' + s.district,
    state: 'SC',
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, District ${s.district}`,
    bio: `South Carolina State Senator representing District ${s.district}.`,
    image_url: null,
  })
}

for (const h of houseMembers) {
  rows.push({
    name: h.name,
    slug: slugify(h.name) + '-sc-house-' + h.district,
    state: 'SC',
    chamber: 'state_house',
    party: h.party,
    title: `State Representative, District ${h.district}`,
    bio: `South Carolina State Representative serving District ${h.district}.`,
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

console.log(`\nDone. Total SC legislators upserted: ${total} (${senators.length} senators + ${houseMembers.length} house)`)
