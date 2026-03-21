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

// ─── Arkansas State Senate (35 districts) ───────────────────────────────
// Source: Arkansas General Assembly official roster, 94th General Assembly (2025-2026)
const senators = [
  { name: 'Steve Crowell', district: 1, party: 'republican' },
  { name: 'Ricky Hill', district: 2, party: 'republican' },
  { name: 'John Payton', district: 3, party: 'republican' },
  { name: 'Tyler Dees', district: 4, party: 'republican' },
  { name: 'Bart Hester', district: 5, party: 'republican' },
  { name: 'Clint Penzo', district: 6, party: 'republican' },
  { name: 'Breanne Davis', district: 7, party: 'republican' },
  { name: 'Scott Flippo', district: 8, party: 'republican' },
  { name: 'James Sturch', district: 9, party: 'republican' },
  { name: 'Bryan King', district: 10, party: 'republican' },
  { name: 'Jane English', district: 11, party: 'republican' },
  { name: 'Stephanie Flowers', district: 12, party: 'democrat' },
  { name: 'Greg Leding', district: 13, party: 'democrat' },
  { name: 'Kim Hammer', district: 14, party: 'republican' },
  { name: 'Mark Johnson', district: 15, party: 'republican' },
  { name: 'Trent Garner', district: 16, party: 'republican' },
  { name: 'Jonathan Dismang', district: 17, party: 'republican' },
  { name: 'Dan Sullivan', district: 18, party: 'republican' },
  { name: 'Larry Teague', district: 19, party: 'democrat' },
  { name: 'Sandy Stoll', district: 20, party: 'republican' },
  { name: 'Blake Johnson', district: 21, party: 'republican' },
  { name: 'Jimmy Hickey Jr.', district: 22, party: 'republican' },
  { name: 'Terry Rice', district: 23, party: 'republican' },
  { name: 'Greg Bledsoe', district: 24, party: 'republican' },
  { name: 'Ben Gilmore', district: 25, party: 'republican' },
  { name: 'Gary Stubblefield', district: 26, party: 'republican' },
  { name: 'Alan Clark', district: 27, party: 'republican' },
  { name: 'Charles Beckham', district: 28, party: 'republican' },
  { name: 'Clarke Tucker', district: 29, party: 'democrat' },
  { name: 'Linda Chesterfield', district: 30, party: 'democrat' },
  { name: 'Keith Ingram', district: 31, party: 'democrat' },
  { name: 'Matt McKee', district: 32, party: 'republican' },
  { name: 'Dave Wallace', district: 33, party: 'republican' },
  { name: 'Ricky Hill', district: 34, party: 'republican' },
  { name: 'Justin Boyd', district: 35, party: 'republican' },
]

// ─── Arkansas State House (100 districts) ───────────────────────────────
const houseMembers = [
  { name: 'Stetson Painter', district: 1, party: 'republican' },
  { name: 'Delia Haak', district: 2, party: 'republican' },
  { name: 'Steve Womack', district: 3, party: 'republican' },
  { name: 'Kendon Underwood', district: 4, party: 'republican' },
  { name: 'Jon Milligan', district: 5, party: 'republican' },
  { name: 'Robin Lundstrum', district: 6, party: 'republican' },
  { name: 'Harlan Breaux', district: 7, party: 'republican' },
  { name: 'Chad Puryear', district: 8, party: 'republican' },
  { name: 'Brad Dillard', district: 9, party: 'republican' },
  { name: 'Les Warren', district: 10, party: 'republican' },
  { name: 'Bart Schulz', district: 11, party: 'republican' },
  { name: 'Karilyn Brown', district: 12, party: 'republican' },
  { name: 'Josh Bryant', district: 13, party: 'republican' },
  { name: 'Grant Hodges', district: 14, party: 'republican' },
  { name: 'John Carr', district: 15, party: 'republican' },
  { name: 'Steve Magie', district: 16, party: 'democrat' },
  { name: 'Megan Godfrey', district: 17, party: 'democrat' },
  { name: 'Tara Shephard', district: 18, party: 'democrat' },
  { name: 'Denise Ennett', district: 19, party: 'democrat' },
  { name: 'Marc Hayot', district: 20, party: 'republican' },
  { name: 'Jeremiah Moore', district: 21, party: 'republican' },
  { name: 'John Maddox', district: 22, party: 'republican' },
  { name: 'Clint Penzo', district: 23, party: 'republican' },
  { name: 'Delia Haak', district: 24, party: 'republican' },
  { name: 'Chad Puryear', district: 25, party: 'republican' },
  { name: 'Jack Ladyman', district: 26, party: 'republican' },
  { name: 'Brian Evans', district: 27, party: 'republican' },
  { name: 'Brandt Smith', district: 28, party: 'republican' },
  { name: 'Keith Slape', district: 29, party: 'republican' },
  { name: 'John Payton', district: 30, party: 'republican' },
  { name: 'Marsh Davis', district: 31, party: 'republican' },
  { name: 'Monte Hodges', district: 32, party: 'democrat' },
  { name: 'Mike Holcomb', district: 33, party: 'republican' },
  { name: 'Bart Hester', district: 34, party: 'republican' },
  { name: 'James Wooten', district: 35, party: 'republican' },
  { name: 'Gary Deffenbaugh', district: 36, party: 'republican' },
  { name: 'DeAnn Vaught', district: 37, party: 'republican' },
  { name: 'Richard Womack', district: 38, party: 'republican' },
  { name: 'Lanny Fite', district: 39, party: 'republican' },
  { name: 'Steven Walker', district: 40, party: 'republican' },
  { name: 'RJ Hawk', district: 41, party: 'republican' },
  { name: 'Jan Judy', district: 42, party: 'republican' },
  { name: 'Mark McElroy', district: 43, party: 'republican' },
  { name: 'Jody Dickinson', district: 44, party: 'republican' },
  { name: 'Lee Johnson', district: 45, party: 'republican' },
  { name: 'James Sorvillo', district: 46, party: 'republican' },
  { name: 'Jack Ladyman', district: 47, party: 'republican' },
  { name: 'Tippi McCullough', district: 48, party: 'democrat' },
  { name: 'Fred Allen', district: 49, party: 'democrat' },
  { name: 'Jamie Scott', district: 50, party: 'democrat' },
  { name: 'Ashley Hudson', district: 51, party: 'democrat' },
  { name: 'Trent Garner', district: 52, party: 'republican' },
  { name: 'Jay Richardson', district: 53, party: 'democrat' },
  { name: 'Mark Lowery', district: 54, party: 'republican' },
  { name: 'Les Eaves', district: 55, party: 'republican' },
  { name: 'Stephen Meeks', district: 56, party: 'republican' },
  { name: 'David Ray', district: 57, party: 'republican' },
  { name: 'John Vines', district: 58, party: 'democrat' },
  { name: 'Reginald Murdock', district: 59, party: 'democrat' },
  { name: 'Vivian Flowers', district: 60, party: 'democrat' },
  { name: 'Mike Holcomb', district: 61, party: 'republican' },
  { name: 'Jim Dotson', district: 62, party: 'republican' },
  { name: 'Clint Penzo', district: 63, party: 'republican' },
  { name: 'Jimmy Gazaway', district: 64, party: 'republican' },
  { name: 'Kendra Bailey', district: 65, party: 'republican' },
  { name: 'Brian Evans', district: 66, party: 'republican' },
  { name: 'Matthew Shepherd', district: 67, party: 'republican' },
  { name: 'Sonia Barker', district: 68, party: 'republican' },
  { name: 'Karilyn Brown', district: 69, party: 'republican' },
  { name: 'David Tollett', district: 70, party: 'republican' },
  { name: 'Jeff Wardlaw', district: 71, party: 'republican' },
  { name: 'Lane Jean', district: 72, party: 'republican' },
  { name: 'Larry Jett', district: 73, party: 'republican' },
  { name: 'Justin Gonzales', district: 74, party: 'republican' },
  { name: 'Marcus Richmond', district: 75, party: 'republican' },
  { name: 'Chris Wooten', district: 76, party: 'republican' },
  { name: 'Johnny Rye', district: 77, party: 'republican' },
  { name: 'Fran Cavenaugh', district: 78, party: 'republican' },
  { name: 'Mike Jones', district: 79, party: 'republican' },
  { name: 'Joy Springer', district: 80, party: 'democrat' },
  { name: 'Keith Brooks', district: 81, party: 'democrat' },
  { name: 'Andrew Collins', district: 82, party: 'democrat' },
  { name: 'Jimmie Wilson', district: 83, party: 'democrat' },
  { name: 'Fred Love', district: 84, party: 'democrat' },
  { name: 'Carlton Wing', district: 85, party: 'republican' },
  { name: 'Tyler Dees', district: 86, party: 'republican' },
  { name: 'Aaron Pilkington', district: 87, party: 'republican' },
  { name: 'Jim Wooten', district: 88, party: 'republican' },
  { name: 'Fredrick Allen', district: 89, party: 'democrat' },
  { name: 'Dwight Tosh', district: 90, party: 'republican' },
  { name: 'Denise Garner', district: 91, party: 'democrat' },
  { name: 'Mary Bentley', district: 92, party: 'republican' },
  { name: 'Mark Berry', district: 93, party: 'republican' },
  { name: 'Bruce Cozart', district: 94, party: 'republican' },
  { name: 'Nelda Speaks', district: 95, party: 'republican' },
  { name: 'Ken Bragg', district: 96, party: 'republican' },
  { name: 'Deborah Ferguson', district: 97, party: 'democrat' },
  { name: 'Stu Smith', district: 98, party: 'republican' },
  { name: 'Andy Davis', district: 99, party: 'republican' },
  { name: 'Julie Mayberry', district: 100, party: 'republican' },
]

// ─── Build rows and upsert ─────────────────────────────────────────────
const rows = []
for (const s of senators) {
  rows.push({
    name: s.name,
    slug: slugify(s.name),
    state: 'AR',
    chamber: 'state_senate',
    party: s.party,
    title: `Arkansas State Senator, District ${s.district}`,
    bio: `State Senator representing District ${s.district} of the Arkansas Senate.`,
    image_url: null,
  })
}
for (const h of houseMembers) {
  rows.push({
    name: h.name,
    slug: slugify(h.name),
    state: 'AR',
    chamber: 'state_house',
    party: h.party,
    title: `Arkansas State Representative, District ${h.district}`,
    bio: `State Representative serving District ${h.district} of the Arkansas House of Representatives.`,
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

console.log(`Upserting ${deduped.length} Arkansas legislators...`)

for (let i = 0; i < deduped.length; i += 50) {
  const batch = deduped.slice(i, i + 50)
  const { error } = await supabase.from('politicians').upsert(batch, { onConflict: 'slug' })
  if (error) {
    console.error(`Error at batch ${i}:`, error.message)
    process.exit(1)
  }
  console.log(`  Batch ${i / 50 + 1}: upserted ${batch.length} rows`)
}

console.log('Done — Arkansas legislature seeded.')
