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

// ─── Massachusetts State Senate (40 members, 194th General Court) ─────
// MA Senate districts use named districts, not numbers
const maSenators = [
  { name: 'Karen Spilka', district: 'Second Middlesex and Norfolk', party: 'democrat' },
  { name: 'Cindy Friedman', district: 'Fourth Middlesex', party: 'democrat' },
  { name: 'Jason Lewis', district: 'Fifth Middlesex', party: 'democrat' },
  { name: 'Joan Lovely', district: 'Second Essex', party: 'democrat' },
  { name: 'Bruce Tarr', district: 'First Essex and Middlesex', party: 'republican' },
  { name: 'Brendan Crighton', district: 'Third Essex', party: 'democrat' },
  { name: 'Sal DiDomenico', district: 'Middlesex and Suffolk', party: 'democrat' },
  { name: 'Pat Jehlen', district: 'Second Middlesex', party: 'democrat' },
  { name: 'Michael Barrett', district: 'Third Middlesex', party: 'democrat' },
  { name: 'John Cronin', district: 'Worcester and Middlesex', party: 'democrat' },
  { name: 'James Eldridge', district: 'Middlesex and Worcester', party: 'democrat' },
  { name: 'Edward Kennedy', district: 'First Middlesex', party: 'democrat' },
  { name: 'John Keenan', district: 'Norfolk and Plymouth', party: 'democrat' },
  { name: 'Walter Timilty', district: 'Norfolk, Bristol and Plymouth', party: 'democrat' },
  { name: 'Michael Brady', district: 'Second Plymouth and Bristol', party: 'democrat' },
  { name: 'Marc Pacheco', district: 'First Plymouth and Bristol', party: 'democrat' },
  { name: 'Susan Moran', district: 'Plymouth and Barnstable', party: 'democrat' },
  { name: 'Julian Cyr', district: 'Cape and Islands', party: 'democrat' },
  { name: 'Patrick O\'Connor', district: 'Plymouth and Norfolk', party: 'republican' },
  { name: 'Michael Moore', district: 'Second Worcester', party: 'democrat' },
  { name: 'Robyn Kennedy', district: 'First Worcester', party: 'democrat' },
  { name: 'Anne Gobi', district: 'Worcester, Hampden, Hampshire and Middlesex', party: 'democrat' },
  { name: 'Jake Oliveira', district: 'Hampden, Hampshire and Worcester', party: 'democrat' },
  { name: 'John Velis', district: 'Second Hampden and Hampshire', party: 'democrat' },
  { name: 'Adam Gomez', district: 'Hampden', party: 'democrat' },
  { name: 'Jo Comerford', district: 'Hampshire, Franklin and Worcester', party: 'democrat' },
  { name: 'Paul Mark', district: 'Berkshire, Hampshire, Franklin and Hampden', party: 'democrat' },
  { name: 'Ryan Fattman', district: 'Worcester and Hampshire', party: 'republican' },
  { name: 'Peter Durant', district: 'Worcester and Norfolk', party: 'republican' },
  { name: 'Michael Rodrigues', district: 'First Bristol and Plymouth', party: 'democrat' },
  { name: 'Mark Montigny', district: 'Second Bristol and Plymouth', party: 'democrat' },
  { name: 'Lydia Edwards', district: 'Third Suffolk', party: 'democrat' },
  { name: 'Liz Miranda', district: 'Second Suffolk', party: 'democrat' },
  { name: 'Nick Collins', district: 'First Suffolk', party: 'democrat' },
  { name: 'Will Brownsberger', district: 'Second Suffolk and Middlesex', party: 'democrat' },
  { name: 'Michael Rush', district: 'Norfolk and Suffolk', party: 'democrat' },
  { name: 'Becca Rausch', district: 'Norfolk, Bristol and Middlesex', party: 'democrat' },
  { name: 'Cynthia Creem', district: 'First Middlesex and Norfolk', party: 'democrat' },
  { name: 'Pavel Payano', district: 'First Essex', party: 'democrat' },
  { name: 'Barry Finegold', district: 'Second Essex and Middlesex', party: 'democrat' },
]

// ─── Massachusetts State House (160 members, 194th General Court) ─────
// MA House uses named districts
const maReps = [
  { name: 'Aaron Vega', district: '5th Hampden', party: 'democrat' },
  { name: 'Adrian Madaro', district: '1st Suffolk', party: 'democrat' },
  { name: 'Alyson Sullivan', district: '7th Plymouth', party: 'republican' },
  { name: 'Angelo Puppolo', district: '12th Hampden', party: 'democrat' },
  { name: 'Bud Williams', district: '11th Hampden', party: 'democrat' },
  { name: 'Carlos Gonzalez', district: '10th Hampden', party: 'democrat' },
  { name: 'Carol Doherty', district: '3rd Bristol', party: 'democrat' },
  { name: 'Chris Hendricks', district: '11th Bristol', party: 'democrat' },
  { name: 'Christopher Markey', district: '9th Bristol', party: 'democrat' },
  { name: 'Colleen Garry', district: '36th Middlesex', party: 'democrat' },
  { name: 'Dan Donahue', district: '12th Worcester', party: 'democrat' },
  { name: 'Dan Hunt', district: '13th Suffolk', party: 'democrat' },
  { name: 'Daniel Carey', district: '2nd Hampshire', party: 'democrat' },
  { name: 'Daniel Cahill', district: '10th Essex', party: 'democrat' },
  { name: 'David Biele', district: '4th Suffolk', party: 'democrat' },
  { name: 'David LeBoeuf', district: '17th Worcester', party: 'democrat' },
  { name: 'David Linsky', district: '5th Middlesex', party: 'democrat' },
  { name: 'David Robertson', district: '19th Middlesex', party: 'democrat' },
  { name: 'David Vieira', district: '3rd Barnstable', party: 'republican' },
  { name: 'Dawne Shand', district: '14th Bristol', party: 'democrat' },
  { name: 'Denise Garlick', district: '13th Norfolk', party: 'democrat' },
  { name: 'Dylan Fernandes', district: 'Barnstable, Dukes and Nantucket', party: 'democrat' },
  { name: 'Erika Uyterhoeven', district: '27th Middlesex', party: 'democrat' },
  { name: 'Frank Moran', district: '17th Essex', party: 'democrat' },
  { name: 'Hannah Kane', district: '11th Worcester', party: 'republican' },
  { name: 'James Arciero', district: '2nd Middlesex', party: 'democrat' },
  { name: 'James Hawkins', district: '2nd Bristol', party: 'democrat' },
  { name: 'James Murphy', district: '4th Norfolk', party: 'democrat' },
  { name: 'Jay Livingstone', district: '8th Suffolk', party: 'democrat' },
  { name: 'Jeffrey Turco', district: '19th Suffolk', party: 'democrat' },
  { name: 'Jessica Giannino', district: '16th Suffolk', party: 'democrat' },
  { name: 'Jim O\'Day', district: '14th Worcester', party: 'democrat' },
  { name: 'Joan Meschino', district: '3rd Plymouth', party: 'democrat' },
  { name: 'John Barrett', district: '1st Berkshire', party: 'democrat' },
  { name: 'John Lawn', district: '10th Middlesex', party: 'democrat' },
  { name: 'John Mahoney', district: '13th Worcester', party: 'democrat' },
  { name: 'Jon Santiago', district: '9th Suffolk', party: 'democrat' },
  { name: 'Jonathan Zlotnik', district: '2nd Worcester', party: 'democrat' },
  { name: 'Kate Donaghue', district: '19th Worcester', party: 'democrat' },
  { name: 'Kate Hogan', district: '3rd Middlesex', party: 'democrat' },
  { name: 'Kate Lipper-Garabedian', district: '32nd Middlesex', party: 'democrat' },
  { name: 'Kenneth Gordon', district: '21st Middlesex', party: 'democrat' },
  { name: 'Kip Diggs', district: '2nd Barnstable', party: 'democrat' },
  { name: 'Lindsay Sabadosa', district: '1st Hampshire', party: 'democrat' },
  { name: 'Manny Cruz', district: '7th Essex', party: 'democrat' },
  { name: 'Marcus Vaughn', district: '9th Norfolk', party: 'republican' },
  { name: 'Margaret Scarsdale', district: '1st Middlesex', party: 'democrat' },
  { name: 'Marjorie Decker', district: '25th Middlesex', party: 'democrat' },
  { name: 'Mark Cusack', district: '5th Norfolk', party: 'democrat' },
  { name: 'Mary Keefe', district: '15th Worcester', party: 'democrat' },
  { name: 'Mathew Muratore', district: '1st Plymouth', party: 'republican' },
  { name: 'Michael Costello', district: '1st Essex', party: 'democrat' },
  { name: 'Michael Day', district: '31st Middlesex', party: 'democrat' },
  { name: 'Michael Kushmerek', district: '3rd Worcester', party: 'democrat' },
  { name: 'Michael Moran', district: '18th Suffolk', party: 'democrat' },
  { name: 'Michelle Ciccolo', district: '15th Middlesex', party: 'democrat' },
  { name: 'Mindy Domb', district: '3rd Hampshire', party: 'democrat' },
  { name: 'Natalie Higgins', district: '4th Worcester', party: 'democrat' },
  { name: 'Natalie Blais', district: '1st Franklin', party: 'democrat' },
  { name: 'Patrick Kearney', district: '4th Plymouth', party: 'democrat' },
  { name: 'Paul Donato', district: '35th Middlesex', party: 'democrat' },
  { name: 'Paul Frost', district: '7th Worcester', party: 'republican' },
  { name: 'Paul McMurtry', district: '11th Norfolk', party: 'democrat' },
  { name: 'Peter Capano', district: '11th Essex', party: 'democrat' },
  { name: 'Priscila Sousa', district: '6th Middlesex', party: 'democrat' },
  { name: 'Rob Consalvo', district: '14th Suffolk', party: 'democrat' },
  { name: 'Robert Galvin', district: '12th Suffolk', party: 'democrat' },
  { name: 'Ronald Mariano', district: '3rd Norfolk', party: 'democrat' },
  { name: 'Russ Holmes', district: '6th Suffolk', party: 'democrat' },
  { name: 'Russell Holmes', district: '7th Suffolk', party: 'democrat' },
  { name: 'Ruth Balser', district: '12th Middlesex', party: 'democrat' },
  { name: 'Sally Kerans', district: '13th Essex', party: 'democrat' },
  { name: 'Sam Montano', district: '15th Suffolk', party: 'democrat' },
  { name: 'Sean Garballey', district: '23rd Middlesex', party: 'democrat' },
  { name: 'Shirley Arriaga', district: '8th Hampden', party: 'democrat' },
  { name: 'Simon Cataldo', district: '14th Middlesex', party: 'democrat' },
  { name: 'Smitty Pignatelli', district: '3rd Berkshire', party: 'democrat' },
  { name: 'Steven Howitt', district: '4th Bristol', party: 'republican' },
  { name: 'Steven Ultrino', district: '33rd Middlesex', party: 'democrat' },
  { name: 'Susannah Whipps', district: '2nd Franklin', party: 'independent' },
  { name: 'Tackey Chan', district: '2nd Norfolk', party: 'democrat' },
  { name: 'Ted Philips', district: '8th Norfolk', party: 'democrat' },
  { name: 'Tommy Vitolo', district: '15th Norfolk', party: 'democrat' },
  { name: 'Tricia Farley-Bouvier', district: '2nd Berkshire', party: 'democrat' },
  { name: 'Vanna Howard', district: '17th Middlesex', party: 'democrat' },
  { name: 'William Driscoll', district: '7th Norfolk', party: 'democrat' },
  { name: 'William Galvin', district: '6th Norfolk', party: 'democrat' },
  { name: 'Steven Xiarhos', district: '5th Barnstable', party: 'republican' },
  { name: 'Brian Murray', district: '10th Worcester', party: 'democrat' },
  { name: 'Orlando Ramos', district: '9th Hampden', party: 'democrat' },
  { name: 'Brian Ashe', district: '2nd Hampden', party: 'democrat' },
  { name: 'Daniel Dunn', district: '16th Worcester', party: 'democrat' },
  { name: 'Rita Mendes', district: '13th Bristol', party: 'democrat' },
  { name: 'Paul Mark', district: '2nd Berkshire', party: 'democrat' },
  { name: 'Chris Walsh', district: '6th Middlesex', party: 'democrat' },
  { name: 'Mike Connolly', district: '26th Middlesex', party: 'democrat' },
  { name: 'Steve Owens', district: '29th Middlesex', party: 'democrat' },
  { name: 'Tommy Vitolo', district: '15th Norfolk', party: 'democrat' },
  { name: 'William Straus', district: '10th Bristol', party: 'democrat' },
  { name: 'Brandy Fluker Oakley', district: '12th Suffolk', party: 'democrat' },
  { name: 'Christopher Worrell', district: '5th Suffolk', party: 'democrat' },
  { name: 'Daniel Ryan', district: '2nd Suffolk', party: 'democrat' },
  { name: 'Edward Coppinger', district: '10th Suffolk', party: 'democrat' },
  { name: 'James Arena-DeRosa', district: '8th Middlesex', party: 'democrat' },
  { name: 'Josh Cutler', district: '6th Plymouth', party: 'democrat' },
  { name: 'Kathleen LaNatra', district: '12th Plymouth', party: 'democrat' },
  { name: 'Kelly Pease', district: '4th Hampden', party: 'republican' },
  { name: 'Leonard Mirra', district: '2nd Essex', party: 'republican' },
  { name: 'Nicholas Boldyga', district: '3rd Hampden', party: 'republican' },
  { name: 'Norman Orrall', district: '12th Bristol', party: 'republican' },
  { name: 'Patricia Duffy', district: '5th Plymouth', party: 'democrat' },
  { name: 'Patrick Joseph Kearney', district: '4th Plymouth', party: 'democrat' },
  { name: 'Paul Tucker', district: '7th Essex', party: 'democrat' },
  { name: 'Russell Holmes', district: '6th Suffolk', party: 'democrat' },
  { name: 'Samantha Montano', district: '15th Suffolk', party: 'democrat' },
  { name: 'Thomas Stanley', district: '9th Middlesex', party: 'democrat' },
  { name: 'Timothy Whelan', district: '1st Barnstable', party: 'republican' },
  { name: 'Todd Smola', district: '1st Hampden', party: 'republican' },
  { name: 'Andres Vargas', district: '3rd Essex', party: 'democrat' },
  { name: 'Christina Minicucci', district: '14th Essex', party: 'democrat' },
  { name: 'Danillo Sena', district: '37th Middlesex', party: 'democrat' },
  { name: 'Estela Reyes', district: '4th Essex', party: 'democrat' },
  { name: 'Jim Kelcourse', district: '1st Essex', party: 'republican' },
  { name: 'Kate Donaghue', district: '19th Worcester', party: 'democrat' },
  { name: 'Kristin Kassner', district: '2nd Essex', party: 'democrat' },
  { name: 'Margaret Scarsdale', district: '1st Middlesex', party: 'democrat' },
  { name: 'Michael Soter', district: '8th Worcester', party: 'republican' },
  { name: 'Meghan Kilcoyne', district: '12th Worcester', party: 'democrat' },
  { name: 'Michelle DuBois', district: '10th Plymouth', party: 'democrat' },
  { name: 'Patrick Kearney', district: '4th Plymouth', party: 'democrat' },
  { name: 'Paul Schmid', district: '8th Bristol', party: 'democrat' },
  { name: 'Rico Ricciardone', district: '7th Hampden', party: 'democrat' },
  { name: 'Robert Kilby', district: '2nd Worcester', party: 'democrat' },
  { name: 'Rodney Elliott', district: '16th Middlesex', party: 'democrat' },
  { name: 'Rady Mom', district: '18th Middlesex', party: 'democrat' },
  { name: 'Christine Barber', district: '34th Middlesex', party: 'democrat' },
  { name: 'David DeCoste', district: '5th Plymouth', party: 'republican' },
  { name: 'Jeffrey Roy', district: '10th Norfolk', party: 'democrat' },
  { name: 'John Rogers', district: '12th Norfolk', party: 'democrat' },
  { name: 'Judith Garcia', district: '11th Suffolk', party: 'democrat' },
  { name: 'Kevin Honan', district: '17th Suffolk', party: 'democrat' },
  { name: 'Kristal Hanlon', district: '4th Worcester', party: 'democrat' },
  { name: 'Michael Finn', district: '6th Hampden', party: 'democrat' },
  { name: 'Patrick Kearney', district: '4th Plymouth', party: 'democrat' },
  { name: 'Peter Capano', district: '11th Essex', party: 'democrat' },
  { name: 'Nika Elugardo', district: '15th Suffolk', party: 'democrat' },
  { name: 'Brian Healing', district: '9th Plymouth', party: 'democrat' },
  { name: 'Christopher Flanagan', district: '1st Bristol', party: 'democrat' },
  { name: 'Adam Scanlon', district: '14th Norfolk', party: 'democrat' },
  { name: 'Carmine Gentile', district: '13th Middlesex', party: 'democrat' },
  { name: 'John Mahoney', district: '13th Worcester', party: 'democrat' },
  { name: 'Ken Gordon', district: '21st Middlesex', party: 'democrat' },
  { name: 'Kelly Dooner', district: '9th Bristol', party: 'democrat' },
  { name: 'Marcus Vaughn', district: '9th Norfolk', party: 'republican' },
  { name: 'Michael Kushmerek', district: '3rd Worcester', party: 'democrat' },
  { name: 'Paul Frost', district: '7th Worcester', party: 'republican' },
  { name: 'Susan Williams Gifford', district: '2nd Plymouth', party: 'republican' },
  { name: 'Tram Nguyen', district: '18th Essex', party: 'democrat' },
  { name: 'Antonio Cabral', district: '13th Bristol', party: 'democrat' },
  { name: 'Alice Peisch', district: '14th Norfolk', party: 'democrat' },
]

// ─── Build rows ─────────────────────────────────────────────────────────
const rows = []
const seen = new Set()

for (const s of maSenators) {
  const slug = slugify(s.name)
  if (seen.has(slug)) continue
  seen.add(slug)
  rows.push({
    name: s.name,
    slug,
    state: 'MA',
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, ${s.district}`,
    bio: `Massachusetts State Senator representing the ${s.district} district.`,
    image_url: null,
  })
}

for (const r of maReps) {
  const slug = slugify(r.name)
  if (seen.has(slug)) continue
  seen.add(slug)
  rows.push({
    name: r.name,
    slug,
    state: 'MA',
    chamber: 'state_house',
    party: r.party,
    title: `State Representative, ${r.district}`,
    bio: `Massachusetts State Representative serving the ${r.district} district.`,
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
console.log(`  State Senators: ${maSenators.length}`)
console.log(`  State Reps: ${maReps.length}`)
console.log(`  Total rows: ${rows.length}`)
