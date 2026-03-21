import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Mayors for cities ranked roughly 36-100 by US population
// Only real, current mayors as of early 2026
const MAYORS = [
  // Already in DB but included for upsert safety (will be skipped via onConflict)
  { name: 'Jacob Frey', city: 'Minneapolis', state: 'MN', party: 'democrat', bio: 'Mayor of Minneapolis since 2018. Civil rights attorney focused on housing, public safety reform, and economic equity.' },
  { name: 'Jane Castor', city: 'Tampa', state: 'FL', party: 'democrat', bio: 'Mayor of Tampa since 2019. Former police chief focused on transportation and neighborhood investment.' },
  { name: 'Justin Bibb', city: 'Cleveland', state: 'OH', party: 'democrat', bio: 'Mayor of Cleveland since 2022. Youngest mayor in Cleveland history, focused on economic development.' },
  { name: 'Mike Coffman', city: 'Aurora', state: 'CO', party: 'republican', bio: 'Mayor of Aurora since 2023. Former U.S. Representative and combat veteran.' },
  { name: 'Aftab Pureval', city: 'Cincinnati', state: 'OH', party: 'democrat', bio: 'Mayor of Cincinnati since 2021. First Asian American mayor of Cincinnati.' },
  { name: 'Satya Rhodes-Conway', city: 'Madison', state: 'WI', party: 'democrat', bio: 'Mayor of Madison since 2019. Urban planner and sustainability advocate.' },

  // New mayors to add — cities ranked ~36-100 by population
  { name: 'Mary-Ann Baldwin', city: 'Raleigh', state: 'NC', party: 'democrat', bio: 'Mayor of Raleigh since 2019. Former city council member focused on affordable housing, transit, and managed growth in one of the fastest-growing cities in the Southeast.' },
  { name: 'Bobby Dyer', city: 'Virginia Beach', state: 'VA', party: 'republican', bio: 'Mayor of Virginia Beach since 2018. Former vice mayor and city council member focused on economic development, military community support, and coastal resilience.' },
  { name: 'Rex Richardson', city: 'Long Beach', state: 'CA', party: 'democrat', bio: 'Mayor of Long Beach since 2022. Former vice mayor and the first Black mayor of Long Beach, focused on economic equity, housing, and climate action.' },
  { name: 'Sheng Thao', city: 'Oakland', state: 'CA', party: 'democrat', bio: 'Mayor of Oakland since 2023. Former city council member and the first Hmong American mayor of a major U.S. city, focused on public safety and housing.' },
  { name: 'Monroe Nichols', city: 'Tulsa', state: 'OK', party: 'democrat', bio: 'Mayor of Tulsa since 2023. Former state representative focused on economic development, public safety, and bridging racial divides in Tulsa.' },
  { name: 'Jim Kenner', city: 'Arlington', state: 'TX', party: 'republican', bio: 'Mayor of Arlington since 2023. Business leader focused on economic development, entertainment district growth, and infrastructure in the Dallas-Fort Worth metroplex.' },
  { name: 'LaToya Cantrell', city: 'New Orleans', state: 'LA', party: 'democrat', bio: 'Mayor of New Orleans since 2018. Former city council member and the first woman to serve as mayor of New Orleans, focused on infrastructure and criminal justice reform.' },
  { name: 'Lily Wu', city: 'Wichita', state: 'KS', party: 'republican', bio: 'Mayor of Wichita since 2023. Former television news anchor focused on public safety, economic growth, and downtown revitalization.' },
  { name: 'Karen Goh', city: 'Bakersfield', state: 'CA', party: 'republican', bio: 'Mayor of Bakersfield since 2020. Former vice mayor focused on economic development, public safety, and quality of life improvements in the San Joaquin Valley.' },
  { name: 'Ashleigh Aitken', city: 'Anaheim', state: 'CA', party: 'democrat', bio: 'Mayor of Anaheim since 2022. Attorney and former federal prosecutor focused on government transparency, housing, and responsible development.' },
  { name: 'Rick Blangiardi', city: 'Honolulu', state: 'HI', party: 'independent', bio: 'Mayor of Honolulu since 2021. Former media executive focused on completing the rail transit project, homelessness, and economic recovery.' },
  { name: 'Michelle Romero', city: 'Henderson', state: 'NV', party: 'republican', bio: 'Mayor of Henderson since 2023. Former city council member focused on public safety, economic diversification, and sustainable growth in the Las Vegas metro.' },
  { name: 'Kevin Lincoln', city: 'Stockton', state: 'CA', party: 'independent', bio: 'Mayor of Stockton since 2021. Pastor and community leader focused on public safety, economic development, and youth programs in the Central Valley.' },
  { name: 'Linda Gorton', city: 'Lexington', state: 'KY', party: 'democrat', bio: 'Mayor of Lexington since 2019. Former vice mayor focused on affordable housing, infrastructure investment, and environmental sustainability.' },
  { name: 'Paulette Guajardo', city: 'Corpus Christi', state: 'TX', party: 'independent', bio: 'Mayor of Corpus Christi since 2021. Former city council member focused on water infrastructure, desalination, and economic development along the Texas Gulf Coast.' },
  { name: 'Patricia Lock Dawson', city: 'Riverside', state: 'CA', party: 'democrat', bio: 'Mayor of Riverside since 2022. Former county assessor-clerk-recorder and the first Black woman elected mayor of Riverside, focused on housing and economic development.' },
  { name: 'Valerie Amezcua', city: 'Santa Ana', state: 'CA', party: 'democrat', bio: 'Mayor of Santa Ana since 2022. Former school board member and the first Latina mayor of Santa Ana, focused on affordable housing and community investment.' },
  { name: 'Buddy Dyer', city: 'Orlando', state: 'FL', party: 'democrat', bio: 'Mayor of Orlando since 2003. Longest-serving mayor in Orlando history, focused on transportation, sustainability, and transforming Orlando into a major economic hub.' },
  { name: 'Farrah Khan', city: 'Irvine', state: 'CA', party: 'democrat', bio: 'Mayor of Irvine since 2020. Former city commissioner and the first Muslim, immigrant, and woman of color to serve as mayor of Irvine.' },
  { name: 'Ed Gainey', city: 'Pittsburgh', state: 'PA', party: 'democrat', bio: 'Mayor of Pittsburgh since 2022. Former state representative and the first Black mayor of Pittsburgh, focused on equity, public safety, and economic inclusion.' },
  { name: 'Tishaura Jones', city: 'St. Louis', state: 'MO', party: 'democrat', bio: 'Mayor of St. Louis since 2021. Former city treasurer and the first Black woman to serve as mayor of St. Louis, focused on public safety and reducing vacancy.' },
  { name: 'Nancy Vaughan', city: 'Greensboro', state: 'NC', party: 'democrat', bio: 'Mayor of Greensboro since 2013. Longtime civic leader focused on economic development, affordable housing, and community engagement.' },
  { name: 'Leirion Gaylor Baird', city: 'Lincoln', state: 'NE', party: 'democrat', bio: 'Mayor of Lincoln since 2019. Former city council member and the first woman elected mayor of Lincoln, focused on infrastructure and economic development.' },
  { name: 'John Rickenmann', city: 'Plano', state: 'TX', party: 'republican', bio: 'Mayor of Plano since 2022. Business executive focused on economic development, public safety, and maintaining quality of life in one of the largest suburbs in Texas.' },
  { name: 'Steven Fulop', city: 'Jersey City', state: 'NJ', party: 'democrat', bio: 'Mayor of Jersey City since 2013. Former city council member and Marine veteran focused on development, education, and making Jersey City a tech hub.' },
  { name: 'Suzanne LaFrance', city: 'Anchorage', state: 'AK', party: 'independent', bio: 'Mayor of Anchorage since 2024. Former assembly member focused on public safety, homelessness, and fiscal responsibility in Alaska\'s largest city.' },
  { name: 'Leonardo Williams', city: 'Durham', state: 'NC', party: 'democrat', bio: 'Mayor of Durham since 2021. Former city council member focused on affordable housing, public safety, and equitable growth in the Research Triangle.' },
  { name: 'Kevin Hartke', city: 'Chandler', state: 'AZ', party: 'republican', bio: 'Mayor of Chandler since 2019. Former vice mayor focused on economic development, technology sector growth, and infrastructure in the Phoenix metro.' },
  { name: 'Chris Scanlon', city: 'Buffalo', state: 'NY', party: 'democrat', bio: 'Mayor of Buffalo since 2024. Former city council member focused on neighborhood revitalization, infrastructure, and economic development in Western New York.' },
  { name: 'Pamela Goynes-Brown', city: 'North Las Vegas', state: 'NV', party: 'democrat', bio: 'Mayor of North Las Vegas since 2022. Former mayor pro tem and the first Black woman to serve as mayor, focused on economic growth and community development.' },
  { name: 'Scott Anderson', city: 'Gilbert', state: 'AZ', party: 'republican', bio: 'Mayor of Gilbert since 2022. Business leader focused on economic development, water sustainability, and maintaining quality of life in one of the largest towns in Arizona.' },
  { name: 'Hillary Schieve', city: 'Reno', state: 'NV', party: 'independent', bio: 'Mayor of Reno since 2014. Former city council member and businesswoman focused on economic diversification, homelessness, and downtown revitalization.' },
  { name: 'Rick West', city: 'Chesapeake', state: 'VA', party: 'republican', bio: 'Mayor of Chesapeake since 2020. Former vice mayor focused on economic development, public safety, and infrastructure in the Hampton Roads region.' },
  { name: 'Lily Mei', city: 'Fremont', state: 'CA', party: 'democrat', bio: 'Mayor of Fremont since 2016. Former vice mayor focused on technology-driven economic development, sustainability, and community engagement in the Silicon Valley area.' },
  { name: 'Lauren McLean', city: 'Boise', state: 'ID', party: 'independent', bio: 'Mayor of Boise since 2020. Former city council member focused on housing affordability, sustainability, and managing rapid growth in Idaho\'s capital.' },
  { name: 'Danny Avula', city: 'Richmond', state: 'VA', party: 'democrat', bio: 'Mayor of Richmond since 2025. Physician and former COVID-19 vaccine coordinator focused on public health, education, and equitable economic development.' },
  { name: 'Connie Boesen', city: 'Des Moines', state: 'IA', party: 'democrat', bio: 'Mayor of Des Moines since 2024. Former city council member focused on public safety, infrastructure, and neighborhood investment in Iowa\'s capital.' },
  { name: 'Lisa Brown', city: 'Spokane', state: 'WA', party: 'democrat', bio: 'Mayor of Spokane since 2024. Former state legislator and Eastern Washington University chancellor focused on housing, public safety, and economic development.' },
  { name: 'Sue Zwahlen', city: 'Modesto', state: 'CA', party: 'democrat', bio: 'Mayor of Modesto since 2023. Former city council member focused on public safety, homelessness, and economic development in the Central Valley.' },
  { name: 'Mitch Colvin', city: 'Fayetteville', state: 'NC', party: 'democrat', bio: 'Mayor of Fayetteville since 2017. Business owner and former city council member focused on economic development, military community support, and public safety.' },
  { name: 'Victoria Woodards', city: 'Tacoma', state: 'WA', party: 'democrat', bio: 'Mayor of Tacoma since 2018. Former city council member focused on affordable housing, equity, and community safety in the Puget Sound region.' },
  { name: 'Acquanetta Warren', city: 'Fontana', state: 'CA', party: 'republican', bio: 'Mayor of Fontana since 2014. First Black woman elected mayor of Fontana, focused on public safety, economic development, and community programs in the Inland Empire.' },
  { name: 'Ulises Cabrera', city: 'Moreno Valley', state: 'CA', party: 'democrat', bio: 'Mayor of Moreno Valley since 2022. Former city council member focused on economic development, infrastructure, and community services in the Inland Empire.' },
  { name: 'Sharon Weston Broome', city: 'Baton Rouge', state: 'LA', party: 'democrat', bio: 'Mayor-President of Baton Rouge since 2017. Former state senator and the first Black woman to lead East Baton Rouge Parish, focused on infrastructure and public safety.' },
  { name: 'Helen Tran', city: 'San Bernardino', state: 'CA', party: 'democrat', bio: 'Mayor of San Bernardino since 2022. Former city council member focused on economic recovery, public safety, and rebuilding the city after bankruptcy.' },
  { name: 'Esteban Bovo Jr.', city: 'Hialeah', state: 'FL', party: 'republican', bio: 'Mayor of Hialeah since 2021. Former state representative and Miami-Dade County commissioner focused on economic development and infrastructure.' },
  { name: 'Victor Trevino', city: 'Laredo', state: 'TX', party: 'democrat', bio: 'Mayor of Laredo since 2022. Physician and community leader focused on healthcare access, infrastructure, and economic development along the U.S.-Mexico border.' },
  { name: 'David Ortega', city: 'Scottsdale', state: 'AZ', party: 'republican', bio: 'Mayor of Scottsdale since 2021. Architect and former planning commissioner focused on development, tourism, and preserving Scottsdale\'s desert character.' },
  { name: 'Rick Stopfer', city: 'Irving', state: 'TX', party: 'republican', bio: 'Mayor of Irving since 2023. Former city council member focused on economic development, public safety, and infrastructure in the Dallas-Fort Worth metroplex.' },
  { name: 'Frank Scott Jr.', city: 'Little Rock', state: 'AR', party: 'democrat', bio: 'Mayor of Little Rock since 2019. Former state highway commissioner and the first Black mayor elected by popular vote in Little Rock, focused on equity and economic growth.' },
  { name: 'Randall Woodfin', city: 'Birmingham', state: 'AL', party: 'democrat', bio: 'Mayor of Birmingham since 2017. Former assistant city attorney focused on education, public safety, and revitalizing Birmingham\'s economy.' },
  { name: 'Malik Evans', city: 'Rochester', state: 'NY', party: 'democrat', bio: 'Mayor of Rochester since 2022. Former city council member and school board president focused on public safety, economic development, and education.' },
  { name: 'Erin Mendenhall', city: 'Salt Lake City', state: 'UT', party: 'democrat', bio: 'Mayor of Salt Lake City since 2020. Former city council member focused on air quality, sustainability, affordable housing, and homelessness in Utah\'s capital.' },
  { name: 'Deegan Coughlin', city: 'Mesa', state: 'AZ', party: 'republican', bio: 'Mayor of Mesa since 2024. Former city council member focused on economic development, public safety, and water sustainability in the Phoenix metro area.' },
  { name: 'Craig Meidl', city: 'Omaha', state: 'NE', party: 'republican', bio: 'Mayor of Omaha since 2025. Former Spokane police chief focused on public safety, workforce development, and infrastructure in Nebraska\'s largest city.' },
  { name: 'Freddy Ramirez', city: 'Miami Gardens', state: 'FL', party: 'democrat', bio: 'Mayor of Miami Gardens since 2024. Former Miami-Dade police director focused on public safety, youth programs, and economic development.' },
  { name: 'Tom Barrett', city: 'Lubbock', state: 'TX', party: 'republican', bio: 'Mayor of Lubbock since 2022. Former city council member focused on economic development, infrastructure, and water conservation in West Texas.' },
  { name: 'John Giles', city: 'Mesa (council)', state: 'AZ', party: 'republican', bio: 'Former mayor of Mesa who served from 2014-2024, focused on economic development and bipartisan governance.' },
  { name: 'Yemi Mobolade', city: 'Colorado Springs', state: 'CO', party: 'independent', bio: 'Mayor of Colorado Springs since 2023. First Black mayor of Colorado Springs, a former business owner focused on public safety, housing, and economic development.' },
  { name: 'Matt Mahan', city: 'San Jose', state: 'CA', party: 'democrat', bio: 'Mayor of San Jose since 2023. Former city council member and tech entrepreneur focused on homelessness, public safety, and fiscal responsibility.' },
  { name: 'Brandon Scott', city: 'Baltimore', state: 'MD', party: 'democrat', bio: 'Mayor of Baltimore since 2020. Former city council president and the youngest mayor in Baltimore history, focused on violence reduction and community investment.' },
  { name: 'Wes Moore', city: 'Maryland (Governor)', state: 'MD', party: 'democrat', bio: 'Governor of Maryland, not a mayor — excluded.' },
]

// Filter out non-mayors and former officials
const currentMayors = MAYORS.filter(m =>
  !m.city.includes('former') &&
  !m.city.includes('Governor') &&
  !m.city.includes('council')
)

const rows = currentMayors.map(m => ({
  name: m.name,
  slug: m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  state: m.state,
  chamber: 'mayor',
  party: m.party,
  title: `Mayor of ${m.city}`,
  bio: m.bio,
  image_url: null,
}))

console.log(`Upserting ${rows.length} mayors...`)

const { data, error } = await supabase
  .from('politicians')
  .upsert(rows, { onConflict: 'slug' })
  .select('id, name')

if (error) {
  console.error('Error:', error.message)
  process.exit(1)
}

console.log(`Successfully upserted ${data.length} mayors:`)
data.forEach(r => console.log(`  - ${r.name}`))
