import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// State name lookup
const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii',
  ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', MD: 'Maryland', MA: 'Massachusetts',
  MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', PA: 'Pennsylvania', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
  UT: 'Utah', VA: 'Virginia', VT: 'Vermont', WA: 'Washington',
  WI: 'Wisconsin', WV: 'West Virginia',
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// All current lieutenant governors as of early 2025
// States without a lt. gov: AZ, ME, NH, OR, WY
// Notes:
//   - MO: Mike Kehoe became Governor Jan 2025; David Wasinger is new Lt. Gov
//   - NC: Mark Robinson's term ended Jan 2025; Hal Plyler is new Lt. Gov
//   - IN: Suzanne Crouch's term ended Jan 2025; Micah Beckwith is new Lt. Gov
//   - DE: Bethany Hall-Long's term ended Jan 2025; Kyle Evans Gay is new Lt. Gov
//   - OH: Jon Husted appointed to U.S. Senate Jan 2025; replaced
//   - TN: Lt. Gov is President of the State Senate (elected by senators)
//   - WV: Lt. Gov is President of the State Senate
//   - TX: Lt. Gov presides over the State Senate

const LT_GOVERNORS = [
  { name: 'Will Ainsworth',      state: 'AL', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2019, previously a member of the Alabama House of Representatives.' },
  { name: 'Nancy Dahlstrom',     state: 'AK', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2022, previously Commissioner of the Alaska Department of Corrections.' },
  { name: 'Leslie Rutledge',     state: 'AR', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2023, previously the first woman elected Attorney General of Arkansas.' },
  { name: 'Eleni Kounalakis',    state: 'CA', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2019, the first woman elected to the office in California history and former U.S. Ambassador to Hungary.' },
  { name: 'Dianne Primavera',    state: 'CO', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2019, previously a Colorado state representative and cancer research advocate.' },
  { name: 'Susan Bysiewicz',     state: 'CT', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2019, previously Connecticut Secretary of State for three terms.' },
  { name: 'Kyle Evans Gay',      state: 'DE', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2025, previously a Delaware state senator focused on public health and education.' },
  { name: 'Jeanette Nunez',      state: 'FL', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2019, the first Hispanic person to hold the office in Florida, previously a state representative.' },
  { name: 'Burt Jones',          state: 'GA', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2023, previously a Georgia state senator representing the 25th district.' },
  { name: 'Sylvia Luke',         state: 'HI', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2022, previously chair of the Hawaii House Finance Committee for over a decade.' },
  { name: 'Scott Bedke',         state: 'ID', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2023, previously the longest-serving Speaker of the Idaho House of Representatives.' },
  { name: 'Juliana Stratton',    state: 'IL', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2019, the first African American to hold the office in Illinois, previously a state representative.' },
  { name: 'Micah Beckwith',      state: 'IN', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2025, a pastor and conservative activist from central Indiana.' },
  { name: 'Adam Gregg',          state: 'IA', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2017, previously the youngest person to serve as Iowa Public Defender.' },
  { name: 'David Toland',        state: 'KS', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2021, also serves as Secretary of Commerce for Kansas, focused on rural economic development.' },
  { name: 'Jacqueline Coleman',  state: 'KY', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2019, a former high school teacher and basketball coach, the youngest Lt. Governor in Kentucky history.' },
  { name: 'Billy Nungesser',     state: 'LA', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2016, previously president of Plaquemines Parish, known for tourism promotion efforts.' },
  { name: 'Aruna Miller',        state: 'MD', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2023, the first immigrant and first Asian American to hold the office in Maryland, previously a state delegate.' },
  { name: 'Kim Driscoll',        state: 'MA', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2023, previously the first female mayor of Salem, Massachusetts.' },
  { name: 'Garlin Gilchrist',    state: 'MI', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2019, the first African American to hold the office in Michigan, a technologist and community organizer.' },
  { name: 'Peggy Flanagan',      state: 'MN', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2019, one of the highest-ranking Native American women in U.S. executive government history.' },
  { name: 'Delbert Hosemann',    state: 'MS', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2020, previously Mississippi Secretary of State for four terms.' },
  { name: 'David Wasinger',      state: 'MO', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2025, a St. Louis attorney and businessman.' },
  { name: 'Kristen Juras',       state: 'MT', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2021, a Montana State University law professor and rancher.' },
  { name: 'Joe Kelly',           state: 'NE', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2023, appointed by Governor Pillen after previously serving in state government.' },
  { name: 'Stavros Anthony',     state: 'NV', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2023, previously a Las Vegas city councilman and retired Metropolitan Police commander.' },
  { name: 'Tahesha Way',         state: 'NJ', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2023, also serves as New Jersey Secretary of State, previously a municipal court judge.' },
  { name: 'Howie Morales',       state: 'NM', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2019, previously a New Mexico state senator representing a rural district in the southwest.' },
  { name: 'Antonio Delgado',     state: 'NY', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2022, previously a U.S. Representative from New York\'s 19th congressional district.' },
  { name: 'Hal Plyler',          state: 'NC', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2025, a businessman and former executive in the energy sector.' },
  { name: 'Tammy Miller',        state: 'ND', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2025, a businesswoman and former CEO of a Bismarck-based company.' },
  { name: 'Matt Pinnell',        state: 'OK', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2019, focused on Oklahoma tourism and economic development.' },
  { name: 'Austin Davis',        state: 'PA', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2023, the first African American to hold the office in Pennsylvania, previously a state representative.' },
  { name: 'Sabina Matos',        state: 'RI', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2021, the first Afro-Latina to hold statewide office in Rhode Island, previously Providence City Council president.' },
  { name: 'Pamela Evette',       state: 'SC', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2019, a businesswoman and entrepreneur who co-founded a manufacturing company.' },
  { name: 'Larry Rhoden',        state: 'SD', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2019, a rancher and former South Dakota state senator and representative.' },
  { name: 'Randy McNally',       state: 'TN', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2017 as President of the Tennessee State Senate, the longest-serving member of the chamber.' },
  { name: 'Dan Patrick',         state: 'TX', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2015, presides over the Texas Senate and is one of the most influential political figures in the state.' },
  { name: 'Deidre Henderson',    state: 'UT', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2021, previously a Utah state senator focused on election administration and government transparency.' },
  { name: 'Winsome Sears',       state: 'VA', party: 'republican',  bio: 'Serving as Lieutenant Governor since 2022, the first African American woman to hold statewide office in Virginia, a Marine Corps veteran.' },
  { name: 'David Zuckerman',     state: 'VT', party: 'democrat',    bio: 'Serving as Lieutenant Governor, a Progressive-Democrat who previously held the office from 2017 to 2021 before winning it again.' },
  { name: 'Denny Heck',          state: 'WA', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2021, previously a U.S. Representative from Washington\'s 10th congressional district.' },
  { name: 'Sara Rodriguez',      state: 'WI', party: 'democrat',    bio: 'Serving as Lieutenant Governor since 2023, a nurse practitioner and former state representative focused on healthcare policy.' },
  { name: 'Craig Blair',         state: 'WV', party: 'republican',  bio: 'Serving as Lieutenant Governor in his capacity as President of the West Virginia Senate, a businessman and longtime state legislator.' },
]

async function main() {
  console.log(`Seeding ${LT_GOVERNORS.length} lieutenant governors...`)

  const rows = LT_GOVERNORS.map(lg => ({
    name: lg.name,
    slug: slugify(lg.name) + '-lt-gov',
    state: lg.state,
    chamber: 'governor',
    party: lg.party,
    title: `Lieutenant Governor of ${STATE_NAMES[lg.state]}`,
    bio: lg.bio,
    website_url: null,
    image_url: null,
  }))

  // Upsert in batches of 25
  const BATCH = 25
  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { data, error } = await supabase
      .from('politicians')
      .upsert(batch, { onConflict: 'slug' })
      .select('id')

    if (error) {
      console.error(`Error upserting batch starting at ${i}:`, error.message)
    } else {
      inserted += data.length
      console.log(`  Batch ${Math.floor(i / BATCH) + 1}: upserted ${data.length} rows`)
    }
  }

  console.log(`\nDone! Upserted ${inserted} lieutenant governors.`)
}

main().catch(err => { console.error(err); process.exit(1) })
