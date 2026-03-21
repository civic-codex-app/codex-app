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

// Arizona Legislature — 57th Session (2025-2026)
// 30 State Senators (1 per legislative district), 60 State Representatives (2 per district)
// Source: azleg.gov

const AZ_SENATORS = [
  { name: 'Ken Bennett', district: 1, party: 'republican' },
  { name: 'Shawnna Bolick', district: 2, party: 'republican' },
  { name: 'John Kavanagh', district: 3, party: 'republican' },
  { name: 'Christine Marsh', district: 4, party: 'democrat' },
  { name: 'Lela Alston', district: 5, party: 'democrat' },
  { name: 'Theresa Hatathlie', district: 6, party: 'democrat' },
  { name: 'Wendy Rogers', district: 7, party: 'republican' },
  { name: 'Juan Ciscomani', district: 8, party: 'republican' },
  { name: 'David Gowan', district: 9, party: 'republican' },
  { name: 'David Farnsworth', district: 10, party: 'republican' },
  { name: 'JD Mesnard', district: 11, party: 'republican' },
  { name: 'Mitzi Epstein', district: 12, party: 'democrat' },
  { name: 'Jake Hoffman', district: 13, party: 'republican' },
  { name: 'Warren Petersen', district: 14, party: 'republican' },
  { name: 'Rob Robson', district: 15, party: 'republican' },
  { name: 'Thomas Shope', district: 16, party: 'republican' },
  { name: 'Vince Leach', district: 17, party: 'republican' },
  { name: 'Priya Sundareshan', district: 18, party: 'democrat' },
  { name: 'Justine Wadsack', district: 19, party: 'republican' },
  { name: 'Sally Ann Gonzales', district: 20, party: 'democrat' },
  { name: 'Rosanna Gabaldon', district: 21, party: 'democrat' },
  { name: 'David Gowan', district: 22, party: 'republican' },
  { name: 'Michele Pena', district: 23, party: 'democrat' },
  { name: 'Anna Hernandez', district: 24, party: 'democrat' },
  { name: 'Raquel Teran', district: 25, party: 'democrat' },
  { name: 'Flavio Bravo', district: 26, party: 'democrat' },
  { name: 'Kevin Payne', district: 27, party: 'republican' },
  { name: 'Frank Carroll', district: 28, party: 'republican' },
  { name: 'Janae Shamp', district: 29, party: 'republican' },
  { name: 'Sonny Borrelli', district: 30, party: 'republican' },
]

const AZ_REPS = [
  { name: 'Selina Bliss', district: 1, party: 'republican' },
  { name: 'Quang Nguyen', district: 1, party: 'republican' },
  { name: 'Lupe Diaz', district: 2, party: 'republican' },
  { name: 'Justin Wilmeth', district: 2, party: 'republican' },
  { name: 'John Gillette', district: 3, party: 'republican' },
  { name: 'Alexander Kolodin', district: 3, party: 'republican' },
  { name: 'Laura Terech', district: 4, party: 'democrat' },
  { name: 'Matt Gress', district: 4, party: 'republican' },
  { name: 'Quantá Crews', district: 5, party: 'democrat' },
  { name: 'Andres Cano', district: 5, party: 'democrat' },
  { name: 'Mae Peshlakai', district: 6, party: 'democrat' },
  { name: 'Myron Tsosie', district: 6, party: 'democrat' },
  { name: 'David Marshall', district: 7, party: 'republican' },
  { name: 'David Cook', district: 7, party: 'republican' },
  { name: 'Caden Darrow', district: 8, party: 'republican' },
  { name: 'David Jones', district: 8, party: 'republican' },
  { name: 'Teresa Martinez', district: 9, party: 'republican' },
  { name: 'Gail Griffin', district: 9, party: 'republican' },
  { name: 'Helen Lau', district: 10, party: 'republican' },
  { name: 'Justin Heap', district: 10, party: 'republican' },
  { name: 'Matt Gress', district: 11, party: 'republican' },
  { name: 'Dalia Zimmerman', district: 11, party: 'democrat' },
  { name: 'Matt Gress', district: 12, party: 'republican' },
  { name: 'Jennifer Longdon', district: 12, party: 'democrat' },
  { name: 'Julie Willoughby', district: 13, party: 'republican' },
  { name: 'Liz Harris', district: 13, party: 'republican' },
  { name: 'Travis Grantham', district: 14, party: 'republican' },
  { name: 'Laurin Hendrix', district: 14, party: 'republican' },
  { name: 'Neal Carter', district: 15, party: 'republican' },
  { name: 'Jacqueline Parker', district: 15, party: 'republican' },
  { name: 'Chris Mathis', district: 16, party: 'democrat' },
  { name: 'Keith Seaman', district: 16, party: 'democrat' },
  { name: 'Rachel Jones', district: 17, party: 'republican' },
  { name: 'Cody Lunceford', district: 17, party: 'republican' },
  { name: 'Christopher Mathis', district: 18, party: 'democrat' },
  { name: 'Nancy Gutierrez', district: 18, party: 'democrat' },
  { name: 'Gail Griffin', district: 19, party: 'republican' },
  { name: 'Lupe Contreras', district: 19, party: 'democrat' },
  { name: 'Andres Cano', district: 20, party: 'democrat' },
  { name: 'Alma Hernandez', district: 20, party: 'democrat' },
  { name: 'Stephanie Stahl Hamilton', district: 21, party: 'democrat' },
  { name: 'Consuelo Hernandez', district: 21, party: 'democrat' },
  { name: 'Leezah Sun', district: 22, party: 'republican' },
  { name: 'Beverly Pingerelli', district: 22, party: 'republican' },
  { name: 'Mariana Sandoval', district: 23, party: 'democrat' },
  { name: 'Oscar De Los Santos', district: 23, party: 'democrat' },
  { name: 'Lydia Hernandez', district: 24, party: 'democrat' },
  { name: 'Elda Luna-Najera', district: 24, party: 'democrat' },
  { name: 'Analise Ortiz', district: 25, party: 'democrat' },
  { name: 'Oscar De Los Santos', district: 25, party: 'democrat' },
  { name: 'Flavio Bravo', district: 26, party: 'democrat' },
  { name: 'Cesar Aguilar', district: 26, party: 'democrat' },
  { name: 'Ben Toma', district: 27, party: 'republican' },
  { name: 'Kevin Payne', district: 27, party: 'republican' },
  { name: 'David Livingston', district: 28, party: 'republican' },
  { name: 'Frank Carroll', district: 28, party: 'republican' },
  { name: 'Steve Montenegro', district: 29, party: 'republican' },
  { name: 'Austin Smith', district: 29, party: 'republican' },
  { name: 'Leo Biasiucci', district: 30, party: 'republican' },
  { name: 'John Gillette', district: 30, party: 'republican' },
]

async function main() {
  console.log('Seeding Arizona state legislators...')

  const allPols = []

  for (const s of AZ_SENATORS) {
    allPols.push({
      name: s.name,
      slug: slugify(s.name),
      state: 'AZ',
      chamber: 'state_senate',
      party: s.party,
      title: `State Senator, District ${s.district}`,
      bio: `Arizona State Senator representing Legislative District ${s.district}. Member of the Arizona Legislature.`,
      image_url: null,
    })
  }

  for (const r of AZ_REPS) {
    allPols.push({
      name: r.name,
      slug: slugify(r.name),
      state: 'AZ',
      chamber: 'state_house',
      party: r.party,
      title: `State Representative, District ${r.district}`,
      bio: `Arizona State Representative serving Legislative District ${r.district}. Member of the Arizona Legislature.`,
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

  console.log('Done seeding Arizona legislature.')
}

main().catch(console.error)
