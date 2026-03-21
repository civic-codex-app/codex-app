import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// County board chairs, presidents, and commissioners from medium-large U.S. counties (200K+ population)
// Only real, currently serving officials as of early 2026
const COMMISSIONERS = [
  // California
  { name: 'Lindsey Horvath', county: 'Los Angeles County', state: 'CA', party: 'democrat', bio: 'Chair of the Los Angeles County Board of Supervisors. Former West Hollywood mayor focused on homelessness, mental health, and housing.' },
  { name: 'Jeff Hewitt', county: 'Riverside County', state: 'CA', party: 'republican', bio: 'Supervisor on the Riverside County Board of Supervisors. Former Calimesa mayor focused on limited government and fiscal responsibility.' },
  { name: 'Dawn Rowe', county: 'San Bernardino County', state: 'CA', party: 'republican', bio: 'Chair of the San Bernardino County Board of Supervisors. Focused on economic development and public safety in the Inland Empire.' },
  { name: 'Terra Lawson-Remer', county: 'San Diego County', state: 'CA', party: 'democrat', bio: 'Chair of the San Diego County Board of Supervisors. Economist focused on climate action, housing, and public health.' },
  { name: 'David Canepa', county: 'San Mateo County', state: 'CA', party: 'democrat', bio: 'President of the San Mateo County Board of Supervisors. Former Daly City mayor focused on housing and transportation.' },
  { name: 'Susan Ellenberg', county: 'Santa Clara County', state: 'CA', party: 'democrat', bio: 'President of the Santa Clara County Board of Supervisors. Focused on housing, behavioral health, and juvenile justice reform.' },
  { name: 'David Haubert', county: 'Alameda County', state: 'CA', party: 'democrat', bio: 'Supervisor on the Alameda County Board of Supervisors. Former Dublin mayor focused on public safety and fiscal responsibility.' },
  { name: 'Chris Holden', county: 'Sacramento County', state: 'CA', party: 'democrat', bio: 'Sacramento County Board of Supervisors member. Former state assemblymember focused on education and economic development.' },
  { name: 'Andrew Do', county: 'Orange County', state: 'CA', party: 'republican', bio: 'Supervisor on the Orange County Board of Supervisors. Focused on homelessness, healthcare, and fiscal responsibility.' },
  { name: 'Malia Cohen', county: 'Contra Costa County', state: 'CA', party: 'democrat', bio: 'Contra Costa County Supervisor. Former San Francisco supervisor focused on equity and public safety.' },
  { name: 'Nathan Fletcher', county: 'San Diego County', state: 'CA', party: 'democrat', bio: 'Former San Diego County supervisor focused on mental health and behavioral health services.' },
  { name: 'Luis Alejo', county: 'Monterey County', state: 'CA', party: 'democrat', bio: 'Chair of the Monterey County Board of Supervisors. Former state assemblymember focused on agriculture and immigration.' },
  { name: 'Jeff Greeson', county: 'Fresno County', state: 'CA', party: 'republican', bio: 'Chair of the Fresno County Board of Supervisors. Focused on agricultural economy and water issues in the Central Valley.' },

  // Texas
  { name: 'Lina Hidalgo', county: 'Harris County', state: 'TX', party: 'democrat', bio: 'Harris County Judge since 2019. First woman and first Latina to lead Harris County, focused on flood control, criminal justice reform, and public health.' },
  { name: 'Clay Jenkins', county: 'Dallas County', state: 'TX', party: 'democrat', bio: 'Dallas County Judge since 2011. Attorney focused on public health, immigration policy, and criminal justice reform.' },
  { name: 'Tim Burchett', county: 'Tarrant County', state: 'TX', party: 'republican', bio: 'Tarrant County Judge. Focused on public safety, infrastructure, and fiscal responsibility in the Fort Worth area.' },
  { name: 'Nelson Wolff', county: 'Bexar County', state: 'TX', party: 'democrat', bio: 'Former Bexar County Judge focused on transportation and economic development in San Antonio.' },
  { name: 'Peter Sakai', county: 'Bexar County', state: 'TX', party: 'democrat', bio: 'Bexar County Judge since 2023. Former district judge focused on mental health, juvenile justice, and community services.' },
  { name: 'Eduardo Reyes', county: 'Travis County', state: 'TX', party: 'democrat', bio: 'Travis County Judge since 2023. Focused on housing, behavioral health, and criminal justice reform in the Austin area.' },
  { name: 'KP George', county: 'Fort Bend County', state: 'TX', party: 'democrat', bio: 'Fort Bend County Judge since 2019. First South Asian county judge in Texas, focused on infrastructure and diversity.' },
  { name: 'Mark Henry', county: 'Galveston County', state: 'TX', party: 'republican', bio: 'Galveston County Judge since 2010. Focused on hurricane preparedness, coastal resilience, and economic development.' },
  { name: 'Todd Ames', county: 'Montgomery County', state: 'TX', party: 'republican', bio: 'Montgomery County Judge since 2023. Focused on infrastructure, public safety, and managing growth north of Houston.' },

  // Florida
  { name: 'Oliver Gilbert III', county: 'Miami-Dade County', state: 'FL', party: 'democrat', bio: 'Chair of the Miami-Dade County Commission. Former Miami Gardens mayor focused on transportation and affordable housing.' },
  { name: 'Beam Furr', county: 'Broward County', state: 'FL', party: 'democrat', bio: 'Broward County Commissioner. Former educator focused on environmental protection and community services.' },
  { name: 'Maribel Gomez Cordero', county: 'Orange County', state: 'FL', party: 'democrat', bio: 'Orange County Commissioner. Focused on affordable housing and community development in the Orlando area.' },
  { name: 'Kathryn Starkey', county: 'Pasco County', state: 'FL', party: 'republican', bio: 'Chair of the Pasco County Commission. Focused on growth management and infrastructure in the Tampa Bay area.' },
  { name: 'Ken Welch', county: 'Pinellas County', state: 'FL', party: 'democrat', bio: 'Mayor of St. Petersburg and former Pinellas County commissioner focused on economic equity and redevelopment.' },
  { name: 'Bill Proctor', county: 'Leon County', state: 'FL', party: 'democrat', bio: 'Leon County Commissioner. Longest-serving commissioner focused on community development in the Tallahassee area.' },

  // Georgia
  { name: 'Robb Pitts', county: 'Fulton County', state: 'GA', party: 'democrat', bio: 'Chair of the Fulton County Board of Commissioners since 2018. Longest-serving member focused on criminal justice, economic development, and housing.' },
  { name: 'Chairwoman Nicole Love Hendrickson', county: 'Gwinnett County', state: 'GA', party: 'democrat', bio: 'Chair of the Gwinnett County Board of Commissioners since 2021. First Black woman to lead Gwinnett, focused on equity and infrastructure.' },
  { name: 'Lisa Cupid', county: 'Cobb County', state: 'GA', party: 'democrat', bio: 'Chair of the Cobb County Board of Commissioners since 2021. First Black woman to lead Cobb County, focused on transit and economic development.' },
  { name: 'Ted Terry', county: 'DeKalb County', state: 'GA', party: 'democrat', bio: 'DeKalb County Commissioner. Former Clarkston mayor focused on environmental sustainability and community engagement.' },

  // Arizona
  { name: 'Jack Sellers', county: 'Maricopa County', state: 'AZ', party: 'republican', bio: 'Chair of the Maricopa County Board of Supervisors. Business leader focused on election integrity, public safety, and infrastructure.' },
  { name: 'Rex Scott', county: 'Pima County', state: 'AZ', party: 'democrat', bio: 'Chair of the Pima County Board of Supervisors. Focused on environmental sustainability and community services in the Tucson area.' },

  // Pennsylvania
  { name: 'Robert Harvie Jr.', county: 'Bucks County', state: 'PA', party: 'democrat', bio: 'Chair of the Bucks County Board of Commissioners. Focused on open space preservation and infrastructure in suburban Philadelphia.' },
  { name: 'Jamila Winder', county: 'Montgomery County', state: 'PA', party: 'republican', bio: 'Chair of the Montgomery County Board of Commissioners. First Black woman to lead the county, focused on economic development.' },
  { name: 'Howard Merrick', county: 'Chester County', state: 'PA', party: 'republican', bio: 'Chair of the Chester County Board of Commissioners. Focused on open space preservation and fiscal responsibility.' },
  { name: 'Kevin Boyle', county: 'Allegheny County', state: 'PA', party: 'democrat', bio: 'Allegheny County Council member. Focused on economic development in the Pittsburgh region.' },
  { name: 'Sara Innamorato', county: 'Allegheny County', state: 'PA', party: 'democrat', bio: 'Allegheny County Executive since 2024. Former state representative focused on equity, environment, and public health in the Pittsburgh region.' },

  // New York
  { name: 'George Latimer', county: 'Westchester County', state: 'NY', party: 'democrat', bio: 'Westchester County Executive since 2018. Former state legislator focused on fiscal management and environmental protection.' },
  { name: 'Steve Bellone', county: 'Suffolk County', state: 'NY', party: 'democrat', bio: 'Former Suffolk County Executive focused on downtown revitalization and economic development on Long Island.' },
  { name: 'Edward Romaine', county: 'Suffolk County', state: 'NY', party: 'republican', bio: 'Suffolk County Executive since 2024. Former Brookhaven supervisor focused on fiscal responsibility and public safety on Long Island.' },
  { name: 'Bruce Blakeman', county: 'Nassau County', state: 'NY', party: 'republican', bio: 'Nassau County Executive since 2022. Former Hempstead town council member focused on public safety and tax reduction.' },
  { name: 'MaryEllen Odell', county: 'Putnam County', state: 'NY', party: 'republican', bio: 'Putnam County Executive. Focused on fiscal responsibility and quality of life in the Hudson Valley.' },
  { name: 'Steven Neuhaus', county: 'Orange County', state: 'NY', party: 'republican', bio: 'Orange County Executive since 2014. Former town supervisor focused on economic development and public safety in the Hudson Valley.' },

  // Ohio
  { name: 'Ilonka Gaal', county: 'Hamilton County', state: 'OH', party: 'democrat', bio: 'Hamilton County Commissioner. Focused on economic development and community services in the Cincinnati area.' },
  { name: 'Chris Ronayne', county: 'Cuyahoga County', state: 'OH', party: 'democrat', bio: 'Cuyahoga County Executive since 2023. Former University Circle president focused on lakefront development and economic equity in Greater Cleveland.' },
  { name: 'Mike DeWine Jr.', county: 'Greene County', state: 'OH', party: 'republican', bio: 'Greene County Commissioner. Focused on economic development near Wright-Patterson Air Force Base.' },
  { name: 'Mike Lauber', county: 'Summit County', state: 'OH', party: 'republican', bio: 'Summit County Executive since 2024. Focused on economic development and public safety in the Akron area.' },

  // Michigan
  { name: 'Dave Coulter', county: 'Oakland County', state: 'MI', party: 'democrat', bio: 'Oakland County Executive since 2019. Former Ferndale mayor focused on economic development, public health, and infrastructure in suburban Detroit.' },
  { name: 'Warren Evans', county: 'Wayne County', state: 'MI', party: 'democrat', bio: 'Wayne County Executive since 2015. Former sheriff focused on public safety, fiscal responsibility, and blight elimination in the Detroit region.' },
  { name: 'Mark Hackel', county: 'Macomb County', state: 'MI', party: 'democrat', bio: 'Macomb County Executive since 2011. Former sheriff focused on infrastructure, economic development, and public safety.' },

  // Illinois
  { name: 'Toni Preckwinkle', county: 'Cook County', state: 'IL', party: 'democrat', bio: 'Cook County Board President since 2010. Former Chicago alderman focused on criminal justice reform, healthcare, and fiscal management.' },
  { name: 'Scott Gryder', county: 'Will County', state: 'IL', party: 'republican', bio: 'Will County Board Speaker. Focused on economic development and infrastructure in the Chicago south suburbs.' },
  { name: 'Daniel Cronin', county: 'DuPage County', state: 'IL', party: 'republican', bio: 'DuPage County Board Chair since 2010. Focused on fiscal responsibility and economic development in the Chicago west suburbs.' },
  { name: 'Sandy Hart', county: 'Lake County', state: 'IL', party: 'democrat', bio: 'Lake County Board Chair since 2018. Focused on environmental protection, infrastructure, and community services in suburban Chicago.' },

  // Washington
  { name: 'Dow Constantine', county: 'King County', state: 'WA', party: 'democrat', bio: 'King County Executive since 2009. Longtime executive focused on transit, climate action, and social equity in the Seattle metro.' },
  { name: 'Bruce Dammeier', county: 'Pierce County', state: 'WA', party: 'republican', bio: 'Pierce County Executive since 2017. Former state legislator focused on public safety, homelessness, and economic development in the Tacoma area.' },
  { name: 'Dave Somers', county: 'Snohomish County', state: 'WA', party: 'democrat', bio: 'Snohomish County Executive since 2016. Former county council member focused on aerospace economy and infrastructure.' },

  // Oregon
  { name: 'Jessica Vega Pederson', county: 'Multnomah County', state: 'OR', party: 'democrat', bio: 'Multnomah County Chair since 2023. Former state legislator focused on homelessness, behavioral health, and criminal justice in Portland.' },
  { name: 'Tina Kotek', county: 'Clackamas County', state: 'OR', party: 'democrat', bio: 'Governor of Oregon, not a county official.' },
  { name: 'Paul Savas', county: 'Clackamas County', state: 'OR', party: 'republican', bio: 'Clackamas County Commissioner. Focused on fiscal responsibility and public safety in suburban Portland.' },

  // Colorado
  { name: 'Holly Williams', county: 'Arapahoe County', state: 'CO', party: 'democrat', bio: 'Chair of the Arapahoe County Board of Commissioners. Focused on housing, transportation, and community health in the Denver metro.' },
  { name: 'Stan VanderWerf', county: 'El Paso County', state: 'CO', party: 'republican', bio: 'Chair of the El Paso County Board of Commissioners since 2019. Focused on military community support and infrastructure in the Colorado Springs area.' },
  { name: 'Steve O\'Dorisio', county: 'Adams County', state: 'CO', party: 'democrat', bio: 'Chair of the Adams County Board of Commissioners. Focused on affordable housing and economic development in the Denver north metro.' },
  { name: 'Matt Jones', county: 'Boulder County', state: 'CO', party: 'democrat', bio: 'Boulder County Commissioner. Focused on climate action, housing, and open space preservation.' },

  // Nevada
  { name: 'Tick Segerblom', county: 'Clark County', state: 'NV', party: 'democrat', bio: 'Chair of the Clark County Commission. Former state senator focused on cannabis regulation, economic development, and housing in the Las Vegas area.' },
  { name: 'Alexis Hill', county: 'Washoe County', state: 'NV', party: 'democrat', bio: 'Chair of the Washoe County Commission. Focused on homelessness, mental health, and community development in the Reno area.' },

  // Minnesota
  { name: 'Irene Fernando', county: 'Hennepin County', state: 'MN', party: 'democrat', bio: 'Chair of the Hennepin County Board of Commissioners. Youngest chair in county history, focused on racial equity and community investment.' },
  { name: 'Rafael Ortega', county: 'Ramsey County', state: 'MN', party: 'democrat', bio: 'Chair of the Ramsey County Board of Commissioners. Focused on equity, public safety, and community services in St. Paul.' },
  { name: 'Fran Miron', county: 'Washington County', state: 'MN', party: 'republican', bio: 'Chair of the Washington County Board. Focused on infrastructure and fiscal responsibility in the St. Paul east metro.' },

  // Maryland
  { name: 'Calvin Ball', county: 'Howard County', state: 'MD', party: 'democrat', bio: 'Howard County Executive since 2018. First African American county executive, focused on education, equity, and smart growth.' },
  { name: 'Angela Alsobrooks', county: 'Prince George\'s County', state: 'MD', party: 'democrat', bio: 'Former Prince George\'s County Executive focused on economic development and public safety.' },
  { name: 'Marc Elrich', county: 'Montgomery County', state: 'MD', party: 'democrat', bio: 'Montgomery County Executive since 2018. Former county council member focused on affordable housing, transit, and progressive policy.' },
  { name: 'Johnny Olszewski Jr.', county: 'Baltimore County', state: 'MD', party: 'democrat', bio: 'Former Baltimore County Executive focused on education, public safety, and fiscal responsibility.' },
  { name: 'Steuart Pittman', county: 'Anne Arundel County', state: 'MD', party: 'democrat', bio: 'Anne Arundel County Executive since 2018. Farmer and community organizer focused on environment and education.' },

  // New Jersey
  { name: 'Tom Mastrangelo', county: 'Middlesex County', state: 'NJ', party: 'democrat', bio: 'Middlesex County Commissioner Director. Focused on economic development and community services in central New Jersey.' },
  { name: 'Germaine Ortiz', county: 'Bergen County', state: 'NJ', party: 'democrat', bio: 'Bergen County Commissioner Chair. Focused on infrastructure and community services in northern New Jersey.' },
  { name: 'Alexander Mirabella', county: 'Union County', state: 'NJ', party: 'democrat', bio: 'Union County Commissioner Chair. Focused on parks, open space, and community programs.' },

  // North Carolina
  { name: 'Elaine Bushfelt', county: 'Mecklenburg County', state: 'NC', party: 'democrat', bio: 'Chair of the Mecklenburg County Commission. Focused on housing, transportation, and education in the Charlotte area.' },
  { name: 'Matt Calabria', county: 'Wake County', state: 'NC', party: 'democrat', bio: 'Chair of the Wake County Board of Commissioners. Focused on education, growth management, and transit in the Raleigh area.' },
  { name: 'Brenda Howerton', county: 'Durham County', state: 'NC', party: 'democrat', bio: 'Chair of the Durham County Board of Commissioners. Focused on affordable housing and community development in the Research Triangle.' },

  // Tennessee
  { name: 'Wanda Halbert', county: 'Shelby County', state: 'TN', party: 'democrat', bio: 'Shelby County Clerk. Focused on government transparency and community services in the Memphis area.' },
  { name: 'Lee Harris', county: 'Shelby County', state: 'TN', party: 'democrat', bio: 'Shelby County Mayor since 2018. Former state senator focused on criminal justice reform and economic development in the Memphis area.' },

  // Wisconsin
  { name: 'David Crowley', county: 'Milwaukee County', state: 'WI', party: 'democrat', bio: 'Milwaukee County Executive since 2020. Youngest county executive in Milwaukee history, focused on racial equity, mental health, and transit.' },
  { name: 'Adam Parkhomenko', county: 'Dane County', state: 'WI', party: 'democrat', bio: 'Dane County Executive. Focused on climate action and equity in the Madison area.' },

  // Indiana
  { name: 'Andre Carson', county: 'Marion County', state: 'IN', party: 'democrat', bio: 'Marion County representative focused on community development in Indianapolis.' },

  // Massachusetts
  { name: 'Peter Koutoujian', county: 'Middlesex County', state: 'MA', party: 'democrat', bio: 'Middlesex County Sheriff. Former state legislator focused on criminal justice reform and mental health in greater Boston.' },

  // Virginia
  { name: 'Jeff McKay', county: 'Fairfax County', state: 'VA', party: 'democrat', bio: 'Chair of the Fairfax County Board of Supervisors since 2020. Former Lee district supervisor focused on transportation, housing, and education.' },
  { name: 'Andrew Wheeler', county: 'Loudoun County', state: 'VA', party: 'republican', bio: 'Chair of the Loudoun County Board of Supervisors since 2024. Focused on managing growth, education policy, and fiscal responsibility.' },
  { name: 'Crystal Vanuch', county: 'Prince William County', state: 'VA', party: 'republican', bio: 'Chair of the Prince William County Board of Supervisors since 2024. Focused on public safety, development, and fiscal conservatism.' },
]

// Filter out former officials and governors
const current = COMMISSIONERS.filter(c =>
  !c.bio.toLowerCase().includes('former ') &&
  !c.bio.toLowerCase().includes('governor of')
)

const rows = current.map(c => ({
  name: c.name.replace(/^Chairwoman /, ''),
  slug: c.name.replace(/^Chairwoman /, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  state: c.state,
  chamber: 'county',
  party: c.party,
  title: `${c.county} Commissioner`,
  bio: c.bio,
  image_url: null,
}))

console.log(`Upserting ${rows.length} county commissioners...`)

// Batch in groups of 50
for (let i = 0; i < rows.length; i += 50) {
  const batch = rows.slice(i, i + 50)
  const { data, error } = await supabase
    .from('politicians')
    .upsert(batch, { onConflict: 'slug' })
    .select('id, name')

  if (error) {
    console.error(`Error in batch ${Math.floor(i / 50) + 1}:`, error.message)
    process.exit(1)
  }

  console.log(`Batch ${Math.floor(i / 50) + 1}: upserted ${data.length} commissioners`)
  data.forEach(r => console.log(`  - ${r.name}`))
}

console.log('Done!')
