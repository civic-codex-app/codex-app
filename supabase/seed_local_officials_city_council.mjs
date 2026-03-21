import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Real current city council presidents, speakers, and notable members from major US cities
// Data accurate as of early 2025
const COUNCIL_MEMBERS = [
  // New York City
  {
    name: 'Adrienne Adams',
    slug: 'adrienne-adams',
    state: 'NY',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council Speaker, New York City',
    bio: 'Speaker of the New York City Council, representing District 28 in Queens. First Black woman to serve as Speaker of the NYC Council.',
    website_url: 'https://council.nyc.gov/district-28/',
    image_url: null,
  },
  // Los Angeles
  {
    name: 'Marqueece Harris-Dawson',
    slug: 'marqueece-harris-dawson',
    state: 'CA',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council President, Los Angeles',
    bio: 'President of the Los Angeles City Council, representing the 8th District in South Los Angeles. Community development leader and former CEO of Community Coalition.',
    website_url: 'https://cd8.lacity.gov/',
    image_url: null,
  },
  // Chicago
  {
    name: 'Carlos Ramirez-Rosa',
    slug: 'carlos-ramirez-rosa',
    state: 'IL',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council Floor Leader, Chicago',
    bio: 'Floor leader of the Chicago City Council, representing the 35th Ward. One of the youngest aldermen elected in Chicago history and a progressive voice on the council.',
    website_url: 'https://www.35thward.org/',
    image_url: null,
  },
  // Houston
  {
    name: 'Carolyn Evans-Shabazz',
    slug: 'carolyn-evans-shabazz',
    state: 'TX',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council Member, Houston',
    bio: 'Houston City Council member representing District D. Long-serving council member and educator focused on community development and public safety.',
    website_url: 'https://www.houstontx.gov/council/d/',
    image_url: null,
  },
  // Phoenix
  {
    name: 'Debra Stark',
    slug: 'debra-stark',
    state: 'AZ',
    chamber: 'city_council',
    party: 'republican',
    title: 'Vice Mayor, Phoenix',
    bio: 'Vice Mayor and City Council member for Phoenix District 3. Focused on public safety, infrastructure, and neighborhood preservation.',
    website_url: 'https://www.phoenix.gov/district3',
    image_url: null,
  },
  // Philadelphia
  {
    name: 'Kenyatta Johnson',
    slug: 'kenyatta-johnson-philly',
    state: 'PA',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council President, Philadelphia',
    bio: 'President of the Philadelphia City Council, representing the 2nd District. Focused on affordable housing, economic development, and community investment in South Philadelphia.',
    website_url: 'https://phlcouncil.com/kenyattajohnson/',
    image_url: null,
  },
  // San Antonio
  {
    name: 'Manny Pelaez',
    slug: 'manny-pelaez',
    state: 'TX',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council Member, San Antonio',
    bio: 'San Antonio City Council member representing District 8. Attorney focused on infrastructure, transportation, and economic growth on the Northwest Side.',
    website_url: 'https://www.sanantonio.gov/council/d8',
    image_url: null,
  },
  // San Diego
  {
    name: 'Sean Elo-Rivera',
    slug: 'sean-elo-rivera',
    state: 'CA',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council President, San Diego',
    bio: 'President of the San Diego City Council, representing District 9. First person of mixed Black and Latino heritage to lead the San Diego City Council.',
    website_url: 'https://www.sandiego.gov/citycouncil/cd9',
    image_url: null,
  },
  // Dallas
  {
    name: 'Tennell Atkins',
    slug: 'tennell-atkins',
    state: 'TX',
    chamber: 'city_council',
    party: 'democrat',
    title: 'Mayor Pro Tem, Dallas',
    bio: 'Mayor Pro Tem of the Dallas City Council, representing District 8 in southern Dallas. Long-serving council member focused on economic development and neighborhood revitalization.',
    website_url: 'https://dallascityhall.com/government/citycouncil/district8/',
    image_url: null,
  },
  // San Jose
  {
    name: 'Omar Torres',
    slug: 'omar-torres-sj',
    state: 'CA',
    chamber: 'city_council',
    party: 'democrat',
    title: 'Vice Mayor, San Jose',
    bio: 'Vice Mayor of San Jose, representing District 3. Focused on housing affordability, public safety, and community services in the East Side.',
    website_url: 'https://www.sanjoseca.gov/your-government/departments-offices/city-council/district-3',
    image_url: null,
  },
  // Austin
  {
    name: 'Natasha Harper-Madison',
    slug: 'natasha-harper-madison',
    state: 'TX',
    chamber: 'city_council',
    party: 'democrat',
    title: 'Mayor Pro Tem, Austin',
    bio: 'Mayor Pro Tem of the Austin City Council, representing District 1. Community activist focused on equity, housing, and workforce development in East Austin.',
    website_url: 'https://www.austintexas.gov/department/district-1',
    image_url: null,
  },
  // Jacksonville
  {
    name: 'Ron Salem',
    slug: 'ron-salem',
    state: 'FL',
    chamber: 'city_council',
    party: 'republican',
    title: 'City Council President, Jacksonville',
    bio: 'President of the Jacksonville City Council. Business leader focused on economic development, public safety, and fiscal responsibility.',
    website_url: 'https://www.coj.net/city-council',
    image_url: null,
  },
  // Columbus
  {
    name: 'Shannon Hardin',
    slug: 'shannon-hardin',
    state: 'OH',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council President, Columbus',
    bio: 'President of the Columbus City Council. First openly gay council president in Columbus history, focused on affordable housing and neighborhood development.',
    website_url: 'https://www.columbus.gov/council/',
    image_url: null,
  },
  // Indianapolis
  {
    name: 'Vop Osili',
    slug: 'vop-osili',
    state: 'IN',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City-County Council President, Indianapolis',
    bio: 'President of the Indianapolis City-County Council. Engineer and community leader focused on infrastructure, public safety, and economic opportunity.',
    website_url: 'https://www.indy.gov/agency/city-county-council',
    image_url: null,
  },
  // Seattle
  {
    name: 'Sara Nelson',
    slug: 'sara-nelson-seattle',
    state: 'WA',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council President, Seattle',
    bio: 'President of the Seattle City Council, representing Position 9. Small business owner focused on public safety, homelessness solutions, and supporting local businesses.',
    website_url: 'https://www.seattle.gov/council',
    image_url: null,
  },
  // Denver
  {
    name: 'Amanda Sawyer',
    slug: 'amanda-sawyer-denver',
    state: 'CO',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council President, Denver',
    bio: 'President of the Denver City Council, representing District 5. Focused on neighborhood safety, responsible growth, and government accountability.',
    website_url: 'https://www.denvergov.org/Government/Denver-City-Council/Council-Members/Council-District-5',
    image_url: null,
  },
  // Nashville
  {
    name: 'Burkley Allen',
    slug: 'burkley-allen',
    state: 'TN',
    chamber: 'city_council',
    party: 'democrat',
    title: 'Vice Mayor, Nashville',
    bio: 'Vice Mayor of Nashville, elected by the Metro Council. Represents District 18 and focuses on neighborhood issues, planning, and government transparency.',
    website_url: 'https://www.nashville.gov/departments/council',
    image_url: null,
  },
  // Portland
  {
    name: 'Candace Avalos',
    slug: 'candace-avalos',
    state: 'OR',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council Member, Portland',
    bio: 'Portland City Council member serving under the city\'s new charter government structure. Community advocate focused on housing, climate action, and equity.',
    website_url: 'https://www.portland.gov/council',
    image_url: null,
  },
  // Las Vegas
  {
    name: 'Brian Knudsen',
    slug: 'brian-knudsen',
    state: 'NV',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council Member, Las Vegas',
    bio: 'Las Vegas City Council member representing Ward 1. Focused on downtown revitalization, affordable housing, and community development.',
    website_url: 'https://www.lasvegasnevada.gov/Government/Mayor-City-Council',
    image_url: null,
  },
  // Memphis
  {
    name: 'Martavius Jones',
    slug: 'martavius-jones',
    state: 'TN',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council Chairman, Memphis',
    bio: 'Chairman of the Memphis City Council, representing District 1 in Super District 8. Business executive focused on economic development and public safety.',
    website_url: 'https://www.memphistn.gov/government/city-council/',
    image_url: null,
  },
  // Baltimore
  {
    name: 'Nick Mosby',
    slug: 'nick-mosby',
    state: 'MD',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council President, Baltimore',
    bio: 'President of the Baltimore City Council. Focused on public safety, economic development, and government reform in Baltimore.',
    website_url: 'https://www.baltimorecitycouncil.com/',
    image_url: null,
  },
  // Milwaukee
  {
    name: 'Jose Perez',
    slug: 'jose-perez-mke',
    state: 'WI',
    chamber: 'city_council',
    party: 'democrat',
    title: 'Common Council President, Milwaukee',
    bio: 'President of the Milwaukee Common Council, representing the 12th Aldermanic District. Focused on neighborhood revitalization and community safety.',
    website_url: 'https://city.milwaukee.gov/CommonCouncil',
    image_url: null,
  },
  // Charlotte
  {
    name: 'Dimple Ajmera',
    slug: 'dimple-ajmera',
    state: 'NC',
    chamber: 'city_council',
    party: 'democrat',
    title: 'Mayor Pro Tem, Charlotte',
    bio: 'Mayor Pro Tem of the Charlotte City Council, representing the At-Large district. First South Asian American elected official in North Carolina, focused on transportation and affordable housing.',
    website_url: 'https://charlottenc.gov/CityCouncil/',
    image_url: null,
  },
  // Detroit
  {
    name: 'Mary Sheffield',
    slug: 'mary-sheffield',
    state: 'MI',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council President, Detroit',
    bio: 'President of the Detroit City Council. Youngest person ever elected to the Detroit City Council, focused on youth development, public safety, and neighborhood investment.',
    website_url: 'https://detroitmi.gov/government/city-council',
    image_url: null,
  },
  // Minneapolis
  {
    name: 'Elliott Payne',
    slug: 'elliott-payne',
    state: 'MN',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council President, Minneapolis',
    bio: 'President of the Minneapolis City Council, representing Ward 1. Focused on public safety reform, housing affordability, and community engagement.',
    website_url: 'https://www.minneapolismn.gov/government/city-council/',
    image_url: null,
  },
  // Boston
  {
    name: 'Ruthzee Louijeune',
    slug: 'ruthzee-louijeune',
    state: 'MA',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council President, Boston',
    bio: 'President of the Boston City Council, representing District 5. First Haitian American elected to the Boston City Council, focused on housing, education, and immigrant rights.',
    website_url: 'https://www.boston.gov/departments/city-council',
    image_url: null,
  },
  // Pittsburgh
  {
    name: 'Theresa Kail-Smith',
    slug: 'theresa-kail-smith',
    state: 'PA',
    chamber: 'city_council',
    party: 'democrat',
    title: 'City Council President, Pittsburgh',
    bio: 'President of the Pittsburgh City Council, representing District 2. Long-serving council member focused on neighborhood development, public works, and community services.',
    website_url: 'https://pittsburghpa.gov/council/',
    image_url: null,
  },
]

console.log(`Upserting ${COUNCIL_MEMBERS.length} city council members...`)

const { data, error } = await supabase
  .from('politicians')
  .upsert(COUNCIL_MEMBERS, { onConflict: 'slug' })
  .select('name, slug')

if (error) {
  console.error('Error upserting:', error)
  process.exit(1)
}

console.log(`Successfully upserted ${data.length} city council members:`)
data.forEach(d => console.log(`  - ${d.name} (${d.slug})`))
