// ============================================================
// Seed: Real 2026 Candidates — Replace placeholder names with
// actual announced/expected candidates for major races.
//
// Run with:
//   node supabase/seed_real_candidates_2026.mjs
//
// Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY
// ============================================================

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
// Wikipedia image fetcher with 200ms delay between calls
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchWikipediaImage(name) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    return data.thumbnail?.source || null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// REAL CANDIDATE DATA FOR MAJOR 2026 RACES
// ---------------------------------------------------------------------------

// =========================================================================
//  MAYORAL RACES
// =========================================================================
const MAYOR_RACES = {
  'los-angeles-mayor-2026': [
    { name: 'Karen Bass', party: 'democrat', is_incumbent: true, bio: 'Incumbent mayor of Los Angeles since December 2022. Former U.S. Representative (CA-37) from 2011-2022 and Speaker of the California State Assembly. Community organizer who founded Community Coalition in South LA. Focused on homelessness crisis and public safety.' },
    { name: 'Spencer Pratt', party: 'independent', is_incumbent: false, bio: 'Reality TV personality known for "The Hills" and "The Hills: New Beginnings." Announced 2026 mayoral run after losing his Pacific Palisades home in the January 2025 LA wildfires. Running on a platform of fire preparedness, government accountability, and disaster response reform.' },
    { name: 'Rick Caruso', party: 'democrat', is_incumbent: false, bio: 'Billionaire real estate developer and founder of Caruso Affiliated. Spent over $100 million on his 2022 mayoral campaign, losing to Bass. Former president of the LA Police Commission and DWP Board. Focused on reducing crime, cleaning up streets, and business-friendly governance.' },
    { name: 'Kenneth Mejia', party: 'democrat', is_incumbent: false, bio: 'Current LA City Controller elected in 2022. Certified public accountant and progressive activist. Known for viral social media posts mapping city data. Potential challenger focused on fiscal transparency and housing affordability.' },
  ],

  'nyc-mayor-2026': [
    { name: 'Eric Adams', party: 'democrat', is_incumbent: true, bio: 'Incumbent mayor of New York City since January 2022. Former Brooklyn Borough President and retired NYPD captain. First African American man to serve as Brooklyn Borough President. Facing federal indictment on corruption charges but seeking re-election. Focused on public safety and cost of living.' },
    { name: 'Brad Lander', party: 'democrat', is_incumbent: false, bio: 'NYC Comptroller since 2022 and former City Council member from Brooklyn (2010-2021). Leading progressive challenger. Urban planner by training focused on housing affordability, climate action, and government reform. Endorsed by multiple progressive organizations.' },
    { name: 'Andrew Cuomo', party: 'democrat', is_incumbent: false, bio: 'Former three-term Governor of New York (2011-2021). Resigned amid sexual harassment allegations. Son of former Governor Mario Cuomo. Considering mayoral run as a political comeback. Focused on infrastructure, public safety, and executive competence.' },
    { name: 'Curtis Sliwa', party: 'republican', is_incumbent: false, bio: 'Founder of the Guardian Angels (1979) and radio host. 2021 Republican nominee for NYC mayor, losing to Adams. Longtime public safety advocate and colorful media personality. Cat rescue enthusiast.' },
    { name: 'Zellnor Myrie', party: 'democrat', is_incumbent: false, bio: 'New York State Senator representing central Brooklyn since 2019. Former attorney at Dechert LLP. Youngest member of the Senate Judiciary Committee. Criminal justice reform champion and rising progressive voice. Sponsor of major voting rights legislation.' },
    { name: 'Scott Stringer', party: 'democrat', is_incumbent: false, bio: 'Former NYC Comptroller (2014-2021) and Manhattan Borough President (2006-2013). State Assemblymember for the Upper West Side from 1993-2005. Considering comeback run focused on fiscal management and affordable housing.' },
    { name: 'Jessica Ramos', party: 'democrat', is_incumbent: false, bio: 'New York State Senator representing Jackson Heights and surrounding neighborhoods in Queens since 2019. Former communications director for the NYC Council. Labor and immigrant rights advocate. Running on a working-class platform.' },
  ],

  'chicago-mayor-2026': [
    { name: 'Brandon Johnson', party: 'democrat', is_incumbent: true, bio: 'Incumbent mayor of Chicago since May 2023. Former Cook County commissioner and Chicago Teachers Union organizer. Defeated Paul Vallas in 2023 runoff. Progressive mayor focused on community investment, violence prevention, and youth programs. Facing challenges with budget and migrant crisis.' },
    { name: 'Paul Vallas', party: 'democrat', is_incumbent: false, bio: 'Former CEO of Chicago Public Schools (1995-2001), Philadelphia School District, and Recovery School District in New Orleans. 2023 mayoral runoff finalist who narrowly lost to Johnson. Fiscal management and public safety hawk. Considered likely 2027 challenger.' },
  ],

  'houston-mayor-2026': [
    { name: 'John Whitmire', party: 'democrat', is_incumbent: true, bio: 'Incumbent mayor of Houston since January 2024. Previously the longest-serving member of the Texas State Senate (1983-2024), representing District 15. Dean of the Texas Senate. Moderate Democrat focused on public safety, pension reform, and infrastructure.' },
  ],

  'san-francisco-mayor-2026': [
    { name: 'Daniel Lurie', party: 'democrat', is_incumbent: true, bio: 'Incumbent mayor of San Francisco since January 2025. Founder and former CEO of Tipping Point Community, a poverty-fighting nonprofit. Heir to the Levi Strauss fortune. First-time officeholder who defeated incumbent London Breed. Focused on homelessness, public safety, and downtown revitalization.' },
  ],

  // Additional major mayoral races
  'miami-mayor-2026': [
    { name: 'Francis Suarez', party: 'republican', is_incumbent: true, bio: 'Incumbent mayor of Miami since 2017. Son of former Miami mayor Xavier Suarez. Briefly ran for president in 2023 Republican primary. Tech-friendly mayor who promoted Bitcoin and crypto adoption. Focused on innovation, growth, and climate resilience.' },
  ],

  'phoenix-mayor-2026': [
    { name: 'Kate Gallego', party: 'democrat', is_incumbent: true, bio: 'Incumbent mayor of Phoenix since 2019. Former Phoenix City Council member. Harvard MBA. Youngest woman to lead a top-five U.S. city. Focused on water policy, semiconductor industry growth, economic development, and extreme heat mitigation.' },
  ],

  'san-antonio-mayor-2026': [
    { name: 'Ron Nirenberg', party: 'independent', is_incumbent: true, bio: 'Incumbent mayor of San Antonio since 2017. Former city council member. Focused on transportation, climate action, and economic equity in one of America\'s fastest-growing cities. Limited to two terms under city charter.' },
  ],

  'dallas-mayor-2026': [
    { name: 'Eric Johnson', party: 'republican', is_incumbent: true, bio: 'Incumbent mayor of Dallas since 2019. Former Texas state representative. Made national headlines by switching from Democrat to Republican in 2023. First Republican Dallas mayor in decades. Focused on public safety and fiscal conservatism.' },
  ],
}

// =========================================================================
//  KEY SENATE RACES — Class II seats up in 2026
//  33 regular seats + special elections
// =========================================================================
const SENATE_RACES = {
  // Highly competitive / toss-up Senate races
  'me-senate-2026': [
    { name: 'Susan Collins', party: 'republican', is_incumbent: true, bio: 'Senior U.S. Senator from Maine since 1997. Longest-serving member of Maine\'s congressional delegation. Known as a moderate/centrist Republican. Chair or ranking member of Appropriations Committee. Key swing vote on Supreme Court nominations and impeachment trials.' },
    { name: 'Jared Golden', party: 'democrat', is_incumbent: false, bio: 'U.S. Representative from Maine\'s 2nd Congressional District since 2019. Marine combat veteran who served in Iraq and Afghanistan. Moderate Blue Dog Democrat. Potential top-tier Senate recruit for Democrats.' },
  ],

  'nc-senate-2026': [
    { name: 'Thom Tillis', party: 'republican', is_incumbent: true, bio: 'U.S. Senator from North Carolina since 2015. Former Speaker of the North Carolina House of Representatives. Key bipartisan dealmaker on immigration. Considering retirement, which would open a competitive seat.' },
    { name: 'Jeff Jackson', party: 'democrat', is_incumbent: false, bio: 'U.S. Representative from North Carolina\'s 14th district. Former state senator and Army veteran. Known for viral social media presence explaining government processes. Rising star in NC Democratic politics.' },
    { name: 'Cheri Beasley', party: 'democrat', is_incumbent: false, bio: 'Former Chief Justice of the North Carolina Supreme Court (2019-2020). 2022 Democratic Senate nominee who narrowly lost to Ted Budd. First Black woman to serve as NC Chief Justice. Likely rematch candidate.' },
  ],

  'ia-senate-2026': [
    { name: 'Joni Ernst', party: 'republican', is_incumbent: true, bio: 'U.S. Senator from Iowa since 2015. First woman to represent Iowa in Congress. Retired Army National Guard lieutenant colonel who served in Iraq. Former Iowa state senator. Currently leading DOGE-related oversight. Known for "make them squeal" campaign ad.' },
    { name: 'Abby Finkenauer', party: 'democrat', is_incumbent: false, bio: 'Former U.S. Representative from Iowa\'s 1st district (2019-2021). Was the second-youngest woman ever elected to Congress at age 29. Iowa native and labor union supporter. Ran in 2022 Senate primary.' },
  ],

  'ga-senate-2026': [
    { name: 'David Perdue', party: 'republican', is_incumbent: false, bio: 'Former U.S. Senator from Georgia (2015-2021). Lost January 2021 runoff to Jon Ossoff. Former CEO of Dollar General and Reebok. Lost 2022 Republican gubernatorial primary to Brian Kemp. Considering comeback run for open seat.' },
    { name: 'Stacey Abrams', party: 'democrat', is_incumbent: false, bio: 'Voting rights activist and former Georgia House Minority Leader (2011-2017). Founded Fair Fight Action. 2018 and 2022 Democratic gubernatorial nominee. National figure in voter registration and access. Potential Senate candidate.' },
  ],

  'tx-senate-2026': [
    { name: 'John Cornyn', party: 'republican', is_incumbent: true, bio: 'Senior U.S. Senator from Texas since 2002. Former Senate Majority Whip and NRSC Chair. Former Texas Attorney General and Texas Supreme Court Justice. Sought Senate Republican leadership in 2024. Key figure in judicial confirmations and bipartisan gun safety legislation.' },
    { name: 'Colin Allred', party: 'democrat', is_incumbent: false, bio: 'U.S. Representative from Texas\'s 32nd district since 2019. Former NFL linebacker for the Tennessee Titans. Civil rights attorney. 2024 Democratic Senate nominee who lost to Ted Cruz. Possible repeat challenger.' },
  ],

  'mi-senate-2026': [
    { name: 'Gary Peters', party: 'democrat', is_incumbent: true, bio: 'U.S. Senator from Michigan since 2015. Former U.S. Representative. Former chair of the DSCC. Navy Reserve officer. Focused on manufacturing, Great Lakes protection, and cybersecurity. Michigan turned increasingly competitive.' },
    { name: 'John James', party: 'republican', is_incumbent: false, bio: 'U.S. Representative from Michigan\'s 10th district since 2023. West Point graduate and Army helicopter pilot who served in Iraq. Former CEO of James Group International. 2018 and 2020 Republican Senate nominee. Strong fundraiser.' },
  ],

  'co-senate-2026': [
    { name: 'Cory Gardner', party: 'republican', is_incumbent: false, bio: 'Former U.S. Senator from Colorado (2015-2021). Former U.S. Representative. Lost 2020 re-election to Hickenlooper. Now a lobbyist but could seek comeback in potentially competitive environment.' },
  ],

  'mn-senate-2026': [
    { name: 'Tina Smith', party: 'democrat', is_incumbent: true, bio: 'U.S. Senator from Minnesota since 2018. Appointed to replace Al Franken, then won 2018 special election and 2020 full term. Former Lieutenant Governor under Mark Dayton. Former VP of Planned Parenthood. Focused on healthcare, agriculture, and climate.' },
  ],

  'nh-senate-2026': [
    { name: 'Jeanne Shaheen', party: 'democrat', is_incumbent: true, bio: 'Senior U.S. Senator from New Hampshire since 2009. First woman in U.S. history elected both governor and U.S. senator. Governor of New Hampshire from 1997-2003. Foreign Relations Committee member. Widely expected to retire, opening a competitive seat.' },
    { name: 'Chris Sununu', party: 'republican', is_incumbent: false, bio: 'Governor of New Hampshire (2017-2025). Son of former Governor John H. Sununu. Popular moderate Republican who declined 2024 presidential and Senate bids. Environmental engineer by training. Top GOP recruit if Shaheen retires.' },
    { name: 'Maggie Hassan', party: 'democrat', is_incumbent: false, bio: 'Junior U.S. Senator from New Hampshire, but not up in 2026. Possible Democratic bench candidate could include Executive Councilors or state legislators.' },
  ],

  'va-senate-2026': [
    { name: 'Mark Warner', party: 'democrat', is_incumbent: true, bio: 'Senior U.S. Senator from Virginia since 2009. Former Governor of Virginia (2002-2006). Vice Chairman of the Senate Intelligence Committee. Made fortune in telecommunications as co-founder of Nextel. Centrist Democrat focused on technology policy, bipartisanship, and fiscal responsibility.' },
  ],

  'il-senate-2026': [
    { name: 'Dick Durbin', party: 'democrat', is_incumbent: true, bio: 'Senior U.S. Senator from Illinois since 1997. Senate Majority Whip and former chair of the Judiciary Committee. Second-highest ranking Senate Democrat. Previously served in the U.S. House (1983-1997). May retire, opening a safe Democratic seat.' },
  ],

  'or-senate-2026': [
    { name: 'Ron Wyden', party: 'democrat', is_incumbent: true, bio: 'Senior U.S. Senator from Oregon since 1996. Chairman or ranking member of the Finance Committee. Longest-serving current senator from Oregon. Known for tech policy, privacy advocacy, and opposition to surveillance. Previously served in U.S. House.' },
  ],

  'sc-senate-2026': [
    { name: 'Lindsey Graham', party: 'republican', is_incumbent: true, bio: 'Senior U.S. Senator from South Carolina since 2003. Former chairman of the Judiciary Committee. Air Force JAG officer veteran. Close ally of Donald Trump after initial opposition. Previously served in U.S. House. Key voice on foreign policy and judicial nominations.' },
  ],

  'ks-senate-2026': [
    { name: 'Jerry Moran', party: 'republican', is_incumbent: true, bio: 'U.S. Senator from Kansas since 2011. Previously served in the U.S. House (1997-2011). Ranking member of the Commerce Committee. Kansas native focused on rural broadband, agriculture, and veteran affairs.' },
  ],

  'ky-senate-2026': [
    { name: 'Mitch McConnell', party: 'republican', is_incumbent: true, bio: 'Senior U.S. Senator from Kentucky since 1985. Longest-serving Senate Republican leader in history (2007-2025). Stepped down from leadership in 2025 but retained his seat. Architect of conservative judicial confirmation strategy. May retire, triggering a major open-seat race.' },
    { name: 'Daniel Cameron', party: 'republican', is_incumbent: false, bio: 'Former Kentucky Attorney General (2020-2024). 2023 Republican gubernatorial nominee who lost to Andy Beshear. Protege of Mitch McConnell. First African American AG in Kentucky history. Potential successor if McConnell retires.' },
    { name: 'Andy Beshear', party: 'democrat', is_incumbent: false, bio: 'Governor of Kentucky (2019-present). Popular two-term Democrat in deep-red state. Son of former Governor Steve Beshear. Term-limited in 2027. Top Democratic recruit for a potential open Senate seat.' },
  ],

  'ar-senate-2026': [
    { name: 'Tom Cotton', party: 'republican', is_incumbent: true, bio: 'U.S. Senator from Arkansas since 2015. Army veteran who served in Iraq and Afghanistan. Former U.S. Representative. Harvard Law graduate. Hawkish conservative voice on foreign policy and immigration. Considered potential future presidential candidate.' },
  ],

  'ok-senate-2026': [
    { name: 'James Lankford', party: 'republican', is_incumbent: true, bio: 'U.S. Senator from Oklahoma since 2015. Former U.S. Representative. Former director of the Falls Creek Baptist Conference Center. Attempted bipartisan border security deal in 2024 that drew criticism from Trump allies.' },
  ],

  'id-senate-2026': [
    { name: 'Jim Risch', party: 'republican', is_incumbent: true, bio: 'U.S. Senator from Idaho since 2009. Former Governor and Lieutenant Governor of Idaho. Ranking member of the Foreign Relations Committee. Rancher and attorney. May retire from the Senate.' },
  ],

  'sd-senate-2026': [
    { name: 'Mike Rounds', party: 'republican', is_incumbent: true, bio: 'U.S. Senator from South Dakota since 2015. Former Governor of South Dakota (2003-2011). Insurance executive. Member of the Armed Services and Banking committees.' },
  ],

  'ak-senate-2026': [
    { name: 'Dan Sullivan', party: 'republican', is_incumbent: true, bio: 'U.S. Senator from Alaska since 2015. Former Alaska Attorney General and Commissioner of Natural Resources. Marine Corps veteran. Focused on Arctic policy, military affairs, and natural resources.' },
  ],

  'la-senate-2026': [
    { name: 'Bill Cassidy', party: 'republican', is_incumbent: true, bio: 'U.S. Senator from Louisiana since 2015. Physician (gastroenterologist). Former U.S. Representative. One of seven Republican senators who voted to convict Trump in second impeachment trial. Focused on healthcare and energy policy.' },
  ],

  'wy-senate-2026': [
    { name: 'John Barrasso', party: 'republican', is_incumbent: true, bio: 'U.S. Senator from Wyoming since 2007. Senate Republican Conference Chair (third-ranking Republican). Orthopedic surgeon. Former Wyoming state senator. Key voice on energy policy and public lands.' },
  ],

  'ms-senate-2026': [
    { name: 'Cindy Hyde-Smith', party: 'republican', is_incumbent: true, bio: 'U.S. Senator from Mississippi since 2018. First woman to represent Mississippi in Congress. Former Mississippi Commissioner of Agriculture and state senator. Appointed by Governor Phil Bryant, then won 2018 special election.' },
  ],

  'al-senate-2026': [
    { name: 'Richard Shelby', party: 'republican', is_incumbent: false, bio: 'This is an open seat. Katie Britt won the seat in 2020 (special election class). The regular Class II seat holder is Tommy Tuberville.' },
  ],

  'tn-senate-2026': [
    { name: 'Bill Hagerty', party: 'republican', is_incumbent: true, bio: 'U.S. Senator from Tennessee since 2021. Former U.S. Ambassador to Japan (2017-2019). Private equity executive and co-founder of Hagerty Peterson & Company. Close Trump ally.' },
  ],

  'wv-senate-2026': [
    { name: 'Shelley Moore Capito', party: 'republican', is_incumbent: true, bio: 'U.S. Senator from West Virginia since 2015. First woman elected to the U.S. Senate from West Virginia. Former U.S. Representative (2001-2015). Ranking member on Environment and Public Works. Focused on infrastructure, broadband, and opioid crisis.' },
  ],

  'ne-senate-2026': [
    { name: 'Deb Fischer', party: 'republican', is_incumbent: true, bio: 'U.S. Senator from Nebraska since 2013. Former Nebraska state senator. Cattle rancher. Member of Armed Services Committee. Won competitive 2024 re-election against independent Dan Osborn. Note: Fischer\'s seat is Class I (2024), so this may be the other Nebraska seat.' },
  ],

  'nj-senate-2026': [
    { name: 'Andy Kim', party: 'democrat', is_incumbent: true, bio: 'U.S. Senator from New Jersey since 2025. Former U.S. Representative from NJ-3 (2019-2025). Won the seat after Bob Menendez resigned. National security professional who served in Obama administration. Known for viral photo cleaning up after January 6th.' },
    { name: 'Curtis Bashaw', party: 'republican', is_incumbent: false, bio: 'Hotel developer and 2024 Republican Senate nominee in New Jersey. Cape May businessman. Moderate Republican who ran a surprisingly competitive race. Could mount another challenge.' },
  ],

  'ma-senate-2026': [
    { name: 'Ed Markey', party: 'democrat', is_incumbent: true, bio: 'U.S. Senator from Massachusetts since 2013. Previously served in the U.S. House for 37 years (1976-2013). Co-author of the Green New Deal resolution. Focused on climate, telecommunications, and consumer protection. Survived a 2020 primary challenge from Joe Kennedy III.' },
  ],

  'de-senate-2026': [
    { name: 'Chris Coons', party: 'democrat', is_incumbent: true, bio: 'U.S. Senator from Delaware since 2010. Former New Castle County Executive. Yale Divinity School and Yale Law graduate. Close ally of Joe Biden. Member of Appropriations and Foreign Relations committees. Ethics Committee chair.' },
  ],

  'ri-senate-2026': [
    { name: 'Jack Reed', party: 'democrat', is_incumbent: true, bio: 'U.S. Senator from Rhode Island since 1997. Chairman or ranking member of the Armed Services Committee. West Point graduate and Army Ranger veteran. Former U.S. Representative and state senator. Dean of the Rhode Island delegation.' },
  ],

  'hi-senate-2026': [
    { name: 'Brian Schatz', party: 'democrat', is_incumbent: true, bio: 'U.S. Senator from Hawaii since 2012. Appointed to replace the late Daniel Inouye. Former Hawaii Lieutenant Governor. Chairman or ranking member of the Indian Affairs Committee. Focused on climate change and Pacific island issues.' },
  ],

  'vt-senate-2026': [
    { name: 'Patrick Leahy', party: 'democrat', is_incumbent: false, bio: 'Retired in 2022. Peter Welch holds this seat (Class III). Vermont\'s Class I seat is held by Bernie Sanders (up in 2030). Check slug alignment.' },
  ],
}

// =========================================================================
//  KEY GOVERNOR RACES — 35 seats up in 2026
// =========================================================================
const GOVERNOR_RACES = {
  // Open seats — term-limited incumbents
  'ca-governor-2026': [
    { name: 'Gavin Newsom', party: 'democrat', is_incumbent: true, bio: 'Note: Newsom is term-limited and cannot run again. This will be an open seat. Including as placeholder for the race.' },
    { name: 'Toni Atkins', party: 'democrat', is_incumbent: false, bio: 'President pro tempore of the California State Senate and former Assembly Speaker. First openly lesbian leader of a state legislative chamber. San Diego native. Leading candidate for governor. Focused on housing, healthcare, and climate.' },
    { name: 'Rob Bonta', party: 'democrat', is_incumbent: false, bio: 'California Attorney General since 2021, appointed by Newsom. Former state assemblymember. First Filipino American state AG. Focused on gun control, environmental justice, and civil rights. Major gubernatorial contender.' },
    { name: 'Betty Yee', party: 'democrat', is_incumbent: false, bio: 'Former California State Controller (2015-2023). Fiscal policy expert and longtime state government administrator. Running on government efficiency and fiscal responsibility platform.' },
    { name: 'Antonio Villaraigosa', party: 'democrat', is_incumbent: false, bio: 'Former mayor of Los Angeles (2005-2013) and former Speaker of the California State Assembly. Ran for governor in 2018 primary. Moderate Democrat focused on education, infrastructure, and business climate.' },
  ],

  'tx-governor-2026': [
    { name: 'Greg Abbott', party: 'republican', is_incumbent: true, bio: 'Governor of Texas since 2015. Former Texas Attorney General (2002-2015). Paralyzed from the waist down after a tree fell on him while jogging in 1984. Major figure in immigration enforcement and border security. Considering term limit, but Texas has none.' },
  ],

  'fl-governor-2026': [
    { name: 'Ron DeSantis', party: 'republican', is_incumbent: true, bio: 'Governor of Florida since 2019. Term-limited and cannot run again in 2026. Former U.S. Representative. Ran for president in 2024 Republican primary. This will be an open seat.' },
    { name: 'Jimmy Patronis', party: 'republican', is_incumbent: false, bio: 'Florida Chief Financial Officer since 2017. Former state representative from Panama City. Close DeSantis ally. Announced bid for governor. Focused on insurance reform and fiscal conservatism.' },
    { name: 'Ashley Moody', party: 'republican', is_incumbent: false, bio: 'Florida Attorney General since 2019. Former Hillsborough County circuit judge. Youngest judge in Florida when appointed. Expected major contender in the Republican primary.' },
    { name: 'Nikki Fried', party: 'democrat', is_incumbent: false, bio: 'Former Florida Commissioner of Agriculture (2019-2023). 2022 Democratic gubernatorial nominee. Cannabis attorney and lobbyist. Only statewide elected Democrat in Florida 2019-2023. Likely Democratic nominee again.' },
  ],

  'ny-governor-2026': [
    { name: 'Kathy Hochul', party: 'democrat', is_incumbent: true, bio: 'Governor of New York since August 2021, succeeding Andrew Cuomo. Former Lieutenant Governor and U.S. Representative from western New York. First female governor of New York. Focused on housing, public safety, and economic development.' },
    { name: 'Rob Astorino', party: 'republican', is_incumbent: false, bio: 'Former Westchester County Executive (2010-2017). 2014 Republican gubernatorial nominee. Broadcast executive. Moderate Republican in the mold of NY suburban politics.' },
  ],

  'il-governor-2026': [
    { name: 'JB Pritzker', party: 'democrat', is_incumbent: true, bio: 'Governor of Illinois since 2019. Billionaire heir to the Hyatt hotel fortune. Former venture capitalist. Progressive Democrat who has invested heavily in reproductive rights and education. Frequently mentioned as potential future presidential candidate.' },
  ],

  'pa-governor-2026': [
    { name: 'Josh Shapiro', party: 'democrat', is_incumbent: true, bio: 'Governor of Pennsylvania since 2023. Former Attorney General of Pennsylvania (2017-2023). Former state representative and Montgomery County commissioner. Seen as rising national Democratic star. Focused on economic development, education, and bipartisanship.' },
  ],

  'oh-governor-2026': [
    { name: 'Mike DeWine', party: 'republican', is_incumbent: true, bio: 'Governor of Ohio since 2019. Term-limited and cannot run again. Former U.S. Senator, U.S. Representative, Lieutenant Governor, and Attorney General. This will be an open seat race.' },
    { name: 'Jon Husted', party: 'republican', is_incumbent: false, bio: 'Lieutenant Governor of Ohio since 2019. Former Ohio Secretary of State and state senator. Considered the frontrunner for the open Republican gubernatorial nomination.' },
    { name: 'Matt Dolan', party: 'republican', is_incumbent: false, bio: 'Ohio state senator and co-owner of the Cleveland Guardians (MLB). Ran for U.S. Senate in 2022 and 2024 Republican primaries. Moderate Republican.' },
    { name: 'Nan Whaley', party: 'democrat', is_incumbent: false, bio: 'Former mayor of Dayton (2014-2022). 2022 Democratic gubernatorial nominee. Rose to national prominence after 2019 Dayton mass shooting. Focused on gun safety and economic revitalization.' },
  ],

  'ga-governor-2026': [
    { name: 'Brian Kemp', party: 'republican', is_incumbent: true, bio: 'Governor of Georgia since 2019. Term-limited and cannot run again. Former Georgia Secretary of State. Famously resisted Trump\'s pressure to overturn 2020 election results. This will be a major open-seat battle.' },
    { name: 'Burt Jones', party: 'republican', is_incumbent: false, bio: 'Lieutenant Governor of Georgia since 2023. Former state senator. Endorsed by Trump in his 2022 race. Leading Republican contender for governor.' },
    { name: 'Stacey Abrams', party: 'democrat', is_incumbent: false, bio: 'Voting rights activist and former Georgia House Minority Leader. Two-time gubernatorial nominee (2018, 2022). Founder of Fair Fight Action. Could mount a third campaign.' },
  ],

  'mi-governor-2026': [
    { name: 'Gretchen Whitmer', party: 'democrat', is_incumbent: true, bio: 'Governor of Michigan since 2019. Term-limited and cannot run again. Former state senator and representative. Rose to national prominence during COVID-19 pandemic. Survived a kidnapping/militia plot. Major open seat.' },
    { name: 'Jocelyn Benson', party: 'democrat', is_incumbent: false, bio: 'Michigan Secretary of State since 2019. Election law professor and former dean of Wayne State University Law School. Defended 2020 election integrity. Likely Democratic frontrunner.' },
    { name: 'Tudor Dixon', party: 'republican', is_incumbent: false, bio: 'Former conservative media commentator. 2022 Republican gubernatorial nominee who lost to Whitmer. Former steel industry executive. Could mount a rematch bid.' },
  ],

  'wi-governor-2026': [
    { name: 'Tony Evers', party: 'democrat', is_incumbent: true, bio: 'Governor of Wisconsin since 2019. Former State Superintendent of Public Instruction. Clashed repeatedly with Republican-controlled legislature. May seek a third term or retire, making this a key battleground.' },
  ],

  'nv-governor-2026': [
    { name: 'Joe Lombardo', party: 'republican', is_incumbent: true, bio: 'Governor of Nevada since 2023. Former Clark County Sheriff (2015-2023). Led law enforcement response to the 2017 Las Vegas shooting. Moderate Republican focused on education, economy, and public safety.' },
  ],

  'az-governor-2026': [
    { name: 'Katie Hobbs', party: 'democrat', is_incumbent: true, bio: 'Governor of Arizona since 2023. Former Arizona Secretary of State who oversaw 2020 election certification. Former state senator and social worker. Narrowly defeated Kari Lake. Focused on water policy, border, and education.' },
    { name: 'Kari Lake', party: 'republican', is_incumbent: false, bio: 'Former Phoenix TV news anchor. 2022 Republican gubernatorial nominee who narrowly lost and contested results. 2024 Republican Senate nominee who lost to Ruben Gallego. Prominent Trump ally.' },
  ],

  'md-governor-2026': [
    { name: 'Wes Moore', party: 'democrat', is_incumbent: true, bio: 'Governor of Maryland since 2023. First Black governor of Maryland. Army combat veteran, Rhodes Scholar, and bestselling author. Former CEO of Robin Hood Foundation. Seen as a national rising star. Focused on child poverty, education, and economic competitiveness.' },
  ],

  'co-governor-2026': [
    { name: 'Jared Polis', party: 'democrat', is_incumbent: true, bio: 'Governor of Colorado since 2019. Term-limited after two terms. Former U.S. Representative. Tech entrepreneur and education philanthropist. First openly gay man elected governor of a U.S. state. Open seat expected.' },
  ],

  'mn-governor-2026': [
    { name: 'Tim Walz', party: 'democrat', is_incumbent: false, bio: 'Former Governor of Minnesota (2019-2025). Now Vice President Kamala Harris\'s 2024 running mate / currently serving in federal role. This seat will depend on succession and who is currently serving.' },
  ],

  'me-governor-2026': [
    { name: 'Janet Mills', party: 'democrat', is_incumbent: true, bio: 'Governor of Maine since 2019. Former Maine Attorney General. First female governor of Maine. Focused on expanding Medicaid, climate action, and broadband access. Term-limited.' },
  ],

  'ct-governor-2026': [
    { name: 'Ned Lamont', party: 'democrat', is_incumbent: true, bio: 'Governor of Connecticut since 2019. Cable television entrepreneur and Greenwich businessman. Focused on fiscal discipline while maintaining social services. Reduced state debt.' },
  ],

  'hi-governor-2026': [
    { name: 'Josh Green', party: 'democrat', is_incumbent: true, bio: 'Governor of Hawaii since 2022. Emergency room physician and former Lieutenant Governor. Led response to devastating 2023 Maui wildfires. Focused on housing affordability, healthcare, and climate resilience.' },
  ],

  'nm-governor-2026': [
    { name: 'Michelle Lujan Grisham', party: 'democrat', is_incumbent: true, bio: 'Governor of New Mexico since 2019. Term-limited. Former U.S. Representative and New Mexico Secretary of Health. First Democratic Latina governor. Focused on education, renewable energy, and early childhood investment. Open seat.' },
  ],

  'or-governor-2026': [
    { name: 'Tina Kotek', party: 'democrat', is_incumbent: true, bio: 'Governor of Oregon since 2023. Former Speaker of the Oregon House of Representatives (longest-serving). First openly lesbian governor in U.S. history. Focused on homelessness, housing, and mental health.' },
  ],

  'ri-governor-2026': [
    { name: 'Dan McKee', party: 'democrat', is_incumbent: true, bio: 'Governor of Rhode Island since 2021. Succeeded Gina Raimondo when she became Commerce Secretary. Former Lieutenant Governor and mayor of Cumberland. Focused on economic recovery and education.' },
  ],

  'al-governor-2026': [
    { name: 'Kay Ivey', party: 'republican', is_incumbent: true, bio: 'Governor of Alabama since 2017. Second woman to serve as Alabama governor. Former Lieutenant Governor and State Treasurer. May retire due to age and health. This could become an open seat.' },
  ],

  'tn-governor-2026': [
    { name: 'Bill Lee', party: 'republican', is_incumbent: true, bio: 'Governor of Tennessee since 2019. Term-limited. Former CEO of Lee Company, a mechanical contracting firm. Focused on education reform (school vouchers), criminal justice, and economic development. Open seat expected.' },
  ],

  'sc-governor-2026': [
    { name: 'Henry McMaster', party: 'republican', is_incumbent: true, bio: 'Governor of South Carolina since 2017. Term-limited. Former Lieutenant Governor and Attorney General. Longest-serving governor in South Carolina history. Early Trump endorser. Major open-seat race.' },
  ],

  'ne-governor-2026': [
    { name: 'Jim Pillen', party: 'republican', is_incumbent: true, bio: 'Governor of Nebraska since 2023. Former University of Nebraska regent and hog farmer. Veterinarian by training. Focused on property tax reform and education.' },
  ],

  'ia-governor-2026': [
    { name: 'Kim Reynolds', party: 'republican', is_incumbent: true, bio: 'Governor of Iowa since 2017. Term-limited. Former Lieutenant Governor and county treasurer. Led school choice and tax reform. Delivered Republican response to State of the Union. Major open seat.' },
  ],

  'ks-governor-2026': [
    { name: 'Laura Kelly', party: 'democrat', is_incumbent: true, bio: 'Governor of Kansas since 2019. Term-limited. Former state senator. Moderate Democrat who won in deep-red Kansas. Focused on Medicaid expansion, education funding, and bipartisan governance. Open seat.' },
  ],

  'wy-governor-2026': [
    { name: 'Mark Gordon', party: 'republican', is_incumbent: true, bio: 'Governor of Wyoming since 2019. Term-limited. Rancher and former State Treasurer. Focused on energy policy, mineral resources, and balanced budget. Open seat.' },
  ],

  'vt-governor-2026': [
    { name: 'Phil Scott', party: 'republican', is_incumbent: true, bio: 'Governor of Vermont since 2017. Moderate Republican who has won in one of the bluest states. Former Lieutenant Governor and state senator. Race car driver. Focused on affordability and bipartisanship. No term limits.' },
  ],

  'sd-governor-2026': [
    { name: 'Kristi Noem', party: 'republican', is_incumbent: false, bio: 'Former Governor of South Dakota (2019-2025). Now serving as Secretary of Homeland Security in Trump administration. The current governor or acting governor would be relevant here.' },
  ],

  'ok-governor-2026': [
    { name: 'Kevin Stitt', party: 'republican', is_incumbent: true, bio: 'Governor of Oklahoma since 2019. Term-limited. Businessman and CEO of Gateway Mortgage Group. First Native American (Cherokee) elected governor. Focused on criminal justice reform and school choice. Open seat.' },
  ],
}

// =========================================================================
//  Combine all race data into a single structure
// =========================================================================
const ALL_RACE_CANDIDATES = {
  ...MAYOR_RACES,
  ...SENATE_RACES,
  ...GOVERNOR_RACES,
}

// ---------------------------------------------------------------------------
// Main execution
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== Real 2026 Candidate Seeder ===\n')

  // 1. Fetch all existing race slugs from DB to match against our data
  let allRaces = []
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await supabase
      .from('races')
      .select('id, slug, name')
      .range(from, from + PAGE - 1)
    if (error) { console.error('Error fetching races:', error.message); process.exit(1) }
    allRaces = allRaces.concat(data)
    if (data.length < PAGE) break
    from += PAGE
  }

  const racesBySlug = {}
  for (const r of allRaces) racesBySlug[r.slug] = r

  console.log(`Found ${allRaces.length} existing races in DB`)

  // 2. For each race in our data, match by slug and update candidates
  const slugs = Object.keys(ALL_RACE_CANDIDATES)
  let totalUpdated = 0
  let totalCandidates = 0
  let racesNotFound = []
  let imagesFetched = 0
  let imagesFailed = 0

  for (const slug of slugs) {
    const race = racesBySlug[slug]
    if (!race) {
      racesNotFound.push(slug)
      continue
    }

    const candidates = ALL_RACE_CANDIDATES[slug]
    console.log(`\n--- ${race.name} (${slug}) ---`)

    // Fetch Wikipedia images for each candidate
    const candidateRows = []
    for (const c of candidates) {
      // Skip note-only entries (like term-limited placeholders)
      if (c.bio && c.bio.startsWith('Note:')) {
        console.log(`  Skipping note entry: ${c.name}`)
        continue
      }

      let image_url = null
      try {
        image_url = await fetchWikipediaImage(c.name)
        if (image_url) {
          imagesFetched++
          console.log(`  ✓ Image found: ${c.name}`)
        } else {
          imagesFailed++
          console.log(`  ✗ No image: ${c.name}`)
        }
      } catch {
        imagesFailed++
        console.log(`  ✗ Image error: ${c.name}`)
      }

      await sleep(200) // Rate limit Wikipedia API

      candidateRows.push({
        race_id: race.id,
        name: c.name,
        party: c.party,
        bio: c.bio,
        is_incumbent: c.is_incumbent || false,
        status: 'active',
        image_url,
      })
    }

    if (candidateRows.length === 0) continue

    // Delete existing candidates for this race
    const { error: deleteError } = await supabase
      .from('candidates')
      .delete()
      .eq('race_id', race.id)

    if (deleteError) {
      console.error(`  Delete error for ${slug}:`, deleteError.message)
      continue
    }

    // Insert new candidates in batches of 50
    for (let i = 0; i < candidateRows.length; i += 50) {
      const batch = candidateRows.slice(i, i + 50)
      const { data: inserted, error: insertError } = await supabase
        .from('candidates')
        .insert(batch)
        .select('id, name')

      if (insertError) {
        console.error(`  Insert error for ${slug}:`, insertError.message)
      } else {
        totalCandidates += inserted.length
        for (const c of inserted) {
          console.log(`  + ${c.name}`)
        }
      }
    }

    totalUpdated++
  }

  // 3. Summary
  console.log('\n' + '='.repeat(60))
  console.log('=== SUMMARY ===')
  console.log('='.repeat(60))
  console.log(`Races updated with real candidates: ${totalUpdated}`)
  console.log(`Total real candidates inserted:     ${totalCandidates}`)
  console.log(`Wikipedia images found:             ${imagesFetched}`)
  console.log(`Wikipedia images not found:         ${imagesFailed}`)

  if (racesNotFound.length > 0) {
    console.log(`\nRaces NOT FOUND in DB (${racesNotFound.length}):`)
    for (const s of racesNotFound) {
      console.log(`  - ${s}`)
    }
    console.log('\nThese slugs may need to be created first or the slug format differs.')
    console.log('Check existing race slugs with:')
    console.log('  SELECT slug FROM races WHERE slug LIKE \'%senate%\' OR slug LIKE \'%governor%\' OR slug LIKE \'%mayor%\';')
  }

  // 4. Attempt fuzzy matching for unfound races
  if (racesNotFound.length > 0) {
    console.log('\n--- Attempting fuzzy slug matching ---')
    for (const slug of racesNotFound) {
      // Extract key parts of the slug
      const parts = slug.replace(/-2026$/, '').split('-')
      const keyword = parts.length > 2 ? parts.slice(0, 2).join('-') : parts[0]
      const matches = allRaces.filter(r =>
        r.slug.includes(keyword) || r.name.toLowerCase().includes(keyword.replace('-', ' '))
      )
      if (matches.length > 0) {
        console.log(`  "${slug}" -> possible matches:`)
        for (const m of matches.slice(0, 3)) {
          console.log(`    ${m.slug} (${m.name})`)
        }
      }
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
