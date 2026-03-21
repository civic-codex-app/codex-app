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

// ─── Kansas State Senate (40 districts) ─────────────────────────────────
// Source: Kansas Legislature official roster, 2025-2026 session
const senators = [
  { name: 'Dennis Pyle', district: 1, party: 'republican' },
  { name: 'Elaine Bowers', district: 2, party: 'republican' },
  { name: 'Pat Pettey', district: 3, party: 'democrat' },
  { name: 'David Haley', district: 4, party: 'democrat' },
  { name: 'Jeff Pittman', district: 5, party: 'democrat' },
  { name: 'Molly Baumgardner', district: 6, party: 'republican' },
  { name: 'Usha Reddi', district: 7, party: 'democrat' },
  { name: 'Mark Steffen', district: 8, party: 'republican' },
  { name: 'Beverly Gossage', district: 9, party: 'republican' },
  { name: 'Mike Thompson', district: 10, party: 'republican' },
  { name: 'Kellie Warren', district: 11, party: 'republican' },
  { name: 'Caryn Tyson', district: 12, party: 'republican' },
  { name: 'Jeff Longbine', district: 13, party: 'republican' },
  { name: 'Renee Erickson', district: 14, party: 'republican' },
  { name: 'Jeff Klemp', district: 15, party: 'republican' },
  { name: 'Ty Masterson', district: 16, party: 'republican' },
  { name: 'Brenda Dietrich', district: 17, party: 'republican' },
  { name: 'Dinah Sykes', district: 18, party: 'democrat' },
  { name: 'Mike Petersen', district: 19, party: 'republican' },
  { name: 'Virgil Peck', district: 20, party: 'republican' },
  { name: 'Tom Holland', district: 21, party: 'democrat' },
  { name: 'Ethan Corson', district: 22, party: 'democrat' },
  { name: 'Joy Koesten', district: 23, party: 'democrat' },
  { name: 'Rick Wilborn', district: 24, party: 'republican' },
  { name: 'Mike Fagg', district: 25, party: 'republican' },
  { name: 'Dan Kerschen', district: 26, party: 'republican' },
  { name: 'Larry Alley', district: 27, party: 'republican' },
  { name: 'Rick Billinger', district: 28, party: 'republican' },
  { name: 'Ty Masterson', district: 29, party: 'republican' },
  { name: 'Oletha Faust-Goudeau', district: 30, party: 'democrat' },
  { name: 'Cindy Holscher', district: 31, party: 'democrat' },
  { name: 'Rob Olson', district: 32, party: 'republican' },
  { name: 'Alicia Straub', district: 33, party: 'republican' },
  { name: 'Chase Blasi', district: 34, party: 'republican' },
  { name: 'Richard Hilderbrand', district: 35, party: 'republican' },
  { name: 'Marci Francisco', district: 36, party: 'democrat' },
  { name: 'Carolyn McGinn', district: 37, party: 'republican' },
  { name: 'John Doll', district: 38, party: 'republican' },
  { name: 'Clint Tramm', district: 39, party: 'republican' },
  { name: 'Mike Dodson', district: 40, party: 'republican' },
]

// ─── Kansas State House (125 districts) ─────────────────────────────────
const houseMembers = [
  { name: 'Michael Houser', district: 1, party: 'republican' },
  { name: 'Ken Corbet', district: 2, party: 'republican' },
  { name: 'Nick Hoheisel', district: 3, party: 'republican' },
  { name: 'Trevor Jacobs', district: 4, party: 'republican' },
  { name: 'Mark Samsel', district: 5, party: 'republican' },
  { name: 'Leo Delperdang', district: 6, party: 'republican' },
  { name: 'Susan Concannon', district: 7, party: 'republican' },
  { name: 'Michael Murphy', district: 8, party: 'republican' },
  { name: 'Kent Thompson', district: 9, party: 'republican' },
  { name: 'Christina Haswood', district: 10, party: 'democrat' },
  { name: 'Jim Gartner', district: 11, party: 'democrat' },
  { name: 'Tom Burroughs', district: 12, party: 'democrat' },
  { name: 'Jerry Stogsdill', district: 13, party: 'democrat' },
  { name: 'Cindy Neighbor', district: 14, party: 'democrat' },
  { name: 'Jeff Klemp', district: 15, party: 'republican' },
  { name: 'Brett Fairchild', district: 16, party: 'republican' },
  { name: 'Adam Smith', district: 17, party: 'republican' },
  { name: 'Cyndi Howerton', district: 18, party: 'republican' },
  { name: 'Stephanie Clayton', district: 19, party: 'democrat' },
  { name: 'Mari-Lynn Poskin', district: 20, party: 'democrat' },
  { name: 'Rui Xu', district: 21, party: 'democrat' },
  { name: 'Lindsay Vaughn', district: 22, party: 'democrat' },
  { name: 'Susan Ruiz', district: 23, party: 'democrat' },
  { name: 'Jarrod Ousley', district: 24, party: 'democrat' },
  { name: 'Russ Jennings', district: 25, party: 'republican' },
  { name: 'Adam Thomas', district: 26, party: 'republican' },
  { name: 'Sean Tarwater', district: 27, party: 'republican' },
  { name: 'Leah Howell', district: 28, party: 'republican' },
  { name: 'Tobias Schlingensiepen', district: 29, party: 'democrat' },
  { name: 'Brandon Woodard', district: 30, party: 'democrat' },
  { name: 'Jo Ella Hoye', district: 31, party: 'democrat' },
  { name: 'Louis Ruiz', district: 32, party: 'democrat' },
  { name: 'Chris Croft', district: 33, party: 'republican' },
  { name: 'Vic Miller', district: 34, party: 'democrat' },
  { name: 'Mike Dodson', district: 35, party: 'republican' },
  { name: 'Pam Curtis', district: 36, party: 'democrat' },
  { name: 'Val Wiens', district: 37, party: 'republican' },
  { name: 'Francis Awerkamp', district: 38, party: 'republican' },
  { name: 'Owen Donohoe', district: 39, party: 'republican' },
  { name: 'Doug Blex', district: 40, party: 'republican' },
  { name: 'Aaron Coleman', district: 41, party: 'democrat' },
  { name: 'Jeff Essex', district: 42, party: 'republican' },
  { name: 'Marvin Robinson', district: 43, party: 'democrat' },
  { name: 'Broderick Henderson', district: 44, party: 'democrat' },
  { name: 'Melissa Oropeza', district: 45, party: 'democrat' },
  { name: 'KC Ohaebosim', district: 46, party: 'democrat' },
  { name: 'Bill Sutton', district: 47, party: 'republican' },
  { name: 'Pat Proctor', district: 48, party: 'republican' },
  { name: 'Dennis Rex Proehl', district: 49, party: 'republican' },
  { name: 'Troy Waymaster', district: 50, party: 'republican' },
  { name: 'Ron Ellis', district: 51, party: 'republican' },
  { name: 'Mike Amyx', district: 52, party: 'democrat' },
  { name: 'Dennis Taylor', district: 53, party: 'democrat' },
  { name: 'John Carmichael', district: 54, party: 'democrat' },
  { name: 'Heather Meyer', district: 55, party: 'democrat' },
  { name: 'Valdenia Winn', district: 56, party: 'democrat' },
  { name: 'John Alcala', district: 57, party: 'democrat' },
  { name: 'Willie Dove', district: 58, party: 'republican' },
  { name: 'David Younger', district: 59, party: 'republican' },
  { name: 'Jesse Borjon', district: 60, party: 'republican' },
  { name: 'Dan Hawkins', district: 61, party: 'republican' },
  { name: 'Ken Rahjes', district: 62, party: 'republican' },
  { name: 'Barb Wasinger', district: 63, party: 'republican' },
  { name: 'Jack Thimesch', district: 64, party: 'republican' },
  { name: 'Lonnie Clark', district: 65, party: 'republican' },
  { name: 'Brenda Landwehr', district: 66, party: 'republican' },
  { name: 'Karl Miller', district: 67, party: 'republican' },
  { name: 'Jason Probst', district: 68, party: 'democrat' },
  { name: 'Diana Dierks', district: 69, party: 'democrat' },
  { name: 'Brad Ralph', district: 70, party: 'republican' },
  { name: 'Joe Seiwert', district: 71, party: 'republican' },
  { name: 'Tim Hodge', district: 72, party: 'democrat' },
  { name: 'Cheryl Helmer', district: 73, party: 'republican' },
  { name: 'Will Carpenter', district: 74, party: 'republican' },
  { name: 'Les Mason', district: 75, party: 'republican' },
  { name: 'Mark Schreiber', district: 76, party: 'republican' },
  { name: 'Henry Helgerson', district: 77, party: 'democrat' },
  { name: 'John Wheeler', district: 78, party: 'republican' },
  { name: 'Tory Arnberger', district: 79, party: 'republican' },
  { name: 'Grant Schreiber', district: 80, party: 'republican' },
  { name: 'Leah Howell', district: 81, party: 'republican' },
  { name: 'Dave Baker', district: 82, party: 'republican' },
  { name: 'Cyndi Howerton', district: 83, party: 'republican' },
  { name: 'Bill Clifford', district: 84, party: 'republican' },
  { name: 'Nick Hoheisel', district: 85, party: 'republican' },
  { name: 'Stephen Owens', district: 86, party: 'republican' },
  { name: 'Susan Estes', district: 87, party: 'republican' },
  { name: 'J.R. Claeys', district: 88, party: 'republican' },
  { name: 'Les Mason', district: 89, party: 'republican' },
  { name: 'Emil Bergquist', district: 90, party: 'republican' },
  { name: 'Kellie Warren', district: 91, party: 'republican' },
  { name: 'John Eplee', district: 92, party: 'republican' },
  { name: 'Keith Lowry', district: 93, party: 'republican' },
  { name: 'Philip Bloul', district: 94, party: 'republican' },
  { name: 'Kristey Williams', district: 95, party: 'republican' },
  { name: 'Mike Dodson', district: 96, party: 'republican' },
  { name: 'Silas Miller', district: 97, party: 'republican' },
  { name: 'Eric Smith', district: 98, party: 'republican' },
  { name: 'Kyle Hoffman', district: 99, party: 'republican' },
  { name: 'Stan Frownfelter', district: 100, party: 'democrat' },
  { name: 'Boog Highberger', district: 101, party: 'democrat' },
  { name: 'John Barker', district: 102, party: 'republican' },
  { name: 'William Sutton', district: 103, party: 'republican' },
  { name: 'Paul Waggoner', district: 104, party: 'republican' },
  { name: 'John Toplikar', district: 105, party: 'republican' },
  { name: 'Sandy Doan', district: 106, party: 'republican' },
  { name: 'John Carmichael', district: 107, party: 'democrat' },
  { name: 'Brandon Woodard', district: 108, party: 'democrat' },
  { name: 'Mike Weigel', district: 109, party: 'republican' },
  { name: 'Cheryl Helmer', district: 110, party: 'republican' },
  { name: 'Carl Turner', district: 111, party: 'republican' },
  { name: 'Kevin Braun', district: 112, party: 'republican' },
  { name: 'Chuck Smith', district: 113, party: 'republican' },
  { name: 'Charlotte Esau', district: 114, party: 'republican' },
  { name: 'Tom Sawyer', district: 115, party: 'democrat' },
  { name: 'Bill Pannbacker', district: 116, party: 'republican' },
  { name: 'Joe Newland', district: 117, party: 'republican' },
  { name: 'Dave Benson', district: 118, party: 'republican' },
  { name: 'Fred Gardner', district: 119, party: 'republican' },
  { name: 'Randy Garber', district: 120, party: 'republican' },
  { name: 'Ron Highland', district: 121, party: 'republican' },
  { name: 'Jim Minnix', district: 122, party: 'republican' },
  { name: 'Samantha Poetter Parshall', district: 123, party: 'republican' },
  { name: 'Michael Smith', district: 124, party: 'republican' },
  { name: 'Mike Dodson', district: 125, party: 'republican' },
]

// ─── Build rows and upsert ─────────────────────────────────────────────
const rows = []
for (const s of senators) {
  rows.push({
    name: s.name,
    slug: slugify(s.name),
    state: 'KS',
    chamber: 'state_senate',
    party: s.party,
    title: `Kansas State Senator, District ${s.district}`,
    bio: `State Senator representing District ${s.district} of the Kansas Senate.`,
    image_url: null,
  })
}
for (const h of houseMembers) {
  rows.push({
    name: h.name,
    slug: slugify(h.name),
    state: 'KS',
    chamber: 'state_house',
    party: h.party,
    title: `Kansas State Representative, District ${h.district}`,
    bio: `State Representative serving District ${h.district} of the Kansas House of Representatives.`,
    image_url: null,
  })
}

// Deduplicate by slug
const seen = new Set()
const deduped = rows.filter(r => {
  if (seen.has(r.slug)) return false
  seen.add(r.slug)
  return true
})

console.log(`Upserting ${deduped.length} Kansas legislators...`)

for (let i = 0; i < deduped.length; i += 50) {
  const batch = deduped.slice(i, i + 50)
  const { error } = await supabase.from('politicians').upsert(batch, { onConflict: 'slug' })
  if (error) {
    console.error(`Error at batch ${i}:`, error.message)
    process.exit(1)
  }
  console.log(`  Batch ${i / 50 + 1}: upserted ${batch.length} rows`)
}

console.log('Done — Kansas legislature seeded.')
