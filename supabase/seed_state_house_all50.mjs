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
  MT: 'Montana', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico',
  NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
  WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'
}

// Nebraska is unicameral (no state house) — excluded.
// Data reflects real officeholders as of early 2025.
// Some states use "Assembly" instead of "House" (CA, NV, NJ, NY, WI).

const OFFICIALS = [
  // Alabama
  { name: 'Nathaniel Ledbetter', state: 'AL', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Alabama House of Representatives. Represents District 24 (Rainsville) and previously served as House Majority Leader.' },
  { name: 'Anthony Daniels', state: 'AL', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Alabama House of Representatives. Represents District 53 (Huntsville) and is the first Black House Minority Leader in Alabama history.' },

  // Alaska
  { name: 'Cathy Tilton', state: 'AK', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Alaska House of Representatives. Represents District 12 (Wasilla) and focuses on resource development and fiscal responsibility.' },
  { name: 'Calvin Schrage', state: 'AK', party: 'independent', role: 'minority_leader',
    bio: 'Leader of the House minority coalition in the Alaska Legislature. Represents District 25 (Anchorage) as an independent.' },

  // Arizona
  { name: 'Ben Toma', state: 'AZ', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Arizona House of Representatives. Represents District 27 (Peoria) and is a business owner focused on tax and regulatory reform.' },
  { name: 'Lupe Contreras', state: 'AZ', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Arizona House of Representatives. Represents District 19 (Avondale) and advocates for education and worker protections.' },

  // Arkansas
  { name: 'Brian Evans', state: 'AR', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Arkansas House of Representatives. Represents District 43 (Cabot) and focuses on conservative fiscal policies.' },
  { name: 'Tippi McCullough', state: 'AR', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Arkansas House of Representatives. Represents District 60 (Little Rock) and is the first openly LGBTQ caucus leader in Arkansas history.' },

  // California
  { name: 'Robert Rivas', state: 'CA', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the California State Assembly. Represents District 29 (Salinas) and is the first Latino Speaker in over a century, focused on agriculture and housing.' },
  { name: 'James Gallagher', state: 'CA', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the California State Assembly. Represents District 3 (Yuba City) and advocates for water policy, agriculture, and fiscal accountability.' },

  // Colorado
  { name: 'Julie McCluskie', state: 'CO', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Colorado House of Representatives. Represents District 13 (Dillon) in the mountain communities and previously chaired the Joint Budget Committee.' },
  { name: 'Rose Pugliese', state: 'CO', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Colorado House of Representatives. Represents District 55 (Grand Junction) and focuses on energy, water, and rural issues.' },

  // Connecticut
  { name: 'Matt Ritter', state: 'CT', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Connecticut House of Representatives. Represents the 1st District (Hartford) and is the youngest Speaker in Connecticut history.' },
  { name: 'Vincent Candelora', state: 'CT', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Connecticut House of Representatives. Represents the 86th District (North Branford) and focuses on fiscal policy and government reform.' },

  // Delaware
  { name: 'Valerie Longhurst', state: 'DE', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Delaware House of Representatives. Represents District 15 (Bear) and is the first woman to serve as Speaker in Delaware.' },
  { name: 'Michael Ramone', state: 'DE', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Delaware House of Representatives. Represents District 21 (Middletown) and is a small business owner focused on economic development.' },

  // Florida
  { name: 'Daniel Perez', state: 'FL', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Florida House of Representatives. Represents District 116 (Miami) and focuses on fiscal conservatism and economic growth.' },
  { name: 'Fentrice Driskell', state: 'FL', party: 'democrat', role: 'minority_leader',
    bio: 'Leader of the Florida House Democratic Caucus. Represents District 67 (Tampa) and is an attorney focused on civil rights and healthcare access.' },

  // Georgia
  { name: 'Jon Burns', state: 'GA', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Georgia House of Representatives. Represents District 159 (Newington) and is a farmer and longtime legislator focused on rural issues.' },
  { name: 'James Beverly', state: 'GA', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Georgia House of Representatives. Represents District 143 (Macon) and advocates for education, healthcare, and economic opportunity.' },

  // Hawaii
  { name: 'Scott Saiki', state: 'HI', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Hawaii House of Representatives. Represents District 26 (Downtown Honolulu) and is an attorney who has served in the legislature since 1994.' },
  { name: 'Val Okimoto', state: 'HI', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Hawaii House of Representatives. Represents District 36 (Mililani) and focuses on government accountability and economic issues.' },

  // Idaho
  { name: 'Mike Moyle', state: 'ID', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Idaho House of Representatives. Represents District 10 (Star) and previously served as Majority Leader for over a decade.' },
  { name: 'Ilana Rubel', state: 'ID', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Idaho House of Representatives. Represents District 18 (Boise) and is an attorney focused on education and environmental policy.' },

  // Illinois
  { name: 'Emanuel Chris Welch', state: 'IL', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Illinois House of Representatives. Represents District 7 (Hillside) and is the first Black Speaker in Illinois history.' },
  { name: 'Tony McCombie', state: 'IL', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Illinois House of Representatives. Represents District 71 (Savanna) and is the first woman to lead the House Republican caucus in Illinois.' },

  // Indiana
  { name: 'Todd Huston', state: 'IN', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Indiana House of Representatives. Represents District 37 (Fishers) and is a former education executive focused on workforce and fiscal policy.' },
  { name: 'Phil GiaQuinta', state: 'IN', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Indiana House of Representatives. Represents District 80 (Fort Wayne) and focuses on education, labor, and healthcare issues.' },

  // Iowa
  { name: 'Pat Grassley', state: 'IA', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Iowa House of Representatives. Represents District 57 (New Hartford) and is the grandson of U.S. Senator Chuck Grassley.' },
  { name: 'Jennifer Konfrst', state: 'IA', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Iowa House of Representatives. Represents District 43 (Windsor Heights) and is a former communications professor.' },

  // Kansas
  { name: 'Dan Hawkins', state: 'KS', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Kansas House of Representatives. Represents District 100 (Wichita) and focuses on conservative fiscal policies and business growth.' },
  { name: 'Vic Miller', state: 'KS', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Kansas House of Representatives. Represents District 58 (Topeka) and is a retired attorney focused on education and healthcare.' },

  // Kentucky
  { name: 'David Osborne', state: 'KY', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Kentucky House of Representatives. Represents District 59 (Prospect) and has led the chamber since 2019.' },
  { name: 'Derrick Graham', state: 'KY', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Kentucky House of Representatives. Represents District 57 (Frankfort) and is a retired educator focused on public education funding.' },

  // Louisiana
  { name: 'Phillip DeVillier', state: 'LA', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Louisiana House of Representatives. Represents District 41 (Eunice) and is a rice farmer focused on agriculture and rural development.' },
  { name: 'Matthew Willard', state: 'LA', party: 'democrat', role: 'minority_leader',
    bio: 'Leader of the Louisiana House Democratic Caucus. Represents District 97 (New Orleans) and focuses on criminal justice reform and education.' },

  // Maine
  { name: 'Rachel Talbot Ross', state: 'ME', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Maine House of Representatives. Represents District 40 (Portland) and is the first Black person to serve as Speaker in Maine.' },
  { name: 'Billy Bob Faulkingham', state: 'ME', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Maine House of Representatives. Represents District 2 (Winter Harbor) and is a commercial lobsterman.' },

  // Maryland
  { name: 'Adrienne Jones', state: 'MD', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Maryland House of Delegates. Represents District 10 (Baltimore County) and is the first Black woman and first woman to serve as Speaker in Maryland.' },
  { name: 'Jason Buckel', state: 'MD', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Maryland House of Delegates. Represents District 1B (Allegany County) and focuses on fiscal responsibility and rural development.' },

  // Massachusetts
  { name: 'Ronald Mariano', state: 'MA', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Massachusetts House of Representatives. Represents the 3rd Norfolk District (Quincy) and has served in the legislature since 1992.' },
  { name: 'Bradley Jones', state: 'MA', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Massachusetts House of Representatives. Represents the 20th Middlesex District (North Reading) and has led the caucus since 2003.' },

  // Michigan
  { name: 'Joe Tate', state: 'MI', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Michigan House of Representatives. Represents District 10 (Detroit) and is the first Black Speaker in Michigan history, a former Marine and NFL player.' },
  { name: 'Matt Hall', state: 'MI', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Michigan House of Representatives. Represents District 42 (Richland) and focuses on economic policy and government reform.' },

  // Minnesota
  { name: 'Melissa Hortman', state: 'MN', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Minnesota House of Representatives. Represents District 34B (Brooklyn Park) and is an attorney focused on energy and education policy.' },
  { name: 'Lisa Demuth', state: 'MN', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Minnesota House of Representatives. Represents District 13A (Cold Spring) and focuses on education and local government.' },

  // Mississippi
  { name: 'Jason White', state: 'MS', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Mississippi House of Representatives. Represents District 48 (West) and is an attorney who succeeded Philip Gunn as Speaker in 2024.' },
  { name: 'Robert Johnson III', state: 'MS', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Mississippi House of Representatives. Represents District 94 (Natchez) and focuses on education and healthcare in the Delta region.' },

  // Missouri
  { name: 'Jon Patterson', state: 'MO', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Missouri House of Representatives. Represents District 30 (Lee\'s Summit) and is a physician focused on healthcare and fiscal policy.' },
  { name: 'Crystal Quade', state: 'MO', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Missouri House of Representatives. Represents District 132 (Springfield) and focuses on healthcare access and social services.' },

  // Montana
  { name: 'Matt Regier', state: 'MT', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Montana House of Representatives. Represents District 4 (Kalispell) and is a small business owner focused on property rights and fiscal conservatism.' },
  { name: 'Kim Abbott', state: 'MT', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Montana House of Representatives. Represents District 83 (Helena) and focuses on public lands, healthcare, and education.' },

  // Nevada
  { name: 'Steve Yeager', state: 'NV', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Nevada Assembly. Represents District 9 (Las Vegas) and is a public defender focused on criminal justice reform and education.' },
  { name: 'P.K. O\'Neill', state: 'NV', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Nevada Assembly. Represents District 40 (Carson City) and is a retired law enforcement officer focused on public safety.' },

  // New Hampshire
  { name: 'Sherman Packard', state: 'NH', party: 'republican', role: 'speaker',
    bio: 'Speaker of the New Hampshire House of Representatives. Represents Rockingham District 5 (Londonderry) and is the longest-serving member of the chamber.' },
  { name: 'Matt Wilhelm', state: 'NH', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the New Hampshire House of Representatives. Represents Manchester Ward 5 and focuses on education funding and healthcare.' },

  // New Jersey
  { name: 'Craig Coughlin', state: 'NJ', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the New Jersey General Assembly. Represents District 19 (Woodbridge) and is an attorney focused on economic development and labor policy.' },
  { name: 'John DiMaio', state: 'NJ', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the New Jersey General Assembly. Represents District 23 (Warren/Hunterdon) and focuses on tax relief and government reform.' },

  // New Mexico
  { name: 'Javier Martinez', state: 'NM', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the New Mexico House of Representatives. Represents District 11 (Albuquerque) and is the first Latino Speaker in New Mexico in decades.' },
  { name: 'Rod Montoya', state: 'NM', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the New Mexico House of Representatives. Represents District 1 (Farmington) and focuses on oil and gas, water, and rural issues.' },

  // New York
  { name: 'Carl Heastie', state: 'NY', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the New York State Assembly. Represents District 83 (Bronx) and is the first Black Speaker in New York history, serving since 2015.' },
  { name: 'William Barclay', state: 'NY', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the New York State Assembly. Represents District 120 (Oswego County) and focuses on fiscal responsibility and upstate economic development.' },

  // North Carolina
  { name: 'Tim Moore', state: 'NC', party: 'republican', role: 'speaker',
    bio: 'Speaker of the North Carolina House of Representatives. Represents District 111 (Kings Mountain) and has served as Speaker since 2015.' },
  { name: 'Robert Reives II', state: 'NC', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the North Carolina House of Representatives. Represents District 54 (Chatham County) and is an attorney focused on education and Medicaid expansion.' },

  // North Dakota
  { name: 'Dennis Johnson', state: 'ND', party: 'republican', role: 'speaker',
    bio: 'Speaker of the North Dakota House of Representatives. Represents District 15 (Devils Lake) and focuses on agriculture, energy, and fiscal policy.' },
  { name: 'Corey Mock', state: 'ND', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the North Dakota House of Representatives. Represents District 18 (Grand Forks) and focuses on education and government transparency.' },

  // Ohio
  { name: 'Jason Stephens', state: 'OH', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Ohio House of Representatives. Represents District 93 (Kitts Hill) and won a contested Speaker election with bipartisan support in 2023.' },
  { name: 'Allison Russo', state: 'OH', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Ohio House of Representatives. Represents District 7 (Upper Arlington) and is a public health researcher focused on healthcare policy.' },

  // Oklahoma
  { name: 'Charles McCall', state: 'OK', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Oklahoma House of Representatives. Represents District 22 (Atoka) and is a banker who has led the chamber since 2017.' },
  { name: 'Cyndi Munson', state: 'OK', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Oklahoma House of Representatives. Represents District 85 (Oklahoma City) and is the first Asian American to lead a legislative caucus in Oklahoma.' },

  // Oregon
  { name: 'Julie Fahey', state: 'OR', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Oregon House of Representatives. Represents District 14 (Eugene/West Lane County) and focuses on housing, childcare, and workforce development.' },
  { name: 'Jeff Helfrich', state: 'OR', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Oregon House of Representatives. Represents District 52 (Hood River) and is a former law enforcement officer focused on public safety.' },

  // Pennsylvania
  { name: 'Joanna McClinton', state: 'PA', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Pennsylvania House of Representatives. Represents District 191 (Philadelphia) and is the first woman and first Black person to serve as Speaker in Pennsylvania.' },
  { name: 'Bryan Cutler', state: 'PA', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Pennsylvania House of Representatives. Represents District 100 (Lancaster County) and formerly served as Speaker.' },

  // Rhode Island
  { name: 'Joseph Shekarchi', state: 'RI', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Rhode Island House of Representatives. Represents District 23 (Warwick) and is an attorney of Iranian descent focused on economic development.' },
  { name: 'Michael Chippendale', state: 'RI', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Rhode Island House of Representatives. Represents District 40 (Foster/Glocester) and focuses on fiscal conservatism and government reform.' },

  // South Carolina
  { name: 'Murrell Smith', state: 'SC', party: 'republican', role: 'speaker',
    bio: 'Speaker of the South Carolina House of Representatives. Represents District 67 (Sumter) and is an attorney who has served in the House since 2001.' },
  { name: 'Todd Rutherford', state: 'SC', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the South Carolina House of Representatives. Represents District 74 (Columbia) and is a criminal defense attorney and longtime caucus leader.' },

  // South Dakota
  { name: 'Hugh Bartels', state: 'SD', party: 'republican', role: 'speaker',
    bio: 'Speaker of the South Dakota House of Representatives. Represents District 5 (Watertown) and focuses on agriculture and fiscal responsibility.' },
  { name: 'Oren Lesmeister', state: 'SD', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the South Dakota House of Representatives. Represents District 28A (Parade) and is a rancher focused on rural and tribal issues.' },

  // Tennessee
  { name: 'Cameron Sexton', state: 'TN', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Tennessee House of Representatives. Represents District 25 (Crossville) and has led the chamber since 2019.' },
  { name: 'Karen Camper', state: 'TN', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Tennessee House of Representatives. Represents District 87 (Memphis) and is a retired Army officer and advocate for veterans and education.' },

  // Texas
  { name: 'Dade Phelan', state: 'TX', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Texas House of Representatives. Represents District 21 (Beaumont) and has led the 150-member chamber since 2021.' },
  { name: 'Trey Martinez Fischer', state: 'TX', party: 'democrat', role: 'minority_leader',
    bio: 'Leader of the Texas House Democratic Caucus. Represents District 116 (San Antonio) and focuses on voting rights and healthcare access.' },

  // Utah
  { name: 'Mike Schultz', state: 'UT', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Utah House of Representatives. Represents District 11 (Hooper) and focuses on education funding and economic development.' },
  { name: 'Angela Romero', state: 'UT', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Utah House of Representatives. Represents District 26 (Salt Lake City) and focuses on criminal justice reform and social services.' },

  // Vermont
  { name: 'Jill Krowinski', state: 'VT', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Vermont House of Representatives. Represents Chittenden 6-4 (Burlington) and is the first woman to serve as Speaker in Vermont.' },
  { name: 'Patricia McCoy', state: 'VT', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Vermont House of Representatives. Represents Bennington 2 and focuses on fiscal responsibility and rural economic development.' },

  // Virginia
  { name: 'Don Scott', state: 'VA', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Virginia House of Delegates. Represents District 80 (Portsmouth) and is the first Black Speaker in Virginia history.' },
  { name: 'Todd Gilbert', state: 'VA', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Virginia House of Delegates. Represents District 1 (Shenandoah County) and previously served as Speaker from 2022 to 2024.' },

  // Washington
  { name: 'Laurie Jinkins', state: 'WA', party: 'democrat', role: 'speaker',
    bio: 'Speaker of the Washington House of Representatives. Represents District 27 (Tacoma) and is the first openly LGBTQ Speaker in Washington state history.' },
  { name: 'Drew Stokesbary', state: 'WA', party: 'republican', role: 'minority_leader',
    bio: 'Minority Leader of the Washington House of Representatives. Represents District 31 (Auburn) and is an attorney focused on tax policy and government accountability.' },

  // West Virginia
  { name: 'Roger Hanshaw', state: 'WV', party: 'republican', role: 'speaker',
    bio: 'Speaker of the West Virginia House of Delegates. Represents District 33 (Clay County) and is an attorney and engineer who has led the chamber since 2019.' },
  { name: 'Shawn Fluharty', state: 'WV', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the West Virginia House of Delegates. Represents District 1 (Ohio County/Wheeling) and focuses on economic development and workers\' rights.' },

  // Wisconsin
  { name: 'Robin Vos', state: 'WI', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Wisconsin State Assembly. Represents District 63 (Rochester) and is the longest-serving Speaker in Wisconsin history.' },
  { name: 'Greta Neubauer', state: 'WI', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Wisconsin State Assembly. Represents District 66 (Racine) and focuses on clean energy, education, and government transparency.' },

  // Wyoming
  { name: 'Albert Sommers', state: 'WY', party: 'republican', role: 'speaker',
    bio: 'Speaker of the Wyoming House of Representatives. Represents District 20 (Pinedale) and is a rancher focused on natural resources and agriculture.' },
  { name: 'Mike Yin', state: 'WY', party: 'democrat', role: 'minority_leader',
    bio: 'Minority Leader of the Wyoming House of Representatives. Represents District 16 (Jackson) and focuses on public lands, tourism, and affordable housing.' },
]

// Build upsert rows
const rows = OFFICIALS.map(o => {
  const chamberLabel = ['CA', 'NV', 'NJ', 'NY', 'WI'].includes(o.state) ? 'Assembly' : 'House'
  const delegatesLabel = ['MD', 'VA', 'WV'].includes(o.state) ? 'House of Delegates' : null
  const displayChamber = delegatesLabel || (chamberLabel === 'Assembly' ? 'Assembly' : 'House')

  let title
  if (o.role === 'speaker') {
    title = `Speaker of the ${displayChamber}, ${STATE_NAMES[o.state]}`
  } else {
    title = `${displayChamber} Minority Leader, ${STATE_NAMES[o.state]}`
  }

  return {
    name: o.name,
    slug: slugify(o.name),
    state: o.state,
    chamber: 'state_house',
    party: o.party,
    title,
    bio: o.bio,
    image_url: null,
    website_url: null,
  }
})

console.log(`Upserting ${rows.length} state house officials...`)

// Upsert in batches of 50
const BATCH = 50
let total = 0
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH)
  const { data, error } = await supabase
    .from('politicians')
    .upsert(batch, { onConflict: 'slug' })
    .select('id')

  if (error) {
    console.error(`Error at batch ${i}:`, error.message)
    process.exit(1)
  }
  total += data.length
  console.log(`  Batch ${Math.floor(i / BATCH) + 1}: ${data.length} rows`)
}

console.log(`Done. ${total} state house speakers & minority leaders upserted.`)

// Summary by state
const states = [...new Set(OFFICIALS.map(o => o.state))].sort()
console.log(`States covered: ${states.length} (${states.join(', ')})`)
