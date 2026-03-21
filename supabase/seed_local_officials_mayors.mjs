import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

const MAYORS = [
  { name: 'Eric Adams', city: 'New York City', state: 'NY', party: 'democrat', bio: 'Mayor of New York City since 2022. Former Brooklyn Borough President and retired NYPD captain who campaigned on public safety and economic recovery.' },
  { name: 'Karen Bass', city: 'Los Angeles', state: 'CA', party: 'democrat', bio: 'Mayor of Los Angeles since 2022. Former U.S. Representative and California Assembly Speaker, focused on addressing homelessness and housing affordability.' },
  { name: 'Brandon Johnson', city: 'Chicago', state: 'IL', party: 'democrat', bio: 'Mayor of Chicago since 2023. Former Cook County Commissioner and community organizer focused on equity, public safety, and education investment.' },
  { name: 'John Whitmire', city: 'Houston', state: 'TX', party: 'democrat', bio: 'Mayor of Houston since 2024. Longtime Texas State Senator who served over 40 years in the legislature, focused on public safety and infrastructure.' },
  { name: 'Cherelle Parker', city: 'Philadelphia', state: 'PA', party: 'democrat', bio: 'Mayor of Philadelphia since 2024. Former state representative and city council member, the first woman elected mayor of Philadelphia.' },
  { name: 'Ron Nirenberg', city: 'San Antonio', state: 'TX', party: 'independent', bio: 'Mayor of San Antonio since 2017. Former city council member focused on infrastructure, climate action, and economic development.' },
  { name: 'Todd Gloria', city: 'San Diego', state: 'CA', party: 'democrat', bio: 'Mayor of San Diego since 2020. Former state assemblymember and city council member, the first person of color and first openly gay person to serve as mayor of San Diego.' },
  { name: 'Mike Coffman', city: 'Aurora', state: 'CO', party: 'republican', bio: 'Mayor of Aurora, Colorado since 2023. Former U.S. Representative and combat veteran who served in the Army, Marines, and National Guard.' },
  { name: 'Andre Dickens', city: 'Atlanta', state: 'GA', party: 'democrat', bio: 'Mayor of Atlanta since 2022. Former city council member and nonprofit leader focused on affordable housing, public safety, and economic mobility.' },
  { name: 'Justin Bibb', city: 'Cleveland', state: 'OH', party: 'democrat', bio: 'Mayor of Cleveland since 2022. Former nonprofit executive and youngest mayor in Cleveland history, focused on economic development and neighborhood revitalization.' },
  { name: 'Bruce Harrell', city: 'Seattle', state: 'WA', party: 'democrat', bio: 'Mayor of Seattle since 2022. Former city council president focused on public safety, homelessness, and equitable economic growth.' },
  { name: 'Ted Wheeler', city: 'Portland', state: 'OR', party: 'democrat', bio: 'Mayor of Portland since 2017. Former state treasurer who has navigated the city through protests, homelessness challenges, and government reform.' },
  { name: 'Quinton Lucas', city: 'Kansas City', state: 'MO', party: 'democrat', bio: 'Mayor of Kansas City since 2019. Former city council member and attorney focused on affordable housing, gun violence prevention, and economic inclusion.' },
  { name: 'Mike Johnston', city: 'Denver', state: 'CO', party: 'democrat', bio: 'Mayor of Denver since 2023. Former state senator and education reformer focused on homelessness reduction, housing, and climate action.' },
  { name: 'Jane Castor', city: 'Tampa', state: 'FL', party: 'democrat', bio: 'Mayor of Tampa since 2019. Former Tampa police chief and the first openly LGBTQ person elected mayor of Tampa, focused on transportation and neighborhood investment.' },
  { name: 'Donna Deegan', city: 'Jacksonville', state: 'FL', party: 'democrat', bio: 'Mayor of Jacksonville since 2023. Former news anchor and nonprofit founder, the first woman elected mayor of Jacksonville.' },
  { name: 'Freddie O\'Connell', city: 'Nashville', state: 'TN', party: 'democrat', bio: 'Mayor of Nashville since 2023. Former city council member focused on affordable housing, transportation, and managing rapid urban growth.' },
  { name: 'Craig Greenberg', city: 'Louisville', state: 'KY', party: 'democrat', bio: 'Mayor of Louisville since 2023. Former business executive focused on public safety, economic development, and government accountability.' },
  { name: 'Cavalier Johnson', city: 'Milwaukee', state: 'WI', party: 'democrat', bio: 'Mayor of Milwaukee since 2022. Former city council president and the first Black mayor elected in Milwaukee, focused on reducing gun violence and neighborhood investment.' },
  { name: 'Jacob Frey', city: 'Minneapolis', state: 'MN', party: 'democrat', bio: 'Mayor of Minneapolis since 2018. Former city council member and civil rights attorney focused on housing, public safety reform, and economic equity.' },
  { name: 'Vi Lyles', city: 'Charlotte', state: 'NC', party: 'democrat', bio: 'Mayor of Charlotte since 2017. Former city council member and the first Black woman to serve as mayor of Charlotte, focused on affordable housing and economic mobility.' },
  { name: 'Francis Suarez', city: 'Miami', state: 'FL', party: 'republican', bio: 'Mayor of Miami since 2017. Former city commissioner who has positioned Miami as a tech and crypto hub, focused on innovation and economic growth.' },
  { name: 'Ken Welch', city: 'St. Petersburg', state: 'FL', party: 'democrat', bio: 'Mayor of St. Petersburg since 2022. Former Pinellas County commissioner and the first Black mayor of St. Petersburg, focused on equity and sustainable growth.' },
  { name: 'Mattie Parker', city: 'Fort Worth', state: 'TX', party: 'republican', bio: 'Mayor of Fort Worth since 2021. One of the youngest big-city mayors in the country, focused on public safety, infrastructure, and economic development.' },
  { name: 'David Holt', city: 'Oklahoma City', state: 'OK', party: 'republican', bio: 'Mayor of Oklahoma City since 2018. Former state senator focused on infrastructure investment, economic development, and quality of life improvements.' },
  { name: 'Kate Gallego', city: 'Phoenix', state: 'AZ', party: 'democrat', bio: 'Mayor of Phoenix since 2019. Former city council member focused on water sustainability, transportation, and economic development in one of the fastest-growing U.S. cities.' },
  { name: 'Tim Keller', city: 'Albuquerque', state: 'NM', party: 'democrat', bio: 'Mayor of Albuquerque since 2017. Former state auditor and state senator focused on public safety, homelessness, and community-based solutions.' },
  { name: 'Aftab Pureval', city: 'Cincinnati', state: 'OH', party: 'democrat', bio: 'Mayor of Cincinnati since 2021. Former Hamilton County Clerk of Courts and the first Asian American mayor of Cincinnati, focused on economic growth and affordable housing.' },
  { name: 'Brett Smiley', city: 'Providence', state: 'RI', party: 'democrat', bio: 'Mayor of Providence since 2023. Former state director of administration focused on fiscal responsibility, education, and economic development.' },
  { name: 'Michelle Wu', city: 'Boston', state: 'MA', party: 'democrat', bio: 'Mayor of Boston since 2021. Former city council member and the first woman and first person of color elected mayor of Boston, focused on climate action and housing.' },
  { name: 'Muriel Bowser', city: 'Washington, D.C.', state: 'DC', party: 'democrat', bio: 'Mayor of Washington, D.C. since 2015. Serving her third term, she is focused on affordable housing, education, and public safety in the nation\'s capital.' },
  { name: 'Daniel Lurie', city: 'San Francisco', state: 'CA', party: 'democrat', bio: 'Mayor of San Francisco since 2025. Nonprofit leader and founder of Tipping Point Community, focused on addressing homelessness, public safety, and downtown revitalization.' },
  { name: 'Regina Romero', city: 'Tucson', state: 'AZ', party: 'democrat', bio: 'Mayor of Tucson since 2019. Former city council member and the first Latina mayor of Tucson, focused on climate action, water sustainability, and social equity.' },
  { name: 'Sylvester Turner', city: 'Houston (former)', state: 'TX', party: 'democrat', bio: 'Note: Served as Mayor of Houston 2016-2024. Longtime state representative who led the city through Hurricane Harvey and focused on equity and resilience.' },
  { name: 'Indya Kincannon', city: 'Knoxville', state: 'TN', party: 'democrat', bio: 'Mayor of Knoxville since 2019. Former school board member focused on neighborhood investment, sustainability, and community engagement.' },
  { name: 'Satya Rhodes-Conway', city: 'Madison', state: 'WI', party: 'democrat', bio: 'Mayor of Madison since 2019. Urban planner and sustainability advocate, the first openly LGBTQ mayor of Madison, focused on climate, transit, and housing.' },
  { name: 'Lenny Curry', city: 'Jacksonville (former)', state: 'FL', party: 'republican', bio: 'Note: Served as Mayor of Jacksonville 2015-2023. Former Florida Republican Party chairman focused on economic development and pension reform.' },
]

// Filter out former mayors (keep only current ones)
const currentMayors = MAYORS.filter(m => !m.city.includes('former'))

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
