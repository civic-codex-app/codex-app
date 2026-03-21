import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}
const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// ─── Midwest U.S. House Representatives (119th Congress, 2025-2026) ───

const MEMBERS = [
  // ── Illinois (17 districts) ──
  { name: 'Jonathan Jackson', slug: 'jonathan-jackson', state: 'IL', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Illinois\'s 1st congressional district. Son of civil rights leader Jesse Jackson, he focuses on economic justice and community development in Chicago\'s South Side.' },
  { name: 'Robin Kelly', slug: 'robin-kelly', state: 'IL', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Illinois\'s 2nd congressional district. Former chief of staff to the Illinois State Treasurer, she focuses on gun violence prevention and technology policy.' },
  { name: 'Delia Ramirez', slug: 'delia-ramirez', state: 'IL', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Illinois\'s 3rd congressional district. First Guatemalan-American elected to Congress from the Midwest, focused on immigration reform and housing.' },
  { name: 'Jesús "Chuy" García', slug: 'jesus-chuy-garcia', state: 'IL', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Illinois\'s 4th congressional district. A longtime Chicago political figure and community organizer advocating for immigrant rights and workers\' protections.' },
  { name: 'Mike Quigley', slug: 'mike-quigley', state: 'IL', party: 'democrat', title: 'U.S. Representative', since_year: 2009, bio: 'U.S. Representative for Illinois\'s 5th congressional district. A senior Appropriations Committee member focused on government transparency and infrastructure investment.' },
  { name: 'Sean Casten', slug: 'sean-casten', state: 'IL', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Illinois\'s 6th congressional district. A clean energy entrepreneur focused on climate change, science-based policy, and financial regulation.' },
  { name: 'Danny K. Davis', slug: 'danny-k-davis', state: 'IL', party: 'democrat', title: 'U.S. Representative', since_year: 1997, bio: 'U.S. Representative for Illinois\'s 7th congressional district. A veteran Chicago lawmaker focused on poverty reduction, criminal justice reform, and healthcare access.' },
  { name: 'Raja Krishnamoorthi', slug: 'raja-krishnamoorthi', state: 'IL', party: 'democrat', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Illinois\'s 8th congressional district. An Indian-American lawmaker focused on technology policy, education, and economic opportunity.' },
  { name: 'Jan Schakowsky', slug: 'jan-schakowsky', state: 'IL', party: 'democrat', title: 'U.S. Representative', since_year: 1999, bio: 'U.S. Representative for Illinois\'s 9th congressional district. A veteran progressive lawmaker focused on consumer protection, healthcare, and senior citizens\' issues.' },
  { name: 'Brad Schneider', slug: 'brad-schneider', state: 'IL', party: 'democrat', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Illinois\'s 10th congressional district. A business consultant focused on Middle East policy, small business support, and bipartisan cooperation.' },
  { name: 'Bill Foster', slug: 'bill-foster', state: 'IL', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Illinois\'s 11th congressional district. A physicist and the only Ph.D. scientist in Congress, focused on science policy, technology, and financial reform.' },
  { name: 'Mike Bost', slug: 'mike-bost', state: 'IL', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Illinois\'s 12th congressional district. A Marine Corps veteran and former state legislator who chairs the House Veterans\' Affairs Committee.' },
  { name: 'Nikki Budzinski', slug: 'nikki-budzinski', state: 'IL', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Illinois\'s 13th congressional district. A former senior labor official in the Biden administration focused on workers\' rights and economic development.' },
  { name: 'Lauren Underwood', slug: 'lauren-underwood', state: 'IL', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Illinois\'s 14th congressional district. A registered nurse and the youngest Black woman to serve in Congress, focused on healthcare and maternal health.' },
  { name: 'Mary Miller', slug: 'mary-miller', state: 'IL', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Illinois\'s 15th congressional district. A farmer and conservative lawmaker aligned with the Freedom Caucus, focused on agriculture and Second Amendment rights.' },
  { name: 'Darin LaHood', slug: 'darin-lahood', state: 'IL', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Illinois\'s 16th congressional district. A former prosecutor and son of former Transportation Secretary Ray LaHood, focused on trade and intelligence policy.' },
  { name: 'Eric Sorensen', slug: 'eric-sorensen', state: 'IL', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Illinois\'s 17th congressional district. A former television meteorologist and the first openly gay person elected to Congress from Illinois, focused on climate and veterans.' },

  // ── Indiana (9 districts) ──
  { name: 'Frank Mrvan', slug: 'frank-mrvan', state: 'IN', party: 'democrat', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Indiana\'s 1st congressional district. A former township trustee from northwest Indiana focused on steel industry workers and labor protections.' },
  { name: 'Rudy Yakym', slug: 'rudy-yakym', state: 'IN', party: 'republican', title: 'U.S. Representative', since_year: 2022, bio: 'U.S. Representative for Indiana\'s 2nd congressional district. A business executive who won a special election to replace the late Jackie Walorski, focused on fiscal conservatism.' },
  { name: 'Jim Banks', slug: 'jim-banks', state: 'IN', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Indiana\'s 3rd congressional district. A Navy Reserve officer and conservative leader focused on defense policy and combating progressive ideology in institutions.' },
  { name: 'Jim Baird', slug: 'jim-baird', state: 'IN', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Indiana\'s 4th congressional district. A Vietnam War veteran and former state legislator focused on agriculture, science, and veteran affairs.' },
  { name: 'Victoria Spartz', slug: 'victoria-spartz', state: 'IN', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Indiana\'s 5th congressional district. Born in Ukraine, she focuses on fiscal policy, government accountability, and Ukraine-related foreign policy.' },
  { name: 'Greg Pence', slug: 'greg-pence', state: 'IN', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Indiana\'s 6th congressional district. A Marine Corps veteran and businessman, brother of former Vice President Mike Pence, focused on small business and veterans.' },
  { name: 'André Carson', slug: 'andre-carson', state: 'IN', party: 'democrat', title: 'U.S. Representative', since_year: 2008, bio: 'U.S. Representative for Indiana\'s 7th congressional district. One of the first Muslim members of Congress, serving on the Intelligence Committee and focused on national security and education.' },
  { name: 'Mark Messmer', slug: 'mark-messmer', state: 'IN', party: 'republican', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for Indiana\'s 8th congressional district. A former Indiana state senator focused on energy policy, agriculture, and conservative fiscal governance.' },
  { name: 'Erin Houchin', slug: 'erin-houchin', state: 'IN', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Indiana\'s 9th congressional district. A former state legislator focused on reducing government spending, border security, and supporting families.' },

  // ── Iowa (4 districts) ──
  { name: 'Mariannette Miller-Meeks', slug: 'mariannette-miller-meeks', state: 'IA', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Iowa\'s 1st congressional district. An ophthalmologist and Army veteran who won her first race by just six votes, focused on healthcare and veterans\' issues.' },
  { name: 'Ashley Hinson', slug: 'ashley-hinson', state: 'IA', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Iowa\'s 2nd congressional district. A former television journalist and state legislator focused on agriculture, education, and fiscal responsibility.' },
  { name: 'Zach Nunn', slug: 'zach-nunn', state: 'IA', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Iowa\'s 3rd congressional district. An Air Force veteran and former state legislator focused on cybersecurity, agriculture, and national defense.' },
  { name: 'Randy Feenstra', slug: 'randy-feenstra', state: 'IA', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Iowa\'s 4th congressional district. A former state senator and business executive focused on agriculture, biofuels, and rural economic development.' },

  // ── Kansas (4 districts) ──
  { name: 'Tracey Mann', slug: 'tracey-mann', state: 'KS', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Kansas\'s 1st congressional district. A former lieutenant governor candidate and real estate professional focused on agriculture and rural issues.' },
  { name: 'Jake LaTurner', slug: 'jake-laturner', state: 'KS', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Kansas\'s 2nd congressional district. A former state treasurer focused on fiscal responsibility, border security, and supporting law enforcement.' },
  { name: 'Sharice Davids', slug: 'sharice-davids', state: 'KS', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Kansas\'s 3rd congressional district. One of the first two Native American women in Congress and the first openly LGBTQ person elected from Kansas, focused on healthcare and economic opportunity.' },
  { name: 'Ron Estes', slug: 'ron-estes', state: 'KS', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Kansas\'s 4th congressional district. A former state treasurer and engineer focused on tax policy, aviation industry support, and reducing government spending.' },

  // ── Michigan (13 districts) ──
  { name: 'Jack Bergman', slug: 'jack-bergman', state: 'MI', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Michigan\'s 1st congressional district. A retired Marine Corps lieutenant general, the highest-ranking military officer ever elected to Congress, focused on defense and veterans.' },
  { name: 'John Moolenaar', slug: 'john-moolenaar', state: 'MI', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Michigan\'s 2nd congressional district. A chemist and former state legislator who chairs the Select Committee on the Chinese Communist Party.' },
  { name: 'Scholten Hillary', slug: 'hillary-scholten', state: 'MI', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Michigan\'s 3rd congressional district. A former immigration attorney focused on immigration reform, healthcare access, and West Michigan economic development.' },
  { name: 'Bill Huizenga', slug: 'bill-huizenga', state: 'MI', party: 'republican', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Michigan\'s 4th congressional district. A senior Financial Services Committee member focused on capital markets regulation and Great Lakes preservation.' },
  { name: 'Tim Walberg', slug: 'tim-walberg', state: 'MI', party: 'republican', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Michigan\'s 5th congressional district. A former pastor and longtime lawmaker focused on education policy, workforce development, and energy.' },
  { name: 'Debbie Dingell', slug: 'debbie-dingell', state: 'MI', party: 'democrat', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Michigan\'s 6th congressional district. Succeeded her late husband John Dingell, she focuses on auto industry, healthcare, and environmental protection.' },
  { name: 'Curtis Hertel', slug: 'curtis-hertel', state: 'MI', party: 'democrat', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for Michigan\'s 7th congressional district. A former state senator focused on labor rights, education funding, and Michigan manufacturing.' },
  { name: 'Paul Junge', slug: 'paul-junge', state: 'MI', party: 'republican', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for Michigan\'s 8th congressional district. A former television news anchor and U.S. Citizenship and Immigration Services official focused on immigration and public safety.' },
  { name: 'Lisa McClain', slug: 'lisa-mcclain', state: 'MI', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Michigan\'s 9th congressional district. A businesswoman and member of House Republican leadership focused on tax policy and government efficiency.' },
  { name: 'John James', slug: 'john-james', state: 'MI', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Michigan\'s 10th congressional district. An Army helicopter pilot and combat veteran who served in Iraq, focused on defense, veterans, and Detroit-area economic growth.' },
  { name: 'Haley Stevens', slug: 'haley-stevens', state: 'MI', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Michigan\'s 11th congressional district. A former Obama auto industry task force member focused on manufacturing, STEM education, and women\'s issues.' },
  { name: 'Rashida Tlaib', slug: 'rashida-tlaib', state: 'MI', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Michigan\'s 12th congressional district. The first Palestinian-American woman in Congress, a progressive leader focused on environmental justice, workers\' rights, and civil liberties.' },
  { name: 'Shri Thanedar', slug: 'shri-thanedar', state: 'MI', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Michigan\'s 13th congressional district. An Indian-American scientist and entrepreneur focused on economic equity, healthcare access, and immigration reform in Detroit.' },

  // ── Minnesota (8 districts) ──
  { name: 'Brad Finstad', slug: 'brad-finstad', state: 'MN', party: 'republican', title: 'U.S. Representative', since_year: 2022, bio: 'U.S. Representative for Minnesota\'s 1st congressional district. A former USDA state director and farmer focused on agriculture policy, trade, and rural broadband access.' },
  { name: 'Angie Craig', slug: 'angie-craig', state: 'MN', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Minnesota\'s 2nd congressional district. A former manufacturing executive focused on healthcare affordability, agriculture, and LGBTQ rights.' },
  { name: 'Kelly Morrison', slug: 'kelly-morrison', state: 'MN', party: 'democrat', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for Minnesota\'s 3rd congressional district. An OB-GYN physician and former state senator focused on reproductive rights, healthcare, and education.' },
  { name: 'Betty McCollum', slug: 'betty-mccollum', state: 'MN', party: 'democrat', title: 'U.S. Representative', since_year: 2001, bio: 'U.S. Representative for Minnesota\'s 4th congressional district. A senior Appropriations member focused on defense spending, Native American rights, and environmental protection.' },
  { name: 'Ilhan Omar', slug: 'ilhan-omar', state: 'MN', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Minnesota\'s 5th congressional district. The first Somali-American and one of the first Muslim women in Congress, focused on progressive economic and foreign policy.' },
  { name: 'Tom Emmer', slug: 'tom-emmer', state: 'MN', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Minnesota\'s 6th congressional district. The House Majority Whip, focused on cryptocurrency regulation, digital assets policy, and Republican leadership strategy.' },
  { name: 'Michelle Fischbach', slug: 'michelle-fischbach', state: 'MN', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Minnesota\'s 7th congressional district. A former lieutenant governor and state senator focused on agriculture, rural issues, and Second Amendment rights.' },
  { name: 'Pete Stauber', slug: 'pete-stauber', state: 'MN', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Minnesota\'s 8th congressional district. A former police officer and professional hockey player focused on mining, law enforcement, and Iron Range economic issues.' },

  // ── Missouri (8 districts) ──
  { name: 'Mark Alford', slug: 'mark-alford', state: 'MO', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Missouri\'s 4th congressional district. A former television news anchor focused on veterans\' affairs, agriculture, and conservative values.' },
  { name: 'Emanuel Cleaver', slug: 'emanuel-cleaver', state: 'MO', party: 'democrat', title: 'U.S. Representative', since_year: 2005, bio: 'U.S. Representative for Missouri\'s 5th congressional district. A former Kansas City mayor and United Methodist pastor focused on community development, housing, and civil rights.' },
  { name: 'Sam Graves', slug: 'sam-graves', state: 'MO', party: 'republican', title: 'U.S. Representative', since_year: 2001, bio: 'U.S. Representative for Missouri\'s 6th congressional district. The ranking member on Transportation and Infrastructure, focused on highways, aviation, and Missouri agriculture.' },
  { name: 'Eric Burlison', slug: 'eric-burlison', state: 'MO', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Missouri\'s 7th congressional district. A former state legislator and Freedom Caucus member focused on fiscal conservatism and limited government.' },
  { name: 'Jason Smith', slug: 'jason-smith', state: 'MO', party: 'republican', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Missouri\'s 8th congressional district. Chairman of the House Ways and Means Committee, focused on tax reform and rural economic development.' },
  { name: 'Cori Bush', slug: 'cori-bush', state: 'MO', party: 'democrat', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Missouri\'s 1st congressional district. A nurse and activist who rose to prominence during Ferguson protests, focused on racial justice, housing, and progressive economic policy.' },
  { name: 'Ann Wagner', slug: 'ann-wagner', state: 'MO', party: 'republican', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Missouri\'s 2nd congressional district. A former U.S. Ambassador to Luxembourg and RNC co-chair, focused on financial services, anti-trafficking, and pro-life issues.' },
  { name: 'Blaine Luetkemeyer', slug: 'blaine-luetkemeyer', state: 'MO', party: 'republican', title: 'U.S. Representative', since_year: 2009, bio: 'U.S. Representative for Missouri\'s 3rd congressional district. A former state legislator and banker focused on financial regulation, small business, and agricultural policy.' },

  // ── Nebraska (3 districts) ──
  { name: 'Mike Flood', slug: 'mike-flood', state: 'NE', party: 'republican', title: 'U.S. Representative', since_year: 2022, bio: 'U.S. Representative for Nebraska\'s 1st congressional district. A former speaker of the Nebraska legislature and media company owner focused on agriculture and rural broadband.' },
  { name: 'Don Bacon', slug: 'don-bacon', state: 'NE', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Nebraska\'s 2nd congressional district. A retired Air Force brigadier general focused on bipartisan cooperation, defense, and Midwest infrastructure.' },
  { name: 'Adrian Smith', slug: 'adrian-smith', state: 'NE', party: 'republican', title: 'U.S. Representative', since_year: 2007, bio: 'U.S. Representative for Nebraska\'s 3rd congressional district. A senior Ways and Means member focused on trade policy, agriculture, and tax reform for rural America.' },

  // ── North Dakota (1 at-large district) ──
  { name: 'Kelly Armstrong', slug: 'kelly-armstrong', state: 'ND', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for North Dakota\'s at-large congressional district. A former state senator focused on energy production, tribal issues, and criminal justice reform.' },

  // ── Ohio (15 districts) ──
  { name: 'Greg Landsman', slug: 'greg-landsman', state: 'OH', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Ohio\'s 1st congressional district. A former Cincinnati city council member and education nonprofit leader focused on preschool access and economic growth.' },
  { name: 'Brad Wenstrup', slug: 'brad-wenstrup', state: 'OH', party: 'republican', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Ohio\'s 2nd congressional district. A podiatric surgeon and Iraq War combat veteran focused on healthcare, veterans\' affairs, and intelligence policy.' },
  { name: 'Joyce Beatty', slug: 'joyce-beatty', state: 'OH', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Ohio\'s 3rd congressional district. A former Ohio state legislator focused on financial services, economic equity, and Black community empowerment.' },
  { name: 'Jim Jordan', slug: 'jim-jordan', state: 'OH', party: 'republican', title: 'U.S. Representative', since_year: 2007, bio: 'U.S. Representative for Ohio\'s 4th congressional district. Chairman of the House Judiciary Committee and Freedom Caucus co-founder, a leading conservative voice on government oversight.' },
  { name: 'Bob Latta', slug: 'bob-latta', state: 'OH', party: 'republican', title: 'U.S. Representative', since_year: 2007, bio: 'U.S. Representative for Ohio\'s 5th congressional district. Chairman of the Energy and Commerce Subcommittee on Communications, focused on broadband and technology policy.' },
  { name: 'Michael Rulli', slug: 'michael-rulli', state: 'OH', party: 'republican', title: 'U.S. Representative', since_year: 2024, bio: 'U.S. Representative for Ohio\'s 6th congressional district. A businessman and former state senator from the Youngstown area, focused on manufacturing, energy, and border security.' },
  { name: 'Max Miller', slug: 'max-miller', state: 'OH', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Ohio\'s 7th congressional district. A former Trump White House aide and Marine Corps Reserve officer focused on Israel policy, defense, and veterans.' },
  { name: 'Warren Davidson', slug: 'warren-davidson', state: 'OH', party: 'republican', title: 'U.S. Representative', since_year: 2016, bio: 'U.S. Representative for Ohio\'s 8th congressional district. A West Point graduate and Army veteran focused on cryptocurrency regulation, financial innovation, and limited government.' },
  { name: 'Marcy Kaptur', slug: 'marcy-kaptur', state: 'OH', party: 'democrat', title: 'U.S. Representative', since_year: 1983, bio: 'U.S. Representative for Ohio\'s 9th congressional district. The longest-serving woman in House history, focused on manufacturing, trade, Great Lakes preservation, and auto worker protections.' },
  { name: 'Michael Turner', slug: 'michael-turner', state: 'OH', party: 'republican', title: 'U.S. Representative', since_year: 2003, bio: 'U.S. Representative for Ohio\'s 10th congressional district. Chairman of the House Intelligence Committee, focused on national security, defense, and Wright-Patterson Air Force Base.' },
  { name: 'Shontel Brown', slug: 'shontel-brown', state: 'OH', party: 'democrat', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Ohio\'s 11th congressional district. A former Cuyahoga County Democratic Party chair focused on economic development, healthcare, and racial equity in Cleveland.' },
  { name: 'Troy Balderson', slug: 'troy-balderson', state: 'OH', party: 'republican', title: 'U.S. Representative', since_year: 2018, bio: 'U.S. Representative for Ohio\'s 12th congressional district. A former state legislator focused on energy policy, small business, and central Ohio infrastructure.' },
  { name: 'Emilia Sykes', slug: 'emilia-sykes', state: 'OH', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Ohio\'s 13th congressional district. A former Ohio House minority leader from Akron focused on healthcare, criminal justice reform, and economic opportunity.' },
  { name: 'David Joyce', slug: 'david-joyce', state: 'OH', party: 'republican', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Ohio\'s 14th congressional district. A former prosecutor focused on Appropriations, Great Lakes restoration, and bipartisan cannabis reform.' },
  { name: 'Mike Carey', slug: 'mike-carey', state: 'OH', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Ohio\'s 15th congressional district. A coal industry lobbyist turned lawmaker focused on energy production, natural gas, and Ohio economic interests.' },

  // ── South Dakota (1 at-large district) ──
  { name: 'Dusty Johnson', slug: 'dusty-johnson', state: 'SD', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for South Dakota\'s at-large congressional district. A former state PUC commissioner and leader of the pragmatic Main Street Caucus, focused on agriculture, broadband, and bipartisan solutions.' },

  // ── Wisconsin (8 districts) ──
  { name: 'Bryan Steil', slug: 'bryan-steil', state: 'WI', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Wisconsin\'s 1st congressional district. Chairman of the House Administration Committee, focused on election integrity, workforce development, and manufacturing.' },
  { name: 'Mark Pocan', slug: 'mark-pocan', state: 'WI', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Wisconsin\'s 2nd congressional district. A progressive leader and Congressional Progressive Caucus member focused on workers\' rights, healthcare, and LGBTQ equality.' },
  { name: 'Derrick Van Orden', slug: 'derrick-van-orden', state: 'WI', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Wisconsin\'s 3rd congressional district. A retired Navy SEAL who served in combat, focused on veterans\' issues, agriculture, and rural economic development.' },
  { name: 'Gwen Moore', slug: 'gwen-moore', state: 'WI', party: 'democrat', title: 'U.S. Representative', since_year: 2005, bio: 'U.S. Representative for Wisconsin\'s 4th congressional district. The first Black member of Congress from Wisconsin, a senior Ways and Means member focused on poverty, housing, and tax policy.' },
  { name: 'Scott Fitzgerald', slug: 'scott-fitzgerald', state: 'WI', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Wisconsin\'s 5th congressional district. A former state senate majority leader known for passing Act 10 union reforms, focused on fiscal conservatism and education.' },
  { name: 'Glenn Grothman', slug: 'glenn-grothman', state: 'WI', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Wisconsin\'s 6th congressional district. A former state senator focused on government oversight, immigration, welfare reform, and reducing government spending.' },
  { name: 'Tom Tiffany', slug: 'tom-tiffany', state: 'WI', party: 'republican', title: 'U.S. Representative', since_year: 2020, bio: 'U.S. Representative for Wisconsin\'s 7th congressional district. A former state senator focused on natural resources, public lands, mining policy, and conservative governance.' },
  { name: 'Tony Wied', slug: 'tony-wied', state: 'WI', party: 'republican', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for Wisconsin\'s 8th congressional district. A business owner from the Green Bay area focused on manufacturing, fiscal responsibility, and border security.' },
]

// ─── Check for existing slugs to avoid duplicates ───

const allSlugs = MEMBERS.map(m => m.slug)
const { data: existing, error: fetchErr } = await supabase
  .from('politicians')
  .select('slug')
  .in('slug', allSlugs)

if (fetchErr) {
  console.error('Error fetching existing politicians:', fetchErr.message)
  process.exit(1)
}

const existingSlugs = new Set((existing || []).map(e => e.slug))

const toInsert = MEMBERS.filter(m => !existingSlugs.has(m.slug))
const skipped = MEMBERS.filter(m => existingSlugs.has(m.slug))

if (skipped.length > 0) {
  console.log(`Skipping ${skipped.length} already existing:`)
  skipped.forEach(s => console.log(`  - ${s.name} (${s.slug})`))
}

if (toInsert.length === 0) {
  console.log('\nNo new members to insert.')
  process.exit(0)
}

console.log(`\nInserting ${toInsert.length} Midwest House members...`)

// ─── Insert in batches of 50 ───

const BATCH_SIZE = 50
const allInserted = []

for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
  const batch = toInsert.slice(i, i + BATCH_SIZE)
  const rows = batch.map(m => ({
    name: m.name,
    slug: m.slug,
    state: m.state,
    party: m.party,
    title: m.title,
    since_year: m.since_year,
    bio: m.bio,
    chamber: 'house',
  }))

  const { data: inserted, error } = await supabase
    .from('politicians')
    .insert(rows)
    .select('id, name, slug')

  if (error) {
    console.error(`Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message)
    process.exit(1)
  }

  allInserted.push(...inserted)
  console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${inserted.length} members`)
}

console.log(`\nInserted ${allInserted.length} Midwest House members:`)
allInserted.forEach(p => console.log(`  ✓ ${p.name}`))

// ─── Generate stances for newly inserted members ───

console.log('\nGenerating stances...')

const { data: issues } = await supabase.from('issues').select('id, slug')

if (!issues || issues.length === 0) {
  console.error('No issues found in the database.')
  process.exit(1)
}

const PARTY_DEFAULTS = {
  democrat: {
    'economy-and-jobs': 'supports', 'healthcare-and-medicare': 'strongly_supports',
    'immigration-and-border-security': 'opposes', 'education-and-student-debt': 'strongly_supports',
    'national-defense-and-military': 'supports', 'climate-and-environment': 'strongly_supports',
    'gun-policy-and-2nd-amendment': 'supports', 'criminal-justice-reform': 'strongly_supports',
    'social-security-and-medicare': 'strongly_supports', 'foreign-policy-and-diplomacy': 'supports',
    'technology-and-ai-regulation': 'supports', 'housing-and-affordability': 'strongly_supports',
    'infrastructure-and-transportation': 'strongly_supports', 'energy-policy-and-oil-gas': 'opposes',
  },
  republican: {
    'economy-and-jobs': 'strongly_supports', 'healthcare-and-medicare': 'opposes',
    'immigration-and-border-security': 'strongly_supports', 'education-and-student-debt': 'opposes',
    'national-defense-and-military': 'strongly_supports', 'climate-and-environment': 'opposes',
    'gun-policy-and-2nd-amendment': 'strongly_opposes', 'criminal-justice-reform': 'opposes',
    'social-security-and-medicare': 'supports', 'foreign-policy-and-diplomacy': 'strongly_supports',
    'technology-and-ai-regulation': 'opposes', 'housing-and-affordability': 'opposes',
    'infrastructure-and-transportation': 'supports', 'energy-policy-and-oil-gas': 'strongly_supports',
  },
}

// Intensity shift map — one step more or less intense
const INTENSITY_UP = {
  'opposes': 'strongly_opposes',
  'supports': 'strongly_supports',
  'leans_oppose': 'opposes',
  'leans_support': 'supports',
  'neutral': 'leans_support',
  'mixed': 'leans_oppose',
  'strongly_supports': 'strongly_supports',
  'strongly_opposes': 'strongly_opposes',
}

const INTENSITY_DOWN = {
  'strongly_supports': 'supports',
  'strongly_opposes': 'opposes',
  'supports': 'leans_support',
  'opposes': 'leans_oppose',
  'leans_support': 'neutral',
  'leans_oppose': 'mixed',
  'neutral': 'neutral',
  'mixed': 'mixed',
}

const stanceRows = []

for (const pol of allInserted) {
  const member = MEMBERS.find(m => m.slug === pol.slug)
  const partyDefaults = PARTY_DEFAULTS[member.party] || PARTY_DEFAULTS.democrat

  for (const issue of issues) {
    const baseStance = partyDefaults[issue.slug]
    if (!baseStance) continue

    // Deterministic variation based on slug + issue
    const hash = (pol.slug + issue.slug).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100

    let stance = baseStance
    if (hash < 10) {
      // 10% chance: shift one step more intense
      stance = INTENSITY_UP[baseStance] || baseStance
    } else if (hash >= 10 && hash < 22) {
      // 12% chance: shift one step less intense
      stance = INTENSITY_DOWN[baseStance] || baseStance
    } else if (hash >= 95) {
      // 5% chance: mixed
      stance = 'mixed'
    }

    stanceRows.push({
      politician_id: pol.id,
      issue_id: issue.id,
      stance,
    })
  }
}

console.log(`Generated ${stanceRows.length} stance rows, inserting...`)

const STANCE_BATCH = 200
let stanceCount = 0
for (let i = 0; i < stanceRows.length; i += STANCE_BATCH) {
  const batch = stanceRows.slice(i, i + STANCE_BATCH)
  const { error } = await supabase.from('politician_issues').insert(batch)
  if (error) {
    console.error(`Stance insert error at batch ${Math.floor(i / STANCE_BATCH) + 1}:`, error.message)
    break
  }
  stanceCount += batch.length
}

console.log(`Inserted ${stanceCount} stances for Midwest House members`)

// ─── Summary ───

const { count: total } = await supabase
  .from('politicians')
  .select('*', { count: 'exact', head: true })

const { count: stanceTotal } = await supabase
  .from('politician_issues')
  .select('*', { count: 'exact', head: true })

console.log(`\nTotal politicians in DB: ${total}`)
console.log(`Total stances in DB: ${stanceTotal}`)

// State breakdown for Midwest
const midwestStates = ['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI']
const { data: midwestPols } = await supabase
  .from('politicians')
  .select('state')
  .eq('chamber', 'house')
  .in('state', midwestStates)

const stateBreakdown = {}
midwestPols.forEach(p => { stateBreakdown[p.state] = (stateBreakdown[p.state] || 0) + 1 })
console.log('Midwest House members by state:', stateBreakdown)
