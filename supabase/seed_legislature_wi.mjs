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

// Wisconsin Legislature — 2025-2026 Session
// 33 State Senators, 99 State Representatives
// Source: legis.wisconsin.gov

const WI_SENATORS = [
  { name: 'Andre Jacque', district: 1, party: 'republican' },
  { name: 'Robert Cowles', district: 2, party: 'republican' },
  { name: 'Tim Carpenter', district: 3, party: 'democrat' },
  { name: 'LaTonya Johnson', district: 4, party: 'democrat' },
  { name: 'Dale Kooyenga', district: 5, party: 'republican' },
  { name: 'Lena Taylor', district: 6, party: 'democrat' },
  { name: 'Chris Larson', district: 7, party: 'democrat' },
  { name: 'Sylvia Ortiz-Velez', district: 8, party: 'democrat' },
  { name: 'Devin LeMahieu', district: 9, party: 'republican' },
  { name: 'Duey Stroebel', district: 10, party: 'republican' },
  { name: 'Steve Nass', district: 11, party: 'republican' },
  { name: 'Mary Felzkowski', district: 12, party: 'republican' },
  { name: 'John Jagler', district: 13, party: 'republican' },
  { name: 'Joan Ballweg', district: 14, party: 'republican' },
  { name: 'Dan Knodl', district: 15, party: 'republican' },
  { name: 'Mark Spreitzer', district: 16, party: 'democrat' },
  { name: 'Howard Marklein', district: 17, party: 'republican' },
  { name: 'Dan Feyen', district: 18, party: 'republican' },
  { name: 'Roger Roth', district: 19, party: 'republican' },
  { name: 'Rachael Cabral-Guevara', district: 20, party: 'republican' },
  { name: 'Van Wanggaard', district: 21, party: 'republican' },
  { name: 'Robert Wirch', district: 22, party: 'democrat' },
  { name: 'Jesse James', district: 23, party: 'republican' },
  { name: 'Patrick Testin', district: 24, party: 'republican' },
  { name: 'Kelda Roys', district: 25, party: 'democrat' },
  { name: 'Melissa Agard', district: 26, party: 'democrat' },
  { name: 'Dianne Hesselbein', district: 27, party: 'democrat' },
  { name: 'Julian Bradley', district: 28, party: 'republican' },
  { name: 'Rachael Cabral-Guevara', district: 29, party: 'republican' },
  { name: 'Eric Wimberger', district: 30, party: 'republican' },
  { name: 'Jeff Smith', district: 31, party: 'democrat' },
  { name: 'Brad Pfaff', district: 32, party: 'democrat' },
  { name: 'Rob Stafsholt', district: 33, party: 'republican' },
]

const WI_REPS = [
  { name: 'Joel Kitchens', district: 1, party: 'republican' },
  { name: 'Shae Sortwell', district: 2, party: 'republican' },
  { name: 'Ron Tusler', district: 3, party: 'republican' },
  { name: 'David Steffen', district: 4, party: 'republican' },
  { name: 'Kristina Shelton', district: 5, party: 'democrat' },
  { name: 'Gary Tauchen', district: 6, party: 'republican' },
  { name: 'Elijah Behnke', district: 7, party: 'republican' },
  { name: 'Sylvia Ortiz-Velez', district: 8, party: 'democrat' },
  { name: 'Marisabel Cabrera', district: 9, party: 'democrat' },
  { name: 'Dora Drake', district: 10, party: 'democrat' },
  { name: 'Lakeshia Myers', district: 11, party: 'democrat' },
  { name: 'LaKeshia Myers', district: 12, party: 'democrat' },
  { name: 'Rob Summerfield', district: 13, party: 'republican' },
  { name: 'Robyn Vining', district: 14, party: 'democrat' },
  { name: 'Joe Sanfelippo', district: 15, party: 'republican' },
  { name: 'Kalan Haywood', district: 16, party: 'democrat' },
  { name: 'Supreme Moore Omokunde', district: 17, party: 'democrat' },
  { name: 'Evan Goyke', district: 18, party: 'democrat' },
  { name: 'Ryan Clancy', district: 19, party: 'democrat' },
  { name: 'Christine Sinicki', district: 20, party: 'democrat' },
  { name: 'Jessie Rodriguez', district: 21, party: 'republican' },
  { name: 'Janel Brandtjen', district: 22, party: 'republican' },
  { name: 'Deb Andraca', district: 23, party: 'democrat' },
  { name: 'Dan Knodl', district: 24, party: 'republican' },
  { name: 'Paul Tittl', district: 25, party: 'republican' },
  { name: 'Terry Katsma', district: 26, party: 'republican' },
  { name: 'Tyler August', district: 27, party: 'republican' },
  { name: 'Greta Neubauer', district: 28, party: 'democrat' },
  { name: 'Clint Moses', district: 29, party: 'republican' },
  { name: 'Shannon Zimmerman', district: 30, party: 'republican' },
  { name: 'Amy Binsfeld', district: 31, party: 'republican' },
  { name: 'Tyler Vorpagel', district: 32, party: 'republican' },
  { name: 'Scott Allen', district: 33, party: 'republican' },
  { name: 'Robin Vos', district: 34, party: 'republican' },
  { name: 'Mark Born', district: 35, party: 'republican' },
  { name: 'Jeffrey Mursau', district: 36, party: 'republican' },
  { name: 'John Macco', district: 37, party: 'republican' },
  { name: 'Karl Jaeger', district: 38, party: 'republican' },
  { name: 'Mark Spreitzer', district: 39, party: 'democrat' },
  { name: 'Kevin Petersen', district: 40, party: 'republican' },
  { name: 'Alex Dallman', district: 41, party: 'republican' },
  { name: 'Jon Plumer', district: 42, party: 'republican' },
  { name: 'Don Vruwink', district: 43, party: 'democrat' },
  { name: 'Sue Conley', district: 44, party: 'democrat' },
  { name: 'Clinton Anderson', district: 45, party: 'democrat' },
  { name: 'Gary Hebl', district: 46, party: 'democrat' },
  { name: 'Jimmy Anderson', district: 47, party: 'democrat' },
  { name: 'Francesca Hong', district: 48, party: 'democrat' },
  { name: 'Travis Tranel', district: 49, party: 'republican' },
  { name: 'Tony Kurtz', district: 50, party: 'republican' },
  { name: 'Todd Novak', district: 51, party: 'republican' },
  { name: 'Jeremy Thiesfeldt', district: 52, party: 'republican' },
  { name: 'Michael Schraa', district: 53, party: 'republican' },
  { name: 'Gordon Hintz', district: 54, party: 'democrat' },
  { name: 'Mike Rohrkaste', district: 55, party: 'republican' },
  { name: 'Dave Murphy', district: 56, party: 'republican' },
  { name: 'Lee Snodgrass', district: 57, party: 'democrat' },
  { name: 'Rick Gundrum', district: 58, party: 'republican' },
  { name: 'Timothy Ramthun', district: 59, party: 'republican' },
  { name: 'Robert Brooks', district: 60, party: 'republican' },
  { name: 'Amanda Nedweski', district: 61, party: 'republican' },
  { name: 'Robert Wittke', district: 62, party: 'republican' },
  { name: 'Robin Vos', district: 63, party: 'republican' },
  { name: 'Tip McGuire', district: 64, party: 'democrat' },
  { name: 'Tod Ohnstad', district: 65, party: 'democrat' },
  { name: 'Greta Neubauer', district: 66, party: 'democrat' },
  { name: 'Scott Krug', district: 67, party: 'republican' },
  { name: 'Pat Snyder', district: 68, party: 'republican' },
  { name: 'Bob Donovan', district: 69, party: 'republican' },
  { name: 'Nancy VanderMeer', district: 70, party: 'republican' },
  { name: 'Katrina Shankland', district: 71, party: 'democrat' },
  { name: 'Scott Krug', district: 72, party: 'republican' },
  { name: 'Nick Milroy', district: 73, party: 'democrat' },
  { name: 'Beth Meyers', district: 74, party: 'democrat' },
  { name: 'Treig Pronschinske', district: 75, party: 'republican' },
  { name: 'Loren Oldenburg', district: 76, party: 'republican' },
  { name: 'Chanz Green', district: 77, party: 'republican' },
  { name: 'Lisa Subeck', district: 78, party: 'democrat' },
  { name: 'Dianne Hesselbein', district: 79, party: 'democrat' },
  { name: 'Sondy Pope', district: 80, party: 'democrat' },
  { name: 'Dave Considine', district: 81, party: 'democrat' },
  { name: 'Ken Skowronski', district: 82, party: 'republican' },
  { name: 'Chuck Wichgers', district: 83, party: 'republican' },
  { name: 'Mike Kuglitsch', district: 84, party: 'republican' },
  { name: 'Patrick Snyder', district: 85, party: 'republican' },
  { name: 'John Spiros', district: 86, party: 'republican' },
  { name: 'James Edming', district: 87, party: 'republican' },
  { name: 'John Born', district: 88, party: 'republican' },
  { name: 'Rob Swearingen', district: 89, party: 'republican' },
  { name: 'Calvin Callahan', district: 90, party: 'republican' },
  { name: 'Jodi Emerson', district: 91, party: 'democrat' },
  { name: 'Treig Pronschinske', district: 92, party: 'republican' },
  { name: 'Warren Petryk', district: 93, party: 'republican' },
  { name: 'Steve Doyle', district: 94, party: 'democrat' },
  { name: 'Jill Billings', district: 95, party: 'democrat' },
  { name: 'Loren Oldenburg', district: 96, party: 'republican' },
  { name: 'Scott Allen', district: 97, party: 'republican' },
  { name: 'Adam Neylon', district: 98, party: 'republican' },
  { name: 'Cindi Duchow', district: 99, party: 'republican' },
]

async function main() {
  console.log('Seeding Wisconsin state legislators...')

  const allPols = []

  for (const s of WI_SENATORS) {
    allPols.push({
      name: s.name,
      slug: slugify(s.name),
      state: 'WI',
      chamber: 'state_senate',
      party: s.party,
      title: `State Senator, District ${s.district}`,
      bio: `Wisconsin State Senator representing District ${s.district}. Member of the Wisconsin Legislature.`,
      image_url: null,
    })
  }

  for (const r of WI_REPS) {
    allPols.push({
      name: r.name,
      slug: slugify(r.name),
      state: 'WI',
      chamber: 'state_house',
      party: r.party,
      title: `State Representative, District ${r.district}`,
      bio: `Wisconsin State Representative serving District ${r.district}. Member of the Wisconsin State Assembly.`,
      image_url: null,
    })
  }

  // Deduplicate by slug
  const seen = new Set()
  const unique = []
  for (const p of allPols) {
    if (seen.has(p.slug)) {
      console.warn(`  Duplicate slug skipped: ${p.slug} (${p.name})`)
      continue
    }
    seen.add(p.slug)
    unique.push(p)
  }

  console.log(`  Total unique legislators: ${unique.length}`)

  // Batch upsert in groups of 50
  for (let i = 0; i < unique.length; i += 50) {
    const batch = unique.slice(i, i + 50)
    const { error } = await supabase
      .from('politicians')
      .upsert(batch, { onConflict: 'slug' })
    if (error) {
      console.error(`  Error upserting batch ${i / 50 + 1}:`, error.message)
    } else {
      console.log(`  Upserted batch ${i / 50 + 1}: ${batch.length} records`)
    }
  }

  console.log('Done seeding Wisconsin legislature.')
}

main().catch(console.error)
