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

// Pennsylvania General Assembly — 2025-2026 Session
// 50 State Senators, 203 State Representatives
// Source: legis.state.pa.us

const PA_SENATORS = [
  { name: 'Nikil Saval', district: 1, party: 'democrat' },
  { name: 'Christine Tartaglione', district: 2, party: 'democrat' },
  { name: 'Sharif Street', district: 3, party: 'democrat' },
  { name: 'Arthur Haywood', district: 4, party: 'democrat' },
  { name: 'Jimmy Dillon', district: 5, party: 'democrat' },
  { name: 'John Kane', district: 6, party: 'democrat' },
  { name: 'Vincent Hughes', district: 7, party: 'democrat' },
  { name: 'Tracy Pennycuick', district: 8, party: 'republican' },
  { name: 'Frank Farry', district: 9, party: 'republican' },
  { name: 'Steve Santarsiero', district: 10, party: 'democrat' },
  { name: 'Ryan Aument', district: 11, party: 'republican' },
  { name: 'Maria Collett', district: 12, party: 'democrat' },
  { name: 'Scott Martin', district: 13, party: 'republican' },
  { name: 'Nick Miller', district: 14, party: 'democrat' },
  { name: 'Pat Browne', district: 15, party: 'republican' },
  { name: 'Jarrett Coleman', district: 16, party: 'republican' },
  { name: 'Amanda Cappelletti', district: 17, party: 'democrat' },
  { name: 'Lisa Boscola', district: 18, party: 'democrat' },
  { name: 'Cris Dush', district: 19, party: 'republican' },
  { name: 'Chris Gebhard', district: 20, party: 'republican' },
  { name: 'Greg Rothman', district: 21, party: 'republican' },
  { name: 'Dave Argall', district: 22, party: 'republican' },
  { name: 'Rosemary Brown', district: 23, party: 'republican' },
  { name: 'Rosemary Brown', district: 24, party: 'republican' },
  { name: 'Marty Flynn', district: 25, party: 'democrat' },
  { name: 'Anthony Williams', district: 26, party: 'democrat' },
  { name: 'John Gordner', district: 27, party: 'republican' },
  { name: 'Kristin Phillips-Hill', district: 28, party: 'republican' },
  { name: 'Michele Brooks', district: 29, party: 'republican' },
  { name: 'Judy Ward', district: 30, party: 'republican' },
  { name: 'Mike Regan', district: 31, party: 'republican' },
  { name: 'Joe Pittman', district: 32, party: 'republican' },
  { name: 'Devlin Robinson', district: 33, party: 'republican' },
  { name: 'Camera Bartolotta', district: 34, party: 'republican' },
  { name: 'Tim Kearney', district: 35, party: 'democrat' },
  { name: 'Wayne Langerholc', district: 36, party: 'republican' },
  { name: 'Lindsey Williams', district: 37, party: 'democrat' },
  { name: 'Jay Costa', district: 38, party: 'democrat' },
  { name: 'Kim Ward', district: 39, party: 'republican' },
  { name: 'Dan Laughlin', district: 40, party: 'republican' },
  { name: 'Lisa Baker', district: 41, party: 'republican' },
  { name: 'Jim Brewster', district: 42, party: 'democrat' },
  { name: 'Gene Yaw', district: 43, party: 'republican' },
  { name: 'Katie Muth', district: 44, party: 'democrat' },
  { name: 'Bob Mensch', district: 45, party: 'republican' },
  { name: 'Pat Stefano', district: 46, party: 'republican' },
  { name: 'Elder Vogel Jr.', district: 47, party: 'republican' },
  { name: 'Chris Gebhard', district: 48, party: 'republican' },
  { name: 'Dan Clymer', district: 49, party: 'republican' },
  { name: 'Doug Mastriano', district: 50, party: 'republican' },
]

const PA_REPS = [
  { name: 'Patrick Harkins', district: 1, party: 'democrat' },
  { name: 'Robert Merski', district: 2, party: 'democrat' },
  { name: 'Ryan Bizzarro', district: 3, party: 'democrat' },
  { name: 'Curtis Sonney', district: 4, party: 'republican' },
  { name: 'Barry Jozwiak', district: 5, party: 'republican' },
  { name: 'Brad Roae', district: 6, party: 'republican' },
  { name: 'Parke Wentling', district: 7, party: 'republican' },
  { name: 'Aaron Bernstine', district: 8, party: 'republican' },
  { name: 'Chris Sainato', district: 9, party: 'democrat' },
  { name: 'Jack Rader', district: 10, party: 'republican' },
  { name: 'Marci Mustello', district: 11, party: 'republican' },
  { name: 'Marla Brown', district: 12, party: 'republican' },
  { name: 'John Lawrence', district: 13, party: 'republican' },
  { name: 'Jim Marshall', district: 14, party: 'republican' },
  { name: 'Joshua Kail', district: 15, party: 'republican' },
  { name: 'Rob Matzie', district: 16, party: 'democrat' },
  { name: 'Jason Ortitay', district: 17, party: 'republican' },
  { name: 'Greg Vitali', district: 18, party: 'democrat' },
  { name: 'Valerie Gaydos', district: 19, party: 'republican' },
  { name: 'Emily Kinkead', district: 20, party: 'democrat' },
  { name: 'Sara Innamorato', district: 21, party: 'democrat' },
  { name: 'Aerion Abney', district: 22, party: 'democrat' },
  { name: 'Dan Frankel', district: 23, party: 'democrat' },
  { name: "La'Tasha Mayes", district: 24, party: 'democrat' },
  { name: 'Brandon Markosek', district: 25, party: 'democrat' },
  { name: 'Mandy Steele', district: 26, party: 'democrat' },
  { name: 'Daniel Miller', district: 27, party: 'democrat' },
  { name: 'Rob Mercuri', district: 28, party: 'republican' },
  { name: 'K.C. Tomlinson', district: 29, party: 'republican' },
  { name: 'Arvind Venkat', district: 30, party: 'democrat' },
  { name: 'Perry Warren', district: 31, party: 'democrat' },
  { name: 'Joe Hogan', district: 32, party: 'democrat' },
  { name: 'Matt Gabler', district: 33, party: 'republican' },
  { name: 'Jim Struzzi', district: 34, party: 'republican' },
  { name: 'Matt Bradford', district: 35, party: 'democrat' },
  { name: 'Jessica Benham', district: 36, party: 'democrat' },
  { name: 'Nick Pisciottano', district: 37, party: 'democrat' },
  { name: 'Austin Davis', district: 38, party: 'democrat' },
  { name: 'Andrew Kuzma', district: 39, party: 'republican' },
  { name: 'Natalie Mihalek', district: 40, party: 'republican' },
  { name: 'Brett Miller', district: 41, party: 'republican' },
  { name: 'Jim Rigby', district: 42, party: 'republican' },
  { name: 'Torren Ecker', district: 43, party: 'republican' },
  { name: 'Bud Cook', district: 44, party: 'republican' },
  { name: 'Jason Iovino', district: 45, party: 'democrat' },
  { name: 'Charity Grimm Krupa', district: 46, party: 'republican' },
  { name: 'Keith Gillespie', district: 47, party: 'republican' },
  { name: 'Dan Deasy', district: 48, party: 'democrat' },
  { name: 'Frank Burns', district: 49, party: 'democrat' },
  { name: 'Pam Snyder', district: 50, party: 'democrat' },
  { name: 'Matthew Dowling', district: 51, party: 'republican' },
  { name: 'Ryan Warner', district: 52, party: 'republican' },
  { name: 'George Dunbar', district: 56, party: 'republican' },
  { name: 'Eric Davanzo', district: 58, party: 'republican' },
  { name: 'Mike Reese', district: 59, party: 'republican' },
  { name: 'Mike Puskaric', district: 39, party: 'republican' },
  { name: 'Donna Oberlander', district: 63, party: 'republican' },
  { name: 'R. Lee James', district: 64, party: 'republican' },
  { name: 'Kathy Rapp', district: 65, party: 'republican' },
  { name: 'Brian Smith', district: 66, party: 'republican' },
  { name: 'Martin Causer', district: 67, party: 'republican' },
  { name: 'Clint Owlett', district: 68, party: 'republican' },
  { name: 'Carl Metzgar', district: 69, party: 'republican' },
  { name: 'Tommy Sankey', district: 73, party: 'republican' },
  { name: 'Mike Armanini', district: 75, party: 'republican' },
  { name: 'Stephanie Borowicz', district: 76, party: 'republican' },
  { name: 'Scott Conklin', district: 77, party: 'democrat' },
  { name: 'Jesse Topper', district: 78, party: 'republican' },
  { name: 'Lou Schmitt', district: 79, party: 'republican' },
  { name: 'Jim Gregory', district: 80, party: 'republican' },
  { name: 'Rich Irvin', district: 81, party: 'republican' },
  { name: 'John Hershey', district: 82, party: 'republican' },
  { name: 'Joe Hamm', district: 84, party: 'republican' },
  { name: 'David Rowe', district: 85, party: 'republican' },
  { name: 'Rob Kauffman', district: 89, party: 'republican' },
  { name: 'Paul Schemel', district: 90, party: 'republican' },
  { name: 'Dan Moul', district: 91, party: 'republican' },
  { name: 'Dawn Keefer', district: 92, party: 'republican' },
  { name: 'Mike Jones', district: 93, party: 'republican' },
  { name: 'Stan Saylor', district: 94, party: 'republican' },
  { name: 'Carol Hill-Evans', district: 95, party: 'democrat' },
  { name: 'Mike Sturla', district: 96, party: 'democrat' },
  { name: 'Steven Mentzer', district: 97, party: 'republican' },
  { name: 'David Hickernell', district: 98, party: 'republican' },
  { name: 'Dave Zimmerman', district: 99, party: 'republican' },
  { name: 'Bryan Cutler', district: 100, party: 'republican' },
  { name: 'Frank Ryan', district: 101, party: 'republican' },
  { name: 'Russ Diamond', district: 102, party: 'republican' },
  { name: 'Patty Kim', district: 103, party: 'democrat' },
  { name: 'Sue Helm', district: 104, party: 'republican' },
  { name: 'Andrew Lewis', district: 105, party: 'republican' },
  { name: 'Tom Mehaffie', district: 106, party: 'republican' },
  { name: 'Jonathan Fritz', district: 111, party: 'republican' },
  { name: 'Jim Haddock', district: 112, party: 'democrat' },
  { name: 'Kyle Mullins', district: 113, party: 'democrat' },
  { name: 'Bridget Kosierowski', district: 114, party: 'democrat' },
  { name: 'Maureen Madden', district: 115, party: 'democrat' },
  { name: 'Dane Watro', district: 116, party: 'republican' },
  { name: 'Karen Boback', district: 117, party: 'republican' },
  { name: 'Alec Ryncavage', district: 119, party: 'republican' },
  { name: 'Aaron Kaufer', district: 120, party: 'republican' },
  { name: 'Eddie Day Pashinski', district: 121, party: 'democrat' },
  { name: 'Tina Pickett', district: 110, party: 'republican' },
  { name: 'Tim Twardzik', district: 123, party: 'republican' },
  { name: 'Jerry Knowles', district: 124, party: 'republican' },
  { name: 'Joe Kerwin', district: 125, party: 'republican' },
  { name: 'Mark Rozzi', district: 126, party: 'democrat' },
  { name: 'Manuel Guzman Jr.', district: 127, party: 'democrat' },
  { name: 'Mark Gillen', district: 128, party: 'republican' },
  { name: 'Jim Cox', district: 129, party: 'republican' },
  { name: 'John Schlegel', district: 130, party: 'republican' },
  { name: 'Milou Mackenzie', district: 131, party: 'republican' },
  { name: 'Mike Schlossberg', district: 132, party: 'democrat' },
  { name: 'Jeanne McNeill', district: 133, party: 'democrat' },
  { name: 'Ryan Mackenzie', district: 134, party: 'republican' },
  { name: 'Steve Samuelson', district: 135, party: 'democrat' },
  { name: 'Bob Freeman', district: 136, party: 'democrat' },
  { name: 'Joe Emrick', district: 137, party: 'republican' },
  { name: 'Ann Flood', district: 138, party: 'republican' },
  { name: 'Michael Peifer', district: 139, party: 'republican' },
  { name: 'John Galloway', district: 140, party: 'democrat' },
  { name: 'Tina Davis', district: 141, party: 'democrat' },
  { name: 'Joe Hogan', district: 142, party: 'democrat' },
  { name: 'Shelby Labs', district: 143, party: 'republican' },
  { name: 'Brian Munroe', district: 144, party: 'democrat' },
  { name: 'Joe Ciresi', district: 146, party: 'democrat' },
  { name: 'Tim Briggs', district: 149, party: 'democrat' },
  { name: 'Joe Webster', district: 150, party: 'democrat' },
  { name: 'Todd Stephens', district: 151, party: 'republican' },
  { name: 'Nancy Guenst', district: 152, party: 'democrat' },
  { name: 'Ben Sanchez', district: 153, party: 'democrat' },
  { name: 'Napoleon Nelson', district: 154, party: 'democrat' },
  { name: 'Danielle Friel Otten', district: 155, party: 'democrat' },
  { name: 'Dianne Herrin', district: 156, party: 'democrat' },
  { name: 'Christina Sappey', district: 158, party: 'democrat' },
  { name: 'Brian Kirkland', district: 159, party: 'democrat' },
  { name: 'Craig Williams', district: 160, party: 'republican' },
  { name: 'Leanne Krueger', district: 161, party: 'democrat' },
  { name: 'David Delloso', district: 162, party: 'democrat' },
  { name: 'Mike Zabel', district: 163, party: 'democrat' },
  { name: 'Gina Curry', district: 164, party: 'democrat' },
  { name: "Jennifer O'Mara", district: 165, party: 'democrat' },
  { name: 'Kristine Howard', district: 167, party: 'democrat' },
  { name: 'Kate Klunk', district: 169, party: 'republican' },
  { name: 'Martina White', district: 170, party: 'republican' },
  { name: 'Kerry Benninghoff', district: 171, party: 'republican' },
  { name: 'Kevin Boyle', district: 172, party: 'democrat' },
  { name: 'Ed Neilson', district: 174, party: 'democrat' },
  { name: 'Mary Isaacson', district: 175, party: 'democrat' },
  { name: 'Jose Giral', district: 180, party: 'democrat' },
  { name: 'Malcolm Kenyatta', district: 181, party: 'democrat' },
  { name: 'Ben Waxman', district: 182, party: 'democrat' },
  { name: 'Zach Mako', district: 183, party: 'republican' },
  { name: 'Elizabeth Fiedler', district: 184, party: 'democrat' },
  { name: 'Regina Young', district: 185, party: 'democrat' },
  { name: 'Jordan Harris', district: 186, party: 'democrat' },
  { name: 'Gary Day', district: 187, party: 'republican' },
  { name: 'Rick Krajewski', district: 188, party: 'democrat' },
  { name: 'Tarah Probst', district: 189, party: 'democrat' },
  { name: 'Amen Brown', district: 190, party: 'democrat' },
  { name: 'Joanna McClinton', district: 191, party: 'democrat' },
  { name: 'Morgan Cephas', district: 192, party: 'democrat' },
  { name: 'Donna Bullock', district: 195, party: 'democrat' },
  { name: 'Seth Grove', district: 196, party: 'republican' },
  { name: 'Danilo Burgos', district: 197, party: 'democrat' },
  { name: 'Darisha Parker', district: 198, party: 'democrat' },
  { name: 'Barbara Gleim', district: 199, party: 'republican' },
  { name: 'Chris Rabb', district: 200, party: 'democrat' },
  { name: 'Stephen Kinsey', district: 201, party: 'democrat' },
  { name: 'Jared Solomon', district: 202, party: 'democrat' },
  { name: 'Isabella Fitzgerald', district: 203, party: 'democrat' },
  { name: 'Mary Jo Daley', district: 148, party: 'democrat' },
  { name: 'Angel Cruz', district: 177, party: 'democrat' },
  { name: 'Abigail Salisbury', district: 34, party: 'democrat' },
  { name: 'Peter Schweyer', district: 22, party: 'democrat' },
  { name: 'Tom Jones', district: 55, party: 'republican' },
]

async function main() {
  console.log('Seeding Pennsylvania state legislators...')

  const allPols = []

  for (const s of PA_SENATORS) {
    allPols.push({
      name: s.name,
      slug: slugify(s.name),
      state: 'PA',
      chamber: 'state_senate',
      party: s.party,
      title: `State Senator, District ${s.district}`,
      bio: `Pennsylvania State Senator representing District ${s.district}. Member of the Pennsylvania General Assembly.`,
      image_url: null,
    })
  }

  for (const r of PA_REPS) {
    allPols.push({
      name: r.name,
      slug: slugify(r.name),
      state: 'PA',
      chamber: 'state_house',
      party: r.party,
      title: `State Representative, District ${r.district}`,
      bio: `Pennsylvania State Representative serving District ${r.district}. Member of the Pennsylvania General Assembly.`,
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

  console.log('Done seeding Pennsylvania legislature.')
}

main().catch(console.error)
