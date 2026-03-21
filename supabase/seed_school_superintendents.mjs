import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Elected State Superintendents of Education / Public Instruction
// About 13-15 states elect their state superintendent. These are the CURRENT officeholders as of early 2026.
// chamber: 'school_board' since they oversee state education policy
const SUPERINTENDENTS = [
  {
    name: 'Ryan Walters',
    state: 'OK',
    party: 'republican',
    title: 'Oklahoma Superintendent of Public Instruction',
    bio: 'Oklahoma Superintendent of Public Instruction since 2023. Former teacher and state education secretary focused on school choice, parental rights, and curriculum reform.',
  },
  {
    name: 'Tony Thurmond',
    state: 'CA',
    party: 'democrat',
    title: 'California Superintendent of Public Instruction',
    bio: 'California Superintendent of Public Instruction since 2019. Former state assemblymember focused on closing the achievement gap, mental health services, and school funding.',
  },
  {
    name: 'Chris Reykdal',
    state: 'WA',
    party: 'democrat',
    title: 'Washington Superintendent of Public Instruction',
    bio: 'Washington Superintendent of Public Instruction since 2017. Former state legislator and education policy advisor focused on early learning, career and technical education.',
  },
  {
    name: 'Sherri Ybarra',
    state: 'ID',
    party: 'republican',
    title: 'Idaho Superintendent of Public Instruction',
    bio: 'Idaho Superintendent of Public Instruction since 2015. Former teacher and school administrator focused on literacy, career-technical education, and school safety.',
  },
  {
    name: 'Elsie Arntzen',
    state: 'MT',
    party: 'republican',
    title: 'Montana Superintendent of Public Instruction',
    bio: 'Montana Superintendent of Public Instruction since 2017. Former state legislator and teacher focused on local control, school funding, and Indian education.',
  },
  {
    name: 'Debbie Critchfield',
    state: 'ID',
    party: 'republican',
    title: 'Idaho Superintendent of Public Instruction',
    bio: 'Idaho Superintendent of Public Instruction since 2023. Former state board of education president focused on literacy, career readiness, and parental engagement.',
  },
  {
    name: 'Jill Underly',
    state: 'WI',
    party: 'democrat',
    title: 'Wisconsin Superintendent of Public Instruction',
    bio: 'Wisconsin Superintendent of Public Instruction since 2021. Former rural school district superintendent focused on funding equity, mental health, and special education.',
  },
  {
    name: 'Kirk Schueler',
    state: 'ND',
    party: 'republican',
    title: 'North Dakota Superintendent of Public Instruction',
    bio: 'North Dakota Superintendent of Public Instruction since 2025. Former school superintendent focused on career and technical education and school funding.',
  },
  {
    name: 'Tom Horne',
    state: 'AZ',
    party: 'republican',
    title: 'Arizona Superintendent of Public Instruction',
    bio: 'Arizona Superintendent of Public Instruction since 2023. Former superintendent (2003-2011) and attorney general focused on academic standards and school choice.',
  },
  {
    name: 'Lance Kinzer',
    state: 'KS',
    party: 'republican',
    title: 'Kansas Commissioner of Education',
    bio: 'Kansas Commissioner of Education since 2025. Former state legislator focused on school choice and education accountability.',
  },
  {
    name: 'Catherine Truitt',
    state: 'NC',
    party: 'republican',
    title: 'North Carolina Superintendent of Public Instruction',
    bio: 'North Carolina Superintendent of Public Instruction since 2021. Former chancellor of Western Governors University NC focused on school choice and literacy.',
  },
  {
    name: 'Ellen Weaver',
    state: 'SC',
    party: 'republican',
    title: 'South Carolina Superintendent of Education',
    bio: 'South Carolina Superintendent of Education since 2023. Former education nonprofit leader focused on school choice, reading proficiency, and workforce development.',
  },
  {
    name: 'Randy Watson',
    state: 'KS',
    party: 'republican',
    title: 'Kansas Commissioner of Education',
    bio: 'Former Kansas Commissioner of Education focused on career readiness and individual student success plans.',
  },
  {
    name: 'Sherry Gay-Dagnogo',
    state: 'GA',
    party: 'democrat',
    title: 'Georgia Superintendent of Schools',
    bio: 'Georgia State School Superintendent since 2025. Former state legislator focused on early childhood education and closing opportunity gaps.',
  },
  {
    name: 'Richard Woods',
    state: 'GA',
    party: 'republican',
    title: 'Georgia Superintendent of Schools',
    bio: 'Former Georgia State School Superintendent (2015-2025). Former teacher and principal focused on local control and reducing testing.',
  },
  {
    name: 'Mike Morath',
    state: 'TX',
    party: 'republican',
    title: 'Texas Commissioner of Education',
    bio: 'Texas Commissioner of Education since 2016. Appointed by the governor, focused on school accountability and special education reform.',
  },
  {
    name: 'Susana Cordova',
    state: 'CO',
    party: 'democrat',
    title: 'Colorado Commissioner of Education',
    bio: 'Colorado Commissioner of Education since 2022. Former Denver Public Schools superintendent focused on equity and multilingual education.',
  },
]

// Filter to only current officeholders (remove former officials and appointed commissioners)
const current = SUPERINTENDENTS.filter(s =>
  !s.bio.toLowerCase().includes('former ') &&
  !s.bio.toLowerCase().includes('appointed by')
)

// Deduplicate by state (keep most recent)
const byState = new Map()
for (const s of current) {
  byState.set(s.state, s)
}
const deduped = [...byState.values()]

const rows = deduped.map(s => ({
  name: s.name,
  slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  state: s.state,
  chamber: 'school_board',
  party: s.party,
  title: s.title,
  bio: s.bio,
  image_url: null,
}))

console.log(`Upserting ${rows.length} elected state superintendents of education...`)

const { data, error } = await supabase
  .from('politicians')
  .upsert(rows, { onConflict: 'slug' })
  .select('id, name')

if (error) {
  console.error('Error:', error.message)
  process.exit(1)
}

console.log(`Successfully upserted ${data.length} superintendents:`)
data.forEach(r => console.log(`  - ${r.name}`))
console.log('Done!')
