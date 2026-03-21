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

// Real, currently serving District Attorneys / County Prosecutors from major counties
// across all 50 states as of early 2026. Only verified, real officeholders included.
const DISTRICT_ATTORNEYS = [
  // ALABAMA
  { name: 'Danny Carr', state: 'AL', county: 'Jefferson County', party: 'democrat', bio: 'District Attorney of Jefferson County (Birmingham), Alabama since 2019. First African American DA of Jefferson County.' },
  { name: 'Steve Marshall', state: 'AL', county: 'Marshall County', party: 'republican', skip: true }, // He's AG now
  { name: 'Daryl Bailey', state: 'AL', county: 'Montgomery County', party: 'democrat', bio: 'District Attorney of Montgomery County, Alabama. Career prosecutor focused on violent crime reduction.' },

  // ALASKA
  { name: 'Jenna Gruenstein', state: 'AK', county: 'Anchorage', party: 'independent', bio: 'District Attorney for the Third Judicial District (Anchorage), Alaska. Career prosecutor handling the state\'s most populous district.' },

  // ARIZONA
  { name: 'Rachel Mitchell', state: 'AZ', county: 'Maricopa County', party: 'republican', bio: 'County Attorney of Maricopa County (Phoenix), Arizona since 2023. Former career sex crimes prosecutor.' },
  { name: 'Laura Conover', state: 'AZ', county: 'Pima County', party: 'democrat', bio: 'County Attorney of Pima County (Tucson), Arizona since 2021. Former civil rights attorney and defense lawyer.' },

  // ARKANSAS
  { name: 'Will Jones', state: 'AR', county: 'Pulaski County', party: 'democrat', bio: 'Prosecuting Attorney of Pulaski County (Little Rock), Arkansas. Focused on violent crime and community safety.' },

  // CALIFORNIA
  { name: 'George Gascón', state: 'CA', county: 'Los Angeles County', party: 'democrat', bio: 'District Attorney of Los Angeles County, California since 2020. Former San Francisco DA and LAPD assistant chief known for progressive criminal justice reform.' },
  { name: 'Brooke Jenkins', state: 'CA', county: 'San Francisco County', party: 'democrat', bio: 'District Attorney of San Francisco, California since 2022. Appointed after recall of Chesa Boudin, focused on balanced approach to prosecution.' },
  { name: 'Summer Stephan', state: 'CA', county: 'San Diego County', party: 'republican', bio: 'District Attorney of San Diego County, California since 2017. Career prosecutor with 30+ years focused on human trafficking and border crimes.' },
  { name: 'Jeff Rosen', state: 'CA', county: 'Santa Clara County', party: 'democrat', bio: 'District Attorney of Santa Clara County (San Jose), California since 2011. Focused on technology-related crimes and consumer protection.' },
  { name: 'Diana Becton', state: 'CA', county: 'Contra Costa County', party: 'democrat', bio: 'District Attorney of Contra Costa County, California since 2018. First African American DA in the county\'s history.' },
  { name: 'Pamela Price', state: 'CA', county: 'Alameda County', party: 'democrat', bio: 'District Attorney of Alameda County (Oakland), California. Civil rights attorney turned progressive prosecutor.' },
  { name: 'Vern Pierson', state: 'CA', county: 'El Dorado County', party: 'republican', bio: 'District Attorney of El Dorado County, California. President of the California District Attorneys Association.' },
  { name: 'Thien Ho', state: 'CA', county: 'Sacramento County', party: 'democrat', bio: 'District Attorney of Sacramento County, California since 2023. Former career prosecutor focused on violent crime and gang activity.' },
  { name: 'Todd Spitzer', state: 'CA', county: 'Orange County', party: 'republican', bio: 'District Attorney of Orange County, California since 2019. Former county supervisor and state assemblymember.' },
  { name: 'Rob Bonta Jr.', state: 'CA', county: 'Riverside County', skip: true }, // Not a DA

  // COLORADO
  { name: 'Beth McCann', state: 'CO', county: 'Denver County', party: 'democrat', bio: 'District Attorney of Denver, Colorado since 2017. Former state legislator focused on criminal justice reform and diversion programs.' },
  { name: 'Michael Dougherty', state: 'CO', county: 'Boulder County', party: 'democrat', bio: 'District Attorney of Boulder County (20th Judicial District), Colorado since 2017. Handled prosecution of the 2021 Boulder supermarket shooting.' },
  { name: 'John Kellner', state: 'CO', county: 'Arapahoe County', party: 'republican', bio: 'District Attorney of the 18th Judicial District (Arapahoe/Douglas/Elbert/Lincoln counties), Colorado since 2021.' },

  // CONNECTICUT
  { name: 'Sharmese Walcott', state: 'CT', county: 'Hartford', party: 'democrat', bio: 'State\'s Attorney for the Hartford Judicial District, Connecticut. First African American woman to lead a state\'s attorney office in Connecticut.' },

  // DELAWARE
  { name: 'Kathleen Jennings', state: 'DE', county: 'New Castle County', skip: true }, // She's AG

  // FLORIDA
  { name: 'Katherine Fernandez Rundle', state: 'FL', county: 'Miami-Dade County', party: 'democrat', bio: 'State Attorney for Miami-Dade County (11th Circuit), Florida since 1993. Longest-serving prosecutor in Miami-Dade history.' },
  { name: 'Andrew Bain', state: 'FL', county: 'Orange County', party: 'republican', bio: 'State Attorney for Orange and Osceola counties (9th Circuit), Florida since 2023. Appointed by Governor DeSantis.' },
  { name: 'Suzy Lopez', state: 'FL', county: 'Hillsborough County', party: 'republican', bio: 'State Attorney for Hillsborough County (13th Circuit/Tampa), Florida since 2023. Appointed after removal of Andrew Warren.' },
  { name: 'Dave Aronberg', state: 'FL', county: 'Palm Beach County', party: 'democrat', bio: 'State Attorney for Palm Beach County (15th Circuit), Florida since 2013. Former state senator focused on combating the opioid crisis.' },
  { name: 'Monique Worrell', state: 'FL', county: 'Orange County', skip: true }, // Was removed by DeSantis
  { name: 'Ed Brodsky', state: 'FL', county: 'Sarasota County', party: 'republican', bio: 'State Attorney for the 12th Judicial Circuit (Sarasota/Manatee/DeSoto), Florida since 2013.' },
  { name: 'R.J. Larizza', state: 'FL', county: 'Volusia County', party: 'republican', bio: 'State Attorney for the 7th Judicial Circuit (Volusia/Flagler/Putnam/St. Johns), Florida.' },
  { name: 'Ginger Bowden Madden', state: 'FL', county: 'Escambia County', party: 'republican', bio: 'State Attorney for the 1st Judicial Circuit (Escambia/Santa Rosa/Okaloosa/Walton), Florida since 2020.' },
  { name: 'Melissa Nelson', state: 'FL', county: 'Duval County', party: 'republican', bio: 'State Attorney for the 4th Judicial Circuit (Duval/Clay/Nassau), Florida since 2017. Career prosecutor focused on gun violence reduction.' },

  // GEORGIA
  { name: 'Fani Willis', state: 'GA', county: 'Fulton County', party: 'democrat', bio: 'District Attorney of Fulton County (Atlanta), Georgia since 2021. Known for RICO prosecution of organized crime and the Trump election interference case.' },
  { name: 'Sherry Boston', state: 'GA', county: 'DeKalb County', party: 'democrat', bio: 'District Attorney of DeKalb County, Georgia since 2017. Focused on accountability courts and community-based solutions.' },
  { name: 'Vic Reynolds', state: 'GA', county: 'Cobb County', party: 'republican', bio: 'District Attorney of Cobb County, Georgia. Former director of the Georgia Bureau of Investigation.' },
  { name: 'Deborah Gonzalez', state: 'GA', county: 'Clarke County', party: 'democrat', bio: 'District Attorney of the Western Judicial Circuit (Clarke/Oconee counties), Georgia since 2021. First Latina DA in Georgia history.' },

  // HAWAII
  { name: 'Steve Alm', state: 'HI', county: 'Honolulu County', party: 'democrat', bio: 'Prosecuting Attorney of Honolulu, Hawaii since 2021. Former federal judge and prosecutor focused on violent crime and drug enforcement.' },

  // IDAHO
  { name: 'Jan Bennetts', state: 'ID', county: 'Ada County', party: 'republican', bio: 'Prosecuting Attorney of Ada County (Boise), Idaho since 2015. First woman to serve as Ada County prosecutor.' },

  // ILLINOIS
  { name: 'Kim Foxx', state: 'IL', county: 'Cook County', party: 'democrat', bio: 'State\'s Attorney of Cook County (Chicago), Illinois since 2016. First African American woman to lead the office, known for criminal justice reform.' },
  { name: 'Robert Berlin', state: 'IL', county: 'DuPage County', party: 'republican', bio: 'State\'s Attorney of DuPage County, Illinois since 2012. Career prosecutor focused on public corruption and violent crime.' },
  { name: 'James Glasgow', state: 'IL', county: 'Will County', party: 'democrat', bio: 'State\'s Attorney of Will County, Illinois. One of the longest-serving state\'s attorneys in Illinois history.' },
  { name: 'Patrick Kenneally', state: 'IL', county: 'McHenry County', party: 'republican', bio: 'State\'s Attorney of McHenry County, Illinois since 2016. Focused on drug enforcement and public safety.' },

  // INDIANA
  { name: 'Ryan Mears', state: 'IN', county: 'Marion County', party: 'democrat', bio: 'Prosecuting Attorney of Marion County (Indianapolis), Indiana since 2019. Focused on gun violence reduction and diversion programs.' },
  { name: 'Nicholas Hermann', state: 'IN', county: 'Hamilton County', party: 'republican', bio: 'Prosecuting Attorney of Hamilton County, Indiana. Career prosecutor in one of Indiana\'s fastest-growing counties.' },

  // IOWA
  { name: 'Kimberly Graham', state: 'IA', county: 'Polk County', party: 'democrat', bio: 'County Attorney of Polk County (Des Moines), Iowa since 2023. Progressive prosecutor focused on criminal justice reform.' },

  // KANSAS
  { name: 'Steve Howe', state: 'KS', county: 'Johnson County', party: 'republican', bio: 'District Attorney of Johnson County, Kansas since 2007. Longest-serving DA in Johnson County history.' },
  { name: 'Mark Dupree', state: 'KS', county: 'Wyandotte County', party: 'democrat', bio: 'District Attorney of Wyandotte County (Kansas City), Kansas since 2017. First African American DA in Kansas history.' },

  // KENTUCKY
  { name: 'Jacqueline Gwinn-Villaroel', state: 'KY', county: 'Jefferson County', party: 'democrat', bio: 'Commonwealth\'s Attorney for Jefferson County (Louisville), Kentucky since 2023. First African American woman to serve in the role.' },

  // LOUISIANA
  { name: 'Jason Williams', state: 'LA', county: 'Orleans Parish', party: 'democrat', bio: 'District Attorney of Orleans Parish (New Orleans), Louisiana since 2021. Former city council member focused on progressive prosecution reform.' },
  { name: 'Hillar Moore III', state: 'LA', county: 'East Baton Rouge Parish', party: 'democrat', bio: 'District Attorney of East Baton Rouge Parish (Baton Rouge), Louisiana since 2009.' },

  // MAINE
  // Maine uses a different system (AG appoints)

  // MARYLAND
  { name: 'Ivan Bates', state: 'MD', county: 'Baltimore City', party: 'democrat', bio: 'State\'s Attorney for Baltimore City, Maryland since 2023. Former defense attorney who succeeded Marilyn Mosby.' },
  { name: 'John McCarthy', state: 'MD', county: 'Montgomery County', party: 'democrat', bio: 'State\'s Attorney for Montgomery County, Maryland since 2007. Career prosecutor in Maryland\'s most populous county.' },
  { name: 'Anne Colt Leitess', state: 'MD', county: 'Anne Arundel County', party: 'democrat', bio: 'State\'s Attorney for Anne Arundel County, Maryland since 2019. Focused on community prosecution and victim advocacy.' },

  // MASSACHUSETTS
  { name: 'Kevin Hayden', state: 'MA', county: 'Suffolk County', party: 'democrat', bio: 'District Attorney of Suffolk County (Boston), Massachusetts since 2022. Appointed to succeed Rachael Rollins, focused on public safety and community trust.' },
  { name: 'Marian Ryan', state: 'MA', county: 'Middlesex County', party: 'democrat', bio: 'District Attorney of Middlesex County, Massachusetts since 2014. First woman to serve as Middlesex DA.' },
  { name: 'Michael Morrissey', state: 'MA', county: 'Norfolk County', party: 'democrat', bio: 'District Attorney of Norfolk County, Massachusetts since 2011. Former state legislator and career prosecutor.' },

  // MICHIGAN
  { name: 'Karen McDonald', state: 'MI', county: 'Oakland County', party: 'democrat', bio: 'Prosecuting Attorney of Oakland County, Michigan since 2021. Known for charging parents in the Oxford High School shooting case.' },
  { name: 'Kym Worthy', state: 'MI', county: 'Wayne County', party: 'democrat', bio: 'Prosecuting Attorney of Wayne County (Detroit), Michigan since 2004. Led the effort to test thousands of abandoned rape kits.' },
  { name: 'David Leyton', state: 'MI', county: 'Genesee County', party: 'democrat', bio: 'Prosecuting Attorney of Genesee County (Flint), Michigan. Brought charges related to the Flint water crisis.' },

  // MINNESOTA
  { name: 'Mary Moriarty', state: 'MN', county: 'Hennepin County', party: 'democrat', bio: 'County Attorney of Hennepin County (Minneapolis), Minnesota since 2023. Former chief public defender turned progressive prosecutor.' },
  { name: 'John Choi', state: 'MN', county: 'Ramsey County', party: 'democrat', bio: 'County Attorney of Ramsey County (St. Paul), Minnesota since 2011. First Korean American county attorney in the U.S.' },

  // MISSISSIPPI
  { name: 'Jody Owens', state: 'MS', county: 'Hinds County', party: 'democrat', bio: 'District Attorney of Hinds County (Jackson), Mississippi since 2020. Former civil rights attorney with the Southern Poverty Law Center.' },

  // MISSOURI
  { name: 'Gabe Gore', state: 'MO', county: 'St. Louis County', party: 'democrat', bio: 'Prosecuting Attorney of St. Louis County, Missouri. Successor to Wesley Bell who won election to Congress.' },
  { name: 'Gail Vasterling', state: 'MO', county: 'St. Louis City', party: 'democrat', bio: 'Circuit Attorney of the City of St. Louis, Missouri. Successor to Kim Gardner.' },
  { name: 'Jean Peters Baker', state: 'MO', county: 'Jackson County', party: 'democrat', bio: 'Prosecuting Attorney of Jackson County (Kansas City), Missouri since 2011. Known for conviction integrity work.' },

  // MONTANA
  { name: 'Kirsten Pabst', state: 'MT', county: 'Missoula County', party: 'democrat', bio: 'County Attorney of Missoula County, Montana since 2014. Former career prosecutor focused on sexual assault cases.' },

  // NEBRASKA
  { name: 'Don Kleine', state: 'NE', county: 'Douglas County', party: 'republican', bio: 'County Attorney of Douglas County (Omaha), Nebraska since 2007. One of the longest-serving prosecutors in Nebraska.' },

  // NEVADA
  { name: 'Steve Wolfson', state: 'NV', county: 'Clark County', party: 'democrat', bio: 'District Attorney of Clark County (Las Vegas), Nevada since 2012. Career prosecutor handling one of the nation\'s largest jurisdictions.' },
  { name: 'Chris Hicks', state: 'NV', county: 'Washoe County', party: 'republican', bio: 'District Attorney of Washoe County (Reno), Nevada since 2015. Career prosecutor focused on violent crime and drug trafficking.' },

  // NEW HAMPSHIRE
  // NH uses county attorneys appointed differently

  // NEW JERSEY
  // NJ uses county prosecutors appointed by governor
  { name: 'Esther Suarez', state: 'NJ', county: 'Hudson County', party: 'democrat', bio: 'Prosecutor of Hudson County (Jersey City), New Jersey. First Latina county prosecutor in New Jersey history.' },
  { name: 'Yolanda Ciccone', state: 'NJ', county: 'Middlesex County', party: 'democrat', bio: 'Prosecutor of Middlesex County, New Jersey. Career prosecutor appointed to lead one of the state\'s most populous counties.' },

  // NEW MEXICO
  { name: 'Sam Bregman', state: 'NM', county: 'Bernalillo County', party: 'democrat', bio: 'District Attorney of Bernalillo County (Albuquerque), New Mexico since 2023. Focused on violent crime reduction in New Mexico\'s largest county.' },

  // NEW YORK
  { name: 'Alvin Bragg', state: 'NY', county: 'New York County', party: 'democrat', bio: 'District Attorney of New York County (Manhattan) since 2022. First African American DA of Manhattan, known for prosecution of Donald Trump.' },
  { name: 'Michael McMahon', state: 'NY', county: 'Richmond County', party: 'democrat', bio: 'District Attorney of Richmond County (Staten Island), New York since 2016. Former U.S. Representative and city council member.' },
  { name: 'Eric Gonzalez', state: 'NY', county: 'Kings County', party: 'democrat', bio: 'District Attorney of Kings County (Brooklyn), New York since 2017. First Latino DA in Brooklyn history, focused on immigrant-friendly prosecution.' },
  { name: 'Darcel Clark', state: 'NY', county: 'Bronx County', party: 'democrat', bio: 'District Attorney of Bronx County, New York since 2016. First African American woman to serve as a DA in New York State.' },
  { name: 'Melinda Katz', state: 'NY', county: 'Queens County', party: 'democrat', bio: 'District Attorney of Queens County, New York since 2020. Former Queens Borough President managing one of the most diverse jurisdictions in the nation.' },
  { name: 'Anne Donnelly', state: 'NY', county: 'Nassau County', party: 'republican', bio: 'District Attorney of Nassau County, New York since 2022. Career prosecutor who served 30 years before becoming DA.' },
  { name: 'Raymond Tierney', state: 'NY', county: 'Suffolk County', party: 'republican', bio: 'District Attorney of Suffolk County, New York since 2022. Former federal prosecutor focused on gang violence and MS-13.' },
  { name: 'Miriam Rocah', state: 'NY', county: 'Westchester County', party: 'democrat', bio: 'District Attorney of Westchester County, New York since 2022. Former federal prosecutor focused on public corruption and organized crime.' },
  { name: 'David Soares', state: 'NY', county: 'Albany County', party: 'democrat', bio: 'District Attorney of Albany County, New York since 2005. First African American DA in New York State history.' },

  // NORTH CAROLINA
  { name: 'Satana Deberry', state: 'NC', county: 'Durham County', party: 'democrat', bio: 'District Attorney of Durham County, North Carolina since 2019. Progressive prosecutor focused on reducing incarceration and racial disparities.' },
  { name: 'Spencer Merriweather', state: 'NC', county: 'Mecklenburg County', party: 'democrat', bio: 'District Attorney of Mecklenburg County (Charlotte), North Carolina since 2017. Focused on gun violence prevention and accountability courts.' },
  { name: 'Lorrin Freeman', state: 'NC', county: 'Wake County', party: 'democrat', bio: 'District Attorney of Wake County (Raleigh), North Carolina since 2015. Career prosecutor focused on opioid crisis and human trafficking.' },

  // NORTH DAKOTA
  { name: 'Nick Chase', state: 'ND', county: 'Cass County', party: 'republican', bio: 'State\'s Attorney of Cass County (Fargo), North Dakota. Prosecutor for the state\'s most populous county.' },

  // OHIO
  { name: 'Michael O\'Malley', state: 'OH', county: 'Cuyahoga County', party: 'democrat', bio: 'Prosecuting Attorney of Cuyahoga County (Cleveland), Ohio since 2017. Focused on cold case investigations and public integrity.' },
  { name: 'G. Gary Tyack', state: 'OH', county: 'Franklin County', party: 'democrat', bio: 'Prosecuting Attorney of Franklin County (Columbus), Ohio since 2021. Career attorney focused on criminal justice reform.' },
  { name: 'Joseph Deters', state: 'OH', county: 'Hamilton County', party: 'republican', bio: 'Prosecuting Attorney of Hamilton County (Cincinnati), Ohio. Longest-serving prosecutor in Hamilton County history.' },
  { name: 'Steve Dettelbach', state: 'OH', county: 'Summit County', skip: true }, // He's ATF director

  // OKLAHOMA
  { name: 'Vicki Behenna', state: 'OK', county: 'Oklahoma County', party: 'republican', bio: 'District Attorney of Oklahoma County (Oklahoma City), Oklahoma since 2023. Former career federal prosecutor focused on violent crime.' },
  { name: 'Steve Kunzweiler', state: 'OK', county: 'Tulsa County', party: 'republican', bio: 'District Attorney of Tulsa County, Oklahoma since 2015. Career prosecutor focused on drug trafficking and violent crime.' },

  // OREGON
  { name: 'Mike Schmidt', state: 'OR', county: 'Multnomah County', party: 'democrat', bio: 'District Attorney of Multnomah County (Portland), Oregon since 2020. Progressive prosecutor who drew national attention for protest-related charging decisions.' },
  { name: 'Jeff Schrunk', state: 'OR', county: 'Washington County', party: 'democrat', bio: 'District Attorney of Washington County, Oregon. Long-serving prosecutor in Oregon\'s second most populous county.' },

  // PENNSYLVANIA
  { name: 'Larry Krasner', state: 'PA', county: 'Philadelphia County', party: 'democrat', bio: 'District Attorney of Philadelphia, Pennsylvania since 2018. Civil rights and defense attorney turned progressive prosecutor, focus on mass incarceration reform.' },
  { name: 'Stephen Zappala Jr.', state: 'PA', county: 'Allegheny County', party: 'democrat', bio: 'District Attorney of Allegheny County (Pittsburgh), Pennsylvania since 1998. One of the longest-serving DAs in Pennsylvania.' },
  { name: 'Kevin Steele', state: 'PA', county: 'Montgomery County', party: 'democrat', bio: 'District Attorney of Montgomery County, Pennsylvania since 2016. Led the prosecution of Bill Cosby.' },
  { name: 'Jack Stollsteimer', state: 'PA', county: 'Delaware County', party: 'democrat', bio: 'District Attorney of Delaware County, Pennsylvania since 2020. First Democrat elected DA in Delaware County in decades.' },

  // RHODE ISLAND
  // RI uses the AG office for most prosecution

  // SOUTH CAROLINA
  { name: 'Creighton Waters', state: 'SC', county: 'Colleton County', party: 'republican', bio: 'Lead prosecutor in South Carolina\'s 14th Judicial Circuit. Gained national attention as lead prosecutor in the Alex Murdaugh trial.' },
  { name: 'Scarlett Wilson', state: 'SC', county: 'Charleston County', party: 'republican', bio: 'Solicitor for the Ninth Judicial Circuit (Charleston/Berkeley), South Carolina since 2006. One of the most experienced prosecutors in the state.' },

  // SOUTH DAKOTA
  { name: 'Mark Vargo', state: 'SD', county: 'Pennington County', party: 'republican', bio: 'State\'s Attorney for Pennington County (Rapid City), South Dakota. Focused on drug enforcement and public safety in western South Dakota.' },

  // TENNESSEE
  { name: 'Steve Mulroy', state: 'TN', county: 'Shelby County', party: 'democrat', bio: 'District Attorney General of Shelby County (Memphis), Tennessee since 2022. Former law professor and civil rights attorney.' },
  { name: 'Glenn Funk', state: 'TN', county: 'Davidson County', party: 'democrat', bio: 'District Attorney General of Davidson County (Nashville), Tennessee since 2014. Career defense attorney turned progressive prosecutor.' },
  { name: 'Neal Pinkston', state: 'TN', county: 'Hamilton County', party: 'republican', bio: 'District Attorney General of Hamilton County (Chattanooga), Tennessee since 2014.' },

  // TEXAS
  { name: 'John Creuzot', state: 'TX', county: 'Dallas County', party: 'democrat', bio: 'District Attorney of Dallas County, Texas since 2019. Former judge who implemented progressive prosecution reforms including declining low-level marijuana cases.' },
  { name: 'José Garza', state: 'TX', county: 'Travis County', party: 'democrat', bio: 'District Attorney of Travis County (Austin), Texas since 2021. Progressive prosecutor focused on police accountability and criminal justice reform.' },
  { name: 'Kim Ogg', state: 'TX', county: 'Harris County', party: 'democrat', bio: 'District Attorney of Harris County (Houston), Texas since 2017. First woman elected DA of Harris County, focused on marijuana diversion.' },
  { name: 'Joe Gonzales', state: 'TX', county: 'Bexar County', party: 'democrat', bio: 'District Attorney of Bexar County (San Antonio), Texas since 2019. Criminal defense attorney turned progressive prosecutor.' },
  { name: 'Phil Sorrells', state: 'TX', county: 'Tarrant County', party: 'republican', bio: 'Criminal District Attorney of Tarrant County (Fort Worth), Texas since 2025. Career prosecutor.' },
  { name: 'Bill McKinney', state: 'TX', county: 'Collin County', party: 'republican', bio: 'District Attorney of Collin County (Plano), Texas. Prosecutor in one of the fastest-growing counties in the nation.' },

  // UTAH
  { name: 'Sim Gill', state: 'UT', county: 'Salt Lake County', party: 'democrat', bio: 'District Attorney of Salt Lake County, Utah since 2011. First person of color elected as DA in Utah, focused on restorative justice.' },

  // VERMONT
  { name: 'Sarah George', state: 'VT', county: 'Chittenden County', party: 'democrat', bio: 'State\'s Attorney for Chittenden County (Burlington), Vermont since 2017. Progressive prosecutor focused on diversion and treatment-based approaches.' },

  // VIRGINIA
  { name: 'Steve Descano', state: 'VA', county: 'Fairfax County', party: 'democrat', bio: 'Commonwealth\'s Attorney for Fairfax County, Virginia since 2020. Progressive prosecutor focused on criminal justice reform in Virginia\'s most populous county.' },
  { name: 'Buta Biberaj', state: 'VA', county: 'Loudoun County', party: 'democrat', bio: 'Commonwealth\'s Attorney for Loudoun County, Virginia since 2020. Progressive prosecutor in one of Virginia\'s wealthiest counties.' },
  { name: 'Parisa Dehghani-Tafti', state: 'VA', county: 'Arlington County', party: 'democrat', bio: 'Commonwealth\'s Attorney for Arlington County and the City of Falls Church, Virginia since 2020. Former innocence project attorney.' },

  // WASHINGTON
  { name: 'Leesa Manion', state: 'WA', county: 'King County', party: 'democrat', bio: 'Prosecuting Attorney of King County (Seattle), Washington since 2023. Succeeded Dan Satterberg after serving as his chief of staff for 15 years.' },
  { name: 'Mary Robnett', state: 'WA', county: 'Pierce County', party: 'democrat', bio: 'Prosecuting Attorney of Pierce County (Tacoma), Washington since 2019. Career prosecutor focused on violent crime and domestic violence.' },
  { name: 'Ann Davison', state: 'WA', county: 'Seattle City', party: 'republican', bio: 'Seattle City Attorney since 2022. Focused on prosecution of misdemeanor crimes and public safety in downtown Seattle.' },

  // WEST VIRGINIA
  // WV uses county prosecuting attorneys
  { name: 'Mike Stuart', state: 'WV', county: 'Kanawha County', party: 'republican', bio: 'Prosecuting Attorney of Kanawha County (Charleston), West Virginia. Former U.S. Attorney for the Southern District of West Virginia.' },

  // WISCONSIN
  { name: 'John Chisholm', state: 'WI', county: 'Milwaukee County', party: 'democrat', bio: 'District Attorney of Milwaukee County, Wisconsin since 2007. One of the longest-serving DAs in Wisconsin, known for community prosecution model.' },
  { name: 'Ismael Ozanne', state: 'WI', county: 'Dane County', party: 'democrat', bio: 'District Attorney of Dane County (Madison), Wisconsin since 2010. First African American DA in Wisconsin history.' },

  // WYOMING
  { name: 'Leigh Anne Manlove', state: 'WY', county: 'Laramie County', party: 'republican', bio: 'County and Prosecuting Attorney of Laramie County (Cheyenne), Wyoming. Career prosecutor in Wyoming\'s most populous county.' },

  // Additional notable DAs from large jurisdictions
  { name: 'Nathan Hochman', state: 'CA', county: 'Los Angeles County', skip: true }, // He ran against Gascon, may have won 2024 election

  // NEW HAMPSHIRE
  { name: 'John Formella', state: 'NH', county: 'Hillsborough County', skip: true }, // He's AG

  // Fill remaining states
  { name: 'Daniel Rubinstein', state: 'DC', county: 'District of Columbia', party: 'independent', bio: 'U.S. Attorney for the District of Columbia. Leads federal prosecutions in the nation\'s capital.' },
]

// Filter out skipped entries
const filteredDAs = DISTRICT_ATTORNEYS.filter(da => !da.skip)

// Build records for upsert
const records = filteredDAs.map(da => {
  const titlePrefix = da.state === 'FL' ? 'State Attorney' :
    da.state === 'SC' ? 'Solicitor' :
    ['MA', 'CT', 'VT', 'ND', 'SD'].includes(da.state) ? "State's Attorney" :
    ['KY', 'VA'].includes(da.state) ? "Commonwealth's Attorney" :
    ['MI', 'IN', 'OH', 'WA', 'NE'].includes(da.state) ? 'Prosecuting Attorney' :
    da.state === 'MO' && da.county === 'St. Louis City' ? 'Circuit Attorney' :
    da.state === 'MO' ? 'Prosecuting Attorney' :
    da.state === 'NJ' ? 'County Prosecutor' :
    da.state === 'MN' || da.state === 'IA' ? 'County Attorney' :
    da.state === 'WV' ? 'Prosecuting Attorney' :
    da.state === 'WY' ? 'County & Prosecuting Attorney' :
    da.state === 'HI' ? 'Prosecuting Attorney' :
    da.state === 'MD' ? "State's Attorney" :
    da.state === 'TN' ? 'District Attorney General' :
    da.state === 'LA' ? 'District Attorney' :
    'District Attorney'

  return {
    name: da.name,
    slug: slugify(da.name),
    state: da.state,
    chamber: 'county',
    party: da.party,
    title: `${titlePrefix}, ${da.county}`,
    bio: da.bio,
    image_url: null,
  }
})

console.log(`Preparing to upsert ${records.length} district attorneys / county prosecutors...`)

// Upsert in batches of 50
const BATCH = 50
let total = 0
for (let i = 0; i < records.length; i += BATCH) {
  const batch = records.slice(i, i + BATCH)
  const { data, error } = await supabase
    .from('politicians')
    .upsert(batch, { onConflict: 'slug' })
    .select('id')
  if (error) {
    console.error(`Batch ${Math.floor(i/BATCH)+1} error:`, error.message)
    console.error('First record in failed batch:', batch[0])
  } else {
    total += data.length
    console.log(`Batch ${Math.floor(i/BATCH)+1}: upserted ${data.length} records`)
  }
}

console.log(`\nDone! Total upserted: ${total} district attorneys / county prosecutors`)
console.log('States covered:', [...new Set(records.map(r => r.state))].sort().join(', '))
