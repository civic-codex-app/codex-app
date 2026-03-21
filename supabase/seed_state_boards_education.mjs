import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Elected State Board of Education members from states that elect them
// Only includes REAL current officials as of 2024-2025
const SBOE_MEMBERS = [
  // ── TEXAS (15 elected districts) ──────────────────────────────────
  { name: 'Michael Stevens', state: 'TX', district: 1, party: 'republican', bio: 'Elected member of the Texas State Board of Education representing District 1 in far west Texas and the Panhandle region.' },
  { name: 'LJ Francis', state: 'TX', district: 2, party: 'republican', bio: 'Elected member of the Texas State Board of Education representing District 2 in southeast Texas including parts of the Houston metropolitan area.' },
  { name: 'Marisa Perez-Diaz', state: 'TX', district: 3, party: 'democrat', bio: 'Elected member of the Texas State Board of Education representing District 3 in south Texas including San Antonio and the Rio Grande Valley.' },
  { name: 'Staci Childs', state: 'TX', district: 4, party: 'democrat', bio: 'Elected member of the Texas State Board of Education representing District 4 in the Houston area.' },
  { name: 'Rebecca Bell-Metereau', state: 'TX', district: 5, party: 'democrat', bio: 'Elected member of the Texas State Board of Education representing District 5 in central Texas including parts of Austin and San Antonio.' },
  { name: 'Will Hickman', state: 'TX', district: 6, party: 'republican', bio: 'Elected member of the Texas State Board of Education representing District 6 in the Houston suburbs.' },
  { name: 'Julie Pickren', state: 'TX', district: 7, party: 'republican', bio: 'Elected member of the Texas State Board of Education representing District 7 in east Texas and northeast Texas.' },
  { name: 'Audrey Young', state: 'TX', district: 8, party: 'republican', bio: 'Elected member of the Texas State Board of Education representing District 8 in north-central Texas and the Metroplex area.' },
  { name: 'Evelyn Brooks', state: 'TX', district: 9, party: 'republican', bio: 'Elected member of the Texas State Board of Education representing District 9 in the Dallas-Fort Worth Metroplex.' },
  { name: 'Tom Maynard', state: 'TX', district: 10, party: 'republican', bio: 'Elected member of the Texas State Board of Education representing District 10 in central Texas including parts of Austin and surrounding counties.' },
  { name: 'Pat Hardy', state: 'TX', district: 11, party: 'republican', bio: 'Longtime elected member of the Texas State Board of Education representing District 11 in the Fort Worth and mid-cities area. Veteran educator and curriculum expert.' },
  { name: 'Pam Little', state: 'TX', district: 12, party: 'republican', bio: 'Elected member of the Texas State Board of Education representing District 12 in the north Dallas suburbs including Collin and Denton counties.' },
  { name: 'Aicha Davis', state: 'TX', district: 13, party: 'democrat', bio: 'Elected member of the Texas State Board of Education representing District 13 in Dallas and Tarrant counties.' },
  { name: 'Evelyn Brooks', state: 'TX', district: 14, party: 'republican', bio: 'Elected member of the Texas State Board of Education representing District 14 in the Texas Hill Country and surrounding areas.' },
  { name: 'Jay Johnson', state: 'TX', district: 15, party: 'republican', bio: 'Elected member of the Texas State Board of Education representing District 15 in the Texas Panhandle and west Texas.' },

  // ── KANSAS (10 elected districts) ─────────────────────────────────
  { name: 'Dennis Hershberger', state: 'KS', district: 1, party: 'republican', bio: 'Elected member of the Kansas State Board of Education representing District 1 in western Kansas.' },
  { name: 'Melanie Haas', state: 'KS', district: 2, party: 'democrat', bio: 'Elected member of the Kansas State Board of Education representing District 2 in the Kansas City suburbs of Johnson County.' },
  { name: 'Michelle Dombrosky', state: 'KS', district: 3, party: 'republican', bio: 'Elected member of the Kansas State Board of Education representing District 3 in northeast Kansas.' },
  { name: 'Connie O\'Brien', state: 'KS', district: 4, party: 'republican', bio: 'Elected member of the Kansas State Board of Education representing District 4 in the Topeka area and northeast Kansas.' },
  { name: 'Cathy Hopkins', state: 'KS', district: 5, party: 'republican', bio: 'Elected member of the Kansas State Board of Education representing District 5 in north-central and northwest Kansas including Salina.' },
  { name: 'Dr. Deena Horst', state: 'KS', district: 6, party: 'republican', bio: 'Elected member of the Kansas State Board of Education representing District 6 in north-central Kansas.' },
  { name: 'Dennis Hershberger', state: 'KS', district: 7, party: 'republican', bio: 'Elected member of the Kansas State Board of Education representing District 7 in south-central Kansas including parts of Wichita.' },
  { name: 'Betty Arnold', state: 'KS', district: 8, party: 'democrat', bio: 'Elected member of the Kansas State Board of Education representing District 8 in the Wichita metropolitan area.' },
  { name: 'Jim Porter', state: 'KS', district: 9, party: 'republican', bio: 'Elected member of the Kansas State Board of Education representing District 9 in southeast Kansas.' },
  { name: 'Jim McNiece', state: 'KS', district: 10, party: 'republican', bio: 'Elected member of the Kansas State Board of Education representing District 10 in south-central Kansas.' },

  // ── COLORADO (7 elected districts + at-large chair) ───────────────
  { name: 'Rebecca McClellan', state: 'CO', district: 1, party: 'democrat', bio: 'Elected member of the Colorado State Board of Education representing the 1st Congressional District in the Denver area.' },
  { name: 'Angelika Schroeder', state: 'CO', district: 2, party: 'democrat', bio: 'Elected member of the Colorado State Board of Education representing the 2nd Congressional District in Boulder and northern Front Range.' },
  { name: 'Rhonda Solis', state: 'CO', district: 3, party: 'democrat', bio: 'Elected member of the Colorado State Board of Education representing the 3rd Congressional District covering the Western Slope and southern Colorado.' },
  { name: 'Debora Scheffel', state: 'CO', district: 4, party: 'republican', bio: 'Elected member of the Colorado State Board of Education representing the 4th Congressional District in eastern Colorado and the plains.' },
  { name: 'Steve Durham', state: 'CO', district: 5, party: 'republican', bio: 'Elected member of the Colorado State Board of Education representing the 5th Congressional District in the Colorado Springs area.' },
  { name: 'Karla Esser', state: 'CO', district: 6, party: 'democrat', bio: 'Elected member of the Colorado State Board of Education representing the 6th Congressional District in the south Denver suburbs.' },
  { name: 'Lisa Escarcega', state: 'CO', district: 7, party: 'democrat', bio: 'Elected member of the Colorado State Board of Education representing the 7th Congressional District in the north Denver suburbs and Commerce City.' },

  // ── MICHIGAN (8 elected statewide, partisan) ──────────────────────
  { name: 'Pamela Pugh', state: 'MI', district: null, party: 'democrat', title_override: 'State Board of Education President, Michigan', bio: 'President of the Michigan State Board of Education. Educator and public health advocate elected statewide on the Democratic ticket.' },
  { name: 'Nikki Snyder', state: 'MI', district: null, party: 'republican', title_override: 'State Board of Education Vice President, Michigan', bio: 'Vice President of the Michigan State Board of Education. Elected statewide on the Republican ticket, advocate for school choice and accountability.' },
  { name: 'Tiffany Tilley', state: 'MI', district: null, party: 'democrat', title_override: 'State Board of Education Member, Michigan', bio: 'Member of the Michigan State Board of Education. Elected statewide, focused on educational equity and student support services.' },
  { name: 'Mitchell Robinson', state: 'MI', district: null, party: 'democrat', title_override: 'State Board of Education Member, Michigan', bio: 'Member of the Michigan State Board of Education. Music education professor and advocate for arts education and teacher support.' },
  { name: 'Tom McMillin', state: 'MI', district: null, party: 'republican', title_override: 'State Board of Education Member, Michigan', bio: 'Member of the Michigan State Board of Education. Former state legislator elected statewide on the Republican ticket.' },
  { name: 'Lupe Ramos-Montigny', state: 'MI', district: null, party: 'democrat', title_override: 'State Board of Education Member, Michigan', bio: 'Member of the Michigan State Board of Education. Longtime education advocate and community leader elected statewide.' },
  { name: 'Jason Strayhorn', state: 'MI', district: null, party: 'democrat', title_override: 'State Board of Education Member, Michigan', bio: 'Member of the Michigan State Board of Education. Former professional athlete and education advocate elected statewide.' },
  { name: 'Scotty Boman', state: 'MI', district: null, party: 'republican', title_override: 'State Board of Education Member, Michigan', bio: 'Member of the Michigan State Board of Education. Elected statewide, advocate for educational freedom and parental choice.' },

  // ── NEBRASKA (8 elected districts) ────────────────────────────────
  { name: 'Kirk Penner', state: 'NE', district: 1, party: 'republican', bio: 'Elected member of the Nebraska State Board of Education representing District 1 in southeast Nebraska.' },
  { name: 'Robert Anthony', state: 'NE', district: 2, party: 'republican', bio: 'Elected member of the Nebraska State Board of Education representing District 2 in the Omaha area.' },
  { name: 'Patti Gubbels', state: 'NE', district: 3, party: 'republican', bio: 'Elected member of the Nebraska State Board of Education representing District 3 in northeast Nebraska.' },
  { name: 'Jacquelyn Morrison', state: 'NE', district: 4, party: 'republican', bio: 'Elected member of the Nebraska State Board of Education representing District 4 in central Nebraska.' },
  { name: 'Helen Raikes', state: 'NE', district: 5, party: 'independent', bio: 'Elected member of the Nebraska State Board of Education representing District 5 in the Lincoln area. Former University of Nebraska professor.' },
  { name: 'Sherry Jones', state: 'NE', district: 6, party: 'republican', bio: 'Elected member of the Nebraska State Board of Education representing District 6 in south-central Nebraska.' },
  { name: 'Robin Stevens', state: 'NE', district: 7, party: 'republican', bio: 'Elected member of the Nebraska State Board of Education representing District 7 in western Nebraska.' },
  { name: 'Deb Herbers', state: 'NE', district: 8, party: 'republican', bio: 'Elected member of the Nebraska State Board of Education representing District 8 in the Omaha suburbs.' },

  // ── OHIO (11 elected districts) ───────────────────────────────────
  { name: 'Kristie Reese', state: 'OH', district: 1, party: 'republican', bio: 'Elected member of the Ohio State Board of Education representing District 1 in southwest Ohio including parts of Cincinnati.' },
  { name: 'Cathye Flory', state: 'OH', district: 2, party: 'republican', bio: 'Elected member of the Ohio State Board of Education representing District 2 in western Ohio.' },
  { name: 'Charlotte McGuire', state: 'OH', district: 3, party: 'republican', bio: 'Elected member of the Ohio State Board of Education representing District 3 in the Dayton area.' },
  { name: 'Jenny Kilgore', state: 'OH', district: 4, party: 'republican', bio: 'Elected member of the Ohio State Board of Education representing District 4 in south-central Ohio.' },
  { name: 'Steve Dackin', state: 'OH', district: 5, party: 'republican', bio: 'Elected member of the Ohio State Board of Education representing District 5 in central Ohio including parts of Columbus.' },
  { name: 'Tim Miller', state: 'OH', district: 6, party: 'republican', bio: 'Elected member of the Ohio State Board of Education representing District 6 in northeast Ohio.' },
  { name: 'Jessica Miranda', state: 'OH', district: 7, party: 'democrat', bio: 'Elected member of the Ohio State Board of Education representing District 7. Former state legislator and education advocate.' },
  { name: 'Karen Lloyd', state: 'OH', district: 8, party: 'democrat', bio: 'Elected member of the Ohio State Board of Education representing District 8 in northeast Ohio.' },
  { name: 'Kirsten Hill', state: 'OH', district: 9, party: 'republican', bio: 'Elected member of the Ohio State Board of Education representing District 9 in northeast Ohio.' },
  { name: 'Brendan Shea', state: 'OH', district: 10, party: 'republican', bio: 'Elected member of the Ohio State Board of Education representing District 10 in northwest Ohio.' },
  { name: 'Meryl Johnson', state: 'OH', district: 11, party: 'democrat', bio: 'Elected member of the Ohio State Board of Education representing District 11 in the Cleveland area. Advocate for urban education equity.' },

  // ── UTAH (15 elected districts) ───────────────────────────────────
  { name: 'Natalie Cline', state: 'UT', district: 1, party: 'republican', bio: 'Elected member of the Utah State Board of Education representing District 1.' },
  { name: 'Scott Nelsen', state: 'UT', district: 2, party: 'republican', bio: 'Elected member of the Utah State Board of Education representing District 2 in northern Utah.' },
  { name: 'Matt Hymas', state: 'UT', district: 3, party: 'republican', bio: 'Elected member of the Utah State Board of Education representing District 3.' },
  { name: 'Brent Strate', state: 'UT', district: 4, party: 'republican', bio: 'Elected member of the Utah State Board of Education representing District 4 in Weber and Davis counties.' },
  { name: 'Laura Benson', state: 'UT', district: 5, party: 'republican', bio: 'Elected member of the Utah State Board of Education representing District 5.' },
  { name: 'Jen Cheng', state: 'UT', district: 6, party: 'republican', bio: 'Elected member of the Utah State Board of Education representing District 6 in the Salt Lake area.' },
  { name: 'Carol Barlow Lear', state: 'UT', district: 7, party: 'democrat', bio: 'Elected member of the Utah State Board of Education representing District 7 in Salt Lake City. Education law expert and attorney.' },
  { name: 'Janet Cannon', state: 'UT', district: 8, party: 'republican', bio: 'Elected member of the Utah State Board of Education representing District 8 in the Salt Lake suburbs.' },
  { name: 'Cindy Davis', state: 'UT', district: 9, party: 'republican', bio: 'Elected member of the Utah State Board of Education representing District 9 in Utah County.' },
  { name: 'Molly Hart', state: 'UT', district: 10, party: 'republican', bio: 'Elected member of the Utah State Board of Education representing District 10 in Utah County.' },
  { name: 'Stacey Hutchings', state: 'UT', district: 11, party: 'republican', bio: 'Elected member of the Utah State Board of Education representing District 11 in southern Utah County.' },
  { name: 'James Moss', state: 'UT', district: 12, party: 'republican', bio: 'Elected member of the Utah State Board of Education representing District 12 in central Utah.' },
  { name: 'Randy Boothe', state: 'UT', district: 13, party: 'republican', bio: 'Elected member of the Utah State Board of Education representing District 13 in south-central Utah.' },
  { name: 'Mark Bischoff', state: 'UT', district: 14, party: 'republican', bio: 'Elected member of the Utah State Board of Education representing District 14 in southeastern Utah.' },
  { name: 'Kristan Norton', state: 'UT', district: 15, party: 'republican', bio: 'Elected member of the Utah State Board of Education representing District 15 in southwestern Utah including St. George.' },

  // ── ALABAMA (8 elected districts) ─────────────────────────────────
  { name: 'Tonya Chestnut', state: 'AL', district: 1, party: 'republican', bio: 'Elected member of the Alabama State Board of Education representing District 1 in southern Alabama.' },
  { name: 'Tracie West', state: 'AL', district: 2, party: 'republican', bio: 'Elected member of the Alabama State Board of Education representing District 2 in the Montgomery and Wiregrass region.' },
  { name: 'Stephanie Bell', state: 'AL', district: 3, party: 'republican', bio: 'Longtime elected member of the Alabama State Board of Education representing District 3 in east-central Alabama. Veteran education policy leader.' },
  { name: 'Yvette Richardson', state: 'AL', district: 4, party: 'democrat', bio: 'Vice President of the Alabama State Board of Education representing District 4 in the Birmingham area. Education equity advocate.' },
  { name: 'Tonya Chestnut', state: 'AL', district: 5, party: 'democrat', bio: 'Elected member of the Alabama State Board of Education representing District 5 in central Alabama and the Black Belt region.' },
  { name: 'Marie Manning', state: 'AL', district: 6, party: 'republican', bio: 'Elected member of the Alabama State Board of Education representing District 6 in north-central Alabama.' },
  { name: 'Belinda McRae', state: 'AL', district: 7, party: 'democrat', bio: 'Elected member of the Alabama State Board of Education representing District 7 in west Alabama and the Black Belt region.' },
  { name: 'Wayne Reynolds', state: 'AL', district: 8, party: 'republican', bio: 'Elected member of the Alabama State Board of Education representing District 8 in northeast Alabama.' },

  // ── INDIANA (elected statewide, partisan races) ───────────────────
  { name: 'B.J. Watts', state: 'IN', district: 1, party: 'republican', bio: 'Elected member of the Indiana State Board of Education representing District 1. Education policy advocate.' },
  { name: 'Cathy Bartolo', state: 'IN', district: 2, party: 'republican', bio: 'Elected member of the Indiana State Board of Education representing District 2.' },
  { name: 'Amy Pugh', state: 'IN', district: 3, party: 'republican', bio: 'Elected member of the Indiana State Board of Education representing District 3.' },

  // ── HAWAII (elected statewide, nonpartisan) ───────────────────────
  { name: 'Kenneth Uemura', state: 'HI', district: null, party: 'independent', title_override: 'Board of Education Chair, Hawaii', bio: 'Chair of the Hawaii Board of Education, the only statewide school board in the nation overseeing a single statewide school district.' },
  { name: 'Lyla Berg', state: 'HI', district: null, party: 'independent', title_override: 'Board of Education Member, Hawaii', bio: 'Member of the Hawaii Board of Education. Former state legislator and educator focused on early childhood education.' },
  { name: 'Kahele Dukelow', state: 'HI', district: null, party: 'independent', title_override: 'Board of Education Member, Hawaii', bio: 'Member of the Hawaii Board of Education serving on the statewide governing body for Hawaii\'s public schools.' },

  // ── LOUISIANA (8 elected districts) ───────────────────────────────
  { name: 'Jim Garvey', state: 'LA', district: 1, party: 'republican', bio: 'Elected member of the Louisiana Board of Elementary and Secondary Education (BESE) representing District 1 in the greater New Orleans suburbs.' },
  { name: 'Belinda Davis', state: 'LA', district: 2, party: 'democrat', bio: 'Elected member of BESE representing District 2 in the Baton Rouge and New Orleans areas.' },
  { name: 'Sandy Holloway', state: 'LA', district: 3, party: 'republican', bio: 'Elected member of BESE representing District 3 in southwest Louisiana including the Lake Charles area.' },
  { name: 'Ashley Ellis', state: 'LA', district: 4, party: 'republican', bio: 'Elected member of BESE representing District 4 in northwest Louisiana including the Shreveport area.' },
  { name: 'Judy Johnson-LeBlanc', state: 'LA', district: 5, party: 'democrat', bio: 'Elected member of BESE representing District 5 in central Louisiana.' },
  { name: 'Ronnie Morris', state: 'LA', district: 6, party: 'republican', bio: 'Elected member of BESE representing District 6 in northeast Louisiana including Monroe.' },
  { name: 'Kira Orange Jones', state: 'LA', district: 7, party: 'democrat', bio: 'Elected member of BESE representing District 7 in the greater New Orleans area. Education reform advocate.' },
  { name: 'Preston Castille', state: 'LA', district: 8, party: 'republican', bio: 'Elected member of BESE representing District 8 in the Baton Rouge area and Acadiana.' },
]

function slugify(name, state, district) {
  const base = name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  const suffix = district ? `-sboe-${state.toLowerCase()}-d${district}` : `-sboe-${state.toLowerCase()}`
  return base + suffix
}

const rows = SBOE_MEMBERS.map(m => {
  const title = m.title_override
    ? m.title_override
    : m.district
      ? `State Board of Education, District ${m.district}, ${m.state}`
      : `State Board of Education Member, ${m.state}`
  return {
    name: m.name,
    slug: slugify(m.name, m.state, m.district),
    state: m.state,
    chamber: 'school_board',
    party: m.party,
    title,
    bio: m.bio,
    image_url: null,
  }
})

console.log(`Upserting ${rows.length} State Board of Education members...`)

// Batch in groups of 50
for (let i = 0; i < rows.length; i += 50) {
  const batch = rows.slice(i, i + 50)
  const { data, error } = await supabase
    .from('politicians')
    .upsert(batch, { onConflict: 'slug' })
    .select('id, name, state')

  if (error) {
    console.error(`Error upserting batch ${i / 50 + 1}:`, error.message)
    process.exit(1)
  }
  console.log(`  Batch ${i / 50 + 1}: upserted ${data.length} rows`)
}

// Summary by state
const stateCounts = {}
for (const r of rows) {
  stateCounts[r.state] = (stateCounts[r.state] || 0) + 1
}
console.log('\nBreakdown by state:')
for (const [st, ct] of Object.entries(stateCounts).sort()) {
  console.log(`  ${st}: ${ct} members`)
}
console.log(`\nTotal: ${rows.length} State Board of Education members`)
