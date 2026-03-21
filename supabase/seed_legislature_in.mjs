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

// Indiana General Assembly — 124th (2025-2026)
// 50 State Senators, 100 State Representatives
// Source: iga.in.gov

const IN_SENATORS = [
  { name: 'Rick Niemeyer', district: 1, party: 'republican' },
  { name: 'Lonnie Randolph', district: 2, party: 'democrat' },
  { name: 'Mark Messmer', district: 3, party: 'republican' },
  { name: 'Mike Bohacek', district: 4, party: 'republican' },
  { name: 'Ed Charbonneau', district: 5, party: 'republican' },
  { name: 'Rick Niemeyer', district: 6, party: 'republican' },
  { name: 'Brian Buchanan', district: 7, party: 'republican' },
  { name: 'Mike Gaskill', district: 8, party: 'republican' },
  { name: 'Ryan Mishler', district: 9, party: 'republican' },
  { name: 'David Niezgodski', district: 10, party: 'democrat' },
  { name: 'Linda Rogers', district: 11, party: 'republican' },
  { name: 'Blake Doriot', district: 12, party: 'republican' },
  { name: 'Susan Glick', district: 13, party: 'republican' },
  { name: 'Tyler Johnson', district: 14, party: 'republican' },
  { name: 'Liz Brown', district: 15, party: 'republican' },
  { name: 'Justin Busch', district: 16, party: 'republican' },
  { name: 'Andy Zay', district: 17, party: 'republican' },
  { name: 'Stacey Donato', district: 18, party: 'republican' },
  { name: 'Travis Holdman', district: 19, party: 'republican' },
  { name: 'Scott Baldwin', district: 20, party: 'republican' },
  { name: 'James Buck', district: 21, party: 'republican' },
  { name: 'Ron Alting', district: 22, party: 'republican' },
  { name: 'Spencer Deery', district: 23, party: 'republican' },
  { name: 'John Crane', district: 24, party: 'republican' },
  { name: 'Mike Braun', district: 25, party: 'republican' },
  { name: 'Jeff Raatz', district: 26, party: 'republican' },
  { name: 'Jeff Thompson', district: 27, party: 'republican' },
  { name: 'Michael Crider', district: 28, party: 'republican' },
  { name: 'J.D. Ford', district: 29, party: 'democrat' },
  { name: 'John Ruckelshaus', district: 30, party: 'republican' },
  { name: 'Kyle Walker', district: 31, party: 'republican' },
  { name: 'Aaron Freeman', district: 32, party: 'republican' },
  { name: 'Greg Taylor', district: 33, party: 'democrat' },
  { name: 'La Keisha Jackson', district: 34, party: 'democrat' },
  { name: 'Andrea Hunley', district: 35, party: 'democrat' },
  { name: 'Jack Sandlin', district: 36, party: 'republican' },
  { name: 'Rodric Bray', district: 37, party: 'republican' },
  { name: 'Jessica Brown', district: 38, party: 'democrat' },
  { name: 'Eric Bassler', district: 39, party: 'republican' },
  { name: 'Shelli Yoder', district: 40, party: 'democrat' },
  { name: 'Greg Walker', district: 41, party: 'republican' },
  { name: 'Jean Leising', district: 42, party: 'republican' },
  { name: 'Randy Maxwell', district: 43, party: 'republican' },
  { name: 'Eric Koch', district: 44, party: 'republican' },
  { name: 'Chris Garten', district: 45, party: 'republican' },
  { name: 'Cyndi Carrasco', district: 46, party: 'republican' },
  { name: 'Gary Byrne', district: 47, party: 'republican' },
  { name: 'Mark Stoops', district: 48, party: 'democrat' },
  { name: 'Chip Perfect', district: 49, party: 'republican' },
  { name: 'Vaneta Becker', district: 50, party: 'republican' },
]

const IN_REPS = [
  { name: 'Carolyn Jackson', district: 1, party: 'democrat' },
  { name: 'Earl Harris Jr.', district: 2, party: 'democrat' },
  { name: 'Ragen Hatcher', district: 3, party: 'democrat' },
  { name: 'Ed Soliday', district: 4, party: 'republican' },
  { name: 'Dale DeVon', district: 5, party: 'republican' },
  { name: 'Maureen Bauer', district: 6, party: 'democrat' },
  { name: 'Jake Teshka', district: 7, party: 'republican' },
  { name: 'Ryan Dvorak', district: 8, party: 'democrat' },
  { name: 'Robb Greene', district: 9, party: 'republican' },
  { name: 'Chuck Moseley', district: 10, party: 'democrat' },
  { name: 'Michael Aylesworth', district: 11, party: 'republican' },
  { name: 'Mike Aylesworth', district: 12, party: 'republican' },
  { name: 'Sharon Negele', district: 13, party: 'republican' },
  { name: 'Vernon Smith', district: 14, party: 'democrat' },
  { name: 'Harold Slager', district: 15, party: 'republican' },
  { name: 'Dennis Zent', district: 16, party: 'republican' },
  { name: 'Jack Jordan', district: 17, party: 'republican' },
  { name: 'David Abbott', district: 18, party: 'republican' },
  { name: 'Julie Olthoff', district: 19, party: 'republican' },
  { name: 'Jim Pressel', district: 20, party: 'republican' },
  { name: 'Timothy Wesco', district: 21, party: 'republican' },
  { name: 'Curt Nisly', district: 22, party: 'republican' },
  { name: 'Ethan Manning', district: 23, party: 'republican' },
  { name: 'Donna Schaibley', district: 24, party: 'republican' },
  { name: 'Becky Cash', district: 25, party: 'republican' },
  { name: 'Chris Jeter', district: 26, party: 'republican' },
  { name: 'Sheila Klinker', district: 27, party: 'democrat' },
  { name: 'Jeffrey Thompson', district: 28, party: 'republican' },
  { name: 'Chuck Goodrich', district: 29, party: 'republican' },
  { name: 'Michael Karickhoff', district: 30, party: 'republican' },
  { name: 'Ann Vermilion', district: 31, party: 'republican' },
  { name: 'Victoria Garcia Wilburn', district: 32, party: 'democrat' },
  { name: 'John Jacob', district: 33, party: 'republican' },
  { name: 'Sue Errington', district: 34, party: 'democrat' },
  { name: 'Elizabeth Rowray', district: 35, party: 'republican' },
  { name: 'Kyle Miller', district: 36, party: 'republican' },
  { name: 'Todd Huston', district: 37, party: 'republican' },
  { name: 'Heath VanNatter', district: 38, party: 'republican' },
  { name: 'Jerry Torr', district: 39, party: 'republican' },
  { name: 'Greg Steuerwald', district: 40, party: 'republican' },
  { name: 'Mark Genda', district: 41, party: 'republican' },
  { name: 'Alan Morrison', district: 42, party: 'republican' },
  { name: 'Tonya Pfaff', district: 43, party: 'democrat' },
  { name: 'Beau Baird', district: 44, party: 'republican' },
  { name: 'Bruce Borders', district: 45, party: 'republican' },
  { name: 'Bob Heaton', district: 46, party: 'republican' },
  { name: 'John Young', district: 47, party: 'republican' },
  { name: 'Doug Miller', district: 48, party: 'republican' },
  { name: 'Joanna King', district: 49, party: 'republican' },
  { name: 'Dan Leonard', district: 50, party: 'republican' },
  { name: 'Tony Cook', district: 51, party: 'republican' },
  { name: 'Ben Smaltz', district: 52, party: 'republican' },
  { name: 'Bob Morris', district: 53, party: 'republican' },
  { name: 'Curt Nisly', district: 54, party: 'republican' },
  { name: 'Dave Heine', district: 55, party: 'republican' },
  { name: 'Brad Barrett', district: 56, party: 'republican' },
  { name: 'Craig Snow', district: 57, party: 'republican' },
  { name: 'Michelle Davis', district: 58, party: 'republican' },
  { name: 'Ryan Lauer', district: 59, party: 'republican' },
  { name: 'Peggy Mayfield', district: 60, party: 'republican' },
  { name: 'Matt Pierce', district: 61, party: 'democrat' },
  { name: 'Dave Hall', district: 62, party: 'republican' },
  { name: 'Shane Lindauer', district: 63, party: 'republican' },
  { name: 'Matt Hostettler', district: 64, party: 'republican' },
  { name: 'Chris May', district: 65, party: 'republican' },
  { name: 'Zach Payne', district: 66, party: 'republican' },
  { name: 'Alex Zimmerman', district: 67, party: 'republican' },
  { name: 'Garrett Bascom', district: 68, party: 'republican' },
  { name: 'Jim Lucas', district: 69, party: 'republican' },
  { name: 'Karen Engleman', district: 70, party: 'republican' },
  { name: 'Rita Fleming', district: 71, party: 'democrat' },
  { name: 'Ed Clere', district: 72, party: 'republican' },
  { name: 'Jennifer Meltzer', district: 73, party: 'republican' },
  { name: 'Steve Bartels', district: 74, party: 'republican' },
  { name: 'Cindy Ledbetter', district: 75, party: 'republican' },
  { name: 'Wendy McNamara', district: 76, party: 'republican' },
  { name: 'Rabb Sims', district: 77, party: 'republican' },
  { name: 'Tim O\'Brien', district: 78, party: 'republican' },
  { name: 'Matthew Lehman', district: 79, party: 'republican' },
  { name: 'Phil GiaQuinta', district: 80, party: 'democrat' },
  { name: 'Martin Carbaugh', district: 81, party: 'republican' },
  { name: 'Dave Heine', district: 82, party: 'republican' },
  { name: 'Chris Campbell', district: 83, party: 'democrat' },
  { name: 'Bob Cherry', district: 84, party: 'republican' },
  { name: 'Sean Eberhart', district: 85, party: 'republican' },
  { name: 'Ed DeLaney', district: 86, party: 'democrat' },
  { name: 'Carey Hamilton', district: 87, party: 'democrat' },
  { name: 'Chris Jeter', district: 88, party: 'republican' },
  { name: 'Mitch Gore', district: 89, party: 'democrat' },
  { name: 'Mike Speedy', district: 90, party: 'republican' },
  { name: 'Robert Behning', district: 91, party: 'republican' },
  { name: 'Renee Pack', district: 92, party: 'democrat' },
  { name: 'John Bartlett', district: 93, party: 'democrat' },
  { name: 'Cherrish Pryor', district: 94, party: 'democrat' },
  { name: 'Cindy Ziemke', district: 95, party: 'republican' },
  { name: 'Greg Porter', district: 96, party: 'democrat' },
  { name: 'Justin Moed', district: 97, party: 'democrat' },
  { name: 'Robin Shackleford', district: 98, party: 'democrat' },
  { name: 'Vanessa Summers', district: 99, party: 'democrat' },
  { name: 'Blake Johnson', district: 100, party: 'republican' },
]

async function main() {
  console.log('Seeding Indiana state legislators...')

  const allPols = []

  for (const s of IN_SENATORS) {
    allPols.push({
      name: s.name,
      slug: slugify(s.name),
      state: 'IN',
      chamber: 'state_senate',
      party: s.party,
      title: `State Senator, District ${s.district}`,
      bio: `Indiana State Senator representing District ${s.district}. Member of the Indiana General Assembly.`,
      image_url: null,
    })
  }

  for (const r of IN_REPS) {
    allPols.push({
      name: r.name,
      slug: slugify(r.name),
      state: 'IN',
      chamber: 'state_house',
      party: r.party,
      title: `State Representative, District ${r.district}`,
      bio: `Indiana State Representative serving District ${r.district}. Member of the Indiana General Assembly.`,
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

  console.log('Done seeding Indiana legislature.')
}

main().catch(console.error)
