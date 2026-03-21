import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// ---------------------------------------------------------------------------
// Bootstrap Supabase client from .env.local
// ---------------------------------------------------------------------------
const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || vars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || vars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ---------------------------------------------------------------------------
// 1. Look up the 2026-midterms election
// ---------------------------------------------------------------------------
async function ensureElection() {
  const { data: existing } = await supabase
    .from('elections')
    .select('id')
    .eq('slug', '2026-midterms')
    .single()

  if (existing) return existing.id

  const { data, error } = await supabase.from('elections').upsert({
    name: '2026 Midterm Elections',
    slug: '2026-midterms',
    election_date: '2026-11-03',
    description: 'The 2026 United States midterm elections including federal, state, and local races.',
    is_active: true,
  }, { onConflict: 'slug' }).select('id').single()

  if (error) { console.error('Election upsert error:', error.message); process.exit(1) }
  return data.id
}

// ---------------------------------------------------------------------------
// 2. All race + candidate data (expanded local races)
// ---------------------------------------------------------------------------
const RACES = [

  // =========================================================================
  //  MAYORAL RACES — 30 major cities
  // =========================================================================
  {
    name: 'Los Angeles Mayor',
    slug: 'los-angeles-mayor-2026',
    state: 'CA',
    chamber: 'mayor',
    district: null,
    description: 'Second-largest city in the US. Los Angeles holds its next regular mayoral election in 2026.',
    candidates: [
      { name: 'Karen Bass', party: 'democrat', bio: 'Incumbent mayor since 2022. Former US Representative and community organizer focused on homelessness and public safety.', status: 'running', is_incumbent: true },
      { name: 'Rick Caruso', party: 'republican', bio: 'Billionaire real estate developer who ran in 2022. Focused on crime reduction and business-friendly governance.', status: 'exploring' },
      { name: 'Kevin de Leon', party: 'democrat', bio: 'Former LA City Council member and state Senate president pro tempore. Housing and labor advocate.', status: 'exploring' },
    ]
  },
  {
    name: 'New York City Mayor',
    slug: 'nyc-mayor-2026',
    state: 'NY',
    chamber: 'mayor',
    district: null,
    description: 'Largest city in the US with over 8 million residents. Highly competitive Democratic primary expected.',
    candidates: [
      { name: 'Brad Lander', party: 'democrat', bio: 'NYC Comptroller and progressive policy leader. Former city council member focused on housing and climate.', status: 'running' },
      { name: 'Zellnor Myrie', party: 'democrat', bio: 'State senator from Brooklyn. Criminal justice reform advocate and rising progressive voice.', status: 'running' },
      { name: 'Curtis Sliwa', party: 'republican', bio: 'Founder of the Guardian Angels and 2021 Republican mayoral nominee. Public safety advocate.', status: 'exploring' },
    ]
  },
  {
    name: 'Chicago Mayor',
    slug: 'chicago-mayor-2026',
    state: 'IL',
    chamber: 'mayor',
    district: null,
    description: 'Third-largest city in the US. Nonpartisan election with runoff if no candidate gets 50%.',
    candidates: [
      { name: 'Brandon Johnson', party: 'democrat', bio: 'Incumbent mayor since 2023. Former Cook County commissioner and teachers union organizer.', status: 'running', is_incumbent: true },
      { name: 'Paul Vallas', party: 'democrat', bio: 'Former Chicago Public Schools CEO and 2023 runoff finalist. Focused on public safety and fiscal management.', status: 'exploring' },
    ]
  },
  {
    name: 'Houston Mayor',
    slug: 'houston-mayor-2026',
    state: 'TX',
    chamber: 'mayor',
    district: null,
    description: 'Fourth-largest city in the US. Nonpartisan election in a diverse and growing metro.',
    candidates: [
      { name: 'John Whitmire', party: 'democrat', bio: 'Incumbent mayor since 2024. Former longtime state senator focused on public safety and infrastructure.', status: 'running', is_incumbent: true },
      { name: 'Amanda Edwards', party: 'democrat', bio: 'Former at-large city council member and attorney. Infrastructure and equity advocate.', status: 'exploring' },
    ]
  },
  {
    name: 'Miami Mayor',
    slug: 'miami-mayor-2026',
    state: 'FL',
    chamber: 'mayor',
    district: null,
    description: 'Major international city and financial hub. Nonpartisan election with term limits.',
    candidates: [
      { name: 'Francis Suarez', party: 'republican', bio: 'Incumbent mayor since 2017. Tech industry booster who ran for president in 2024.', status: 'running', is_incumbent: true },
      { name: 'Ken Russell', party: 'democrat', bio: 'Former city commissioner and neighborhood advocate. Focused on affordable housing and resilience.', status: 'running' },
      { name: 'Alex Diaz de la Portilla', party: 'republican', bio: 'City commissioner and attorney from a prominent Miami political family.', status: 'running' },
    ]
  },
  {
    name: 'San Francisco Mayor',
    slug: 'san-francisco-mayor-2026',
    state: 'CA',
    chamber: 'mayor',
    district: null,
    description: 'Major tech hub facing housing, homelessness, and public safety challenges.',
    candidates: [
      { name: 'Daniel Lurie', party: 'democrat', bio: 'Incumbent mayor since 2024. Nonprofit leader and Levi Strauss heir focused on homelessness and downtown recovery.', status: 'running', is_incumbent: true },
      { name: 'Ahsha Safai', party: 'democrat', bio: 'Former supervisor and 2024 mayoral candidate. Housing and small business advocate.', status: 'exploring' },
    ]
  },
  {
    name: 'Boston Mayor',
    slug: 'boston-mayor-2026',
    state: 'MA',
    chamber: 'mayor',
    district: null,
    description: 'Largest city in New England. Strong mayor system with nonpartisan preliminary election.',
    candidates: [
      { name: 'Michelle Wu', party: 'democrat', bio: 'Incumbent mayor since 2021. First woman and Asian American to lead Boston. Focused on climate, transit, and housing.', status: 'running', is_incumbent: true },
      { name: 'Erin Murphy', party: 'democrat', bio: 'Former city council at-large member and teacher. Education and public safety advocate.', status: 'exploring' },
    ]
  },
  {
    name: 'Seattle Mayor',
    slug: 'seattle-mayor-2026',
    state: 'WA',
    chamber: 'mayor',
    district: null,
    description: 'Major Pacific Northwest tech hub. Nonpartisan top-two primary system.',
    candidates: [
      { name: 'Bruce Harrell', party: 'democrat', bio: 'Incumbent mayor since 2022. Former city council president focused on public safety and homelessness.', status: 'running', is_incumbent: true },
      { name: 'Lorena Gonzalez', party: 'democrat', bio: 'Former city council president and labor attorney. Progressive voice on housing and workers rights.', status: 'exploring' },
    ]
  },
  {
    name: 'Denver Mayor',
    slug: 'denver-mayor-2026',
    state: 'CO',
    chamber: 'mayor',
    district: null,
    description: 'Fastest-growing major city in the Mountain West. Nonpartisan municipal election.',
    candidates: [
      { name: 'Mike Johnston', party: 'democrat', bio: 'Incumbent mayor since 2023. Former state senator focused on homelessness reduction and housing.', status: 'running', is_incumbent: true },
      { name: 'Kelly Brough', party: 'democrat', bio: 'Former Denver Metro Chamber of Commerce CEO and 2023 runoff finalist.', status: 'exploring' },
    ]
  },
  {
    name: 'Atlanta Mayor',
    slug: 'atlanta-mayor-2026',
    state: 'GA',
    chamber: 'mayor',
    district: null,
    description: 'Capital of Georgia and major economic hub of the Southeast.',
    candidates: [
      { name: 'Andre Dickens', party: 'democrat', bio: 'Incumbent mayor since 2022. Former city council member and nonprofit leader focused on affordable housing.', status: 'running', is_incumbent: true },
      { name: 'Antonio Brown', party: 'democrat', bio: 'Former city council president and technology executive.', status: 'exploring' },
      { name: 'Mary Norwood', party: 'independent', bio: 'Perennial mayoral candidate and former city council member. Centrist focused on public safety.', status: 'exploring' },
    ]
  },
  {
    name: 'Detroit Mayor',
    slug: 'detroit-mayor-2026',
    state: 'MI',
    chamber: 'mayor',
    district: null,
    description: 'Largest city in Michigan. Nonpartisan election in a city experiencing economic revitalization.',
    candidates: [
      { name: 'Mike Duggan', party: 'democrat', bio: 'Incumbent mayor since 2014. Focused on neighborhood revitalization, demolition, and economic development.', status: 'running', is_incumbent: true },
      { name: 'Coleman Young II', party: 'democrat', bio: 'State senator and son of former Detroit mayor. Progressive voice on housing and criminal justice.', status: 'exploring' },
    ]
  },
  {
    name: 'Minneapolis Mayor',
    slug: 'minneapolis-mayor-2026',
    state: 'MN',
    chamber: 'mayor',
    district: null,
    description: 'Largest city in Minnesota. Uses ranked-choice voting for municipal elections.',
    candidates: [
      { name: 'Jacob Frey', party: 'democrat', bio: 'Incumbent mayor since 2018. Former civil rights attorney focused on housing, policing reform, and economic growth.', status: 'running', is_incumbent: true },
      { name: 'Sheila Nezhad', party: 'democrat', bio: 'Community organizer and progressive activist. Focused on public safety transformation and housing justice.', status: 'exploring' },
    ]
  },
  {
    name: 'Nashville Mayor',
    slug: 'nashville-mayor-2026',
    state: 'TN',
    chamber: 'mayor',
    district: null,
    description: 'Tennessee state capital and one of the fastest-growing cities in the US.',
    candidates: [
      { name: 'Freddie O\'Connell', party: 'democrat', bio: 'Incumbent mayor since 2023. Former at-large council member focused on transit and affordable housing.', status: 'running', is_incumbent: true },
      { name: 'Alice Rolli', party: 'republican', bio: 'Former Tennessee Republican Party chair and attorney. Ran in the 2023 special election.', status: 'exploring' },
    ]
  },
  {
    name: 'Charlotte Mayor',
    slug: 'charlotte-mayor-2026',
    state: 'NC',
    chamber: 'mayor',
    district: null,
    description: 'Largest city in North Carolina and major banking center. Partisan municipal elections.',
    candidates: [
      { name: 'Vi Lyles', party: 'democrat', bio: 'Incumbent mayor since 2017. Former assistant city manager focused on economic mobility and transit.', status: 'running', is_incumbent: true },
      { name: 'Jeff Jackson', party: 'democrat', bio: 'Former US Representative and state senator. Military veteran focused on transparency and accountability.', status: 'exploring' },
    ]
  },
  {
    name: 'Columbus Mayor',
    slug: 'columbus-mayor-2026',
    state: 'OH',
    chamber: 'mayor',
    district: null,
    description: 'Largest city in Ohio and home to Ohio State University. Nonpartisan municipal election.',
    candidates: [
      { name: 'Andrew Ginther', party: 'democrat', bio: 'Incumbent mayor since 2016. Former city council president focused on safety, housing, and economic development.', status: 'running', is_incumbent: true },
      { name: 'Elizabeth Brown', party: 'democrat', bio: 'Former city council member and zoning attorney. Housing and urban development advocate.', status: 'exploring' },
    ]
  },
  {
    name: 'Indianapolis Mayor',
    slug: 'indianapolis-mayor-2026',
    state: 'IN',
    chamber: 'mayor',
    district: null,
    description: 'Largest city in Indiana. Consolidated city-county government (Unigov).',
    candidates: [
      { name: 'Joe Hogsett', party: 'democrat', bio: 'Incumbent mayor since 2016. Former US Attorney and Secretary of State. Focused on public safety and infrastructure.', status: 'running', is_incumbent: true },
      { name: 'Jefferson Shreve', party: 'republican', bio: 'City-county council member and storage company founder. Narrowly lost to Hogsett in 2023.', status: 'running' },
    ]
  },
  {
    name: 'Jacksonville Mayor',
    slug: 'jacksonville-mayor-2026',
    state: 'FL',
    chamber: 'mayor',
    district: null,
    description: 'Largest city by area in the contiguous US. Consolidated city-county government.',
    candidates: [
      { name: 'Donna Deegan', party: 'democrat', bio: 'Incumbent mayor since 2023. Former TV news anchor and marathon runner. Focused on Jacksonville\'s riverfront and equity.', status: 'running', is_incumbent: true },
      { name: 'Daniel Davis', party: 'republican', bio: 'Former city council president and JAX Chamber CEO. 2023 Republican nominee.', status: 'exploring' },
    ]
  },
  {
    name: 'San Diego Mayor',
    slug: 'san-diego-mayor-2026',
    state: 'CA',
    chamber: 'mayor',
    district: null,
    description: 'Eighth-largest city in the US. Strong mayor system with nonpartisan top-two primary.',
    candidates: [
      { name: 'Todd Gloria', party: 'democrat', bio: 'Incumbent mayor since 2020. Former state assemblymember and city council member. Focused on housing and homelessness.', status: 'running', is_incumbent: true },
      { name: 'Larry Turner', party: 'republican', bio: 'San Diego business leader and retired Navy officer. Focused on public safety and fiscal responsibility.', status: 'running' },
    ]
  },
  {
    name: 'Dallas Mayor',
    slug: 'dallas-mayor-2026',
    state: 'TX',
    chamber: 'mayor',
    district: null,
    description: 'Ninth-largest city in the US. Nonpartisan municipal election with no term limits for mayor.',
    candidates: [
      { name: 'Eric Johnson', party: 'republican', bio: 'Incumbent mayor since 2019. Switched from Democrat to Republican in 2023. Former state representative.', status: 'running', is_incumbent: true },
      { name: 'Maxime Minc', party: 'democrat', bio: 'Dallas city council member and urban development entrepreneur. Progressive voice on housing and transit.', status: 'running' },
    ]
  },
  {
    name: 'Philadelphia Mayor',
    slug: 'philadelphia-mayor-2026',
    state: 'PA',
    chamber: 'mayor',
    district: null,
    description: 'Sixth-largest city in the US. Democratic stronghold with competitive primaries.',
    candidates: [
      { name: 'Cherelle Parker', party: 'democrat', bio: 'Incumbent mayor since 2024. Former city council member and state representative. Focused on public safety and jobs.', status: 'running', is_incumbent: true },
      { name: 'David Oh', party: 'republican', bio: 'Former at-large city council member. First Korean American on Philadelphia city council.', status: 'exploring' },
    ]
  },
  {
    name: 'Baltimore Mayor',
    slug: 'baltimore-mayor-2026',
    state: 'MD',
    chamber: 'mayor',
    district: null,
    description: 'Largest city in Maryland. Independent city (not part of any county) with partisan elections.',
    candidates: [
      { name: 'Brandon Scott', party: 'democrat', bio: 'Incumbent mayor since 2020. Youngest mayor in over a century. Focused on violence reduction and youth development.', status: 'running', is_incumbent: true },
      { name: 'Sheila Dixon', party: 'democrat', bio: 'Former mayor who served 2007-2010. Perennial candidate focused on neighborhood revitalization.', status: 'exploring' },
    ]
  },
  {
    name: 'Milwaukee Mayor',
    slug: 'milwaukee-mayor-2026',
    state: 'WI',
    chamber: 'mayor',
    district: null,
    description: 'Largest city in Wisconsin. Nonpartisan spring election cycle.',
    candidates: [
      { name: 'Cavalier Johnson', party: 'democrat', bio: 'Incumbent mayor since 2022. Former city council president and youngest mayor in Milwaukee history.', status: 'running', is_incumbent: true },
      { name: 'Bob Donovan', party: 'republican', bio: 'Former alderman and two-time mayoral candidate. Tough-on-crime advocate.', status: 'exploring' },
    ]
  },
  {
    name: 'St. Louis Mayor',
    slug: 'st-louis-mayor-2026',
    state: 'MO',
    chamber: 'mayor',
    district: null,
    description: 'Independent city in Missouri. Uses nonpartisan municipal elections with approval voting.',
    candidates: [
      { name: 'Tishaura Jones', party: 'democrat', bio: 'Incumbent mayor since 2021. First Black woman to lead St. Louis. Focused on public safety and equity.', status: 'running', is_incumbent: true },
      { name: 'Andrew Jones', party: 'democrat', bio: 'Alderman and small business owner. Focused on neighborhood stabilization and economic development.', status: 'exploring' },
    ]
  },
  {
    name: 'New Orleans Mayor',
    slug: 'new-orleans-mayor-2026',
    state: 'LA',
    chamber: 'mayor',
    district: null,
    description: 'Largest city in Louisiana. Nonpartisan blanket primary ("jungle primary") system.',
    candidates: [
      { name: 'LaToya Cantrell', party: 'democrat', bio: 'Incumbent mayor since 2018. Former city council member focused on infrastructure and disaster preparedness.', status: 'running', is_incumbent: true },
      { name: 'Helena Moreno', party: 'democrat', bio: 'City council president and former state representative. Ethics and transparency advocate.', status: 'exploring' },
    ]
  },
  {
    name: 'Washington DC Mayor',
    slug: 'dc-mayor-2026',
    state: 'DC',
    chamber: 'mayor',
    district: null,
    description: 'Mayor of the District of Columbia. Partisan primary with general election. Democratic primary is decisive.',
    candidates: [
      { name: 'Muriel Bowser', party: 'democrat', bio: 'Incumbent mayor since 2015. Longest-serving DC mayor in decades. Focused on housing, education, and statehood.', status: 'running', is_incumbent: true },
      { name: 'Robert White', party: 'democrat', bio: 'At-large council member and 2022 mayoral candidate. Progressive focused on equity and government reform.', status: 'exploring' },
      { name: 'Trayon White', party: 'democrat', bio: 'Ward 8 council member focused on community development and youth programs.', status: 'exploring' },
    ]
  },
  {
    name: 'Honolulu Mayor',
    slug: 'honolulu-mayor-2026',
    state: 'HI',
    chamber: 'mayor',
    district: null,
    description: 'Consolidated city-county covering the island of Oahu. Nonpartisan election.',
    candidates: [
      { name: 'Rick Blangiardi', party: 'democrat', bio: 'Incumbent mayor since 2021. Former media executive focused on rail transit completion and homelessness.', status: 'running', is_incumbent: true },
      { name: 'Tommy Waters', party: 'democrat', bio: 'City council chair and attorney. Focused on housing and government efficiency.', status: 'exploring' },
    ]
  },
  {
    name: 'Salt Lake City Mayor',
    slug: 'slc-mayor-2026',
    state: 'UT',
    chamber: 'mayor',
    district: null,
    description: 'Capital of Utah and a progressive enclave in a conservative state. Nonpartisan election.',
    candidates: [
      { name: 'Erin Mendenhall', party: 'democrat', bio: 'Incumbent mayor since 2020. Former city council member focused on air quality, housing, and homelessness.', status: 'running', is_incumbent: true },
      { name: 'Luz Escamilla', party: 'democrat', bio: 'State senator and former mayoral candidate. First Latina in the Utah Senate. Community banking executive.', status: 'exploring' },
    ]
  },
  {
    name: 'Boise Mayor',
    slug: 'boise-mayor-2026',
    state: 'ID',
    chamber: 'mayor',
    district: null,
    description: 'Capital and largest city in Idaho. One of the fastest-growing cities in the US. Nonpartisan election.',
    candidates: [
      { name: 'Lauren McLean', party: 'democrat', bio: 'Incumbent mayor since 2020. Former city council member focused on growth management and housing.', status: 'running', is_incumbent: true },
      { name: 'Joe Borton', party: 'republican', bio: 'Former state representative and attorney. Focused on fiscal conservatism and public safety.', status: 'running' },
    ]
  },
  {
    name: 'Albuquerque Mayor',
    slug: 'albuquerque-mayor-2026',
    state: 'NM',
    chamber: 'mayor',
    district: null,
    description: 'Largest city in New Mexico. Nonpartisan municipal election with runoff.',
    candidates: [
      { name: 'Tim Keller', party: 'democrat', bio: 'Incumbent mayor since 2017. Former state auditor and state senator focused on crime reduction and economic development.', status: 'running', is_incumbent: true },
      { name: 'Eddy Aragon', party: 'republican', bio: 'Conservative radio host and former sheriff candidate. Public safety and government accountability advocate.', status: 'running' },
    ]
  },
  {
    name: 'Oklahoma City Mayor',
    slug: 'okc-mayor-2026',
    state: 'OK',
    chamber: 'mayor',
    district: null,
    description: 'Capital and largest city in Oklahoma. Nonpartisan council-manager form of government.',
    candidates: [
      { name: 'David Holt', party: 'republican', bio: 'Incumbent mayor since 2018. Former state senator focused on MAPS infrastructure program and downtown revitalization.', status: 'running', is_incumbent: true },
      { name: 'Carol Hefner', party: 'republican', bio: 'Businesswoman and civic leader. Focused on economic development and conservative governance.', status: 'exploring' },
    ]
  },

  // =========================================================================
  //  STATE SENATE — 20 additional competitive districts
  // =========================================================================
  {
    name: 'California State Senate District 27',
    slug: 'ca-state-senate-d27-2026',
    state: 'CA',
    chamber: 'state_senate',
    district: '27',
    description: 'Competitive district covering parts of the San Fernando Valley and Santa Clarita.',
    candidates: [
      { name: 'Henry Stern', party: 'democrat', bio: 'Incumbent state senator and environmental attorney. Focused on wildfire prevention and water policy.', status: 'running', is_incumbent: true },
      { name: 'Lucie Volotzky', party: 'republican', bio: 'Santa Clarita business owner and education advocate. First-time candidate.', status: 'running' },
    ]
  },
  {
    name: 'California State Senate District 23',
    slug: 'ca-state-senate-d23-2026',
    state: 'CA',
    chamber: 'state_senate',
    district: '23',
    description: 'Swing district in the Inland Empire covering parts of Riverside and San Bernardino counties.',
    candidates: [
      { name: 'Rosilicie Ochoa Bogh', party: 'republican', bio: 'Incumbent state senator. Former school board member focused on education and small business.', status: 'running', is_incumbent: true },
      { name: 'James Ramos', party: 'democrat', bio: 'Former state assemblymember and first California Native American in the state legislature.', status: 'running' },
    ]
  },
  {
    name: 'New York State Senate District 4',
    slug: 'ny-state-senate-d4-2026',
    state: 'NY',
    chamber: 'state_senate',
    district: '4',
    description: 'Suburban Long Island district covering parts of Suffolk County. Competitive swing seat.',
    candidates: [
      { name: 'Monica Martinez', party: 'democrat', bio: 'Incumbent state senator and former Islip town board member. Focused on affordability and public safety.', status: 'running', is_incumbent: true },
      { name: 'Anthony Palumbo', party: 'republican', bio: 'State assemblymember and attorney. Fiscal conservative focused on tax relief.', status: 'running' },
    ]
  },
  {
    name: 'New York State Senate District 9',
    slug: 'ny-state-senate-d9-2026',
    state: 'NY',
    chamber: 'state_senate',
    district: '9',
    description: 'Competitive Nassau County seat in suburban New York City.',
    candidates: [
      { name: 'Patricia Canzoneri-Fitzpatrick', party: 'republican', bio: 'Incumbent state senator and former county legislator. Focused on public safety and tax reduction.', status: 'running', is_incumbent: true },
      { name: 'Gina Sillitti', party: 'democrat', bio: 'Former state assemblymember from Great Neck. Education and healthcare advocate.', status: 'running' },
    ]
  },
  {
    name: 'Texas State Senate District 10',
    slug: 'tx-state-senate-d10-2026',
    state: 'TX',
    chamber: 'state_senate',
    district: '10',
    description: 'Tarrant County-based seat covering Fort Worth suburbs. Increasingly competitive.',
    candidates: [
      { name: 'Phil King', party: 'republican', bio: 'Incumbent state senator and former longtime state representative. Focused on border security and property tax reform.', status: 'running', is_incumbent: true },
      { name: 'Victoria Gutierrez', party: 'democrat', bio: 'Fort Worth attorney and community organizer. Healthcare and education advocate.', status: 'running' },
    ]
  },
  {
    name: 'Texas State Senate District 16',
    slug: 'tx-state-senate-d16-2026',
    state: 'TX',
    chamber: 'state_senate',
    district: '16',
    description: 'Suburban Dallas district in Collin and Denton counties. Trending competitive.',
    candidates: [
      { name: 'Nathan Johnson', party: 'democrat', bio: 'Incumbent state senator and attorney. First Democrat to win this seat in decades.', status: 'running', is_incumbent: true },
      { name: 'Brent Hagenbuch', party: 'republican', bio: 'Collin County business owner and former school board member.', status: 'running' },
    ]
  },
  {
    name: 'Florida State Senate District 3',
    slug: 'fl-state-senate-d3-2026',
    state: 'FL',
    chamber: 'state_senate',
    district: '3',
    description: 'Jacksonville-area seat covering parts of Duval and Nassau counties.',
    candidates: [
      { name: 'Tracie Davis', party: 'democrat', bio: 'Incumbent state senator and former state representative. Education and healthcare advocate.', status: 'running', is_incumbent: true },
      { name: 'Wyman Duggan', party: 'republican', bio: 'Former state representative and attorney. Focused on economic development.', status: 'running' },
    ]
  },
  {
    name: 'Florida State Senate District 25',
    slug: 'fl-state-senate-d25-2026',
    state: 'FL',
    chamber: 'state_senate',
    district: '25',
    description: 'Competitive seat in the Tampa Bay area covering parts of Hillsborough County.',
    candidates: [
      { name: 'Jay Collins', party: 'republican', bio: 'Incumbent state senator and Army Special Forces veteran. Focused on veterans affairs and public safety.', status: 'running', is_incumbent: true },
      { name: 'Eunice Ortiz', party: 'democrat', bio: 'Tampa community organizer and small business owner. Housing and healthcare advocate.', status: 'running' },
    ]
  },
  {
    name: 'Ohio State Senate District 2',
    slug: 'oh-state-senate-d2-2026',
    state: 'OH',
    chamber: 'state_senate',
    district: '2',
    description: 'Cincinnati-area seat covering parts of Hamilton County. Competitive suburban district.',
    candidates: [
      { name: 'Bridget Flanders', party: 'democrat', bio: 'Community health advocate and nonprofit executive. First-time candidate.', status: 'running' },
      { name: 'Joe Uecker', party: 'republican', bio: 'Incumbent state senator and former state representative. Small business owner.', status: 'running', is_incumbent: true },
    ]
  },
  {
    name: 'Ohio State Senate District 18',
    slug: 'oh-state-senate-d18-2026',
    state: 'OH',
    chamber: 'state_senate',
    district: '18',
    description: 'Columbus-area swing district covering parts of Franklin County.',
    candidates: [
      { name: 'Michele Reynolds', party: 'democrat', bio: 'Former city council member and education policy advocate. Focused on working families.', status: 'running' },
      { name: 'Jerry Cirino', party: 'republican', bio: 'Incumbent state senator. Former Lake County commissioner focused on higher education reform.', status: 'running', is_incumbent: true },
    ]
  },
  {
    name: 'Pennsylvania State Senate District 44',
    slug: 'pa-state-senate-d44-2026',
    state: 'PA',
    chamber: 'state_senate',
    district: '44',
    description: 'Covers Erie and Crawford counties in northwest Pennsylvania. Blue-collar swing seat.',
    candidates: [
      { name: 'Dan Laughlin', party: 'republican', bio: 'Incumbent state senator and small business owner. Moderate Republican known for bipartisan work.', status: 'running', is_incumbent: true },
      { name: 'Julie Slomski', party: 'democrat', bio: 'Erie County government official and community development advocate.', status: 'running' },
    ]
  },
  {
    name: 'Michigan State Senate District 28',
    slug: 'mi-state-senate-d28-2026',
    state: 'MI',
    chamber: 'state_senate',
    district: '28',
    description: 'Swing district covering Kalamazoo and the surrounding area in southwest Michigan.',
    candidates: [
      { name: 'Sean McCann', party: 'democrat', bio: 'Incumbent state senator and former Kalamazoo city commissioner. Education and labor advocate.', status: 'running', is_incumbent: true },
      { name: 'Sarah Lightner', party: 'republican', bio: 'Former state representative from Jackson County. Agriculture and rural policy advocate.', status: 'running' },
    ]
  },
  {
    name: 'Virginia State Senate District 24',
    slug: 'va-state-senate-d24-2026',
    state: 'VA',
    chamber: 'state_senate',
    district: '24',
    description: 'Swing district in the Richmond suburbs. Key to Virginia Senate control.',
    candidates: [
      { name: 'Monty Mason', party: 'democrat', bio: 'Incumbent state senator from Williamsburg. Former delegate focused on education and veterans.', status: 'running', is_incumbent: true },
      { name: 'Danny Diggs', party: 'republican', bio: 'Former York County sheriff and law enforcement veteran.', status: 'running' },
    ]
  },
  {
    name: 'Nevada State Senate District 6',
    slug: 'nv-state-senate-d6-2026',
    state: 'NV',
    chamber: 'state_senate',
    district: '6',
    description: 'Competitive Las Vegas suburban district in Clark County.',
    candidates: [
      { name: 'Nicole Cannizzaro', party: 'democrat', bio: 'Senate Majority Leader and prosecutor. Focused on criminal justice and education funding.', status: 'running', is_incumbent: true },
      { name: 'April Becker', party: 'republican', bio: 'Attorney and 2022 congressional candidate. Focused on education choice and fiscal policy.', status: 'running' },
    ]
  },
  {
    name: 'Colorado State Senate District 25',
    slug: 'co-state-senate-d25-2026',
    state: 'CO',
    chamber: 'state_senate',
    district: '25',
    description: 'Swing district covering Colorado Springs suburbs and parts of El Paso County.',
    candidates: [
      { name: 'Candi CdeBaca', party: 'democrat', bio: 'Progressive organizer and housing advocate. First-time state senate candidate.', status: 'running' },
      { name: 'Mark Baisley', party: 'republican', bio: 'Incumbent state senator and technology executive. Fiscal conservative.', status: 'running', is_incumbent: true },
    ]
  },
  {
    name: 'Minnesota State Senate District 49',
    slug: 'mn-state-senate-d49-2026',
    state: 'MN',
    chamber: 'state_senate',
    district: '49',
    description: 'Competitive suburban Twin Cities seat in Dakota County.',
    candidates: [
      { name: 'Lindsey Port', party: 'democrat', bio: 'Incumbent state senator and former nonprofit executive. Focused on education and childcare.', status: 'running', is_incumbent: true },
      { name: 'Greg Copeland', party: 'republican', bio: 'Burnsville business owner and former city council member. Focused on public safety and taxes.', status: 'running' },
    ]
  },
  {
    name: 'Arizona State Senate District 16',
    slug: 'az-state-senate-d16-2026',
    state: 'AZ',
    chamber: 'state_senate',
    district: '16',
    description: 'Competitive Scottsdale-area district. Moderate Republican-leaning but trending competitive.',
    candidates: [
      { name: 'John Kavanagh', party: 'republican', bio: 'Incumbent state senator and former representative. Retired law enforcement. Focused on public safety.', status: 'running', is_incumbent: true },
      { name: 'Stacey Trasvina', party: 'democrat', bio: 'Scottsdale attorney and education advocate. Focused on water policy and reproductive rights.', status: 'running' },
    ]
  },
  {
    name: 'North Carolina State Senate District 9',
    slug: 'nc-state-senate-d9-2026',
    state: 'NC',
    chamber: 'state_senate',
    district: '9',
    description: 'Competitive Charlotte-area seat in Mecklenburg County.',
    candidates: [
      { name: 'Natasha Marcus', party: 'democrat', bio: 'Incumbent state senator and attorney. Focused on education funding and healthcare expansion.', status: 'running', is_incumbent: true },
      { name: 'Brian LiVecchi', party: 'republican', bio: 'Charlotte business consultant and former military officer.', status: 'running' },
    ]
  },
  {
    name: 'Georgia State Senate District 17',
    slug: 'ga-state-senate-d17-2026',
    state: 'GA',
    chamber: 'state_senate',
    district: '17',
    description: 'Competitive seat in suburban Cobb County west of Atlanta.',
    candidates: [
      { name: 'Sonya Halpern', party: 'democrat', bio: 'Incumbent state senator and community development executive. Focused on housing and healthcare.', status: 'running', is_incumbent: true },
      { name: 'Ed Lindsey', party: 'republican', bio: 'Former state representative and attorney. Moderate Republican with bipartisan record.', status: 'running' },
    ]
  },
  {
    name: 'Wisconsin State Senate District 30',
    slug: 'wi-state-senate-d30-2026',
    state: 'WI',
    chamber: 'state_senate',
    district: '30',
    description: 'Covers parts of Kenosha and Racine counties. Key suburban swing seat.',
    candidates: [
      { name: 'Tip McGuire', party: 'democrat', bio: 'State assemblymember seeking the senate seat. Attorney focused on worker rights and education.', status: 'running' },
      { name: 'Robert Wittke', party: 'republican', bio: 'Former state assemblymember and Racine County business owner.', status: 'running' },
    ]
  },

  // =========================================================================
  //  STATE HOUSE — 20 additional competitive districts
  // =========================================================================
  {
    name: 'California Assembly District 40',
    slug: 'ca-assembly-d40-2026',
    state: 'CA',
    chamber: 'state_house',
    district: '40',
    description: 'Competitive district in the Inland Empire covering parts of San Bernardino County.',
    candidates: [
      { name: 'Esmeralda Soria', party: 'democrat', bio: 'Incumbent assemblymember and former Fresno city council member. Housing and water advocate.', status: 'running', is_incumbent: true },
      { name: 'Drew Phelps', party: 'republican', bio: 'Small business owner and community volunteer. First-time candidate focused on affordability.', status: 'running' },
    ]
  },
  {
    name: 'California Assembly District 47',
    slug: 'ca-assembly-d47-2026',
    state: 'CA',
    chamber: 'state_house',
    district: '47',
    description: 'Palm Springs-area district. Recently competitive in special elections.',
    candidates: [
      { name: 'Greg Wallis', party: 'republican', bio: 'Incumbent assemblymember who won a competitive special election. Small business owner.', status: 'running', is_incumbent: true },
      { name: 'Christy Holstege', party: 'democrat', bio: 'Palm Springs mayor and attorney. LGBTQ+ advocate and housing policy leader.', status: 'running' },
    ]
  },
  {
    name: 'New York Assembly District 19',
    slug: 'ny-assembly-d19-2026',
    state: 'NY',
    chamber: 'state_house',
    district: '19',
    description: 'Competitive seat in the Hudson Valley covering parts of Orange County.',
    candidates: [
      { name: 'Karl Brabenec', party: 'republican', bio: 'Incumbent assemblymember from Deerpark. Focused on property taxes and local government.', status: 'running', is_incumbent: true },
      { name: 'Rachel Storch', party: 'democrat', bio: 'Orange County attorney and community organizer. Education and healthcare advocate.', status: 'running' },
    ]
  },
  {
    name: 'Texas House District 52',
    slug: 'tx-house-d52-2026',
    state: 'TX',
    chamber: 'state_house',
    district: '52',
    description: 'Williamson County-based district north of Austin. Suburban swing seat.',
    candidates: [
      { name: 'Caroline Harris', party: 'republican', bio: 'Incumbent state representative. Former Round Rock city council member.', status: 'running', is_incumbent: true },
      { name: 'Jen Ramos', party: 'democrat', bio: 'Williamson County educator and school board advocate. Focused on public education funding.', status: 'running' },
    ]
  },
  {
    name: 'Texas House District 108',
    slug: 'tx-house-d108-2026',
    state: 'TX',
    chamber: 'state_house',
    district: '108',
    description: 'Dallas-area district that has flipped between parties. Key suburban battleground.',
    candidates: [
      { name: 'Morgan Meyer', party: 'republican', bio: 'Incumbent state representative and attorney from Highland Park.', status: 'running', is_incumbent: true },
      { name: 'Elizabeth Ginsberg', party: 'democrat', bio: 'Dallas attorney and civic leader. Ran competitively in recent cycles.', status: 'running' },
    ]
  },
  {
    name: 'Florida House District 35',
    slug: 'fl-house-d35-2026',
    state: 'FL',
    chamber: 'state_house',
    district: '35',
    description: 'Competitive Orlando-area seat in Orange County.',
    candidates: [
      { name: 'Tom Keen', party: 'democrat', bio: 'Incumbent state representative. Army veteran and former intelligence officer.', status: 'running', is_incumbent: true },
      { name: 'Erika Booth', party: 'republican', bio: 'Former state representative seeking to reclaim the seat. Business consultant.', status: 'running' },
    ]
  },
  {
    name: 'Florida House District 45',
    slug: 'fl-house-d45-2026',
    state: 'FL',
    chamber: 'state_house',
    district: '45',
    description: 'Swing seat in Pinellas County (St. Petersburg area).',
    candidates: [
      { name: 'Jennifer Canady', party: 'republican', bio: 'Incumbent state representative and attorney. Focused on education and parental rights.', status: 'running', is_incumbent: true },
      { name: 'Brian Shea', party: 'democrat', bio: 'Pinellas County business owner and environmental advocate.', status: 'running' },
    ]
  },
  {
    name: 'Pennsylvania House District 144',
    slug: 'pa-house-d144-2026',
    state: 'PA',
    chamber: 'state_house',
    district: '144',
    description: 'Bucks County-based seat that has been central to PA House majority control.',
    candidates: [
      { name: 'Brian Munroe', party: 'democrat', bio: 'Incumbent state representative. Former prosecutor and community advocate.', status: 'running', is_incumbent: true },
      { name: 'Todd Polinchock', party: 'republican', bio: 'Former state representative seeking to reclaim the seat. Retired business executive.', status: 'running' },
    ]
  },
  {
    name: 'Pennsylvania House District 151',
    slug: 'pa-house-d151-2026',
    state: 'PA',
    chamber: 'state_house',
    district: '151',
    description: 'Montgomery County swing seat in the Philadelphia suburbs.',
    candidates: [
      { name: 'Melissa Cerrato', party: 'democrat', bio: 'Incumbent state representative and community activist. Focused on education and healthcare.', status: 'running', is_incumbent: true },
      { name: 'Donna Scheetz', party: 'republican', bio: 'Montgomery County businesswoman and former township commissioner.', status: 'running' },
    ]
  },
  {
    name: 'Ohio House District 48',
    slug: 'oh-house-d48-2026',
    state: 'OH',
    chamber: 'state_house',
    district: '48',
    description: 'Suburban Columbus district that has been competitive in recent cycles.',
    candidates: [
      { name: 'Cathy Cowan', party: 'democrat', bio: 'Community advocate and nonprofit executive. First-time candidate focused on education.', status: 'running' },
      { name: 'Brian Stewart', party: 'republican', bio: 'Incumbent state representative and attorney. Focused on economic development.', status: 'running', is_incumbent: true },
    ]
  },
  {
    name: 'Michigan House District 56',
    slug: 'mi-house-d56-2026',
    state: 'MI',
    chamber: 'state_house',
    district: '56',
    description: 'Competitive district in Kent County covering Grand Rapids suburbs.',
    candidates: [
      { name: 'Mike McFall', party: 'democrat', bio: 'Incumbent state representative and former educator. Focused on school funding and workforce development.', status: 'running', is_incumbent: true },
      { name: 'Jerry Kuiper', party: 'republican', bio: 'Kent County business owner and former planning commissioner.', status: 'running' },
    ]
  },
  {
    name: 'Michigan House District 62',
    slug: 'mi-house-d62-2026',
    state: 'MI',
    chamber: 'state_house',
    district: '62',
    description: 'Swing district in Saginaw County. Blue-collar bellwether seat.',
    candidates: [
      { name: 'Amos O\'Neal', party: 'democrat', bio: 'Incumbent state representative and former Saginaw city council member.', status: 'running', is_incumbent: true },
      { name: 'Sandra Peterson', party: 'republican', bio: 'Saginaw County small business owner and community volunteer.', status: 'running' },
    ]
  },
  {
    name: 'Wisconsin Assembly District 23',
    slug: 'wi-assembly-d23-2026',
    state: 'WI',
    chamber: 'state_house',
    district: '23',
    description: 'Suburban Milwaukee district that has swung in recent elections.',
    candidates: [
      { name: 'Deb Andraca', party: 'democrat', bio: 'Incumbent state representative and environmental advocate from Whitefish Bay.', status: 'running', is_incumbent: true },
      { name: 'Chad Weininger', party: 'republican', bio: 'Former Assembly chief of staff seeking to win back the seat.', status: 'running' },
    ]
  },
  {
    name: 'North Carolina House District 105',
    slug: 'nc-house-d105-2026',
    state: 'NC',
    chamber: 'state_house',
    district: '105',
    description: 'Competitive Mecklenburg County seat in Charlotte. Key to NC House supermajority.',
    candidates: [
      { name: 'Wesley Harris', party: 'democrat', bio: 'Incumbent state representative and business consultant. Focused on education and healthcare.', status: 'running', is_incumbent: true },
      { name: 'Linda Carson', party: 'republican', bio: 'Charlotte business owner and former school board member.', status: 'running' },
    ]
  },
  {
    name: 'Georgia House District 52',
    slug: 'ga-house-d52-2026',
    state: 'GA',
    chamber: 'state_house',
    district: '52',
    description: 'Competitive suburban Atlanta seat in east Cobb County.',
    candidates: [
      { name: 'Shelly Hutchinson', party: 'democrat', bio: 'Incumbent state representative and education advocate. Former Army officer.', status: 'running', is_incumbent: true },
      { name: 'Deborah Silcox', party: 'republican', bio: 'Former state representative seeking to reclaim the seat. Business consultant.', status: 'running' },
    ]
  },
  {
    name: 'Arizona House District 2',
    slug: 'az-house-d2-2026',
    state: 'AZ',
    chamber: 'state_house',
    district: '2',
    description: 'Competitive Tucson-area district with two seats (multi-member district).',
    candidates: [
      { name: 'Andrea Dalessandro', party: 'democrat', bio: 'Former state senator seeking a house seat. Education and border community advocate.', status: 'running' },
      { name: 'Kirsten Engel', party: 'democrat', bio: 'Environmental law professor and former congressional candidate.', status: 'running' },
      { name: 'Mark Finchem', party: 'republican', bio: 'Former state representative and 2022 Secretary of State candidate.', status: 'running' },
    ]
  },
  {
    name: 'Colorado House District 43',
    slug: 'co-house-d43-2026',
    state: 'CO',
    chamber: 'state_house',
    district: '43',
    description: 'Swing district in Arapahoe County south of Denver.',
    candidates: [
      { name: 'Bob Marshall', party: 'democrat', bio: 'Incumbent state representative and former Highlands Ranch community leader.', status: 'running', is_incumbent: true },
      { name: 'Teresa Coen', party: 'republican', bio: 'Arapahoe County attorney and education advocate.', status: 'running' },
    ]
  },
  {
    name: 'Virginia House District 57',
    slug: 'va-house-d57-2026',
    state: 'VA',
    chamber: 'state_house',
    district: '57',
    description: 'Competitive Hampton Roads-area seat. Key to Virginia House majority.',
    candidates: [
      { name: 'Karen Greenhalgh', party: 'republican', bio: 'Incumbent delegate and Virginia Beach attorney.', status: 'running', is_incumbent: true },
      { name: 'Phil Hernandez', party: 'democrat', bio: 'Former delegate and Navy veteran. Running to reclaim the seat.', status: 'running' },
    ]
  },
  {
    name: 'Nevada Assembly District 34',
    slug: 'nv-assembly-d34-2026',
    state: 'NV',
    chamber: 'state_house',
    district: '34',
    description: 'Competitive Las Vegas suburban district in Clark County.',
    candidates: [
      { name: 'Shannon Bilbray-Axelrod', party: 'democrat', bio: 'Incumbent assemblymember. Member of the Bilbray political family. Education advocate.', status: 'running', is_incumbent: true },
      { name: 'Tony Grady', party: 'republican', bio: 'Clark County business owner and veterans advocate. Former military.', status: 'running' },
    ]
  },

  // =========================================================================
  //  COUNTY RACES — 10 additional major metro areas
  // =========================================================================
  {
    name: 'Cook County Board President',
    slug: 'cook-county-president-2026',
    state: 'IL',
    chamber: 'county',
    district: null,
    description: 'Second-most-populous county in the US (Chicago metro). Major government with healthcare and criminal justice responsibilities.',
    candidates: [
      { name: 'Toni Preckwinkle', party: 'democrat', bio: 'Incumbent county board president since 2010. Former Chicago alderman and teacher. Focused on criminal justice reform.', status: 'running', is_incumbent: true },
      { name: 'Brandon Johnson', party: 'democrat', bio: 'Potential challenger focusing on county services and healthcare access.', status: 'exploring' },
    ]
  },
  {
    name: 'Miami-Dade County Mayor',
    slug: 'miami-dade-mayor-2026',
    state: 'FL',
    chamber: 'county',
    district: null,
    description: 'Most populous county in Florida with over 2.7 million residents. Strong mayor system.',
    candidates: [
      { name: 'Daniella Levine Cava', party: 'democrat', bio: 'Incumbent county mayor since 2020. Former commissioner focused on climate resilience and affordable housing.', status: 'running', is_incumbent: true },
      { name: 'Kevin Marino Cabrera', party: 'republican', bio: 'Former county commissioner and political strategist.', status: 'exploring' },
    ]
  },
  {
    name: 'Hennepin County Commissioner District 4',
    slug: 'hennepin-county-d4-2026',
    state: 'MN',
    chamber: 'county',
    district: '4',
    description: 'Hennepin County encompasses Minneapolis and is the most populous county in Minnesota.',
    candidates: [
      { name: 'Angela Conley', party: 'democrat', bio: 'Incumbent commissioner focused on racial equity and criminal justice reform.', status: 'running', is_incumbent: true },
      { name: 'Paul Anderson', party: 'republican', bio: 'Minneapolis business owner and public safety advocate.', status: 'running' },
    ]
  },
  {
    name: 'Fulton County Commission Chair',
    slug: 'fulton-county-chair-2026',
    state: 'GA',
    chamber: 'county',
    district: null,
    description: 'Fulton County encompasses most of Atlanta. Gained national attention for election administration.',
    candidates: [
      { name: 'Robb Pitts', party: 'democrat', bio: 'Incumbent commission chair since 2018. Veteran politician and former Atlanta city council member.', status: 'running', is_incumbent: true },
      { name: 'Bridget Thorne', party: 'republican', bio: 'Fulton County commissioner from north Fulton. Small government advocate.', status: 'running' },
    ]
  },
  {
    name: 'San Bernardino County Supervisor District 2',
    slug: 'san-bernardino-county-d2-2026',
    state: 'CA',
    chamber: 'county',
    district: '2',
    description: 'Largest county by area in the contiguous US. Fast-growing Inland Empire region.',
    candidates: [
      { name: 'Jesse Armendarez', party: 'republican', bio: 'Incumbent supervisor and former Fontana city council member. Business-friendly governance advocate.', status: 'running', is_incumbent: true },
      { name: 'Nadia Renner', party: 'democrat', bio: 'Community health worker and housing advocate in the Inland Empire.', status: 'running' },
    ]
  },
  {
    name: 'Clark County Commission District C',
    slug: 'clark-county-dc-2026',
    state: 'NV',
    chamber: 'county',
    district: 'C',
    description: 'Clark County encompasses the Las Vegas metro. Most populous county in Nevada.',
    candidates: [
      { name: 'Justin Jones', party: 'democrat', bio: 'Incumbent commissioner focused on infrastructure and responsible growth.', status: 'running', is_incumbent: true },
      { name: 'Tisha Black', party: 'republican', bio: 'Attorney and businesswoman. Focused on fiscal responsibility and water policy.', status: 'running' },
    ]
  },
  {
    name: 'Harris County Judge',
    slug: 'harris-county-judge-2026',
    state: 'TX',
    chamber: 'county',
    district: null,
    description: 'Most populous county in Texas (Houston metro). County judge serves as chief executive.',
    candidates: [
      { name: 'Lina Hidalgo', party: 'democrat', bio: 'Incumbent county judge since 2018. Youngest person to hold the position. Focused on flood control and public health.', status: 'running', is_incumbent: true },
      { name: 'Alexandra del Moral Mealer', party: 'republican', bio: 'West Point graduate, Army veteran, and attorney. Ran competitively in 2022.', status: 'running' },
    ]
  },
  {
    name: 'King County Executive',
    slug: 'king-county-exec-2026',
    state: 'WA',
    chamber: 'county',
    district: null,
    description: 'King County encompasses Seattle and is the most populous county in Washington.',
    candidates: [
      { name: 'Dow Constantine', party: 'democrat', bio: 'Incumbent county executive since 2009. Longest-serving county executive in King County history.', status: 'running', is_incumbent: true },
      { name: 'Brenda Stonecipher', party: 'republican', bio: 'Business owner and former Issaquah city council member. Government accountability advocate.', status: 'running' },
    ]
  },
  {
    name: 'Allegheny County Executive',
    slug: 'allegheny-county-exec-2026',
    state: 'PA',
    chamber: 'county',
    district: null,
    description: 'Allegheny County encompasses Pittsburgh. Second-most-populous county in Pennsylvania.',
    candidates: [
      { name: 'Sara Innamorato', party: 'democrat', bio: 'Incumbent county executive since 2024. Former state representative and progressive policy advocate.', status: 'running', is_incumbent: true },
      { name: 'Joe Rockey', party: 'republican', bio: 'Allegheny County business owner and former township commissioner.', status: 'running' },
    ]
  },
  {
    name: 'Cuyahoga County Executive',
    slug: 'cuyahoga-county-exec-2026',
    state: 'OH',
    chamber: 'county',
    district: null,
    description: 'Cuyahoga County encompasses Cleveland. Most populous county in Ohio.',
    candidates: [
      { name: 'Chris Ronayne', party: 'democrat', bio: 'Incumbent county executive since 2023. Former Cleveland city planning director focused on lakefront development.', status: 'running', is_incumbent: true },
      { name: 'Lee Weingart', party: 'republican', bio: 'Former county Republican Party chair and business consultant.', status: 'running' },
    ]
  },

  // =========================================================================
  //  SCHOOL BOARD RACES — 10 additional major districts
  // =========================================================================
  {
    name: 'New York City Schools Chancellor Advisory Panel',
    slug: 'nyc-schools-panel-2026',
    state: 'NY',
    chamber: 'school_board',
    district: null,
    description: 'NYC has the largest school system in the US with 1.1 million students. Advisory panel election for community input.',
    candidates: [
      { name: 'Judith Harrison', party: 'democrat', bio: 'Parent advocate and education nonprofit director. Focused on literacy and special education.', status: 'running' },
      { name: 'Marcus Young', party: 'democrat', bio: 'Former teacher and community organizer in the Bronx. Equity and school funding advocate.', status: 'running' },
      { name: 'Patricia Russo', party: 'republican', bio: 'Staten Island parent and school choice advocate. Focused on curriculum transparency.', status: 'running' },
    ]
  },
  {
    name: 'Chicago Board of Education District 5',
    slug: 'chicago-school-d5-2026',
    state: 'IL',
    chamber: 'school_board',
    district: '5',
    description: 'Chicago recently transitioned to an elected school board. Third-largest district in the US.',
    candidates: [
      { name: 'Karin Norington-Reaves', party: 'democrat', bio: 'Workforce development executive and education equity advocate. Inaugural board member.', status: 'running', is_incumbent: true },
      { name: 'Patrick Wynn', party: 'republican', bio: 'Chicago parent and fiscal accountability advocate. Focused on school budgets and transparency.', status: 'running' },
    ]
  },
  {
    name: 'Houston ISD Board District III',
    slug: 'houston-isd-d3-2026',
    state: 'TX',
    chamber: 'school_board',
    district: '3',
    description: 'Houston ISD is the largest district in Texas with over 194,000 students. Currently under state management.',
    candidates: [
      { name: 'Dani Hernandez', party: 'democrat', bio: 'Education advocate and community organizer fighting to restore local control of HISD.', status: 'running' },
      { name: 'Janette Garza Lindner', party: 'democrat', bio: 'Former HISD board member and education attorney. Focused on community schools.', status: 'running' },
      { name: 'Kendall Baker', party: 'republican', bio: 'Houston parent and charter school advocate. Focused on school choice and accountability.', status: 'running' },
    ]
  },
  {
    name: 'Miami-Dade School Board District 2',
    slug: 'miami-dade-school-d2-2026',
    state: 'FL',
    chamber: 'school_board',
    district: '2',
    description: 'Fourth-largest school district in the US with over 334,000 students.',
    candidates: [
      { name: 'Danny Espino', party: 'republican', bio: 'Incumbent board member and attorney. Focused on parental rights and school safety.', status: 'running', is_incumbent: true },
      { name: 'Marisol Zenteno', party: 'democrat', bio: 'Miami parent and education equity advocate. Former PTA president.', status: 'running' },
    ]
  },
  {
    name: 'San Diego Unified School Board District D',
    slug: 'sd-unified-school-dd-2026',
    state: 'CA',
    chamber: 'school_board',
    district: 'D',
    description: 'Second-largest school district in California with over 121,000 students.',
    candidates: [
      { name: 'Cody Petterson', party: 'democrat', bio: 'Incumbent board member and environmental attorney. Focused on climate education and school facilities.', status: 'running', is_incumbent: true },
      { name: 'Becca Williams', party: 'republican', bio: 'San Diego parent and education consultant. Focused on academic standards and transparency.', status: 'running' },
    ]
  },
  {
    name: 'Denver Public Schools Board District 3',
    slug: 'denver-school-d3-2026',
    state: 'CO',
    chamber: 'school_board',
    district: '3',
    description: 'Denver Public Schools serves over 90,000 students. Nonpartisan election.',
    candidates: [
      { name: 'Scott Esserman', party: 'democrat', bio: 'Incumbent board member and attorney. Focused on teacher retention and school funding.', status: 'running', is_incumbent: true },
      { name: 'Mariana Sandoval', party: 'independent', bio: 'Denver parent and nonprofit director. Focused on bilingual education and family engagement.', status: 'running' },
    ]
  },
  {
    name: 'Philadelphia School Board District 5',
    slug: 'philly-school-d5-2026',
    state: 'PA',
    chamber: 'school_board',
    district: '5',
    description: 'Philadelphia recently transitioned to a partially elected school board. Seventh-largest district in the US.',
    candidates: [
      { name: 'Lisa Salley', party: 'democrat', bio: 'Education advocate and former teacher. Running in the first elected board race in decades.', status: 'running' },
      { name: 'James Williams', party: 'democrat', bio: 'Philadelphia community leader and youth program director.', status: 'running' },
      { name: 'Maria Torres', party: 'independent', bio: 'Parent organizer and bilingual education advocate in North Philadelphia.', status: 'running' },
    ]
  },
  {
    name: 'Atlanta Public Schools Board District 6',
    slug: 'atlanta-school-d6-2026',
    state: 'GA',
    chamber: 'school_board',
    district: '6',
    description: 'Atlanta Public Schools serves about 52,000 students. Nonpartisan election.',
    candidates: [
      { name: 'Eshe Collins', party: 'democrat', bio: 'Incumbent board member and former Teach for America corps member. Education equity advocate.', status: 'running', is_incumbent: true },
      { name: 'Terrance Brooks', party: 'democrat', bio: 'Atlanta parent and community development professional.', status: 'running' },
    ]
  },
  {
    name: 'Minneapolis Public Schools Board At-Large',
    slug: 'minneapolis-school-atlarge-2026',
    state: 'MN',
    chamber: 'school_board',
    district: null,
    description: 'Minneapolis Public Schools serves about 36,000 students. At-large seat represents the entire district.',
    candidates: [
      { name: 'Collin Beachy', party: 'democrat', bio: 'Incumbent board member and nonprofit leader. Focused on closing achievement gaps.', status: 'running', is_incumbent: true },
      { name: 'Roxanne Samuelson', party: 'independent', bio: 'Minneapolis parent and community health advocate. Focused on mental health services in schools.', status: 'running' },
    ]
  },
  {
    name: 'Charlotte-Mecklenburg School Board District 3',
    slug: 'cms-school-d3-2026',
    state: 'NC',
    chamber: 'school_board',
    district: '3',
    description: 'Charlotte-Mecklenburg Schools is the largest district in the Carolinas with over 140,000 students.',
    candidates: [
      { name: 'Dee Rankin', party: 'democrat', bio: 'Incumbent board member and former teacher. Focused on school safety and teacher pay.', status: 'running', is_incumbent: true },
      { name: 'George Thomas', party: 'republican', bio: 'Charlotte parent and business analyst. School choice and fiscal accountability advocate.', status: 'running' },
      { name: 'Angela Rivera', party: 'independent', bio: 'Bilingual educator and immigrant community advocate. Focused on English language learner programs.', status: 'running' },
    ]
  },
]

// ---------------------------------------------------------------------------
// 3. Upsert logic
// ---------------------------------------------------------------------------
const BATCH_SIZE = 25

async function main() {
  const electionId = await ensureElection()
  console.log(`Using election ID: ${electionId}`)

  let racesUpserted = 0
  let candidatesUpserted = 0

  // Process races in batches
  for (let i = 0; i < RACES.length; i += BATCH_SIZE) {
    const batch = RACES.slice(i, i + BATCH_SIZE)

    // Upsert races
    const raceRows = batch.map(r => ({
      election_id: electionId,
      name: r.name,
      slug: r.slug,
      state: r.state,
      chamber: r.chamber,
      district: r.district || null,
      description: r.description,
    }))

    const { data: upsertedRaces, error: raceError } = await supabase
      .from('races')
      .upsert(raceRows, { onConflict: 'slug' })
      .select('id, slug')

    if (raceError) {
      console.error(`Race upsert error (batch ${i}):`, raceError.message)
      continue
    }

    racesUpserted += upsertedRaces.length
    console.log(`  Upserted ${upsertedRaces.length} races (batch ${Math.floor(i / BATCH_SIZE) + 1})`)

    // Build slug -> id map
    const slugToId = {}
    for (const r of upsertedRaces) slugToId[r.slug] = r.id

    // Upsert candidates for this batch
    const candidateRows = []
    for (const race of batch) {
      const raceId = slugToId[race.slug]
      if (!raceId) {
        console.warn(`  Warning: no race ID for ${race.slug}, skipping candidates`)
        continue
      }
      for (const c of race.candidates) {
        candidateRows.push({
          race_id: raceId,
          name: c.name,
          party: c.party,
          bio: c.bio,
          status: c.status,
          is_incumbent: c.is_incumbent || false,
        })
      }
    }

    if (candidateRows.length === 0) continue

    // Delete existing candidates for these races, then insert fresh
    const raceIds = Object.values(slugToId)
    const { error: deleteError } = await supabase
      .from('candidates')
      .delete()
      .in('race_id', raceIds)

    if (deleteError) {
      console.error(`  Candidate delete error:`, deleteError.message)
    }

    const { data: insertedCandidates, error: candError } = await supabase
      .from('candidates')
      .insert(candidateRows)
      .select('id')

    if (candError) {
      console.error(`  Candidate insert error:`, candError.message)
    } else {
      candidatesUpserted += insertedCandidates.length
      console.log(`  Inserted ${insertedCandidates.length} candidates`)
    }
  }

  console.log(`\n=== Summary ===`)
  console.log(`Races upserted:      ${racesUpserted}`)
  console.log(`Candidates inserted: ${candidatesUpserted}`)
  console.log(`Total race types:`)

  const typeCounts = {}
  for (const r of RACES) {
    typeCounts[r.chamber] = (typeCounts[r.chamber] || 0) + 1
  }
  for (const [type, count] of Object.entries(typeCounts).sort()) {
    console.log(`  ${type}: ${count}`)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
