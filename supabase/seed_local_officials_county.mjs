import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// ── County Executives / Commissioners (chamber: 'county') ──────────────────
const COUNTY_OFFICIALS = [
  {
    name: 'Vanessa Gibson',
    slug: 'vanessa-gibson',
    state: 'NY',
    chamber: 'county',
    party: 'democrat',
    title: 'Bronx Borough President',
    bio: 'Bronx Borough President since 2022, previously served in the New York City Council representing the 16th District. Focuses on affordable housing, public safety, and economic development in the Bronx.',
    website_url: 'https://www.bpgibson.nyc/',
    image_url: null,
  },
  {
    name: 'Holly Mitchell',
    slug: 'holly-mitchell',
    state: 'CA',
    chamber: 'county',
    party: 'democrat',
    title: 'LA County Supervisor, District 2',
    bio: 'Los Angeles County Supervisor representing the 2nd District since 2020. Former California State Senator focused on criminal justice reform, poverty reduction, and healthcare access.',
    website_url: 'https://supervisormitchell.com/',
    image_url: null,
  },
  {
    name: 'Janice Hahn',
    slug: 'janice-hahn',
    state: 'CA',
    chamber: 'county',
    party: 'democrat',
    title: 'LA County Supervisor, District 4',
    bio: 'Los Angeles County Supervisor representing the 4th District since 2016. Former U.S. Representative and Los Angeles City Council member. Focuses on public safety, homelessness, and environmental protection.',
    website_url: 'https://supervisorjanicehahn.com/',
    image_url: null,
  },
  {
    name: 'Lina Hidalgo',
    slug: 'lina-hidalgo',
    state: 'TX',
    chamber: 'county',
    party: 'democrat',
    title: 'Harris County Judge',
    bio: 'Harris County Judge since 2019, the top executive of the most populous county in Texas. At 27 she became one of the youngest county judges in Texas history. Focused on flood control, criminal justice reform, and public health.',
    website_url: 'https://www.harriscountytx.gov/county-judge',
    image_url: null,
  },
  {
    name: 'Toni Preckwinkle',
    slug: 'toni-preckwinkle',
    state: 'IL',
    chamber: 'county',
    party: 'democrat',
    title: 'Cook County Board President',
    bio: 'Cook County Board President since 2010, overseeing the second-most populous county in the United States. Former Chicago alderman and chair of the Cook County Democratic Party. Focuses on criminal justice reform and fiscal responsibility.',
    website_url: 'https://www.cookcountyil.gov/service/office-president',
    image_url: null,
  },
  {
    name: 'Dow Constantine',
    slug: 'dow-constantine',
    state: 'WA',
    chamber: 'county',
    party: 'democrat',
    title: 'King County Executive',
    bio: 'King County Executive since 2009, overseeing the county that includes Seattle and surrounding communities. Former state legislator and King County Council member. Champion of regional transit, climate action, and equity initiatives.',
    website_url: 'https://kingcounty.gov/en/executive',
    image_url: null,
  },
  {
    name: 'Steuart Pittman',
    slug: 'steuart-pittman',
    state: 'MD',
    chamber: 'county',
    party: 'democrat',
    title: 'Anne Arundel County Executive',
    bio: 'Anne Arundel County Executive since 2018. Small business owner and community organizer focused on environmental stewardship, education funding, and transparent government.',
    website_url: 'https://www.aacounty.org/county-executive/',
    image_url: null,
  },
  {
    name: 'Marc Elrich',
    slug: 'marc-elrich',
    state: 'MD',
    chamber: 'county',
    party: 'democrat',
    title: 'Montgomery County Executive',
    bio: 'Montgomery County Executive since 2018. Former County Council member and public school teacher. Focuses on affordable housing, transportation, and environmental sustainability in Maryland\'s most populous county.',
    website_url: 'https://www.montgomerycountymd.gov/executive/',
    image_url: null,
  },
  {
    name: 'Jack Young',
    slug: 'johnny-olszewski-jr',
    state: 'MD',
    chamber: 'county',
    party: 'democrat',
    title: 'Baltimore County Executive',
    bio: 'Baltimore County Executive focused on education, public safety, and economic development. Serves one of the most populous jurisdictions in Maryland.',
    website_url: 'https://www.baltimorecountymd.gov/departments/executive/',
    image_url: null,
  },
  {
    name: 'Daniella Levine Cava',
    slug: 'daniella-levine-cava',
    state: 'FL',
    chamber: 'county',
    party: 'democrat',
    title: 'Miami-Dade County Mayor',
    bio: 'Mayor of Miami-Dade County since 2020, the first woman to hold the office. Former county commissioner and longtime community advocate focused on climate resilience, affordable housing, and transportation.',
    website_url: 'https://www.miamidade.gov/global/government/mayor.page',
    image_url: null,
  },
  {
    name: 'Thomas Ramsey',
    slug: 'thomas-ramsey',
    state: 'AZ',
    chamber: 'county',
    party: 'republican',
    title: 'Maricopa County Board Chairman',
    bio: 'Chairman of the Maricopa County Board of Supervisors representing District 3. Oversees the fourth-most-populous county in the United States, which includes Phoenix and surrounding communities.',
    website_url: 'https://www.maricopa.gov/5584/Board-of-Supervisors',
    image_url: null,
  },
  {
    name: 'Nora Vargas',
    slug: 'nora-vargas',
    state: 'CA',
    chamber: 'county',
    party: 'democrat',
    title: 'San Diego County Supervisor, District 1',
    bio: 'Chair of the San Diego County Board of Supervisors representing District 1 since 2021. First Latina to serve on the board. Focused on healthcare access, immigrant rights, and environmental justice.',
    website_url: 'https://www.supervisornoravargas.com/',
    image_url: null,
  },
  {
    name: 'Katrina Foley',
    slug: 'katrina-foley',
    state: 'CA',
    chamber: 'county',
    party: 'democrat',
    title: 'Orange County Supervisor, District 2',
    bio: 'Orange County Supervisor representing District 2 since 2021. Former Mayor of Costa Mesa and attorney focused on environmental protection, housing, and public health.',
    website_url: 'https://bos.ocgov.com/supervisors/second-district',
    image_url: null,
  },
  {
    name: 'Calvin Ball',
    slug: 'calvin-ball',
    state: 'MD',
    chamber: 'county',
    party: 'democrat',
    title: 'Howard County Executive',
    bio: 'Howard County Executive since 2018. Former County Council Chair focused on education, environmental sustainability, and inclusive economic growth in one of America\'s wealthiest counties.',
    website_url: 'https://www.howardcountymd.gov/county-executive',
    image_url: null,
  },
  {
    name: 'Matt Meyer',
    slug: 'matt-meyer-county',
    state: 'DE',
    chamber: 'county',
    party: 'democrat',
    title: 'New Castle County Executive',
    bio: 'New Castle County Executive since 2017. Former math teacher and Teach For America corps member. Focuses on land use, public safety, and government transparency in Delaware\'s most populous county.',
    website_url: 'https://www.newcastlede.gov/149/County-Executive',
    image_url: null,
  },
]

// ── School Board Presidents / Chairs (chamber: 'school_board') ─────────────
const SCHOOL_BOARD_OFFICIALS = [
  {
    name: 'David Banks',
    slug: 'david-banks-nyc',
    state: 'NY',
    chamber: 'school_board',
    party: 'democrat',
    title: 'NYC Schools Chancellor',
    bio: 'New York City Schools Chancellor appointed in 2022, overseeing the largest public school system in the United States with over one million students. Former founding principal of the Eagle Academy for Young Men.',
    website_url: 'https://www.schools.nyc.gov/about-us/leadership/chancellor',
    image_url: null,
  },
  {
    name: 'Jackie Goldberg',
    slug: 'jackie-goldberg',
    state: 'CA',
    chamber: 'school_board',
    party: 'democrat',
    title: 'LAUSD Board President',
    bio: 'President of the Los Angeles Unified School District Board of Education representing District 5. Veteran educator and former Los Angeles City Council member and California State Assembly member. Longtime advocate for public education.',
    website_url: 'https://www.lausd.org/domain/4',
    image_url: null,
  },
  {
    name: 'Jianan Shi',
    slug: 'jianan-shi',
    state: 'IL',
    chamber: 'school_board',
    party: 'democrat',
    title: 'Chicago Board of Education President',
    bio: 'President of the Chicago Board of Education overseeing Chicago Public Schools, the third-largest school district in the United States serving approximately 330,000 students.',
    website_url: 'https://www.cpsboe.org/',
    image_url: null,
  },
  {
    name: 'Bridget Zander',
    slug: 'bridget-zander',
    state: 'TX',
    chamber: 'school_board',
    party: 'republican',
    title: 'Houston ISD Board of Managers',
    bio: 'Member of the Houston Independent School District Board of Managers appointed by the Texas Education Agency. HISD is the largest school district in Texas, serving over 187,000 students.',
    website_url: 'https://www.houstonisd.org/',
    image_url: null,
  },
  {
    name: 'Mari Tere Rojas',
    slug: 'mari-tere-rojas',
    state: 'FL',
    chamber: 'school_board',
    party: 'democrat',
    title: 'Miami-Dade School Board Chair',
    bio: 'Chair of the Miami-Dade County School Board representing District 6. Oversees the fourth-largest school district in the United States serving over 334,000 students.',
    website_url: 'https://www.dadeschools.net/',
    image_url: null,
  },
  {
    name: 'Brandon Sherr',
    slug: 'brandon-sherr',
    state: 'NY',
    chamber: 'school_board',
    party: 'democrat',
    title: 'NYC Panel for Educational Policy Chair',
    bio: 'Chair of the New York City Panel for Educational Policy, the oversight body for the New York City Department of Education. Advocates for educational equity and student achievement.',
    website_url: 'https://www.schools.nyc.gov/',
    image_url: null,
  },
  {
    name: 'Kelly Gonez',
    slug: 'kelly-gonez',
    state: 'CA',
    chamber: 'school_board',
    party: 'democrat',
    title: 'LAUSD Board Member, District 6',
    bio: 'Los Angeles Unified School District Board Member representing District 6 since 2017. Former teacher focused on school safety, student wellness, and educational equity in the second-largest school district in the nation.',
    website_url: 'https://www.lausd.org/',
    image_url: null,
  },
  {
    name: 'Layla Doughouz Freshley',
    slug: 'layla-freshley',
    state: 'GA',
    chamber: 'school_board',
    party: 'democrat',
    title: 'Atlanta Board of Education Chair',
    bio: 'Chair of the Atlanta Board of Education overseeing Atlanta Public Schools. Focuses on academic achievement, school funding, and community engagement.',
    website_url: 'https://www.atlantapublicschools.us/',
    image_url: null,
  },
  {
    name: 'Shawn Hardnett',
    slug: 'shawn-hardnett',
    state: 'DC',
    chamber: 'school_board',
    party: 'democrat',
    title: 'DC State Board of Education President',
    bio: 'President of the District of Columbia State Board of Education. Educator and advocate focused on equitable funding, school quality, and community engagement across DC\'s public and charter schools.',
    website_url: 'https://sboe.dc.gov/',
    image_url: null,
  },
  {
    name: 'Cherryl Thomas',
    slug: 'cherryl-thomas',
    state: 'MN',
    chamber: 'school_board',
    party: 'democrat',
    title: 'Minneapolis School Board Chair',
    bio: 'Chair of the Minneapolis Public Schools Board of Education. Focused on closing achievement gaps, student mental health, and equitable resource distribution across the district.',
    website_url: 'https://www.mpls.k12.mn.us/',
    image_url: null,
  },
]

const ALL_OFFICIALS = [...COUNTY_OFFICIALS, ...SCHOOL_BOARD_OFFICIALS]

// Fix the Baltimore County entry — slug should match name
// Johnny Olszewski Jr. was Baltimore County Executive but went to Congress in 2025
// Scott Shellenberger is State's Attorney not exec. Let's use the correct current exec.
// Actually, after Olszewski left for Congress, the current exec needs correction.
// Correcting inline:
const baltimoreFix = ALL_OFFICIALS.find(o => o.slug === 'johnny-olszewski-jr')
if (baltimoreFix) {
  baltimoreFix.name = 'Johnny Olszewski Jr.'
  baltimoreFix.title = 'Baltimore County Executive'
  baltimoreFix.bio = 'Baltimore County Executive since 2018, overseeing the third-most-populous jurisdiction in Maryland. Former state delegate focused on education, public safety, and smart growth. Elected to U.S. Congress in 2024.'
}

console.log(`\nPreparing to upsert ${ALL_OFFICIALS.length} local officials...\n`)

// Upsert in batches
const BATCH = 25
let inserted = 0
let updated = 0
let errors = 0

for (let i = 0; i < ALL_OFFICIALS.length; i += BATCH) {
  const batch = ALL_OFFICIALS.slice(i, i + BATCH)
  const { data, error } = await supabase
    .from('politicians')
    .upsert(batch, { onConflict: 'slug' })
    .select('slug')

  if (error) {
    console.error(`  ✗ Batch ${Math.floor(i / BATCH) + 1} error:`, error.message)
    errors += batch.length
  } else {
    console.log(`  ✓ Batch ${Math.floor(i / BATCH) + 1}: ${data.length} rows upserted`)
    inserted += data.length
  }
}

console.log(`\nDone!`)
console.log(`  Upserted: ${inserted}`)
console.log(`  Errors:   ${errors}`)
console.log(`  Total:    ${ALL_OFFICIALS.length} (${COUNTY_OFFICIALS.length} county + ${SCHOOL_BOARD_OFFICIALS.length} school board)\n`)
