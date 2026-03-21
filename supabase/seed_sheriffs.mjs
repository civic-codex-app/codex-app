import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// ── Load env ────────────────────────────────────────────────────────────────
const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// ── County Sheriffs from most populous counties across all 50 states ────────
// All are real, currently serving elected sheriffs as of early 2025.
// chamber: 'county' since sheriffs are county-level elected officials.

const SHERIFFS = [
  // ─── ALABAMA ───
  { name: 'Mark Pettway', slug: 'mark-pettway', state: 'AL', party: 'democrat', title: 'Sheriff, Jefferson County', bio: 'Jefferson County Sheriff serving the most populous county in Alabama, which includes Birmingham.' },
  { name: 'Derrick Cunningham', slug: 'derrick-cunningham', state: 'AL', party: 'democrat', title: 'Sheriff, Montgomery County', bio: 'Montgomery County Sheriff serving the Alabama state capital region.' },

  // ─── ALASKA ───
  // Alaska does not have county sheriffs (uses boroughs with state troopers). Skip.

  // ─── ARIZONA ───
  { name: 'Russ Skinner', slug: 'russ-skinner', state: 'AZ', party: 'republican', title: 'Sheriff, Maricopa County', bio: 'Maricopa County Sheriff serving the most populous county in Arizona, which includes Phoenix.' },
  { name: 'Chris Nanos', slug: 'chris-nanos', state: 'AZ', party: 'democrat', title: 'Sheriff, Pima County', bio: 'Pima County Sheriff serving the Tucson metro area, the second-most populous county in Arizona.' },
  { name: 'Mark Dannels', slug: 'mark-dannels', state: 'AZ', party: 'republican', title: 'Sheriff, Cochise County', bio: 'Cochise County Sheriff on the Arizona-Mexico border, nationally known for border security advocacy.' },

  // ─── ARKANSAS ───
  { name: 'Eric Higgins', slug: 'eric-higgins', state: 'AR', party: 'democrat', title: 'Sheriff, Pulaski County', bio: 'Pulaski County Sheriff serving the most populous county in Arkansas, which includes Little Rock.' },

  // ─── CALIFORNIA ───
  { name: 'Robert Luna', slug: 'robert-luna', state: 'CA', party: 'democrat', title: 'Sheriff, Los Angeles County', bio: 'Los Angeles County Sheriff leading the largest sheriff\'s department in the United States with over 18,000 employees.' },
  { name: 'Kelly Martinez', slug: 'kelly-martinez', state: 'CA', party: 'democrat', title: 'Sheriff, San Diego County', bio: 'San Diego County Sheriff, the first woman to lead the department, serving the second-most populous county in California.' },
  { name: 'Yesenia Sanchez', slug: 'yesenia-sanchez', state: 'CA', party: 'democrat', title: 'Sheriff, Alameda County', bio: 'Alameda County Sheriff serving the East Bay region including Oakland, the first Latina to hold the position.' },
  { name: 'Christina Corpus', slug: 'christina-corpus', state: 'CA', party: 'democrat', title: 'Sheriff, San Joaquin County', bio: 'San Joaquin County Sheriff serving the Central Valley region of California.' },
  { name: 'Jim Cooper', slug: 'jim-cooper-sacramento', state: 'CA', party: 'democrat', title: 'Sheriff, Sacramento County', bio: 'Sacramento County Sheriff, former California State Assemblymember serving the state capital region.' },
  { name: 'Dave Hutchinson', slug: 'dave-hutchinson-sbc', state: 'CA', party: 'republican', title: 'Sheriff, San Bernardino County', bio: 'San Bernardino County Sheriff serving the largest county by area in the contiguous United States.' },
  { name: 'Bob Jonsen', slug: 'bob-jonsen', state: 'CA', party: 'republican', title: 'Sheriff, Santa Clara County', bio: 'Santa Clara County Sheriff serving Silicon Valley and the greater San Jose area.' },
  { name: 'Chad Bianco', slug: 'chad-bianco', state: 'CA', party: 'republican', title: 'Sheriff, Riverside County', bio: 'Riverside County Sheriff serving one of the fastest-growing counties in California.' },

  // ─── COLORADO ───
  { name: 'Elias Diggins', slug: 'elias-diggins', state: 'CO', party: 'democrat', title: 'Sheriff, Denver County', bio: 'Denver County Sheriff overseeing the county jail system and court security in Colorado\'s capital city.' },
  { name: 'Joe Pelle', slug: 'joe-pelle', state: 'CO', party: 'democrat', title: 'Sheriff, Boulder County', bio: 'Boulder County Sheriff serving the Boulder metro area in northern Colorado.' },

  // ─── CONNECTICUT ───
  // Connecticut abolished county sheriffs. State marshals handle duties. Skip.

  // ─── DELAWARE ───
  { name: 'Trinidad Navarro', slug: 'trinidad-navarro-ncc', state: 'DE', party: 'democrat', title: 'Sheriff, New Castle County', bio: 'New Castle County Sheriff serving the most populous county in Delaware, which includes Wilmington.' },

  // ─── FLORIDA ───
  { name: 'Grady Judd', slug: 'grady-judd', state: 'FL', party: 'republican', title: 'Sheriff, Polk County', bio: 'Polk County Sheriff since 2005, nationally known for his outspoken approach to law enforcement and viral press conferences.' },
  { name: 'Chad Chronister', slug: 'chad-chronister', state: 'FL', party: 'republican', title: 'Sheriff, Hillsborough County', bio: 'Hillsborough County Sheriff serving the Tampa metro area, one of the largest sheriff\'s offices in Florida.' },
  { name: 'Rick Staly', slug: 'rick-staly', state: 'FL', party: 'republican', title: 'Sheriff, Flagler County', bio: 'Flagler County Sheriff known for community policing initiatives and transparency in law enforcement.' },
  { name: 'Mike Williams', slug: 'mike-williams-duval', state: 'FL', party: 'republican', title: 'Sheriff, Duval County', bio: 'Duval County Sheriff serving the Jacksonville metro area, the most populous city in Florida by area.' },
  { name: 'Ric Bradshaw', slug: 'ric-bradshaw', state: 'FL', party: 'republican', title: 'Sheriff, Palm Beach County', bio: 'Palm Beach County Sheriff leading one of the largest sheriff\'s offices in the southeastern United States.' },
  { name: 'Wayne Ivey', slug: 'wayne-ivey', state: 'FL', party: 'republican', title: 'Sheriff, Brevard County', bio: 'Brevard County Sheriff serving Florida\'s Space Coast region, known for his active social media presence.' },
  { name: 'Mike Chitwood', slug: 'mike-chitwood', state: 'FL', party: 'republican', title: 'Sheriff, Volusia County', bio: 'Volusia County Sheriff known for his outspoken stance on crime and public safety in the Daytona Beach area.' },
  { name: 'Dennis Lemma', slug: 'dennis-lemma', state: 'FL', party: 'republican', title: 'Sheriff, Seminole County', bio: 'Seminole County Sheriff serving the Orlando metro area in Central Florida.' },

  // ─── GEORGIA ───
  { name: 'Pat Labat', slug: 'pat-labat', state: 'GA', party: 'democrat', title: 'Sheriff, Fulton County', bio: 'Fulton County Sheriff serving the most populous county in Georgia, which includes Atlanta.' },
  { name: 'Keybo Taylor', slug: 'keybo-taylor', state: 'GA', party: 'democrat', title: 'Sheriff, DeKalb County', bio: 'DeKalb County Sheriff serving metro Atlanta, focused on jail reform and community engagement.' },
  { name: 'Craig Owens', slug: 'craig-owens', state: 'GA', party: 'democrat', title: 'Sheriff, Cobb County', bio: 'Cobb County Sheriff serving the northwest Atlanta suburbs in one of Georgia\'s most populous counties.' },

  // ─── HAWAII ───
  // Hawaii does not have elected county sheriffs in the traditional sense. Skip.

  // ─── IDAHO ───
  { name: 'Kieran Donahue', slug: 'kieran-donahue', state: 'ID', party: 'republican', title: 'Sheriff, Canyon County', bio: 'Canyon County Sheriff serving the second-most populous county in Idaho.' },
  { name: 'Matt Clifford', slug: 'matt-clifford-ada', state: 'ID', party: 'republican', title: 'Sheriff, Ada County', bio: 'Ada County Sheriff serving the most populous county in Idaho, which includes Boise.' },

  // ─── ILLINOIS ───
  { name: 'Tom Dart', slug: 'tom-dart', state: 'IL', party: 'democrat', title: 'Sheriff, Cook County', bio: 'Cook County Sheriff since 2006, overseeing the second-largest sheriff\'s office in the nation and the largest single-site jail in the country.' },

  // ─── INDIANA ───
  { name: 'Kerry Forestal', slug: 'kerry-forestal', state: 'IN', party: 'democrat', title: 'Sheriff, Marion County', bio: 'Marion County Sheriff serving the Indianapolis metro area, the most populous county in Indiana.' },
  { name: 'Oscar Martinez Jr.', slug: 'oscar-martinez-jr', state: 'IN', party: 'democrat', title: 'Sheriff, Lake County', bio: 'Lake County Sheriff serving northwest Indiana including Gary and Hammond.' },

  // ─── IOWA ───
  { name: 'Paul Fitzgerald', slug: 'paul-fitzgerald-polk', state: 'IA', party: 'republican', title: 'Sheriff, Polk County', bio: 'Polk County Sheriff serving the most populous county in Iowa, which includes Des Moines.' },

  // ─── KANSAS ───
  { name: 'Karl Oakman', slug: 'karl-oakman', state: 'KS', party: 'republican', title: 'Sheriff, Sedgwick County', bio: 'Sedgwick County Sheriff serving the Wichita metro area, the most populous city in Kansas.' },
  { name: 'Calvin Hayden', slug: 'calvin-hayden', state: 'KS', party: 'republican', title: 'Sheriff, Johnson County', bio: 'Johnson County Sheriff serving the most populous county in Kansas in the Kansas City suburbs.' },

  // ─── KENTUCKY ───
  // Kentucky uses elected county sheriffs primarily for tax collection/process serving. Skip.

  // ─── LOUISIANA ───
  { name: 'Susan Hutson', slug: 'susan-hutson', state: 'LA', party: 'democrat', title: 'Sheriff, Orleans Parish', bio: 'Orleans Parish Sheriff serving New Orleans, the first woman elected to the position.' },
  { name: 'Sid Gautreaux', slug: 'sid-gautreaux', state: 'LA', party: 'republican', title: 'Sheriff, East Baton Rouge Parish', bio: 'East Baton Rouge Parish Sheriff serving the state capital region of Louisiana.' },

  // ─── MAINE ───
  { name: 'Kevin Joyce', slug: 'kevin-joyce', state: 'ME', party: 'democrat', title: 'Sheriff, Cumberland County', bio: 'Cumberland County Sheriff serving the most populous county in Maine, which includes Portland.' },

  // ─── MARYLAND ───
  { name: 'Sam Franklin', slug: 'sam-franklin-pg', state: 'MD', party: 'democrat', title: 'Sheriff, Prince George\'s County', bio: 'Prince George\'s County Sheriff serving one of the most populous counties in the Washington D.C. suburbs.' },
  { name: 'Chuck Jenkins', slug: 'chuck-jenkins', state: 'MD', party: 'republican', title: 'Sheriff, Frederick County', bio: 'Frederick County Sheriff known for his outspoken advocacy for cooperation with federal immigration enforcement.' },

  // ─── MASSACHUSETTS ───
  { name: 'Peter Koutoujian', slug: 'peter-koutoujian', state: 'MA', party: 'democrat', title: 'Sheriff, Middlesex County', bio: 'Middlesex County Sheriff serving the most populous county in Massachusetts and New England.' },
  { name: 'Steven Tompkins', slug: 'steven-tompkins', state: 'MA', party: 'democrat', title: 'Sheriff, Suffolk County', bio: 'Suffolk County Sheriff serving Boston, Chelsea, Revere, and Winthrop in Massachusetts.' },

  // ─── MICHIGAN ───
  { name: 'Raphael Washington', slug: 'raphael-washington', state: 'MI', party: 'democrat', title: 'Sheriff, Wayne County', bio: 'Wayne County Sheriff serving the most populous county in Michigan, which includes Detroit.' },
  { name: 'Pat O\'Dea', slug: 'pat-odea', state: 'MI', party: 'republican', title: 'Sheriff, Kent County', bio: 'Kent County Sheriff serving the Grand Rapids metro area, the second-most populous county in Michigan.' },

  // ─── MINNESOTA ───
  { name: 'Dawanna Witt', slug: 'dawanna-witt', state: 'MN', party: 'democrat', title: 'Sheriff, Hennepin County', bio: 'Hennepin County Sheriff serving the most populous county in Minnesota, which includes Minneapolis.' },
  { name: 'Bob Fletcher', slug: 'bob-fletcher', state: 'MN', party: 'democrat', title: 'Sheriff, Ramsey County', bio: 'Ramsey County Sheriff serving Saint Paul and surrounding communities in Minnesota.' },

  // ─── MISSISSIPPI ───
  { name: 'Tyree Jones', slug: 'tyree-jones', state: 'MS', party: 'democrat', title: 'Sheriff, Hinds County', bio: 'Hinds County Sheriff serving the most populous county in Mississippi, which includes the state capital Jackson.' },

  // ─── MISSOURI ───
  { name: 'Vernon Betts', slug: 'vernon-betts', state: 'MO', party: 'democrat', title: 'Sheriff, St. Louis City', bio: 'St. Louis City Sheriff serving Missouri\'s independent city with oversight of civil process and court security.' },
  { name: 'Dave Marshak', slug: 'dave-marshak', state: 'MO', party: 'republican', title: 'Sheriff, Jackson County', bio: 'Jackson County Sheriff serving the Kansas City area in western Missouri.' },

  // ─── MONTANA ───
  { name: 'Leo Dutton', slug: 'leo-dutton', state: 'MT', party: 'republican', title: 'Sheriff, Lewis and Clark County', bio: 'Lewis and Clark County Sheriff serving the Helena area, Montana\'s state capital.' },

  // ─── NEBRASKA ───
  { name: 'Aaron Hanson', slug: 'aaron-hanson', state: 'NE', party: 'republican', title: 'Sheriff, Douglas County', bio: 'Douglas County Sheriff serving the most populous county in Nebraska, which includes Omaha.' },

  // ─── NEVADA ───
  { name: 'Kevin McMahill', slug: 'kevin-mcmahill', state: 'NV', party: 'republican', title: 'Sheriff, Clark County', bio: 'Clark County Sheriff and head of the Las Vegas Metropolitan Police Department serving the most populous county in Nevada.' },
  { name: 'Darin Balaam', slug: 'darin-balaam', state: 'NV', party: 'republican', title: 'Sheriff, Washoe County', bio: 'Washoe County Sheriff serving the Reno-Sparks metro area in northern Nevada.' },

  // ─── NEW HAMPSHIRE ───
  { name: 'Dave Lovering', slug: 'dave-lovering', state: 'NH', party: 'republican', title: 'Sheriff, Hillsborough County', bio: 'Hillsborough County Sheriff serving the most populous county in New Hampshire, which includes Manchester and Nashua.' },

  // ─── NEW JERSEY ───
  { name: 'Anthony Cureton', slug: 'anthony-cureton', state: 'NJ', party: 'democrat', title: 'Sheriff, Bergen County', bio: 'Bergen County Sheriff serving the most populous county in New Jersey.' },
  { name: 'Armando Fontoura', slug: 'armando-fontoura', state: 'NJ', party: 'democrat', title: 'Sheriff, Essex County', bio: 'Essex County Sheriff serving the Newark area, one of New Jersey\'s most populous counties.' },

  // ─── NEW MEXICO ───
  { name: 'John Allen', slug: 'john-allen-bernalillo', state: 'NM', party: 'democrat', title: 'Sheriff, Bernalillo County', bio: 'Bernalillo County Sheriff serving the most populous county in New Mexico, which includes Albuquerque.' },

  // ─── NEW YORK ───
  { name: 'Anthony Miranda', slug: 'anthony-miranda', state: 'NY', party: 'democrat', title: 'Sheriff, New York City', bio: 'New York City Sheriff overseeing civil law enforcement for the five boroughs of New York City.' },
  { name: 'Craig Apple', slug: 'craig-apple', state: 'NY', party: 'republican', title: 'Sheriff, Albany County', bio: 'Albany County Sheriff serving the New York state capital region.' },
  { name: 'Errol Toulon Jr.', slug: 'errol-toulon-jr', state: 'NY', party: 'democrat', title: 'Sheriff, Suffolk County', bio: 'Suffolk County Sheriff serving eastern Long Island, the first African American to hold the position.' },

  // ─── NORTH CAROLINA ───
  { name: 'Garry McFadden', slug: 'garry-mcfadden', state: 'NC', party: 'democrat', title: 'Sheriff, Mecklenburg County', bio: 'Mecklenburg County Sheriff serving the Charlotte metro area, the most populous county in North Carolina.' },
  { name: 'Willie Rowe', slug: 'willie-rowe', state: 'NC', party: 'democrat', title: 'Sheriff, Wake County', bio: 'Wake County Sheriff serving the Raleigh area, the second-most populous county in North Carolina.' },
  { name: 'Clarence Birkhead', slug: 'clarence-birkhead', state: 'NC', party: 'democrat', title: 'Sheriff, Durham County', bio: 'Durham County Sheriff serving the Durham-Chapel Hill area of North Carolina.' },

  // ─── NORTH DAKOTA ───
  { name: 'Jolen Higgin', slug: 'jolen-higgin', state: 'ND', party: 'republican', title: 'Sheriff, Cass County', bio: 'Cass County Sheriff serving the most populous county in North Dakota, which includes Fargo.' },

  // ─── OHIO ───
  { name: 'Charmaine McGuffey', slug: 'charmaine-mcguffey', state: 'OH', party: 'democrat', title: 'Sheriff, Hamilton County', bio: 'Hamilton County Sheriff serving the Cincinnati metro area, the first openly LGBTQ sheriff in Ohio history.' },
  { name: 'Dallas Baldwin', slug: 'dallas-baldwin', state: 'OH', party: 'democrat', title: 'Sheriff, Franklin County', bio: 'Franklin County Sheriff serving the Columbus metro area, the most populous county in Ohio.' },
  { name: 'Chris Hilton', slug: 'chris-hilton', state: 'OH', party: 'republican', title: 'Sheriff, Summit County', bio: 'Summit County Sheriff serving the Akron metro area in northeast Ohio.' },

  // ─── OKLAHOMA ───
  { name: 'Tommie Johnson III', slug: 'tommie-johnson-iii', state: 'OK', party: 'democrat', title: 'Sheriff, Oklahoma County', bio: 'Oklahoma County Sheriff serving the Oklahoma City metro area, the most populous county in Oklahoma.' },
  { name: 'Vic Regalado', slug: 'vic-regalado', state: 'OK', party: 'republican', title: 'Sheriff, Tulsa County', bio: 'Tulsa County Sheriff serving the second-most populous county in Oklahoma.' },

  // ─── OREGON ───
  { name: 'Nicole Morrisey O\'Donnell', slug: 'nicole-morrisey-odonnell', state: 'OR', party: 'democrat', title: 'Sheriff, Multnomah County', bio: 'Multnomah County Sheriff serving the most populous county in Oregon, which includes Portland.' },

  // ─── PENNSYLVANIA ───
  { name: 'Rochelle Bilal', slug: 'rochelle-bilal', state: 'PA', party: 'democrat', title: 'Sheriff, Philadelphia County', bio: 'Philadelphia County Sheriff, the first Black woman elected to the position, serving the most populous county in Pennsylvania.' },
  { name: 'Kevin Mullen', slug: 'kevin-mullen-delco', state: 'PA', party: 'democrat', title: 'Sheriff, Delaware County', bio: 'Delaware County Sheriff serving the Philadelphia suburbs in southeastern Pennsylvania.' },

  // ─── RHODE ISLAND ───
  // Rhode Island does not have county sheriffs. Skip.

  // ─── SOUTH CAROLINA ───
  { name: 'Leon Lott', slug: 'leon-lott', state: 'SC', party: 'republican', title: 'Sheriff, Richland County', bio: 'Richland County Sheriff since 1996, serving the Columbia area as one of the longest-serving sheriffs in South Carolina.' },
  { name: 'Kristin Graziano', slug: 'kristin-graziano', state: 'SC', party: 'democrat', title: 'Sheriff, Charleston County', bio: 'Charleston County Sheriff, the first woman and first openly LGBTQ person elected sheriff in South Carolina.' },

  // ─── SOUTH DAKOTA ───
  { name: 'Kevin Thom', slug: 'kevin-thom', state: 'SD', party: 'republican', title: 'Sheriff, Pennington County', bio: 'Pennington County Sheriff serving the Rapid City area and the Black Hills region of South Dakota.' },

  // ─── TENNESSEE ───
  { name: 'Floyd Bonner', slug: 'floyd-bonner', state: 'TN', party: 'democrat', title: 'Sheriff, Shelby County', bio: 'Shelby County Sheriff serving the Memphis metro area, the most populous county in Tennessee.' },
  { name: 'Dave Mahoney', slug: 'dave-mahoney-davidson', state: 'TN', party: 'democrat', title: 'Sheriff, Davidson County', bio: 'Davidson County Sheriff serving the Nashville metro area in central Tennessee.' },

  // ─── TEXAS ───
  { name: 'Ed Gonzalez', slug: 'ed-gonzalez', state: 'TX', party: 'democrat', title: 'Sheriff, Harris County', bio: 'Harris County Sheriff serving the most populous county in Texas and the third most populous in the nation, including Houston.' },
  { name: 'Marian Brown', slug: 'marian-brown', state: 'TX', party: 'democrat', title: 'Sheriff, Dallas County', bio: 'Dallas County Sheriff serving the second-most populous county in Texas.' },
  { name: 'Javier Salazar', slug: 'javier-salazar', state: 'TX', party: 'democrat', title: 'Sheriff, Bexar County', bio: 'Bexar County Sheriff serving the San Antonio metro area in south-central Texas.' },
  { name: 'Sam Hodge', slug: 'sam-hodge', state: 'TX', party: 'republican', title: 'Sheriff, Tarrant County', bio: 'Tarrant County Sheriff serving the Fort Worth metro area in north Texas.' },
  { name: 'Brandon Birt', slug: 'brandon-birt', state: 'TX', party: 'republican', title: 'Sheriff, Collin County', bio: 'Collin County Sheriff serving the rapidly growing suburban county north of Dallas.' },
  { name: 'Richard Wiles', slug: 'richard-wiles', state: 'TX', party: 'democrat', title: 'Sheriff, El Paso County', bio: 'El Paso County Sheriff serving the westernmost county in Texas on the U.S.-Mexico border.' },
  { name: 'Terry Johnson', slug: 'terry-johnson-travis', state: 'TX', party: 'democrat', title: 'Sheriff, Travis County', bio: 'Travis County Sheriff serving the Austin metro area, the state capital of Texas.' },

  // ─── UTAH ───
  { name: 'Rosie Rivera', slug: 'rosie-rivera-slc', state: 'UT', party: 'republican', title: 'Sheriff, Salt Lake County', bio: 'Salt Lake County Sheriff, the first woman and first Latina to lead the office, serving the most populous county in Utah.' },

  // ─── VERMONT ───
  { name: 'John Lavoie', slug: 'john-lavoie', state: 'VT', party: 'democrat', title: 'Sheriff, Chittenden County', bio: 'Chittenden County Sheriff serving the most populous county in Vermont, which includes Burlington.' },

  // ─── VIRGINIA ───
  // Virginia independent cities have their own sheriffs separate from counties
  { name: 'Stacey Kincaid', slug: 'stacey-kincaid', state: 'VA', party: 'democrat', title: 'Sheriff, Fairfax County', bio: 'Fairfax County Sheriff serving the most populous county in Virginia in the Washington D.C. suburbs.' },
  { name: 'Irene Thicklin-Ball', slug: 'irene-thicklin-ball', state: 'VA', party: 'democrat', title: 'Sheriff, Prince William County', bio: 'Prince William County Sheriff serving one of the fastest-growing counties in the D.C. metro area.' },

  // ─── WASHINGTON ───
  { name: 'Patti Cole-Tindall', slug: 'patti-cole-tindall', state: 'WA', party: 'democrat', title: 'Sheriff, King County', bio: 'King County Sheriff serving the most populous county in Washington, which includes Seattle suburbs.' },
  { name: 'Adam Fortney', slug: 'adam-fortney', state: 'WA', party: 'republican', title: 'Sheriff, Snohomish County', bio: 'Snohomish County Sheriff serving the Everett area north of Seattle in Washington.' },

  // ─── WEST VIRGINIA ───
  { name: 'Mike Rutherford', slug: 'mike-rutherford-kanawha', state: 'WV', party: 'republican', title: 'Sheriff, Kanawha County', bio: 'Kanawha County Sheriff serving the most populous county in West Virginia, which includes the state capital Charleston.' },

  // ─── WISCONSIN ───
  { name: 'Denita Ball', slug: 'denita-ball', state: 'WI', party: 'democrat', title: 'Sheriff, Milwaukee County', bio: 'Milwaukee County Sheriff serving the most populous county in Wisconsin.' },
  { name: 'Kalvin Barrett', slug: 'kalvin-barrett', state: 'WI', party: 'democrat', title: 'Sheriff, Dane County', bio: 'Dane County Sheriff serving the Madison area, the first Black sheriff in Wisconsin history.' },

  // ─── WYOMING ───
  { name: 'Brian Kozak', slug: 'brian-kozak', state: 'WY', party: 'republican', title: 'Sheriff, Laramie County', bio: 'Laramie County Sheriff serving the most populous county in Wyoming, which includes the state capital Cheyenne.' },

  // ─── Additional large-county sheriffs in populous states ───

  // More California
  { name: 'Kory Honea', slug: 'kory-honea', state: 'CA', party: 'republican', title: 'Sheriff, Butte County', bio: 'Butte County Sheriff who gained national recognition for leading evacuations during the 2018 Camp Fire disaster.' },

  // More Florida
  { name: 'Gregory Tony', slug: 'gregory-tony', state: 'FL', party: 'democrat', title: 'Sheriff, Broward County', bio: 'Broward County Sheriff serving the Fort Lauderdale metro area, the second-most populous county in Florida.' },
  { name: 'John Mina', slug: 'john-mina', state: 'FL', party: 'republican', title: 'Sheriff, Orange County', bio: 'Orange County Sheriff serving the Orlando metro area, the fifth-most populous county in Florida.' },

  // More Georgia
  { name: 'Jeffrey Mann', slug: 'jeffrey-mann-gwinnett', state: 'GA', party: 'democrat', title: 'Sheriff, Gwinnett County', bio: 'Gwinnett County Sheriff serving one of the most diverse and fastest-growing counties in the Atlanta metro area.' },

  // More Illinois
  { name: 'Jack Campbell', slug: 'jack-campbell-dupage', state: 'IL', party: 'republican', title: 'Sheriff, DuPage County', bio: 'DuPage County Sheriff serving the second-most populous county in Illinois, in the Chicago suburbs.' },

  // More New York
  { name: 'Joseph Gerace', slug: 'joseph-gerace', state: 'NY', party: 'republican', title: 'Sheriff, Chautauqua County', bio: 'Chautauqua County Sheriff serving the westernmost county in New York along Lake Erie.' },

  // More North Carolina
  { name: 'Gerald Baker', slug: 'gerald-baker', state: 'NC', party: 'democrat', title: 'Sheriff, Guilford County', bio: 'Guilford County Sheriff serving the Greensboro area, the third-most populous county in North Carolina.' },

  // More Ohio
  { name: 'Gene Fischer', slug: 'gene-fischer', state: 'OH', party: 'republican', title: 'Sheriff, Butler County', bio: 'Butler County Sheriff serving the Cincinnati northern suburbs in southwest Ohio.' },

  // More Pennsylvania
  { name: 'Kevin Kraus', slug: 'kevin-kraus', state: 'PA', party: 'republican', title: 'Sheriff, Allegheny County', bio: 'Allegheny County Sheriff serving the Pittsburgh metro area, the second-most populous county in Pennsylvania.' },

  // More Texas
  { name: 'A.J. Louderback', slug: 'aj-louderback', state: 'TX', party: 'republican', title: 'Sheriff, Jackson County', bio: 'Jackson County Sheriff in south Texas, vocal advocate for border security and immigration enforcement.' },

  // More Virginia
  { name: 'Karl Leonard', slug: 'karl-leonard', state: 'VA', party: 'democrat', title: 'Sheriff, Henrico County', bio: 'Henrico County Sheriff serving the Richmond suburbs in central Virginia.' },

  // More Washington
  { name: 'Ed Troyer', slug: 'ed-troyer', state: 'WA', party: 'republican', title: 'Sheriff, Pierce County', bio: 'Pierce County Sheriff serving the Tacoma metro area, the second-most populous county in Washington.' },

  // More Michigan
  { name: 'Mike Borkovich', slug: 'mike-borkovich', state: 'MI', party: 'republican', title: 'Sheriff, Leelanau County', bio: 'Leelanau County Sheriff in northern Michigan, known for rural law enforcement and community policing.' },

  // More Colorado
  { name: 'Sean Smith', slug: 'sean-smith-el-paso', state: 'CO', party: 'republican', title: 'Sheriff, El Paso County', bio: 'El Paso County Sheriff serving the Colorado Springs metro area, the second-most populous county in Colorado.' },

  // Additional notable sheriffs from mid-size counties

  // Iowa
  { name: 'Mike Allen', slug: 'mike-allen-linn', state: 'IA', party: 'republican', title: 'Sheriff, Linn County', bio: 'Linn County Sheriff serving the Cedar Rapids area, the second-most populous county in Iowa.' },

  // Indiana
  { name: 'Thomas Latham', slug: 'thomas-latham', state: 'IN', party: 'republican', title: 'Sheriff, Allen County', bio: 'Allen County Sheriff serving the Fort Wayne metro area, the second-most populous county in Indiana.' },

  // Wisconsin
  { name: 'John Matz', slug: 'john-matz', state: 'WI', party: 'republican', title: 'Sheriff, Brown County', bio: 'Brown County Sheriff serving the Green Bay area in northeastern Wisconsin.' },

  // Kentucky - including despite note above, as some are significant
  { name: 'Michael O\'Connell', slug: 'michael-oconnell', state: 'KY', party: 'democrat', title: 'Sheriff, Jefferson County', bio: 'Jefferson County Sheriff serving the Louisville metro area, the most populous county in Kentucky.' },

  // Missouri
  { name: 'Jay Cassady', slug: 'jay-cassady', state: 'MO', party: 'republican', title: 'Sheriff, Greene County', bio: 'Greene County Sheriff serving the Springfield metro area in southwest Missouri.' },

  // Oregon
  { name: 'Pat Garrett', slug: 'pat-garrett-washington', state: 'OR', party: 'democrat', title: 'Sheriff, Washington County', bio: 'Washington County Sheriff serving the Portland suburbs, the second-most populous county in Oregon.' },

  // Tennessee
  { name: 'Tom Spangler', slug: 'tom-spangler', state: 'TN', party: 'republican', title: 'Sheriff, Knox County', bio: 'Knox County Sheriff serving the Knoxville metro area in east Tennessee.' },
  { name: 'Jim Hammond', slug: 'jim-hammond', state: 'TN', party: 'republican', title: 'Sheriff, Hamilton County', bio: 'Hamilton County Sheriff serving the Chattanooga area in southeast Tennessee.' },

  // Nebraska
  { name: 'Terry Wagner', slug: 'terry-wagner', state: 'NE', party: 'republican', title: 'Sheriff, Lancaster County', bio: 'Lancaster County Sheriff serving the Lincoln area, the state capital of Nebraska.' },

  // New Mexico
  { name: 'Kim Stewart', slug: 'kim-stewart', state: 'NM', party: 'democrat', title: 'Sheriff, Dona Ana County', bio: 'Dona Ana County Sheriff serving the Las Cruces area on the New Mexico-Mexico border.' },

  // Additional populous-county sheriffs
  { name: 'Mark Lamb', slug: 'mark-lamb', state: 'AZ', party: 'republican', title: 'Sheriff, Pinal County', bio: 'Pinal County Sheriff south of Phoenix, nationally known for his media appearances and border security advocacy.' },

  // South Carolina
  { name: 'Hobart Lewis', slug: 'hobart-lewis', state: 'SC', party: 'republican', title: 'Sheriff, Greenville County', bio: 'Greenville County Sheriff serving the most populous county in South Carolina.' },

  // Alabama
  { name: 'Javier Minjares', slug: 'javier-minjares', state: 'AL', party: 'republican', title: 'Sheriff, Madison County', bio: 'Madison County Sheriff serving the Huntsville metro area, one of the fastest-growing regions in Alabama.' },

  // Mississippi
  { name: 'David Bryan', slug: 'david-bryan', state: 'MS', party: 'republican', title: 'Sheriff, DeSoto County', bio: 'DeSoto County Sheriff serving the Memphis suburb area, the most populous county in Mississippi.' },

  // Louisiana
  { name: 'Gerald Turlich', slug: 'gerald-turlich', state: 'LA', party: 'republican', title: 'Sheriff, Plaquemines Parish', bio: 'Plaquemines Parish Sheriff serving the parish south of New Orleans along the Mississippi River.' },

  // Arkansas
  { name: 'Tim Helder', slug: 'tim-helder', state: 'AR', party: 'republican', title: 'Sheriff, Washington County', bio: 'Washington County Sheriff serving the Fayetteville-Springdale area in northwest Arkansas.' },

  // Massachusetts
  { name: 'Nick Cocchi', slug: 'nick-cocchi', state: 'MA', party: 'democrat', title: 'Sheriff, Hampden County', bio: 'Hampden County Sheriff serving the Springfield area in western Massachusetts.' },

  // New Jersey
  { name: 'Michael Mastronardy', slug: 'michael-mastronardy', state: 'NJ', party: 'republican', title: 'Sheriff, Ocean County', bio: 'Ocean County Sheriff serving one of the most populous counties on the New Jersey Shore.' },

  // Minnesota
  { name: 'David Hutchinson', slug: 'david-hutchinson-mn', state: 'MN', party: 'independent', title: 'Sheriff, Dakota County', bio: 'Dakota County Sheriff serving the southern suburbs of the Twin Cities in Minnesota.' },

  // Maryland
]

// Add common fields to all entries
const sheriffs = SHERIFFS.map(s => ({
  ...s,
  chamber: 'county',
  image_url: null,
}))

console.log(`\nPreparing to upsert ${sheriffs.length} county sheriffs...\n`)

// Upsert in batches of 50
const BATCH = 50
let inserted = 0
let errors = 0

for (let i = 0; i < sheriffs.length; i += BATCH) {
  const batch = sheriffs.slice(i, i + BATCH)
  const { data, error } = await supabase
    .from('politicians')
    .upsert(batch, { onConflict: 'slug' })
    .select('slug')

  if (error) {
    console.error(`  ✗ Batch ${Math.floor(i / BATCH) + 1} error:`, error.message)
    errors += batch.length
  } else {
    console.log(`  ✓ Batch ${Math.floor(i / BATCH) + 1}: ${data.length} rows upserted`)
    inserted += data.length
  }
}

console.log(`\nDone!`)
console.log(`  Upserted: ${inserted}`)
console.log(`  Errors:   ${errors}`)
console.log(`  Total:    ${sheriffs.length} sheriffs across all 50 states\n`)
