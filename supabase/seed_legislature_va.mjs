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

// ─── Virginia State Senate (40 members) ───────────────────────────────
const vaSenators = [
  { name: 'George Barker', district: 1, party: 'democrat' },
  { name: 'Mamie Locke', district: 2, party: 'democrat' },
  { name: 'Monty Mason', district: 3, party: 'democrat' },
  { name: 'Aaron Rouse', district: 4, party: 'democrat' },
  { name: 'Lynwood Lewis', district: 5, party: 'democrat' },
  { name: 'John Cosgrove', district: 6, party: 'republican' },
  { name: 'Suhas Subramanyam', district: 7, party: 'democrat' },
  { name: 'Schuyler VanValkenburg', district: 8, party: 'democrat' },
  { name: 'Jennifer Boysko', district: 9, party: 'democrat' },
  { name: 'Saddam Salim', district: 10, party: 'democrat' },
  { name: 'Ghazala Hashmi', district: 11, party: 'democrat' },
  { name: 'Angelia Williams Graves', district: 12, party: 'democrat' },
  { name: 'Stella Pekarsky', district: 13, party: 'democrat' },
  { name: 'Russet Perry', district: 14, party: 'democrat' },
  { name: 'Danica Roem', district: 15, party: 'democrat' },
  { name: 'L. Louise Lucas', district: 16, party: 'democrat' },
  { name: 'Emily Jordan', district: 17, party: 'republican' },
  { name: 'Travis Hackworth', district: 18, party: 'republican' },
  { name: 'Todd Pillion', district: 19, party: 'republican' },
  { name: 'Bill Stanley', district: 20, party: 'republican' },
  { name: 'David Suetterlein', district: 21, party: 'republican' },
  { name: 'David Marsden', district: 22, party: 'democrat' },
  { name: 'Mark Obenshain', district: 23, party: 'republican' },
  { name: 'Mark Peake', district: 24, party: 'republican' },
  { name: 'Creigh Deeds', district: 25, party: 'democrat' },
  { name: 'Lashrecse Aird', district: 26, party: 'democrat' },
  { name: 'Richard Stuart', district: 27, party: 'republican' },
  { name: 'Bryce Reeves', district: 28, party: 'republican' },
  { name: 'Jeremy McPike', district: 29, party: 'democrat' },
  { name: 'Adam Ebbin', district: 30, party: 'democrat' },
  { name: 'Scott Surovell', district: 31, party: 'democrat' },
  { name: 'Janet Howell', district: 32, party: 'democrat' },
  { name: 'Jennifer McClellan', district: 33, party: 'democrat' },
  { name: 'John McGuire', district: 34, party: 'republican' },
  { name: 'Ryan McDougle', district: 35, party: 'republican' },
  { name: 'Siobhan Dunnavant', district: 36, party: 'republican' },
  { name: 'Dave Favola', district: 37, party: 'democrat' },
  { name: 'Jill Vogel', district: 38, party: 'republican' },
  { name: 'Tara Durant', district: 39, party: 'republican' },
  { name: 'Chap Petersen', district: 40, party: 'democrat' },
]

// ─── Virginia House of Delegates (100 members) ───────────────────────
const vaDelegates = [
  { name: 'Nadarius Clark', district: 1, party: 'democrat' },
  { name: 'Jackie Glass', district: 2, party: 'democrat' },
  { name: 'Phil Hernandez', district: 3, party: 'democrat' },
  { name: 'Don Scott', district: 4, party: 'democrat' },
  { name: 'Alex Askew', district: 5, party: 'democrat' },
  { name: 'Bonita Anthony', district: 6, party: 'democrat' },
  { name: 'Karen Greenhalgh', district: 7, party: 'republican' },
  { name: 'Kelly Convirs-Fowler', district: 8, party: 'democrat' },
  { name: 'Clint Jenkins', district: 9, party: 'democrat' },
  { name: 'Michael Feggans', district: 10, party: 'democrat' },
  { name: 'Amanda Batten', district: 11, party: 'republican' },
  { name: 'Cia Price', district: 12, party: 'democrat' },
  { name: 'Shelly Simonds', district: 13, party: 'democrat' },
  { name: 'Danny Marshall', district: 14, party: 'republican' },
  { name: 'Anne Ferrell Tata', district: 15, party: 'republican' },
  { name: 'Kim Taylor', district: 16, party: 'republican' },
  { name: 'Emily Brewer', district: 17, party: 'republican' },
  { name: 'Robert Bloxom', district: 18, party: 'republican' },
  { name: 'Jay Jones', district: 19, party: 'democrat' },
  { name: 'Mike Mullin', district: 20, party: 'democrat' },
  { name: 'Joshua Cole', district: 21, party: 'democrat' },
  { name: 'Candi King', district: 22, party: 'democrat' },
  { name: 'Irene Shin', district: 23, party: 'democrat' },
  { name: 'Luke Torian', district: 24, party: 'democrat' },
  { name: 'Adele McClure', district: 25, party: 'democrat' },
  { name: 'Kannan Srinivasan', district: 26, party: 'democrat' },
  { name: 'Vivian Watts', district: 27, party: 'democrat' },
  { name: 'Charniele Herring', district: 28, party: 'democrat' },
  { name: 'Paul Krizek', district: 29, party: 'democrat' },
  { name: 'Dan Helmer', district: 30, party: 'democrat' },
  { name: 'Elizabeth Bennett-Parker', district: 31, party: 'democrat' },
  { name: 'David Reid', district: 32, party: 'democrat' },
  { name: 'Atoosa Reaser', district: 33, party: 'democrat' },
  { name: 'Laura Jane Cohen', district: 34, party: 'democrat' },
  { name: 'Holly Seibold', district: 35, party: 'democrat' },
  { name: 'Ken Plum', district: 36, party: 'democrat' },
  { name: 'Elizabeth Guzman', district: 37, party: 'democrat' },
  { name: 'Marcus Simon', district: 38, party: 'democrat' },
  { name: 'Josh Thomas', district: 39, party: 'democrat' },
  { name: 'Dan Helmer', district: 40, party: 'democrat' },
  { name: 'Briana Sewell', district: 41, party: 'democrat' },
  { name: 'Kathy Tran', district: 42, party: 'democrat' },
  { name: 'Laura Jane Cohen', district: 43, party: 'democrat' },
  { name: 'Rae Cousins', district: 44, party: 'democrat' },
  { name: 'Mark Sickles', district: 45, party: 'democrat' },
  { name: 'Karrie Delaney', district: 46, party: 'democrat' },
  { name: 'Suhas Subramanyam', district: 47, party: 'democrat' },
  { name: 'Rozia Henson', district: 48, party: 'democrat' },
  { name: 'Alfonso Lopez', district: 49, party: 'democrat' },
  { name: 'Michelle Maldonado', district: 50, party: 'democrat' },
  { name: 'Sam Rasoul', district: 51, party: 'democrat' },
  { name: 'Jennifer Carroll Foy', district: 52, party: 'democrat' },
  { name: 'Delores McQuinn', district: 53, party: 'democrat' },
  { name: 'Betsy Carr', district: 54, party: 'democrat' },
  { name: 'Dawn Adams', district: 55, party: 'democrat' },
  { name: 'Rodney Willett', district: 56, party: 'democrat' },
  { name: 'Susanna Gibson', district: 57, party: 'democrat' },
  { name: 'Riley Callanan', district: 58, party: 'republican' },
  { name: 'C. Matthew Fariss', district: 59, party: 'republican' },
  { name: 'James Edmunds', district: 60, party: 'republican' },
  { name: 'Lee Ware', district: 61, party: 'republican' },
  { name: 'John Avoli', district: 62, party: 'republican' },
  { name: 'Emily Brewer', district: 63, party: 'republican' },
  { name: 'Mike Cherry', district: 64, party: 'republican' },
  { name: 'Tommy Wright', district: 65, party: 'republican' },
  { name: 'Michael Webert', district: 66, party: 'republican' },
  { name: 'Ellen Adams', district: 67, party: 'democrat' },
  { name: 'Paul Shortell', district: 68, party: 'democrat' },
  { name: 'Ellen Adams', district: 69, party: 'democrat' },
  { name: 'Katrina Callsen', district: 70, party: 'democrat' },
  { name: 'Sally Hudson', district: 71, party: 'democrat' },
  { name: 'Chris Head', district: 72, party: 'republican' },
  { name: 'Joe McNamara', district: 73, party: 'republican' },
  { name: 'Terry Austin', district: 74, party: 'republican' },
  { name: 'Chris Obenshain', district: 75, party: 'republican' },
  { name: 'Will Morefield', district: 76, party: 'republican' },
  { name: 'Marie March', district: 77, party: 'republican' },
  { name: 'James Morefield', district: 78, party: 'republican' },
  { name: 'Wren Williams', district: 79, party: 'republican' },
  { name: 'Joe McNamara', district: 80, party: 'republican' },
  { name: 'Terry Austin', district: 81, party: 'republican' },
  { name: 'Jeff Campbell', district: 82, party: 'republican' },
  { name: 'Dave LaRock', district: 83, party: 'republican' },
  { name: 'Ellen Campbell', district: 84, party: 'republican' },
  { name: 'Scott Wyatt', district: 85, party: 'republican' },
  { name: 'Jason Ballard', district: 86, party: 'republican' },
  { name: 'Wendell Walker', district: 87, party: 'republican' },
  { name: 'Phil Scott', district: 88, party: 'republican' },
  { name: 'Israel O\'Quinn', district: 89, party: 'republican' },
  { name: 'Jeff Bourne', district: 90, party: 'democrat' },
  { name: 'Lamont Bagby', district: 91, party: 'democrat' },
  { name: 'Marcia Price', district: 92, party: 'democrat' },
  { name: 'Amanda Hennessy', district: 93, party: 'democrat' },
  { name: 'Rae Cousins', district: 94, party: 'democrat' },
  { name: 'Karen Jenkins', district: 95, party: 'democrat' },
  { name: 'Laura Dent', district: 96, party: 'republican' },
  { name: 'Kathy Byron', district: 97, party: 'republican' },
  { name: 'Todd Gilbert', district: 98, party: 'republican' },
  { name: 'Israel O\'Quinn', district: 99, party: 'republican' },
  { name: 'Wren Williams', district: 100, party: 'republican' },
]

// ─── Build rows ─────────────────────────────────────────────────────────
const rows = []
const seen = new Set()

for (const s of vaSenators) {
  const slug = slugify(s.name)
  if (seen.has(slug)) continue
  seen.add(slug)
  rows.push({
    name: s.name,
    slug,
    state: 'VA',
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, District ${s.district}`,
    bio: `Virginia State Senator representing District ${s.district}.`,
    image_url: null,
  })
}

for (const d of vaDelegates) {
  const slug = slugify(d.name)
  if (seen.has(slug)) continue
  seen.add(slug)
  rows.push({
    name: d.name,
    slug,
    state: 'VA',
    chamber: 'state_house',
    party: d.party,
    title: `Delegate, District ${d.district}`,
    bio: `Virginia Delegate serving District ${d.district} in the House of Delegates.`,
    image_url: null,
  })
}

// ─── Upsert in batches of 50 ───────────────────────────────────────────
const BATCH = 50
let inserted = 0
let errors = 0

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH)
  const { data, error } = await supabase
    .from('politicians')
    .upsert(batch, { onConflict: 'slug' })
    .select('id')

  if (error) {
    console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, error.message)
    errors++
  } else {
    inserted += data.length
    console.log(`Batch ${Math.floor(i / BATCH) + 1}: upserted ${data.length} rows`)
  }
}

console.log(`\nDone. Total upserted: ${inserted} | Errors: ${errors}`)
console.log(`  State Senators: ${vaSenators.length}`)
console.log(`  Delegates: ${vaDelegates.length}`)
console.log(`  Total rows: ${rows.length}`)
