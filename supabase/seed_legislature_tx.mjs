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

// ─── Texas State Senate (31 members, 89th Legislature) ─────────────────
const txSenators = [
  { name: 'Bryan Hughes', district: 1, party: 'republican' },
  { name: 'Bob Hall', district: 2, party: 'republican' },
  { name: 'Robert Nichols', district: 3, party: 'republican' },
  { name: 'Brandon Creighton', district: 4, party: 'republican' },
  { name: 'Charles Schwertner', district: 5, party: 'republican' },
  { name: 'Carol Alvarado', district: 6, party: 'democrat' },
  { name: 'Paul Bettencourt', district: 7, party: 'republican' },
  { name: 'Angela Paxton', district: 8, party: 'republican' },
  { name: 'Kelly Hancock', district: 9, party: 'republican' },
  { name: 'Phil King', district: 10, party: 'republican' },
  { name: 'Mayes Middleton', district: 11, party: 'republican' },
  { name: 'Tan Parker', district: 12, party: 'republican' },
  { name: 'Borris Miles', district: 13, party: 'democrat' },
  { name: 'Sarah Eckhardt', district: 14, party: 'democrat' },
  { name: 'John Whitmire', district: 15, party: 'democrat' },
  { name: 'Nathan Johnson', district: 16, party: 'democrat' },
  { name: 'Joan Huffman', district: 17, party: 'republican' },
  { name: 'Lois Kolkhorst', district: 18, party: 'republican' },
  { name: 'Roland Gutierrez', district: 19, party: 'democrat' },
  { name: 'Juan Hinojosa', district: 20, party: 'democrat' },
  { name: 'Judith Zaffirini', district: 21, party: 'democrat' },
  { name: 'Brian Birdwell', district: 22, party: 'republican' },
  { name: 'Royce West', district: 23, party: 'democrat' },
  { name: 'Pete Flores', district: 24, party: 'republican' },
  { name: 'Donna Campbell', district: 25, party: 'republican' },
  { name: 'José Menéndez', district: 26, party: 'democrat' },
  { name: 'Morgan LaMantia', district: 27, party: 'democrat' },
  { name: 'Charles Perry', district: 28, party: 'republican' },
  { name: 'César Blanco', district: 29, party: 'democrat' },
  { name: 'Drew Springer', district: 30, party: 'republican' },
  { name: 'Kevin Sparks', district: 31, party: 'republican' },
]

// ─── Texas State House (150 members, 89th Legislature) ─────────────────
const txReps = [
  { name: 'Brent Money', district: 1, party: 'republican' },
  { name: 'Bryan Slaton', district: 2, party: 'republican' },
  { name: 'Cecil Bell Jr.', district: 3, party: 'republican' },
  { name: 'Keith Bell', district: 4, party: 'republican' },
  { name: 'Cole Hefner', district: 5, party: 'republican' },
  { name: 'Matt Schaefer', district: 6, party: 'republican' },
  { name: 'Jay Dean', district: 7, party: 'republican' },
  { name: 'Cody Harris', district: 8, party: 'republican' },
  { name: 'Trent Ashby', district: 9, party: 'republican' },
  { name: 'Brian Harrison', district: 10, party: 'republican' },
  { name: 'Travis Clardy', district: 11, party: 'republican' },
  { name: 'Kyle Kacal', district: 12, party: 'republican' },
  { name: 'Angelia Orr', district: 13, party: 'republican' },
  { name: 'John Raney', district: 14, party: 'republican' },
  { name: 'Steve Toth', district: 15, party: 'republican' },
  { name: 'Will Metcalf', district: 16, party: 'republican' },
  { name: 'Stan Gerdes', district: 17, party: 'republican' },
  { name: 'Ernest Bailes', district: 18, party: 'republican' },
  { name: 'Ellen Troxclair', district: 19, party: 'republican' },
  { name: 'Terry Wilson', district: 20, party: 'republican' },
  { name: 'Dade Phelan', district: 21, party: 'republican' },
  { name: 'Christian Manuel', district: 22, party: 'republican' },
  { name: 'Terri Leo-Wilson', district: 23, party: 'republican' },
  { name: 'Greg Bonnen', district: 24, party: 'republican' },
  { name: 'Cody Vasut', district: 25, party: 'republican' },
  { name: 'Jacey Jetton', district: 26, party: 'republican' },
  { name: 'Ron Reynolds', district: 27, party: 'democrat' },
  { name: 'Gary Gates', district: 28, party: 'republican' },
  { name: 'Ed Thompson', district: 29, party: 'republican' },
  { name: 'Geanie Morrison', district: 30, party: 'republican' },
  { name: 'Ryan Guillen', district: 31, party: 'republican' },
  { name: 'Todd Hunter', district: 32, party: 'republican' },
  { name: 'Justin Holland', district: 33, party: 'republican' },
  { name: 'Abel Herrero', district: 34, party: 'democrat' },
  { name: 'Oscar Longoria', district: 35, party: 'democrat' },
  { name: 'Sergio Muñoz Jr.', district: 36, party: 'democrat' },
  { name: 'Luis Villarreal', district: 37, party: 'republican' },
  { name: 'Eddie Lucio III', district: 38, party: 'democrat' },
  { name: 'Armando Martinez', district: 39, party: 'democrat' },
  { name: 'Terry Canales', district: 40, party: 'democrat' },
  { name: 'Bobby Guerra', district: 41, party: 'democrat' },
  { name: 'Richard Peña Raymond', district: 42, party: 'democrat' },
  { name: 'J.M. Lozano', district: 43, party: 'republican' },
  { name: 'John Kuempel', district: 44, party: 'republican' },
  { name: 'Erin Zwiener', district: 45, party: 'democrat' },
  { name: 'Sheryl Cole', district: 46, party: 'democrat' },
  { name: 'Vikki Goodwin', district: 47, party: 'democrat' },
  { name: 'Donna Howard', district: 48, party: 'democrat' },
  { name: 'Gina Hinojosa', district: 49, party: 'democrat' },
  { name: 'Celia Israel', district: 50, party: 'democrat' },
  { name: 'Esther Spiller', district: 51, party: 'democrat' },
  { name: 'Caroline Harris', district: 52, party: 'republican' },
  { name: 'Andrew Murr', district: 53, party: 'republican' },
  { name: 'Brad Buckley', district: 54, party: 'republican' },
  { name: 'Hugh Shine', district: 55, party: 'republican' },
  { name: 'Charles Anderson', district: 56, party: 'republican' },
  { name: 'Tanya Vea', district: 57, party: 'republican' },
  { name: 'DeWayne Burns', district: 58, party: 'republican' },
  { name: 'Shelby Slawson', district: 59, party: 'republican' },
  { name: 'Glenn Rogers', district: 60, party: 'republican' },
  { name: 'Frederick Frazier', district: 61, party: 'republican' },
  { name: 'Reggie Smith', district: 62, party: 'republican' },
  { name: 'Ben Bumgarner', district: 63, party: 'republican' },
  { name: 'Lynn Stucky', district: 64, party: 'republican' },
  { name: 'Kronda Thimesch', district: 65, party: 'republican' },
  { name: 'Matt Shaheen', district: 66, party: 'republican' },
  { name: 'Jeff Leach', district: 67, party: 'republican' },
  { name: 'David Spiller', district: 68, party: 'republican' },
  { name: 'James Frank', district: 69, party: 'republican' },
  { name: 'Scott Sanford', district: 70, party: 'republican' },
  { name: 'Stan Lambert', district: 71, party: 'republican' },
  { name: 'Drew Darby', district: 72, party: 'republican' },
  { name: 'Carrie Isaac', district: 73, party: 'republican' },
  { name: 'Robert Garza', district: 74, party: 'democrat' },
  { name: 'Mary González', district: 75, party: 'democrat' },
  { name: 'Claudia Ordaz', district: 76, party: 'democrat' },
  { name: 'Lina Ortega', district: 77, party: 'democrat' },
  { name: 'Joe Moody', district: 78, party: 'democrat' },
  { name: 'Claudia Pérez', district: 79, party: 'democrat' },
  { name: 'Tracy King', district: 80, party: 'democrat' },
  { name: 'Brooks Landgraf', district: 81, party: 'republican' },
  { name: 'Tom Craddick', district: 82, party: 'republican' },
  { name: 'Dustin Burrows', district: 83, party: 'republican' },
  { name: 'Carl Tepper', district: 84, party: 'republican' },
  { name: 'Stan Kitzman', district: 85, party: 'republican' },
  { name: 'John Smithee', district: 86, party: 'republican' },
  { name: 'Four Price', district: 87, party: 'republican' },
  { name: 'Ken King', district: 88, party: 'republican' },
  { name: 'Candy Noble', district: 89, party: 'republican' },
  { name: 'Ramon Romero Jr.', district: 90, party: 'democrat' },
  { name: 'Stephanie Klick', district: 91, party: 'republican' },
  { name: 'Jeff Cason', district: 92, party: 'republican' },
  { name: 'Nate Schatzline', district: 93, party: 'republican' },
  { name: 'Tony Tinderholt', district: 94, party: 'republican' },
  { name: 'Nicole Collier', district: 95, party: 'democrat' },
  { name: 'David Cook', district: 96, party: 'republican' },
  { name: 'Craig Goldman', district: 97, party: 'republican' },
  { name: 'Giovanni Capriglione', district: 98, party: 'republican' },
  { name: 'Charlie Geren', district: 99, party: 'republican' },
  { name: 'Venton Jones', district: 100, party: 'democrat' },
  { name: 'Chris Turner', district: 101, party: 'democrat' },
  { name: 'Ana-Maria Ramos', district: 102, party: 'democrat' },
  { name: 'Rafael Anchía', district: 103, party: 'democrat' },
  { name: 'Jessica González', district: 104, party: 'democrat' },
  { name: 'Terry Meza', district: 105, party: 'democrat' },
  { name: 'Jared Patterson', district: 106, party: 'republican' },
  { name: 'Victoria Neave Criado', district: 107, party: 'democrat' },
  { name: 'Morgan Meyer', district: 108, party: 'republican' },
  { name: 'Carl Sherman', district: 109, party: 'democrat' },
  { name: 'Toni Rose', district: 110, party: 'democrat' },
  { name: 'Yvonne Davis', district: 111, party: 'democrat' },
  { name: 'Angie Chen Button', district: 112, party: 'republican' },
  { name: 'Rhetta Bowers', district: 113, party: 'democrat' },
  { name: 'John Bryant', district: 114, party: 'democrat' },
  { name: 'Julie Johnson', district: 115, party: 'democrat' },
  { name: 'Trey Martinez Fischer', district: 116, party: 'democrat' },
  { name: 'Philip Cortez', district: 117, party: 'democrat' },
  { name: 'John Lujan', district: 118, party: 'republican' },
  { name: 'Liz Campos', district: 119, party: 'democrat' },
  { name: 'Barbara Gervin-Hawkins', district: 120, party: 'democrat' },
  { name: 'Steve Allison', district: 121, party: 'republican' },
  { name: 'Mark Dorazio', district: 122, party: 'republican' },
  { name: 'Diego Bernal', district: 123, party: 'democrat' },
  { name: 'Josey Garcia', district: 124, party: 'democrat' },
  { name: 'Ray Lopez', district: 125, party: 'democrat' },
  { name: 'Sam Harless', district: 126, party: 'republican' },
  { name: 'Charles Cunningham', district: 127, party: 'republican' },
  { name: 'Briscoe Cain', district: 128, party: 'republican' },
  { name: 'Dennis Paul', district: 129, party: 'republican' },
  { name: 'Tom Oliverson', district: 130, party: 'republican' },
  { name: 'Alma Allen', district: 131, party: 'democrat' },
  { name: 'Mike Schofield', district: 132, party: 'republican' },
  { name: 'Mano DeAyala', district: 133, party: 'republican' },
  { name: 'Ann Johnson', district: 134, party: 'democrat' },
  { name: 'Jon Rosenthal', district: 135, party: 'democrat' },
  { name: 'John Bucy III', district: 136, party: 'democrat' },
  { name: 'Gene Wu', district: 137, party: 'democrat' },
  { name: 'Lacey Hull', district: 138, party: 'republican' },
  { name: 'Jarvis Johnson', district: 139, party: 'democrat' },
  { name: 'Armando Walle', district: 140, party: 'democrat' },
  { name: 'Senfronia Thompson', district: 141, party: 'democrat' },
  { name: 'Harold Dutton Jr.', district: 142, party: 'democrat' },
  { name: 'Ana Hernandez', district: 143, party: 'democrat' },
  { name: 'Mary Ann Perez', district: 144, party: 'democrat' },
  { name: 'Christina Morales', district: 145, party: 'democrat' },
  { name: 'Shawn Thierry', district: 146, party: 'democrat' },
  { name: 'Jolanda Jones', district: 147, party: 'democrat' },
  { name: 'Penny Morales Shaw', district: 148, party: 'democrat' },
  { name: 'Hubert Vo', district: 149, party: 'democrat' },
  { name: 'Valoree Swanson', district: 150, party: 'republican' },
]

// ─── Build rows ─────────────────────────────────────────────────────────
const rows = []

for (const s of txSenators) {
  rows.push({
    name: s.name,
    slug: slugify(s.name),
    state: 'TX',
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, District ${s.district}`,
    bio: `Texas State Senator representing District ${s.district}. Member of the 89th Texas Legislature.`,
    image_url: null,
  })
}

for (const r of txReps) {
  rows.push({
    name: r.name,
    slug: slugify(r.name),
    state: 'TX',
    chamber: 'state_house',
    party: r.party,
    title: `State Representative, District ${r.district}`,
    bio: `Texas State Representative serving District ${r.district}. Member of the 89th Texas Legislature.`,
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
console.log(`  State Senators: ${txSenators.length}`)
console.log(`  State Reps: ${txReps.length}`)
console.log(`  Total: ${rows.length}`)
