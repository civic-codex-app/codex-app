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

// Illinois General Assembly — 103rd (2023-2025) / 104th (2025-2027)
// 59 State Senators, 118 State Representatives
// Sources: ilga.gov

const IL_SENATORS = [
  { name: 'Javier Loera Cervantes', district: 1, party: 'democrat' },
  { name: 'Omar Aquino', district: 2, party: 'democrat' },
  { name: 'Mattie Hunter', district: 3, party: 'democrat' },
  { name: 'Kimberly Lightford', district: 4, party: 'democrat' },
  { name: 'Patricia Van Pelt', district: 5, party: 'democrat' },
  { name: 'Mike Simmons', district: 6, party: 'democrat' },
  { name: 'Mike Porfirio', district: 7, party: 'democrat' },
  { name: 'Ram Villivalam', district: 8, party: 'democrat' },
  { name: 'Robert Peters', district: 9, party: 'democrat' },
  { name: 'Robert Martwick', district: 10, party: 'democrat' },
  { name: 'Celina Villanueva', district: 11, party: 'democrat' },
  { name: 'Willie Preston', district: 12, party: 'democrat' },
  { name: 'Robert Sims', district: 13, party: 'democrat' },
  { name: 'Emil Jones III', district: 14, party: 'democrat' },
  { name: 'Napoleon Harris III', district: 15, party: 'democrat' },
  { name: 'Jacqueline Collins', district: 16, party: 'democrat' },
  { name: 'Elgie Sims Jr.', district: 17, party: 'democrat' },
  { name: 'Bill Cunningham', district: 18, party: 'democrat' },
  { name: 'Michael Hastings', district: 19, party: 'democrat' },
  { name: 'Cristina Castro', district: 20, party: 'democrat' },
  { name: 'Laura Ellman', district: 21, party: 'democrat' },
  { name: 'Cristina Pacione-Zayas', district: 22, party: 'democrat' },
  { name: 'Suzy Glowiak Hilton', district: 23, party: 'democrat' },
  { name: 'Seth Lewis', district: 24, party: 'republican' },
  { name: 'Karina Villa', district: 25, party: 'democrat' },
  { name: 'Dan McConchie', district: 26, party: 'republican' },
  { name: 'Ann Gillespie', district: 27, party: 'democrat' },
  { name: 'Laura Murphy', district: 28, party: 'democrat' },
  { name: 'Julie Morrison', district: 29, party: 'democrat' },
  { name: 'Adriane Johnson', district: 30, party: 'democrat' },
  { name: 'Mary Edly-Allen', district: 31, party: 'democrat' },
  { name: 'Craig Wilcox', district: 32, party: 'republican' },
  { name: 'Don DeWitte', district: 33, party: 'republican' },
  { name: 'Steve Stadelman', district: 34, party: 'democrat' },
  { name: 'Dave Syverson', district: 35, party: 'republican' },
  { name: 'Mike Halpin', district: 36, party: 'democrat' },
  { name: 'Win Stoller', district: 37, party: 'republican' },
  { name: 'Sue Rezin', district: 38, party: 'republican' },
  { name: 'Don Harmon', district: 39, party: 'democrat' },
  { name: 'Patrick Joyce', district: 40, party: 'democrat' },
  { name: 'John Curran', district: 41, party: 'republican' },
  { name: 'Linda Holmes', district: 42, party: 'democrat' },
  { name: 'Eric Mattson', district: 43, party: 'democrat' },
  { name: 'Sally Turner', district: 44, party: 'republican' },
  { name: 'Brian Stewart', district: 45, party: 'republican' },
  { name: 'Dave Koehler', district: 46, party: 'democrat' },
  { name: 'Neil Anderson', district: 47, party: 'republican' },
  { name: 'Doris Turner', district: 48, party: 'democrat' },
  { name: 'Meg Loughran Cappel', district: 49, party: 'democrat' },
  { name: 'Tom Bennett', district: 50, party: 'republican' },
  { name: 'Chapin Rose', district: 51, party: 'republican' },
  { name: 'Scott Bennett', district: 52, party: 'democrat' },
  { name: 'Jason Plummer', district: 53, party: 'republican' },
  { name: 'Steve McClure', district: 54, party: 'republican' },
  { name: 'Jason Barickman', district: 55, party: 'republican' },
  { name: 'Erica Harriss', district: 56, party: 'republican' },
  { name: 'Christopher Belt', district: 57, party: 'democrat' },
  { name: 'Terri Bryant', district: 58, party: 'republican' },
  { name: 'Dale Fowler', district: 59, party: 'republican' },
]

const IL_REPS = [
  { name: 'Aaron Ortiz', district: 1, party: 'democrat' },
  { name: 'Elizabeth Hernandez', district: 2, party: 'democrat' },
  { name: 'Eva-Dina Delgado', district: 3, party: 'democrat' },
  { name: 'Lilian Jimenez', district: 4, party: 'democrat' },
  { name: 'Lamont Robinson Jr.', district: 5, party: 'democrat' },
  { name: 'Sonya Harper', district: 6, party: 'democrat' },
  { name: 'Chris Bos', district: 7, party: 'democrat' },
  { name: 'La Shawn Ford', district: 8, party: 'democrat' },
  { name: 'Lakesia Collins', district: 9, party: 'democrat' },
  { name: 'Jawaharial Williams', district: 10, party: 'democrat' },
  { name: 'Ann Williams', district: 11, party: 'democrat' },
  { name: 'Margaret Croke', district: 12, party: 'democrat' },
  { name: 'Hoan Huynh', district: 13, party: 'democrat' },
  { name: 'Kelly Cassidy', district: 14, party: 'democrat' },
  { name: 'Michael Kelly', district: 15, party: 'democrat' },
  { name: 'Denyse Stoneback', district: 16, party: 'democrat' },
  { name: 'Jennifer Gong-Gershowitz', district: 17, party: 'democrat' },
  { name: 'Robyn Gabel', district: 18, party: 'democrat' },
  { name: 'Lindsey LaPointe', district: 19, party: 'democrat' },
  { name: 'Brad Stephens', district: 20, party: 'republican' },
  { name: 'Michael Walsh', district: 21, party: 'democrat' },
  { name: 'Angelica Guerrero-Cuellar', district: 22, party: 'democrat' },
  { name: 'Edgar Gonzalez Jr.', district: 23, party: 'democrat' },
  { name: 'Theresa Mah', district: 24, party: 'democrat' },
  { name: 'Curtis Tarver II', district: 25, party: 'democrat' },
  { name: 'Kam Buckner', district: 26, party: 'democrat' },
  { name: 'Justin Slaughter', district: 27, party: 'democrat' },
  { name: 'Robert Rita', district: 28, party: 'democrat' },
  { name: 'Thaddeus Jones', district: 29, party: 'democrat' },
  { name: 'Will Davis', district: 30, party: 'democrat' },
  { name: 'Mary Beth Canty', district: 31, party: 'democrat' },
  { name: 'Cyril Nichols', district: 32, party: 'democrat' },
  { name: 'Marcus Evans Jr.', district: 33, party: 'democrat' },
  { name: 'Nicholas Smith', district: 34, party: 'democrat' },
  { name: 'Frances Ann Hurley', district: 35, party: 'democrat' },
  { name: 'Kelly Burke', district: 36, party: 'democrat' },
  { name: 'Tim Ozinga', district: 37, party: 'republican' },
  { name: 'Debbie Meyers-Martin', district: 38, party: 'democrat' },
  { name: 'Will Guzzardi', district: 39, party: 'democrat' },
  { name: 'Jaime Andrade Jr.', district: 40, party: 'democrat' },
  { name: 'Janet Yang Rohr', district: 41, party: 'democrat' },
  { name: 'Terra Costa Howard', district: 42, party: 'democrat' },
  { name: 'Anna Moeller', district: 43, party: 'democrat' },
  { name: 'Fred Crespo', district: 44, party: 'democrat' },
  { name: 'Jenn Ladisch Douglass', district: 45, party: 'democrat' },
  { name: 'Diane Blair-Sherlock', district: 46, party: 'democrat' },
  { name: 'Amy Grant', district: 47, party: 'republican' },
  { name: 'Jennifer Sanalitro', district: 48, party: 'republican' },
  { name: 'Maura Hirschauer', district: 49, party: 'democrat' },
  { name: 'Mary Morgan', district: 50, party: 'democrat' },
  { name: 'Nabeela Syed', district: 51, party: 'democrat' },
  { name: 'Martin McLaughlin', district: 52, party: 'republican' },
  { name: 'Mark Walker', district: 53, party: 'democrat' },
  { name: 'Mary Beth Hernandez', district: 54, party: 'democrat' },
  { name: 'Marty Moylan', district: 55, party: 'democrat' },
  { name: 'Michelle Mussman', district: 56, party: 'democrat' },
  { name: 'Jonathan Carroll', district: 57, party: 'democrat' },
  { name: 'Bob Morgan', district: 58, party: 'democrat' },
  { name: 'Daniel Didech', district: 59, party: 'democrat' },
  { name: 'Rita Mayfield', district: 60, party: 'democrat' },
  { name: 'Joyce Mason', district: 61, party: 'democrat' },
  { name: 'Laura Faver Dias', district: 62, party: 'democrat' },
  { name: 'Steven Reick', district: 63, party: 'republican' },
  { name: 'Tom Weber', district: 64, party: 'republican' },
  { name: 'Dan Ugaste', district: 65, party: 'republican' },
  { name: 'Suzanne Ness', district: 66, party: 'democrat' },
  { name: 'Maurice West', district: 67, party: 'democrat' },
  { name: 'Dave Vella', district: 68, party: 'democrat' },
  { name: 'Joe Sosnowski', district: 69, party: 'republican' },
  { name: 'Jeff Keicher', district: 70, party: 'republican' },
  { name: 'Daniel Swanson', district: 71, party: 'republican' },
  { name: 'Michael Halpin', district: 72, party: 'democrat' },
  { name: 'Ryan Spain', district: 73, party: 'republican' },
  { name: 'Sharon Chung', district: 74, party: 'democrat' },
  { name: 'John Cabello', district: 75, party: 'republican' },
  { name: 'Lance Yednock', district: 76, party: 'democrat' },
  { name: 'Jed Davis', district: 77, party: 'republican' },
  { name: 'Harry Benton', district: 78, party: 'democrat' },
  { name: 'Jackie Haas', district: 79, party: 'republican' },
  { name: 'Natalie Manley', district: 80, party: 'democrat' },
  { name: 'Anne Stava-Murray', district: 81, party: 'democrat' },
  { name: 'Jim Merikas', district: 82, party: 'republican' },
  { name: 'Matt Hanson', district: 83, party: 'democrat' },
  { name: 'Stephanie Kifowit', district: 84, party: 'democrat' },
  { name: 'Dagmara Avelar', district: 85, party: 'democrat' },
  { name: 'Larry Walsh Jr.', district: 86, party: 'democrat' },
  { name: 'Natalie Kahler', district: 87, party: 'democrat' },
  { name: 'Amy Elik', district: 88, party: 'republican' },
  { name: 'Tony McCombie', district: 89, party: 'republican' },
  { name: 'Norine Hammond', district: 90, party: 'republican' },
  { name: 'Mark Luft', district: 91, party: 'republican' },
  { name: 'Jehan Gordon-Booth', district: 92, party: 'democrat' },
  { name: 'Travis Weaver', district: 93, party: 'republican' },
  { name: 'Randy Frese', district: 94, party: 'republican' },
  { name: 'Avery Bourne', district: 95, party: 'republican' },
  { name: 'Sue Scherer', district: 96, party: 'democrat' },
  { name: 'Harry Benton', district: 97, party: 'democrat' },
  { name: 'Wayne Rosenthal', district: 98, party: 'republican' },
  { name: 'Sandy Hamilton', district: 99, party: 'republican' },
  { name: 'C.D. Davidsmeyer', district: 100, party: 'republican' },
  { name: 'Chris Miller', district: 101, party: 'republican' },
  { name: 'Brad Halbrook', district: 102, party: 'republican' },
  { name: 'Carol Ammons', district: 103, party: 'democrat' },
  { name: 'Mike Marron', district: 104, party: 'republican' },
  { name: 'Dennis Tipsword Jr.', district: 105, party: 'republican' },
  { name: 'Jason Bunting', district: 106, party: 'republican' },
  { name: 'Blaine Wilhour', district: 107, party: 'republican' },
  { name: 'Charles Meier', district: 108, party: 'republican' },
  { name: 'Adam Niemerg', district: 109, party: 'republican' },
  { name: 'Charlie Meier', district: 110, party: 'republican' },
  { name: 'Dustin Peterson', district: 111, party: 'republican' },
  { name: 'Katie Stuart', district: 112, party: 'democrat' },
  { name: 'Jay Hoffman', district: 113, party: 'democrat' },
  { name: 'LaToya Greenwood', district: 114, party: 'democrat' },
  { name: 'Kevin Schmidt', district: 115, party: 'republican' },
  { name: 'Dave Severin', district: 116, party: 'republican' },
  { name: 'Patrick Windhorst', district: 117, party: 'republican' },
  { name: 'Paul Jacobs', district: 118, party: 'republican' },
]

async function main() {
  console.log('Seeding Illinois state legislators...')

  const allPols = []

  for (const s of IL_SENATORS) {
    allPols.push({
      name: s.name,
      slug: slugify(s.name),
      state: 'IL',
      chamber: 'state_senate',
      party: s.party,
      title: `State Senator, District ${s.district}`,
      bio: `Illinois State Senator representing District ${s.district}. Member of the Illinois General Assembly.`,
      image_url: null,
    })
  }

  for (const r of IL_REPS) {
    allPols.push({
      name: r.name,
      slug: slugify(r.name),
      state: 'IL',
      chamber: 'state_house',
      party: r.party,
      title: `State Representative, District ${r.district}`,
      bio: `Illinois State Representative serving District ${r.district}. Member of the Illinois General Assembly.`,
      image_url: null,
    })
  }

  // Deduplicate by slug (in case of duplicate names)
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

  console.log('Done seeding Illinois legislature.')
}

main().catch(console.error)
