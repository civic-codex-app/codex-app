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
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ============================================================
// SECRETARIES OF STATE (elected in ~35 states)
// ============================================================
const SECRETARIES_OF_STATE = [
  { name: 'Wes Allen', state: 'AL', party: 'republican', bio: 'Secretary of State of Alabama since 2023. Former state representative and probate judge focused on election security and business filings.' },
  { name: 'Nancy Dahlstrom', state: 'AK', party: 'republican', bio: 'Secretary of State of Alaska since 2024. Former state representative and Commissioner of Corrections appointed by Governor Dunleavy.' },
  { name: 'Adrian Fontes', state: 'AZ', party: 'democrat', bio: 'Secretary of State of Arizona since 2023. Former Maricopa County Recorder who expanded early voting access, focused on election security and voter registration.' },
  { name: 'John Thurston', state: 'AR', party: 'republican', bio: 'Secretary of State of Arkansas since 2019. Former state land commissioner focused on election integrity, business services, and state archives.' },
  { name: 'Shirley Weber', state: 'CA', party: 'democrat', bio: 'Secretary of State of California since 2021. Former state assemblymember and professor, the first Black person to serve as California Secretary of State.' },
  { name: 'Jena Griswold', state: 'CO', party: 'democrat', bio: 'Secretary of State of Colorado since 2019. Youngest Secretary of State in the nation at time of election, focused on automatic voter registration and election security.' },
  { name: 'Stephanie Thomas', state: 'CT', party: 'democrat', bio: 'Secretary of State of Connecticut since 2023. Former state representative focused on expanding voter access and modernizing business services.' },
  { name: 'Jeff Bullock', state: 'DE', party: 'democrat', bio: 'Secretary of State of Delaware, serving since appointed. Oversees business entity filings in Delaware, one of the top states for corporate incorporation.' },
  { name: 'Cord Byrd', state: 'FL', party: 'republican', bio: 'Secretary of State of Florida since 2022. Former state representative appointed by Governor DeSantis, focused on election security and arts/cultural affairs.' },
  { name: 'Brad Raffensperger', state: 'GA', party: 'republican', bio: 'Secretary of State of Georgia since 2019. Professional engineer who gained national attention for defending 2020 election results. Focused on election security and business registration.' },
  { name: 'Phil McGrane', state: 'ID', party: 'republican', bio: 'Secretary of State of Idaho since 2023. Former Ada County Clerk focused on election administration, business filings, and government transparency.' },
  { name: 'Alexi Giannoulias', state: 'IL', party: 'democrat', bio: 'Secretary of State of Illinois since 2023. Former state treasurer focused on modernizing services including drivers licenses, vehicle registration, and the state library.' },
  { name: 'Diego Morales', state: 'IN', party: 'republican', bio: 'Secretary of State of Indiana since 2023. Immigrant from Guatemala focused on election integrity, business services, and securities regulation.' },
  { name: 'Paul Pate', state: 'IA', party: 'republican', bio: 'Secretary of State of Iowa since 2015. Also served 1999-2007. Former mayor of Cedar Rapids focused on election security and voter ID implementation.' },
  { name: 'Scott Schwab', state: 'KS', party: 'republican', bio: 'Secretary of State of Kansas since 2019. Former state representative focused on election administration and business filings.' },
  { name: 'Michael Adams', state: 'KY', party: 'republican', bio: 'Secretary of State of Kentucky since 2020. Election law attorney focused on bipartisan election reforms including expanded early voting.' },
  { name: 'Nancy Landry', state: 'LA', party: 'republican', bio: 'Secretary of State of Louisiana since 2024. Former state representative focused on election security, commercial filings, and archives.' },
  { name: 'Shenna Bellows', state: 'ME', party: 'democrat', bio: 'Secretary of State of Maine since 2021. Former ACLU of Maine executive director. Made national headlines for ruling on ballot access in 2024.' },
  { name: 'Susan Lee', state: 'MD', party: 'democrat', bio: 'Secretary of State of Maryland since 2023. Former state senator appointed by Governor Moore, focused on government services and international relations.' },
  { name: 'William Galvin', state: 'MA', party: 'democrat', bio: 'Secretary of State of Massachusetts since 1995. Longest-serving current Secretary of State in the nation, focused on elections, securities, and public records.' },
  { name: 'Jocelyn Benson', state: 'MI', party: 'democrat', bio: 'Secretary of State of Michigan since 2019. Former law school dean and election law expert focused on expanding voter access, election security, and auto services modernization.' },
  { name: 'Steve Simon', state: 'MN', party: 'democrat', bio: 'Secretary of State of Minnesota since 2015. Former state representative focused on election administration, business services, and voter participation.' },
  { name: 'Michael Watson', state: 'MS', party: 'republican', bio: 'Secretary of State of Mississippi since 2020. Former state senator focused on election integrity, business regulation, and charities oversight.' },
  { name: 'Jay Ashcroft', state: 'MO', party: 'republican', bio: 'Secretary of State of Missouri since 2017. Son of former U.S. Attorney General John Ashcroft, focused on election security, business filings, and state library.' },
  { name: 'Christi Jacobsen', state: 'MT', party: 'republican', bio: 'Secretary of State of Montana since 2021. Former chief of staff in the Secretary of State office focused on election administration and business services.' },
  { name: 'Bob Evnen', state: 'NE', party: 'republican', bio: 'Secretary of State of Nebraska since 2019. Election law attorney focused on election security, business filings, and administrative rules.' },
  { name: 'Cisco Aguilar', state: 'NV', party: 'democrat', bio: 'Secretary of State of Nevada since 2023. Former attorney and Nevada State Athletic Commission chairman focused on election security and business innovation.' },
  { name: 'David Scanlan', state: 'NH', party: 'republican', bio: 'Secretary of State of New Hampshire since 2022. Career elections administrator elected by the legislature, focused on election integrity.' },
  { name: 'Tahesha Way', state: 'NJ', party: 'democrat', bio: 'Secretary of State of New Jersey since 2023. Former mayor of Plainfield appointed by Governor Murphy, focused on elections and cultural affairs.' },
  { name: 'Maggie Toulouse Oliver', state: 'NM', party: 'democrat', bio: 'Secretary of State of New Mexico since 2016. Former Bernalillo County Clerk focused on election modernization and voter access.' },
  { name: 'Michael Fry', state: 'NC', party: 'republican', bio: 'Secretary of State of North Carolina since 2025. Former state senator focused on business registration and securities regulation.' },
  { name: 'Michael Howe', state: 'ND', party: 'republican', bio: 'Secretary of State of North Dakota since 2023. Former business executive focused on election administration and business services.' },
  { name: 'Frank LaRose', state: 'OH', party: 'republican', bio: 'Secretary of State of Ohio since 2019. Former state senator and Green Beret focused on election security, voter roll maintenance, and business filings.' },
  { name: 'Josh Cockroft', state: 'OK', party: 'republican', bio: 'Secretary of State of Oklahoma, appointed by the governor. Former state representative focused on election administration and government accountability.' },
  { name: 'LaVonne Griffin-Valade', state: 'OR', party: 'democrat', bio: 'Secretary of State of Oregon since 2023. Former Multnomah County auditor focused on government accountability, audits, and election administration.' },
  { name: 'Al Schmidt', state: 'PA', party: 'republican', bio: 'Secretary of State of Pennsylvania since 2023. Former Philadelphia City Commissioner known for defending 2020 election results, appointed by Governor Shapiro.' },
  { name: 'Gregg Amore', state: 'RI', party: 'democrat', bio: 'Secretary of State of Rhode Island since 2023. Former state representative and history teacher focused on election access and civic education.' },
  { name: 'Mark Hammond', state: 'SC', party: 'republican', bio: 'Secretary of State of South Carolina since 2003. Longest-serving current elected Secretary of State, focused on business filings and charity regulation.' },
  { name: 'Monae Johnson', state: 'SD', party: 'republican', bio: 'Secretary of State of South Dakota since 2023. Former deputy secretary of state focused on election integrity and business services.' },
  { name: 'Tre Hargett', state: 'TN', party: 'republican', bio: 'Secretary of State of Tennessee since 2009. Elected by the legislature, former state representative focused on business services and election oversight.' },
  { name: 'Jane Nelson', state: 'TX', party: 'republican', bio: 'Secretary of State of Texas since 2023. Former longtime state senator appointed by Governor Abbott, focused on election administration and border affairs.' },
  { name: 'Deidre Henderson', state: 'UT', party: 'republican', bio: 'Lieutenant Governor of Utah who serves as the state election authority. Former state senator focused on election administration and government transparency.' },
  { name: 'Sarah Copeland Hanzas', state: 'VT', party: 'democrat', bio: 'Secretary of State of Vermont since 2023. Former state representative and House majority leader focused on election access and business services.' },
  { name: 'Chuck Gray', state: 'WY', party: 'republican', bio: 'Secretary of State of Wyoming since 2023. Former state representative focused on election integrity and business filings.' },
  { name: 'Mac Warner', state: 'WV', party: 'republican', bio: 'Secretary of State of West Virginia since 2017. Retired Army officer and military attorney focused on election security and overseas voter access.' },
  { name: 'Sarah Godlewski', state: 'WI', party: 'democrat', bio: 'Secretary of State of Wisconsin since 2019. Former business executive focused on government transparency and the Great Seal of Wisconsin.' },
  { name: 'Chuck Gray', state: 'WY', party: 'republican', bio: 'Secretary of State of Wyoming since 2023. Former state representative focused on election integrity and government accountability.' },
]

// Deduplicate WY entry
const seenSoS = new Set()
const SECRETARIES_DEDUPED = SECRETARIES_OF_STATE.filter(s => {
  const key = s.state
  if (seenSoS.has(key)) return false
  seenSoS.add(key)
  return true
})

// ============================================================
// STATE TREASURERS (elected in ~35 states)
// ============================================================
const STATE_TREASURERS = [
  { name: 'Young Boozer', state: 'AL', party: 'republican', bio: 'State Treasurer of Alabama. Banker and financial executive focused on state investments, debt management, and the college savings program.' },
  { name: 'Mark Mitchell', state: 'AZ', party: 'democrat', bio: 'State Treasurer of Arizona since 2023. Former Tempe mayor focused on state investments, local government lending, and financial literacy.' },
  { name: 'Mark Lowery', state: 'AR', party: 'republican', bio: 'State Treasurer of Arkansas since 2023. Former state representative focused on state funds management and unclaimed property.' },
  { name: 'Fiona Ma', state: 'CA', party: 'democrat', bio: 'State Treasurer of California since 2019. Former state legislator and Board of Equalization member managing the largest sub-national investment pool in the world.' },
  { name: 'Dave Young', state: 'CO', party: 'democrat', bio: 'State Treasurer of Colorado since 2019. Former math teacher and state representative focused on state investments and public finance.' },
  { name: 'Erick Russell', state: 'CT', party: 'democrat', bio: 'State Treasurer of Connecticut since 2023. First openly LGBTQ person of color elected to statewide office in the U.S., focused on pension management and green bonds.' },
  { name: 'Colleen Davis', state: 'DE', party: 'democrat', bio: 'State Treasurer of Delaware since 2019. Former financial advisor focused on state cash management, debt issuance, and unclaimed property.' },
  { name: 'Jimmy Patronis', state: 'FL', party: 'republican', bio: 'Chief Financial Officer of Florida since 2017. Former state representative overseeing insurance regulation, fire marshal, and state finances.' },
  { name: 'Josh Mandel', state: 'OH', party: 'republican', bio: 'State Treasurer of Ohio. Marine Corps veteran and former state representative focused on state investments, transparency, and financial literacy programs.' },
  { name: 'Michael Fitzgerald', state: 'IA', party: 'democrat', bio: 'State Treasurer of Iowa since 1983. Longest-serving state treasurer in U.S. history, focused on college savings plans and financial literacy.' },
  { name: 'Steven Johnson', state: 'KS', party: 'republican', bio: 'State Treasurer of Kansas since 2023. Former state representative focused on unclaimed property, state investments, and KPERS oversight.' },
  { name: 'Mark Metcalf', state: 'KY', party: 'republican', bio: 'State Treasurer of Kentucky since 2024. Focused on state investments, unclaimed property, and financial transparency.' },
  { name: 'John Schroder', state: 'LA', party: 'republican', bio: 'State Treasurer of Louisiana since 2024. Former state representative focused on state investments and unclaimed property.' },
  { name: 'Dereck Davis', state: 'MD', party: 'democrat', bio: 'State Treasurer of Maryland since 2022. Former state delegate and House Economic Matters Committee chair focused on state debt and investments.' },
  { name: 'Deborah Goldberg', state: 'MA', party: 'democrat', bio: 'State Treasurer of Massachusetts since 2015. Former Brookline selectwoman focused on pension oversight, unclaimed property, and cannabis regulation.' },
  { name: 'Rachel Eubanks', state: 'MI', party: 'democrat', bio: 'State Treasurer of Michigan since 2023. Former chief investment officer appointed by Governor Whitmer to manage state finances and investments.' },
  { name: 'Vivek Malek', state: 'MO', party: 'republican', bio: 'State Treasurer of Missouri since 2023. Former investment professional and political newcomer focused on state investments and MO ABLE program.' },
  { name: 'Zach Conine', state: 'NV', party: 'democrat', bio: 'State Treasurer of Nevada since 2019. Former small business owner focused on state investments, college savings, and unclaimed property.' },
  { name: 'Tom DiNapoli', state: 'NY', party: 'democrat', bio: 'State Comptroller of New York since 2007. Sole trustee of the $268 billion state pension fund, focused on fiscal oversight and government accountability.' },
  { name: 'Dale Folwell', state: 'NC', party: 'republican', bio: 'State Treasurer of North Carolina since 2017. Former state legislator managing the $115 billion pension fund and state health plan.' },
  { name: 'Thomas Beadle', state: 'ND', party: 'republican', bio: 'State Treasurer of North Dakota since 2023. Former state representative focused on state investments and coal severance fund management.' },
  { name: 'Tobias Read', state: 'OR', party: 'democrat', bio: 'State Treasurer of Oregon since 2017. Former state representative managing the Oregon Investment Council and state debt.' },
  { name: 'Stacy Garrity', state: 'PA', party: 'republican', bio: 'State Treasurer of Pennsylvania since 2021. Retired Army colonel and Bronze Star recipient focused on unclaimed property, transparency, and PA 529 plans.' },
  { name: 'James Diossa', state: 'RI', party: 'democrat', bio: 'State Treasurer of Rhode Island since 2023. Former Central Falls mayor who guided the city out of bankruptcy, focused on pensions and financial literacy.' },
  { name: 'Curtis Loftis', state: 'SC', party: 'republican', bio: 'State Treasurer of South Carolina since 2011. Business executive focused on state investments, debt management, and Future Scholar 529 plan.' },
  { name: 'David McRae', state: 'MS', party: 'republican', bio: 'State Treasurer of Mississippi since 2020. Business executive focused on state investments, unclaimed property, and college savings.' },
  { name: 'Aaron Withe', state: 'ID', party: 'republican', bio: 'State Treasurer of Idaho since 2023. Former Freedom Foundation CEO focused on state investments and endowment fund management.' },
  { name: 'Mike Frerichs', state: 'IL', party: 'democrat', bio: 'State Treasurer of Illinois since 2015. Former state senator focused on Bright Start college savings, unclaimed property, and cannabis banking.' },
  { name: 'Daniel Elliott', state: 'IN', party: 'republican', bio: 'State Treasurer of Indiana since 2023. Former investment professional focused on state funds management and CollegeChoice 529 plans.' },
  { name: 'John Murante', state: 'NE', party: 'republican', bio: 'State Treasurer of Nebraska since 2023. Former state senator focused on unclaimed property, state investments, and NEST 529 plans.' },
  { name: 'Tim Berry', state: 'OH', party: 'republican', bio: 'State Treasurer of Ohio since 2023. Former state representative focused on state investments, transparency, and financial literacy programs.' },
  { name: 'Todd Russ', state: 'OK', party: 'republican', bio: 'State Treasurer of Oklahoma since 2023. Former state representative and community banker focused on state cash management and investments.' },
  { name: 'Riley Moore', state: 'WV', party: 'republican', bio: 'State Treasurer of West Virginia since 2021. Former state delegate focused on anti-ESG investing policies and state fund management.' },
  { name: 'John Parrott', state: 'WY', party: 'republican', bio: 'State Treasurer of Wyoming since 2023. Focused on state investments, mineral royalty trust fund, and unclaimed property.' },
  { name: 'Sarah Godlewski', state: 'WI', party: 'democrat', bio: 'Former State Treasurer of Wisconsin. Business executive who served focusing on unclaimed property and financial literacy.' },
]

// Remove Sarah Godlewski from treasurers since she moved to SoS; WI treasurer is now open/different
const STATE_TREASURERS_CLEAN = STATE_TREASURERS.filter(t => !(t.name === 'Sarah Godlewski' && t.state === 'WI'))

// ============================================================
// STATE COMPTROLLERS / AUDITORS (elected in ~25 states)
// ============================================================
const COMPTROLLERS_AUDITORS = [
  { name: 'Tom DiNapoli', state: 'NY', party: 'democrat', title: 'State Comptroller', bio: 'State Comptroller of New York since 2007. Sole trustee of the $268 billion state pension fund, focused on fiscal oversight and government accountability.' },
  { name: 'Susana Mendoza', state: 'IL', party: 'democrat', title: 'State Comptroller', bio: 'State Comptroller of Illinois since 2017. Former state representative and Chicago city clerk, focused on fiscal accountability and government spending transparency.' },
  { name: 'Grant Oen', state: 'MN', party: 'democrat', title: 'State Auditor', bio: 'State Auditor of Minnesota since 2023. Former nonprofit executive focused on government accountability and fiscal oversight of local governments.' },
  { name: 'Kathy McGuiness', state: 'DE', party: 'democrat', title: 'State Auditor', bio: 'State Auditor of Delaware since 2019. Former Sussex County official focused on government accountability and fiscal oversight.' },
  { name: 'Keith Faber', state: 'OH', party: 'republican', title: 'State Auditor', bio: 'State Auditor of Ohio since 2019. Former state Senate president focused on government accountability, fraud detection, and fiscal oversight.' },
  { name: 'Cindy Byrd', state: 'OK', party: 'republican', title: 'State Auditor', bio: 'State Auditor and Inspector of Oklahoma since 2019. Former county assessor focused on government accountability and fraud prevention.' },
  { name: 'JB McCuskey', state: 'WV', party: 'republican', title: 'State Auditor', bio: 'State Auditor of West Virginia since 2017. Attorney focused on government spending oversight and fraud prevention.' },
  { name: 'Andrew Fink', state: 'MI', party: 'republican', title: 'State Auditor', bio: 'Auditor General of Michigan. Appointed by the legislature focused on performance audits and financial oversight of state agencies.' },
  { name: 'Dafna Michaelson Jenet', state: 'CO', party: 'democrat', title: 'State Auditor', bio: 'State Auditor of Colorado. Former state representative focused on government accountability and performance auditing.' },
  { name: 'Diana DiZoglio', state: 'MA', party: 'democrat', title: 'State Auditor', bio: 'State Auditor of Massachusetts since 2023. Former state senator focused on government accountability, transparency, and auditing MBTA and state agencies.' },
  { name: 'Timothy Keller', state: 'NM', party: 'democrat', title: 'State Auditor', bio: 'State Auditor of New Mexico since 2015. Former state senator focused on government accountability, fraud prevention, and financial oversight.' },
  { name: 'Josh Gallion', state: 'ND', party: 'republican', title: 'State Auditor', bio: 'State Auditor of North Dakota since 2017. Focused on financial and performance audits of state and local governments.' },
  { name: 'Dave Yost', state: 'OH', party: 'republican', title: 'State Attorney General (former Auditor)', bio: 'Former State Auditor of Ohio who transitioned to Attorney General.' },
  { name: 'Elliot Schlanger', state: 'MD', party: 'democrat', title: 'State Comptroller', bio: 'State Comptroller of Maryland. Focused on tax administration, central payroll, and general accounting for the state.' },
  { name: 'Sean Scanlon', state: 'CT', party: 'democrat', title: 'State Comptroller', bio: 'State Comptroller of Connecticut since 2023. Former state representative focused on state employee benefits, retirement, and healthcare cost reduction.' },
]

// Remove Dave Yost duplicate (he's AG not auditor anymore)
const COMPTROLLERS_CLEAN = COMPTROLLERS_AUDITORS.filter(c => c.name !== 'Dave Yost')

// ============================================================
// COMMISSIONERS OF AGRICULTURE (elected in ~10 states)
// ============================================================
const AG_COMMISSIONERS = [
  { name: 'Rick Pate', state: 'AL', party: 'republican', title: 'Commissioner of Agriculture', bio: 'Commissioner of Agriculture and Industries of Alabama since 2019. Cattle rancher focused on agricultural development, food safety, and farmers market promotion.' },
  { name: 'Wilton Simpson', state: 'FL', party: 'republican', title: 'Commissioner of Agriculture', bio: 'Commissioner of Agriculture of Florida since 2023. Former state Senate president and egg farmer focused on agriculture, consumer services, and concealed weapons licensing.' },
  { name: 'Tyler Harper', state: 'GA', party: 'republican', title: 'Commissioner of Agriculture', bio: 'Commissioner of Agriculture of Georgia since 2023. Former state senator and farmer focused on agricultural development and consumer protection.' },
  { name: 'Mike Naig', state: 'IA', party: 'republican', title: 'Secretary of Agriculture', bio: 'Secretary of Agriculture of Iowa since 2018. Career agriculture official focused on soil conservation, water quality, and supporting Iowa farmers.' },
  { name: 'Jonathan Quarles', state: 'KY', party: 'republican', title: 'Commissioner of Agriculture', bio: 'Commissioner of Agriculture of Kentucky since 2024. Focused on supporting Kentucky farmers, hemp industry development, and rural economic growth.' },
  { name: 'Mike Strain', state: 'LA', party: 'republican', title: 'Commissioner of Agriculture', bio: 'Commissioner of Agriculture and Forestry of Louisiana since 2008. Veterinarian focused on forestry, animal health, and agricultural development.' },
  { name: 'Steve Troxler', state: 'NC', party: 'republican', title: 'Commissioner of Agriculture', bio: 'Commissioner of Agriculture of North Carolina since 2005. Farmer focused on food safety, farmland preservation, and agricultural exports.' },
  { name: 'Walt Helmick', state: 'WV', party: 'democrat', title: 'Commissioner of Agriculture', bio: 'Commissioner of Agriculture of West Virginia. Focused on supporting Appalachian farming, organic agriculture, and farmers markets.' },
  { name: 'Doug Goehring', state: 'ND', party: 'republican', title: 'Commissioner of Agriculture', bio: 'Commissioner of Agriculture of North Dakota since 2009. Farmer focused on trade promotion, noxious weed control, and pesticide regulation.' },
  { name: 'Sid Miller', state: 'TX', party: 'republican', title: 'Commissioner of Agriculture', bio: 'Commissioner of Agriculture of Texas since 2015. Former state representative and rodeo competitor focused on rural Texas, school nutrition, and pesticide regulation.' },
]

// ============================================================
// TERRITORY OFFICIALS
// ============================================================
const TERRITORY_OFFICIALS = [
  // Puerto Rico
  { name: 'Jenniffer Gonzalez-Colon', state: 'PR', party: 'republican', title: 'Governor of Puerto Rico', bio: 'Governor of Puerto Rico since January 2025. Former Resident Commissioner to the U.S. Congress and statehood advocate focused on economic recovery and disaster resilience.', chamber: 'governor' },
  { name: 'William Villafane', state: 'PR', party: 'republican', title: 'Resident Commissioner', bio: 'Resident Commissioner of Puerto Rico to the U.S. Congress. Non-voting member representing Puerto Rico in the House of Representatives.', chamber: 'house' },
  // Guam
  { name: 'Lou Leon Guerrero', state: 'GU', party: 'democrat', title: 'Governor of Guam', bio: 'Governor of Guam since 2019. Former senator and banker, the first female governor of Guam, focused on healthcare, education, and military buildup preparation.', chamber: 'governor' },
  { name: 'James Moylan', state: 'GU', party: 'republican', title: 'Delegate to Congress', bio: 'Delegate from Guam to the U.S. House of Representatives since 2023. Former senator focused on military affairs and island infrastructure.', chamber: 'house' },
  // US Virgin Islands
  { name: 'Albert Bryan Jr.', state: 'VI', party: 'democrat', title: 'Governor of U.S. Virgin Islands', bio: 'Governor of the U.S. Virgin Islands since 2019. Former labor commissioner focused on hurricane recovery, economic development, and infrastructure modernization.', chamber: 'governor' },
  { name: 'Stacey Plaskett', state: 'VI', party: 'democrat', title: 'Delegate to Congress', bio: 'Delegate from the U.S. Virgin Islands to the U.S. House since 2015. Former DOJ attorney and House impeachment manager focused on Caribbean economic development.', chamber: 'house' },
  // American Samoa
  { name: 'Lemanu Peleti Mauga', state: 'AS', party: 'democrat', title: 'Governor of American Samoa', bio: 'Governor of American Samoa since 2021. Former lieutenant governor and Navy veteran focused on economic development and cultural preservation.', chamber: 'governor' },
  { name: 'Aumua Amata Coleman Radewagen', state: 'AS', party: 'republican', title: 'Delegate to Congress', bio: 'Delegate from American Samoa to the U.S. House since 2015. First female delegate from American Samoa focused on veterans affairs and natural resources.', chamber: 'house' },
  // CNMI (Commonwealth of the Northern Mariana Islands)
  { name: 'Arnold Palacios', state: 'MP', party: 'independent', title: 'Governor of CNMI', bio: 'Governor of the Commonwealth of the Northern Mariana Islands since 2023. Former lieutenant governor and legislator focused on fiscal reform and economic recovery.', chamber: 'governor' },
  { name: 'Gregorio Kilili Camacho Sablan', state: 'MP', party: 'democrat', title: 'Delegate to Congress', bio: 'Delegate from the CNMI to the U.S. House since 2009. Longest-serving CNMI delegate focused on labor, immigration, and Pacific island affairs.', chamber: 'house' },
  // DC
  { name: 'Muriel Bowser', state: 'DC', party: 'democrat', title: 'Mayor of Washington, D.C.', bio: 'Mayor of Washington, D.C. since 2015. Former council member serving her third term, focused on affordable housing, public safety, and DC statehood advocacy.', chamber: 'mayor' },
  { name: 'Phil Mendelson', state: 'DC', party: 'democrat', title: 'Chairman, DC Council', bio: 'Chairman of the Council of the District of Columbia since 2012. Longest-serving current council member focused on legislation, budget oversight, and DC governance.', chamber: 'city_council' },
  { name: 'Eleanor Holmes Norton', state: 'DC', party: 'democrat', title: 'Delegate to Congress', bio: 'Delegate from the District of Columbia to the U.S. House since 1991. Civil rights leader and law professor focused on DC statehood and voting rights.', chamber: 'house' },
]

// ============================================================
// BUILD AND UPSERT
// ============================================================
async function main() {
  const records = []

  // Secretaries of State
  for (const s of SECRETARIES_DEDUPED) {
    records.push({
      name: s.name,
      slug: slugify(s.name),
      state: s.state,
      chamber: 'governor', // statewide office
      party: s.party,
      title: 'Secretary of State',
      bio: s.bio,
      image_url: null,
    })
  }

  // State Treasurers
  for (const t of STATE_TREASURERS_CLEAN) {
    // Skip Tom DiNapoli here — he's in comptrollers
    if (t.name === 'Tom DiNapoli') continue
    records.push({
      name: t.name,
      slug: slugify(t.name),
      state: t.state,
      chamber: 'governor',
      party: t.party,
      title: t.title || 'State Treasurer',
      bio: t.bio,
      image_url: null,
    })
  }

  // Comptrollers / Auditors
  for (const c of COMPTROLLERS_CLEAN) {
    records.push({
      name: c.name,
      slug: slugify(c.name),
      state: c.state,
      chamber: 'governor',
      party: c.party,
      title: c.title,
      bio: c.bio,
      image_url: null,
    })
  }

  // Agriculture Commissioners
  for (const a of AG_COMMISSIONERS) {
    records.push({
      name: a.name,
      slug: slugify(a.name),
      state: a.state,
      chamber: 'governor',
      party: a.party,
      title: a.title,
      bio: a.bio,
      image_url: null,
    })
  }

  // Territory Officials
  for (const t of TERRITORY_OFFICIALS) {
    records.push({
      name: t.name,
      slug: slugify(t.name),
      state: t.state,
      chamber: t.chamber || 'governor',
      party: t.party,
      title: t.title,
      bio: t.bio,
      image_url: null,
    })
  }

  // Deduplicate by slug (keep first occurrence)
  const seen = new Set()
  const unique = []
  for (const r of records) {
    if (seen.has(r.slug)) {
      console.log(`  Skipping duplicate slug: ${r.slug} (${r.name}, ${r.title})`)
      continue
    }
    seen.add(r.slug)
    unique.push(r)
  }

  console.log(`Total unique records to upsert: ${unique.length}`)
  console.log(`  Secretaries of State: ${SECRETARIES_DEDUPED.length}`)
  console.log(`  State Treasurers: ${STATE_TREASURERS_CLEAN.filter(t => t.name !== 'Tom DiNapoli').length}`)
  console.log(`  Comptrollers/Auditors: ${COMPTROLLERS_CLEAN.length}`)
  console.log(`  Ag Commissioners: ${AG_COMMISSIONERS.length}`)
  console.log(`  Territory Officials: ${TERRITORY_OFFICIALS.length}`)

  // Upsert in batches of 50
  const BATCH = 50
  let inserted = 0
  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH)
    const { data, error } = await supabase
      .from('politicians')
      .upsert(batch, { onConflict: 'slug' })
      .select('id')

    if (error) {
      console.error(`Error upserting batch ${i / BATCH + 1}:`, error.message)
      // Try one by one for this batch
      for (const record of batch) {
        const { error: singleErr } = await supabase
          .from('politicians')
          .upsert(record, { onConflict: 'slug' })
        if (singleErr) {
          console.error(`  Failed: ${record.name} (${record.state}) - ${singleErr.message}`)
        } else {
          inserted++
        }
      }
    } else {
      inserted += batch.length
      console.log(`  Batch ${Math.floor(i / BATCH) + 1}: ${batch.length} records`)
    }
  }

  console.log(`\nDone! Upserted ${inserted} statewide officers.`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
