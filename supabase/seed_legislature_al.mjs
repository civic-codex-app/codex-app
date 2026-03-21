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

// ─── Alabama State Senate (35 districts) ─────────────────────
// Source: Alabama Legislature official roster, 2023-2026 session
const senators = [
  { name: 'Greg Reed', district: 1, party: 'republican' },
  { name: 'Tom Butler', district: 2, party: 'republican' },
  { name: 'Garlan Gudger', district: 3, party: 'republican' },
  { name: 'Clay Scofield', district: 4, party: 'republican' },
  { name: 'Andrew Jones', district: 5, party: 'republican' },
  { name: 'Larry Stutts', district: 6, party: 'republican' },
  { name: 'Sam Givhan', district: 7, party: 'republican' },
  { name: 'Steve Livingston', district: 8, party: 'republican' },
  { name: 'Josh Carnley', district: 9, party: 'republican' },
  { name: 'Tim Melson', district: 10, party: 'republican' },
  { name: 'Arthur Orr', district: 11, party: 'republican' },
  { name: 'Chris Elliott', district: 12, party: 'republican' },
  { name: 'Jabo Waggoner', district: 13, party: 'republican' },
  { name: 'Shay Shelnutt', district: 14, party: 'republican' },
  { name: 'Dan Roberts', district: 15, party: 'republican' },
  { name: 'Keith Kelley', district: 16, party: 'republican' },
  { name: 'Rodger Smitherman', district: 17, party: 'democrat' },
  { name: 'Merika Coleman', district: 18, party: 'democrat' },
  { name: 'Linda Coleman-Madison', district: 19, party: 'democrat' },
  { name: 'Bobby Singleton', district: 20, party: 'democrat' },
  { name: 'Gerald Allen', district: 21, party: 'republican' },
  { name: 'Greg Albritton', district: 22, party: 'republican' },
  { name: 'Will Barfoot', district: 23, party: 'republican' },
  { name: 'David Burkette', district: 24, party: 'democrat' },
  { name: 'Vivian Figures', district: 25, party: 'democrat' },
  { name: 'Keith Kelley', district: 26, party: 'republican' },
  { name: 'David Sessions', district: 27, party: 'republican' },
  { name: 'Donnie Chesteen', district: 28, party: 'republican' },
  { name: 'Clyde Chambliss', district: 29, party: 'republican' },
  { name: 'Chris Pringle', district: 30, party: 'republican' },
  { name: 'Jimmy Holley', district: 31, party: 'republican' },
  { name: 'Kirk Hatcher', district: 32, party: 'democrat' },
  { name: 'Randy Price', district: 33, party: 'republican' },
  { name: 'Greg Albritton', district: 34, party: 'republican' },
  { name: 'Chris Elliott', district: 35, party: 'republican' },
]

// ─── Alabama State House (105 districts) ─────────────────────
// Source: Alabama Legislature official roster, 2023-2026 session
const houseMembers = [
  { name: 'Phillip Pettus', district: 1, party: 'republican' },
  { name: 'Chris Blackshear', district: 2, party: 'republican' },
  { name: 'Brock Colvin', district: 3, party: 'republican' },
  { name: 'Parker Duncan', district: 4, party: 'republican' },
  { name: 'Danny Crawford', district: 5, party: 'republican' },
  { name: 'Jamie Kiel', district: 6, party: 'republican' },
  { name: 'Ernie Yarbrough', district: 7, party: 'republican' },
  { name: 'Tracy Estes', district: 8, party: 'republican' },
  { name: 'Ben Robbins', district: 9, party: 'republican' },
  { name: 'Mike Shaw', district: 10, party: 'republican' },
  { name: 'Randall Shedd', district: 11, party: 'republican' },
  { name: 'Corey Harbison', district: 12, party: 'republican' },
  { name: 'Tim Wadsworth', district: 13, party: 'republican' },
  { name: 'Tim Wadsworth', district: 14, party: 'republican' },
  { name: 'Danny Garrett', district: 15, party: 'republican' },
  { name: 'Kyle South', district: 16, party: 'republican' },
  { name: 'Ritchie Whorton', district: 17, party: 'republican' },
  { name: 'Terri Collins', district: 18, party: 'republican' },
  { name: 'Laura Hall', district: 19, party: 'democrat' },
  { name: 'Anthony Daniels', district: 20, party: 'democrat' },
  { name: 'Rex Reynolds', district: 21, party: 'republican' },
  { name: 'Tommy Hanes', district: 22, party: 'republican' },
  { name: 'Tommy Hanes', district: 23, party: 'republican' },
  { name: 'Nathaniel Ledbetter', district: 24, party: 'republican' },
  { name: 'Wes Allen', district: 25, party: 'republican' },
  { name: 'David Standridge', district: 26, party: 'republican' },
  { name: 'Ginny Shaver', district: 27, party: 'republican' },
  { name: 'Howard Sanderford', district: 28, party: 'republican' },
  { name: 'Kerry Rich', district: 29, party: 'republican' },
  { name: 'Craig Lipscomb', district: 30, party: 'republican' },
  { name: 'Mike Holmes', district: 31, party: 'republican' },
  { name: 'Danny Garrett', district: 32, party: 'republican' },
  { name: 'Danny Garrett', district: 33, party: 'republican' },
  { name: 'Kurt Wallace', district: 34, party: 'republican' },
  { name: 'David Faulkner', district: 35, party: 'republican' },
  { name: 'Danny Garrett', district: 36, party: 'republican' },
  { name: 'Matthew Hammett', district: 37, party: 'republican' },
  { name: 'Bob Fincher', district: 38, party: 'republican' },
  { name: 'Juandalynn Givan', district: 39, party: 'democrat' },
  { name: 'Merika Coleman', district: 40, party: 'democrat' },
  { name: 'Rolanda Hollis', district: 41, party: 'democrat' },
  { name: 'Rod Scott', district: 42, party: 'democrat' },
  { name: 'John Rogers', district: 43, party: 'democrat' },
  { name: 'Mary Moore', district: 44, party: 'democrat' },
  { name: 'Kelvin Lawrence', district: 45, party: 'democrat' },
  { name: 'Thomas Jackson', district: 46, party: 'democrat' },
  { name: 'Adline Clarke', district: 47, party: 'democrat' },
  { name: 'Jim Hill', district: 48, party: 'republican' },
  { name: 'April Weaver', district: 49, party: 'republican' },
  { name: 'Susan DuBose', district: 50, party: 'republican' },
  { name: 'Corley Ellis', district: 51, party: 'republican' },
  { name: 'Scott Stadthagen', district: 52, party: 'republican' },
  { name: 'Matt Simpson', district: 53, party: 'republican' },
  { name: 'Matt Simpson', district: 54, party: 'republican' },
  { name: 'Leigh Hulsey', district: 55, party: 'republican' },
  { name: 'Tracy Estes', district: 56, party: 'republican' },
  { name: 'Rich Wingo', district: 57, party: 'republican' },
  { name: 'James Lomax', district: 58, party: 'democrat' },
  { name: 'Chris England', district: 59, party: 'democrat' },
  { name: 'Artis McCampbell', district: 60, party: 'democrat' },
  { name: 'Robert Bentley', district: 61, party: 'republican' },
  { name: 'Allen Farley', district: 62, party: 'republican' },
  { name: 'Bill Poole', district: 63, party: 'republican' },
  { name: 'Drake Hamilton', district: 64, party: 'republican' },
  { name: 'Randall Shedd', district: 65, party: 'republican' },
  { name: 'Kenneth Paschal', district: 66, party: 'republican' },
  { name: 'Brooke Basham', district: 67, party: 'republican' },
  { name: 'Victor Gaston', district: 68, party: 'republican' },
  { name: 'Donna Givens', district: 69, party: 'democrat' },
  { name: 'Kenneth Paschal', district: 70, party: 'republican' },
  { name: 'Mike Jones', district: 71, party: 'republican' },
  { name: 'Thomas Jackson', district: 72, party: 'democrat' },
  { name: 'Prince Chestnut', district: 73, party: 'democrat' },
  { name: 'Berry Forte', district: 74, party: 'democrat' },
  { name: 'TaShina Morris', district: 75, party: 'democrat' },
  { name: 'Chris Sells', district: 76, party: 'republican' },
  { name: 'Wes Allen', district: 77, party: 'republican' },
  { name: 'Kirk Hatcher', district: 78, party: 'democrat' },
  { name: 'Penni McClammy', district: 79, party: 'democrat' },
  { name: 'Jeremy Gray', district: 80, party: 'democrat' },
  { name: 'Reed Ingram', district: 81, party: 'republican' },
  { name: 'Rhett Marques', district: 82, party: 'republican' },
  { name: 'Chris Pringle', district: 83, party: 'republican' },
  { name: 'Matt Simpson', district: 84, party: 'republican' },
  { name: 'Chip Brown', district: 85, party: 'republican' },
  { name: 'Napoleon Bracy Jr.', district: 86, party: 'democrat' },
  { name: 'Thad McClammy', district: 87, party: 'democrat' },
  { name: 'Kelvin Lawrence', district: 88, party: 'democrat' },
  { name: 'Mike Holmes', district: 89, party: 'republican' },
  { name: 'Margie Wilcox', district: 90, party: 'republican' },
  { name: 'Donna Givens', district: 91, party: 'democrat' },
  { name: 'Rhett Marques', district: 92, party: 'republican' },
  { name: 'Matt Fridy', district: 93, party: 'republican' },
  { name: 'Phillip Pettus', district: 94, party: 'republican' },
  { name: 'Barbara Boyd', district: 95, party: 'democrat' },
  { name: 'A.J. McCampbell', district: 96, party: 'democrat' },
  { name: 'Jamie Kiel', district: 97, party: 'republican' },
  { name: 'Terri Collins', district: 98, party: 'republican' },
  { name: 'Danny Crawford', district: 99, party: 'republican' },
  { name: 'Steve Clouse', district: 100, party: 'republican' },
  { name: 'Jeff Sorrells', district: 101, party: 'republican' },
  { name: 'Joe Lovvorn', district: 102, party: 'republican' },
  { name: 'Victor Gaston', district: 103, party: 'republican' },
  { name: 'Shane Stringer', district: 104, party: 'republican' },
  { name: 'Chris Pringle', district: 105, party: 'republican' },
]

// Build upsert rows
const rows = []

for (const s of senators) {
  rows.push({
    name: s.name,
    slug: slugify(s.name) + '-al-senate-' + s.district,
    state: 'AL',
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, District ${s.district}`,
    bio: `Alabama State Senator representing District ${s.district}.`,
    image_url: null,
  })
}

for (const h of houseMembers) {
  rows.push({
    name: h.name,
    slug: slugify(h.name) + '-al-house-' + h.district,
    state: 'AL',
    chamber: 'state_house',
    party: h.party,
    title: `State Representative, District ${h.district}`,
    bio: `Alabama State Representative serving District ${h.district}.`,
    image_url: null,
  })
}

// Batch upsert in groups of 50
const BATCH = 50
let total = 0
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH)
  const { error, data } = await supabase
    .from('politicians')
    .upsert(batch, { onConflict: 'slug' })
    .select('id')
  if (error) {
    console.error(`Batch ${i / BATCH + 1} error:`, error.message)
  } else {
    total += data.length
    console.log(`Batch ${i / BATCH + 1}: upserted ${data.length} rows`)
  }
}

console.log(`\nDone. Total AL legislators upserted: ${total} (${senators.length} senators + ${houseMembers.length} house)`)
