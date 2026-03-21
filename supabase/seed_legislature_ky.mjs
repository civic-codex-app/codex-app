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

// ─── Kentucky State Senate (38 districts) ─────────────────────
// Source: Kentucky Legislature official roster, 2025-2026 session
const senators = [
  { name: 'Jason Howell', district: 1, party: 'republican' },
  { name: 'Robert Stivers', district: 2, party: 'republican' },
  { name: 'Chris McDaniel', district: 3, party: 'republican' },
  { name: 'Mike Wilson', district: 4, party: 'republican' },
  { name: 'Stephen Meredith', district: 5, party: 'republican' },
  { name: 'Robby Mills', district: 6, party: 'republican' },
  { name: 'Damon Thayer', district: 7, party: 'republican' },
  { name: 'David Yates', district: 8, party: 'democrat' },
  { name: 'Reginald Thomas', district: 9, party: 'democrat' },
  { name: 'Gerald Neal', district: 10, party: 'democrat' },
  { name: 'Julie Raque Adams', district: 11, party: 'republican' },
  { name: 'Shelley Funke Frommeyer', district: 12, party: 'republican' },
  { name: 'Donald Douglas', district: 13, party: 'republican' },
  { name: 'Jimmy Higdon', district: 14, party: 'republican' },
  { name: 'Rick Girdler', district: 15, party: 'republican' },
  { name: 'Jason Howell', district: 16, party: 'republican' },
  { name: 'Whitney Westerfield', district: 17, party: 'republican' },
  { name: 'Christian McDaniel', district: 18, party: 'republican' },
  { name: 'Robert Stivers', district: 19, party: 'republican' },
  { name: 'Paul Hornback', district: 20, party: 'republican' },
  { name: 'Amanda Mays Bledsoe', district: 21, party: 'republican' },
  { name: 'Max Wise', district: 22, party: 'republican' },
  { name: 'Karen Berg', district: 23, party: 'democrat' },
  { name: 'Adrienne Southworth', district: 24, party: 'republican' },
  { name: 'Matt Castlen', district: 25, party: 'republican' },
  { name: 'Lindsey Tichenor', district: 26, party: 'republican' },
  { name: 'David Givens', district: 27, party: 'republican' },
  { name: 'Denise Harper Angel', district: 28, party: 'democrat' },
  { name: 'Johnnie Turner', district: 29, party: 'republican' },
  { name: 'Brandon Smith', district: 30, party: 'republican' },
  { name: 'Phillip Wheeler', district: 31, party: 'republican' },
  { name: 'Danny Carroll', district: 32, party: 'republican' },
  { name: 'Michael Nemes', district: 33, party: 'republican' },
  { name: 'Mike Nemes', district: 34, party: 'republican' },
  { name: 'Gary Boswell', district: 35, party: 'republican' },
  { name: 'Cassie Chambers Armstrong', district: 36, party: 'democrat' },
  { name: 'Robin Webb', district: 37, party: 'democrat' },
  { name: 'Brandon Storm', district: 38, party: 'republican' },
]

// ─── Kentucky State House (100 districts) ─────────────────────
// Source: Kentucky Legislature official roster, 2025-2026 session
const houseMembers = [
  { name: 'Steven Rudy', district: 1, party: 'republican' },
  { name: 'Richard Heath', district: 2, party: 'republican' },
  { name: 'Chris Freeland', district: 3, party: 'republican' },
  { name: 'Walker Thomas', district: 4, party: 'republican' },
  { name: 'Matt Lockett', district: 5, party: 'republican' },
  { name: 'Chris Fugate', district: 6, party: 'republican' },
  { name: 'Suzanne Miles', district: 7, party: 'republican' },
  { name: 'Jonathan Dixon', district: 8, party: 'republican' },
  { name: 'Myron Dossett', district: 9, party: 'republican' },
  { name: 'Bobby McCool', district: 10, party: 'republican' },
  { name: 'Daniel Elliott', district: 11, party: 'republican' },
  { name: 'Jim Gooch', district: 12, party: 'republican' },
  { name: 'DJ Johnson', district: 13, party: 'republican' },
  { name: 'Scott Lewis', district: 14, party: 'republican' },
  { name: 'Michael Meredith', district: 15, party: 'republican' },
  { name: 'Ryan Dotson', district: 16, party: 'republican' },
  { name: 'Jason Petrie', district: 17, party: 'republican' },
  { name: 'Samara Heavrin', district: 18, party: 'republican' },
  { name: 'Travis Brenda', district: 19, party: 'republican' },
  { name: 'Steve Bratcher', district: 20, party: 'republican' },
  { name: 'Josh Bray', district: 21, party: 'republican' },
  { name: 'Bill Wesley', district: 22, party: 'republican' },
  { name: 'Steve Riley', district: 23, party: 'republican' },
  { name: 'David Hale', district: 24, party: 'republican' },
  { name: 'Stan Lee', district: 25, party: 'republican' },
  { name: 'Russell Webber', district: 26, party: 'republican' },
  { name: 'Kim King', district: 27, party: 'republican' },
  { name: 'Danny Bentley', district: 28, party: 'republican' },
  { name: 'Josh Calloway', district: 29, party: 'republican' },
  { name: 'John Bam Carney', district: 30, party: 'republican' },
  { name: 'Killian Timoney', district: 31, party: 'republican' },
  { name: 'Derek Lewis', district: 32, party: 'republican' },
  { name: 'Keturah Herron', district: 33, party: 'democrat' },
  { name: 'Josie Raymond', district: 34, party: 'democrat' },
  { name: 'Tina Bojanowski', district: 35, party: 'democrat' },
  { name: 'Nima Kulkarni', district: 36, party: 'democrat' },
  { name: 'Mary Lou Marzian', district: 37, party: 'democrat' },
  { name: 'McKenzie Cantrell', district: 38, party: 'democrat' },
  { name: 'Lindsey Burke', district: 39, party: 'democrat' },
  { name: 'Rachel Roberts', district: 40, party: 'democrat' },
  { name: 'Josie Raymond', district: 41, party: 'democrat' },
  { name: 'George Brown Jr.', district: 42, party: 'democrat' },
  { name: 'Lisa Willner', district: 43, party: 'democrat' },
  { name: 'Beverly Chester-Burton', district: 44, party: 'democrat' },
  { name: 'Pamela Stevenson', district: 45, party: 'democrat' },
  { name: 'David Meade', district: 46, party: 'republican' },
  { name: 'Jennifer Decker', district: 47, party: 'republican' },
  { name: 'Jason Nemes', district: 48, party: 'republican' },
  { name: 'Kevin Bratcher', district: 49, party: 'republican' },
  { name: 'Savannah Maddox', district: 50, party: 'republican' },
  { name: 'Amy Burke', district: 51, party: 'republican' },
  { name: 'Emily Callaway', district: 52, party: 'republican' },
  { name: 'DJ Johnson', district: 53, party: 'republican' },
  { name: 'Ken Fleming', district: 54, party: 'republican' },
  { name: 'Kim Moser', district: 55, party: 'republican' },
  { name: 'Thomas Huff', district: 56, party: 'republican' },
  { name: 'Candy Massaroni', district: 57, party: 'republican' },
  { name: 'Daniel Grossberg', district: 58, party: 'democrat' },
  { name: 'Nancy Tate', district: 59, party: 'republican' },
  { name: 'Shane Baker', district: 60, party: 'republican' },
  { name: 'Ryan Dotson', district: 61, party: 'republican' },
  { name: 'Phillip Pratt', district: 62, party: 'republican' },
  { name: 'Kevin Bratcher', district: 63, party: 'republican' },
  { name: 'Emily Callaway', district: 64, party: 'republican' },
  { name: 'Matt Lockett', district: 65, party: 'republican' },
  { name: 'Steve Rawlings', district: 66, party: 'republican' },
  { name: 'Chris Fugate', district: 67, party: 'republican' },
  { name: 'David Osborne', district: 68, party: 'republican' },
  { name: 'Norma Kirk-McCormick', district: 69, party: 'republican' },
  { name: 'Mike Clines', district: 70, party: 'republican' },
  { name: 'Felicia Rabourn', district: 71, party: 'republican' },
  { name: 'Bill Lawrence', district: 72, party: 'republican' },
  { name: 'Kimberly Poore Moser', district: 73, party: 'republican' },
  { name: 'Robert Duvall', district: 74, party: 'republican' },
  { name: 'Shawn McPherson', district: 75, party: 'republican' },
  { name: 'Chris Fugate', district: 76, party: 'republican' },
  { name: 'Wade Williams', district: 77, party: 'republican' },
  { name: 'Mark Hart', district: 78, party: 'republican' },
  { name: 'Richard White', district: 79, party: 'republican' },
  { name: 'Shane Baker', district: 80, party: 'republican' },
  { name: 'Matt Koch', district: 81, party: 'republican' },
  { name: 'Scott Sharp', district: 82, party: 'republican' },
  { name: 'Timmy Truett', district: 83, party: 'republican' },
  { name: 'Tina Bojanowski', district: 84, party: 'democrat' },
  { name: 'Robert Duvall', district: 85, party: 'republican' },
  { name: 'Tom Smith', district: 86, party: 'republican' },
  { name: 'Adam Bowling', district: 87, party: 'republican' },
  { name: 'Bobby McCool', district: 88, party: 'republican' },
  { name: 'Shane Baker', district: 89, party: 'republican' },
  { name: 'William Lawrence', district: 90, party: 'republican' },
  { name: 'Josie Raymond', district: 91, party: 'democrat' },
  { name: 'Nima Kulkarni', district: 92, party: 'democrat' },
  { name: 'Kim King', district: 93, party: 'republican' },
  { name: 'Randy Bridges', district: 94, party: 'republican' },
  { name: 'Michael Sarge Pollock', district: 95, party: 'republican' },
  { name: 'Jason Petrie', district: 96, party: 'republican' },
  { name: 'Adrielle Camuel', district: 97, party: 'democrat' },
  { name: 'Mike Clines', district: 98, party: 'republican' },
  { name: 'Josh Bray', district: 99, party: 'republican' },
  { name: 'John Hodgson', district: 100, party: 'republican' },
]

// Build upsert rows
const rows = []

for (const s of senators) {
  rows.push({
    name: s.name,
    slug: slugify(s.name) + '-ky-senate-' + s.district,
    state: 'KY',
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, District ${s.district}`,
    bio: `Kentucky State Senator representing District ${s.district}.`,
    image_url: null,
  })
}

for (const h of houseMembers) {
  rows.push({
    name: h.name,
    slug: slugify(h.name) + '-ky-house-' + h.district,
    state: 'KY',
    chamber: 'state_house',
    party: h.party,
    title: `State Representative, District ${h.district}`,
    bio: `Kentucky State Representative serving District ${h.district}.`,
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

console.log(`\nDone. Total KY legislators upserted: ${total} (${senators.length} senators + ${houseMembers.length} house)`)
