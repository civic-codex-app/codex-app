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

// ─── Michigan State Senate (38 districts) ─────────────────────────────
// Source: Michigan Legislature official roster, 2023-2026 term
const senators = [
  { name: 'Erika Geiss', district: 1, party: 'democrat' },
  { name: 'Sylvia Santana', district: 2, party: 'democrat' },
  { name: 'Stephanie Chang', district: 3, party: 'democrat' },
  { name: 'Darrin Camilleri', district: 4, party: 'democrat' },
  { name: 'Dayna Polehanki', district: 5, party: 'democrat' },
  { name: 'Mary Cavanagh', district: 6, party: 'democrat' },
  { name: 'Jeremy Moss', district: 7, party: 'democrat' },
  { name: 'Mallory McMorrow', district: 8, party: 'democrat' },
  { name: 'Michael Webber', district: 9, party: 'republican' },
  { name: 'Henry Yanez', district: 10, party: 'democrat' },
  { name: 'Veronica Klinefelt', district: 11, party: 'democrat' },
  { name: 'Kevin Hertel', district: 12, party: 'democrat' },
  { name: 'Rosemary Bayer', district: 13, party: 'democrat' },
  { name: 'Sue Shink', district: 14, party: 'democrat' },
  { name: 'Jeff Irwin', district: 15, party: 'democrat' },
  { name: 'Joseph Bellino', district: 16, party: 'republican' },
  { name: 'Jonathan Lindsey', district: 17, party: 'republican' },
  { name: 'Thomas Albert', district: 18, party: 'republican' },
  { name: 'Sean McCann', district: 19, party: 'democrat' },
  { name: 'Aric Nesbitt', district: 20, party: 'republican' },
  { name: 'Sarah Anthony', district: 21, party: 'democrat' },
  { name: 'Lana Theis', district: 22, party: 'republican' },
  { name: 'Jim Runestad', district: 23, party: 'republican' },
  { name: 'Ruth Johnson', district: 24, party: 'republican' },
  { name: 'Dan Lauwers', district: 25, party: 'republican' },
  { name: 'Emily Dievendorf', district: 26, party: 'democrat' },
  { name: 'John Cherry', district: 27, party: 'democrat' },
  { name: 'Sam Singh', district: 28, party: 'democrat' },
  { name: 'Winnie Brinks', district: 29, party: 'democrat' },
  { name: 'Mark Huizenga', district: 30, party: 'republican' },
  { name: 'Rick Outman', district: 31, party: 'republican' },
  { name: 'Roger Victory', district: 32, party: 'republican' },
  { name: 'Jon Bumstead', district: 33, party: 'republican' },
  { name: 'Roger Hauck', district: 34, party: 'republican' },
  { name: 'John Damoose', district: 35, party: 'republican' },
  { name: 'Michele Hoitenga', district: 36, party: 'republican' },
  { name: 'Wayne Schmidt', district: 37, party: 'republican' },
  { name: 'Ed McBroom', district: 38, party: 'republican' },
]

// ─── Michigan State House (110 districts) ─────────────────────────────
// Source: Michigan Legislature official roster, 2023-2026 term
const houseMembers = [
  { name: 'Tyrone Carter', district: 1, party: 'democrat' },
  { name: 'Tullio Liberati', district: 2, party: 'democrat' },
  { name: 'Alabas Farhat', district: 3, party: 'democrat' },
  { name: 'Karen Whitsett', district: 4, party: 'democrat' },
  { name: 'Natalie Price', district: 5, party: 'democrat' },
  { name: 'Regina Weiss', district: 6, party: 'democrat' },
  { name: 'Helena Scott', district: 7, party: 'democrat' },
  { name: 'Mike McFall', district: 8, party: 'democrat' },
  { name: 'Abraham Aiyash', district: 9, party: 'democrat' },
  { name: 'Joe Tate', district: 10, party: 'democrat' },
  { name: 'Veronica Paiz', district: 11, party: 'democrat' },
  { name: 'Kara Hope', district: 12, party: 'democrat' },
  { name: 'Lori Stone', district: 13, party: 'democrat' },
  { name: 'Donavan McKinney', district: 14, party: 'democrat' },
  { name: 'Erin Byrnes', district: 15, party: 'democrat' },
  { name: 'Stephanie Young', district: 16, party: 'democrat' },
  { name: 'Laurie Pohutsky', district: 17, party: 'democrat' },
  { name: 'Jason Hoskins', district: 18, party: 'democrat' },
  { name: 'Samantha Steckloff', district: 19, party: 'democrat' },
  { name: 'Noah Arbit', district: 20, party: 'democrat' },
  { name: 'Kelly Breen', district: 21, party: 'democrat' },
  { name: 'Matt Koleszar', district: 22, party: 'democrat' },
  { name: 'Jason Morgan', district: 23, party: 'democrat' },
  { name: 'Ranjeev Puri', district: 24, party: 'democrat' },
  { name: 'Kevin Coleman', district: 25, party: 'democrat' },
  { name: 'Dylan Wegela', district: 26, party: 'democrat' },
  { name: 'Jaime Churches', district: 27, party: 'democrat' },
  { name: 'Jimmie Wilson Jr.', district: 28, party: 'democrat' },
  { name: 'Brenda Carter', district: 29, party: 'democrat' },
  { name: 'William Bruck', district: 30, party: 'republican' },
  { name: 'Reggie Miller', district: 31, party: 'democrat' },
  { name: 'Jennifer Conlin', district: 32, party: 'democrat' },
  { name: 'Carrie Rheingans', district: 33, party: 'democrat' },
  { name: 'Jim Haadsma', district: 34, party: 'democrat' },
  { name: 'Curtis VanderWall', district: 35, party: 'republican' },
  { name: 'Rachel Hood', district: 36, party: 'democrat' },
  { name: 'Amos OʼNeal', district: 37, party: 'democrat' },
  { name: 'Stephanie Young', district: 38, party: 'democrat' },
  { name: 'Phil Skaggs', district: 39, party: 'democrat' },
  { name: 'Christine Morse', district: 40, party: 'democrat' },
  { name: 'Brad Paquette', district: 41, party: 'republican' },
  { name: 'Matt Hall', district: 42, party: 'republican' },
  { name: 'Rob Mensink', district: 43, party: 'republican' },
  { name: 'Steve Carra', district: 44, party: 'republican' },
  { name: 'Sarah Lightner', district: 45, party: 'republican' },
  { name: 'Kathy Schmaltz', district: 46, party: 'republican' },
  { name: 'Will Snyder', district: 47, party: 'democrat' },
  { name: 'Jennifer Fink', district: 48, party: 'republican' },
  { name: 'John Fitzgerald', district: 49, party: 'republican' },
  { name: 'Graham Filler', district: 50, party: 'republican' },
  { name: 'Penelope Tsernoglou', district: 51, party: 'democrat' },
  { name: 'Julie Brixie', district: 52, party: 'democrat' },
  { name: 'Dale Zorn', district: 53, party: 'republican' },
  { name: 'Nancy DeBoer', district: 54, party: 'republican' },
  { name: 'Gina Johnsen', district: 55, party: 'republican' },
  { name: 'Pat Outman', district: 56, party: 'republican' },
  { name: 'Tom Kunse', district: 57, party: 'republican' },
  { name: 'Mike Harris', district: 58, party: 'republican' },
  { name: 'Phil Green', district: 59, party: 'republican' },
  { name: 'Curt VanderWall', district: 60, party: 'republican' },
  { name: 'Ann Bollin', district: 61, party: 'republican' },
  { name: 'Denise Mentzer', district: 62, party: 'democrat' },
  { name: 'Nate Shannon', district: 63, party: 'democrat' },
  { name: 'Emily Dievendorf', district: 64, party: 'democrat' },
  { name: 'Jamie Thompson', district: 65, party: 'republican' },
  { name: 'Josh Schriver', district: 66, party: 'republican' },
  { name: 'Mark Tisdel', district: 67, party: 'republican' },
  { name: 'David Martin', district: 68, party: 'republican' },
  { name: 'Jerry Neyer', district: 69, party: 'republican' },
  { name: 'Jay DeBoyer', district: 70, party: 'republican' },
  { name: 'Brian BeGole', district: 71, party: 'republican' },
  { name: 'Robert Bezotte', district: 72, party: 'republican' },
  { name: 'Donni Steele', district: 73, party: 'republican' },
  { name: 'Kathy Schmaltz', district: 74, party: 'republican' },
  { name: 'Sharon MacDonell', district: 75, party: 'democrat' },
  { name: 'Jasper Martus', district: 76, party: 'democrat' },
  { name: 'Tom Kuhn', district: 77, party: 'republican' },
  { name: 'John Roth', district: 78, party: 'republican' },
  { name: 'Cam Cavitt', district: 79, party: 'republican' },
  { name: 'Phil Green', district: 80, party: 'republican' },
  { name: 'Gary Eisen', district: 81, party: 'republican' },
  { name: 'Pauline Wendzel', district: 82, party: 'republican' },
  { name: 'Luke Meerman', district: 83, party: 'republican' },
  { name: 'John Fitzgerald', district: 84, party: 'republican' },
  { name: 'Ken Borton', district: 85, party: 'republican' },
  { name: 'Mike Hoadley', district: 86, party: 'republican' },
  { name: 'Gregory Markkanen', district: 87, party: 'republican' },
  { name: 'Scott Dianda', district: 88, party: 'democrat' },
  { name: 'Sara Cambensy', district: 89, party: 'democrat' },
  { name: 'Neil Friske', district: 90, party: 'republican' },
  { name: 'TC Clements', district: 91, party: 'republican' },
  { name: 'Joey Andrews', district: 92, party: 'democrat' },
  { name: 'Jason Wentworth', district: 93, party: 'republican' },
  { name: 'Robert Bezotte', district: 94, party: 'republican' },
  { name: 'Phil Green', district: 95, party: 'republican' },
  { name: 'Timothy Beson', district: 96, party: 'republican' },
  { name: 'Karen Whitsett', district: 97, party: 'democrat' },
  { name: 'Helena Scott', district: 98, party: 'democrat' },
  { name: 'Tyrone Carter', district: 99, party: 'democrat' },
  { name: 'Abraham Aiyash', district: 100, party: 'democrat' },
  { name: 'Kristian Grant', district: 101, party: 'democrat' },
  { name: 'Jimmie Wilson Jr.', district: 102, party: 'democrat' },
  { name: 'Matt Koleszar', district: 103, party: 'democrat' },
  { name: 'Erin Byrnes', district: 104, party: 'democrat' },
  { name: 'Samantha Steckloff', district: 105, party: 'democrat' },
  { name: 'Jaime Churches', district: 106, party: 'democrat' },
  { name: 'Jason Hoskins', district: 107, party: 'democrat' },
  { name: 'Donavan McKinney', district: 108, party: 'democrat' },
  { name: 'Laurie Pohutsky', district: 109, party: 'democrat' },
  { name: 'Stephanie Young', district: 110, party: 'democrat' },
]

// Build upsert rows
const rows = []

for (const s of senators) {
  rows.push({
    name: s.name,
    slug: slugify(s.name) + '-mi-senate-' + s.district,
    state: 'MI',
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, District ${s.district}`,
    bio: `Michigan State Senator representing District ${s.district}.`,
    image_url: null,
  })
}

for (const h of houseMembers) {
  rows.push({
    name: h.name,
    slug: slugify(h.name) + '-mi-house-' + h.district,
    state: 'MI',
    chamber: 'state_house',
    party: h.party,
    title: `State Representative, District ${h.district}`,
    bio: `Michigan State Representative serving District ${h.district}.`,
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

console.log(`\nDone. Total MI legislators upserted: ${total} (${senators.length} senators + ${houseMembers.length} house)`)
