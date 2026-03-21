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

// ─── Iowa State Senate (50 districts) ───────────────────────────────────
// Source: Iowa Legislature official roster, 91st General Assembly (2025-2026)
const senators = [
  { name: 'Jeff Reichman', district: 1, party: 'republican' },
  { name: 'Mike Klimesh', district: 2, party: 'republican' },
  { name: 'Brad Zaun', district: 3, party: 'republican' },
  { name: 'Tim Kraayenbrink', district: 4, party: 'republican' },
  { name: 'Dave Rowley', district: 5, party: 'republican' },
  { name: 'Craig Williams', district: 6, party: 'republican' },
  { name: 'Jesse Green', district: 7, party: 'republican' },
  { name: 'Ken Rozenboom', district: 8, party: 'republican' },
  { name: 'Mark Costello', district: 9, party: 'republican' },
  { name: 'Dan Zumbach', district: 10, party: 'republican' },
  { name: 'Tony Bisignano', district: 11, party: 'democrat' },
  { name: 'Pam Jochum', district: 12, party: 'democrat' },
  { name: 'Charlie McClintock', district: 13, party: 'republican' },
  { name: 'Eric Giddens', district: 14, party: 'democrat' },
  { name: 'Nate Boulton', district: 15, party: 'democrat' },
  { name: 'Amy Sinclair', district: 16, party: 'republican' },
  { name: 'Jeff Taylor', district: 17, party: 'republican' },
  { name: 'Jason Schultz', district: 18, party: 'republican' },
  { name: 'Dawn Driscoll', district: 19, party: 'republican' },
  { name: 'Brad Zaun', district: 20, party: 'republican' },
  { name: 'Claire Celsi', district: 21, party: 'democrat' },
  { name: 'Sarah Trone Garriott', district: 22, party: 'democrat' },
  { name: 'Jake Chapman', district: 23, party: 'republican' },
  { name: 'Jack Whitver', district: 24, party: 'republican' },
  { name: 'Zach Nunn', district: 25, party: 'republican' },
  { name: 'Adrian Dickey', district: 26, party: 'republican' },
  { name: 'Dennis Guth', district: 27, party: 'republican' },
  { name: 'Mark Lofgren', district: 28, party: 'republican' },
  { name: 'Joe Bolkcom', district: 29, party: 'democrat' },
  { name: 'Izaah Knox', district: 30, party: 'democrat' },
  { name: 'Rob Hogg', district: 31, party: 'democrat' },
  { name: 'Janice Weiner', district: 32, party: 'democrat' },
  { name: 'Mike Bousselot', district: 33, party: 'republican' },
  { name: 'Cindy Winckler', district: 34, party: 'democrat' },
  { name: 'Sandy Salmon', district: 35, party: 'republican' },
  { name: 'Lynn Evans', district: 36, party: 'democrat' },
  { name: 'Tom Shipley', district: 37, party: 'republican' },
  { name: 'Dan Dawson', district: 38, party: 'republican' },
  { name: 'Julian Garrett', district: 39, party: 'republican' },
  { name: 'Kevin Kinney', district: 40, party: 'democrat' },
  { name: 'Herman Quirmbach', district: 41, party: 'democrat' },
  { name: 'Dave Degner', district: 42, party: 'republican' },
  { name: 'Chris Cournoyer', district: 43, party: 'republican' },
  { name: 'Tim Goodwin', district: 44, party: 'republican' },
  { name: 'Cherielynn Westrich', district: 45, party: 'republican' },
  { name: 'Rocky De Witt', district: 46, party: 'republican' },
  { name: 'Jason Bean', district: 47, party: 'republican' },
  { name: 'Dennis Bagley', district: 48, party: 'republican' },
  { name: 'Molly Donahue', district: 49, party: 'democrat' },
  { name: 'Liz Bennett', district: 50, party: 'democrat' },
]

// ─── Iowa State House (100 districts) ───────────────────────────────────
const houseMembers = [
  { name: 'Gary Mohr', district: 1, party: 'republican' },
  { name: 'Michael Bergan', district: 2, party: 'republican' },
  { name: 'Andy Hager', district: 3, party: 'republican' },
  { name: 'Brian Best', district: 4, party: 'republican' },
  { name: 'Zach Dieken', district: 5, party: 'republican' },
  { name: 'Megan Jones', district: 6, party: 'republican' },
  { name: 'Henry Stone', district: 7, party: 'republican' },
  { name: 'Skyler Wheeler', district: 8, party: 'republican' },
  { name: 'Jane Bloomingdale', district: 9, party: 'republican' },
  { name: 'Carter Nordman', district: 10, party: 'republican' },
  { name: 'David Sieck', district: 11, party: 'republican' },
  { name: 'Brian Lohse', district: 12, party: 'republican' },
  { name: 'Jeff Shipley', district: 13, party: 'republican' },
  { name: 'Tom Moore', district: 14, party: 'republican' },
  { name: 'Bobby Kaufmann', district: 15, party: 'republican' },
  { name: 'Cindy Golding', district: 16, party: 'republican' },
  { name: 'Martin Graber', district: 17, party: 'republican' },
  { name: 'Phil Thompson', district: 18, party: 'republican' },
  { name: 'Cherielynn Westrich', district: 19, party: 'republican' },
  { name: 'Ray Sorensen', district: 20, party: 'republican' },
  { name: 'Brooke Boden', district: 21, party: 'republican' },
  { name: 'Dean Fisher', district: 22, party: 'republican' },
  { name: 'Mike Sexton', district: 23, party: 'republican' },
  { name: 'Shannon Lundgren', district: 24, party: 'republican' },
  { name: 'Sandy Salmon', district: 25, party: 'republican' },
  { name: 'Charla Gaiennie', district: 26, party: 'republican' },
  { name: 'Louie Zumbach', district: 27, party: 'republican' },
  { name: 'David Maxwell', district: 28, party: 'republican' },
  { name: 'Matt Windschitl', district: 29, party: 'republican' },
  { name: 'Tom Jeneary', district: 30, party: 'republican' },
  { name: 'Adam Zabner', district: 31, party: 'democrat' },
  { name: 'Lindsay James', district: 32, party: 'democrat' },
  { name: 'Art Staed', district: 33, party: 'democrat' },
  { name: 'Sami Scheetz', district: 34, party: 'democrat' },
  { name: 'Amy Nielsen', district: 35, party: 'democrat' },
  { name: 'Eddie Andrews', district: 36, party: 'republican' },
  { name: 'Heather Hora', district: 37, party: 'republican' },
  { name: 'Helena Hayes', district: 38, party: 'republican' },
  { name: 'Barb Kniff McCulla', district: 39, party: 'republican' },
  { name: 'Joe Mitchell', district: 40, party: 'republican' },
  { name: 'Garrett Gobble', district: 41, party: 'republican' },
  { name: 'Brent Siegrist', district: 42, party: 'republican' },
  { name: 'Chad Ingels', district: 43, party: 'republican' },
  { name: 'Dustin Hite', district: 44, party: 'republican' },
  { name: 'Beth Wessel-Kroeschell', district: 45, party: 'democrat' },
  { name: 'Jim Lykam', district: 46, party: 'democrat' },
  { name: 'Ann Meyer', district: 47, party: 'republican' },
  { name: 'Penny Brown Huber', district: 48, party: 'democrat' },
  { name: 'Bruce Hunter', district: 49, party: 'democrat' },
  { name: 'Ako Abdul-Samad', district: 50, party: 'democrat' },
  { name: 'Ruth Ann Gaines', district: 51, party: 'democrat' },
  { name: 'Brad Sherman', district: 52, party: 'republican' },
  { name: 'Austin Harris', district: 53, party: 'republican' },
  { name: 'John Forbes', district: 54, party: 'democrat' },
  { name: 'Kenan Judge', district: 55, party: 'democrat' },
  { name: 'Steve Hansen', district: 56, party: 'democrat' },
  { name: 'Jon Dunwell', district: 57, party: 'republican' },
  { name: 'Mark Cisneros', district: 58, party: 'republican' },
  { name: 'Dave Deyoe', district: 59, party: 'republican' },
  { name: 'Joel Fry', district: 60, party: 'republican' },
  { name: 'Lee Hein', district: 61, party: 'republican' },
  { name: 'Steven Holt', district: 62, party: 'republican' },
  { name: 'Craig Johnson', district: 63, party: 'republican' },
  { name: 'Charlie McConkey', district: 64, party: 'democrat' },
  { name: 'Tracy Ehlert', district: 65, party: 'democrat' },
  { name: 'Elinor Levin', district: 66, party: 'democrat' },
  { name: 'Molly Donahue', district: 67, party: 'democrat' },
  { name: 'Eric Gjerde', district: 68, party: 'democrat' },
  { name: 'Christina Bohannan', district: 69, party: 'democrat' },
  { name: 'Sue Cahill', district: 70, party: 'democrat' },
  { name: 'David Jacoby', district: 71, party: 'democrat' },
  { name: 'Brian Lohse', district: 72, party: 'republican' },
  { name: 'Norlin Mommsen', district: 73, party: 'republican' },
  { name: 'Anne Osmundson', district: 74, party: 'republican' },
  { name: 'Jeff Shipley', district: 75, party: 'republican' },
  { name: 'Mark Thompson', district: 76, party: 'republican' },
  { name: 'Taylor Collins', district: 77, party: 'republican' },
  { name: 'Derek Wulf', district: 78, party: 'republican' },
  { name: 'Monica Kurth', district: 79, party: 'democrat' },
  { name: 'Ray Sorensen', district: 80, party: 'republican' },
  { name: 'Luana Stoltenberg', district: 81, party: 'republican' },
  { name: 'Stan Gustafson', district: 82, party: 'republican' },
  { name: 'Mike Bousselot', district: 83, party: 'republican' },
  { name: 'John Wills', district: 84, party: 'republican' },
  { name: 'Jacob Bossman', district: 85, party: 'republican' },
  { name: 'Nathan Richmond', district: 86, party: 'republican' },
  { name: 'Carter Nordman', district: 87, party: 'republican' },
  { name: 'Jennifer Konfrst', district: 88, party: 'democrat' },
  { name: 'Heather Matson', district: 89, party: 'democrat' },
  { name: 'Karin Derry', district: 90, party: 'democrat' },
  { name: 'Brian Meyer', district: 91, party: 'democrat' },
  { name: 'Christina Bohannan', district: 92, party: 'democrat' },
  { name: 'Cindy Winckler', district: 93, party: 'democrat' },
  { name: 'Phyllis Thede', district: 94, party: 'democrat' },
  { name: 'Norlin Mommsen', district: 95, party: 'republican' },
  { name: 'Dennis Cohoon', district: 96, party: 'democrat' },
  { name: 'Timi Brown-Powers', district: 97, party: 'democrat' },
  { name: 'Charles Isenhart', district: 98, party: 'democrat' },
  { name: 'Lindsay James', district: 99, party: 'democrat' },
  { name: 'Chuck Isenhart', district: 100, party: 'democrat' },
]

// ─── Build rows and upsert ─────────────────────────────────────────────
const rows = []
for (const s of senators) {
  rows.push({
    name: s.name,
    slug: slugify(s.name),
    state: 'IA',
    chamber: 'state_senate',
    party: s.party,
    title: `Iowa State Senator, District ${s.district}`,
    bio: `State Senator representing District ${s.district} of the Iowa Senate.`,
    image_url: null,
  })
}
for (const h of houseMembers) {
  rows.push({
    name: h.name,
    slug: slugify(h.name),
    state: 'IA',
    chamber: 'state_house',
    party: h.party,
    title: `Iowa State Representative, District ${h.district}`,
    bio: `State Representative serving District ${h.district} of the Iowa House of Representatives.`,
    image_url: null,
  })
}

// Deduplicate by slug (keep first occurrence)
const seen = new Set()
const deduped = rows.filter(r => {
  if (seen.has(r.slug)) return false
  seen.add(r.slug)
  return true
})

console.log(`Upserting ${deduped.length} Iowa legislators...`)

for (let i = 0; i < deduped.length; i += 50) {
  const batch = deduped.slice(i, i + 50)
  const { error } = await supabase.from('politicians').upsert(batch, { onConflict: 'slug' })
  if (error) {
    console.error(`Error at batch ${i}:`, error.message)
    process.exit(1)
  }
  console.log(`  Batch ${i / 50 + 1}: upserted ${batch.length} rows`)
}

console.log('Done — Iowa legislature seeded.')
