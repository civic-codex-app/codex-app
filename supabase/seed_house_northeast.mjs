import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}
const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// 119th Congress (2025-2026) House Representatives — Northeast states
const MEMBERS = [
  // Connecticut (5 districts)
  { name: 'John Larson', slug: 'john-larson', state: 'CT', party: 'democrat', title: 'U.S. Representative', since_year: 1999, bio: 'U.S. Representative for Connecticut\'s 1st congressional district. Senior member of the Ways and Means Committee, known for championing Social Security reform.' },
  { name: 'Joe Courtney', slug: 'joe-courtney', state: 'CT', party: 'democrat', title: 'U.S. Representative', since_year: 2007, bio: 'U.S. Representative for Connecticut\'s 2nd congressional district. Senior member of the Armed Services Committee focused on submarine construction and defense industry.' },
  { name: 'Rosa DeLauro', slug: 'rosa-delauro', state: 'CT', party: 'democrat', title: 'U.S. Representative', since_year: 1991, bio: 'U.S. Representative for Connecticut\'s 3rd congressional district. Long-serving appropriator and advocate for child nutrition, women\'s health, and workers\' rights.' },
  { name: 'Jim Himes', slug: 'jim-himes', state: 'CT', party: 'democrat', title: 'U.S. Representative', since_year: 2009, bio: 'U.S. Representative for Connecticut\'s 4th congressional district. Ranking member of the House Intelligence Committee with expertise in financial services and national security.' },
  { name: 'Jahana Hayes', slug: 'jahana-hayes', state: 'CT', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Connecticut\'s 5th congressional district. Former National Teacher of the Year and advocate for education and agriculture policy.' },

  // Delaware (1 district)
  { name: 'Sarah McBride', slug: 'sarah-mcbride', state: 'DE', party: 'democrat', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for Delaware\'s at-large congressional district. First openly transgender member of Congress, previously served in the Delaware State Senate.' },

  // Maine (2 districts)
  { name: 'Chellie Pingree', slug: 'chellie-pingree', state: 'ME', party: 'democrat', title: 'U.S. Representative', since_year: 2009, bio: 'U.S. Representative for Maine\'s 1st congressional district. Member of the Appropriations Committee focused on agriculture, food policy, and campaign finance reform.' },
  { name: 'Jared Golden', slug: 'jared-golden', state: 'ME', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Maine\'s 2nd congressional district. Marine veteran known as a moderate Democrat who frequently crosses party lines on gun rights and fiscal policy.' },

  // Maryland (8 districts)
  { name: 'Andy Harris', slug: 'andy-harris', state: 'MD', party: 'republican', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Maryland\'s 1st congressional district. Physician and member of the Appropriations Committee, the sole Republican in Maryland\'s House delegation.' },
  { name: 'Dutch Ruppersberger', slug: 'dutch-ruppersberger', state: 'MD', party: 'democrat', title: 'U.S. Representative', since_year: 2003, bio: 'U.S. Representative for Maryland\'s 2nd congressional district. Senior member of the Appropriations Committee with a focus on defense, intelligence, and cybersecurity.' },
  { name: 'John Sarbanes', slug: 'john-sarbanes', state: 'MD', party: 'democrat', title: 'U.S. Representative', since_year: 2007, bio: 'U.S. Representative for Maryland\'s 3rd congressional district. Champion of democracy reform, campaign finance, and government accountability legislation.' },
  { name: 'Glenn Ivey', slug: 'glenn-ivey', state: 'MD', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Maryland\'s 4th congressional district. Former state\'s attorney and member of the Judiciary and Homeland Security committees.' },
  { name: 'Steny Hoyer', slug: 'steny-hoyer', state: 'MD', party: 'democrat', title: 'U.S. Representative', since_year: 1981, bio: 'U.S. Representative for Maryland\'s 5th congressional district. Former House Majority Leader and one of the longest-serving members of Congress.' },
  { name: 'April Delaney', slug: 'april-delaney', state: 'MD', party: 'democrat', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for Maryland\'s 6th congressional district. Businesswoman and advocate for bipartisan solutions on healthcare and economic issues.' },
  { name: 'Kweisi Mfume', slug: 'kweisi-mfume', state: 'MD', party: 'democrat', title: 'U.S. Representative', since_year: 2020, bio: 'U.S. Representative for Maryland\'s 7th congressional district. Former NAACP president who returned to Congress to continue advocating for civil rights and economic equity.' },
  { name: 'Jamie Raskin', slug: 'jamie-raskin', state: 'MD', party: 'democrat', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Maryland\'s 8th congressional district. Constitutional law professor and ranking member of the Oversight Committee, known for his role in the January 6th investigation.' },

  // Massachusetts (9 districts)
  { name: 'Richard Neal', slug: 'richard-neal', state: 'MA', party: 'democrat', title: 'U.S. Representative', since_year: 1989, bio: 'U.S. Representative for Massachusetts\'s 1st congressional district. Former chairman of the Ways and Means Committee and longtime advocate for retirement security and tax policy.' },
  { name: 'Jim McGovern', slug: 'jim-mcgovern', state: 'MA', party: 'democrat', title: 'U.S. Representative', since_year: 1997, bio: 'U.S. Representative for Massachusetts\'s 2nd congressional district. Former chairman of the Rules Committee and leading voice on hunger, human rights, and government transparency.' },
  { name: 'Lori Trahan', slug: 'lori-trahan', state: 'MA', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Massachusetts\'s 3rd congressional district. Focused on children\'s online safety, technology regulation, and workforce development.' },
  { name: 'Jake Auchincloss', slug: 'jake-auchincloss', state: 'MA', party: 'democrat', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Massachusetts\'s 4th congressional district. Marine veteran focused on technology, transportation, and economic competitiveness.' },
  { name: 'Katherine Clark', slug: 'katherine-clark', state: 'MA', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Massachusetts\'s 5th congressional district. House Democratic Whip and advocate for working families, childcare, and education.' },
  { name: 'Seth Moulton', slug: 'seth-moulton', state: 'MA', party: 'democrat', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Massachusetts\'s 6th congressional district. Marine veteran and member of the Armed Services and Transportation committees.' },
  { name: 'Ayanna Pressley', slug: 'ayanna-pressley', state: 'MA', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Massachusetts\'s 7th congressional district. Progressive leader and member of "The Squad," focused on criminal justice reform, healthcare equity, and housing.' },
  { name: 'Stephen Lynch', slug: 'stephen-lynch', state: 'MA', party: 'democrat', title: 'U.S. Representative', since_year: 2001, bio: 'U.S. Representative for Massachusetts\'s 8th congressional district. Former ironworker and labor leader serving on the Financial Services and Oversight committees.' },
  { name: 'Bill Keating', slug: 'bill-keating', state: 'MA', party: 'democrat', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Massachusetts\'s 9th congressional district. Former district attorney focused on foreign affairs, armed services, and combating the opioid crisis.' },

  // New Hampshire (2 districts)
  { name: 'Chris Pappas', slug: 'chris-pappas', state: 'NH', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for New Hampshire\'s 1st congressional district. Small business owner serving on the Transportation and Veterans\' Affairs committees.' },
  { name: 'Ann McLane Kuster', slug: 'ann-mclane-kuster', state: 'NH', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for New Hampshire\'s 2nd congressional district. Focused on combating the opioid crisis, supporting veterans, and bipartisan energy policy.' },

  // New Jersey (12 districts)
  { name: 'Donald Norcross', slug: 'donald-norcross', state: 'NJ', party: 'democrat', title: 'U.S. Representative', since_year: 2014, bio: 'U.S. Representative for New Jersey\'s 1st congressional district. Electrician and labor leader serving on the Armed Services and Education committees.' },
  { name: 'Jeff Van Drew', slug: 'jeff-van-drew', state: 'NJ', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for New Jersey\'s 2nd congressional district. Former Democrat who switched to the Republican Party, focused on veterans and law enforcement.' },
  { name: 'Herb Conaway', slug: 'herb-conaway', state: 'NJ', party: 'democrat', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for New Jersey\'s 3rd congressional district. Physician and former state assemblyman focused on healthcare access and veterans\' issues.' },
  { name: 'Chris Smith', slug: 'chris-smith', state: 'NJ', party: 'republican', title: 'U.S. Representative', since_year: 1981, bio: 'U.S. Representative for New Jersey\'s 4th congressional district. One of the longest-serving members of Congress, focused on human rights, veterans, and pro-life advocacy.' },
  { name: 'Josh Gottheimer', slug: 'josh-gottheimer', state: 'NJ', party: 'democrat', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for New Jersey\'s 5th congressional district. Co-chair of the bipartisan Problem Solvers Caucus and member of the Financial Services Committee.' },
  { name: 'Frank Pallone', slug: 'frank-pallone', state: 'NJ', party: 'democrat', title: 'U.S. Representative', since_year: 1988, bio: 'U.S. Representative for New Jersey\'s 6th congressional district. Former chairman of the Energy and Commerce Committee, champion of environmental protection and healthcare access.' },
  { name: 'Thomas Kean Jr.', slug: 'thomas-kean-jr', state: 'NJ', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for New Jersey\'s 7th congressional district. Son of former Governor Tom Kean, focused on tax reform, small business, and bipartisan governance.' },
  { name: 'Rob Menendez', slug: 'rob-menendez', state: 'NJ', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for New Jersey\'s 8th congressional district. Attorney and son of former Senator Bob Menendez, focused on transportation and housing.' },
  { name: 'Bill Pascrell Jr.', slug: 'bill-pascrell-jr', state: 'NJ', party: 'democrat', title: 'U.S. Representative', since_year: 1997, bio: 'U.S. Representative for New Jersey\'s 9th congressional district. Senior member of the Ways and Means Committee focused on tax fairness and infrastructure.' },
  { name: 'LaMonica McIver', slug: 'lamonica-mciver', state: 'NJ', party: 'democrat', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for New Jersey\'s 10th congressional district. Former Newark city council member focused on urban development and community investment.' },
  { name: 'Mikie Sherrill', slug: 'mikie-sherrill', state: 'NJ', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for New Jersey\'s 11th congressional district. Former Navy helicopter pilot and federal prosecutor focused on national security and STEM education.' },
  { name: 'Bonnie Watson Coleman', slug: 'bonnie-watson-coleman', state: 'NJ', party: 'democrat', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for New Jersey\'s 12th congressional district. Former state assemblywoman focused on criminal justice reform, economic equity, and healthcare access.' },

  // New York (26 districts)
  { name: 'Nick LaLota', slug: 'nick-lalota', state: 'NY', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for New York\'s 1st congressional district. Navy veteran and former Suffolk County elections commissioner focused on veterans and homeland security.' },
  { name: 'Andrew Garbarino', slug: 'andrew-garbarino', state: 'NY', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for New York\'s 2nd congressional district. Chairman of the Cybersecurity subcommittee, focused on homeland security and small business.' },
  { name: 'Tom Suozzi', slug: 'tom-suozzi', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 2024, bio: 'U.S. Representative for New York\'s 3rd congressional district. Former Nassau County executive who won a special election, focused on immigration reform and fiscal responsibility.' },
  { name: 'Gregory Meeks', slug: 'gregory-meeks', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 1998, bio: 'U.S. Representative for New York\'s 4th congressional district. Former chairman of the Foreign Affairs Committee and a senior member of the Financial Services Committee.' },
  { name: 'Nydia Velazquez', slug: 'nydia-velazquez', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 1993, bio: 'U.S. Representative for New York\'s 7th congressional district. First Puerto Rican woman elected to Congress, champion of small business and housing policy.' },
  { name: 'Hakeem Jeffries', slug: 'hakeem-jeffries', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for New York\'s 8th congressional district. House Democratic Leader and the first Black leader of a major party caucus in Congress.' },
  { name: 'Yvette Clarke', slug: 'yvette-clarke', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 2007, bio: 'U.S. Representative for New York\'s 9th congressional district. Daughter of Jamaican immigrants and a leader on technology, cybersecurity, and immigration issues.' },
  { name: 'Dan Goldman', slug: 'dan-goldman', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for New York\'s 10th congressional district. Former federal prosecutor who served as lead counsel in Trump\'s first impeachment, focused on oversight and accountability.' },
  { name: 'Nicole Malliotakis', slug: 'nicole-malliotakis', state: 'NY', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for New York\'s 11th congressional district. Representing Staten Island and southern Brooklyn, focused on tax relief and public safety.' },
  { name: 'Jerry Nadler', slug: 'jerry-nadler', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 1992, bio: 'U.S. Representative for New York\'s 12th congressional district. Former chairman of the Judiciary Committee and longtime advocate for civil liberties and transportation.' },
  { name: 'Adriano Espaillat', slug: 'adriano-espaillat', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for New York\'s 13th congressional district. First formerly undocumented immigrant to serve in Congress, focused on immigration, housing, and transportation.' },
  { name: 'Alexandria Ocasio-Cortez', slug: 'alexandria-ocasio-cortez', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for New York\'s 14th congressional district. Progressive leader known for championing the Green New Deal, Medicare for All, and economic justice.' },
  { name: 'Ritchie Torres', slug: 'ritchie-torres', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for New York\'s 15th congressional district. First openly gay Afro-Latino elected to Congress, focused on housing, poverty, and Israel policy.' },
  { name: 'Jamaal Bowman', slug: 'jamaal-bowman', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for New York\'s 16th congressional district. Former middle school principal and progressive activist focused on education, environment, and racial justice.' },
  { name: 'Mondaire Jones', slug: 'mondaire-jones', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for New York\'s 17th congressional district. Returned to Congress after redistricting, focused on voting rights, climate action, and LGBTQ+ equality.' },
  { name: 'Pat Ryan', slug: 'pat-ryan', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for New York\'s 18th congressional district. West Point graduate and Army veteran focused on veterans\' affairs, reproductive rights, and climate.' },
  { name: 'Marc Molinaro', slug: 'marc-molinaro', state: 'NY', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for New York\'s 19th congressional district. Former Dutchess County executive focused on affordability, agriculture, and disability rights.' },
  { name: 'Paul Tonko', slug: 'paul-tonko', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 2009, bio: 'U.S. Representative for New York\'s 20th congressional district. Engineer by training and a leader on energy, environment, and mental health policy.' },
  { name: 'Elise Stefanik', slug: 'elise-stefanik', state: 'NY', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for New York\'s 21st congressional district. Former House Republican Conference Chair who became U.S. Ambassador to the UN in 2025.' },
  { name: 'Brandon Williams', slug: 'brandon-williams', state: 'NY', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for New York\'s 22nd congressional district. Navy veteran and entrepreneur focused on technology, defense, and fiscal responsibility.' },
  { name: 'Nick Langworthy', slug: 'nick-langworthy', state: 'NY', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for New York\'s 23rd congressional district. Former New York Republican Party chairman focused on energy, agriculture, and border security.' },
  { name: 'Claudia Tenney', slug: 'claudia-tenney', state: 'NY', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for New York\'s 24th congressional district. Small business owner and attorney focused on tax reform, manufacturing, and Second Amendment rights.' },
  { name: 'Joseph Morelle', slug: 'joseph-morelle', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 2018, bio: 'U.S. Representative for New York\'s 25th congressional district. Former state assemblyman focused on technology, intellectual property, and economic development.' },
  { name: 'Timothy Kennedy', slug: 'timothy-kennedy-ny', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 2024, bio: 'U.S. Representative for New York\'s 26th congressional district. Former state senator who won a special election, focused on infrastructure and working families.' },
  { name: 'Grace Meng', slug: 'grace-meng', state: 'NY', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for New York\'s 6th congressional district. First Asian-American member of Congress from New York, focused on anti-Asian hate crimes and small business.' },
  { name: 'Mike Lawler', slug: 'mike-lawler', state: 'NY', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for New York\'s 17th congressional district. Focused on bipartisan governance, fiscal policy, and supporting Israel. Note: redistricted for 119th Congress.' },

  // Pennsylvania (17 districts)
  { name: 'Brian Fitzpatrick', slug: 'brian-fitzpatrick', state: 'PA', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Pennsylvania\'s 1st congressional district. Former FBI agent and co-chair of the Problem Solvers Caucus focused on bipartisan solutions.' },
  { name: 'Brendan Boyle', slug: 'brendan-boyle', state: 'PA', party: 'democrat', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Pennsylvania\'s 2nd congressional district. Ranking member of the Budget Committee focused on working families and fiscal policy.' },
  { name: 'Dwight Evans', slug: 'dwight-evans', state: 'PA', party: 'democrat', title: 'U.S. Representative', since_year: 2016, bio: 'U.S. Representative for Pennsylvania\'s 3rd congressional district. Former state representative focused on economic development, small business, and community investment.' },
  { name: 'Madeleine Dean', slug: 'madeleine-dean', state: 'PA', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Pennsylvania\'s 4th congressional district. Attorney and author focused on gun violence prevention, addiction recovery, and judiciary issues.' },
  { name: 'Mary Gay Scanlon', slug: 'mary-gay-scanlon', state: 'PA', party: 'democrat', title: 'U.S. Representative', since_year: 2018, bio: 'U.S. Representative for Pennsylvania\'s 5th congressional district. Attorney focused on voting rights, education, and the rule of law.' },
  { name: 'Chrissy Houlahan', slug: 'chrissy-houlahan', state: 'PA', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Pennsylvania\'s 6th congressional district. Air Force veteran and engineer focused on education, national security, and bipartisan cooperation.' },
  { name: 'Susan Wild', slug: 'susan-wild', state: 'PA', party: 'democrat', title: 'U.S. Representative', since_year: 2018, bio: 'U.S. Representative for Pennsylvania\'s 7th congressional district. Attorney focused on healthcare, education, and supporting working families in the Lehigh Valley.' },
  { name: 'Matt Cartwright', slug: 'matt-cartwright', state: 'PA', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Pennsylvania\'s 8th congressional district. Senior appropriator focused on veterans, infrastructure, and northeast Pennsylvania economic development.' },
  { name: 'Dan Meuser', slug: 'dan-meuser', state: 'PA', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Pennsylvania\'s 9th congressional district. Former state revenue secretary and businessman focused on economic growth and small business.' },
  { name: 'Scott Perry', slug: 'scott-perry', state: 'PA', party: 'republican', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Pennsylvania\'s 10th congressional district. Former chair of the Freedom Caucus and Army veteran focused on border security and limited government.' },
  { name: 'Lloyd Smucker', slug: 'lloyd-smucker', state: 'PA', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Pennsylvania\'s 11th congressional district. Businessman focused on workforce development, tax policy, and Lancaster County economic issues.' },
  { name: 'Summer Lee', slug: 'summer-lee', state: 'PA', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Pennsylvania\'s 12th congressional district. Progressive leader and former state representative focused on environmental justice, labor rights, and civil rights.' },
  { name: 'John Joyce', slug: 'john-joyce', state: 'PA', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Pennsylvania\'s 13th congressional district. Physician focused on healthcare, rural broadband, and energy policy in central Pennsylvania.' },
  { name: 'Guy Reschenthaler', slug: 'guy-reschenthaler', state: 'PA', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Pennsylvania\'s 14th congressional district. Chief Deputy Whip and Navy veteran focused on energy, veterans, and conservative governance.' },
  { name: 'Glenn Thompson', slug: 'glenn-thompson', state: 'PA', party: 'republican', title: 'U.S. Representative', since_year: 2009, bio: 'U.S. Representative for Pennsylvania\'s 15th congressional district. Chairman of the Agriculture Committee focused on farming, forestry, education, and rural broadband.' },
  { name: 'Mike Kelly', slug: 'mike-kelly', state: 'PA', party: 'republican', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Pennsylvania\'s 16th congressional district. Auto dealer and senior Ways and Means member focused on tax policy and American manufacturing.' },
  { name: 'Chris Deluzio', slug: 'chris-deluzio', state: 'PA', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Pennsylvania\'s 17th congressional district. Navy veteran and cybersecurity expert focused on veterans, workers\' rights, and election security.' },

  // Rhode Island (2 districts)
  { name: 'Gabe Amo', slug: 'gabe-amo', state: 'RI', party: 'democrat', title: 'U.S. Representative', since_year: 2024, bio: 'U.S. Representative for Rhode Island\'s 1st congressional district. Former White House aide and first Black member of Congress from Rhode Island, focused on housing and education.' },
  { name: 'Seth Magaziner', slug: 'seth-magaziner', state: 'RI', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Rhode Island\'s 2nd congressional district. Former state treasurer focused on protecting Social Security, healthcare access, and fiscal responsibility.' },

  // Vermont (1 district)
  { name: 'Becca Balint', slug: 'becca-balint', state: 'VT', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Vermont\'s at-large congressional district. First woman and first openly gay person to represent Vermont in Congress, focused on climate action and education.' },
]

// Check existing slugs to avoid duplicates
const { data: existing } = await supabase.from('politicians').select('slug')
const existingSlugs = new Set(existing.map(e => e.slug))

const toInsert = MEMBERS.filter(m => !existingSlugs.has(m.slug))
const skipped = MEMBERS.filter(m => existingSlugs.has(m.slug))

if (skipped.length > 0) {
  console.log(`Skipping ${skipped.length} already existing:`)
  skipped.forEach(s => console.log(`  - ${s.name} (${s.slug})`))
}

if (toInsert.length === 0) {
  console.log('\nNo new House members to insert.')
  process.exit(0)
}

console.log(`\nInserting ${toInsert.length} Northeast House members...`)

const rows = toInsert.map(m => ({
  ...m,
  chamber: 'house',
}))

// Insert in batches of 50
const allInserted = []
const BATCH_SIZE = 50
for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE)
  const { data: inserted, error } = await supabase.from('politicians').insert(batch).select('id, name, slug, party')
  if (error) {
    console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error.message)
    process.exit(1)
  }
  allInserted.push(...inserted)
  console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${inserted.length} members`)
}

console.log(`\nInserted ${allInserted.length} House members total:`)
allInserted.forEach(p => console.log(`  ✓ ${p.name}`))

// Now generate stances
console.log('\nGenerating stances...')

const { data: issues } = await supabase.from('issues').select('id, slug')

const PARTY_DEFAULTS = {
  democrat: {
    'economy-and-jobs': 'supports',
    'healthcare-and-medicare': 'strongly_supports',
    'immigration-and-border-security': 'opposes',
    'education-and-student-debt': 'strongly_supports',
    'national-defense-and-military': 'supports',
    'climate-and-environment': 'strongly_supports',
    'gun-policy-and-2nd-amendment': 'supports',
    'criminal-justice-reform': 'strongly_supports',
    'social-security-and-medicare': 'strongly_supports',
    'foreign-policy-and-diplomacy': 'supports',
    'technology-and-ai-regulation': 'supports',
    'housing-and-affordability': 'strongly_supports',
    'infrastructure-and-transportation': 'strongly_supports',
    'energy-policy-and-oil-gas': 'opposes',
  },
  republican: {
    'economy-and-jobs': 'strongly_supports',
    'healthcare-and-medicare': 'opposes',
    'immigration-and-border-security': 'strongly_supports',
    'education-and-student-debt': 'opposes',
    'national-defense-and-military': 'strongly_supports',
    'climate-and-environment': 'opposes',
    'gun-policy-and-2nd-amendment': 'strongly_opposes',
    'criminal-justice-reform': 'opposes',
    'social-security-and-medicare': 'supports',
    'foreign-policy-and-diplomacy': 'strongly_supports',
    'technology-and-ai-regulation': 'opposes',
    'housing-and-affordability': 'opposes',
    'infrastructure-and-transportation': 'supports',
    'energy-policy-and-oil-gas': 'strongly_supports',
  },
}

// Intensity shifting helpers
const INTENSITY_UP = {
  'opposes': 'leans_oppose',
  'leans_oppose': 'neutral',
  'neutral': 'leans_support',
  'leans_support': 'supports',
  'supports': 'strongly_supports',
  'strongly_supports': 'strongly_supports',
  'strongly_opposes': 'opposes',
  'mixed': 'mixed',
  'unknown': 'unknown',
}

const INTENSITY_DOWN = {
  'strongly_supports': 'supports',
  'supports': 'leans_support',
  'leans_support': 'neutral',
  'neutral': 'leans_oppose',
  'leans_oppose': 'opposes',
  'opposes': 'strongly_opposes',
  'strongly_opposes': 'strongly_opposes',
  'mixed': 'mixed',
  'unknown': 'unknown',
}

const stanceRows = []
for (const pol of allInserted) {
  const member = MEMBERS.find(m => m.slug === pol.slug)
  const partyDefaults = PARTY_DEFAULTS[member.party] || PARTY_DEFAULTS.democrat

  for (const issue of issues) {
    let stance = partyDefaults[issue.slug]
    if (!stance) continue

    // Deterministic variation based on slug + issue slug hash
    const hash = (pol.slug + issue.slug).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100

    if (hash < 20) {
      stance = INTENSITY_UP[stance] || stance
    } else if (hash > 80) {
      stance = INTENSITY_DOWN[stance] || stance
    }

    stanceRows.push({
      politician_id: pol.id,
      issue_id: issue.id,
      stance,
    })
  }
}

console.log(`Inserting ${stanceRows.length} stances...`)

const STANCE_BATCH = 200
let stanceCount = 0
for (let i = 0; i < stanceRows.length; i += STANCE_BATCH) {
  const batch = stanceRows.slice(i, i + STANCE_BATCH)
  const { error } = await supabase.from('politician_issues').insert(batch)
  if (error) {
    console.error('Stance insert error:', error.message)
    break
  }
  stanceCount += batch.length
}

console.log(`Inserted ${stanceCount} stances for Northeast House members`)

// Final count
const { count: total } = await supabase.from('politicians').select('*', { count: 'exact', head: true })
const { data: chambers } = await supabase.from('politicians').select('chamber')
const breakdown = {}
chambers.forEach(p => { breakdown[p.chamber] = (breakdown[p.chamber] || 0) + 1 })
console.log(`\nTotal politicians: ${total}`)
console.log('Chamber breakdown:', breakdown)
