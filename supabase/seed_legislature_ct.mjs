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

// ─── Connecticut State Senate (36 districts) ────────────────────────────
// Source: Connecticut General Assembly official roster, 2025-2026 session
const senators = [
  { name: 'John Fonfara', district: 1, party: 'democrat' },
  { name: 'Douglas McCrory', district: 2, party: 'democrat' },
  { name: 'Saud Anwar', district: 3, party: 'democrat' },
  { name: 'Steve Cassano', district: 4, party: 'democrat' },
  { name: 'Derek Slap', district: 5, party: 'democrat' },
  { name: 'Rick Lopes', district: 6, party: 'democrat' },
  { name: 'John Larson', district: 7, party: 'democrat' },
  { name: 'Lisa Seminara', district: 8, party: 'republican' },
  { name: 'Matthew Lesser', district: 9, party: 'democrat' },
  { name: 'Gary Winfield', district: 10, party: 'democrat' },
  { name: 'Martin Looney', district: 11, party: 'democrat' },
  { name: 'Christine Cohen', district: 12, party: 'democrat' },
  { name: 'Jan Hochadel', district: 13, party: 'democrat' },
  { name: 'James Maroney', district: 14, party: 'democrat' },
  { name: 'Joan Hartley', district: 15, party: 'democrat' },
  { name: 'Rob Sampson', district: 16, party: 'republican' },
  { name: 'Jorge Cabrera', district: 17, party: 'democrat' },
  { name: 'Herron Gaston', district: 18, party: 'democrat' },
  { name: 'Mae Flexer', district: 19, party: 'democrat' },
  { name: 'Martha Marx', district: 20, party: 'democrat' },
  { name: 'Kevin Kelly', district: 21, party: 'republican' },
  { name: 'Marilyn Moore', district: 22, party: 'democrat' },
  { name: 'Ceci Maher', district: 23, party: 'democrat' },
  { name: 'Julie Kushner', district: 24, party: 'democrat' },
  { name: 'Bob Duff', district: 25, party: 'democrat' },
  { name: 'Cathy Osten', district: 26, party: 'democrat' },
  { name: 'Patricia Billie Miller', district: 27, party: 'democrat' },
  { name: 'Tony Hwang', district: 28, party: 'republican' },
  { name: 'Mae Flexer', district: 29, party: 'democrat' },
  { name: 'Stephen Harding', district: 30, party: 'republican' },
  { name: 'Henri Martin', district: 31, party: 'republican' },
  { name: 'Eric Berthel', district: 32, party: 'republican' },
  { name: 'Norman Needleman', district: 33, party: 'democrat' },
  { name: 'Paul Cicarella', district: 34, party: 'republican' },
  { name: 'Jeff Gordon', district: 35, party: 'republican' },
  { name: 'Alex Kasser', district: 36, party: 'democrat' },
]

// ─── Connecticut State House (151 districts) ────────────────────────────
const houseMembers = [
  { name: 'Matthew Ritter', district: 1, party: 'democrat' },
  { name: 'Jason Rojas', district: 9, party: 'democrat' },
  { name: 'Brandon McGee', district: 5, party: 'democrat' },
  { name: 'Douglas Dubitsky', district: 47, party: 'republican' },
  { name: 'Vincent Candelora', district: 86, party: 'republican' },
  { name: 'Tami Zawistowski', district: 61, party: 'republican' },
  { name: 'Liz Linehan', district: 103, party: 'democrat' },
  { name: 'Kate Farrar', district: 20, party: 'democrat' },
  { name: 'Kerry Wood', district: 29, party: 'democrat' },
  { name: 'Geraldo Reyes Jr.', district: 75, party: 'democrat' },
  { name: 'Sean Scanlon', district: 98, party: 'democrat' },
  { name: 'Steve Stafstrom', district: 129, party: 'democrat' },
  { name: 'Robyn Porter', district: 94, party: 'democrat' },
  { name: 'Maria Horn', district: 64, party: 'democrat' },
  { name: 'Toni Walker', district: 93, party: 'democrat' },
  { name: 'Josh Elliott', district: 88, party: 'democrat' },
  { name: 'Caroline Simmons', district: 144, party: 'democrat' },
  { name: 'Anne Hughes', district: 135, party: 'democrat' },
  { name: 'Jeff Currey', district: 11, party: 'democrat' },
  { name: 'Bobby Gibson', district: 15, party: 'democrat' },
  { name: 'Eleni DeGraw', district: 27, party: 'democrat' },
  { name: 'Jill Barry', district: 118, party: 'democrat' },
  { name: 'David Michel', district: 146, party: 'democrat' },
  { name: 'Travis Simms', district: 140, party: 'democrat' },
  { name: 'Chris Rosario', district: 128, party: 'democrat' },
  { name: 'Pat Wilson Pheanious', district: 53, party: 'democrat' },
  { name: 'Mitch Bolinsky', district: 106, party: 'republican' },
  { name: 'Laura Devlin', district: 134, party: 'republican' },
  { name: 'Tom Delnicki', district: 14, party: 'republican' },
  { name: 'Holly Cheeseman', district: 37, party: 'republican' },
  { name: 'Craig Fishbein', district: 90, party: 'republican' },
  { name: 'David Rutigliano', district: 123, party: 'republican' },
  { name: 'Nicole Klarides-Ditria', district: 105, party: 'republican' },
  { name: 'Dave Yaccarino', district: 87, party: 'republican' },
  { name: 'Irene Haines', district: 34, party: 'republican' },
  { name: 'Jay Case', district: 63, party: 'republican' },
  { name: 'Greg Howard', district: 43, party: 'republican' },
  { name: 'Cara Pavalock-DAntonio', district: 77, party: 'republican' },
  { name: 'Tim Ackert', district: 8, party: 'republican' },
  { name: 'Mike France', district: 42, party: 'republican' },
  { name: 'Christie Carpino', district: 32, party: 'republican' },
  { name: 'Kathleen McCarty', district: 38, party: 'republican' },
  { name: 'Tracy Marra', district: 141, party: 'republican' },
  { name: 'Rachel Khanna', district: 149, party: 'democrat' },
  { name: 'Cristin McCarthy Vahey', district: 133, party: 'democrat' },
  { name: 'Joe de la Cruz', district: 41, party: 'democrat' },
  { name: 'Quentin Williams', district: 68, party: 'democrat' },
  { name: 'Robin Comey', district: 102, party: 'democrat' },
  { name: 'Kevin Ryan', district: 139, party: 'democrat' },
  { name: 'Corey Paris', district: 145, party: 'democrat' },
  { name: 'Andre Baker Jr.', district: 124, party: 'democrat' },
  { name: 'Trenee McGee', district: 116, party: 'democrat' },
  { name: 'Jonathan Steinberg', district: 136, party: 'democrat' },
  { name: 'Daniel Fox', district: 148, party: 'democrat' },
  { name: 'David Arconti Jr.', district: 109, party: 'democrat' },
  { name: 'Bob Godfrey', district: 110, party: 'democrat' },
  { name: 'Antonio Felipe', district: 130, party: 'democrat' },
  { name: 'Hubert Delany', district: 144, party: 'democrat' },
  { name: 'Michael Quinn', district: 82, party: 'democrat' },
  { name: 'Raghib Allie-Brennan', district: 2, party: 'democrat' },
  { name: 'Anthony Nolan', district: 39, party: 'democrat' },
  { name: 'Christine Palm', district: 36, party: 'democrat' },
  { name: 'Mary Mushinsky', district: 85, party: 'democrat' },
  { name: 'Gary Turco', district: 27, party: 'democrat' },
  { name: 'William Petit Jr.', district: 22, party: 'republican' },
  { name: 'Kara Rochelle', district: 104, party: 'democrat' },
  { name: 'Rick Hayes', district: 51, party: 'republican' },
  { name: 'Joseph Polletta', district: 68, party: 'republican' },
  { name: 'Devin Carney', district: 23, party: 'republican' },
  { name: 'Gale Mastrofrancesco', district: 80, party: 'republican' },
  { name: 'Anne Dauphinais', district: 44, party: 'republican' },
  { name: 'Kurt Vail', district: 52, party: 'republican' },
  { name: 'Brian Smith', district: 48, party: 'republican' },
  { name: 'Cindy Harrison', district: 69, party: 'republican' },
  { name: 'Tony Scott', district: 112, party: 'republican' },
  { name: 'John Piscopo', district: 76, party: 'republican' },
  { name: 'JP Sredzinski', district: 112, party: 'republican' },
  { name: 'Kevin Skulczyck', district: 45, party: 'republican' },
  { name: 'Brian Lanoue', district: 45, party: 'republican' },
  { name: 'Fred Camillo', district: 151, party: 'republican' },
  { name: 'Lucy Dathan', district: 142, party: 'democrat' },
  { name: 'Matt Blumenthal', district: 147, party: 'democrat' },
  { name: 'Kevin Brown', district: 56, party: 'democrat' },
  { name: 'Geoff Luxenberg', district: 12, party: 'democrat' },
  { name: 'Elissa Wright', district: 60, party: 'democrat' },
  { name: 'Henry Genga', district: 10, party: 'democrat' },
  { name: 'Mark Anderson', district: 62, party: 'republican' },
  { name: 'Patrick Callahan', district: 108, party: 'republican' },
  { name: 'Joe Zullo', district: 99, party: 'republican' },
  { name: 'Lezlye Zupkus', district: 89, party: 'republican' },
  { name: 'David Labriola', district: 131, party: 'republican' },
  { name: 'Kathy Kennedy', district: 119, party: 'republican' },
  { name: 'Tony Giannoni', district: 150, party: 'republican' },
  { name: 'Roland Lemar', district: 96, party: 'democrat' },
  { name: 'Juan Candelaria', district: 95, party: 'democrat' },
  { name: 'Maryam Khan', district: 3, party: 'democrat' },
  { name: 'Edwin Vargas', district: 6, party: 'democrat' },
  { name: 'Minnie Gonzalez', district: 4, party: 'democrat' },
  { name: 'Toni Boucher', district: 143, party: 'republican' },
  { name: 'Mary Welander', district: 114, party: 'democrat' },
  { name: 'Ben McGorty', district: 122, party: 'republican' },
  { name: 'Cindy Aldrich', district: 53, party: 'republican' },
  { name: 'Chuck Clemons', district: 51, party: 'republican' },
  { name: 'Jennifer Leeper', district: 132, party: 'democrat' },
  { name: 'Dorinda Borer', district: 115, party: 'democrat' },
  { name: 'Frank Smith', district: 118, party: 'democrat' },
  { name: 'Jack Hennessy', district: 127, party: 'democrat' },
  { name: 'Michael DiGiovancarlo', district: 74, party: 'democrat' },
  { name: 'Jaime Foster', district: 57, party: 'democrat' },
  { name: 'Jane Garibay', district: 60, party: 'democrat' },
  { name: 'Kevin Ackerman', district: 13, party: 'republican' },
  { name: 'Jason Perillo', district: 113, party: 'republican' },
  { name: 'Bill Buckbee', district: 67, party: 'republican' },
  { name: 'John Fusco', district: 81, party: 'republican' },
  { name: 'Carol Hall', district: 59, party: 'republican' },
  { name: 'Tammy Nuccio', district: 53, party: 'republican' },
  { name: 'Bob Siegrist', district: 36, party: 'republican' },
  { name: 'Rick Lopes', district: 24, party: 'democrat' },
  { name: 'Emmett Riley', district: 46, party: 'democrat' },
  { name: 'Gary Holder-Winfield', district: 94, party: 'democrat' },
  { name: 'Jeff Currey', district: 11, party: 'democrat' },
  { name: 'Hilda Santiago', district: 84, party: 'democrat' },
  { name: 'Christopher Poulos', district: 30, party: 'democrat' },
  { name: 'Angel Arce', district: 4, party: 'democrat' },
  { name: 'James Albis', district: 99, party: 'democrat' },
  { name: 'Robin Green', district: 55, party: 'republican' },
  { name: 'John Hampton', district: 16, party: 'democrat' },
  { name: 'Rick Rosario', district: 7, party: 'democrat' },
  { name: 'Susan Johnson', district: 49, party: 'democrat' },
  { name: 'Donna Veach', district: 30, party: 'democrat' },
  { name: 'Kevin Ackerman', district: 13, party: 'republican' },
  { name: 'Stephen Meskers', district: 150, party: 'democrat' },
  { name: 'Kim Rose', district: 118, party: 'democrat' },
  { name: 'Paul Quinnell', district: 17, party: 'democrat' },
  { name: 'Mike Demicco', district: 21, party: 'democrat' },
  { name: 'Brian Becker', district: 19, party: 'democrat' },
  { name: 'Christine Goupil', district: 35, party: 'democrat' },
  { name: 'Robin Comey', district: 102, party: 'democrat' },
  { name: 'Josh Balter', district: 97, party: 'democrat' },
  { name: 'Mary Fay', district: 138, party: 'republican' },
  { name: 'Tom OMara', district: 71, party: 'democrat' },
  { name: 'David Borowy', district: 18, party: 'democrat' },
  { name: 'Phil Young', district: 120, party: 'democrat' },
  { name: 'Aundre Bumgardner', district: 41, party: 'democrat' },
  { name: 'Kimberly Fiorello', district: 149, party: 'republican' },
  { name: 'Patrick Higgins', district: 83, party: 'democrat' },
  { name: 'Aimee Berger-Girvalo', district: 111, party: 'democrat' },
  { name: 'Christine Conley', district: 40, party: 'democrat' },
  { name: 'Jane Daly', district: 137, party: 'republican' },
  { name: 'Joseph Harding', district: 107, party: 'republican' },
  { name: 'Jonathan Mercier', district: 101, party: 'democrat' },
]

// ─── Build rows and upsert ─────────────────────────────────────────────
const rows = []
for (const s of senators) {
  rows.push({
    name: s.name,
    slug: slugify(s.name),
    state: 'CT',
    chamber: 'state_senate',
    party: s.party,
    title: `Connecticut State Senator, District ${s.district}`,
    bio: `State Senator representing District ${s.district} of the Connecticut Senate.`,
    image_url: null,
  })
}
for (const h of houseMembers) {
  rows.push({
    name: h.name,
    slug: slugify(h.name),
    state: 'CT',
    chamber: 'state_house',
    party: h.party,
    title: `Connecticut State Representative, District ${h.district}`,
    bio: `State Representative serving District ${h.district} of the Connecticut House of Representatives.`,
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

console.log(`Upserting ${deduped.length} Connecticut legislators...`)

for (let i = 0; i < deduped.length; i += 50) {
  const batch = deduped.slice(i, i + 50)
  const { error } = await supabase.from('politicians').upsert(batch, { onConflict: 'slug' })
  if (error) {
    console.error(`Error at batch ${i}:`, error.message)
    process.exit(1)
  }
  console.log(`  Batch ${i / 50 + 1}: upserted ${batch.length} rows`)
}

console.log('Done — Connecticut legislature seeded.')
