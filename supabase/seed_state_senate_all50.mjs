import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
}

// ─── ALL 50 STATES: State Senate Leaders ─────────────────────────────
// Each entry: { name, state, party, role, bio }
// role is used to generate the title field
const leaders = [
  // Alabama
  { name: 'Greg Reed', state: 'AL', party: 'republican', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the Alabama State Senate representing District 5 (Jasper). Longtime Republican leader in the chamber.' },
  { name: 'Bobby Singleton', state: 'AL', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the Alabama State Senate representing District 24 (Greensboro). Advocate for civil rights and rural communities.' },

  // Alaska
  { name: 'Gary Stevens', state: 'AK', party: 'republican', role: 'President',
    bio: 'President of the Alaska State Senate representing District Q (Kodiak). Retired professor and longtime legislative leader.' },
  { name: 'Bill Wielechowski', state: 'AK', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the Alaska State Senate representing District I (Anchorage). Advocate for Permanent Fund dividends and consumer protection.' },

  // Arizona
  { name: 'Warren Petersen', state: 'AZ', party: 'republican', role: 'President',
    bio: 'President of the Arizona State Senate representing District 14. Focuses on tax policy and government accountability.' },
  { name: 'Mitzi Epstein', state: 'AZ', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the Arizona State Senate representing District 4 (Tempe). Businesswoman focused on education and healthcare.' },

  // Arkansas
  { name: 'Bart Hester', state: 'AR', party: 'republican', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the Arkansas State Senate representing District 1 (Cave Springs). Technology entrepreneur and conservative leader.' },
  { name: 'Greg Leding', state: 'AR', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the Arkansas State Senate representing District 4 (Fayetteville). Focuses on education and economic development.' },

  // California — Mike McGuire became Lt. Gov in 2024; Senate Pro Tem is now Scott Wiener (acting) or similar.
  // Using the most recent confirmed: Mike McGuire was succeeded. Toni Atkins termed out.
  // As of 2025, the CA Senate Pro Tem is Mike McGuire (he won the seat before becoming Lt Gov candidate).
  // Actually McGuire was elected Lt Gov Nov 2024. The new Pro Tem as of 2025 is likely someone else.
  // Safest known: Use the confirmed leaders. McGuire left, so skipping CA Pro Tem since uncertain.
  // Brian Jones is the Republican leader.
  { name: 'Brian Jones', state: 'CA', party: 'republican', role: 'Minority Leader',
    bio: 'Minority Leader of the California State Senate representing District 40. Advocates for tax relief and public safety.' },

  // Colorado
  { name: 'James Coleman', state: 'CO', party: 'democrat', role: 'President',
    bio: 'President of the Colorado State Senate representing District 33 (Denver). First African American to serve as Colorado Senate President.' },
  { name: 'Paul Lundeen', state: 'CO', party: 'republican', role: 'Minority Leader',
    bio: 'Minority Leader of the Colorado State Senate representing District 9 (Monument). Former educator focused on school choice and fiscal responsibility.' },

  // Connecticut
  { name: 'Martin Looney', state: 'CT', party: 'democrat', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the Connecticut State Senate representing the 11th district (New Haven). Longest-serving Senate leader in Connecticut history.' },
  { name: 'Kevin Kelly', state: 'CT', party: 'republican', role: 'Minority Leader',
    bio: 'Minority Leader of the Connecticut State Senate representing the 21st district (Stratford). Small business owner focused on fiscal discipline.' },

  // Delaware
  { name: 'Dave Sokola', state: 'DE', party: 'democrat', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the Delaware State Senate representing District 8 (Newark). Veteran legislator and education policy leader.' },
  { name: 'Gerald Hocker', state: 'DE', party: 'republican', role: 'Minority Leader',
    bio: 'Minority Leader of the Delaware State Senate representing District 20 (Ocean View). Business owner focused on coastal community issues.' },

  // Florida
  { name: 'Kathleen Passidomo', state: 'FL', party: 'republican', role: 'President',
    bio: 'President of the Florida Senate representing District 28 (Naples). First woman to serve as Florida Senate President.' },
  { name: 'Lauren Book', state: 'FL', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the Florida State Senate representing District 35 (Plantation). Child safety advocate and founder of Lauren\'s Kids.' },

  // Georgia
  { name: 'John Kennedy', state: 'GA', party: 'republican', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the Georgia State Senate representing District 18 (Macon). Longtime leader focused on economic development.' },
  { name: 'Gloria Butler', state: 'GA', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the Georgia State Senate representing District 55 (Stone Mountain). Longtime advocate for education and healthcare.' },

  // Hawaii
  { name: 'Ronald Kouchi', state: 'HI', party: 'democrat', role: 'President',
    bio: 'President of the Hawaii State Senate representing District 8 (Kauai). Leads the chamber with focus on sustainability and island communities.' },

  // Idaho
  { name: 'Chuck Winder', state: 'ID', party: 'republican', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the Idaho State Senate representing District 20 (Boise). Veteran legislator and business leader in the chamber.' },

  // Illinois
  { name: 'Don Harmon', state: 'IL', party: 'democrat', role: 'President',
    bio: 'President of the Illinois State Senate representing District 39 (Oak Park). Leads the Democratic supermajority in the chamber.' },
  { name: 'John Curran', state: 'IL', party: 'republican', role: 'Minority Leader',
    bio: 'Minority Leader of the Illinois State Senate representing District 41 (DuPage County). Former DuPage County State\'s Attorney.' },

  // Indiana
  { name: 'Rodric Bray', state: 'IN', party: 'republican', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the Indiana State Senate representing District 37 (Martinsville). Attorney and leader of the Republican supermajority.' },
  { name: 'Greg Taylor', state: 'IN', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the Indiana State Senate representing District 33 (Indianapolis). Attorney and advocate for criminal justice reform.' },

  // Iowa
  { name: 'Amy Sinclair', state: 'IA', party: 'republican', role: 'President',
    bio: 'President of the Iowa State Senate representing District 14 (Allerton). First woman to lead the Iowa Senate.' },
  { name: 'Pam Jochum', state: 'IA', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the Iowa State Senate representing District 50 (Dubuque). Longest-serving woman in Iowa legislative history.' },

  // Kansas
  { name: 'Ty Masterson', state: 'KS', party: 'republican', role: 'President',
    bio: 'President of the Kansas State Senate representing District 16 (Andover). CPA and fiscal conservative leading the chamber.' },
  { name: 'Dinah Sykes', state: 'KS', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the Kansas State Senate representing District 21 (Lenexa). Focuses on education funding and healthcare access.' },

  // Kentucky
  { name: 'Robert Stivers', state: 'KY', party: 'republican', role: 'President',
    bio: 'President of the Kentucky State Senate representing District 25 (Manchester). Longest-serving Senate President in Kentucky history.' },
  { name: 'Gerald Neal', state: 'KY', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the Kentucky State Senate representing District 33 (Louisville). Attorney and longtime civil rights advocate.' },

  // Louisiana
  { name: 'Cameron Henry', state: 'LA', party: 'republican', role: 'President',
    bio: 'President of the Louisiana State Senate representing District 9 (Metairie). Leads the chamber with focus on budget and fiscal policy.' },

  // Maine
  { name: 'Troy Jackson', state: 'ME', party: 'democrat', role: 'President',
    bio: 'President of the Maine State Senate representing District 1 (Aroostook County). Logger and labor advocate from rural northern Maine.' },

  // Maryland
  { name: 'Bill Ferguson', state: 'MD', party: 'democrat', role: 'President',
    bio: 'President of the Maryland State Senate representing District 46 (Baltimore). Former teacher focused on education reform and economic development.' },

  // Massachusetts
  { name: 'Karen Spilka', state: 'MA', party: 'democrat', role: 'President',
    bio: 'President of the Massachusetts State Senate representing the 2nd Middlesex and Norfolk district. Longtime advocate for mental health and disability rights.' },

  // Michigan
  { name: 'Winnie Brinks', state: 'MI', party: 'democrat', role: 'Majority Leader',
    bio: 'Majority Leader of the Michigan State Senate representing District 29 (Grand Rapids). First woman to lead the Michigan Senate.' },
  { name: 'Aric Nesbitt', state: 'MI', party: 'republican', role: 'Minority Leader',
    bio: 'Minority Leader of the Michigan State Senate representing District 20 (Lawton). Focuses on energy policy and economic competitiveness.' },

  // Minnesota
  { name: 'Bobby Joe Champion', state: 'MN', party: 'democrat', role: 'President',
    bio: 'President of the Minnesota State Senate representing District 59 (Minneapolis). Attorney and civil rights leader in the DFL caucus.' },
  { name: 'Mark Johnson', state: 'MN', party: 'republican', role: 'Minority Leader',
    bio: 'Minority Leader of the Minnesota State Senate representing District 1 (East Grand Forks). Focuses on agriculture and rural issues.' },

  // Mississippi
  { name: 'Dennis DeBar', state: 'MS', party: 'republican', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the Mississippi State Senate representing District 15 (Leakesville). Leads chamber operations for the Republican majority.' },

  // Missouri
  { name: 'Cindy O\'Laughlin', state: 'MO', party: 'republican', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the Missouri State Senate representing District 18 (Shelbina). Rancher and leader of the Senate Republican caucus.' },
  { name: 'John Rizzo', state: 'MO', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the Missouri State Senate representing District 11 (Independence). Leads the Senate Democratic caucus on policy priorities.' },

  // Montana
  { name: 'Jason Ellsworth', state: 'MT', party: 'republican', role: 'President',
    bio: 'President of the Montana State Senate representing District 1 (Hamilton). Small business owner leading the Republican-controlled chamber.' },

  // Nebraska (unicameral — Speaker serves as leader)
  { name: 'Mike Hilgers', state: 'NE', party: 'republican', role: 'Speaker',
    bio: 'Speaker of the Nebraska Legislature (unicameral) representing District 21 (Lincoln). Attorney leading the officially nonpartisan chamber.' },

  // Nevada
  { name: 'Nicole Cannizzaro', state: 'NV', party: 'democrat', role: 'Majority Leader',
    bio: 'Majority Leader of the Nevada State Senate representing District 6 (Las Vegas). Prosecutor focused on public safety and workers\' rights.' },

  // New Hampshire
  { name: 'Jeb Bradley', state: 'NH', party: 'republican', role: 'President',
    bio: 'President of the New Hampshire State Senate representing District 3 (Wolfeboro). Former U.S. congressman and veteran state legislative leader.' },

  // New Jersey
  { name: 'Nick Scutari', state: 'NJ', party: 'democrat', role: 'President',
    bio: 'President of the New Jersey State Senate representing District 22 (Linden). Attorney who led cannabis legalization efforts in the state.' },
  { name: 'Anthony Bucco', state: 'NJ', party: 'republican', role: 'Minority Leader',
    bio: 'Minority Leader of the New Jersey State Senate representing District 25 (Boonton). Continues legacy of his late father in the Senate.' },

  // New Mexico
  { name: 'Mimi Stewart', state: 'NM', party: 'democrat', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the New Mexico State Senate representing District 17 (Albuquerque). Retired educator focused on public education funding.' },
  { name: 'Greg Baca', state: 'NM', party: 'republican', role: 'Minority Leader',
    bio: 'Minority Leader of the New Mexico State Senate representing District 29 (Belen). Rancher and advocate for rural New Mexico communities.' },

  // New York
  { name: 'Andrea Stewart-Cousins', state: 'NY', party: 'democrat', role: 'Majority Leader',
    bio: 'Majority Leader of the New York State Senate representing the 35th district since 2007. First woman and first African American to lead the chamber.' },
  { name: 'Robert Ortt', state: 'NY', party: 'republican', role: 'Minority Leader',
    bio: 'Minority Leader of the New York State Senate representing the 62nd district. Former mayor of North Tonawanda and Army veteran.' },

  // North Carolina
  { name: 'Phil Berger', state: 'NC', party: 'republican', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the North Carolina State Senate representing District 26 (Rockingham County). Longest-serving Senate leader in state history.' },
  { name: 'Dan Blue', state: 'NC', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the North Carolina State Senate representing District 14 (Raleigh). Former Speaker of the NC House and veteran legislator.' },

  // North Dakota
  { name: 'David Hogue', state: 'ND', party: 'republican', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the North Dakota State Senate representing District 38 (Minot). Attorney and leader in the Republican-dominated chamber.' },

  // Ohio
  { name: 'Matt Huffman', state: 'OH', party: 'republican', role: 'President',
    bio: 'President of the Ohio State Senate representing District 12 (Lima). Focuses on fiscal policy and education reform.' },
  { name: 'Nickie Antonio', state: 'OH', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the Ohio State Senate representing District 23 (Lakewood). First openly LGBTQ leader of a legislative caucus in Ohio.' },

  // Oklahoma
  { name: 'Greg Treat', state: 'OK', party: 'republican', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the Oklahoma State Senate representing District 47 (Oklahoma City). Leads the Republican supermajority in the chamber.' },
  { name: 'Kay Floyd', state: 'OK', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the Oklahoma State Senate representing District 46 (Oklahoma City). Attorney and advocate for LGBTQ rights and education.' },

  // Oregon
  { name: 'Rob Wagner', state: 'OR', party: 'democrat', role: 'President',
    bio: 'President of the Oregon State Senate representing District 19 (Lake Oswego). Former educator focused on education and environmental policy.' },
  { name: 'Tim Knopp', state: 'OR', party: 'republican', role: 'Minority Leader',
    bio: 'Minority Leader of the Oregon State Senate representing District 27 (Bend). Business owner focused on fiscal responsibility.' },

  // Pennsylvania
  { name: 'Kim Ward', state: 'PA', party: 'republican', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the Pennsylvania State Senate representing District 39. First woman to hold the position in Pennsylvania history.' },
  { name: 'Jay Costa', state: 'PA', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the Pennsylvania State Senate representing District 43 (Allegheny County). Veteran legislator focused on education funding.' },

  // Rhode Island
  { name: 'Dominick Ruggerio', state: 'RI', party: 'democrat', role: 'President',
    bio: 'President of the Rhode Island State Senate representing District 4 (North Providence). Longest-serving Senate President in Rhode Island history.' },

  // South Carolina
  { name: 'Thomas Alexander', state: 'SC', party: 'republican', role: 'President',
    bio: 'President of the South Carolina State Senate representing District 1 (Walhalla). Business owner and veteran legislator in the chamber.' },
  { name: 'Brad Hutto', state: 'SC', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the South Carolina State Senate representing District 40 (Orangeburg). Attorney and leader of the Democratic caucus.' },

  // South Dakota
  { name: 'Lee Schoenbeck', state: 'SD', party: 'republican', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the South Dakota State Senate representing District 5 (Watertown). Attorney and influential leader in the chamber.' },

  // Tennessee
  { name: 'Randy McNally', state: 'TN', party: 'republican', role: 'Lt. Governor/Speaker',
    bio: 'Lieutenant Governor and Speaker of the Tennessee State Senate representing District 5 (Oak Ridge). Pharmacist and longest-serving state senator in Tennessee.' },
  { name: 'Jeff Yarbro', state: 'TN', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the Tennessee State Senate representing District 21 (Nashville). Attorney focused on education and economic policy.' },

  // Texas
  { name: 'Joan Huffman', state: 'TX', party: 'republican', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the Texas State Senate representing District 17 (Houston). Former judge and chair of the Redistricting Committee.' },

  // Utah
  { name: 'Stuart Adams', state: 'UT', party: 'republican', role: 'President',
    bio: 'President of the Utah State Senate representing District 22 (Layton). Real estate developer and leader of the Republican-controlled chamber.' },

  // Vermont
  { name: 'Phil Baruth', state: 'VT', party: 'democrat', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the Vermont State Senate representing the Chittenden district. Author, professor, and progressive legislative leader.' },

  // Virginia
  { name: 'Louise Lucas', state: 'VA', party: 'democrat', role: 'President Pro Tem',
    bio: 'President Pro Tempore of the Virginia State Senate representing District 18 (Portsmouth). Longest-serving woman in the Virginia General Assembly.' },

  // Washington
  { name: 'Andy Billig', state: 'WA', party: 'democrat', role: 'Majority Leader',
    bio: 'Majority Leader of the Washington State Senate representing the 3rd district (Spokane). Businessman and community leader.' },
  { name: 'John Braun', state: 'WA', party: 'republican', role: 'Minority Leader',
    bio: 'Minority Leader of the Washington State Senate representing the 20th district (Centralia). Business owner focused on fiscal policy and rural communities.' },

  // West Virginia
  { name: 'Craig Blair', state: 'WV', party: 'republican', role: 'President',
    bio: 'President of the West Virginia State Senate representing District 15 (Martinsburg). Business owner and leader of the Senate Republican majority.' },

  // Wisconsin
  { name: 'Chris Kapenga', state: 'WI', party: 'republican', role: 'President',
    bio: 'President of the Wisconsin State Senate representing District 33 (Delafield). CPA and business owner focused on tax and regulatory reform.' },
  { name: 'Melissa Agard', state: 'WI', party: 'democrat', role: 'Minority Leader',
    bio: 'Minority Leader of the Wisconsin State Senate representing District 16 (Madison). Advocate for environmental policy and reproductive rights.' },

  // Wyoming
  { name: 'Ogden Driskill', state: 'WY', party: 'republican', role: 'President',
    bio: 'President of the Wyoming State Senate representing District 1 (Devils Tower). Rancher and conservative leader in the chamber.' },
]

// Build records for upsert
const records = leaders.map(l => {
  const stateName = STATE_NAMES[l.state]
  let title
  if (l.role === 'Speaker') {
    title = `Speaker of the Legislature, ${stateName}`
  } else {
    title = `State Senate ${l.role}, ${stateName}`
  }
  return {
    name: l.name,
    slug: slugify(l.name),
    state: l.state,
    chamber: 'state_senate',
    party: l.party,
    title,
    bio: l.bio,
    image_url: null,
  }
})

// Count states covered
const statesCovered = [...new Set(leaders.map(l => l.state))].sort()
console.log(`\nSeeding ${records.length} state senate leaders from ${statesCovered.length} states...`)
console.log(`States: ${statesCovered.join(', ')}`)

// Upsert in batches (Supabase 1000-row limit, but we're well under)
const { data, error } = await supabase
  .from('politicians')
  .upsert(records, { onConflict: 'slug' })
  .select('name, slug, state, title')

if (error) {
  console.error('\nError upserting:', error.message)
  process.exit(1)
}

console.log(`\nSuccessfully upserted ${data.length} state senate leaders:`)
for (const r of data) {
  console.log(`  [${r.state}] ${r.name} — ${r.title}`)
}
console.log('\nDone!')
