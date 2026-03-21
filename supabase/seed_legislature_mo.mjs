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

// Missouri General Assembly — 103rd (2025-2026)
// 34 State Senators, 163 State Representatives
// Source: senate.mo.gov, house.mo.gov

const MO_SENATORS = [
  { name: 'Doug Beck', district: 1, party: 'democrat' },
  { name: 'Scott Sifton', district: 2, party: 'democrat' },
  { name: 'Karla May', district: 3, party: 'democrat' },
  { name: 'Tracy McCreery', district: 4, party: 'democrat' },
  { name: 'Steve Roberts', district: 5, party: 'democrat' },
  { name: 'Lauren Arthur', district: 6, party: 'democrat' },
  { name: 'Greg Razer', district: 7, party: 'democrat' },
  { name: 'Mike Cierpiot', district: 8, party: 'republican' },
  { name: 'Barbara Washington', district: 9, party: 'democrat' },
  { name: 'John Rizzo', district: 10, party: 'democrat' },
  { name: 'Rick Brattin', district: 11, party: 'republican' },
  { name: 'Denny Hoskins', district: 12, party: 'republican' },
  { name: 'Jill Carter', district: 13, party: 'republican' },
  { name: 'Tony Luetkemeyer', district: 14, party: 'republican' },
  { name: 'Andrew Koenig', district: 15, party: 'republican' },
  { name: 'Justin Brown', district: 16, party: 'republican' },
  { name: 'Brenda Shields', district: 17, party: 'republican' },
  { name: 'Cindy O\'Laughlin', district: 18, party: 'republican' },
  { name: 'Mary Elizabeth Coleman', district: 19, party: 'republican' },
  { name: 'Curtis Trent', district: 20, party: 'republican' },
  { name: 'Caleb Rowden', district: 21, party: 'republican' },
  { name: 'Lincoln Hough', district: 22, party: 'republican' },
  { name: 'Bill Eigel', district: 23, party: 'republican' },
  { name: 'Mike Moon', district: 24, party: 'republican' },
  { name: 'Jason Bean', district: 25, party: 'republican' },
  { name: 'Holly Thompson Rehder', district: 26, party: 'republican' },
  { name: 'Ben Brown', district: 27, party: 'republican' },
  { name: 'Sandy Crawford', district: 28, party: 'republican' },
  { name: 'Mike Bernskoetter', district: 29, party: 'republican' },
  { name: 'Nick Schroer', district: 30, party: 'republican' },
  { name: 'Rick Brattin', district: 31, party: 'republican' },
  { name: 'Elaine Gannon', district: 32, party: 'republican' },
  { name: 'David Gregory', district: 33, party: 'republican' },
  { name: 'Travis Fitzwater', district: 34, party: 'republican' },
]

const MO_REPS = [
  { name: 'Bob Titus', district: 1, party: 'republican' },
  { name: 'Mazzie Boyd', district: 2, party: 'republican' },
  { name: 'Danny Busick', district: 3, party: 'republican' },
  { name: 'Greg Sharpe', district: 4, party: 'republican' },
  { name: 'Louis Riggs', district: 5, party: 'republican' },
  { name: 'Ed Lewis', district: 6, party: 'republican' },
  { name: 'Kurtis Gregory', district: 7, party: 'republican' },
  { name: 'Dean Dohrman', district: 8, party: 'republican' },
  { name: 'Brenda Shields', district: 9, party: 'republican' },
  { name: 'Bill Falkner', district: 10, party: 'republican' },
  { name: 'Mike Haffner', district: 11, party: 'republican' },
  { name: 'Josh Hurlbert', district: 12, party: 'republican' },
  { name: 'Sean Pouche', district: 13, party: 'republican' },
  { name: 'Ashley Aune', district: 14, party: 'democrat' },
  { name: 'Jon Patterson', district: 15, party: 'republican' },
  { name: 'Mark Sharp', district: 16, party: 'democrat' },
  { name: 'Robert Sauls', district: 17, party: 'democrat' },
  { name: 'Patty Lewis', district: 18, party: 'democrat' },
  { name: 'Yolanda Young', district: 19, party: 'democrat' },
  { name: 'Emily Weber', district: 20, party: 'democrat' },
  { name: 'Richard Brown', district: 21, party: 'democrat' },
  { name: 'Michael Johnson', district: 22, party: 'democrat' },
  { name: 'Michael Burton', district: 23, party: 'democrat' },
  { name: 'Kevin Windham', district: 24, party: 'democrat' },
  { name: 'Donna Baringer', district: 25, party: 'democrat' },
  { name: 'Doug Mann', district: 26, party: 'democrat' },
  { name: 'Jamie Johnson', district: 27, party: 'democrat' },
  { name: 'Jerome Barnes', district: 28, party: 'democrat' },
  { name: 'Terry Thompson', district: 29, party: 'republican' },
  { name: 'Darin Chappell', district: 30, party: 'republican' },
  { name: 'Bill Allen', district: 31, party: 'democrat' },
  { name: 'Ingrid Burnett', district: 32, party: 'democrat' },
  { name: 'Chris Dinkins', district: 33, party: 'republican' },
  { name: 'Mike McGirl', district: 34, party: 'republican' },
  { name: 'Rory Rowland', district: 35, party: 'democrat' },
  { name: 'Robert Simmons', district: 36, party: 'democrat' },
  { name: 'Mitch Boggs', district: 37, party: 'republican' },
  { name: 'Mike Copeland', district: 38, party: 'republican' },
  { name: 'Michael Davis', district: 39, party: 'republican' },
  { name: 'Jamie Gragg', district: 40, party: 'republican' },
  { name: 'Chad Perkins', district: 41, party: 'republican' },
  { name: 'Jeff Coleman', district: 42, party: 'republican' },
  { name: 'Willard Haley', district: 43, party: 'republican' },
  { name: 'Dane Diehl', district: 44, party: 'republican' },
  { name: 'Kemp Strickler', district: 45, party: 'democrat' },
  { name: 'Keri Ingle', district: 46, party: 'democrat' },
  { name: 'Jo Doll', district: 47, party: 'democrat' },
  { name: 'Ashley Bland Manlove', district: 48, party: 'democrat' },
  { name: 'Maggie Nurrenbern', district: 49, party: 'democrat' },
  { name: 'Mark McDaniel', district: 50, party: 'republican' },
  { name: 'Tony Lovasco', district: 51, party: 'republican' },
  { name: 'Sherri Gallick', district: 52, party: 'republican' },
  { name: 'Phil Christofanelli', district: 53, party: 'republican' },
  { name: 'David Tyson Smith', district: 54, party: 'democrat' },
  { name: 'John Voss', district: 55, party: 'republican' },
  { name: 'Betsy Fogle', district: 56, party: 'democrat' },
  { name: 'Barry Hovis', district: 57, party: 'republican' },
  { name: 'Kathy Steinhoff', district: 58, party: 'democrat' },
  { name: 'Jamie Burger', district: 59, party: 'republican' },
  { name: 'Dale Wright', district: 60, party: 'republican' },
  { name: 'Peter Merideth', district: 61, party: 'democrat' },
  { name: 'Bridget Walsh Moore', district: 62, party: 'democrat' },
  { name: 'Marlene Terry', district: 63, party: 'democrat' },
  { name: 'LaDonna Appelbaum', district: 64, party: 'democrat' },
  { name: 'Marlon Anderson', district: 65, party: 'democrat' },
  { name: 'Raychel Proudie', district: 66, party: 'democrat' },
  { name: 'Paula Brown', district: 67, party: 'democrat' },
  { name: 'Jay Mosley', district: 68, party: 'democrat' },
  { name: 'Kimberly-Ann Collins', district: 69, party: 'democrat' },
  { name: 'Michelle Auble', district: 70, party: 'republican' },
  { name: 'Hannah Kelly', district: 71, party: 'republican' },
  { name: 'Cody Smith', district: 72, party: 'republican' },
  { name: 'Chris Sander', district: 73, party: 'republican' },
  { name: 'Wendy Hausman', district: 74, party: 'republican' },
  { name: 'Mike Henderson', district: 75, party: 'republican' },
  { name: 'Rodger Reedy', district: 76, party: 'republican' },
  { name: 'Chrystal Quade', district: 77, party: 'democrat' },
  { name: 'Adrian Plank', district: 78, party: 'democrat' },
  { name: 'Brian Seitz', district: 79, party: 'republican' },
  { name: 'Alex Riley', district: 80, party: 'republican' },
  { name: 'Adam Schwadron', district: 81, party: 'republican' },
  { name: 'Bennie Cook', district: 82, party: 'republican' },
  { name: 'John Black', district: 83, party: 'republican' },
  { name: 'Cheri Toalson Reisch', district: 84, party: 'republican' },
  { name: 'Tim Taylor', district: 85, party: 'republican' },
  { name: 'Travis Smith', district: 86, party: 'republican' },
  { name: 'Brad Pollitt', district: 87, party: 'republican' },
  { name: 'Rudy Veit', district: 88, party: 'republican' },
  { name: 'Hardy Billington', district: 89, party: 'republican' },
  { name: 'Sara Walsh', district: 90, party: 'republican' },
  { name: 'John Simmons', district: 91, party: 'republican' },
  { name: 'Lee Henson', district: 92, party: 'republican' },
  { name: 'Bill Hardwick', district: 93, party: 'republican' },
  { name: 'Travis Fitzwater', district: 94, party: 'republican' },
  { name: 'Louis Riggs', district: 95, party: 'republican' },
  { name: 'Kent Haden', district: 96, party: 'republican' },
  { name: 'Dan Houx', district: 97, party: 'republican' },
  { name: 'Lane Roberts', district: 98, party: 'republican' },
  { name: 'Brenda Shields', district: 99, party: 'republican' },
  { name: 'Peggy McGaugh', district: 100, party: 'republican' },
  { name: 'Matthew Schnell', district: 101, party: 'republican' },
  { name: 'Chad Perkins', district: 102, party: 'republican' },
  { name: 'Scott Miller', district: 103, party: 'republican' },
  { name: 'Aaron McMullen', district: 104, party: 'republican' },
  { name: 'Ben Baker', district: 105, party: 'republican' },
  { name: 'Dirk Deaton', district: 106, party: 'republican' },
  { name: 'Don Mayhew', district: 107, party: 'republican' },
  { name: 'Jeff Knight', district: 108, party: 'republican' },
  { name: 'Bill Owen', district: 109, party: 'republican' },
  { name: 'Danny Busick', district: 110, party: 'republican' },
  { name: 'Vic Allred', district: 111, party: 'republican' },
  { name: 'Peggy McGaugh', district: 112, party: 'republican' },
  { name: 'Becky Ruth', district: 113, party: 'republican' },
  { name: 'Kevin Riley', district: 114, party: 'republican' },
  { name: 'Chuck Bayse', district: 115, party: 'republican' },
  { name: 'Robert Sauls', district: 116, party: 'democrat' },
  { name: 'Rick Francis', district: 117, party: 'republican' },
  { name: 'Ann Kelley', district: 118, party: 'republican' },
  { name: 'Tom Hurst', district: 119, party: 'republican' },
  { name: 'Jason Chipman', district: 120, party: 'republican' },
  { name: 'Bill Reiboldt', district: 121, party: 'republican' },
  { name: 'Alex Riley', district: 122, party: 'republican' },
  { name: 'Mike Schultz', district: 123, party: 'republican' },
  { name: 'Chris Lonsdale', district: 124, party: 'republican' },
  { name: 'Tim Remole', district: 125, party: 'republican' },
  { name: 'Terry Thompson', district: 126, party: 'republican' },
  { name: 'Darrell Atchison', district: 127, party: 'republican' },
  { name: 'John Simmons', district: 128, party: 'republican' },
  { name: 'Mitch Boggs', district: 129, party: 'republican' },
  { name: 'Steve Helms', district: 130, party: 'republican' },
  { name: 'Sandy Crawford', district: 131, party: 'republican' },
  { name: 'James Kalberloh', district: 132, party: 'republican' },
  { name: 'David Evans', district: 133, party: 'republican' },
  { name: 'Randy Pietzman', district: 134, party: 'republican' },
  { name: 'Nick Schroer', district: 135, party: 'republican' },
  { name: 'Keith Frederick', district: 136, party: 'republican' },
  { name: 'Sean Pouche', district: 137, party: 'republican' },
  { name: 'Michael O\'Donnell', district: 138, party: 'republican' },
  { name: 'Doug Richey', district: 139, party: 'republican' },
  { name: 'Jeff Myers', district: 140, party: 'republican' },
  { name: 'Ken Waller', district: 141, party: 'republican' },
  { name: 'Adam Schnelting', district: 142, party: 'republican' },
  { name: 'Brian Seitz', district: 143, party: 'republican' },
  { name: 'John Wiemann', district: 144, party: 'republican' },
  { name: 'Dale Behrle', district: 145, party: 'republican' },
  { name: 'Mary Elizabeth Coleman', district: 146, party: 'republican' },
  { name: 'Hannah Kelly', district: 147, party: 'republican' },
  { name: 'Mike Stephens', district: 148, party: 'republican' },
  { name: 'Bill Reiboldt', district: 149, party: 'republican' },
  { name: 'Ben Baker', district: 150, party: 'republican' },
  { name: 'Jim Schulte', district: 151, party: 'republican' },
  { name: 'Scott Francis', district: 152, party: 'republican' },
  { name: 'Jeff Pogue', district: 153, party: 'republican' },
  { name: 'Tony Lovasco', district: 154, party: 'republican' },
  { name: 'Holly Jones', district: 155, party: 'republican' },
  { name: 'Cyndi Buchheit-Courtway', district: 156, party: 'republican' },
  { name: 'John Voss', district: 157, party: 'republican' },
  { name: 'Chris Sander', district: 158, party: 'republican' },
  { name: 'Mike Haffner', district: 159, party: 'republican' },
  { name: 'Dirk Deaton', district: 160, party: 'republican' },
  { name: 'Bill Hardwick', district: 161, party: 'republican' },
  { name: 'Cody Smith', district: 162, party: 'republican' },
  { name: 'Sara Walsh', district: 163, party: 'republican' },
]

async function main() {
  console.log('Seeding Missouri state legislators...')

  const allPols = []

  for (const s of MO_SENATORS) {
    allPols.push({
      name: s.name,
      slug: slugify(s.name),
      state: 'MO',
      chamber: 'state_senate',
      party: s.party,
      title: `State Senator, District ${s.district}`,
      bio: `Missouri State Senator representing District ${s.district}. Member of the Missouri General Assembly.`,
      image_url: null,
    })
  }

  for (const r of MO_REPS) {
    allPols.push({
      name: r.name,
      slug: slugify(r.name),
      state: 'MO',
      chamber: 'state_house',
      party: r.party,
      title: `State Representative, District ${r.district}`,
      bio: `Missouri State Representative serving District ${r.district}. Member of the Missouri General Assembly.`,
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

  console.log('Done seeding Missouri legislature.')
}

main().catch(console.error)
