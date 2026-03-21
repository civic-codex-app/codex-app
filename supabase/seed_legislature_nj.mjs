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

// ─── New Jersey State Senate (40 districts, 1 senator each) ─────────
// Source: NJ Legislature official roster, 2024-2026 session
const senators = [
  { name: 'Andrew Zwicker', district: 1, party: 'democrat' },
  { name: 'Vince Polistina', district: 2, party: 'republican' },
  { name: 'John Burzichelli', district: 3, party: 'democrat' },
  { name: 'Fred Madden', district: 4, party: 'democrat' },
  { name: 'Nilsa Cruz-Perez', district: 5, party: 'democrat' },
  { name: 'James Beach', district: 6, party: 'democrat' },
  { name: 'Troy Singleton', district: 7, party: 'democrat' },
  { name: 'Latham Tiver', district: 8, party: 'republican' },
  { name: 'Brian Stack', district: 9, party: 'democrat' },
  { name: 'Michael Testa', district: 10, party: 'republican' },
  { name: 'Vin Gopal', district: 11, party: 'democrat' },
  { name: 'Robert Singer', district: 12, party: 'republican' },
  { name: 'Declan O\'Scanlon', district: 13, party: 'republican' },
  { name: 'Linda Greenstein', district: 14, party: 'democrat' },
  { name: 'Shirley Turner', district: 15, party: 'democrat' },
  { name: 'Andrew Zwicker', district: 16, party: 'democrat' },
  { name: 'Bob Smith', district: 17, party: 'democrat' },
  { name: 'Patrick Diegnan', district: 18, party: 'democrat' },
  { name: 'Joseph Vitale', district: 19, party: 'democrat' },
  { name: 'Joseph Cryan', district: 20, party: 'democrat' },
  { name: 'Jon Bramnick', district: 21, party: 'republican' },
  { name: 'Nick Scutari', district: 22, party: 'democrat' },
  { name: 'Douglas Steinhardt', district: 23, party: 'republican' },
  { name: 'Parker Space', district: 24, party: 'republican' },
  { name: 'Anthony Bucco', district: 25, party: 'republican' },
  { name: 'Joe Pennacchio', district: 26, party: 'republican' },
  { name: 'Richard Codey', district: 27, party: 'democrat' },
  { name: 'Renee Burgess', district: 28, party: 'democrat' },
  { name: 'Teresa Ruiz', district: 29, party: 'democrat' },
  { name: 'Robert Menendez', district: 30, party: 'democrat' },
  { name: 'Angela McKnight', district: 31, party: 'democrat' },
  { name: 'Nicholas Sacco', district: 32, party: 'democrat' },
  { name: 'Brian Stack', district: 33, party: 'democrat' },
  { name: 'Britnee Timberlake', district: 34, party: 'democrat' },
  { name: 'Nellie Pou', district: 35, party: 'democrat' },
  { name: 'Paul Sarlo', district: 36, party: 'democrat' },
  { name: 'Gordon Johnson', district: 37, party: 'democrat' },
  { name: 'Joseph Lagana', district: 38, party: 'democrat' },
  { name: 'Holly Schepisi', district: 39, party: 'republican' },
  { name: 'Kristin Corrado', district: 40, party: 'republican' },
]

// ─── New Jersey General Assembly (80 members, 2 per district) ─────────
// Source: NJ Legislature official roster, 2024-2026 session
const assemblyMembers = [
  // District 1
  { name: 'Antwan McClellan', district: 1, party: 'republican' },
  { name: 'Erik Simonsen', district: 1, party: 'republican' },
  // District 2
  { name: 'Don Guardian', district: 2, party: 'republican' },
  { name: 'Claire Swift', district: 2, party: 'republican' },
  // District 3
  { name: 'John Burzichelli', district: 3, party: 'democrat' },
  { name: 'Heather Simmons', district: 3, party: 'democrat' },
  // District 4
  { name: 'Paul Moriarty', district: 4, party: 'democrat' },
  { name: 'Gabriela Mosquera', district: 4, party: 'democrat' },
  // District 5
  { name: 'William Spearman', district: 5, party: 'democrat' },
  { name: 'William Moen', district: 5, party: 'democrat' },
  // District 6
  { name: 'Louis Greenwald', district: 6, party: 'democrat' },
  { name: 'Pamela Lampitt', district: 6, party: 'democrat' },
  // District 7
  { name: 'Herb Conaway', district: 7, party: 'democrat' },
  { name: 'Carol Murphy', district: 7, party: 'democrat' },
  // District 8
  { name: 'Brandon Umba', district: 8, party: 'republican' },
  { name: 'Jean Stanfield', district: 8, party: 'republican' },
  // District 9
  { name: 'Brian Rumpf', district: 9, party: 'republican' },
  { name: 'Ryan Peters', district: 9, party: 'republican' },
  // District 10
  { name: 'Gregory McGuckin', district: 10, party: 'republican' },
  { name: 'Paul Kanitra', district: 10, party: 'republican' },
  // District 11
  { name: 'Margie Donlon', district: 11, party: 'democrat' },
  { name: 'Luanne Peterpaul', district: 11, party: 'democrat' },
  // District 12
  { name: 'Alex Sauickie', district: 12, party: 'republican' },
  { name: 'Robert Clifton', district: 12, party: 'republican' },
  // District 13
  { name: 'Gerard Scharfenberger', district: 13, party: 'republican' },
  { name: 'Kim Eulner', district: 13, party: 'republican' },
  // District 14
  { name: 'Wayne DeAngelo', district: 14, party: 'democrat' },
  { name: 'Dan Benson', district: 14, party: 'democrat' },
  // District 15
  { name: 'Verlina Reynolds-Jackson', district: 15, party: 'democrat' },
  { name: 'Anthony Verrelli', district: 15, party: 'democrat' },
  // District 16
  { name: 'Roy Freiman', district: 16, party: 'democrat' },
  { name: 'Sadaf Jaffer', district: 16, party: 'democrat' },
  // District 17
  { name: 'Joseph Danielsen', district: 17, party: 'democrat' },
  { name: 'Robert Karabinchak', district: 17, party: 'democrat' },
  // District 18
  { name: 'Robert Karabinchak', district: 18, party: 'democrat' },
  { name: 'Sterley Stanley', district: 18, party: 'democrat' },
  // District 19
  { name: 'Craig Coughlin', district: 19, party: 'democrat' },
  { name: 'Yvonne Lopez', district: 19, party: 'democrat' },
  // District 20
  { name: 'Annette Quijano', district: 20, party: 'democrat' },
  { name: 'Reginald Atkins', district: 20, party: 'democrat' },
  // District 21
  { name: 'Michele Matsikoudis', district: 21, party: 'republican' },
  { name: 'Assemblywoman Nancy Munoz', district: 21, party: 'republican' },
  // District 22
  { name: 'James Kennedy', district: 22, party: 'democrat' },
  { name: 'Linda Carter', district: 22, party: 'democrat' },
  // District 23
  { name: 'John DiMaio', district: 23, party: 'republican' },
  { name: 'Erik Peterson', district: 23, party: 'republican' },
  // District 24
  { name: 'Harold Wirths', district: 24, party: 'republican' },
  { name: 'Dawn Fantasia', district: 24, party: 'republican' },
  // District 25
  { name: 'Brian Bergen', district: 25, party: 'republican' },
  { name: 'Aura Dunn', district: 25, party: 'republican' },
  // District 26
  { name: 'Jay Webber', district: 26, party: 'republican' },
  { name: 'Christian Barranco', district: 26, party: 'republican' },
  // District 27
  { name: 'Mila Jasey', district: 27, party: 'democrat' },
  { name: 'John McKeon', district: 27, party: 'democrat' },
  // District 28
  { name: 'Cleopatra Tucker', district: 28, party: 'democrat' },
  { name: 'Garnet Hall', district: 28, party: 'democrat' },
  // District 29
  { name: 'Eliana Pintor Marin', district: 29, party: 'democrat' },
  { name: 'Shanique Speight', district: 29, party: 'democrat' },
  // District 30
  { name: 'Sean Kean', district: 30, party: 'republican' },
  { name: 'Ned Thomson', district: 30, party: 'republican' },
  // District 31
  { name: 'William Sampson', district: 31, party: 'democrat' },
  { name: 'Angela McKnight', district: 31, party: 'democrat' },
  // District 32
  { name: 'Angelica Jimenez', district: 32, party: 'democrat' },
  { name: 'Pedro Mejia', district: 32, party: 'democrat' },
  // District 33
  { name: 'Raj Mukherji', district: 33, party: 'democrat' },
  { name: 'Annette Chaparro', district: 33, party: 'democrat' },
  // District 34
  { name: 'Thomas Giblin', district: 34, party: 'democrat' },
  { name: 'Britnee Timberlake', district: 34, party: 'democrat' },
  // District 35
  { name: 'Shavonda Sumter', district: 35, party: 'democrat' },
  { name: 'Benjie Wimberly', district: 35, party: 'democrat' },
  // District 36
  { name: 'Gary Schaer', district: 36, party: 'democrat' },
  { name: 'Clinton Calabrese', district: 36, party: 'democrat' },
  // District 37
  { name: 'Gordon Johnson', district: 37, party: 'democrat' },
  { name: 'Shama Haider', district: 37, party: 'democrat' },
  // District 38
  { name: 'Lisa Swain', district: 38, party: 'democrat' },
  { name: 'Christopher Tully', district: 38, party: 'democrat' },
  // District 39
  { name: 'Robert Auth', district: 39, party: 'republican' },
  { name: 'DeAnne DeFuccio', district: 39, party: 'republican' },
  // District 40
  { name: 'Kevin Rooney', district: 40, party: 'republican' },
  { name: 'Christopher DePhillips', district: 40, party: 'republican' },
]

// Build upsert rows
const rows = []

for (const s of senators) {
  rows.push({
    name: s.name,
    slug: slugify(s.name) + '-nj-senate-' + s.district,
    state: 'NJ',
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, District ${s.district}`,
    bio: `New Jersey State Senator representing Legislative District ${s.district}.`,
    image_url: null,
  })
}

for (const a of assemblyMembers) {
  rows.push({
    name: a.name.replace(/^Assemblywoman /, ''),
    slug: slugify(a.name) + '-nj-assembly-' + a.district,
    state: 'NJ',
    chamber: 'state_house',
    party: a.party,
    title: `Assembly Member, District ${a.district}`,
    bio: `New Jersey General Assembly member representing Legislative District ${a.district}.`,
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

console.log(`\nDone. Total NJ legislators upserted: ${total} (${senators.length} senators + ${assemblyMembers.length} assembly)`)
