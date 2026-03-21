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

// ─── Oregon State Senate (30 members, 83rd Legislative Assembly) ──────
const orSenators = [
  { name: 'David Brock Smith', district: 1, party: 'republican' },
  { name: 'Jeff Golden', district: 3, party: 'democrat' },
  { name: 'Dennis Linthicum', district: 2, party: 'republican' },
  { name: 'Floyd Prozanski', district: 4, party: 'democrat' },
  { name: 'Dick Anderson', district: 5, party: 'republican' },
  { name: 'Andrea Salinas', district: 6, party: 'democrat' },
  { name: 'James Manning Jr.', district: 7, party: 'democrat' },
  { name: 'Sara Gelser Blouin', district: 8, party: 'democrat' },
  { name: 'Fred Girod', district: 9, party: 'republican' },
  { name: 'Deb Patterson', district: 10, party: 'democrat' },
  { name: 'Kim Thatcher', district: 11, party: 'republican' },
  { name: 'Brian Boquist', district: 12, party: 'republican' },
  { name: 'Aaron Woods', district: 13, party: 'democrat' },
  { name: 'Kate Lieber', district: 14, party: 'democrat' },
  { name: 'Rob Wagner', district: 15, party: 'democrat' },
  { name: 'Janeen Sollman', district: 16, party: 'democrat' },
  { name: 'Akasha Lawrence Spence', district: 17, party: 'democrat' },
  { name: 'Lew Frederick', district: 18, party: 'democrat' },
  { name: 'Kathleen Taylor', district: 19, party: 'democrat' },
  { name: 'Mark Meek', district: 20, party: 'democrat' },
  { name: 'Kayse Jama', district: 21, party: 'democrat' },
  { name: 'Michael Dembrow', district: 22, party: 'democrat' },
  { name: 'Chris Gorsek', district: 23, party: 'democrat' },
  { name: 'Tim Knopp', district: 24, party: 'republican' },
  { name: 'Daniel Bonham', district: 25, party: 'republican' },
  { name: 'Bill Hansell', district: 26, party: 'republican' },
  { name: 'Lynn Findley', district: 27, party: 'republican' },
  { name: 'Cedric Hayden', district: 28, party: 'republican' },
  { name: 'Chuck Thomsen', district: 29, party: 'republican' },
  { name: 'Suzanne Weber', district: 30, party: 'republican' },
]

// ─── Oregon State House (60 members, 83rd Legislative Assembly) ───────
const orReps = [
  { name: 'David Brock Smith', district: 1, party: 'republican' },
  { name: 'Kim Wallan', district: 2, party: 'republican' },
  { name: 'Pam Marsh', district: 3, party: 'democrat' },
  { name: 'Boomer Wright', district: 4, party: 'republican' },
  { name: 'Sandra Cano', district: 5, party: 'democrat' },
  { name: 'Court Boice', district: 6, party: 'republican' },
  { name: 'John Lively', district: 7, party: 'democrat' },
  { name: 'Paul Holvey', district: 8, party: 'democrat' },
  { name: 'Lisa Reynolds', district: 9, party: 'democrat' },
  { name: 'David Gomberg', district: 10, party: 'democrat' },
  { name: 'Lucetta Elmer', district: 11, party: 'republican' },
  { name: 'Dacia Grayber', district: 12, party: 'democrat' },
  { name: 'Nancy Nathanson', district: 13, party: 'democrat' },
  { name: 'Julie Fahey', district: 14, party: 'democrat' },
  { name: 'Charlie Conrad', district: 15, party: 'republican' },
  { name: 'Dan Rayfield', district: 16, party: 'democrat' },
  { name: 'Ed Diehl', district: 17, party: 'republican' },
  { name: 'Annessa Hartman', district: 18, party: 'democrat' },
  { name: 'Kevin Mannix', district: 19, party: 'republican' },
  { name: 'Rick Lewis', district: 20, party: 'republican' },
  { name: 'Christine Drazan', district: 21, party: 'republican' },
  { name: 'Lucetta Elmer', district: 22, party: 'republican' },
  { name: 'Anna Scharf', district: 23, party: 'republican' },
  { name: 'Ron Noble', district: 24, party: 'republican' },
  { name: 'Andrea Valderrama', district: 25, party: 'democrat' },
  { name: 'Hai Pham', district: 26, party: 'democrat' },
  { name: 'Sheri Schouten', district: 27, party: 'democrat' },
  { name: 'Jeff Helfrich', district: 28, party: 'republican' },
  { name: 'Susan McLain', district: 29, party: 'democrat' },
  { name: 'Courtney Neron', district: 30, party: 'democrat' },
  { name: 'Brad Witt', district: 31, party: 'democrat' },
  { name: 'Brian Stout', district: 32, party: 'republican' },
  { name: 'Maxine Dexter', district: 33, party: 'democrat' },
  { name: 'Lisa Reynolds', district: 34, party: 'democrat' },
  { name: 'Travis Nelson', district: 35, party: 'democrat' },
  { name: 'Khanh Pham', district: 36, party: 'democrat' },
  { name: 'Julie Fahey', district: 37, party: 'democrat' },
  { name: 'Rob Nosse', district: 38, party: 'democrat' },
  { name: 'Hoa Nguyen', district: 39, party: 'democrat' },
  { name: 'Karin Power', district: 40, party: 'democrat' },
  { name: 'Mark Gamba', district: 41, party: 'democrat' },
  { name: 'Andrea Valderrama', district: 42, party: 'democrat' },
  { name: 'Tawna Sanchez', district: 43, party: 'democrat' },
  { name: 'Ricki Ruiz', district: 44, party: 'democrat' },
  { name: 'Emerson Levy', district: 45, party: 'democrat' },
  { name: 'Dacia Grayber', district: 46, party: 'democrat' },
  { name: 'Jeff Helfrich', district: 47, party: 'republican' },
  { name: 'Daniel Bonham', district: 48, party: 'republican' },
  { name: 'Anna Scharf', district: 49, party: 'republican' },
  { name: 'Bobby Levy', district: 50, party: 'republican' },
  { name: 'Vikki Breese-Iverson', district: 51, party: 'republican' },
  { name: 'Mark Owens', district: 52, party: 'republican' },
  { name: 'Gene Whisnant', district: 53, party: 'republican' },
  { name: 'Bobby Levy', district: 54, party: 'republican' },
  { name: 'Jack Zika', district: 55, party: 'republican' },
  { name: 'Emily McIntire', district: 56, party: 'republican' },
  { name: 'Greg Smith', district: 57, party: 'republican' },
  { name: 'Bobby Levy', district: 58, party: 'republican' },
  { name: 'Greg Barreto', district: 59, party: 'republican' },
  { name: 'Mark Owens', district: 60, party: 'republican' },
]

// ─── Build rows ─────────────────────────────────────────────────────────
const rows = []
const seen = new Set()

for (const s of orSenators) {
  const slug = slugify(s.name)
  if (seen.has(slug)) continue
  seen.add(slug)
  rows.push({
    name: s.name,
    slug,
    state: 'OR',
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, District ${s.district}`,
    bio: `Oregon State Senator representing District ${s.district}.`,
    image_url: null,
  })
}

for (const r of orReps) {
  const slug = slugify(r.name)
  if (seen.has(slug)) continue
  seen.add(slug)
  rows.push({
    name: r.name,
    slug,
    state: 'OR',
    chamber: 'state_house',
    party: r.party,
    title: `State Representative, District ${r.district}`,
    bio: `Oregon State Representative serving District ${r.district}.`,
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
console.log(`  State Senators: ${orSenators.length}`)
console.log(`  State Reps: ${orReps.length}`)
console.log(`  Total rows: ${rows.length}`)
