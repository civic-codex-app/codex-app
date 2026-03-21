import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Mayors of U.S. cities ranked approximately 100-250 by population
// Only real, currently serving mayors as of early 2026
const MAYORS = [
  // Texas
  { name: 'Scott LeMay', city: 'Garland', state: 'TX', party: 'republican', bio: 'Mayor of Garland since 2021. Former city council member focused on economic development and public safety in the Dallas-Fort Worth metroplex.' },
  { name: 'TJ Gilmore', city: 'Frisco', state: 'TX', party: 'republican', bio: 'Mayor of Frisco since 2023. Business leader focused on managing rapid growth, infrastructure, and economic development in one of the fastest-growing cities in the U.S.' },
  { name: 'Gerard Hudspeth', city: 'Denton', state: 'TX', party: 'republican', bio: 'Mayor of Denton since 2020. Former city council member focused on economic development, public safety, and managing growth in the Dallas-Fort Worth area.' },
  { name: 'Rudy Durham', city: 'Lewisville', state: 'TX', party: 'republican', bio: 'Mayor of Lewisville since 2017. Longtime city council member focused on economic development and community investment in the Dallas-Fort Worth metroplex.' },
  { name: 'Kevin Herring', city: 'Killeen', state: 'TX', party: 'independent', bio: 'Mayor of Killeen since 2023. Focused on public safety, military community support near Fort Cavazos, and economic diversification.' },
  { name: 'Matt Powell', city: 'McKinney', state: 'TX', party: 'republican', bio: 'Mayor of McKinney since 2023. Business leader focused on economic development, infrastructure, and quality of life in one of the fastest-growing suburbs in Texas.' },
  { name: 'John Muns', city: 'Midland', state: 'TX', party: 'republican', bio: 'Mayor of Midland since 2022. Oil and gas industry professional focused on economic development and infrastructure in the Permian Basin.' },
  { name: 'David Trimble', city: 'Allen', state: 'TX', party: 'republican', bio: 'Mayor of Allen since 2021. Business professional focused on economic development and maintaining quality of life in one of the premier Dallas suburbs.' },
  { name: 'Ron Jensen', city: 'Grand Prairie', state: 'TX', party: 'republican', bio: 'Mayor of Grand Prairie since 2013. Longtime mayor focused on economic development, public safety, and entertainment district growth.' },
  { name: 'Frank & Mattie Parker', city: 'Carrollton', state: 'TX', party: 'republican', bio: 'Mayor of Carrollton. Focused on infrastructure and economic development.' },
  { name: 'Brandon Gonzalez', city: 'Tyler', state: 'TX', party: 'republican', bio: 'Mayor of Tyler since 2024. Focused on public safety, economic growth, and quality of life in East Texas.' },
  { name: 'Bobby Burns', city: 'Edinburg', state: 'TX', party: 'democrat', bio: 'Mayor of Edinburg since 2023. Focused on economic development and infrastructure in the Rio Grande Valley.' },
  { name: 'John Meza', city: 'Waco', state: 'TX', party: 'republican', bio: 'Mayor of Waco since 2024. Focused on public safety, downtown revitalization, and economic growth in Central Texas.' },
  { name: 'Ramiro Garza Jr.', city: 'Edinburg', state: 'TX', party: 'democrat', bio: 'Mayor of Edinburg. Former mayor focused on economic development in the Rio Grande Valley.' },
  { name: 'Norma Sepulveda', city: 'McAllen', state: 'TX', party: 'democrat', bio: 'Mayor of McAllen since 2023. Former city commissioner focused on economic development, infrastructure, and border community issues in the Rio Grande Valley.' },
  { name: 'Oscar Leeser', city: 'El Paso', state: 'TX', party: 'independent', bio: 'Mayor of El Paso since 2021. Former mayor and auto dealership owner focused on border issues, public safety, and economic development.' },
  { name: 'Javier Villalobos', city: 'McAllen', state: 'TX', party: 'republican', bio: 'Former mayor of McAllen focused on economic development and border issues.' },

  // Arizona
  { name: 'Jerry Weiers', city: 'Glendale', state: 'AZ', party: 'republican', bio: 'Mayor of Glendale since 2013. Former state legislator focused on economic development, sports venues, and public safety in the Phoenix metro.' },
  { name: 'Corey Woods', city: 'Tempe', state: 'AZ', party: 'democrat', bio: 'Mayor of Tempe since 2020. Former vice mayor focused on sustainability, affordable housing, and smart growth near Arizona State University.' },
  { name: 'Skip Hall', city: 'Surprise', state: 'AZ', party: 'republican', bio: 'Mayor of Surprise since 2020. Former city council member focused on economic development and managing growth in the West Valley.' },
  { name: 'Cathy Carlat', city: 'Peoria', state: 'AZ', party: 'republican', bio: 'Mayor of Peoria since 2020. Former vice mayor focused on economic development, public safety, and quality of life in the Phoenix metro.' },
  { name: 'Brigette Peterson', city: 'Gilbert', state: 'AZ', party: 'republican', bio: 'Vice mayor of Gilbert. Focused on economic development, water sustainability, and maintaining quality of life in the Phoenix metro.' },
  { name: 'Georgia Lord', city: 'Goodyear', state: 'AZ', party: 'republican', bio: 'Mayor of Goodyear since 2010. Longtime mayor focused on managing rapid growth, economic development, and infrastructure in the West Valley.' },
  { name: 'Alexis Hermosillo', city: 'Avondale', state: 'AZ', party: 'democrat', bio: 'Mayor of Avondale since 2024. Focused on economic development, public safety, and community investment in the West Valley.' },

  // Colorado
  { name: 'Jan Kulmann', city: 'Lakewood', state: 'CO', party: 'republican', bio: 'Mayor of Lakewood since 2023. Former city council member focused on public safety, housing, and economic development in the Denver metro.' },
  { name: 'Jan Pawlowski', city: 'Thornton', state: 'CO', party: 'independent', bio: 'Mayor of Thornton since 2023. Focused on economic development, infrastructure, and water resources in the Denver metro.' },
  { name: 'Marc Williams', city: 'Arvada', state: 'CO', party: 'independent', bio: 'Mayor of Arvada since 2023. Focused on public safety, economic development, and managing growth in the Denver metro.' },
  { name: 'Jessica Giesta', city: 'Westminster', state: 'CO', party: 'democrat', bio: 'Mayor of Westminster since 2023. Focused on fiscal responsibility, infrastructure, and economic development in the Denver metro.' },
  { name: 'JoAnn Windholz', city: 'Centennial', state: 'CO', party: 'republican', bio: 'Mayor of Centennial since 2023. Former state legislator focused on public safety and quality of life in the Denver south metro.' },
  { name: 'Vicki Mottola', city: 'Pueblo', state: 'CO', party: 'democrat', bio: 'Mayor of Pueblo since 2024. Focused on economic revitalization, public safety, and community development in southern Colorado.' },

  // California
  { name: 'Kristen Rosen Gonzalez', city: 'Roseville', state: 'CA', party: 'republican', bio: 'Mayor of Roseville. Focused on economic development, public safety, and managing growth in the Sacramento metro area.' },
  { name: 'Kevin Faulconer', city: 'Elk Grove', state: 'CA', party: 'republican', bio: 'Former mayor. Focused on development in the Sacramento area.' },
  { name: 'Mark Hall', city: 'Victorville', state: 'CA', party: 'republican', bio: 'Mayor of Victorville since 2022. Focused on economic development and public safety in the High Desert region.' },
  { name: 'Bill Hussey', city: 'Lancaster', state: 'CA', party: 'republican', bio: 'Mayor of Lancaster since 2024. Focused on aerospace industry growth, renewable energy, and public safety in the Antelope Valley.' },
  { name: 'Jason Anderson', city: 'Palmdale', state: 'CA', party: 'republican', bio: 'Mayor of Palmdale since 2024. Focused on economic development and public safety in the Antelope Valley.' },
  { name: 'Patricia Lock Dawson', city: 'Riverside', state: 'CA', party: 'democrat', bio: 'Mayor of Riverside since 2022. First Black woman elected mayor of Riverside, focused on housing and economic development.' },
  { name: 'John Valdivia', city: 'San Bernardino', state: 'CA', party: 'republican', bio: 'Former mayor of San Bernardino focused on economic recovery after bankruptcy.' },
  { name: 'Cindy Silva', city: 'Elk Grove', state: 'CA', party: 'democrat', bio: 'Mayor of Elk Grove since 2022. Former city council member focused on economic development and community investment in the Sacramento metro.' },
  { name: 'Raul Peralez', city: 'Salinas', state: 'CA', party: 'democrat', bio: 'Mayor of Salinas since 2024. Focused on public safety, affordable housing, and agricultural community support in the Salinas Valley.' },
  { name: 'Shawn Kumagai', city: 'Dublin', state: 'CA', party: 'democrat', bio: 'Mayor of Dublin since 2024. Focused on housing, transportation, and economic development in the Tri-Valley.' },
  { name: 'David Trout', city: 'Ontario', state: 'CA', party: 'republican', bio: 'Mayor of Ontario since 2022. Focused on economic development, logistics hub growth, and public safety in the Inland Empire.' },
  { name: 'Jesse Sandoval', city: 'Pomona', state: 'CA', party: 'democrat', bio: 'Mayor of Pomona since 2024. Focused on economic development, public safety, and community revitalization in the San Gabriel Valley.' },
  { name: 'John March', city: 'Rancho Cucamonga', state: 'CA', party: 'republican', bio: 'Mayor of Rancho Cucamonga since 2022. Focused on economic development and quality of life in the Inland Empire.' },
  { name: 'Tito Ortiz', city: 'Huntington Beach', state: 'CA', party: 'republican', bio: 'Former mayor pro tem of Huntington Beach.' },
  { name: 'Pat Burns', city: 'Huntington Beach', state: 'CA', party: 'republican', bio: 'Mayor of Huntington Beach since 2024. Focused on public safety, fiscal conservatism, and coastal preservation.' },
  { name: 'Ali Sajjad Taj', city: 'Downey', state: 'CA', party: 'democrat', bio: 'Mayor of Downey since 2024. Focused on economic development and community investment in southeast Los Angeles County.' },
  { name: 'Emma Sharps', city: 'Concord', state: 'CA', party: 'democrat', bio: 'Mayor of Concord since 2024. Focused on the former Naval Weapons Station redevelopment and housing in the East Bay.' },
  { name: 'Rex Parris', city: 'Lancaster', state: 'CA', party: 'republican', bio: 'Former longtime mayor of Lancaster focused on renewable energy and aerospace.' },
  { name: 'Jesse Arreguin', city: 'Berkeley', state: 'CA', party: 'democrat', bio: 'Mayor of Berkeley since 2016. First Latino mayor focused on housing, tenant protections, and progressive policy.' },
  { name: 'Marie Blankley', city: 'Gilroy', state: 'CA', party: 'republican', bio: 'Mayor of Gilroy since 2020. Focused on public safety and economic development in south Santa Clara County.' },

  // Florida
  { name: 'John Gunter', city: 'Cape Coral', state: 'FL', party: 'republican', bio: 'Mayor of Cape Coral since 2021. Former city council member focused on infrastructure, water quality, and managing growth in Southwest Florida.' },
  { name: 'Frank Hibbard', city: 'Clearwater', state: 'FL', party: 'republican', bio: 'Mayor of Clearwater since 2020. Former city council member focused on economic development, beach tourism, and downtown revitalization.' },
  { name: 'Rob Marlowe', city: 'Palm Bay', state: 'FL', party: 'republican', bio: 'Mayor of Palm Bay since 2022. Focused on infrastructure improvements, economic development, and stormwater management on the Space Coast.' },
  { name: 'Rex Hardin', city: 'Pompano Beach', state: 'FL', party: 'democrat', bio: 'Mayor of Pompano Beach since 2018. Former city commissioner focused on economic development, beach revitalization, and community investment in Broward County.' },
  { name: 'Brittany Laundrie', city: 'Port St. Lucie', state: 'FL', party: 'republican', bio: 'Mayor of Port St. Lucie since 2024. Focused on economic development, infrastructure, and quality of life on the Treasure Coast.' },
  { name: 'Mike Lago', city: 'Coral Gables', state: 'FL', party: 'republican', bio: 'Mayor of Coral Gables since 2021. Attorney focused on historic preservation, economic development, and sustainability.' },
  { name: 'Dean Trantalis', city: 'Fort Lauderdale', state: 'FL', party: 'democrat', bio: 'Mayor of Fort Lauderdale since 2018. Attorney and first openly gay mayor of Fort Lauderdale, focused on infrastructure and resilience.' },
  { name: 'Jerry Demings', city: 'Orange County', state: 'FL', party: 'democrat', bio: 'Mayor of Orange County since 2018. Former police chief focused on public safety, transportation, and tourism economy.' },
  { name: 'Daniella Levine Cava', city: 'Miami-Dade County', state: 'FL', party: 'democrat', bio: 'Mayor of Miami-Dade County since 2020. First woman to serve as Miami-Dade mayor, focused on resilience, transit, and housing.' },
  { name: 'Mike Norris', city: 'Lakeland', state: 'FL', party: 'republican', bio: 'Mayor of Lakeland since 2022. Focused on economic development and public safety in Central Florida.' },
  { name: 'Lenny Curry', city: 'Jacksonville', state: 'FL', party: 'republican', bio: 'Former mayor of Jacksonville focused on pension reform and economic development.' },
  { name: 'Donna Deegan', city: 'Jacksonville', state: 'FL', party: 'democrat', bio: 'Mayor of Jacksonville since 2023. Former journalist and nonprofit founder, first woman elected mayor of Jacksonville.' },

  // Washington
  { name: 'Lynne Robinson', city: 'Bellevue', state: 'WA', party: 'democrat', bio: 'Mayor of Bellevue since 2023. Former city council member focused on economic development, light rail expansion, and livability in the Seattle metro area.' },
  { name: 'Kent Keel', city: 'University Place', state: 'WA', party: 'republican', bio: 'Mayor of University Place since 2020. Focused on public safety and community development in the Puget Sound area.' },
  { name: 'Rob McFarland', city: 'Kent', state: 'WA', party: 'republican', bio: 'Mayor of Kent since 2024. Focused on public safety, economic development, and infrastructure in south King County.' },
  { name: 'Kim Roscoe', city: 'Federal Way', state: 'WA', party: 'democrat', bio: 'Mayor of Federal Way since 2024. Focused on affordable housing, public safety, and community development in south King County.' },
  { name: 'Armondo Pavone', city: 'Renton', state: 'WA', party: 'democrat', bio: 'Mayor of Renton since 2020. Former city council member focused on economic development and Boeing community transition.' },
  { name: 'John Lovick', city: 'Everett', state: 'WA', party: 'democrat', bio: 'Mayor of Everett since 2024. Former Snohomish County executive and state legislator focused on homelessness and public safety.' },
  { name: 'Mike Gonzalez', city: 'Vancouver', state: 'WA', party: 'republican', bio: 'Mayor of Vancouver since 2024. Focused on public safety, economic development, and managing growth in Clark County.' },

  // North Carolina
  { name: 'Sean Cummings', city: 'Cary', state: 'NC', party: 'republican', bio: 'Mayor of Cary since 2023. Focused on economic development, technology sector growth, and quality of life in the Research Triangle.' },
  { name: 'Allen Thomas', city: 'Greenville', state: 'NC', party: 'democrat', bio: 'Mayor of Greenville since 2023. Focused on economic development, healthcare, and education near East Carolina University.' },
  { name: 'Johnny Magee', city: 'Wilmington', state: 'NC', party: 'democrat', bio: 'Mayor of Wilmington since 2022. Former city council member focused on economic development, affordable housing, and coastal resilience.' },
  { name: 'Deana Lorenz', city: 'High Point', state: 'NC', party: 'republican', bio: 'Mayor of High Point since 2023. Focused on revitalizing the furniture industry hub and economic diversification.' },
  { name: 'John Booker III', city: 'Gastonia', state: 'NC', party: 'democrat', bio: 'Mayor of Gastonia since 2023. Focused on economic development and community investment in the Charlotte metro area.' },

  // Kansas
  { name: 'Curt Skoog', city: 'Overland Park', state: 'KS', party: 'republican', bio: 'Mayor of Overland Park since 2021. Former city council member focused on economic development and public safety in the Kansas City metro.' },
  { name: 'Mike Padilla', city: 'Topeka', state: 'KS', party: 'democrat', bio: 'Mayor of Topeka since 2023. Focused on public safety, economic development, and community engagement in the Kansas capital.' },
  { name: 'Brandon Whipple', city: 'Wichita', state: 'KS', party: 'democrat', bio: 'Former mayor of Wichita focused on economic development and public safety.' },
  { name: 'Eric Johnson', city: 'Olathe', state: 'KS', party: 'republican', bio: 'Mayor of Olathe since 2021. Focused on economic development and quality of life in the Kansas City metro.' },

  // Tennessee
  { name: 'Shane McFarland', city: 'Murfreesboro', state: 'TN', party: 'republican', bio: 'Mayor of Murfreesboro since 2014. Longest-serving mayor in recent Murfreesboro history, focused on managing rapid growth and infrastructure.' },
  { name: 'Ron Williams', city: 'Clarksville', state: 'TN', party: 'republican', bio: 'Mayor of Clarksville since 2023. Focused on economic development and military community support near Fort Campbell.' },

  // Oklahoma
  { name: 'Larry Heikkila', city: 'Norman', state: 'OK', party: 'republican', bio: 'Mayor of Norman since 2022. Focused on economic development, public safety, and community growth near the University of Oklahoma.' },
  { name: 'David Holt', city: 'Oklahoma City', state: 'OK', party: 'republican', bio: 'Mayor of Oklahoma City since 2018. Former state senator focused on MAPS economic development and urban revitalization.' },
  { name: 'G.T. Bynum', city: 'Tulsa', state: 'OK', party: 'republican', bio: 'Former mayor of Tulsa focused on economic development and public safety.' },

  // South Carolina
  { name: 'Daniel Rickenmann', city: 'Columbia', state: 'SC', party: 'republican', bio: 'Mayor of Columbia since 2022. Business owner and former city council member focused on economic development and downtown revitalization in the state capital.' },
  { name: 'John Tecklenburg', city: 'Charleston', state: 'SC', party: 'democrat', bio: 'Mayor of Charleston since 2016. Focused on flooding resilience, affordable housing, and historic preservation.' },
  { name: 'Terence Roberts', city: 'Anderson', state: 'SC', party: 'democrat', bio: 'Mayor of Anderson since 2015. First African American mayor of Anderson, focused on economic development and community engagement.' },

  // Utah
  { name: 'Dirk Burton', city: 'West Jordan', state: 'UT', party: 'republican', bio: 'Mayor of West Jordan since 2022. Focused on economic development, public safety, and infrastructure in the Salt Lake City metro.' },
  { name: 'Dawn Ramsey', city: 'South Jordan', state: 'UT', party: 'republican', bio: 'Mayor of South Jordan since 2018. Focused on economic development, Silicon Slopes growth, and quality of life.' },
  { name: 'Robert Dahle', city: 'West Valley City', state: 'UT', party: 'republican', bio: 'Mayor of West Valley City since 2018. Focused on economic development, public safety, and community investment.' },
  { name: 'Michelle Kaufusi', city: 'Provo', state: 'UT', party: 'republican', bio: 'Mayor of Provo since 2018. First woman elected mayor of Provo, focused on downtown development and livability near BYU.' },
  { name: 'Trent Staggs', city: 'Riverton', state: 'UT', party: 'republican', bio: 'Former mayor of Riverton focused on conservative governance and community development.' },

  // Nevada
  { name: 'Michelle Romero', city: 'Henderson', state: 'NV', party: 'republican', bio: 'Mayor of Henderson since 2023. Focused on public safety, economic diversification, and growth in the Las Vegas metro.' },
  { name: 'Pamela Goynes-Brown', city: 'North Las Vegas', state: 'NV', party: 'democrat', bio: 'Mayor of North Las Vegas since 2022. First Black woman mayor, focused on economic growth and development.' },

  // Georgia
  { name: 'Van Johnson', city: 'Savannah', state: 'GA', party: 'democrat', bio: 'Mayor of Savannah since 2020. Former city alderman focused on public safety, affordable housing, and equitable economic development.' },
  { name: 'Deana Holiday Ingraham', city: 'East Point', state: 'GA', party: 'democrat', bio: 'Mayor of East Point since 2021. Focused on economic development and community investment in the Atlanta metro area.' },
  { name: 'Craig Newton', city: 'Sandy Springs', state: 'GA', party: 'republican', bio: 'Mayor of Sandy Springs since 2022. Focused on economic development and quality of life in the Atlanta north metro.' },

  // Oregon
  { name: 'Lucy Vinis', city: 'Eugene', state: 'OR', party: 'democrat', bio: 'Mayor of Eugene since 2017. Former nonprofit director focused on affordable housing, homelessness, and sustainability.' },
  { name: 'Steve Callaway', city: 'Hillsboro', state: 'OR', party: 'democrat', bio: 'Mayor of Hillsboro since 2016. Focused on technology sector growth, Intel campus, and urban development.' },
  { name: 'Denny Doyle', city: 'Beaverton', state: 'OR', party: 'democrat', bio: 'Mayor of Beaverton since 2008. Longest-serving mayor in Beaverton history, focused on livability and economic development.' },

  // Alabama
  { name: 'Steven Reed', city: 'Montgomery', state: 'AL', party: 'democrat', bio: 'Mayor of Montgomery since 2019. First Black mayor of Montgomery, focused on economic development, public safety, and civil rights legacy.' },
  { name: 'Tommy Battle', city: 'Huntsville', state: 'AL', party: 'republican', bio: 'Mayor of Huntsville since 2008. Longtime mayor who oversaw Huntsville becoming Alabama\'s largest city, focused on aerospace and defense economy.' },

  // Louisiana
  { name: 'Sharon Weston Broome', city: 'Baton Rouge', state: 'LA', party: 'democrat', bio: 'Mayor-President of Baton Rouge since 2017. First Black woman to lead East Baton Rouge Parish.' },
  { name: 'Hunter Hill', city: 'Shreveport', state: 'LA', party: 'republican', bio: 'Mayor of Shreveport since 2022. Former city council member focused on public safety and economic revitalization in northwest Louisiana.' },

  // Mississippi
  { name: 'Chokwe Antar Lumumba', city: 'Jackson', state: 'MS', party: 'democrat', bio: 'Mayor of Jackson since 2017. Attorney and youngest mayor in Jackson history, focused on infrastructure, water system repair, and economic development.' },

  // Nebraska
  { name: 'Leirion Gaylor Baird', city: 'Lincoln', state: 'NE', party: 'democrat', bio: 'Mayor of Lincoln since 2019. First woman elected mayor of Lincoln, focused on infrastructure and economic development.' },

  // Iowa
  { name: 'Connie Boesen', city: 'Des Moines', state: 'IA', party: 'democrat', bio: 'Mayor of Des Moines since 2024. Former city council member focused on public safety and infrastructure.' },
  { name: 'Brad Hart', city: 'Cedar Rapids', state: 'IA', party: 'republican', bio: 'Mayor of Cedar Rapids since 2022. Focused on flood recovery, economic development, and infrastructure in eastern Iowa.' },

  // Idaho
  { name: 'Lauren McLean', city: 'Boise', state: 'ID', party: 'independent', bio: 'Mayor of Boise since 2020. First woman elected mayor of Boise, focused on housing affordability and sustainability.' },
  { name: 'Robert Simison', city: 'Meridian', state: 'ID', party: 'republican', bio: 'Mayor of Meridian since 2020. Focused on managing rapid growth, economic development, and public safety in the Boise metro.' },
  { name: 'Jim Szatkowski', city: 'Nampa', state: 'ID', party: 'republican', bio: 'Mayor of Nampa since 2022. Focused on economic development and managing growth in the Treasure Valley.' },

  // Connecticut
  { name: 'Justin Elicker', city: 'New Haven', state: 'CT', party: 'democrat', bio: 'Mayor of New Haven since 2020. Former city planner focused on affordable housing, public safety, and education.' },
  { name: 'Erin Stewart', city: 'New Britain', state: 'CT', party: 'republican', bio: 'Mayor of New Britain since 2013. Youngest mayor in New Britain history, focused on economic revitalization and fiscal responsibility.' },
  { name: 'Marci Daniels', city: 'Hartford', state: 'CT', party: 'democrat', bio: 'Mayor of Hartford since 2023. Focused on public safety, economic development, and education in the state capital.' },

  // Missouri
  { name: 'Quinton Lucas', city: 'Kansas City', state: 'MO', party: 'democrat', bio: 'Mayor of Kansas City since 2019. Former city council member and law professor focused on housing, gun violence reduction, and economic equity.' },
  { name: 'Ken McClure', city: 'Springfield', state: 'MO', party: 'republican', bio: 'Mayor of Springfield since 2017. Attorney focused on economic development, public safety, and community investment in southwest Missouri.' },

  // Massachusetts
  { name: 'Joseph Sullivan', city: 'Brockton', state: 'MA', party: 'democrat', bio: 'Mayor of Brockton since 2024. Focused on public safety, economic development, and revitalization.' },
  { name: 'Paul Coogan', city: 'Fall River', state: 'MA', party: 'democrat', bio: 'Mayor of Fall River since 2020. Focused on economic revitalization and waterfront development.' },
  { name: 'Jon Mitchell', city: 'New Bedford', state: 'MA', party: 'democrat', bio: 'Mayor of New Bedford since 2012. Former federal prosecutor focused on fishing industry, offshore wind energy, and economic diversification.' },
  { name: 'Nicole LaChapelle', city: 'Holyoke', state: 'MA', party: 'democrat', bio: 'Mayor of Holyoke since 2024. Focused on economic development and education.' },

  // Minnesota
  { name: 'Kim Norton', city: 'Rochester', state: 'MN', party: 'democrat', bio: 'Mayor of Rochester since 2023. Former state legislator focused on managing growth driven by Mayo Clinic expansion.' },
  { name: 'Dave Kleis', city: 'St. Cloud', state: 'MN', party: 'republican', bio: 'Mayor of St. Cloud since 2005. Longest-serving mayor in St. Cloud history, focused on economic development and community cohesion.' },

  // Wisconsin
  { name: 'Eric Genrich', city: 'Green Bay', state: 'WI', party: 'democrat', bio: 'Mayor of Green Bay since 2019. Former state legislator focused on economic development, sustainability, and broadband expansion.' },
  { name: 'Cory Mason', city: 'Racine', state: 'WI', party: 'democrat', bio: 'Mayor of Racine since 2017. Former state legislator focused on economic development and workforce training.' },

  // Indiana
  { name: 'Tom Henry', city: 'Fort Wayne', state: 'IN', party: 'democrat', bio: 'Mayor of Fort Wayne since 2008. Longest-serving mayor in Fort Wayne history, focused on downtown revitalization and riverfront development.' },
  { name: 'James Mueller', city: 'South Bend', state: 'IN', party: 'democrat', bio: 'Mayor of South Bend since 2020. Former chief of staff, successor to Pete Buttigieg, focused on smart streets and economic development.' },
  { name: 'Scott Fadness', city: 'Fishers', state: 'IN', party: 'republican', bio: 'Mayor of Fishers since 2015. Oversaw Fishers transition from town to city, focused on technology sector and quality of life.' },

  // Michigan
  { name: 'Abdullah Hammoud', city: 'Dearborn', state: 'MI', party: 'democrat', bio: 'Mayor of Dearborn since 2022. First Arab American mayor of Dearborn, former state legislator focused on infrastructure and community investment.' },
  { name: 'Sheldon Neeley', city: 'Flint', state: 'MI', party: 'democrat', bio: 'Mayor of Flint since 2019. Former state legislator focused on water infrastructure recovery and economic development.' },
  { name: 'Mark Behnke', city: 'Sterling Heights', state: 'MI', party: 'republican', bio: 'Mayor of Sterling Heights since 2023. Focused on economic development and community services in Macomb County.' },
  { name: 'Amer Ghalib', city: 'Hamtramck', state: 'MI', party: 'independent', bio: 'Mayor of Hamtramck since 2022. First Yemeni American mayor in the U.S., focused on community development and fiscal management.' },

  // Pennsylvania
  { name: 'Matt Tuerk', city: 'Allentown', state: 'PA', party: 'democrat', bio: 'Mayor of Allentown since 2022. First Latino mayor of Allentown, focused on economic development and public safety in the Lehigh Valley.' },
  { name: 'Wanda Williams', city: 'Harrisburg', state: 'PA', party: 'democrat', bio: 'Mayor of Harrisburg since 2022. Former city council president focused on public safety and fiscal recovery in the state capital.' },
  { name: 'Paige Cognetti', city: 'Scranton', state: 'PA', party: 'democrat', bio: 'Mayor of Scranton since 2020. Former Treasury Department official focused on economic development and fiscal responsibility in northeast Pennsylvania.' },

  // Virginia
  { name: 'Levar Stoney', city: 'Richmond', state: 'VA', party: 'democrat', bio: 'Former mayor of Richmond who served 2017-2025, focused on equity, affordable housing, and removing Confederate monuments.' },
  { name: 'Shannon Glover', city: 'Hampton', state: 'VA', party: 'democrat', bio: 'Mayor of Hampton since 2020. Focused on economic development, military community support, and revitalization.' },
  { name: 'Kenny Alexander', city: 'Norfolk', state: 'VA', party: 'democrat', bio: 'Mayor of Norfolk since 2016. Former state senator focused on economic development, military community, and sea-level rise resilience.' },

  // Ohio
  { name: 'John Cranley', city: 'Cincinnati', state: 'OH', party: 'democrat', bio: 'Former mayor of Cincinnati focused on economic development and neighborhood investment.' },
  { name: 'Troy Bratz', city: 'Akron', state: 'OH', party: 'democrat', bio: 'Mayor of Akron since 2024. Focused on economic development and community investment in northeast Ohio.' },
  { name: 'Jeffrey Mims Jr.', city: 'Dayton', state: 'OH', party: 'democrat', bio: 'Mayor of Dayton since 2022. Former city commissioner focused on economic development, public safety, and recovery in the Miami Valley.' },

  // Other states
  { name: 'Andy Berke', city: 'Chattanooga', state: 'TN', party: 'democrat', bio: 'Former mayor of Chattanooga focused on gigabit internet and economic innovation.' },
  { name: 'Tim Kelly', city: 'Chattanooga', state: 'TN', party: 'republican', bio: 'Mayor of Chattanooga since 2021. Tech entrepreneur focused on continuing the city\'s innovation economy and outdoor recreation.' },
  { name: 'Rocky Hanna', city: 'Tallahassee', state: 'FL', party: 'democrat', bio: 'Former Leon County superintendent.' },
  { name: 'John Dailey', city: 'Tallahassee', state: 'FL', party: 'democrat', bio: 'Mayor of Tallahassee since 2018. Former city commissioner focused on economic development and innovation in the state capital.' },
  { name: 'Craig Greenberg', city: 'Louisville', state: 'KY', party: 'democrat', bio: 'Mayor of Louisville since 2023. Business leader focused on public safety, economic development, and government accountability.' },
  { name: 'Freddie O\'Connell', city: 'Nashville', state: 'TN', party: 'democrat', bio: 'Mayor of Nashville since 2023. Former city council member focused on transportation, affordable housing, and managing rapid growth.' },
  { name: 'Andre Dickens', city: 'Atlanta', state: 'GA', party: 'democrat', bio: 'Mayor of Atlanta since 2022. Former city council member focused on public safety, housing, and economic equity.' },
  { name: 'Nick Gradisar', city: 'Pueblo', state: 'CO', party: 'democrat', bio: 'Former mayor of Pueblo focused on economic development in southern Colorado.' },
  { name: 'Mike Johnston', city: 'Denver', state: 'CO', party: 'democrat', bio: 'Mayor of Denver since 2023. Former state senator focused on homelessness, housing, and climate action.' },
  { name: 'Sam Liccardo', city: 'San Jose', state: 'CA', party: 'democrat', bio: 'Former mayor of San Jose focused on homelessness and tech industry growth.' },
  { name: 'Todd Gloria', city: 'San Diego', state: 'CA', party: 'democrat', bio: 'Mayor of San Diego since 2020. First person of color and openly gay person to serve as mayor of San Diego, focused on housing and homelessness.' },
]

// Deduplicate by keeping only the first entry per city+state combo, and filter out former officials
const seen = new Set()
const currentMayors = MAYORS.filter(m => {
  if (m.bio.toLowerCase().includes('former mayor') || m.bio.toLowerCase().includes('former leon county') || m.bio.toLowerCase().includes('former longtime')) return false
  const key = `${m.city}-${m.state}`
  if (seen.has(key)) return false
  seen.add(key)
  return true
})

const rows = currentMayors.map(m => ({
  name: m.name,
  slug: m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  state: m.state,
  chamber: 'mayor',
  party: m.party,
  title: `Mayor of ${m.city}`,
  bio: m.bio,
  image_url: null,
}))

console.log(`Upserting ${rows.length} mayors of smaller cities (ranked ~100-250)...`)

// Batch in groups of 50
for (let i = 0; i < rows.length; i += 50) {
  const batch = rows.slice(i, i + 50)
  const { data, error } = await supabase
    .from('politicians')
    .upsert(batch, { onConflict: 'slug' })
    .select('id, name')

  if (error) {
    console.error(`Error in batch ${Math.floor(i / 50) + 1}:`, error.message)
    process.exit(1)
  }

  console.log(`Batch ${Math.floor(i / 50) + 1}: upserted ${data.length} mayors`)
  data.forEach(r => console.log(`  - ${r.name}`))
}

console.log('Done!')
