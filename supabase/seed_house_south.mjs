import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}
const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// ============================================================
// Southern U.S. House Representatives — 119th Congress (2025-2026)
// States: AL(7), AR(4), FL(28), GA(14), KY(6), LA(6), MS(4),
//         NC(14), OK(5), SC(7), TN(9), TX(38), VA(11), WV(2)
// ============================================================

const MEMBERS = [
  // === ALABAMA (7 districts) ===
  { name: 'Jerry Carl', slug: 'jerry-carl', state: 'AL', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Alabama\'s 1st congressional district. Businessman and former Mobile County Commissioner focused on economic development and military support.' },
  { name: 'Barry Moore', slug: 'barry-moore', state: 'AL', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Alabama\'s 2nd congressional district. Former state legislator and Army veteran focused on agriculture and veterans\' issues.' },
  { name: 'Mike Rogers', slug: 'mike-rogers-al', state: 'AL', party: 'republican', title: 'U.S. Representative', since_year: 2003, bio: 'U.S. Representative for Alabama\'s 3rd congressional district. Chair of the House Armed Services Committee and a senior member of Congress.' },
  { name: 'Robert Aderholt', slug: 'robert-aderholt', state: 'AL', party: 'republican', title: 'U.S. Representative', since_year: 1997, bio: 'U.S. Representative for Alabama\'s 4th congressional district. Senior appropriator focused on defense, rural broadband, and agriculture.' },
  { name: 'Dale Strong', slug: 'dale-strong', state: 'AL', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Alabama\'s 5th congressional district. Former Madison County Commission chairman representing the Huntsville area and Redstone Arsenal.' },
  { name: 'Gary Palmer', slug: 'gary-palmer', state: 'AL', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Alabama\'s 6th congressional district. Chair of the House Republican Policy Committee and former think tank president.' },
  { name: 'Terri Sewell', slug: 'terri-sewell', state: 'AL', party: 'democrat', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Alabama\'s 7th congressional district. The first Black woman elected to Congress from Alabama, focused on voting rights and economic equity.' },

  // === ARKANSAS (4 districts) ===
  { name: 'Rick Crawford', slug: 'rick-crawford', state: 'AR', party: 'republican', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Arkansas\'s 1st congressional district. Army veteran and former rodeo announcer focused on agriculture and military affairs.' },
  { name: 'French Hill', slug: 'french-hill', state: 'AR', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Arkansas\'s 2nd congressional district. Chair of the House Financial Services Committee and former banker.' },
  { name: 'Steve Womack', slug: 'steve-womack', state: 'AR', party: 'republican', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Arkansas\'s 3rd congressional district. Senior appropriator and retired Army National Guard colonel.' },
  { name: 'Bruce Westerman', slug: 'bruce-westerman', state: 'AR', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Arkansas\'s 4th congressional district. Chair of the House Natural Resources Committee and a licensed engineer.' },

  // === FLORIDA (28 districts) ===
  { name: 'Matt Gaetz', slug: 'matt-gaetz', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Florida\'s 1st congressional district. Outspoken conservative known for his close alliance with former President Trump.' },
  { name: 'Neal Dunn', slug: 'neal-dunn', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Florida\'s 2nd congressional district. Retired Army surgeon focused on veterans\' healthcare and rural issues.' },
  { name: 'Kat Cammack', slug: 'kat-cammack', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Florida\'s 3rd congressional district. One of the youngest Republican women in Congress, focused on agriculture and homeland security.' },
  { name: 'Aaron Bean', slug: 'aaron-bean', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Florida\'s 4th congressional district. Former state senator from the Jacksonville area focused on education and small business.' },
  { name: 'John Rutherford', slug: 'john-rutherford', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Florida\'s 5th congressional district. Former Jacksonville sheriff focused on law enforcement and public safety.' },
  { name: 'Michael Waltz', slug: 'michael-waltz', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Florida\'s 6th congressional district. Green Beret combat veteran and expert on national security and China policy.' },
  { name: 'Cory Mills', slug: 'cory-mills', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Florida\'s 7th congressional district. Army combat veteran and defense industry executive.' },
  { name: 'Daniel Webster', slug: 'daniel-webster', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Florida\'s 8th congressional district. Former Florida Senate president and longtime conservative legislator.' },
  { name: 'Darren Soto', slug: 'darren-soto', state: 'FL', party: 'democrat', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Florida\'s 9th congressional district. The first Puerto Rican member of Congress from Florida, focused on energy and technology.' },
  { name: 'Maxwell Frost', slug: 'maxwell-frost', state: 'FL', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Florida\'s 10th congressional district. The first Gen Z member of Congress, focused on gun violence prevention and climate change.' },
  { name: 'Gus Bilirakis', slug: 'gus-bilirakis', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2007, bio: 'U.S. Representative for Florida\'s 12th congressional district. Senior member focused on veterans affairs and energy policy.' },
  { name: 'Anna Paulina Luna', slug: 'anna-paulina-luna', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Florida\'s 13th congressional district. Air Force veteran and one of the first Mexican-American Republican women in Congress.' },
  { name: 'Kathy Castor', slug: 'kathy-castor', state: 'FL', party: 'democrat', title: 'U.S. Representative', since_year: 2007, bio: 'U.S. Representative for Florida\'s 14th congressional district. Senior Democrat focused on climate change, energy, and healthcare.' },
  { name: 'Laurel Lee', slug: 'laurel-lee', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Florida\'s 15th congressional district. Former Florida Secretary of State and federal judge.' },
  { name: 'Vern Buchanan', slug: 'vern-buchanan', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2007, bio: 'U.S. Representative for Florida\'s 16th congressional district. Senior member of the Ways and Means Committee focused on tax policy and trade.' },
  { name: 'Greg Steube', slug: 'greg-steube', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Florida\'s 17th congressional district. Army veteran and former state legislator focused on Second Amendment rights.' },
  { name: 'Scott Franklin', slug: 'scott-franklin', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Florida\'s 18th congressional district. Navy veteran and businessman from the Lakeland area.' },
  { name: 'Byron Donalds', slug: 'byron-donalds', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Florida\'s 19th congressional district. Conservative rising star and former state representative focused on fiscal policy.' },
  { name: 'Sheila Cherfilus-McCormick', slug: 'sheila-cherfilus-mccormick', state: 'FL', party: 'democrat', title: 'U.S. Representative', since_year: 2022, bio: 'U.S. Representative for Florida\'s 20th congressional district. Healthcare executive and the first Haitian American Democrat in Congress.' },
  { name: 'Frederica Wilson', slug: 'frederica-wilson', state: 'FL', party: 'democrat', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Florida\'s 24th congressional district. Former educator and state legislator known for her focus on education and children\'s issues.' },
  { name: 'Debbie Wasserman Schultz', slug: 'debbie-wasserman-schultz', state: 'FL', party: 'democrat', title: 'U.S. Representative', since_year: 2005, bio: 'U.S. Representative for Florida\'s 25th congressional district. Former DNC chair and senior appropriator focused on healthcare and education.' },
  { name: 'Mario Diaz-Balart', slug: 'mario-diaz-balart', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2003, bio: 'U.S. Representative for Florida\'s 26th congressional district. Senior appropriator and dean of Florida\'s congressional delegation focused on Cuba policy.' },
  { name: 'Maria Elvira Salazar', slug: 'maria-elvira-salazar', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Florida\'s 27th congressional district. Former journalist focused on immigration reform and support for the Cuban and Venezuelan communities.' },
  { name: 'Carlos Gimenez', slug: 'carlos-gimenez', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Florida\'s 28th congressional district. Former Miami-Dade County mayor and fire chief focused on homeland security.' },
  { name: 'Daniel Davis', slug: 'daniel-davis-fl', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for Florida\'s 11th congressional district. Conservative Republican representing central Florida.' },
  { name: 'Jared Moskowitz', slug: 'jared-moskowitz', state: 'FL', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Florida\'s 23rd congressional district. Former Florida emergency management director focused on disaster preparedness.' },
  { name: 'Lois Frankel', slug: 'lois-frankel', state: 'FL', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Florida\'s 22nd congressional district. Former West Palm Beach mayor focused on women\'s issues and foreign affairs.' },
  { name: 'Randy Fine', slug: 'randy-fine', state: 'FL', party: 'republican', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for Florida\'s 21st congressional district. Former state representative from Brevard County.' },

  // === GEORGIA (14 districts) ===
  { name: 'Buddy Carter', slug: 'buddy-carter', state: 'GA', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Georgia\'s 1st congressional district. Pharmacist and former state legislator focused on healthcare and energy.' },
  { name: 'Sanford Bishop', slug: 'sanford-bishop', state: 'GA', party: 'democrat', title: 'U.S. Representative', since_year: 1993, bio: 'U.S. Representative for Georgia\'s 2nd congressional district. Senior appropriator and dean of Georgia\'s delegation focused on agriculture and defense.' },
  { name: 'Drew Ferguson', slug: 'drew-ferguson', state: 'GA', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Georgia\'s 3rd congressional district. Dentist and former mayor focused on tax policy as a Ways and Means member.' },
  { name: 'Hank Johnson', slug: 'hank-johnson', state: 'GA', party: 'democrat', title: 'U.S. Representative', since_year: 2007, bio: 'U.S. Representative for Georgia\'s 4th congressional district. Senior member of the Judiciary Committee focused on civil rights and judicial reform.' },
  { name: 'Nikema Williams', slug: 'nikema-williams', state: 'GA', party: 'democrat', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Georgia\'s 5th congressional district. Successor to John Lewis and former state senator focused on voting rights.' },
  { name: 'Rich McCormick', slug: 'rich-mccormick', state: 'GA', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Georgia\'s 6th congressional district. Emergency medicine physician and Marine veteran.' },
  { name: 'Lucy McBath', slug: 'lucy-mcbath', state: 'GA', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Georgia\'s 7th congressional district. Gun violence prevention advocate who became politically active after the murder of her son.' },
  { name: 'Austin Scott', slug: 'austin-scott', state: 'GA', party: 'republican', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Georgia\'s 8th congressional district. Senior member of the Armed Services and Agriculture committees.' },
  { name: 'Andrew Clyde', slug: 'andrew-clyde', state: 'GA', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Georgia\'s 9th congressional district. Navy veteran and gun store owner focused on Second Amendment rights and fiscal conservatism.' },
  { name: 'Mike Collins', slug: 'mike-collins-ga', state: 'GA', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Georgia\'s 10th congressional district. Trucking company owner and former state senator.' },
  { name: 'Barry Loudermilk', slug: 'barry-loudermilk', state: 'GA', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Georgia\'s 11th congressional district. Air Force veteran and chair of the House Administration Committee.' },
  { name: 'Rick Allen', slug: 'rick-allen', state: 'GA', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Georgia\'s 12th congressional district. Construction company owner focused on agriculture and education.' },
  { name: 'David Scott', slug: 'david-scott', state: 'GA', party: 'democrat', title: 'U.S. Representative', since_year: 2003, bio: 'U.S. Representative for Georgia\'s 13th congressional district. Ranking member of the Agriculture Committee and veteran lawmaker.' },
  { name: 'Marjorie Taylor Greene', slug: 'marjorie-taylor-greene', state: 'GA', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Georgia\'s 14th congressional district. Outspoken conservative and businesswoman from northwest Georgia.' },

  // === KENTUCKY (6 districts) ===
  { name: 'James Comer', slug: 'james-comer', state: 'KY', party: 'republican', title: 'U.S. Representative', since_year: 2016, bio: 'U.S. Representative for Kentucky\'s 1st congressional district. Chair of the House Oversight Committee and former state Agriculture Commissioner.' },
  { name: 'Brett Guthrie', slug: 'brett-guthrie', state: 'KY', party: 'republican', title: 'U.S. Representative', since_year: 2009, bio: 'U.S. Representative for Kentucky\'s 2nd congressional district. Chair of the House Energy and Commerce Committee and Army veteran.' },
  { name: 'Morgan McGarvey', slug: 'morgan-mcgarvey', state: 'KY', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Kentucky\'s 3rd congressional district. Former Kentucky Senate minority leader representing Louisville.' },
  { name: 'Thomas Massie', slug: 'thomas-massie', state: 'KY', party: 'republican', title: 'U.S. Representative', since_year: 2012, bio: 'U.S. Representative for Kentucky\'s 4th congressional district. MIT-educated engineer and libertarian-leaning Republican known for his independent votes.' },
  { name: 'Hal Rogers', slug: 'hal-rogers', state: 'KY', party: 'republican', title: 'U.S. Representative', since_year: 1981, bio: 'U.S. Representative for Kentucky\'s 5th congressional district. Dean of the House and former Appropriations chair, longest-serving Kentucky congressman.' },
  { name: 'Andy Barr', slug: 'andy-barr', state: 'KY', party: 'republican', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Kentucky\'s 6th congressional district. Senior Financial Services member focused on capital markets and horse industry.' },

  // === LOUISIANA (6 districts) ===
  { name: 'Steve Scalise', slug: 'steve-scalise', state: 'LA', party: 'republican', title: 'U.S. Representative', since_year: 2008, bio: 'U.S. Representative for Louisiana\'s 1st congressional district. House Majority Leader and senior Republican leader who survived a 2017 shooting.' },
  { name: 'Troy Carter', slug: 'troy-carter', state: 'LA', party: 'democrat', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Louisiana\'s 2nd congressional district. Former state senator representing New Orleans focused on infrastructure and criminal justice.' },
  { name: 'Clay Higgins', slug: 'clay-higgins', state: 'LA', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Louisiana\'s 3rd congressional district. Former law enforcement officer known for his tough-on-crime stance and border security advocacy.' },
  { name: 'Mike Johnson', slug: 'mike-johnson', state: 'LA', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Louisiana\'s 4th congressional district. Speaker of the House and constitutional lawyer focused on religious liberty.' },
  { name: 'Julia Letlow', slug: 'julia-letlow', state: 'LA', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Louisiana\'s 5th congressional district. Former university administrator focused on education, agriculture, and rural broadband.' },
  { name: 'Garret Graves', slug: 'garret-graves', state: 'LA', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Louisiana\'s 6th congressional district. Expert on coastal restoration and flood protection focused on infrastructure.' },

  // === MISSISSIPPI (4 districts) ===
  { name: 'Trent Kelly', slug: 'trent-kelly', state: 'MS', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Mississippi\'s 1st congressional district. Army National Guard general and attorney focused on military affairs.' },
  { name: 'Bennie Thompson', slug: 'bennie-thompson', state: 'MS', party: 'democrat', title: 'U.S. Representative', since_year: 1993, bio: 'U.S. Representative for Mississippi\'s 2nd congressional district. Former chair of the Homeland Security Committee and the January 6th Committee.' },
  { name: 'Michael Guest', slug: 'michael-guest', state: 'MS', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Mississippi\'s 3rd congressional district. Former district attorney focused on law enforcement and ethics.' },
  { name: 'Mike Ezell', slug: 'mike-ezell', state: 'MS', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Mississippi\'s 4th congressional district. Former Jackson County sheriff focused on border security and law enforcement.' },

  // === NORTH CAROLINA (14 districts) ===
  { name: 'Don Davis', slug: 'don-davis', state: 'NC', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for North Carolina\'s 1st congressional district. Former state senator and Air Force veteran focused on agriculture and veterans.' },
  { name: 'Deborah Ross', slug: 'deborah-ross', state: 'NC', party: 'democrat', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for North Carolina\'s 2nd congressional district. Former state legislator and ACLU director focused on civil liberties and technology.' },
  { name: 'Greg Murphy', slug: 'greg-murphy', state: 'NC', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for North Carolina\'s 3rd congressional district. Surgeon and former state legislator focused on healthcare policy.' },
  { name: 'Valerie Foushee', slug: 'valerie-foushee', state: 'NC', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for North Carolina\'s 4th congressional district. Former state senator from Chapel Hill focused on education and healthcare.' },
  { name: 'Virginia Foxx', slug: 'virginia-foxx', state: 'NC', party: 'republican', title: 'U.S. Representative', since_year: 2005, bio: 'U.S. Representative for North Carolina\'s 5th congressional district. Chair of the Education and Workforce Committee and former university president.' },
  { name: 'Kathy Manning', slug: 'kathy-manning', state: 'NC', party: 'democrat', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for North Carolina\'s 6th congressional district. Immigration attorney and community leader from Greensboro.' },
  { name: 'David Rouzer', slug: 'david-rouzer', state: 'NC', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for North Carolina\'s 7th congressional district. Former state senator focused on agriculture and transportation.' },
  { name: 'Dan Bishop', slug: 'dan-bishop', state: 'NC', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for North Carolina\'s 8th congressional district. Attorney and former state senator focused on homeland security.' },
  { name: 'Richard Hudson', slug: 'richard-hudson', state: 'NC', party: 'republican', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for North Carolina\'s 9th congressional district. Chair of the NRCC and senior Energy and Commerce member.' },
  { name: 'Patrick McHenry', slug: 'patrick-mchenry', state: 'NC', party: 'republican', title: 'U.S. Representative', since_year: 2005, bio: 'U.S. Representative for North Carolina\'s 10th congressional district. Former Financial Services chair and senior Republican figure.' },
  { name: 'Chuck Edwards', slug: 'chuck-edwards', state: 'NC', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for North Carolina\'s 11th congressional district. Former state senator and McDonald\'s franchise owner from western North Carolina.' },
  { name: 'Alma Adams', slug: 'alma-adams', state: 'NC', party: 'democrat', title: 'U.S. Representative', since_year: 2014, bio: 'U.S. Representative for North Carolina\'s 12th congressional district. Former professor and state legislator focused on education and HBCUs.' },
  { name: 'Jeff Jackson', slug: 'jeff-jackson', state: 'NC', party: 'democrat', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for North Carolina\'s 13th congressional district. Former state senator and Army veteran known for his social media engagement.' },
  { name: 'Tim Moore', slug: 'tim-moore-nc', state: 'NC', party: 'republican', title: 'U.S. Representative', since_year: 2025, bio: 'U.S. Representative for North Carolina\'s 14th congressional district. Former Speaker of the North Carolina House of Representatives.' },

  // === OKLAHOMA (5 districts) ===
  { name: 'Kevin Hern', slug: 'kevin-hern', state: 'OK', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Oklahoma\'s 1st congressional district. Chair of the Republican Study Committee and McDonald\'s franchise owner.' },
  { name: 'Josh Brecheen', slug: 'josh-brecheen', state: 'OK', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Oklahoma\'s 2nd congressional district. Former state senator and rancher focused on energy and agriculture.' },
  { name: 'Frank Lucas', slug: 'frank-lucas', state: 'OK', party: 'republican', title: 'U.S. Representative', since_year: 1994, bio: 'U.S. Representative for Oklahoma\'s 3rd congressional district. Former Agriculture Committee chair and dean of the Oklahoma delegation.' },
  { name: 'Tom Cole', slug: 'tom-cole', state: 'OK', party: 'republican', title: 'U.S. Representative', since_year: 2003, bio: 'U.S. Representative for Oklahoma\'s 4th congressional district. Chair of the House Appropriations Committee and member of the Chickasaw Nation.' },
  { name: 'Stephanie Bice', slug: 'stephanie-bice', state: 'OK', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Oklahoma\'s 5th congressional district. Former state senator focused on technology, science, and government modernization.' },

  // === SOUTH CAROLINA (7 districts) ===
  { name: 'Nancy Mace', slug: 'nancy-mace', state: 'SC', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for South Carolina\'s 1st congressional district. The first woman to graduate from The Citadel and former state legislator.' },
  { name: 'Joe Wilson', slug: 'joe-wilson', state: 'SC', party: 'republican', title: 'U.S. Representative', since_year: 2001, bio: 'U.S. Representative for South Carolina\'s 2nd congressional district. Senior Armed Services member and Army Reserve veteran.' },
  { name: 'Jeff Duncan', slug: 'jeff-duncan', state: 'SC', party: 'republican', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for South Carolina\'s 3rd congressional district. Senior member focused on energy policy and Second Amendment rights.' },
  { name: 'William Timmons', slug: 'william-timmons', state: 'SC', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for South Carolina\'s 4th congressional district. Attorney and former state senator representing the Greenville-Spartanburg area.' },
  { name: 'Ralph Norman', slug: 'ralph-norman', state: 'SC', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for South Carolina\'s 5th congressional district. Real estate developer and Freedom Caucus member focused on fiscal conservatism.' },
  { name: 'Jim Clyburn', slug: 'jim-clyburn', state: 'SC', party: 'democrat', title: 'U.S. Representative', since_year: 1993, bio: 'U.S. Representative for South Carolina\'s 6th congressional district. Former House Majority Whip and highest-ranking Black member of Congress.' },
  { name: 'Russell Fry', slug: 'russell-fry', state: 'SC', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for South Carolina\'s 7th congressional district. Former state representative from the Myrtle Beach area.' },

  // === TENNESSEE (9 districts) ===
  { name: 'Diana Harshbarger', slug: 'diana-harshbarger', state: 'TN', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Tennessee\'s 1st congressional district. Pharmacist and businesswoman from northeast Tennessee focused on healthcare and veterans.' },
  { name: 'Tim Burchett', slug: 'tim-burchett', state: 'TN', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Tennessee\'s 2nd congressional district. Former Knox County mayor known for government transparency and UFO disclosure advocacy.' },
  { name: 'Chuck Fleischmann', slug: 'chuck-fleischmann', state: 'TN', party: 'republican', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Tennessee\'s 3rd congressional district. Senior appropriator focused on energy, nuclear technology, and Oak Ridge National Laboratory.' },
  { name: 'Scott DesJarlais', slug: 'scott-desjarlais', state: 'TN', party: 'republican', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Tennessee\'s 4th congressional district. Physician focused on healthcare policy, agriculture, and conservative values.' },
  { name: 'Andy Ogles', slug: 'andy-ogles', state: 'TN', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Tennessee\'s 5th congressional district. Former Maury County mayor representing parts of Nashville and surrounding areas.' },
  { name: 'John Rose', slug: 'john-rose', state: 'TN', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Tennessee\'s 6th congressional district. Farmer and former state agriculture commissioner focused on rural issues.' },
  { name: 'Mark Green', slug: 'mark-green', state: 'TN', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Tennessee\'s 7th congressional district. Chair of the Homeland Security Committee and Army Special Operations veteran.' },
  { name: 'David Kustoff', slug: 'david-kustoff', state: 'TN', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Tennessee\'s 8th congressional district. Former U.S. Attorney focused on financial services and law enforcement.' },
  { name: 'Steve Cohen', slug: 'steve-cohen', state: 'TN', party: 'democrat', title: 'U.S. Representative', since_year: 2007, bio: 'U.S. Representative for Tennessee\'s 9th congressional district. Senior Judiciary member representing Memphis focused on criminal justice reform.' },

  // === TEXAS (38 districts) ===
  { name: 'Nathaniel Moran', slug: 'nathaniel-moran', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Texas\'s 1st congressional district. Former Smith County judge from east Texas.' },
  { name: 'Dan Crenshaw', slug: 'dan-crenshaw', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Texas\'s 2nd congressional district. Former Navy SEAL who lost an eye in Afghanistan, focused on energy and national security.' },
  { name: 'Keith Self', slug: 'keith-self', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Texas\'s 3rd congressional district. Former Collin County judge and Army veteran.' },
  { name: 'Pat Fallon', slug: 'pat-fallon', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Texas\'s 4th congressional district. Former state senator and businessman focused on border security and military affairs.' },
  { name: 'Lance Gooden', slug: 'lance-gooden', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Texas\'s 5th congressional district. Former state representative focused on financial services and foreign affairs.' },
  { name: 'Jake Ellzey', slug: 'jake-ellzey', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Texas\'s 6th congressional district. Navy fighter pilot veteran focused on veterans affairs and defense.' },
  { name: 'Lizzie Fletcher', slug: 'lizzie-fletcher', state: 'TX', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Texas\'s 7th congressional district. Attorney focused on energy, healthcare, and flood mitigation in the Houston area.' },
  { name: 'Morgan Luttrell', slug: 'morgan-luttrell', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Texas\'s 8th congressional district. Former Navy SEAL and twin brother of Marcus Luttrell, focused on veterans and energy.' },
  { name: 'Al Green', slug: 'al-green', state: 'TX', party: 'democrat', title: 'U.S. Representative', since_year: 2005, bio: 'U.S. Representative for Texas\'s 9th congressional district. Senior Financial Services member focused on fair housing and civil rights.' },
  { name: 'Michael McCaul', slug: 'michael-mccaul', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2005, bio: 'U.S. Representative for Texas\'s 10th congressional district. Chair of the House Foreign Affairs Committee and former federal prosecutor.' },
  { name: 'August Pfluger', slug: 'august-pfluger', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Texas\'s 11th congressional district. Air Force fighter pilot focused on energy, agriculture, and military affairs in west Texas.' },
  { name: 'Kay Granger', slug: 'kay-granger', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 1997, bio: 'U.S. Representative for Texas\'s 12th congressional district. Former Appropriations chair and the first Republican woman to represent Texas in Congress.' },
  { name: 'Ronny Jackson', slug: 'ronny-jackson', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Texas\'s 13th congressional district. Former White House physician to Presidents Obama and Trump, retired Navy admiral.' },
  { name: 'Randy Weber', slug: 'randy-weber', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Texas\'s 14th congressional district. Small business owner focused on energy, NASA, and the petrochemical industry.' },
  { name: 'Monica De La Cruz', slug: 'monica-de-la-cruz', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Texas\'s 15th congressional district. Insurance agency owner and the first Republican to represent the Rio Grande Valley.' },
  { name: 'Veronica Escobar', slug: 'veronica-escobar', state: 'TX', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Texas\'s 16th congressional district. Former El Paso County judge focused on immigration, veterans, and border community issues.' },
  { name: 'Pete Sessions', slug: 'pete-sessions', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Texas\'s 17th congressional district. Veteran congressman and former Rules Committee chair returning to Congress.' },
  { name: 'Sheila Jackson Lee', slug: 'sheila-jackson-lee', state: 'TX', party: 'democrat', title: 'U.S. Representative', since_year: 1995, bio: 'U.S. Representative for Texas\'s 18th congressional district. Senior Judiciary member focused on criminal justice, immigration, and civil rights in Houston.' },
  { name: 'Jodey Arrington', slug: 'jodey-arrington', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Texas\'s 19th congressional district. Chair of the House Budget Committee focused on fiscal responsibility and agriculture.' },
  { name: 'Joaquin Castro', slug: 'joaquin-castro', state: 'TX', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Texas\'s 20th congressional district. Senior Foreign Affairs member and twin brother of former HUD Secretary Julian Castro.' },
  { name: 'Chip Roy', slug: 'chip-roy', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Texas\'s 21st congressional district. Former chief of staff to Senator Ted Cruz, focused on border security and fiscal conservatism.' },
  { name: 'Troy Nehls', slug: 'troy-nehls', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Texas\'s 22nd congressional district. Former Fort Bend County sheriff and Army veteran focused on law enforcement.' },
  { name: 'Tony Gonzales', slug: 'tony-gonzales', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Texas\'s 23rd congressional district. Navy veteran representing the largest congressional district in Texas along the border.' },
  { name: 'Beth Van Duyne', slug: 'beth-van-duyne', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Texas\'s 24th congressional district. Former Irving mayor and HUD regional administrator focused on small business and trade.' },
  { name: 'Roger Williams', slug: 'roger-williams', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Texas\'s 25th congressional district. Chair of the Small Business Committee and former Texas Secretary of State.' },
  { name: 'Michael Burgess', slug: 'michael-burgess', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2003, bio: 'U.S. Representative for Texas\'s 26th congressional district. OB/GYN physician and senior Energy and Commerce member focused on healthcare.' },
  { name: 'Michael Cloud', slug: 'michael-cloud', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2018, bio: 'U.S. Representative for Texas\'s 27th congressional district. Former county party chair focused on fiscal conservatism and limited government.' },
  { name: 'Henry Cuellar', slug: 'henry-cuellar', state: 'TX', party: 'democrat', title: 'U.S. Representative', since_year: 2005, bio: 'U.S. Representative for Texas\'s 28th congressional district. Centrist Democrat and senior appropriator focused on border security and trade.' },
  { name: 'Sylvia Garcia', slug: 'sylvia-garcia', state: 'TX', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Texas\'s 29th congressional district. Former state senator and judge focused on immigration and workers\' rights.' },
  { name: 'Jasmine Crockett', slug: 'jasmine-crockett', state: 'TX', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Texas\'s 30th congressional district. Civil rights attorney and former state representative from Dallas.' },
  { name: 'John Carter', slug: 'john-carter', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2003, bio: 'U.S. Representative for Texas\'s 31st congressional district. Former judge and senior appropriator focused on military affairs and Fort Cavazos.' },
  { name: 'Colin Allred', slug: 'colin-allred', state: 'TX', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Texas\'s 32nd congressional district. Former NFL linebacker and civil rights attorney focused on infrastructure and healthcare.' },
  { name: 'Marc Veasey', slug: 'marc-veasey', state: 'TX', party: 'democrat', title: 'U.S. Representative', since_year: 2013, bio: 'U.S. Representative for Texas\'s 33rd congressional district. Former state representative focused on energy, defense, and the Fort Worth community.' },
  { name: 'Vicente Gonzalez', slug: 'vicente-gonzalez', state: 'TX', party: 'democrat', title: 'U.S. Representative', since_year: 2017, bio: 'U.S. Representative for Texas\'s 34th congressional district. Attorney focused on border issues, trade, and healthcare in the Rio Grande Valley.' },
  { name: 'Greg Casar', slug: 'greg-casar', state: 'TX', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Texas\'s 35th congressional district. Former Austin city council member and progressive advocate for workers\' rights.' },
  { name: 'Brian Babin', slug: 'brian-babin', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Texas\'s 36th congressional district. Dentist and former mayor focused on NASA, energy, and border security.' },
  { name: 'Lloyd Doggett', slug: 'lloyd-doggett', state: 'TX', party: 'democrat', title: 'U.S. Representative', since_year: 1995, bio: 'U.S. Representative for Texas\'s 37th congressional district. Senior Ways and Means member and former Texas Supreme Court justice focused on healthcare.' },
  { name: 'Wesley Hunt', slug: 'wesley-hunt', state: 'TX', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Texas\'s 38th congressional district. Army Apache helicopter pilot and West Point graduate focused on energy and veterans.' },

  // === VIRGINIA (11 districts) ===
  { name: 'Rob Wittman', slug: 'rob-wittman', state: 'VA', party: 'republican', title: 'U.S. Representative', since_year: 2007, bio: 'U.S. Representative for Virginia\'s 1st congressional district. Senior Armed Services member focused on naval shipbuilding and national defense.' },
  { name: 'Jen Kiggans', slug: 'jen-kiggans', state: 'VA', party: 'republican', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Virginia\'s 2nd congressional district. Navy helicopter pilot veteran and nurse practitioner from Virginia Beach.' },
  { name: 'Bobby Scott', slug: 'bobby-scott', state: 'VA', party: 'democrat', title: 'U.S. Representative', since_year: 1993, bio: 'U.S. Representative for Virginia\'s 3rd congressional district. Ranking member of the Education and Workforce Committee and senior Virginia Democrat.' },
  { name: 'Jennifer McClellan', slug: 'jennifer-mcclellan', state: 'VA', party: 'democrat', title: 'U.S. Representative', since_year: 2023, bio: 'U.S. Representative for Virginia\'s 4th congressional district. The first Black woman to represent Virginia in Congress, former state senator.' },
  { name: 'Bob Good', slug: 'bob-good', state: 'VA', party: 'republican', title: 'U.S. Representative', since_year: 2021, bio: 'U.S. Representative for Virginia\'s 5th congressional district. Former Liberty University athletics official and conservative Freedom Caucus member.' },
  { name: 'Ben Cline', slug: 'ben-cline', state: 'VA', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Virginia\'s 6th congressional district. Former state legislator focused on fiscal conservatism and Shenandoah Valley issues.' },
  { name: 'Abigail Spanberger', slug: 'abigail-spanberger', state: 'VA', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Virginia\'s 7th congressional district. Former CIA operations officer focused on bipartisan solutions and agriculture.' },
  { name: 'Don Beyer', slug: 'don-beyer', state: 'VA', party: 'democrat', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for Virginia\'s 8th congressional district. Former ambassador to Switzerland and Virginia lieutenant governor focused on climate and technology.' },
  { name: 'Morgan Griffith', slug: 'morgan-griffith', state: 'VA', party: 'republican', title: 'U.S. Representative', since_year: 2011, bio: 'U.S. Representative for Virginia\'s 9th congressional district. Attorney and former Virginia House majority leader focused on energy and coal country issues.' },
  { name: 'Jennifer Wexton', slug: 'jennifer-wexton', state: 'VA', party: 'democrat', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for Virginia\'s 10th congressional district. Former state senator and prosecutor representing the northern Virginia suburbs.' },
  { name: 'Gerry Connolly', slug: 'gerry-connolly', state: 'VA', party: 'democrat', title: 'U.S. Representative', since_year: 2009, bio: 'U.S. Representative for Virginia\'s 11th congressional district. Former Fairfax County Board chair focused on federal workforce and government oversight.' },

  // === WEST VIRGINIA (2 districts) ===
  { name: 'Carol Miller', slug: 'carol-miller', state: 'WV', party: 'republican', title: 'U.S. Representative', since_year: 2019, bio: 'U.S. Representative for West Virginia\'s 1st congressional district. Former state legislator and small business owner focused on energy and infrastructure.' },
  { name: 'Alex Mooney', slug: 'alex-mooney', state: 'WV', party: 'republican', title: 'U.S. Representative', since_year: 2015, bio: 'U.S. Representative for West Virginia\'s 2nd congressional district. Former Maryland state senator focused on fiscal conservatism and sound money.' },
]

// ============================================================
// Insert politicians
// ============================================================

// Fetch existing slugs to avoid duplicates
const { data: existing, error: fetchErr } = await supabase.from('politicians').select('slug')
if (fetchErr) {
  console.error('Error fetching existing politicians:', fetchErr.message)
  process.exit(1)
}
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

console.log(`\nInserting ${toInsert.length} Southern House members...`)

const rows = toInsert.map(m => ({
  ...m,
  chamber: 'house',
}))

// Insert in batches of 50
const BATCH_SIZE = 50
const allInserted = []

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE)
  const { data: inserted, error } = await supabase.from('politicians').insert(batch).select('id, name, slug, party')
  if (error) {
    console.error(`Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message)
    process.exit(1)
  }
  allInserted.push(...inserted)
  console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${inserted.length} members`)
}

console.log(`\nInserted ${allInserted.length} House members total:`)
allInserted.forEach(p => console.log(`  + ${p.name}`))

// ============================================================
// Generate stances
// ============================================================

console.log('\nGenerating stances...')

const { data: issues } = await supabase.from('issues').select('id, slug')
if (!issues || issues.length === 0) {
  console.error('No issues found in database!')
  process.exit(1)
}

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

// Intensity shift helpers
const INTENSITY_UP = {
  supports: 'strongly_supports',
  opposes: 'strongly_opposes',
  leans_support: 'supports',
  leans_oppose: 'opposes',
  neutral: 'leans_support',
  mixed: 'leans_support',
}

const INTENSITY_DOWN = {
  strongly_supports: 'supports',
  strongly_opposes: 'opposes',
  supports: 'leans_support',
  opposes: 'leans_oppose',
  leans_support: 'neutral',
  leans_oppose: 'neutral',
}

const stanceRows = []

for (const pol of allInserted) {
  const member = MEMBERS.find(m => m.slug === pol.slug)
  const partyDefaults = PARTY_DEFAULTS[member.party] || PARTY_DEFAULTS.republican

  for (const issue of issues) {
    let stance = partyDefaults[issue.slug]
    if (!stance) continue

    // Deterministic variation based on slug + issue
    const hash = (pol.slug + issue.slug).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100

    if (hash < 8) {
      // ~8% shift intensity down (more moderate)
      stance = INTENSITY_DOWN[stance] || stance
    } else if (hash >= 92) {
      // ~8% shift intensity up (more extreme)
      stance = INTENSITY_UP[stance] || stance
    } else if (hash >= 45 && hash < 50) {
      // ~5% become mixed
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

console.log(`Inserted ${stanceCount} stances for Southern House members`)

// ============================================================
// Final summary
// ============================================================

const { count: total } = await supabase.from('politicians').select('*', { count: 'exact', head: true })
const { data: chambers } = await supabase.from('politicians').select('chamber')
const breakdown = {}
chambers.forEach(p => { breakdown[p.chamber] = (breakdown[p.chamber] || 0) + 1 })

const stateBreakdown = {}
allInserted.forEach(p => {
  const member = MEMBERS.find(m => m.slug === p.slug)
  stateBreakdown[member.state] = (stateBreakdown[member.state] || 0) + 1
})

console.log(`\nTotal politicians in DB: ${total}`)
console.log('Chamber breakdown:', breakdown)
console.log('New members by state:', stateBreakdown)

const partyBreakdown = { democrat: 0, republican: 0 }
allInserted.forEach(p => { partyBreakdown[p.party] = (partyBreakdown[p.party] || 0) + 1 })
console.log('New members by party:', partyBreakdown)
