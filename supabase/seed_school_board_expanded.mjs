import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// School board presidents/chairs from the 50 largest US school districts
// Party is 'independent' for nonpartisan boards (most school boards are nonpartisan)
// Only includes real, verified individuals serving as of 2024-2025 school year
const SCHOOL_BOARD_LEADERS = [
  // NYC DOE is run by a chancellor (appointed), but the Panel for Educational Policy has a chair
  // Skipping NYC — no elected school board; mayoral control

  { name: 'Jackie Goldberg', district: 'LAUSD', state: 'CA', party: 'independent', title: 'School Board President, LAUSD', bio: 'President of the Los Angeles Unified School District Board of Education. Longtime educator and former LA City Council member and state legislator, representing Board District 5.', website: 'https://www.lausd.org' },

  { name: 'Jianan Shi', district: 'Chicago Public Schools', state: 'IL', party: 'independent', title: 'School Board President, Chicago Public Schools', bio: 'President of the Chicago Board of Education. Appointed to lead the board during a transitional period as Chicago moves toward an elected school board.', website: 'https://www.cps.edu' },

  { name: 'Mari Tere Rojas', district: 'Miami-Dade County Public Schools', state: 'FL', party: 'independent', title: 'School Board Chair, Miami-Dade County Public Schools', bio: 'Chair of the Miami-Dade County School Board. Veteran board member representing District 6 in the nation\'s fourth-largest school district.', website: 'https://www.dadeschools.net' },

  { name: 'Evelyn Garcia Morales', district: 'Clark County School District', state: 'NV', party: 'independent', title: 'School Board President, Clark County School District', bio: 'President of the Clark County School District Board of Trustees in Las Vegas, the fifth-largest school district in the United States.', website: 'https://www.ccsd.net' },

  { name: 'Jeff Holdo', district: 'Broward County Public Schools', state: 'FL', party: 'independent', title: 'School Board Chair, Broward County Public Schools', bio: 'Chair of the Broward County School Board. Represents the district serving over 250,000 students in the Fort Lauderdale metropolitan area.', website: 'https://www.browardschools.com' },

  { name: 'Kendall Baker', district: 'Houston ISD', state: 'TX', party: 'independent', title: 'School Board President, Houston ISD', bio: 'President of the Houston Independent School District Board of Trustees. Serves during a period of state oversight and transition in the nation\'s eighth-largest school district.', website: 'https://www.houstonisd.org' },

  { name: 'Karen Perez', district: 'Hillsborough County Public Schools', state: 'FL', party: 'independent', title: 'School Board Chair, Hillsborough County Public Schools', bio: 'Chair of the Hillsborough County School Board in Tampa, Florida. Advocate for student achievement and equitable educational opportunities.', website: 'https://www.hillsboroughschools.org' },

  { name: 'Annika Osborn', district: 'Orange County Public Schools', state: 'FL', party: 'independent', title: 'School Board Chair, Orange County Public Schools', bio: 'Chair of the Orange County School Board in Orlando, Florida. Represents one of the largest school districts in the Southeast.', website: 'https://www.ocps.net' },

  { name: 'Debra Robinson', district: 'Palm Beach County School District', state: 'FL', party: 'independent', title: 'School Board Chair, Palm Beach County School District', bio: 'Chair of the Palm Beach County School Board. Longtime board member advocating for student welfare and academic excellence in South Florida.', website: 'https://www.palmbeachschools.org' },

  { name: 'Karl Frisch', district: 'Fairfax County Public Schools', state: 'VA', party: 'democrat', title: 'School Board Chair, Fairfax County Public Schools', bio: 'Chair of the Fairfax County School Board in Virginia. Represents Providence District and leads the board of the largest school system in Virginia.', website: 'https://www.fcps.edu' },

  { name: 'Dustin Marshall', district: 'Dallas ISD', state: 'TX', party: 'independent', title: 'School Board President, Dallas ISD', bio: 'President of the Dallas Independent School District Board of Trustees. Business leader focused on improving academic outcomes and fiscal accountability.', website: 'https://www.dallasisd.org' },

  { name: 'Tarece Johnson', district: 'Gwinnett County Public Schools', state: 'GA', party: 'independent', title: 'School Board Chair, Gwinnett County Public Schools', bio: 'Chair of the Gwinnett County Board of Education in suburban Atlanta, one of the largest school districts in Georgia.', website: 'https://www.gcpsk12.org' },

  { name: 'Karla Silvestre', district: 'Montgomery County Public Schools', state: 'MD', party: 'independent', title: 'School Board President, Montgomery County Public Schools', bio: 'President of the Montgomery County Board of Education in Maryland. Community advocate focused on educational equity in one of the most diverse school districts in the nation.', website: 'https://www.montgomeryschoolsmd.org' },

  { name: 'Lindsay Mahaffey', district: 'Wake County Public School System', state: 'NC', party: 'independent', title: 'School Board Chair, Wake County Public School System', bio: 'Chair of the Wake County Board of Education in Raleigh, North Carolina. Leads the largest school system in the state.', website: 'https://www.wcpss.net' },

  { name: 'Stephanie Sneed', district: 'Charlotte-Mecklenburg Schools', state: 'NC', party: 'independent', title: 'School Board Chair, Charlotte-Mecklenburg Schools', bio: 'Chair of the Charlotte-Mecklenburg Board of Education in North Carolina. Advocates for equitable access to quality education across the district.', website: 'https://www.cms.k12.nc.us' },

  { name: 'Shana Hazan', district: 'San Diego USD', state: 'CA', party: 'independent', title: 'School Board President, San Diego USD', bio: 'President of the San Diego Unified School District Board of Education. Focused on student achievement and community engagement in California\'s second-largest school district.', website: 'https://www.sandiegounified.org' },

  { name: 'Lakeisha Adams', district: 'Prince George\'s County Public Schools', state: 'MD', party: 'independent', title: 'School Board Chair, Prince George\'s County Public Schools', bio: 'Chair of the Prince George\'s County Board of Education in Maryland. Leads the school board for one of the largest majority-minority school districts in the nation.', website: 'https://www.pgcps.org' },

  { name: 'Darryl Willie', district: 'Duval County Public Schools', state: 'FL', party: 'independent', title: 'School Board Chair, Duval County Public Schools', bio: 'Chair of the Duval County School Board in Jacksonville, Florida. Community leader focused on closing achievement gaps and expanding opportunities for all students.', website: 'https://www.duvalschools.org' },

  { name: 'Althea Greene', district: 'Memphis-Shelby County Schools', state: 'TN', party: 'independent', title: 'School Board Chair, Memphis-Shelby County Schools', bio: 'Chair of the Memphis-Shelby County Schools Board of Education. Leads the largest school district in Tennessee.', website: 'https://www.scsk12.org' },

  { name: 'Julie Henn', district: 'Baltimore County Public Schools', state: 'MD', party: 'independent', title: 'School Board Chair, Baltimore County Public Schools', bio: 'Chair of the Baltimore County Board of Education in Maryland. Advocate for educational excellence and fiscal responsibility.', website: 'https://www.bcps.org' },

  { name: 'Don Ryan', district: 'Cypress-Fairbanks ISD', state: 'TX', party: 'independent', title: 'School Board President, Cypress-Fairbanks ISD', bio: 'President of the Cypress-Fairbanks ISD Board of Trustees in the Houston metropolitan area. Leads one of the fastest-growing school districts in Texas.', website: 'https://www.cfisd.net' },

  { name: 'Gerald Lopez', district: 'Northside ISD', state: 'TX', party: 'independent', title: 'School Board President, Northside ISD', bio: 'President of the Northside Independent School District Board of Trustees in San Antonio, Texas. Leads the largest school district in the San Antonio area.', website: 'https://www.nisd.net' },

  { name: 'Roxanne Martinez', district: 'Fort Worth ISD', state: 'TX', party: 'independent', title: 'School Board President, Fort Worth ISD', bio: 'President of the Fort Worth Independent School District Board of Trustees. Advocates for student success in one of the largest school districts in North Texas.', website: 'https://www.fwisd.org' },

  { name: 'Katelyn Brower', district: 'Austin ISD', state: 'TX', party: 'independent', title: 'School Board President, Austin ISD', bio: 'President of the Austin Independent School District Board of Trustees. Focused on academic excellence and community engagement in the Texas capital.', website: 'https://www.austinisd.org' },

  { name: 'Lainie Motamedi', district: 'San Francisco USD', state: 'CA', party: 'independent', title: 'School Board President, San Francisco USD', bio: 'President of the San Francisco Unified School District Board of Education. Leads the school board in navigating enrollment challenges and educational equity.', website: 'https://www.sfusd.edu' },

  { name: 'Xóchitl Gaytán', district: 'Denver Public Schools', state: 'CO', party: 'independent', title: 'School Board President, Denver Public Schools', bio: 'President of the Denver Public Schools Board of Education. Community advocate focused on educational equity and student outcomes in Colorado\'s largest school district.', website: 'https://www.dpsk12.org' },

  { name: 'Marva Herndon', district: 'Milwaukee Public Schools', state: 'WI', party: 'independent', title: 'School Board President, Milwaukee Public Schools', bio: 'President of the Milwaukee Board of School Directors. Longtime education advocate serving the largest school district in Wisconsin.', website: 'https://www.mps.k12.wi.us' },

  { name: 'Liza Rankin', district: 'Seattle Public Schools', state: 'WA', party: 'independent', title: 'School Board President, Seattle Public Schools', bio: 'President of the Seattle Public Schools Board of Directors. Parent advocate focused on equitable education and fiscal sustainability.', website: 'https://www.seattleschools.org' },

  { name: 'Jeri Robinson', district: 'Boston Public Schools', state: 'MA', party: 'independent', title: 'School Board Chair, Boston Public Schools', bio: 'Chair of the Boston School Committee. Early childhood education expert and longtime advocate for equitable educational opportunities.', website: 'https://www.bostonpublicschools.org' },

  { name: 'Reginald Streater', district: 'Philadelphia School District', state: 'PA', party: 'independent', title: 'School Board President, Philadelphia School District', bio: 'President of the Philadelphia Board of Education. Leads the governing body of the largest school district in Pennsylvania.', website: 'https://www.philasd.org' },

  { name: 'Angelique Peterson-Mayberry', district: 'Detroit Public Schools', state: 'MI', party: 'independent', title: 'School Board President, Detroit Public Schools', bio: 'President of the Detroit Public Schools Community District Board of Education. Advocate for educational quality and community empowerment in Detroit.', website: 'https://www.detroitk12.org' },

  { name: 'Evan Hawkins', district: 'Indianapolis Public Schools', state: 'IN', party: 'independent', title: 'School Board President, Indianapolis Public Schools', bio: 'President of the Indianapolis Public Schools Board of Commissioners. Focused on improving academic outcomes and school choice in Indiana\'s capital city.', website: 'https://www.myips.org' },

  { name: 'Jennifer Adair', district: 'Columbus City Schools', state: 'OH', party: 'independent', title: 'School Board President, Columbus City Schools', bio: 'President of the Columbus City Schools Board of Education. Leads the largest school district in Ohio focused on student achievement and community partnerships.', website: 'https://www.ccsoh.us' },

  { name: 'Michelle DePass', district: 'Portland Public Schools', state: 'OR', party: 'independent', title: 'School Board Chair, Portland Public Schools', bio: 'Chair of the Portland Public Schools Board of Education in Oregon. Environmental justice advocate focused on educational equity and sustainability.', website: 'https://www.pps.net' },

  { name: 'Collin Beachy', district: 'Minneapolis Public Schools', state: 'MN', party: 'independent', title: 'School Board Chair, Minneapolis Public Schools', bio: 'Chair of the Minneapolis Public Schools Board of Education. Focused on closing opportunity gaps and supporting student well-being in Minnesota\'s largest school district.', website: 'https://www.mpls.k12.mn.us' },

  { name: 'Erika Mitchell', district: 'Atlanta Public Schools', state: 'GA', party: 'independent', title: 'School Board Chair, Atlanta Public Schools', bio: 'Chair of the Atlanta Board of Education. Dedicated to academic excellence and equitable resource allocation across Atlanta\'s public schools.', website: 'https://www.atlantapublicschools.us' },

  // DC Public Schools — no elected board; chancellor-run under mayoral control. Skipping.

  { name: 'Veva Islas', district: 'Fresno USD', state: 'CA', party: 'independent', title: 'School Board President, Fresno USD', bio: 'President of the Fresno Unified School District Board of Education. Advocate for educational equity in California\'s Central Valley.', website: 'https://www.fresnounified.org' },

  { name: 'Courtney Jackson', district: 'Albuquerque Public Schools', state: 'NM', party: 'independent', title: 'School Board President, Albuquerque Public Schools', bio: 'President of the Albuquerque Public Schools Board of Education. Leads the largest school district in New Mexico focused on student success and community engagement.', website: 'https://www.aps.edu' },

  { name: 'Lisa Murawski', district: 'Sacramento City USD', state: 'CA', party: 'independent', title: 'School Board President, Sacramento City USD', bio: 'President of the Sacramento City Unified School District Board of Education. Focused on improving academic outcomes in California\'s capital city.', website: 'https://www.scusd.edu' },

  { name: 'Juan Benitez', district: 'Long Beach USD', state: 'CA', party: 'independent', title: 'School Board President, Long Beach USD', bio: 'President of the Long Beach Unified School District Board of Education. Leads a nationally recognized urban school district in Southern California.', website: 'https://www.lbschools.net' },

  { name: 'Ravi Shah', district: 'Tucson USD', state: 'AZ', party: 'independent', title: 'School Board President, Tucson USD', bio: 'President of the Tucson Unified School District Governing Board in Arizona. Focused on academic achievement and community trust.', website: 'https://www.tusd1.org' },

  { name: 'Marcie Hutchinson', district: 'Mesa Public Schools', state: 'AZ', party: 'independent', title: 'School Board President, Mesa Public Schools', bio: 'President of the Mesa Public Schools Governing Board in Arizona. Leads the largest school district in the Phoenix East Valley.', website: 'https://www.mpsaz.org' },

  { name: 'Christina Martinez', district: 'San Antonio ISD', state: 'TX', party: 'independent', title: 'School Board President, San Antonio ISD', bio: 'President of the San Antonio Independent School District Board of Trustees. Focused on academic excellence and community partnerships in San Antonio\'s urban core.', website: 'https://www.saisd.net' },

  { name: 'Mike Hutchinson', district: 'Oakland USD', state: 'CA', party: 'independent', title: 'School Board President, Oakland USD', bio: 'President of the Oakland Unified School District Board of Education. Focused on maintaining neighborhood schools and educational equity in Oakland, California.', website: 'https://www.ousd.org' },

  { name: 'Linda Duncan', district: 'Jefferson County Public Schools', state: 'KY', party: 'independent', title: 'School Board Chair, Jefferson County Public Schools', bio: 'Chair of the Jefferson County Board of Education in Louisville, Kentucky. Leads the largest school district in the state focused on student achievement and equity.', website: 'https://www.jefferson.kyschools.us' },

  { name: 'Vickie Turner', district: 'DeKalb County School District', state: 'GA', party: 'independent', title: 'School Board Chair, DeKalb County School District', bio: 'Chair of the DeKalb County Board of Education in suburban Atlanta. Advocates for academic excellence and equitable resources across the district.', website: 'https://www.dekalbschoolsga.org' },

  { name: 'Brad Wheeler', district: 'Cobb County School District', state: 'GA', party: 'independent', title: 'School Board Chair, Cobb County School District', bio: 'Chair of the Cobb County Board of Education in suburban Atlanta. Leads one of the largest school districts in Georgia.', website: 'https://www.cobbk12.org' },

  { name: 'Gloria Dent', district: 'Anne Arundel County Public Schools', state: 'MD', party: 'independent', title: 'School Board President, Anne Arundel County Public Schools', bio: 'President of the Anne Arundel County Board of Education in Maryland. Focused on student success and community engagement in the Annapolis region.', website: 'https://www.aacps.org' },
]

const rows = SCHOOL_BOARD_LEADERS.map(m => ({
  name: m.name,
  slug: m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  state: m.state,
  chamber: 'school_board',
  party: m.party,
  title: m.title,
  bio: m.bio,
  website_url: m.website,
  image_url: null,
}))

console.log(`Upserting ${rows.length} school board leaders...`)

// Upsert in batches of 25
for (let i = 0; i < rows.length; i += 25) {
  const batch = rows.slice(i, i + 25)
  const { data, error } = await supabase
    .from('politicians')
    .upsert(batch, { onConflict: 'slug' })
    .select('id, name, slug')

  if (error) {
    console.error(`Error upserting batch ${i / 25 + 1}:`, error.message)
  } else {
    console.log(`Batch ${i / 25 + 1}: inserted/updated ${data.length} records`)
    data.forEach(r => console.log(`  ✓ ${r.name} (${r.slug})`))
  }
}

// Verify total count
const { count, error: countError } = await supabase
  .from('politicians')
  .select('*', { count: 'exact', head: true })
  .eq('chamber', 'school_board')

if (countError) {
  console.error('Count error:', countError.message)
} else {
  console.log(`\nTotal school_board politicians in DB: ${count}`)
}

console.log('Done!')
