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

// ─── Colorado State Senate (35 members, 75th General Assembly) ────────
const coSenators = [
  { name: 'Dylan Roberts', district: 1, party: 'democrat' },
  { name: 'Jessie Danielson', district: 2, party: 'democrat' },
  { name: 'Chris Hansen', district: 3, party: 'democrat' },
  { name: 'Julie Gonzales', district: 4, party: 'democrat' },
  { name: 'Rhonda Fields', district: 5, party: 'democrat' },
  { name: 'Janet Buckner', district: 6, party: 'democrat' },
  { name: 'Chris Kolker', district: 7, party: 'democrat' },
  { name: 'Bob Gardner', district: 8, party: 'republican' },
  { name: 'Matt Soper', district: 9, party: 'republican' },
  { name: 'Larry Liston', district: 10, party: 'republican' },
  { name: 'Tony Exum', district: 11, party: 'democrat' },
  { name: 'Barbara Kirkmeyer', district: 12, party: 'republican' },
  { name: 'Janice Marchman', district: 13, party: 'democrat' },
  { name: 'Kevin Van Winkle', district: 14, party: 'republican' },
  { name: 'Rod Pelton', district: 15, party: 'republican' },
  { name: 'Chris Hinds', district: 16, party: 'democrat' },
  { name: 'Sonya Jaquez Lewis', district: 17, party: 'democrat' },
  { name: 'Rachel Zenzinger', district: 18, party: 'democrat' },
  { name: 'Lisa Cutter', district: 19, party: 'democrat' },
  { name: 'Dafna Michaelson Jenet', district: 20, party: 'democrat' },
  { name: 'Dominick Moreno', district: 21, party: 'democrat' },
  { name: 'Cleave Simpson', district: 22, party: 'republican' },
  { name: 'James Coleman', district: 23, party: 'democrat' },
  { name: 'Faith Winter', district: 24, party: 'democrat' },
  { name: 'Kevin Priola', district: 25, party: 'democrat' },
  { name: 'Tammy Story', district: 26, party: 'democrat' },
  { name: 'Tom Sullivan', district: 27, party: 'democrat' },
  { name: 'Steve Fenberg', district: 28, party: 'democrat' },
  { name: 'Byron Pelton', district: 29, party: 'republican' },
  { name: 'Mark Baisley', district: 30, party: 'republican' },
  { name: 'Nick Hinrichsen', district: 31, party: 'democrat' },
  { name: 'Rob Woodward', district: 32, party: 'republican' },
  { name: 'Jessie Danielson', district: 33, party: 'democrat' },
  { name: 'Perry Will', district: 34, party: 'republican' },
  { name: 'Rod Bockenfeld', district: 35, party: 'republican' },
]

// ─── Colorado State House (65 members, 75th General Assembly) ─────────
const coReps = [
  { name: 'Meghan Lukens', district: 1, party: 'democrat' },
  { name: 'Matt Soper', district: 2, party: 'republican' },
  { name: 'Perry Will', district: 3, party: 'republican' },
  { name: 'Elizabeth Velasco', district: 4, party: 'democrat' },
  { name: 'Marc Catlin', district: 5, party: 'republican' },
  { name: 'Matt Soper', district: 6, party: 'republican' },
  { name: 'Gabe Evans', district: 7, party: 'republican' },
  { name: 'Junie Joseph', district: 8, party: 'democrat' },
  { name: 'Judy Amabile', district: 9, party: 'democrat' },
  { name: 'Karen McCormick', district: 10, party: 'democrat' },
  { name: 'Javier Mabrey', district: 11, party: 'democrat' },
  { name: 'Iman Jodeh', district: 12, party: 'democrat' },
  { name: 'Chris deGruy Kennedy', district: 13, party: 'democrat' },
  { name: 'Steven Woodrow', district: 14, party: 'democrat' },
  { name: 'Lorena Garcia', district: 15, party: 'democrat' },
  { name: 'Eliza Hamrick', district: 16, party: 'democrat' },
  { name: 'Brianna Titone', district: 17, party: 'democrat' },
  { name: 'Nicole Vigil', district: 18, party: 'democrat' },
  { name: 'Tim Hernandez', district: 19, party: 'democrat' },
  { name: 'Don Wilson', district: 20, party: 'republican' },
  { name: 'Mary Young', district: 21, party: 'democrat' },
  { name: 'Naquetta Ricks', district: 22, party: 'democrat' },
  { name: 'Julia Marvin', district: 23, party: 'democrat' },
  { name: 'Lindsey Daugherty', district: 24, party: 'democrat' },
  { name: 'Tammy Story', district: 25, party: 'democrat' },
  { name: 'Meg Froelich', district: 26, party: 'democrat' },
  { name: 'Sheila Lieder', district: 27, party: 'democrat' },
  { name: 'Serena Gonzales-Gutierrez', district: 28, party: 'democrat' },
  { name: 'Jennifer Bacon', district: 29, party: 'democrat' },
  { name: 'Steven Woodrow', district: 30, party: 'democrat' },
  { name: 'Leslie Herod', district: 31, party: 'democrat' },
  { name: 'Kyle Brown', district: 32, party: 'democrat' },
  { name: 'Mike Weissman', district: 33, party: 'democrat' },
  { name: 'Jenny Willford', district: 34, party: 'democrat' },
  { name: 'Matt Martinez', district: 35, party: 'democrat' },
  { name: 'Mike Lynch', district: 36, party: 'republican' },
  { name: 'Stephanie Vigil', district: 37, party: 'democrat' },
  { name: 'Regina English', district: 38, party: 'democrat' },
  { name: 'Ryan Armagost', district: 39, party: 'republican' },
  { name: 'Ty Winter', district: 40, party: 'republican' },
  { name: 'Rose Pugliese', district: 41, party: 'republican' },
  { name: 'Tisha Mauro', district: 42, party: 'democrat' },
  { name: 'Bob Marshall', district: 43, party: 'republican' },
  { name: 'Anthony Hartsook', district: 44, party: 'republican' },
  { name: 'Lisa Frizell', district: 45, party: 'republican' },
  { name: 'Scott Bottoms', district: 46, party: 'republican' },
  { name: 'Ty Winter', district: 47, party: 'republican' },
  { name: 'Brandi Bradley', district: 48, party: 'republican' },
  { name: 'Monica Duran', district: 49, party: 'democrat' },
  { name: 'Chad Clifford', district: 50, party: 'democrat' },
  { name: 'Mary Bradfield', district: 51, party: 'republican' },
  { name: 'Ken DeGraaf', district: 52, party: 'republican' },
  { name: 'Rod Bockenfeld', district: 53, party: 'republican' },
  { name: 'Matt Martinez', district: 54, party: 'democrat' },
  { name: 'Cathy Kipp', district: 55, party: 'democrat' },
  { name: 'Andrew Boesenecker', district: 56, party: 'democrat' },
  { name: 'Shannon Bird', district: 57, party: 'democrat' },
  { name: 'Ron Weinberg', district: 58, party: 'republican' },
  { name: 'Tonya Van Beber', district: 59, party: 'republican' },
  { name: 'Rick Taggart', district: 60, party: 'republican' },
  { name: 'Richard Holtorf', district: 61, party: 'republican' },
  { name: 'Rod Pelton', district: 62, party: 'republican' },
  { name: 'Stephanie Vigil', district: 63, party: 'democrat' },
  { name: 'Barbara McLachlan', district: 64, party: 'democrat' },
  { name: 'Barbara McLachlan', district: 65, party: 'democrat' },
]

// ─── Build rows ─────────────────────────────────────────────────────────
const rows = []
const seen = new Set()

for (const s of coSenators) {
  const slug = slugify(s.name)
  if (seen.has(slug)) continue
  seen.add(slug)
  rows.push({
    name: s.name,
    slug,
    state: 'CO',
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, District ${s.district}`,
    bio: `Colorado State Senator representing District ${s.district}.`,
    image_url: null,
  })
}

for (const r of coReps) {
  const slug = slugify(r.name)
  if (seen.has(slug)) continue
  seen.add(slug)
  rows.push({
    name: r.name,
    slug,
    state: 'CO',
    chamber: 'state_house',
    party: r.party,
    title: `State Representative, District ${r.district}`,
    bio: `Colorado State Representative serving District ${r.district}.`,
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
console.log(`  State Senators: ${coSenators.length}`)
console.log(`  State Reps: ${coReps.length}`)
console.log(`  Total rows: ${rows.length}`)
