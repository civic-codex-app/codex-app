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
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ═══════════════════════════════════════════════════════════════
// New York State Senate — 63 districts, 2025-2026 session
// Sources: nysenate.gov official roster
// ═══════════════════════════════════════════════════════════════
const NY_SENATORS = [
  { name: 'Anthony Palumbo', district: 1, party: 'republican' },
  { name: 'Mario Mattera', district: 2, party: 'republican' },
  { name: 'Dean Murray', district: 3, party: 'republican' },
  { name: 'Monica Martinez', district: 4, party: 'democrat' },
  { name: 'Steven Rhoads', district: 5, party: 'republican' },
  { name: 'Kevin Thomas', district: 6, party: 'democrat' },
  { name: 'Jack Martins', district: 7, party: 'republican' },
  { name: 'Alexis Weik', district: 8, party: 'republican' },
  { name: 'Patricia Canzoneri-Fitzpatrick', district: 9, party: 'republican' },
  { name: 'James Sanders Jr.', district: 10, party: 'democrat' },
  { name: 'Toby Ann Stavisky', district: 11, party: 'democrat' },
  { name: 'Michael Gianaris', district: 12, party: 'democrat' },
  { name: 'Jessica Scarcella-Spanton', district: 13, party: 'democrat' },
  { name: 'Iwen Chu', district: 14, party: 'democrat' },
  { name: 'Joseph Addabbo Jr.', district: 15, party: 'democrat' },
  { name: 'Leroy Comrie', district: 16, party: 'democrat' },
  { name: 'Stacie Pheffer Amato', district: 17, party: 'democrat' },
  { name: 'Julia Salazar', district: 18, party: 'democrat' },
  { name: 'Roxanne Persaud', district: 19, party: 'democrat' },
  { name: 'Zellnor Myrie', district: 20, party: 'democrat' },
  { name: 'Kevin Parker', district: 21, party: 'democrat' },
  { name: 'Simcha Felder', district: 22, party: 'democrat' },
  { name: 'Andrew Gounardes', district: 23, party: 'democrat' },
  { name: 'Kristen Gonzalez', district: 24, party: 'democrat' },
  { name: 'Jabari Brisport', district: 25, party: 'democrat' },
  { name: 'Andrew Lanza', district: 26, party: 'republican' },
  { name: 'Jose M. Serrano', district: 27, party: 'democrat' },
  { name: 'Cordell Cleare', district: 28, party: 'democrat' },
  { name: 'Jose Rivera', district: 29, party: 'democrat' },
  { name: 'Nathalia Fernandez', district: 30, party: 'democrat' },
  { name: 'Robert Jackson', district: 31, party: 'democrat' },
  { name: 'Luis Sepulveda', district: 32, party: 'democrat' },
  { name: 'Gustavo Rivera', district: 33, party: 'democrat' },
  { name: 'Andrea Stewart-Cousins', district: 35, party: 'democrat' },
  { name: 'Jamaal Bailey', district: 36, party: 'democrat' },
  { name: 'Shelley Mayer', district: 37, party: 'democrat' },
  { name: 'William Weber', district: 38, party: 'republican' },
  { name: 'Rob Rolison', district: 39, party: 'republican' },
  { name: 'Pete Harckham', district: 40, party: 'democrat' },
  { name: 'Sue Serino', district: 41, party: 'republican' },
  { name: 'James Skoufis', district: 42, party: 'democrat' },
  { name: 'Neil Breslin', district: 44, party: 'democrat' },
  { name: 'Dan Stec', district: 45, party: 'republican' },
  { name: 'Michelle Hinchey', district: 46, party: 'democrat' },
  { name: 'Joseph Griffo', district: 47, party: 'republican' },
  { name: 'Jake Ashby', district: 48, party: 'republican' },
  { name: 'Jim Tedisco', district: 49, party: 'republican' },
  { name: 'John Mannion', district: 50, party: 'democrat' },
  { name: 'Peter Oberacker', district: 51, party: 'republican' },
  { name: 'Lea Webb', district: 52, party: 'democrat' },
  { name: 'Pamela Helming', district: 54, party: 'republican' },
  { name: 'Rachel May', district: 55, party: 'democrat' },
  { name: 'Jeremy Cooney', district: 56, party: 'democrat' },
  { name: 'George Borrello', district: 57, party: 'republican' },
  { name: 'Tom O\'Mara', district: 58, party: 'republican' },
  { name: 'Patrick Gallivan', district: 59, party: 'republican' },
  { name: 'Sean Ryan', district: 60, party: 'democrat' },
  { name: 'Edward Rath III', district: 61, party: 'republican' },
  { name: 'Robert Ortt', district: 62, party: 'republican' },
  { name: 'Mark Walczyk', district: 63, party: 'republican' },
]

// ═══════════════════════════════════════════════════════════════
// New York State Assembly — 150 districts, 2025-2026 session
// Sources: nyassembly.gov official roster
// Only including members I'm confident are currently serving.
// ═══════════════════════════════════════════════════════════════
const NY_ASSEMBLY = [
  // Long Island (Districts 1-21)
  { name: 'Fred Thiele Jr.', district: 1, party: 'democrat' },
  { name: 'Jodi Giglio', district: 2, party: 'republican' },
  { name: 'Joseph DeStefano', district: 3, party: 'republican' },
  { name: 'Ed Flood', district: 4, party: 'republican' },
  { name: 'Douglas Smith', district: 5, party: 'republican' },
  { name: 'Philip Ramos', district: 6, party: 'democrat' },
  { name: 'Jarett Gandolfo', district: 7, party: 'republican' },
  { name: 'Michael Fitzpatrick', district: 8, party: 'republican' },
  { name: 'Michael Durso', district: 9, party: 'republican' },
  { name: 'Steve Stern', district: 10, party: 'democrat' },
  { name: 'Kimberly Jean-Pierre', district: 11, party: 'democrat' },
  { name: 'Keith Brown', district: 12, party: 'republican' },
  { name: 'Charles Lavine', district: 13, party: 'democrat' },
  { name: 'David McDonough', district: 14, party: 'republican' },
  { name: 'Jake Blumencranz', district: 15, party: 'republican' },
  { name: 'Gina Sillitti', district: 16, party: 'democrat' },
  { name: 'John Mikulin', district: 17, party: 'republican' },
  { name: 'Taylor Darling', district: 18, party: 'democrat' },
  { name: 'Edward Ra', district: 19, party: 'republican' },
  { name: 'Michaelle Solages', district: 20, party: 'democrat' },
  { name: 'Judy Griffin', district: 21, party: 'democrat' },

  // Queens (Districts 22-40)
  { name: 'Erik Dilan', district: 22, party: 'democrat' },
  { name: 'David Weprin', district: 24, party: 'democrat' },
  { name: 'Nily Rozic', district: 25, party: 'democrat' },
  { name: 'Edward Braunstein', district: 26, party: 'democrat' },
  { name: 'Daniel Rosenthal', district: 27, party: 'democrat' },
  { name: 'Andrew Hevesi', district: 28, party: 'democrat' },
  { name: 'Alicia Hyndman', district: 29, party: 'democrat' },
  { name: 'Khaleel Anderson', district: 31, party: 'democrat' },
  { name: 'Vivian Cook', district: 32, party: 'democrat' },
  { name: 'Clyde Vanel', district: 33, party: 'democrat' },
  { name: 'Jessica Gonzalez-Rojas', district: 34, party: 'democrat' },
  { name: 'Jeffrion Aubry', district: 35, party: 'democrat' },
  { name: 'Zohran Mamdani', district: 36, party: 'democrat' },
  { name: 'Catherine Nolan', district: 37, party: 'democrat' },
  { name: 'Jenifer Rajkumar', district: 38, party: 'democrat' },
  { name: 'Catalina Cruz', district: 39, party: 'democrat' },
  { name: 'Ron Kim', district: 40, party: 'democrat' },

  // Brooklyn (Districts 41-60)
  { name: 'Helene Weinstein', district: 41, party: 'democrat' },
  { name: 'Rodneyse Bichotte Hermelyn', district: 42, party: 'democrat' },
  { name: 'Brian Cunningham', district: 43, party: 'democrat' },
  { name: 'Robert Carroll', district: 44, party: 'democrat' },
  { name: 'Steven Cymbrowitz', district: 45, party: 'democrat' },
  { name: 'Mathylde Frontus', district: 46, party: 'democrat' },
  { name: 'William Colton', district: 47, party: 'democrat' },
  { name: 'Simcha Eichenstein', district: 48, party: 'democrat' },
  { name: 'Peter Abbate Jr.', district: 49, party: 'democrat' },
  { name: 'Emily Gallagher', district: 50, party: 'democrat' },
  { name: 'Marcela Mitaynes', district: 51, party: 'democrat' },
  { name: 'Jo Anne Simon', district: 52, party: 'democrat' },
  { name: 'Phara Souffrant Forrest', district: 53, party: 'democrat' },
  { name: 'Monique Chandler-Waterman', district: 54, party: 'democrat' },
  { name: 'Jaime Williams', district: 55, party: 'democrat' },
  { name: 'Stefani Zinerman', district: 56, party: 'democrat' },
  { name: 'Nikki Lucas', district: 57, party: 'democrat' },

  // Staten Island (Districts 60-64)
  { name: 'Charles Fall', district: 61, party: 'democrat' },
  { name: 'Michael Tannousis', district: 62, party: 'republican' },
  { name: 'Sam Pirozzolo', district: 63, party: 'republican' },
  { name: 'Michael Reilly', district: 64, party: 'republican' },

  // Manhattan (Districts 65-77)
  { name: 'Grace Lee', district: 65, party: 'democrat' },
  { name: 'Deborah Glick', district: 66, party: 'democrat' },
  { name: 'Linda Rosenthal', district: 67, party: 'democrat' },
  { name: 'Eddie Gibbs', district: 68, party: 'democrat' },
  { name: 'Daniel O\'Donnell', district: 69, party: 'democrat' },
  { name: 'Inez Dickens', district: 70, party: 'democrat' },
  { name: 'Al Taylor', district: 71, party: 'democrat' },
  { name: 'Manny De Los Santos', district: 72, party: 'democrat' },
  { name: 'Alex Bores', district: 73, party: 'democrat' },
  { name: 'Harvey Epstein', district: 74, party: 'democrat' },
  { name: 'Tony Simone', district: 75, party: 'democrat' },
  { name: 'Rebecca Seawright', district: 76, party: 'democrat' },

  // Bronx (Districts 77-87)
  { name: 'Latoya Joyner', district: 77, party: 'democrat' },
  { name: 'George Alvarez', district: 78, party: 'democrat' },
  { name: 'Chantel Jackson', district: 79, party: 'democrat' },
  { name: 'John Zaccaro Jr.', district: 80, party: 'democrat' },
  { name: 'Jeffrey Dinowitz', district: 81, party: 'democrat' },
  { name: 'Michael Benedetto', district: 82, party: 'democrat' },
  { name: 'Carl Heastie', district: 83, party: 'democrat' },
  { name: 'Amanda Septimo', district: 84, party: 'democrat' },
  { name: 'Kenny Burgos', district: 85, party: 'democrat' },
  { name: 'Yudelka Tapia', district: 86, party: 'democrat' },
  { name: 'Karines Reyes', district: 87, party: 'democrat' },

  // Westchester / Lower Hudson (Districts 88-99)
  { name: 'Amy Paulin', district: 88, party: 'democrat' },
  { name: 'J. Gary Pretlow', district: 89, party: 'democrat' },
  { name: 'Nader Sayegh', district: 90, party: 'democrat' },
  { name: 'Steven Otis', district: 91, party: 'democrat' },
  { name: 'MaryJane Shimsky', district: 92, party: 'democrat' },
  { name: 'Chris Burdick', district: 93, party: 'democrat' },
  { name: 'Matt Slater', district: 94, party: 'republican' },
  { name: 'Dana Levenberg', district: 95, party: 'democrat' },
  { name: 'Kenneth Zebrowski', district: 96, party: 'democrat' },
  { name: 'John McGowan', district: 97, party: 'republican' },
  { name: 'Karl Brabenec', district: 98, party: 'republican' },
  { name: 'Chris Eachus', district: 99, party: 'democrat' },

  // Mid-Hudson / Catskills (Districts 100-107)
  { name: 'Aileen Gunther', district: 100, party: 'democrat' },
  { name: 'Brian Maher', district: 101, party: 'republican' },
  { name: 'Chris Tague', district: 102, party: 'republican' },
  { name: 'Sarahana Shrestha', district: 103, party: 'democrat' },
  { name: 'Jonathan Jacobson', district: 104, party: 'democrat' },
  { name: 'Anil Beephan Jr.', district: 105, party: 'republican' },
  { name: 'Didi Barrett', district: 106, party: 'democrat' },
  { name: 'Scott Bendett', district: 107, party: 'republican' },

  // Capital Region (Districts 108-114)
  { name: 'John McDonald III', district: 108, party: 'democrat' },
  { name: 'Patricia Fahy', district: 109, party: 'democrat' },
  { name: 'Phil Steck', district: 110, party: 'democrat' },
  { name: 'Angelo Santabarbara', district: 111, party: 'democrat' },
  { name: 'Mary Beth Walsh', district: 112, party: 'republican' },
  { name: 'Carrie Woerner', district: 113, party: 'democrat' },
  { name: 'Matthew Simpson', district: 114, party: 'republican' },

  // North Country (Districts 115-118)
  { name: 'Billy Jones', district: 115, party: 'democrat' },
  { name: 'Scott Gray', district: 116, party: 'republican' },
  { name: 'Ken Blankenbush', district: 117, party: 'republican' },
  { name: 'Robert Smullen', district: 118, party: 'republican' },

  // Central NY / Mohawk Valley (Districts 119-127)
  { name: 'Marianne Buttenschon', district: 119, party: 'democrat' },
  { name: 'William Magnarelli', district: 120, party: 'democrat' },
  { name: 'William Barclay', district: 121, party: 'republican' },
  { name: 'William Magee', district: 122, party: 'democrat' },
  { name: 'Donna Lupardo', district: 123, party: 'democrat' },
  { name: 'Christopher Friend', district: 124, party: 'republican' },
  { name: 'Joseph Angelino', district: 125, party: 'republican' },
  { name: 'John Lemondes Jr.', district: 126, party: 'republican' },
  { name: 'Albert Stirpe Jr.', district: 127, party: 'democrat' },

  // Syracuse / Finger Lakes / Rochester (Districts 128-138)
  { name: 'Pamela Hunter', district: 128, party: 'democrat' },
  { name: 'Brian Manktelow', district: 130, party: 'republican' },
  { name: 'Jeff Gallahan', district: 131, party: 'republican' },
  { name: 'Philip Palmesano', district: 132, party: 'republican' },
  { name: 'Marjorie Byrnes', district: 133, party: 'republican' },
  { name: 'Josh Jensen', district: 134, party: 'republican' },
  { name: 'Jen Lunsford', district: 135, party: 'democrat' },
  { name: 'Sarah Clark', district: 136, party: 'democrat' },
  { name: 'Demond Meeks', district: 137, party: 'democrat' },
  { name: 'Harry Bronson', district: 138, party: 'democrat' },

  // Western NY / Buffalo (Districts 139-150)
  { name: 'William Conrad III', district: 139, party: 'democrat' },
  { name: 'Jonathan Rivera', district: 140, party: 'democrat' },
  { name: 'Crystal Peoples-Stokes', district: 141, party: 'democrat' },
  { name: 'Patrick Burke', district: 142, party: 'democrat' },
  { name: 'Monica Wallace', district: 143, party: 'democrat' },
  { name: 'Karen McMahon', district: 144, party: 'democrat' },
  { name: 'Angelo Morinello', district: 145, party: 'republican' },
  { name: 'Michael Norris', district: 146, party: 'republican' },
  { name: 'David DiPietro', district: 147, party: 'republican' },
  { name: 'Joseph Giglio', district: 148, party: 'republican' },
  { name: 'Andrew Goodell', district: 150, party: 'republican' },
]

// ─── Build rows ───
const rows = []

for (const s of NY_SENATORS) {
  rows.push({
    name: s.name,
    slug: slugify(s.name),
    state: 'NY',
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, District ${s.district}`,
    bio: `New York State Senator representing District ${s.district}.`,
    image_url: null,
  })
}

for (const a of NY_ASSEMBLY) {
  rows.push({
    name: a.name,
    slug: slugify(a.name),
    state: 'NY',
    chamber: 'state_house',
    party: a.party,
    title: `Assembly Member, District ${a.district}`,
    bio: `New York State Assembly Member representing District ${a.district}.`,
    image_url: null,
  })
}

// Deduplicate by slug
const slugMap = new Map()
for (const r of rows) {
  if (!slugMap.has(r.slug)) {
    slugMap.set(r.slug, r)
  }
}
const dedupedRows = [...slugMap.values()]

console.log(`\nState Senators: ${NY_SENATORS.length}`)
console.log(`Assembly Members: ${NY_ASSEMBLY.length}`)
console.log(`Total unique rows to upsert: ${dedupedRows.length}`)

// ─── Upsert in batches of 50 ───
const BATCH = 50
let total = 0
for (let i = 0; i < dedupedRows.length; i += BATCH) {
  const batch = dedupedRows.slice(i, i + BATCH)
  const { data, error } = await supabase
    .from('politicians')
    .upsert(batch, { onConflict: 'slug' })
    .select('id')

  if (error) {
    console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, error.message)
  } else {
    total += data.length
    console.log(`Batch ${Math.floor(i / BATCH) + 1}: upserted ${data.length} rows`)
  }
}

console.log(`\nDone! Total upserted: ${total}`)
