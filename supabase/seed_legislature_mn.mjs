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

// Minnesota Legislature — 93rd Session (2023-2026)
// 67 State Senators, 134 State Representatives
// Source: leg.mn.gov

const MN_SENATORS = [
  { name: 'Jim Carlson', district: 1, party: 'democrat' },
  { name: 'Grant Hauschild', district: 2, party: 'democrat' },
  { name: 'Robert Farnsworth', district: 3, party: 'republican' },
  { name: 'Justin Eichorn', district: 4, party: 'republican' },
  { name: 'Paul Utke', district: 5, party: 'republican' },
  { name: 'Steve Green', district: 6, party: 'republican' },
  { name: 'Lisa Demuth', district: 7, party: 'republican' },
  { name: 'Jordan Rasmusson', district: 8, party: 'republican' },
  { name: 'Torrey Westrom', district: 9, party: 'republican' },
  { name: 'Steve Cwodzinski', district: 10, party: 'democrat' },
  { name: 'Carla Nelson', district: 11, party: 'republican' },
  { name: 'Jennifer McEwen', district: 12, party: 'democrat' },
  { name: 'Jeff Howe', district: 13, party: 'republican' },
  { name: 'Aric Putnam', district: 14, party: 'democrat' },
  { name: 'Andrew Lang', district: 15, party: 'republican' },
  { name: 'Gary Dahms', district: 16, party: 'republican' },
  { name: 'Bill Weber', district: 17, party: 'republican' },
  { name: 'Nick Frentz', district: 18, party: 'democrat' },
  { name: 'John Jasinski', district: 19, party: 'republican' },
  { name: 'Rich Draheim', district: 20, party: 'republican' },
  { name: 'Zach Duckworth', district: 21, party: 'republican' },
  { name: 'Gene Dornink', district: 22, party: 'republican' },
  { name: 'Matt Klein', district: 23, party: 'democrat' },
  { name: 'Julia Coleman', district: 24, party: 'republican' },
  { name: 'David Senjem', district: 25, party: 'republican' },
  { name: 'Tara Mack', district: 26, party: 'republican' },
  { name: 'Dave Osmek', district: 27, party: 'republican' },
  { name: 'Eric Pratt', district: 28, party: 'republican' },
  { name: 'Mark Koran', district: 29, party: 'republican' },
  { name: 'Warren Limmer', district: 30, party: 'republican' },
  { name: 'Karin Housley', district: 31, party: 'republican' },
  { name: 'Andrew Mathews', district: 32, party: 'republican' },
  { name: 'Mary Kunesh', district: 33, party: 'democrat' },
  { name: 'Bonnie Westlin', district: 34, party: 'democrat' },
  { name: 'Kelly Morrison', district: 35, party: 'democrat' },
  { name: 'Jim Abeler', district: 36, party: 'republican' },
  { name: 'Heather Gustafson', district: 37, party: 'democrat' },
  { name: 'Ann Rest', district: 38, party: 'democrat' },
  { name: 'Ron Latz', district: 39, party: 'democrat' },
  { name: 'Steve Drazkowski', district: 40, party: 'republican' },
  { name: 'Sandra Pappas', district: 41, party: 'democrat' },
  { name: 'Bobby Joe Champion', district: 42, party: 'democrat' },
  { name: 'John Marty', district: 43, party: 'democrat' },
  { name: 'Erin Murphy', district: 44, party: 'democrat' },
  { name: 'Lindsey Port', district: 45, party: 'democrat' },
  { name: 'D. Scott Dibble', district: 46, party: 'democrat' },
  { name: 'Omar Fateh', district: 47, party: 'democrat' },
  { name: 'Nicole Mitchell', district: 48, party: 'democrat' },
  { name: 'Judy Seeberger', district: 49, party: 'democrat' },
  { name: 'Susan Kent', district: 50, party: 'democrat' },
  { name: 'Clare Oumou Verbeten', district: 51, party: 'democrat' },
  { name: 'Foung Hawj', district: 52, party: 'democrat' },
  { name: 'Matt Boldon', district: 53, party: 'democrat' },
  { name: 'Kari Dziedzic', district: 54, party: 'democrat' },
  { name: 'Rob Kupec', district: 55, party: 'democrat' },
  { name: 'Alice Mann', district: 56, party: 'democrat' },
  { name: 'Ann Johnson Stewart', district: 57, party: 'democrat' },
  { name: 'Zaynab Mohamed', district: 58, party: 'democrat' },
  { name: 'Sahra Odowa', district: 59, party: 'democrat' },
  { name: 'John Hoffman', district: 60, party: 'democrat' },
  { name: 'Jim Abeler', district: 36, party: 'republican' },
  { name: 'Michelle Benson', district: 61, party: 'republican' },
  { name: 'Chris Eaton', district: 62, party: 'democrat' },
  { name: 'Kelly Morrison', district: 63, party: 'democrat' },
  { name: 'Erin Maye Quade', district: 64, party: 'democrat' },
  { name: 'Greg Clausen', district: 65, party: 'democrat' },
  { name: 'Melissa Wiklund', district: 66, party: 'democrat' },
  { name: 'Liz Boldon', district: 67, party: 'democrat' },
]

const MN_REPS = [
  { name: 'Roger Skraba', district: '1A', party: 'republican' },
  { name: 'Dave Lislegard', district: '1B', party: 'democrat' },
  { name: 'Matt Bliss', district: '2A', party: 'republican' },
  { name: 'Natalie Zeleznikar', district: '2B', party: 'republican' },
  { name: 'Harley Droba', district: '3A', party: 'democrat' },
  { name: 'Rob Ecklund', district: '3B', party: 'democrat' },
  { name: 'Ben Davis', district: '4A', party: 'republican' },
  { name: 'Spencer Igo', district: '4B', party: 'republican' },
  { name: 'John Burkel', district: '5A', party: 'republican' },
  { name: 'Danny Nadeau', district: '5B', party: 'republican' },
  { name: 'Mike Wiener', district: '6A', party: 'republican' },
  { name: 'Isaac Schultz', district: '6B', party: 'republican' },
  { name: 'Cal Bahr', district: '7A', party: 'republican' },
  { name: 'Lisa Demuth', district: '7B', party: 'republican' },
  { name: 'Jordan Rasmusson', district: '8A', party: 'republican' },
  { name: 'Krista Knudsen', district: '8B', party: 'republican' },
  { name: 'John Poston', district: '9A', party: 'republican' },
  { name: 'Jeff Backer', district: '9B', party: 'republican' },
  { name: 'Larry Kraft', district: '10A', party: 'democrat' },
  { name: 'Peter Calcaterra', district: '10B', party: 'democrat' },
  { name: 'Chris Swedzinski', district: '11A', party: 'republican' },
  { name: 'Paul Torkelson', district: '11B', party: 'republican' },
  { name: 'Liz Olson', district: '12A', party: 'democrat' },
  { name: 'Alicia Kozlowski', district: '12B', party: 'democrat' },
  { name: 'Tim O\'Driscoll', district: '13A', party: 'republican' },
  { name: 'Lisa Demuth', district: '13B', party: 'republican' },
  { name: 'Tina Liebling', district: '14A', party: 'democrat' },
  { name: 'Kim Hicks', district: '14B', party: 'democrat' },
  { name: 'Shane Mekeland', district: '15A', party: 'republican' },
  { name: 'Sondra Erickson', district: '15B', party: 'republican' },
  { name: 'Dean Urdahl', district: '16A', party: 'republican' },
  { name: 'Paul Anderson', district: '16B', party: 'republican' },
  { name: 'Tim Miller', district: '17A', party: 'republican' },
  { name: 'Bjorn Olson', district: '17B', party: 'republican' },
  { name: 'Jeff Brand', district: '18A', party: 'democrat' },
  { name: 'Luke Frederick', district: '18B', party: 'democrat' },
  { name: 'Brian Pfarr', district: '19A', party: 'republican' },
  { name: 'John Petersburg', district: '19B', party: 'republican' },
  { name: 'Peggy Bennett', district: '20A', party: 'republican' },
  { name: 'Patricia Mueller', district: '20B', party: 'republican' },
  { name: 'Marj Fogelman', district: '21A', party: 'republican' },
  { name: 'Joe Schomacker', district: '21B', party: 'republican' },
  { name: 'Bjorn Olson', district: '22A', party: 'republican' },
  { name: 'Jeremy Munson', district: '22B', party: 'republican' },
  { name: 'Bianca Virnig', district: '23A', party: 'democrat' },
  { name: 'Carlie Kotyza-Witthuhn', district: '23B', party: 'democrat' },
  { name: 'Jon Koznick', district: '24A', party: 'republican' },
  { name: 'Kaela Berg', district: '24B', party: 'democrat' },
  { name: 'Duane Quam', district: '25A', party: 'republican' },
  { name: 'Kim Hicks', district: '25B', party: 'democrat' },
  { name: 'Tina Liebling', district: '26A', party: 'democrat' },
  { name: 'Andy Smith', district: '26B', party: 'democrat' },
  { name: 'Nolan West', district: '27A', party: 'republican' },
  { name: 'Erik Mortensen', district: '27B', party: 'republican' },
  { name: 'Greg Davids', district: '28A', party: 'republican' },
  { name: 'Jeanne Poppe', district: '28B', party: 'democrat' },
  { name: 'Anne Neu Brindley', district: '29A', party: 'republican' },
  { name: 'Shelly Christensen', district: '29B', party: 'democrat' },
  { name: 'Paul Novotny', district: '30A', party: 'republican' },
  { name: 'Eric Lucero', district: '30B', party: 'republican' },
  { name: 'Kurt Daudt', district: '31A', party: 'republican' },
  { name: 'Calvin Warwas', district: '31B', party: 'republican' },
  { name: 'Brian Johnson', district: '32A', party: 'republican' },
  { name: 'Mary Franson', district: '32B', party: 'republican' },
  { name: 'Ami Wazlawik', district: '33A', party: 'democrat' },
  { name: 'Erin Koegel', district: '33B', party: 'democrat' },
  { name: 'Kristin Robbins', district: '34A', party: 'republican' },
  { name: 'Zack Stephenson', district: '34B', party: 'democrat' },
  { name: 'Cedrick Frazier', district: '35A', party: 'democrat' },
  { name: 'Cheryl Youakim', district: '35B', party: 'democrat' },
  { name: 'Melissa Hortman', district: '36A', party: 'democrat' },
  { name: 'Krista Knudsen', district: '36B', party: 'republican' },
  { name: 'Erin Koegel', district: '37A', party: 'democrat' },
  { name: 'Nels Pierson', district: '37B', party: 'republican' },
  { name: 'Heather Edelson', district: '38A', party: 'democrat' },
  { name: 'Cheryl Youakim', district: '38B', party: 'democrat' },
  { name: 'Samantha Sencer-Mura', district: '39A', party: 'democrat' },
  { name: 'Esther Agbaje', district: '39B', party: 'democrat' },
  { name: 'Mike Freiberg', district: '40A', party: 'democrat' },
  { name: 'Jamie Long', district: '40B', party: 'democrat' },
  { name: 'Athena Hollins', district: '41A', party: 'democrat' },
  { name: 'Jay Xiong', district: '41B', party: 'democrat' },
  { name: 'Hodan Hassan', district: '42A', party: 'democrat' },
  { name: 'Mohamud Noor', district: '42B', party: 'democrat' },
  { name: 'Peter Fischer', district: '43A', party: 'democrat' },
  { name: 'Leon Lillie', district: '43B', party: 'democrat' },
  { name: 'Dave Pinto', district: '44A', party: 'democrat' },
  { name: 'Kaohly Vang Her', district: '44B', party: 'democrat' },
  { name: 'Sydney Jordan', district: '45A', party: 'democrat' },
  { name: 'John Thompson', district: '45B', party: 'democrat' },
  { name: 'Emma Greenman', district: '46A', party: 'democrat' },
  { name: 'Aisha Gomez', district: '46B', party: 'democrat' },
  { name: 'Fue Lee', district: '47A', party: 'democrat' },
  { name: 'Carlos Mariani', district: '47B', party: 'democrat' },
  { name: 'Lucy Rehm', district: '48A', party: 'democrat' },
  { name: 'Patty Acomb', district: '48B', party: 'democrat' },
  { name: 'Steve Elkins', district: '49A', party: 'democrat' },
  { name: 'Dan Wolgamott', district: '49B', party: 'democrat' },
  { name: 'Matt Norris', district: '50A', party: 'democrat' },
  { name: 'Sandra Feist', district: '50B', party: 'democrat' },
  { name: 'Leigh Finke', district: '51A', party: 'democrat' },
  { name: 'John Huot', district: '51B', party: 'democrat' },
  { name: 'Jessica Hanson', district: '52A', party: 'democrat' },
  { name: 'Ruth Richardson', district: '52B', party: 'democrat' },
  { name: 'Brion Curran', district: '53A', party: 'democrat' },
  { name: 'Danny Nadeau', district: '53B', party: 'republican' },
  { name: 'Fue Lee', district: '54A', party: 'democrat' },
  { name: 'Samantha Sencer-Mura', district: '54B', party: 'democrat' },
  { name: 'Brad Tabke', district: '55A', party: 'democrat' },
  { name: 'Andrea Nelsen', district: '55B', party: 'democrat' },
  { name: 'Jessica Hanson', district: '56A', party: 'democrat' },
  { name: 'Jessica Elton', district: '56B', party: 'democrat' },
  { name: 'Robert Bierman', district: '57A', party: 'democrat' },
  { name: 'Liz Reyer', district: '57B', party: 'democrat' },
  { name: 'Huldah Jama', district: '58A', party: 'democrat' },
  { name: 'Mary Frances Clardy', district: '58B', party: 'democrat' },
  { name: 'Farhio Khalif', district: '59A', party: 'democrat' },
  { name: 'Heather Keeler', district: '59B', party: 'democrat' },
  { name: 'Ben Bakeberg', district: '60A', party: 'republican' },
  { name: 'Harry Niska', district: '60B', party: 'republican' },
  { name: 'Pam Altendorf', district: '61A', party: 'republican' },
  { name: 'Bobbie Harder', district: '61B', party: 'republican' },
  { name: 'Liz Reyer', district: '62A', party: 'democrat' },
  { name: 'Dan Kessler', district: '62B', party: 'democrat' },
  { name: 'Dawn Gillman', district: '63A', party: 'republican' },
  { name: 'Bill Masin', district: '63B', party: 'democrat' },
  { name: 'Michael Howard', district: '64A', party: 'democrat' },
  { name: 'Laurie Pryor', district: '64B', party: 'democrat' },
  { name: 'Nathan Coulter', district: '65A', party: 'democrat' },
  { name: 'Maria Isa Perez-Vega', district: '65B', party: 'democrat' },
  { name: 'Tina Liebling', district: '66A', party: 'democrat' },
  { name: 'Andy Smith', district: '66B', party: 'democrat' },
  { name: 'Kaela Berg', district: '67A', party: 'democrat' },
  { name: 'Ethan Cha', district: '67B', party: 'democrat' },
]

async function main() {
  console.log('Seeding Minnesota state legislators...')

  const allPols = []

  for (const s of MN_SENATORS) {
    allPols.push({
      name: s.name,
      slug: slugify(s.name),
      state: 'MN',
      chamber: 'state_senate',
      party: s.party,
      title: `State Senator, District ${s.district}`,
      bio: `Minnesota State Senator representing District ${s.district}. Member of the Minnesota Legislature.`,
      image_url: null,
    })
  }

  for (const r of MN_REPS) {
    allPols.push({
      name: r.name,
      slug: slugify(r.name),
      state: 'MN',
      chamber: 'state_house',
      party: r.party,
      title: `State Representative, District ${r.district}`,
      bio: `Minnesota State Representative serving District ${r.district}. Member of the Minnesota Legislature.`,
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

  console.log('Done seeding Minnesota legislature.')
}

main().catch(console.error)
