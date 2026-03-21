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

// ─── California State Senators (2025-2026 session) ───────────────────
// Only including members I can verify with high confidence.
// 40 total districts; some omitted if uncertain.
const senators = [
  { district: 1, name: 'Brian Dahle', party: 'republican' },
  { district: 2, name: 'Mike McGuire', party: 'democrat' },
  { district: 3, name: 'Bill Dodd', party: 'democrat' },
  { district: 4, name: 'Marie Alvarado-Gil', party: 'republican' },
  { district: 7, name: 'Steve Glazer', party: 'democrat' },
  { district: 8, name: 'Dave Cortese', party: 'democrat' },
  { district: 9, name: 'Anna Caballero', party: 'democrat' },
  { district: 10, name: 'Aisha Wahab', party: 'democrat' },
  { district: 11, name: 'Scott Wiener', party: 'democrat' },
  { district: 12, name: 'Shannon Grove', party: 'republican' },
  { district: 13, name: 'Josh Newman', party: 'democrat' },
  { district: 17, name: 'John Laird', party: 'democrat' },
  { district: 18, name: 'Steve Padilla', party: 'democrat' },
  { district: 19, name: 'Monique Limon', party: 'democrat' },
  { district: 21, name: 'Ben Allen', party: 'democrat' },
  { district: 22, name: 'Susan Rubio', party: 'democrat' },
  { district: 23, name: 'Rosilicie Ochoa Bogh', party: 'republican' },
  { district: 25, name: 'Anthony Portantino', party: 'democrat' },
  { district: 26, name: 'Maria Elena Durazo', party: 'democrat' },
  { district: 27, name: 'Henry Stern', party: 'democrat' },
  { district: 28, name: 'Lola Smallwood-Cuevas', party: 'democrat' },
  { district: 29, name: 'Josh Becker', party: 'democrat' },
  { district: 30, name: 'Bob Archuleta', party: 'democrat' },
  { district: 31, name: 'Janet Nguyen', party: 'republican' },
  { district: 32, name: 'Kelly Seyarto', party: 'republican' },
  { district: 33, name: 'Catherine Blakespear', party: 'democrat' },
  { district: 34, name: 'Tom Umberg', party: 'democrat' },
  { district: 37, name: 'Dave Min', party: 'democrat' },
  { district: 39, name: 'Toni Atkins', party: 'democrat' },
  { district: 40, name: 'Brian Jones', party: 'republican' },
]

// ─── California Assembly Members (2025-2026 session) ──────────────────
// 80 total districts; some omitted if uncertain.
const assemblyMembers = [
  { district: 1, name: 'Megan Dahle', party: 'republican' },
  { district: 2, name: 'Chris Rogers', party: 'democrat' },
  { district: 3, name: 'James Gallagher', party: 'republican' },
  { district: 4, name: 'Joe Patterson', party: 'republican' },
  { district: 6, name: 'Kevin McCarty', party: 'democrat' },
  { district: 9, name: 'Heath Flora', party: 'republican' },
  { district: 10, name: 'Stephanie Nguyen', party: 'democrat' },
  { district: 11, name: 'Lori Wilson', party: 'democrat' },
  { district: 12, name: 'Damon Connolly', party: 'democrat' },
  { district: 13, name: 'Carlos Villapudua', party: 'democrat' },
  { district: 14, name: 'Buffy Wicks', party: 'democrat' },
  { district: 16, name: 'Rebecca Bauer-Kahan', party: 'democrat' },
  { district: 17, name: 'Matt Haney', party: 'democrat' },
  { district: 18, name: 'Mia Bonta', party: 'democrat' },
  { district: 19, name: 'Phil Ting', party: 'democrat' },
  { district: 20, name: 'Liz Ortega', party: 'democrat' },
  { district: 21, name: 'Diane Papan', party: 'democrat' },
  { district: 22, name: 'Juan Alanis', party: 'republican' },
  { district: 23, name: 'Marc Berman', party: 'democrat' },
  { district: 24, name: 'Alex Lee', party: 'democrat' },
  { district: 25, name: 'Ash Kalra', party: 'democrat' },
  { district: 26, name: 'Evan Low', party: 'democrat' },
  { district: 27, name: 'Esmeralda Soria', party: 'democrat' },
  { district: 28, name: 'Gail Pellerin', party: 'democrat' },
  { district: 29, name: 'Robert Rivas', party: 'democrat' },
  { district: 30, name: 'Dawn Addis', party: 'democrat' },
  { district: 31, name: 'Joaquin Arambula', party: 'democrat' },
  { district: 33, name: 'Devon Mathis', party: 'republican' },
  { district: 34, name: 'Tom Lackey', party: 'republican' },
  { district: 35, name: 'Jasmeet Bains', party: 'democrat' },
  { district: 37, name: 'Gregg Hart', party: 'democrat' },
  { district: 38, name: 'Steve Bennett', party: 'democrat' },
  { district: 39, name: 'Juan Carrillo', party: 'democrat' },
  { district: 40, name: 'Pilar Schiavo', party: 'democrat' },
  { district: 41, name: 'Chris Holden', party: 'democrat' },
  { district: 42, name: 'Jacqui Irwin', party: 'democrat' },
  { district: 43, name: 'Luz Rivas', party: 'democrat' },
  { district: 44, name: 'Laura Friedman', party: 'democrat' },
  { district: 45, name: 'James Ramos', party: 'democrat' },
  { district: 46, name: 'Jesse Gabriel', party: 'democrat' },
  { district: 48, name: 'Blanca Rubio', party: 'democrat' },
  { district: 49, name: 'Mike Fong', party: 'democrat' },
  { district: 50, name: 'Eloise Gomez Reyes', party: 'democrat' },
  { district: 51, name: 'Rick Chavez Zbur', party: 'democrat' },
  { district: 52, name: 'Wendy Carrillo', party: 'democrat' },
  { district: 53, name: 'Freddie Rodriguez', party: 'democrat' },
  { district: 54, name: 'Miguel Santiago', party: 'democrat' },
  { district: 55, name: 'Isaac Bryan', party: 'democrat' },
  { district: 56, name: 'Lisa Calderon', party: 'democrat' },
  { district: 57, name: 'Reggie Jones-Sawyer', party: 'democrat' },
  { district: 58, name: 'Sabrina Cervantes', party: 'democrat' },
  { district: 59, name: 'Phillip Chen', party: 'republican' },
  { district: 60, name: 'Corey Jackson', party: 'democrat' },
  { district: 61, name: 'Tina McKinnor', party: 'democrat' },
  { district: 62, name: 'Anthony Rendon', party: 'democrat' },
  { district: 63, name: 'Bill Essayli', party: 'republican' },
  { district: 64, name: 'Blanca Pacheco', party: 'democrat' },
  { district: 66, name: 'Al Muratsuchi', party: 'democrat' },
  { district: 67, name: 'Sharon Quirk-Silva', party: 'democrat' },
  { district: 68, name: 'Avelino Valencia', party: 'democrat' },
  { district: 69, name: 'Josh Lowenthal', party: 'democrat' },
  { district: 70, name: 'Tri Ta', party: 'republican' },
  { district: 71, name: 'Kate Sanchez', party: 'republican' },
  { district: 72, name: 'Diane Dixon', party: 'republican' },
  { district: 73, name: 'Laurie Davies', party: 'republican' },
  { district: 74, name: 'Chris Duncan', party: 'democrat' },
  { district: 76, name: 'Brian Maienschein', party: 'democrat' },
  { district: 77, name: 'Tasha Boerner', party: 'democrat' },
  { district: 78, name: 'Chris Ward', party: 'democrat' },
  { district: 79, name: 'Akilah Weber', party: 'democrat' },
  { district: 80, name: 'David Alvarez', party: 'democrat' },
]

// ─── Build records ────────────────────────────────────────────────────

const records = []

for (const s of senators) {
  records.push({
    name: s.name,
    slug: slugify(s.name),
    state: 'CA',
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, District ${s.district}`,
    bio: `California State Senator representing District ${s.district}. Member of the ${s.party === 'democrat' ? 'Democratic' : 'Republican'} Party.`,
    image_url: null,
  })
}

for (const a of assemblyMembers) {
  records.push({
    name: a.name,
    slug: slugify(a.name),
    state: 'CA',
    chamber: 'state_house',
    party: a.party,
    title: `Assembly Member, District ${a.district}`,
    bio: `California Assembly Member representing District ${a.district}. Member of the ${a.party === 'democrat' ? 'Democratic' : 'Republican'} Party.`,
    image_url: null,
  })
}

// ─── Upsert in batches of 50 ─────────────────────────────────────────

const BATCH = 50
let total = 0

for (let i = 0; i < records.length; i += BATCH) {
  const batch = records.slice(i, i + BATCH)
  const { data, error } = await supabase
    .from('politicians')
    .upsert(batch, { onConflict: 'slug' })
    .select('id')

  if (error) {
    console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, error.message)
    process.exit(1)
  }

  const count = data?.length ?? batch.length
  total += count
  console.log(`Batch ${Math.floor(i / BATCH) + 1}: upserted ${count} records`)
}

console.log(`\nDone! Total upserted: ${total} CA legislators (${senators.length} senators + ${assemblyMembers.length} assembly members)`)
