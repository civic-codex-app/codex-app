import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}
const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Western state U.S. House Representatives — 119th Congress (2025-2026)
const MEMBERS = [
  // Alaska (1 at-large)
  { name: 'Mary Peltola', slug: 'mary-peltola', state: 'AK', party: 'democrat', title: 'U.S. Representative', since_year: 2022, bio: 'U.S. Representative for Alaska\'s at-large congressional district. First Alaska Native elected to Congress and the first Democrat to represent Alaska in the House since 1972.' },

  // Arizona (9 districts)
  { name: 'David Schweikert', slug: 'david-schweikert', state: 'AZ', party: 'republican', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Arizona\'s 1st congressional district. CPA and former Maricopa County Treasurer focused on fiscal policy and technology innovation.' },
  { name: 'Eli Crane', slug: 'eli-crane', state: 'AZ', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Arizona\'s 2nd congressional district. Former Navy SEAL and small business owner who founded Bottle Breacher.' },
  { name: 'Bob Stanton', slug: 'bob-stanton', state: 'AZ', party: 'republican', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for Arizona\'s 3rd congressional district. Elected in 2024 to represent the Phoenix metro area.' },
  { name: 'Greg Stanton', slug: 'greg-stanton', state: 'AZ', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Arizona\'s 4th congressional district. Former Mayor of Phoenix focused on infrastructure and economic development.' },
  { name: 'Andy Biggs', slug: 'andy-biggs', state: 'AZ', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Arizona\'s 5th congressional district. Former Arizona Senate President and member of the House Freedom Caucus.' },
  { name: 'Juan Ciscomani', slug: 'juan-ciscomani', state: 'AZ', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Arizona\'s 6th congressional district. First Mexican-born Republican elected to Congress from Arizona, representing the Tucson area.' },
  { name: 'Raúl Grijalva', slug: 'raul-grijalva', state: 'AZ', party: 'democrat', title: 'U.S. Representative', since_year: 2003, bio: 'U.S. Representative for Arizona\'s 7th congressional district. Senior member of Congress and former Chair of the House Natural Resources Committee.' },
  { name: 'Debbie Lesko', slug: 'debbie-lesko', state: 'AZ', party: 'republican', title: 'U.S. Representative', since_year: 2018, bio: 'U.S. Representative for Arizona\'s 8th congressional district. Former Arizona state senator focused on border security and veterans affairs.' },
  { name: 'Paul Gosar', slug: 'paul-gosar', state: 'AZ', party: 'republican', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Arizona\'s 9th congressional district. Dentist turned congressman and member of the House Freedom Caucus.' },

  // California (52 districts)
  { name: 'Doug LaMalfa', slug: 'doug-lamalfa', state: 'CA', party: 'republican', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for California\'s 1st congressional district. Rice farmer representing the rural northern part of the state, focused on agriculture and water policy.' },
  { name: 'Jared Huffman', slug: 'jared-huffman', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for California\'s 2nd congressional district. Environmental attorney representing the North Coast, focused on climate and public lands.' },
  { name: 'Kevin Kiley', slug: 'kevin-kiley', state: 'CA', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for California\'s 3rd congressional district. Former state assemblymember and deputy attorney general representing the Sacramento suburbs.' },
  { name: 'Mike Thompson', slug: 'mike-thompson-ca', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 1999, bio: 'U.S. Representative for California\'s 4th congressional district. Vietnam War veteran and senior member focused on gun violence prevention and wine country issues.' },
  { name: 'Tom McClintock', slug: 'tom-mcclintock', state: 'CA', party: 'republican', title: 'U.S. Representative', since_year: 2009, bio: 'U.S. Representative for California\'s 5th congressional district. Fiscal conservative representing the Sierra Nevada region, focused on government spending and immigration.' },
  { name: 'Ami Bera', slug: 'ami-bera', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for California\'s 6th congressional district. Physician and former medical school dean representing the Sacramento area.' },
  { name: 'Doris Matsui', slug: 'doris-matsui', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2005, bio: 'U.S. Representative for California\'s 7th congressional district. Senior member representing downtown Sacramento, focused on technology and energy policy.' },
  { name: 'John Garamendi', slug: 'john-garamendi', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2009, bio: 'U.S. Representative for California\'s 8th congressional district. Former Lieutenant Governor of California focused on manufacturing and military affairs.' },
  { name: 'Josh Harder', slug: 'josh-harder', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for California\'s 9th congressional district. Former venture capitalist representing the Central Valley, focused on agriculture and water.' },
  { name: 'Mark DeSaulnier', slug: 'mark-desaulnier', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for California\'s 10th congressional district. Former state senator representing Contra Costa County, focused on labor and education.' },
  { name: 'Nancy Pelosi', slug: 'nancy-pelosi', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 1987, bio: 'U.S. Representative for California\'s 11th congressional district. Former Speaker of the House representing San Francisco, the most powerful woman in American political history.' },
  { name: 'Barbara Lee', slug: 'barbara-lee', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 1998, bio: 'U.S. Representative for California\'s 12th congressional district. Progressive leader representing Oakland, known for her sole vote against the 2001 AUMF.' },
  { name: 'John Duarte', slug: 'john-duarte', state: 'CA', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for California\'s 13th congressional district. Farmer and nurseryman representing the Central Valley, focused on agriculture and water rights.' },
  { name: 'Eric Swalwell', slug: 'eric-swalwell', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for California\'s 14th congressional district. Former 2020 presidential candidate representing the East Bay, focused on gun safety and technology.' },
  { name: 'Kevin Mullin', slug: 'kevin-mullin', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for California\'s 15th congressional district. Former state assemblymember representing San Mateo County and parts of San Francisco.' },
  { name: 'Sam Liccardo', slug: 'sam-liccardo', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for California\'s 16th congressional district. Former Mayor of San Jose focused on technology, housing, and public safety.' },
  { name: 'Ro Khanna', slug: 'ro-khanna', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for California\'s 17th congressional district. Progressive representing Silicon Valley, focused on technology policy, trade, and economic populism.' },
  { name: 'Zoe Lofgren', slug: 'zoe-lofgren', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 1995, bio: 'U.S. Representative for California\'s 18th congressional district. Senior member representing San Jose, expert on immigration and technology law.' },
  { name: 'Jimmy Panetta', slug: 'jimmy-panetta', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for California\'s 19th congressional district. Son of former Defense Secretary Leon Panetta, representing the Central Coast and Monterey Bay.' },
  { name: 'Jim Costa', slug: 'jim-costa', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2005, bio: 'U.S. Representative for California\'s 20th congressional district. Third-generation farmer representing the San Joaquin Valley, focused on agriculture and water.' },
  { name: 'Vince Fong', slug: 'vince-fong', state: 'CA', party: 'republican', title: 'U.S. Representative', since_year: 2024, bio: 'U.S. Representative for California\'s 21st congressional district. Former state assemblymember representing the southern Central Valley and Kern County.' },
  { name: 'David Valadao', slug: 'david-valadao', state: 'CA', party: 'republican', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for California\'s 22nd congressional district. Dairy farmer representing the Central Valley, one of the few Republicans to vote to impeach Trump in 2021.' },
  { name: 'Jay Obernolte', slug: 'jay-obernolte', state: 'CA', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for California\'s 23rd congressional district. Video game developer and former mayor representing the vast Inland Empire and desert regions.' },
  { name: 'Salud Carbajal', slug: 'salud-carbajal', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for California\'s 24th congressional district. Marine Corps veteran representing the Central Coast including Santa Barbara and San Luis Obispo.' },
  { name: 'Raul Ruiz', slug: 'raul-ruiz', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for California\'s 25th congressional district. Emergency medicine physician representing the Inland Empire and Coachella Valley.' },
  { name: 'Julia Brownley', slug: 'julia-brownley', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for California\'s 26th congressional district. Former state assemblymember representing Ventura County, focused on veterans and environment.' },
  { name: 'Mike Garcia', slug: 'mike-garcia', state: 'CA', party: 'republican', title: 'U.S. Representative', since_year: 2020, bio: 'U.S. Representative for California\'s 27th congressional district. Former Navy fighter pilot representing the Santa Clarita and Antelope Valleys.' },
  { name: 'Judy Chu', slug: 'judy-chu', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2009, bio: 'U.S. Representative for California\'s 28th congressional district. First Chinese American woman elected to Congress, representing the San Gabriel Valley.' },
  { name: 'Tony Cárdenas', slug: 'tony-cardenas', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for California\'s 29th congressional district. Former Los Angeles city councilmember representing the San Fernando Valley.' },
  { name: 'Adam Schiff', slug: 'adam-schiff', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2001, bio: 'U.S. Representative for California\'s 30th congressional district. Former Chair of the House Intelligence Committee, lead impeachment manager, representing the Los Angeles area.' },
  { name: 'Grace Napolitano', slug: 'grace-napolitano', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 1999, bio: 'U.S. Representative for California\'s 31st congressional district. Senior member representing eastern Los Angeles County, focused on water resources and mental health.' },
  { name: 'Brad Sherman', slug: 'brad-sherman', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 1997, bio: 'U.S. Representative for California\'s 32nd congressional district. CPA and former state Board of Equalization member representing the San Fernando Valley.' },
  { name: 'Pete Aguilar', slug: 'pete-aguilar', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for California\'s 33rd congressional district. Chair of the House Democratic Caucus representing the Inland Empire, former Mayor of Redlands.' },
  { name: 'Jimmy Gomez', slug: 'jimmy-gomez', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for California\'s 34th congressional district. Former state assemblymember representing downtown Los Angeles and surrounding communities.' },
  { name: 'Norma Torres', slug: 'norma-torres', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for California\'s 35th congressional district. Former 911 dispatcher and Pomona mayor representing the Inland Empire.' },
  { name: 'Ted Lieu', slug: 'ted-lieu', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for California\'s 36th congressional district. Air Force veteran and cybersecurity expert representing the Westside of Los Angeles and the South Bay.' },
  { name: 'Sydney Kamlager-Dove', slug: 'sydney-kamlager-dove', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for California\'s 37th congressional district. Former state senator representing South Los Angeles, Culver City, and Inglewood.' },
  { name: 'Linda Sánchez', slug: 'linda-sanchez', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2003, bio: 'U.S. Representative for California\'s 38th congressional district. Former Chair of the Congressional Hispanic Caucus representing southeastern Los Angeles County.' },
  { name: 'Mark Takano', slug: 'mark-takano', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for California\'s 39th congressional district. Former teacher and Ranking Member of the Veterans Affairs Committee representing Riverside.' },
  { name: 'Young Kim', slug: 'young-kim', state: 'CA', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for California\'s 40th congressional district. First Korean American Republican woman in Congress, representing northern Orange County.' },
  { name: 'Ken Calvert', slug: 'ken-calvert', state: 'CA', party: 'republican', title: 'U.S. Representative', since_year: 1993, bio: 'U.S. Representative for California\'s 41st congressional district. Senior appropriator representing the Inland Empire, chair of defense spending subcommittee.' },
  { name: 'Robert Garcia', slug: 'robert-garcia', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for California\'s 42nd congressional district. Former Mayor of Long Beach and first openly gay immigrant elected to Congress.' },
  { name: 'Maxine Waters', slug: 'maxine-waters', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 1991, bio: 'U.S. Representative for California\'s 43rd congressional district. Senior member and former Chair of the Financial Services Committee representing South Los Angeles.' },
  { name: 'Nanette Barragán', slug: 'nanette-barragan', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for California\'s 44th congressional district. Chair of the Congressional Hispanic Caucus representing parts of Los Angeles and the South Bay.' },
  { name: 'Michelle Steel', slug: 'michelle-steel', state: 'CA', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for California\'s 45th congressional district. Korean-born Republican representing coastal Orange County, focused on taxes and small business.' },
  { name: 'Lou Correa', slug: 'lou-correa', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for California\'s 46th congressional district. Former state senator representing central Orange County including Santa Ana and Anaheim.' },
  { name: 'Dave Min', slug: 'dave-min', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for California\'s 47th congressional district. Former state senator and law professor representing coastal Orange County including Irvine.' },
  { name: 'Darrell Issa', slug: 'darrell-issa', state: 'CA', party: 'republican', title: 'U.S. Representative', since_year: 2003, bio: 'U.S. Representative for California\'s 48th congressional district. Former Chair of the House Oversight Committee representing inland San Diego and Riverside counties.' },
  { name: 'Mike Levin', slug: 'mike-levin', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for California\'s 49th congressional district. Environmental attorney representing coastal North San Diego and South Orange counties.' },
  { name: 'Scott Peters', slug: 'scott-peters', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for California\'s 50th congressional district. Former San Diego city councilmember focused on innovation, clean energy, and fiscal responsibility.' },
  { name: 'Sara Jacobs', slug: 'sara-jacobs', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for California\'s 51st congressional district. Former UN policy advisor representing central San Diego, focused on foreign affairs and child welfare.' },
  { name: 'Juan Vargas', slug: 'juan-vargas', state: 'CA', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for California\'s 52nd congressional district. Former state senator representing the Imperial Valley and southern San Diego along the U.S.-Mexico border.' },

  // Colorado (8 districts)
  { name: 'Diana DeGette', slug: 'diana-degette', state: 'CO', party: 'democrat', title: 'U.S. Representative', since_year: 1997, bio: 'U.S. Representative for Colorado\'s 1st congressional district. Senior member representing Denver, focused on healthcare and energy policy.' },
  { name: 'Joe Neguse', slug: 'joe-neguse', state: 'CO', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Colorado\'s 2nd congressional district. First Eritrean American elected to Congress, representing Boulder and the northern Front Range.' },
  { name: 'Jeff Crank', slug: 'jeff-crank', state: 'CO', party: 'republican', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for Colorado\'s 3rd congressional district. Conservative radio host representing the Western Slope and southern Colorado.' },
  { name: 'Lauren Boebert', slug: 'lauren-boebert', state: 'CO', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Colorado\'s 4th congressional district. Outspoken conservative and gun rights advocate representing the Eastern Plains and northern suburbs.' },
  { name: 'Jason Crow', slug: 'jason-crow', state: 'CO', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Colorado\'s 5th congressional district. Army Ranger veteran representing the Aurora and Denver suburbs.' },
  { name: 'Brittany Pettersen', slug: 'brittany-pettersen', state: 'CO', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Colorado\'s 6th congressional district. Former state senator representing the Denver suburbs and mountain communities.' },
  { name: 'Yadira Caraveo', slug: 'yadira-caraveo', state: 'CO', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Colorado\'s 7th congressional district. Pediatrician and first Latina to represent Colorado in Congress.' },
  { name: 'Gabe Evans', slug: 'gabe-evans', state: 'CO', party: 'republican', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for Colorado\'s 8th congressional district. Army helicopter pilot veteran and former state legislator representing the northern Denver suburbs.' },

  // Hawaii (2 districts)
  { name: 'Ed Case', slug: 'ed-case', state: 'HI', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Hawaii\'s 1st congressional district. Former state legislator representing urban Honolulu, focused on Asia-Pacific relations and native Hawaiian issues.' },
  { name: 'Jill Tokuda', slug: 'jill-tokuda', state: 'HI', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Hawaii\'s 2nd congressional district. Former state senator representing rural Hawaii including the neighbor islands.' },

  // Idaho (2 districts)
  { name: 'Russ Fulcher', slug: 'russ-fulcher', state: 'ID', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Idaho\'s 1st congressional district. Former state senator representing western Idaho including Boise, focused on natural resources and fiscal conservatism.' },
  { name: 'Mike Simpson', slug: 'mike-simpson', state: 'ID', party: 'republican', title: 'U.S. Representative', since_year: 1999, bio: 'U.S. Representative for Idaho\'s 2nd congressional district. Senior appropriator representing eastern Idaho, focused on nuclear energy and public lands.' },

  // Montana (2 districts)
  { name: 'Ryan Zinke', slug: 'ryan-zinke', state: 'MT', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Montana\'s 1st congressional district. Former Secretary of the Interior and Navy SEAL representing western Montana.' },
  { name: 'Troy Downing', slug: 'troy-downing', state: 'MT', party: 'republican', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for Montana\'s 2nd congressional district. Former state auditor and Air Force veteran representing eastern Montana.' },

  // Nevada (4 districts)
  { name: 'Dina Titus', slug: 'dina-titus', state: 'NV', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Nevada\'s 1st congressional district. Former political science professor representing the Las Vegas Strip and downtown area.' },
  { name: 'Mark Amodei', slug: 'mark-amodei', state: 'NV', party: 'republican', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Nevada\'s 2nd congressional district. Former state senator representing northern Nevada including Reno and rural areas.' },
  { name: 'Susie Lee', slug: 'susie-lee', state: 'NV', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Nevada\'s 3rd congressional district. Nonprofit leader representing the Las Vegas suburbs of Henderson and Summerlin.' },
  { name: 'Steven Horsford', slug: 'steven-horsford', state: 'NV', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Nevada\'s 4th congressional district. Chair of the Congressional Black Caucus representing North Las Vegas and rural Nevada.' },

  // New Mexico (3 districts)
  { name: 'Melanie Stansbury', slug: 'melanie-stansbury', state: 'NM', party: 'democrat', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for New Mexico\'s 1st congressional district. Former state legislator and environmental policy expert representing Albuquerque.' },
  { name: 'Gabe Vasquez', slug: 'gabe-vasquez', state: 'NM', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for New Mexico\'s 2nd congressional district. Former Las Cruces city councilor representing southern New Mexico and the border region.' },
  { name: 'Teresa Leger Fernandez', slug: 'teresa-leger-fernandez', state: 'NM', party: 'democrat', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for New Mexico\'s 3rd congressional district. Attorney and community advocate representing northern New Mexico including Santa Fe and Taos.' },

  // Oregon (6 districts)
  { name: 'Suzanne Bonamici', slug: 'suzanne-bonamici', state: 'OR', party: 'democrat', title: 'U.S. Representative', since_year: 2012, bio: 'U.S. Representative for Oregon\'s 1st congressional district. Former consumer protection attorney representing the Portland suburbs and the Oregon coast.' },
  { name: 'Cliff Bentz', slug: 'cliff-bentz', state: 'OR', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Oregon\'s 2nd congressional district. Attorney and rancher representing the vast rural eastern and southern Oregon.' },
  { name: 'Maxine Dexter', slug: 'maxine-dexter', state: 'OR', party: 'democrat', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for Oregon\'s 3rd congressional district. Physician and former state legislator representing Portland.' },
  { name: 'Val Hoyle', slug: 'val-hoyle', state: 'OR', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Oregon\'s 4th congressional district. Former Oregon Labor Commissioner representing Eugene and the southern Oregon coast.' },
  { name: 'Janelle Bynum', slug: 'janelle-bynum', state: 'OR', party: 'democrat', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for Oregon\'s 5th congressional district. Former state legislator and business owner representing the Portland suburbs and Salem.' },
  { name: 'Andrea Salinas', slug: 'andrea-salinas', state: 'OR', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Oregon\'s 6th congressional district. Former state legislator representing the Portland suburbs and the mid-Willamette Valley.' },

  // Utah (4 districts)
  { name: 'Blake Moore', slug: 'blake-moore', state: 'UT', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Utah\'s 1st congressional district. Former diplomat representing northern Utah including Ogden and Logan.' },
  { name: 'Celeste Maloy', slug: 'celeste-maloy', state: 'UT', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Utah\'s 2nd congressional district. Attorney and former congressional staffer representing rural southern and western Utah.' },
  { name: 'John Curtis', slug: 'john-curtis', state: 'UT', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Utah\'s 3rd congressional district. Former Mayor of Provo focused on conservative climate solutions and technology.' },
  { name: 'Burgess Owens', slug: 'burgess-owens', state: 'UT', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Utah\'s 4th congressional district. Former NFL player representing the Salt Lake City suburbs, focused on education and immigration.' },

  // Washington (10 districts)
  { name: 'Suzan DelBene', slug: 'suzan-delbene', state: 'WA', party: 'democrat', title: 'U.S. Representative', since_year: 2012, bio: 'U.S. Representative for Washington\'s 1st congressional district. Former tech executive and DCCC Chair representing the Seattle suburbs and rural areas.' },
  { name: 'Rick Larsen', slug: 'rick-larsen', state: 'WA', party: 'democrat', title: 'U.S. Representative', since_year: 2001, bio: 'U.S. Representative for Washington\'s 2nd congressional district. Senior member representing the San Juan Islands and northwest Washington, focused on transportation and trade.' },
  { name: 'Marie Gluesenkamp Perez', slug: 'marie-gluesenkamp-perez', state: 'WA', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Washington\'s 3rd congressional district. Auto shop owner representing rural southwest Washington, known for bipartisan approach.' },
  { name: 'Dan Newhouse', slug: 'dan-newhouse', state: 'WA', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Washington\'s 4th congressional district. Farmer representing central Washington, one of few Republicans to vote to impeach Trump in 2021.' },
  { name: 'Cathy McMorris Rodgers', slug: 'cathy-mcmorris-rodgers', state: 'WA', party: 'republican', title: 'U.S. Representative', since_year: 2005, bio: 'U.S. Representative for Washington\'s 5th congressional district. Former Chair of the Energy and Commerce Committee representing eastern Washington and Spokane.' },
  { name: 'Emily Randall', slug: 'emily-randall', state: 'WA', party: 'democrat', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for Washington\'s 6th congressional district. Former state senator representing the Olympic Peninsula and Tacoma suburbs.' },
  { name: 'Pramila Jayapal', slug: 'pramila-jayapal', state: 'WA', party: 'democrat', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Washington\'s 7th congressional district. Chair of the Congressional Progressive Caucus representing Seattle.' },
  { name: 'Kim Schrier', slug: 'kim-schrier', state: 'WA', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Washington\'s 8th congressional district. Pediatrician representing the Cascade foothills and eastern Seattle suburbs.' },
  { name: 'Adam Smith', slug: 'adam-smith-wa', state: 'WA', party: 'democrat', title: 'U.S. Representative', since_year: 1997, bio: 'U.S. Representative for Washington\'s 9th congressional district. Ranking Member of the Armed Services Committee representing the Tacoma and south Seattle areas.' },
  { name: 'Marilyn Strickland', slug: 'marilyn-strickland', state: 'WA', party: 'democrat', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Washington\'s 10th congressional district. Former Mayor of Tacoma and first African American and Korean American member of Congress from Washington.' },

  // Wyoming (1 at-large)
  { name: 'Harriet Hageman', slug: 'harriet-hageman', state: 'WY', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Wyoming\'s at-large congressional district. Attorney and rancher who defeated Liz Cheney in the 2022 Republican primary.' },
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
  console.log('\nNo new members to insert.')
  process.exit(0)
}

console.log(`\nInserting ${toInsert.length} western state House members...`)

// Insert in batches of 50
const BATCH = 50
let allInserted = []
for (let i = 0; i < toInsert.length; i += BATCH) {
  const batch = toInsert.slice(i, i + BATCH).map(m => ({
    ...m,
    chamber: 'house',
  }))
  const { data: inserted, error } = await supabase.from('politicians').insert(batch).select('id, name, slug, party')
  if (error) {
    console.error(`Error inserting batch ${i / BATCH + 1}:`, error.message)
    process.exit(1)
  }
  allInserted = allInserted.concat(inserted)
  console.log(`  Batch ${Math.floor(i / BATCH) + 1}: inserted ${inserted.length} members`)
}

console.log(`\nInserted ${allInserted.length} members total`)

// Now generate stances for newly inserted members
console.log('\nGenerating stances...')

const { data: issues } = await supabase.from('issues').select('id, slug')

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

// Intensity variations for deterministic adjustment
const INTENSITY_UP = {
  'supports': 'strongly_supports',
  'opposes': 'strongly_opposes',
  'leans_support': 'supports',
  'leans_oppose': 'opposes',
  'strongly_supports': 'strongly_supports',
  'strongly_opposes': 'strongly_opposes',
  'mixed': 'leans_support',
  'neutral': 'leans_support',
}

const INTENSITY_DOWN = {
  'supports': 'leans_support',
  'opposes': 'leans_oppose',
  'strongly_supports': 'supports',
  'strongly_opposes': 'opposes',
  'leans_support': 'neutral',
  'leans_oppose': 'neutral',
  'mixed': 'leans_oppose',
  'neutral': 'neutral',
}

const stanceRows = []
for (const pol of allInserted) {
  const member = MEMBERS.find(m => m.slug === pol.slug)
  const partyDefaults = PARTY_DEFAULTS[member.party] || PARTY_DEFAULTS.democrat

  for (const issue of issues) {
    const baseStance = partyDefaults[issue.slug]
    if (!baseStance) continue

    // Deterministic hash-based variation
    const hash = (pol.slug + issue.slug).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100

    let stance = baseStance
    if (hash < 10) {
      stance = INTENSITY_UP[baseStance] || baseStance
    } else if (hash >= 10 && hash < 22) {
      stance = INTENSITY_DOWN[baseStance] || baseStance
    } else if (hash >= 90 && hash < 95) {
      stance = 'mixed'
    } else if (hash >= 95) {
      stance = 'neutral'
    }

    stanceRows.push({
      politician_id: pol.id,
      issue_id: issue.id,
      stance,
    })
  }
}

console.log(`Generated ${stanceRows.length} stances, inserting...`)

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

console.log(`Inserted ${stanceCount} stances for western state House members`)

// Final count
const { count: total } = await supabase.from('politicians').select('*', { count: 'exact', head: true })
const { data: chambers } = await supabase.from('politicians').select('chamber')
const breakdown = {}
chambers.forEach(p => { breakdown[p.chamber] = (breakdown[p.chamber] || 0) + 1 })
console.log(`\nTotal politicians: ${total}`)
console.log('Chamber breakdown:', breakdown)
