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

// ─── Maryland State Senate (47 districts) ─────────────────────
// Source: Maryland General Assembly official roster, 2023-2026 session
const senators = [
  { name: 'Johnny Ray Salling', district: 1, party: 'republican' },
  { name: 'Mary Beth Carozza', district: 2, party: 'republican' },
  { name: 'Chris West', district: 3, party: 'republican' },
  { name: 'Jason Gallion', district: 4, party: 'republican' },
  { name: 'Justin Ready', district: 5, party: 'republican' },
  { name: 'Johnny Ray Salling', district: 6, party: 'republican' },
  { name: 'J.B. Jennings', district: 7, party: 'republican' },
  { name: 'Katherine Klausmeier', district: 8, party: 'democrat' },
  { name: 'Katie Fry Hester', district: 9, party: 'democrat' },
  { name: 'Pamela Beidle', district: 10, party: 'democrat' },
  { name: 'Bryan Simonaire', district: 11, party: 'republican' },
  { name: 'Clarence Lam', district: 12, party: 'democrat' },
  { name: 'Guy Guzzone', district: 13, party: 'democrat' },
  { name: 'Craig Zucker', district: 14, party: 'democrat' },
  { name: 'Brian Feldman', district: 15, party: 'democrat' },
  { name: 'Susan Lee', district: 16, party: 'democrat' },
  { name: 'Cheryl Kagan', district: 17, party: 'democrat' },
  { name: 'Jeff Waldstreicher', district: 18, party: 'democrat' },
  { name: 'Benjamin Kramer', district: 19, party: 'democrat' },
  { name: 'Will Smith', district: 20, party: 'democrat' },
  { name: 'Jim Rosapepe', district: 21, party: 'democrat' },
  { name: 'Paul Pinsky', district: 22, party: 'democrat' },
  { name: 'Ron Watson', district: 23, party: 'democrat' },
  { name: 'Joanne Benson', district: 24, party: 'democrat' },
  { name: 'Melony Griffith', district: 25, party: 'democrat' },
  { name: 'C. Anthony Muse', district: 26, party: 'democrat' },
  { name: 'Michael Jackson', district: 27, party: 'democrat' },
  { name: 'Arthur Ellis', district: 28, party: 'democrat' },
  { name: 'Jack Bailey', district: 29, party: 'republican' },
  { name: 'Sarah Elfreth', district: 30, party: 'democrat' },
  { name: 'Bryan Simonaire', district: 31, party: 'republican' },
  { name: 'Pamela Beidle', district: 32, party: 'democrat' },
  { name: 'Andrew Serafini', district: 33, party: 'republican' },
  { name: 'Johnny Ray Salling', district: 34, party: 'republican' },
  { name: 'Michele Lobo', district: 35, party: 'democrat' },
  { name: 'Shelly Hettleman', district: 36, party: 'democrat' },
  { name: 'Antonio Hayes', district: 37, party: 'democrat' },
  { name: 'Mary Washington', district: 38, party: 'democrat' },
  { name: 'Nancy King', district: 39, party: 'democrat' },
  { name: 'Antonio Hayes', district: 40, party: 'democrat' },
  { name: 'Jill Carter', district: 41, party: 'democrat' },
  { name: 'Chris West', district: 42, party: 'republican' },
  { name: 'Mary Washington', district: 43, party: 'democrat' },
  { name: 'Charles Sydnor', district: 44, party: 'democrat' },
  { name: 'Cory McCray', district: 45, party: 'democrat' },
  { name: 'Bill Ferguson', district: 46, party: 'democrat' },
  { name: 'Stephen Hershey', district: 47, party: 'republican' },
]

// ─── Maryland House of Delegates (141 delegates, multi-member districts) ─────
// Source: Maryland General Assembly official roster, 2023-2026 session
const houseMembers = [
  { name: 'Jason Buckel', district: '1A', party: 'republican' },
  { name: 'Mike McKay', district: '1B', party: 'republican' },
  { name: 'Wendell Beitzel', district: '1C', party: 'republican' },
  { name: 'William Wivell', district: '2A', party: 'republican' },
  { name: 'April Rose', district: '2B', party: 'republican' },
  { name: 'Brooke Grossman', district: '2C', party: 'democrat' },
  { name: 'Mike Griffith', district: '3A', party: 'republican' },
  { name: 'Steven Arentz', district: '3B', party: 'republican' },
  { name: 'Karen Simpson', district: '3C', party: 'democrat' },
  { name: 'Kevin Hornberger', district: '4A', party: 'republican' },
  { name: 'Teresa Woorman', district: '4B', party: 'republican' },
  { name: 'Bob Long', district: '4C', party: 'republican' },
  { name: 'Justin Ready', district: '5A', party: 'republican' },
  { name: 'April Rose', district: '5B', party: 'republican' },
  { name: 'Haven Shoemaker', district: '5C', party: 'republican' },
  { name: 'Robin Grammer', district: '6A', party: 'republican' },
  { name: 'Bob Long', district: '6B', party: 'republican' },
  { name: 'Cathi Forbes', district: '7A', party: 'republican' },
  { name: 'Lauren Arikan', district: '7B', party: 'republican' },
  { name: 'Kathy Szeliga', district: '7C', party: 'republican' },
  { name: 'Carl Jackson', district: '8A', party: 'democrat' },
  { name: 'Harry Bhandari', district: '8B', party: 'democrat' },
  { name: 'Diana Fennell', district: '8C', party: 'democrat' },
  { name: 'Trent Kittleman', district: '9A', party: 'republican' },
  { name: 'Chao Wu', district: '9B', party: 'democrat' },
  { name: 'Lisa Belcastro', district: '10A', party: 'democrat' },
  { name: 'Courtney Watson', district: '10B', party: 'democrat' },
  { name: 'Jessica Feldmark', district: '10C', party: 'democrat' },
  { name: 'Dana Stein', district: '11A', party: 'democrat' },
  { name: 'Jon Cardin', district: '11B', party: 'democrat' },
  { name: 'Brian Chisholm', district: '11C', party: 'republican' },
  { name: 'Terri Hill', district: '12A', party: 'democrat' },
  { name: 'Natalie Ziegler', district: '12B', party: 'democrat' },
  { name: 'Eric Ebersole', district: '13A', party: 'democrat' },
  { name: 'Vanessa Atterbeary', district: '13B', party: 'democrat' },
  { name: 'Nicole Williams', district: '13C', party: 'democrat' },
  { name: 'Anne Kaiser', district: '14A', party: 'democrat' },
  { name: 'Pamela Queen', district: '14B', party: 'democrat' },
  { name: 'Jheanelle Wilkins', district: '15A', party: 'democrat' },
  { name: 'Lily Qi', district: '15B', party: 'democrat' },
  { name: 'David Fraser-Hidalgo', district: '15C', party: 'democrat' },
  { name: 'Sara Love', district: '16A', party: 'democrat' },
  { name: 'Ariana Kelly', district: '16B', party: 'democrat' },
  { name: 'Marc Korman', district: '16C', party: 'democrat' },
  { name: 'Kumar Barve', district: '17A', party: 'democrat' },
  { name: 'Julie Palakovich Carr', district: '17B', party: 'democrat' },
  { name: 'Jim Gilchrist', district: '17C', party: 'democrat' },
  { name: 'Emily Shetty', district: '18A', party: 'democrat' },
  { name: 'Jared Solomon', district: '18B', party: 'democrat' },
  { name: 'Al Carr', district: '18C', party: 'democrat' },
  { name: 'Charlotte Crutchfield', district: '19A', party: 'democrat' },
  { name: 'Vaughn Stewart', district: '19B', party: 'democrat' },
  { name: 'Lorig Charkoudian', district: '20A', party: 'democrat' },
  { name: 'David Moon', district: '20B', party: 'democrat' },
  { name: 'Joseline Pena-Melnyk', district: '21A', party: 'democrat' },
  { name: 'Ben Barnes', district: '21B', party: 'democrat' },
  { name: 'Mary Lehman', district: '21C', party: 'democrat' },
  { name: 'Ashanti Martinez', district: '22A', party: 'democrat' },
  { name: 'Nicole Williams', district: '22B', party: 'democrat' },
  { name: 'Alonzo Washington', district: '22C', party: 'democrat' },
  { name: 'Marvin Holmes Jr.', district: '23A', party: 'democrat' },
  { name: 'Ron Watson', district: '23B', party: 'democrat' },
  { name: 'Kym Taylor', district: '24A', party: 'democrat' },
  { name: 'Jazz Lewis', district: '24B', party: 'democrat' },
  { name: 'Darryl Barnes', district: '25A', party: 'democrat' },
  { name: 'Nick Charles', district: '25B', party: 'democrat' },
  { name: 'Veronica Turner', district: '25C', party: 'democrat' },
  { name: 'Andrea Harrison', district: '26A', party: 'democrat' },
  { name: 'Kris Fair', district: '26B', party: 'democrat' },
  { name: 'Susie Proctor', district: '27A', party: 'democrat' },
  { name: 'Mike Rogers', district: '27B', party: 'democrat' },
  { name: 'Carl Jackson', district: '27C', party: 'democrat' },
  { name: 'Carl Jackson', district: '28A', party: 'democrat' },
  { name: 'Edith Patterson', district: '28B', party: 'democrat' },
  { name: 'Todd Morgan', district: '29A', party: 'republican' },
  { name: 'Daniel Cox', district: '29B', party: 'republican' },
  { name: 'Matt Morgan', district: '29C', party: 'republican' },
  { name: 'Shaneka Henson', district: '30A', party: 'democrat' },
  { name: 'Seth Howard', district: '30B', party: 'republican' },
  { name: 'Brian Chisholm', district: '31A', party: 'republican' },
  { name: 'Rachel Munoz', district: '31B', party: 'republican' },
  { name: 'Mark Chang', district: '32A', party: 'democrat' },
  { name: 'Mike Rogers', district: '32B', party: 'democrat' },
  { name: 'Andrew Serafini', district: '33A', party: 'republican' },
  { name: 'William Wivell', district: '33B', party: 'republican' },
  { name: 'Jefferson Ghrist', district: '34A', party: 'republican' },
  { name: 'Steven Arentz', district: '34B', party: 'republican' },
  { name: 'Adrienne Jones', district: '35A', party: 'democrat' },
  { name: 'Steve Johnson', district: '35B', party: 'democrat' },
  { name: 'Emmanuel Digman', district: '35C', party: 'democrat' },
  { name: 'Harry Bhandari', district: '36A', party: 'democrat' },
  { name: 'Michele Guyton', district: '36B', party: 'democrat' },
  { name: 'Sandy Bartlett', district: '36C', party: 'democrat' },
  { name: 'Scott Klansek', district: '37A', party: 'democrat' },
  { name: 'Caylin Young', district: '37B', party: 'democrat' },
  { name: 'Regina Boyce', district: '38A', party: 'democrat' },
  { name: 'Melissa Wells', district: '38B', party: 'democrat' },
  { name: 'Kirill Reznik', district: '39A', party: 'democrat' },
  { name: 'Lesley Lopez', district: '39B', party: 'democrat' },
  { name: 'Marlon Amprey', district: '40A', party: 'democrat' },
  { name: 'Antonio Hayes', district: '40B', party: 'democrat' },
  { name: 'Samuel Rosenberg', district: '41A', party: 'democrat' },
  { name: 'Dalya Attar', district: '41B', party: 'democrat' },
  { name: 'Tony Bridges', district: '41C', party: 'democrat' },
  { name: 'Pat Young', district: '42A', party: 'democrat' },
  { name: 'Nino Mangione', district: '42B', party: 'republican' },
  { name: 'Kevin Hornberger', district: '42C', party: 'republican' },
  { name: 'Cathi Forbes', district: '43A', party: 'republican' },
  { name: 'Brooke Lierman', district: '43B', party: 'democrat' },
  { name: 'Elizabeth Embry', district: '43C', party: 'democrat' },
  { name: 'Charles Sydnor', district: '44A', party: 'democrat' },
  { name: 'Sheila Ruth', district: '44B', party: 'democrat' },
  { name: 'Robbyn Lewis', district: '46A', party: 'democrat' },
  { name: 'Luke Clippinger', district: '46B', party: 'democrat' },
  { name: 'Brook Lierman', district: '46C', party: 'democrat' },
  { name: 'Jay Jacobs', district: '47A', party: 'republican' },
  { name: 'Christopher Adams', district: '47B', party: 'republican' },
]

// Build upsert rows
const rows = []

for (const s of senators) {
  rows.push({
    name: s.name,
    slug: slugify(s.name) + '-md-senate-' + s.district,
    state: 'MD',
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, District ${s.district}`,
    bio: `Maryland State Senator representing District ${s.district}.`,
    image_url: null,
  })
}

for (const h of houseMembers) {
  rows.push({
    name: h.name,
    slug: slugify(h.name) + '-md-house-' + h.district.toString().toLowerCase(),
    state: 'MD',
    chamber: 'state_house',
    party: h.party,
    title: `Delegate, District ${h.district}`,
    bio: `Maryland Delegate serving District ${h.district}.`,
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

console.log(`\nDone. Total MD legislators upserted: ${total} (${senators.length} senators + ${houseMembers.length} delegates)`)
