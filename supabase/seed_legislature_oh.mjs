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

// Ohio General Assembly — 136th (2025-2026)
// 33 State Senators, 99 State Representatives
// Source: legislature.ohio.gov

const OH_SENATORS = [
  { name: 'Kent Smith', district: 1, party: 'democrat' },
  { name: 'Nickie Antonio', district: 2, party: 'democrat' },
  { name: 'Michele Reynolds', district: 3, party: 'republican' },
  { name: 'Jerry Cirino', district: 4, party: 'republican' },
  { name: 'Nathan Manning', district: 5, party: 'republican' },
  { name: 'Louis Blessing III', district: 6, party: 'republican' },
  { name: 'Niraj Antani', district: 7, party: 'republican' },
  { name: 'Cecil Thomas', district: 8, party: 'democrat' },
  { name: 'Steve Wilson', district: 9, party: 'republican' },
  { name: 'George Lang', district: 10, party: 'republican' },
  { name: 'Terry Johnson', district: 11, party: 'republican' },
  { name: 'Matt Dolan', district: 12, party: 'republican' },
  { name: 'Senate District 13', district: 13, party: 'republican' },
  { name: 'Shane Wilkin', district: 14, party: 'republican' },
  { name: 'Hearcel Craig', district: 15, party: 'democrat' },
  { name: 'Stephanie Kunze', district: 16, party: 'republican' },
  { name: 'Tim Schaffer', district: 17, party: 'republican' },
  { name: 'Jay Hottinger', district: 18, party: 'republican' },
  { name: 'Andrew Brenner', district: 19, party: 'republican' },
  { name: 'Bill Reineke', district: 20, party: 'republican' },
  { name: 'Mark Romanchuk', district: 21, party: 'republican' },
  { name: 'Mark Hiner', district: 22, party: 'republican' },
  { name: 'Theresa Gavarone', district: 23, party: 'republican' },
  { name: 'Bill Roemer', district: 24, party: 'republican' },
  { name: 'Dontavius Jarrells', district: 25, party: 'democrat' },
  { name: 'Rob McColley', district: 26, party: 'republican' },
  { name: 'Kristina Roegner', district: 27, party: 'republican' },
  { name: 'Vernon Sykes', district: 28, party: 'democrat' },
  { name: 'Kirk Schuring', district: 29, party: 'republican' },
  { name: 'Frank Hoagland', district: 30, party: 'republican' },
  { name: 'Sandra O\'Brien', district: 31, party: 'republican' },
  { name: 'Michael Rulli', district: 32, party: 'republican' },
  { name: 'Al Cutrona', district: 33, party: 'republican' },
]

const OH_REPS = [
  { name: 'Dani Isaacsohn', district: 1, party: 'democrat' },
  { name: 'Cindy Abrams', district: 2, party: 'republican' },
  { name: 'Cecil Thomas Jr.', district: 3, party: 'democrat' },
  { name: 'Bernadine Kennedy Kent', district: 4, party: 'democrat' },
  { name: 'Steve Demetriou', district: 5, party: 'republican' },
  { name: 'Adam Bird', district: 6, party: 'republican' },
  { name: 'Thomas Hall', district: 7, party: 'republican' },
  { name: 'Rodney Creech', district: 8, party: 'republican' },
  { name: 'Nick Kick', district: 9, party: 'republican' },
  { name: 'Justin Pizzulli', district: 10, party: 'republican' },
  { name: 'Mike Loychik', district: 11, party: 'republican' },
  { name: 'Brian Lorenz', district: 12, party: 'republican' },
  { name: 'Angela Phelps', district: 13, party: 'democrat' },
  { name: 'Sean Brennan', district: 14, party: 'democrat' },
  { name: 'Richard Dell\'Aquila', district: 15, party: 'democrat' },
  { name: 'Bride Rose Sweeney', district: 16, party: 'democrat' },
  { name: 'Tom Patton', district: 17, party: 'republican' },
  { name: 'Juanita Brent', district: 18, party: 'democrat' },
  { name: 'Phil Robinson', district: 19, party: 'democrat' },
  { name: 'Terrence Upchurch', district: 20, party: 'democrat' },
  { name: 'Elliot Forhan', district: 21, party: 'democrat' },
  { name: 'David Leland', district: 22, party: 'democrat' },
  { name: 'Daniel Troy', district: 23, party: 'democrat' },
  { name: 'Jamie Callender', district: 24, party: 'republican' },
  { name: 'Gayle Manning', district: 25, party: 'republican' },
  { name: 'Dave Dobos', district: 26, party: 'republican' },
  { name: 'Rachel Baker', district: 27, party: 'democrat' },
  { name: 'Sedrick Denson', district: 28, party: 'democrat' },
  { name: 'Elgin Rogers Jr.', district: 29, party: 'democrat' },
  { name: 'Bill Dean', district: 30, party: 'republican' },
  { name: 'Jeni Benson', district: 31, party: 'democrat' },
  { name: 'Ismail Mohamed', district: 32, party: 'democrat' },
  { name: 'Munira Abdullahi', district: 33, party: 'democrat' },
  { name: 'Kevin Miller', district: 34, party: 'republican' },
  { name: 'Steve Croley', district: 35, party: 'democrat' },
  { name: 'Adam Holmes', district: 36, party: 'republican' },
  { name: 'Jim Hughes', district: 37, party: 'republican' },
  { name: 'Casey Weinstein', district: 38, party: 'democrat' },
  { name: 'Bob Young', district: 39, party: 'republican' },
  { name: 'Tim Barhorst', district: 40, party: 'republican' },
  { name: 'Josh Williams', district: 41, party: 'republican' },
  { name: 'Riordan McClain', district: 42, party: 'republican' },
  { name: 'Thaddeus Claggett', district: 43, party: 'republican' },
  { name: 'Jim Hoops', district: 44, party: 'republican' },
  { name: 'Craig Riedel', district: 45, party: 'republican' },
  { name: 'DJ Swearingen', district: 46, party: 'republican' },
  { name: 'Scott Wiggam', district: 47, party: 'republican' },
  { name: 'Steve Demetriou', district: 48, party: 'republican' },
  { name: 'Darrell Kick', district: 49, party: 'republican' },
  { name: 'Regine Dunkle', district: 50, party: 'democrat' },
  { name: 'Matt King', district: 51, party: 'republican' },
  { name: 'Jon Cross', district: 52, party: 'republican' },
  { name: 'Antwon Alcock', district: 53, party: 'democrat' },
  { name: 'Rick Carfagna', district: 54, party: 'republican' },
  { name: 'Haraz Ghanbari', district: 55, party: 'republican' },
  { name: 'Gary Click', district: 56, party: 'republican' },
  { name: 'Tom Young', district: 57, party: 'republican' },
  { name: 'Brian Stewart', district: 58, party: 'republican' },
  { name: 'Adam Mathews', district: 59, party: 'republican' },
  { name: 'Andrea White', district: 60, party: 'republican' },
  { name: 'Beth Liston', district: 61, party: 'democrat' },
  { name: 'Latyna Humphrey', district: 62, party: 'democrat' },
  { name: 'Richard Brown', district: 63, party: 'democrat' },
  { name: 'Kevin Aveni', district: 64, party: 'republican' },
  { name: 'Roy Klopfenstein', district: 65, party: 'republican' },
  { name: 'Tom Danehy', district: 66, party: 'democrat' },
  { name: 'Melanie Miller', district: 67, party: 'republican' },
  { name: 'Jennifer Gross', district: 68, party: 'republican' },
  { name: 'Bernard Willis', district: 69, party: 'republican' },
  { name: 'Brian Lampton', district: 70, party: 'republican' },
  { name: 'Anjanette Pichler', district: 71, party: 'republican' },
  { name: 'Rachael Morocco', district: 72, party: 'republican' },
  { name: 'Daniel Quinter', district: 73, party: 'democrat' },
  { name: 'Bernard Willis', district: 74, party: 'republican' },
  { name: 'Tex Fischer', district: 75, party: 'republican' },
  { name: 'Dane Shikora', district: 76, party: 'republican' },
  { name: 'Mark Johnson', district: 77, party: 'republican' },
  { name: 'Amy Cox', district: 78, party: 'republican' },
  { name: 'Monica Blasdel', district: 79, party: 'republican' },
  { name: 'Marilyn John', district: 80, party: 'republican' },
  { name: 'Tim Barhorst', district: 81, party: 'republican' },
  { name: 'Jay Edwards', district: 82, party: 'republican' },
  { name: 'Shawn Stevens', district: 83, party: 'republican' },
  { name: 'Bob Peterson', district: 84, party: 'republican' },
  { name: 'Don Jones', district: 85, party: 'republican' },
  { name: 'Tracy Richardson', district: 86, party: 'republican' },
  { name: 'Riordan McClain', district: 87, party: 'republican' },
  { name: 'Bill Seitz', district: 88, party: 'republican' },
  { name: 'Sara Carruthers', district: 89, party: 'republican' },
  { name: 'Al Cutrona', district: 90, party: 'republican' },
  { name: 'Brett Hillyer', district: 91, party: 'republican' },
  { name: 'Mark Fraizer', district: 92, party: 'republican' },
  { name: 'Jason Stephens', district: 93, party: 'republican' },
  { name: 'Jay Edwards', district: 94, party: 'republican' },
  { name: 'Don Jones', district: 95, party: 'republican' },
  { name: 'Ron Ferguson', district: 96, party: 'republican' },
  { name: 'Mike Shoemaker', district: 97, party: 'republican' },
  { name: 'Al Landis', district: 98, party: 'republican' },
  { name: 'Wendi Thomas', district: 99, party: 'republican' },
]

async function main() {
  console.log('Seeding Ohio state legislators...')

  const allPols = []

  // Filter out placeholder entries
  const validSenators = OH_SENATORS.filter(s => !s.name.startsWith('Senate District'))

  for (const s of validSenators) {
    allPols.push({
      name: s.name,
      slug: slugify(s.name),
      state: 'OH',
      chamber: 'state_senate',
      party: s.party,
      title: `State Senator, District ${s.district}`,
      bio: `Ohio State Senator representing District ${s.district}. Member of the Ohio General Assembly.`,
      image_url: null,
    })
  }

  for (const r of OH_REPS) {
    allPols.push({
      name: r.name,
      slug: slugify(r.name),
      state: 'OH',
      chamber: 'state_house',
      party: r.party,
      title: `State Representative, District ${r.district}`,
      bio: `Ohio State Representative serving District ${r.district}. Member of the Ohio General Assembly.`,
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

  console.log('Done seeding Ohio legislature.')
}

main().catch(console.error)
