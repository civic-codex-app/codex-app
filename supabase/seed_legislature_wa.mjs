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

// ─── Washington State Senate (49 members) ─────────────────────────────
const waSenators = [
  { name: 'Derek Stanford', district: 1, party: 'democrat' },
  { name: 'Jim McCune', district: 2, party: 'republican' },
  { name: 'Andy Billig', district: 3, party: 'democrat' },
  { name: 'Mike Padden', district: 4, party: 'republican' },
  { name: 'Mark Mullet', district: 5, party: 'republican' },
  { name: 'Jeff Wilson', district: 6, party: 'republican' },
  { name: 'Shelly Short', district: 7, party: 'republican' },
  { name: 'Sharon Brown', district: 8, party: 'republican' },
  { name: 'Mark Schoesler', district: 9, party: 'republican' },
  { name: 'Perry Dozier', district: 10, party: 'republican' },
  { name: 'Bob Hasegawa', district: 11, party: 'democrat' },
  { name: 'Brad Hawkins', district: 12, party: 'republican' },
  { name: 'Judy Warnick', district: 13, party: 'republican' },
  { name: 'Curtis King', district: 14, party: 'republican' },
  { name: 'Nikki Torres', district: 15, party: 'republican' },
  { name: 'Matt Boehnke', district: 16, party: 'republican' },
  { name: 'Lynda Wilson', district: 17, party: 'republican' },
  { name: 'Ann Rivers', district: 18, party: 'republican' },
  { name: 'Jeff Holy', district: 19, party: 'republican' },
  { name: 'John Braun', district: 20, party: 'republican' },
  { name: 'Yasmin Trudeau', district: 21, party: 'democrat' },
  { name: 'Sam Hunt', district: 22, party: 'democrat' },
  { name: 'John Lovick', district: 23, party: 'democrat' },
  { name: 'Claudia Kauffman', district: 24, party: 'democrat' },
  { name: 'Jamie Pedersen', district: 25, party: 'democrat' },
  { name: 'Joy Stanford', district: 26, party: 'democrat' },
  { name: 'Javier Valdez', district: 27, party: 'democrat' },
  { name: 'T\'wina Nobles', district: 28, party: 'democrat' },
  { name: 'Steve Conway', district: 29, party: 'democrat' },
  { name: 'Claire Wilson', district: 30, party: 'democrat' },
  { name: 'Phil Fortunato', district: 31, party: 'republican' },
  { name: 'Jesse Salomon', district: 32, party: 'democrat' },
  { name: 'Karen Keiser', district: 33, party: 'democrat' },
  { name: 'Joe Nguyen', district: 34, party: 'democrat' },
  { name: 'Noel Frame', district: 35, party: 'democrat' },
  { name: 'Emily Randall', district: 36, party: 'democrat' },
  { name: 'Rebecca Saldaña', district: 37, party: 'democrat' },
  { name: 'June Robinson', district: 38, party: 'democrat' },
  { name: 'Keith Wagoner', district: 39, party: 'republican' },
  { name: 'Ron Muzzall', district: 40, party: 'republican' },
  { name: 'Lisa Wellman', district: 41, party: 'democrat' },
  { name: 'Manka Dhingra', district: 42, party: 'democrat' },
  { name: 'Drew Stokesbary', district: 43, party: 'republican' },
  { name: 'John Braun', district: 44, party: 'republican' },
  { name: 'Manka Dhingra', district: 45, party: 'democrat' },
  { name: 'Claudia Kauffman', district: 46, party: 'democrat' },
  { name: 'Deborah Krishnadasan', district: 47, party: 'democrat' },
  { name: 'Patty Kuderer', district: 48, party: 'democrat' },
  { name: 'David Hackney', district: 49, party: 'democrat' },
]

// ─── Washington State House (98 members, 2 per district) ──────────────
const waReps = [
  { name: 'Davina Duerr', district: 1, party: 'democrat' },
  { name: 'Jared Mead', district: 1, party: 'democrat' },
  { name: 'Andrew Barkis', district: 2, party: 'republican' },
  { name: 'J.T. Wilcox', district: 2, party: 'republican' },
  { name: 'Marcus Riccelli', district: 3, party: 'democrat' },
  { name: 'Timm Ormsby', district: 3, party: 'democrat' },
  { name: 'Bob McCaslin Jr.', district: 4, party: 'republican' },
  { name: 'Leonard Christian', district: 4, party: 'republican' },
  { name: 'Bill Ramos', district: 5, party: 'democrat' },
  { name: 'Lisa Callan', district: 5, party: 'democrat' },
  { name: 'Mike Volz', district: 6, party: 'republican' },
  { name: 'Jenny Graham', district: 6, party: 'republican' },
  { name: 'Jacquelin Maycumber', district: 7, party: 'republican' },
  { name: 'Joel Kretz', district: 7, party: 'republican' },
  { name: 'Matt Boehnke', district: 8, party: 'republican' },
  { name: 'Brad Klippert', district: 8, party: 'republican' },
  { name: 'Mary Dye', district: 9, party: 'republican' },
  { name: 'Joe Schmick', district: 9, party: 'republican' },
  { name: 'April Connors', district: 10, party: 'republican' },
  { name: 'Ed Orcutt', district: 10, party: 'republican' },
  { name: 'David Hackney', district: 11, party: 'democrat' },
  { name: 'Steve Bergquist', district: 11, party: 'democrat' },
  { name: 'Keith Goehner', district: 12, party: 'republican' },
  { name: 'Mike Steele', district: 12, party: 'republican' },
  { name: 'Alex Ybarra', district: 13, party: 'republican' },
  { name: 'Tom Dent', district: 13, party: 'republican' },
  { name: 'Chris Corry', district: 14, party: 'republican' },
  { name: 'Gina Mosbrucker', district: 14, party: 'republican' },
  { name: 'Bruce Chandler', district: 15, party: 'republican' },
  { name: 'Jeremie Dufault', district: 15, party: 'republican' },
  { name: 'Mark Klicker', district: 16, party: 'republican' },
  { name: 'Skyler Rude', district: 16, party: 'republican' },
  { name: 'Paul Harris', district: 17, party: 'republican' },
  { name: 'Kevin Waters', district: 17, party: 'republican' },
  { name: 'Stephanie McClintock', district: 18, party: 'republican' },
  { name: 'Greg Cheney', district: 18, party: 'republican' },
  { name: 'Jim Walsh', district: 19, party: 'republican' },
  { name: 'Joel McEntire', district: 19, party: 'republican' },
  { name: 'Ed Orcutt', district: 20, party: 'republican' },
  { name: 'Peter Abbarno', district: 20, party: 'republican' },
  { name: 'Mari Leavitt', district: 21, party: 'democrat' },
  { name: 'Strom Peterson', district: 21, party: 'democrat' },
  { name: 'Jessica Bateman', district: 22, party: 'democrat' },
  { name: 'Laurie Jinkins', district: 22, party: 'democrat' },
  { name: 'Tarra Simmons', district: 23, party: 'democrat' },
  { name: 'Drew Hansen', district: 23, party: 'democrat' },
  { name: 'Steve Tharinger', district: 24, party: 'democrat' },
  { name: 'Mike Chapman', district: 24, party: 'democrat' },
  { name: 'Cyndy Jacobsen', district: 25, party: 'republican' },
  { name: 'Kelly Chambers', district: 25, party: 'republican' },
  { name: 'Spencer Hutchins', district: 26, party: 'republican' },
  { name: 'Jesse Young', district: 26, party: 'republican' },
  { name: 'Laurie Jinkins', district: 27, party: 'democrat' },
  { name: 'Jake Fey', district: 27, party: 'democrat' },
  { name: 'Mari Leavitt', district: 28, party: 'democrat' },
  { name: 'Dan Bronoske', district: 28, party: 'democrat' },
  { name: 'Melanie Morgan', district: 29, party: 'democrat' },
  { name: 'Steve Kirby', district: 29, party: 'democrat' },
  { name: 'Jamila Taylor', district: 30, party: 'democrat' },
  { name: 'Kristine Reeves', district: 30, party: 'democrat' },
  { name: 'Drew Stokesbary', district: 31, party: 'republican' },
  { name: 'Eric Robertson', district: 31, party: 'republican' },
  { name: 'Cindy Ryu', district: 32, party: 'democrat' },
  { name: 'Lauren Davis', district: 32, party: 'democrat' },
  { name: 'Tina Orwall', district: 33, party: 'democrat' },
  { name: 'Mia Gregerson', district: 33, party: 'democrat' },
  { name: 'Joe Fitzgibbon', district: 34, party: 'democrat' },
  { name: 'Emily Alvarado', district: 34, party: 'democrat' },
  { name: 'Shelley Kloba', district: 35, party: 'democrat' },
  { name: 'Tana Senn', district: 35, party: 'democrat' },
  { name: 'Liz Berry', district: 36, party: 'democrat' },
  { name: 'Julia Reed', district: 36, party: 'democrat' },
  { name: 'Chipalo Street', district: 37, party: 'democrat' },
  { name: 'Sharon Tomiko Santos', district: 37, party: 'democrat' },
  { name: 'Emily Wicks', district: 38, party: 'democrat' },
  { name: 'Sam Low', district: 38, party: 'republican' },
  { name: 'Robert Sutherland', district: 39, party: 'republican' },
  { name: 'Carolyn Eslick', district: 39, party: 'republican' },
  { name: 'Debra Lekanoff', district: 40, party: 'democrat' },
  { name: 'Alex Ramel', district: 40, party: 'democrat' },
  { name: 'Tana Senn', district: 41, party: 'democrat' },
  { name: 'My-Linh Thai', district: 41, party: 'democrat' },
  { name: 'April Berg', district: 42, party: 'democrat' },
  { name: 'Alicia Rule', district: 42, party: 'democrat' },
  { name: 'Frank Chopp', district: 43, party: 'democrat' },
  { name: 'Nicole Macri', district: 43, party: 'democrat' },
  { name: 'April Berg', district: 44, party: 'democrat' },
  { name: 'John Springer', district: 44, party: 'democrat' },
  { name: 'Roger Goodman', district: 45, party: 'democrat' },
  { name: 'Larry Springer', district: 45, party: 'democrat' },
  { name: 'Gerry Pollet', district: 46, party: 'democrat' },
  { name: 'Darya Farivar', district: 46, party: 'democrat' },
  { name: 'Debra Entenman', district: 47, party: 'democrat' },
  { name: 'Shukri Olow', district: 47, party: 'democrat' },
  { name: 'Vandana Slatter', district: 48, party: 'democrat' },
  { name: 'Amy Walen', district: 48, party: 'democrat' },
  { name: 'Sharlett Mena', district: 49, party: 'democrat' },
  { name: 'Monica Stonier', district: 49, party: 'democrat' },
]

// ─── Build rows ─────────────────────────────────────────────────────────
const rows = []
const seen = new Set()

for (const s of waSenators) {
  const slug = slugify(s.name)
  if (seen.has(slug)) continue
  seen.add(slug)
  rows.push({
    name: s.name,
    slug,
    state: 'WA',
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, District ${s.district}`,
    bio: `Washington State Senator representing District ${s.district}.`,
    image_url: null,
  })
}

for (const r of waReps) {
  const slug = slugify(r.name)
  if (seen.has(slug)) continue
  seen.add(slug)
  rows.push({
    name: r.name,
    slug,
    state: 'WA',
    chamber: 'state_house',
    party: r.party,
    title: `State Representative, District ${r.district}`,
    bio: `Washington State Representative serving District ${r.district}.`,
    image_url: null,
  })
}

// ─── Upsert in batches of 50 ───────────────────────────────────────────
const BATCH = 50
let inserted = 0
let errors = 0

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH)
  const { data, error } = await supabase
    .from('politicians')
    .upsert(batch, { onConflict: 'slug' })
    .select('id')

  if (error) {
    console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, error.message)
    errors++
  } else {
    inserted += data.length
    console.log(`Batch ${Math.floor(i / BATCH) + 1}: upserted ${data.length} rows`)
  }
}

console.log(`\nDone. Total upserted: ${inserted} | Errors: ${errors}`)
console.log(`  State Senators: ${waSenators.length}`)
console.log(`  State Reps: ${waReps.length}`)
console.log(`  Total rows: ${rows.length}`)
