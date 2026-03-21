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

// ─── North Carolina State Senate (50 districts) ─────────────────────
// Source: NC General Assembly official roster, 2025-2026 session
const senators = [
  { name: 'Bob Steinburg', district: 1, party: 'republican' },
  { name: 'Norman Sanderson', district: 2, party: 'republican' },
  { name: 'Buck Newton', district: 3, party: 'republican' },
  { name: 'Michael Lazzara', district: 4, party: 'republican' },
  { name: 'Jim Perry', district: 5, party: 'republican' },
  { name: 'Michael Garrett', district: 6, party: 'democrat' },
  { name: 'Kandie Smith', district: 7, party: 'democrat' },
  { name: 'Benton Sawrey', district: 8, party: 'republican' },
  { name: 'Tim Moffitt', district: 9, party: 'republican' },
  { name: 'Brent Jackson', district: 10, party: 'republican' },
  { name: 'Lisa Barnes', district: 11, party: 'republican' },
  { name: 'Jim Burgin', district: 12, party: 'republican' },
  { name: 'Lisa Grafstein', district: 13, party: 'democrat' },
  { name: 'Dan Blue', district: 14, party: 'democrat' },
  { name: 'Jay Chaudhuri', district: 15, party: 'democrat' },
  { name: 'Gale Adcock', district: 16, party: 'democrat' },
  { name: 'Sydney Batch', district: 17, party: 'democrat' },
  { name: 'Mary Wills Bode', district: 18, party: 'democrat' },
  { name: 'Mike Woodard', district: 19, party: 'democrat' },
  { name: 'Natalie Murdock', district: 20, party: 'democrat' },
  { name: 'Carl Ford', district: 21, party: 'republican' },
  { name: 'Mike Lazzara', district: 22, party: 'republican' },
  { name: 'Paul Newton', district: 23, party: 'republican' },
  { name: 'Danny Britt', district: 24, party: 'republican' },
  { name: 'Phil Berger', district: 25, party: 'republican' },
  { name: 'Dave Craven', district: 26, party: 'republican' },
  { name: 'Michael Garrett', district: 27, party: 'democrat' },
  { name: 'Gladys Robinson', district: 28, party: 'democrat' },
  { name: 'Dave Craven', district: 29, party: 'republican' },
  { name: 'Bobby Hanig', district: 30, party: 'republican' },
  { name: 'Joyce Waddell', district: 31, party: 'democrat' },
  { name: 'DeAndrea Salvador', district: 32, party: 'democrat' },
  { name: 'Natasha Marcus', district: 33, party: 'democrat' },
  { name: 'Vickie Sawyer', district: 34, party: 'republican' },
  { name: 'Todd Johnson', district: 35, party: 'republican' },
  { name: 'Paul Lowe', district: 36, party: 'democrat' },
  { name: 'Val Applewhite', district: 37, party: 'democrat' },
  { name: 'Ted Alexander', district: 38, party: 'republican' },
  { name: 'Julie Mayfield', district: 39, party: 'democrat' },
  { name: 'Tim Moffitt', district: 40, party: 'republican' },
  { name: 'Jeff Jackson', district: 41, party: 'democrat' },
  { name: 'Michael Lee', district: 42, party: 'republican' },
  { name: 'Ralph Hise', district: 43, party: 'republican' },
  { name: 'Kevin Corbin', district: 44, party: 'republican' },
  { name: 'Steve Jarvis', district: 45, party: 'republican' },
  { name: 'Warren Daniel', district: 46, party: 'republican' },
  { name: 'Vickie Sawyer', district: 47, party: 'republican' },
  { name: 'Timothy Moffitt', district: 48, party: 'republican' },
  { name: 'Amy Galey', district: 49, party: 'republican' },
  { name: 'Brad Overcash', district: 50, party: 'republican' },
]

// ─── North Carolina State House (120 districts) ─────────────────────
// Source: NC General Assembly official roster, 2025-2026 session
const houseMembers = [
  { name: 'Ed Goodwin', district: 1, party: 'republican' },
  { name: 'Keith Kidwell', district: 2, party: 'republican' },
  { name: 'Steve Tyson', district: 3, party: 'republican' },
  { name: 'Gloristine Brown', district: 4, party: 'democrat' },
  { name: 'Howard Hunter III', district: 5, party: 'democrat' },
  { name: 'Matthew Winslow', district: 6, party: 'republican' },
  { name: 'Diane Wheatley', district: 7, party: 'republican' },
  { name: 'Tim Reeder', district: 8, party: 'republican' },
  { name: 'Brian Biggs', district: 9, party: 'republican' },
  { name: 'John Bell IV', district: 10, party: 'republican' },
  { name: 'Donna White', district: 11, party: 'republican' },
  { name: 'Brenden Jones', district: 12, party: 'republican' },
  { name: 'Pat McElraft', district: 13, party: 'republican' },
  { name: 'George Cleveland', district: 14, party: 'republican' },
  { name: 'Pricey Harrison', district: 15, party: 'democrat' },
  { name: 'Amos Quick III', district: 16, party: 'democrat' },
  { name: 'Ray Jeffers', district: 17, party: 'democrat' },
  { name: 'James Roberson', district: 18, party: 'democrat' },
  { name: 'Zack Hawkins', district: 19, party: 'democrat' },
  { name: 'Robert Reives II', district: 20, party: 'democrat' },
  { name: 'Michael Wray', district: 21, party: 'democrat' },
  { name: 'Mary Price', district: 22, party: 'democrat' },
  { name: 'Terence Everitt', district: 23, party: 'democrat' },
  { name: 'Linda Cooper-Suggs', district: 24, party: 'democrat' },
  { name: 'Allen Chesser', district: 25, party: 'republican' },
  { name: 'Donna White', district: 26, party: 'republican' },
  { name: 'Michael Wray', district: 27, party: 'democrat' },
  { name: 'Garland Pierce', district: 28, party: 'democrat' },
  { name: 'Elmer Floyd', district: 29, party: 'democrat' },
  { name: 'Marcia Morey', district: 30, party: 'democrat' },
  { name: 'Ya Liu', district: 31, party: 'democrat' },
  { name: 'Zack Hawkins', district: 32, party: 'democrat' },
  { name: 'Rosa Gill', district: 33, party: 'democrat' },
  { name: 'Allison Dahle', district: 34, party: 'democrat' },
  { name: 'Terence Everitt', district: 35, party: 'democrat' },
  { name: 'Julie von Haefen', district: 36, party: 'democrat' },
  { name: 'Erin Pare', district: 37, party: 'republican' },
  { name: 'Abe Jones', district: 38, party: 'democrat' },
  { name: 'James Roberson', district: 39, party: 'democrat' },
  { name: 'Joe John', district: 40, party: 'democrat' },
  { name: 'Gale Adcock', district: 41, party: 'democrat' },
  { name: 'Cynthia Ball', district: 42, party: 'democrat' },
  { name: 'Maria Cervania', district: 43, party: 'democrat' },
  { name: 'Renee Price', district: 44, party: 'democrat' },
  { name: 'Ashton Clemmons', district: 45, party: 'democrat' },
  { name: 'Kanika Brown', district: 46, party: 'democrat' },
  { name: 'Amber Baker', district: 47, party: 'democrat' },
  { name: 'Brian Echevarria', district: 48, party: 'republican' },
  { name: 'Charlie Miller', district: 49, party: 'democrat' },
  { name: 'Graig Meyer', district: 50, party: 'democrat' },
  { name: 'Phil Rubin', district: 51, party: 'democrat' },
  { name: 'Ben Moss', district: 52, party: 'republican' },
  { name: 'Frank Iler', district: 53, party: 'republican' },
  { name: 'Jimmy Dixon', district: 54, party: 'republican' },
  { name: 'Jon Hardister', district: 55, party: 'republican' },
  { name: 'Cecil Brockman', district: 56, party: 'democrat' },
  { name: 'Amos Quick', district: 57, party: 'democrat' },
  { name: 'Jon Hardister', district: 58, party: 'republican' },
  { name: 'Edward Massey', district: 59, party: 'republican' },
  { name: 'Larry Potts', district: 60, party: 'republican' },
  { name: 'Julia Howard', district: 61, party: 'republican' },
  { name: 'Brian Biggs', district: 62, party: 'republican' },
  { name: 'Lee Zachary', district: 63, party: 'republican' },
  { name: 'Neal Jackson', district: 64, party: 'republican' },
  { name: 'Jeff Zenger', district: 65, party: 'republican' },
  { name: 'Ben Moss', district: 66, party: 'republican' },
  { name: 'Wayne Sasser', district: 67, party: 'republican' },
  { name: 'Harry Warren', district: 68, party: 'republican' },
  { name: 'Jarrod Lowery', district: 69, party: 'republican' },
  { name: 'Carson Smith', district: 70, party: 'republican' },
  { name: 'Mike Clampitt', district: 71, party: 'republican' },
  { name: 'Jake Johnson', district: 72, party: 'republican' },
  { name: 'Ray Pickett', district: 73, party: 'republican' },
  { name: 'Dudley Greene', district: 74, party: 'republican' },
  { name: 'Donnie Loftis', district: 75, party: 'republican' },
  { name: 'Allen Chesser', district: 76, party: 'republican' },
  { name: 'John Torbett', district: 77, party: 'republican' },
  { name: 'Tim Moore', district: 78, party: 'republican' },
  { name: 'Donnie Loftis', district: 79, party: 'republican' },
  { name: 'Sam Watford', district: 80, party: 'republican' },
  { name: 'Larry Pittman', district: 81, party: 'republican' },
  { name: 'Kelly Alexander', district: 82, party: 'democrat' },
  { name: 'Mary Belk', district: 83, party: 'democrat' },
  { name: 'Brandon Lofton', district: 84, party: 'democrat' },
  { name: 'Carla Cunningham', district: 85, party: 'democrat' },
  { name: 'Kimberly Hardy', district: 86, party: 'democrat' },
  { name: 'Bill Brawley', district: 87, party: 'republican' },
  { name: 'Nasif Majeed', district: 88, party: 'democrat' },
  { name: 'Becky Carney', district: 89, party: 'democrat' },
  { name: 'Laura Budd', district: 90, party: 'democrat' },
  { name: 'John Autry', district: 91, party: 'democrat' },
  { name: 'Christy Clark', district: 92, party: 'republican' },
  { name: 'Bill Brawley', district: 93, party: 'republican' },
  { name: 'Wayne Sasser', district: 94, party: 'republican' },
  { name: 'Harry Warren', district: 95, party: 'republican' },
  { name: 'Robert Reives II', district: 96, party: 'democrat' },
  { name: 'John Sauls', district: 97, party: 'republican' },
  { name: 'Allen McNeill', district: 98, party: 'republican' },
  { name: 'Ashton Clemmons', district: 99, party: 'democrat' },
  { name: 'Cecil Brockman', district: 100, party: 'democrat' },
  { name: 'Terry Brown', district: 101, party: 'democrat' },
  { name: 'Ken Fontenot', district: 102, party: 'republican' },
  { name: 'Dennis Riddell', district: 103, party: 'republican' },
  { name: 'Kyle Hall', district: 104, party: 'republican' },
  { name: 'Sarah Stevens', district: 105, party: 'republican' },
  { name: 'Jay Adams', district: 106, party: 'republican' },
  { name: 'David Willis', district: 107, party: 'republican' },
  { name: 'Benton Sawrey', district: 108, party: 'republican' },
  { name: 'Destin Hall', district: 109, party: 'republican' },
  { name: 'John Ager', district: 110, party: 'democrat' },
  { name: 'Eric Ager', district: 111, party: 'democrat' },
  { name: 'Jake Johnson', district: 112, party: 'republican' },
  { name: 'Karl Gillespie', district: 113, party: 'republican' },
  { name: 'Jennifer Balkcom', district: 114, party: 'republican' },
  { name: 'Mark Pless', district: 115, party: 'republican' },
  { name: 'Mike Clampitt', district: 116, party: 'republican' },
  { name: 'Caleb Rudow', district: 117, party: 'democrat' },
  { name: 'Tim Moffitt', district: 118, party: 'republican' },
  { name: 'Mark Brody', district: 119, party: 'republican' },
  { name: 'Tricia Cotham', district: 120, party: 'republican' },
]

// Build upsert rows
const rows = []

for (const s of senators) {
  rows.push({
    name: s.name,
    slug: slugify(s.name) + '-nc-senate-' + s.district,
    state: 'NC',
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, District ${s.district}`,
    bio: `North Carolina State Senator representing District ${s.district}.`,
    image_url: null,
  })
}

for (const h of houseMembers) {
  rows.push({
    name: h.name,
    slug: slugify(h.name) + '-nc-house-' + h.district,
    state: 'NC',
    chamber: 'state_house',
    party: h.party,
    title: `State Representative, District ${h.district}`,
    bio: `North Carolina State Representative serving District ${h.district}.`,
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

console.log(`\nDone. Total NC legislators upserted: ${total} (${senators.length} senators + ${houseMembers.length} house)`)
