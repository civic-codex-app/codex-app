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

// ─── STATE SENATORS ─────────────────────────────────────────────
const STATE_SENATORS = [
  // New York
  { name: 'Andrea Stewart-Cousins', state: 'NY', party: 'democrat', bio: 'Majority Leader of the New York State Senate, representing the 35th district since 2007. The first woman and first African American to lead the chamber.' },
  { name: 'Robert Ortt', state: 'NY', party: 'republican', bio: 'Minority Leader of the New York State Senate, representing the 62nd district. Former mayor of North Tonawanda and Army veteran.' },

  // California
  { name: 'Scott Wiener', state: 'CA', party: 'democrat', bio: 'California State Senator representing District 11 (San Francisco). Known for housing, transit, and technology legislation.' },
  { name: 'Anna Caballero', state: 'CA', party: 'democrat', bio: 'California State Senator representing District 14 in the Central Valley. Focuses on agriculture, water, and rural economic development.' },
  { name: 'Brian Jones', state: 'CA', party: 'republican', bio: 'Minority Leader of the California State Senate representing District 40. Advocates for tax relief and public safety.' },

  // Texas
  { name: 'Royce West', state: 'TX', party: 'democrat', bio: 'Texas State Senator representing District 23 (Dallas) since 1993. Dean of the Texas Senate and advocate for education and criminal justice reform.' },
  { name: 'Bryan Hughes', state: 'TX', party: 'republican', bio: 'Texas State Senator representing District 1. President Pro Tempore of the Texas Senate, known for election integrity and religious liberty legislation.' },
  { name: 'Joan Huffman', state: 'TX', party: 'republican', bio: 'Texas State Senator representing District 17 (Houston). Chair of the Redistricting Committee and former judge.' },

  // Florida
  { name: 'Jason Pizzo', state: 'FL', party: 'democrat', bio: 'Florida State Senator representing District 37 (Miami-Dade). Former prosecutor focused on public safety and consumer protection.' },
  { name: 'Kathleen Passidomo', state: 'FL', party: 'republican', bio: 'President of the Florida Senate representing District 28 (Naples). First woman to serve as Florida Senate President.' },

  // Michigan
  { name: 'Mallory McMorrow', state: 'MI', party: 'democrat', bio: 'Michigan State Senator representing District 8 (Royal Oak). Known for viral speeches on education, LGBTQ rights, and child welfare.' },
  { name: 'Winnie Brinks', state: 'MI', party: 'democrat', bio: 'Majority Leader of the Michigan State Senate representing District 29 (Grand Rapids). First woman to lead the Michigan Senate.' },

  // Illinois
  { name: 'Don Harmon', state: 'IL', party: 'democrat', bio: 'President of the Illinois State Senate representing District 39 (Oak Park). Leads the Democratic supermajority in the chamber.' },
  { name: 'John Curran', state: 'IL', party: 'republican', bio: 'Minority Leader of the Illinois State Senate representing District 41 (DuPage County). Former DuPage County State\'s Attorney.' },

  // Pennsylvania
  { name: 'Kim Ward', state: 'PA', party: 'republican', bio: 'President Pro Tempore of the Pennsylvania State Senate representing District 39. First woman to hold the position in Pennsylvania history.' },
  { name: 'Jay Costa', state: 'PA', party: 'democrat', bio: 'Minority Leader of the Pennsylvania State Senate representing District 43 (Allegheny County). Veteran legislator focused on education funding.' },

  // Ohio
  { name: 'Matt Huffman', state: 'OH', party: 'republican', bio: 'President of the Ohio State Senate representing District 12 (Lima). Focuses on fiscal policy and education reform.' },
  { name: 'Nickie Antonio', state: 'OH', party: 'democrat', bio: 'Minority Leader of the Ohio State Senate representing District 23 (Lakewood). First openly LGBTQ leader of a legislative caucus in Ohio.' },

  // Georgia
  { name: 'John Kennedy', state: 'GA', party: 'republican', bio: 'President Pro Tempore of the Georgia State Senate representing District 18 (Macon). Longtime leader in the chamber focused on economic development.' },
  { name: 'Gloria Butler', state: 'GA', party: 'democrat', bio: 'Minority Leader of the Georgia State Senate representing District 55 (Stone Mountain). Longtime advocate for education and healthcare.' },

  // North Carolina
  { name: 'Phil Berger', state: 'NC', party: 'republican', bio: 'President Pro Tempore of the North Carolina State Senate representing District 26 (Rockingham County). Longest-serving Senate leader in state history.' },
  { name: 'Dan Blue', state: 'NC', party: 'democrat', bio: 'Minority Leader of the North Carolina State Senate representing District 14 (Raleigh). Former Speaker of the NC House and veteran legislator.' },

  // Arizona
  { name: 'Warren Petersen', state: 'AZ', party: 'republican', bio: 'President of the Arizona State Senate representing District 14. Focuses on tax policy and government accountability.' },

  // Colorado
  { name: 'James Coleman', state: 'CO', party: 'democrat', bio: 'President of the Colorado State Senate representing District 33 (Denver). First African American to serve as Colorado Senate President.' },

  // Washington
  { name: 'Andy Billig', state: 'WA', party: 'democrat', bio: 'Majority Leader of the Washington State Senate representing the 3rd district (Spokane). Businessman and community leader.' },
]

// ─── STATE HOUSE REPRESENTATIVES ────────────────────────────────
const STATE_HOUSE_REPS = [
  // New York
  { name: 'Carl Heastie', state: 'NY', party: 'democrat', bio: 'Speaker of the New York State Assembly since 2015, representing the 83rd district (Bronx). First African American to serve as Assembly Speaker.' },
  { name: 'William Barclay', state: 'NY', party: 'republican', bio: 'Minority Leader of the New York State Assembly representing the 120th district (Oswego County). Leads the Republican conference in the chamber.' },

  // California
  { name: 'Robert Rivas', state: 'CA', party: 'democrat', bio: 'Speaker of the California State Assembly representing District 29 (Salinas). First Latino Speaker in over 25 years, focused on farmworker and environmental issues.' },
  { name: 'James Gallagher', state: 'CA', party: 'republican', bio: 'Minority Leader of the California State Assembly representing District 3 (Yuba City). Focuses on wildfire prevention and water policy.' },

  // Texas
  { name: 'Dade Phelan', state: 'TX', party: 'republican', bio: 'Speaker of the Texas House of Representatives representing District 21 (Beaumont). Leads the 150-member lower chamber.' },
  { name: 'Trey Martinez Fischer', state: 'TX', party: 'democrat', bio: 'Texas State Representative for District 116 (San Antonio). Chair of the Mexican American Legislative Caucus and veteran legislator.' },

  // Florida
  { name: 'Daniel Perez', state: 'FL', party: 'republican', bio: 'Speaker of the Florida House of Representatives representing District 116 (Miami). Leads the chamber with focus on fiscal conservatism.' },
  { name: 'Fentrice Driskell', state: 'FL', party: 'democrat', bio: 'Minority Leader of the Florida House representing District 67 (Tampa). First African American woman to lead a caucus in the Florida Legislature.' },

  // Illinois
  { name: 'Emanuel Chris Welch', state: 'IL', party: 'democrat', bio: 'Speaker of the Illinois House of Representatives representing District 7 (Hillside). First African American to serve as Illinois House Speaker.' },
  { name: 'Tony McCombie', state: 'IL', party: 'republican', bio: 'Minority Leader of the Illinois House representing District 89 (Savanna). First woman to lead the House Republican caucus.' },

  // Pennsylvania
  { name: 'Joanna McClinton', state: 'PA', party: 'democrat', bio: 'Speaker of the Pennsylvania House of Representatives representing District 191 (Philadelphia). First woman and first African American to serve as Speaker.' },
  { name: 'Bryan Cutler', state: 'PA', party: 'republican', bio: 'Minority Leader of the Pennsylvania House representing District 100 (Lancaster County). Former Speaker focused on government reform.' },

  // Ohio
  { name: 'Jason Stephens', state: 'OH', party: 'republican', bio: 'Speaker of the Ohio House of Representatives representing District 93. Elected Speaker with bipartisan support.' },
  { name: 'Allison Russo', state: 'OH', party: 'democrat', bio: 'Minority Leader of the Ohio House representing District 10 (Upper Arlington). Healthcare policy expert and former health policy researcher.' },

  // Michigan
  { name: 'Joe Tate', state: 'MI', party: 'democrat', bio: 'Speaker of the Michigan House of Representatives representing District 10 (Detroit). First African American to serve as Michigan House Speaker.' },

  // Georgia
  { name: 'Jon Burns', state: 'GA', party: 'republican', bio: 'Speaker of the Georgia House of Representatives representing District 159 (Newington). Longtime legislator and agricultural leader.' },
  { name: 'James Beverly', state: 'GA', party: 'democrat', bio: 'Minority Leader of the Georgia House representing District 143 (Macon). Advocate for education and economic opportunity.' },

  // North Carolina
  { name: 'Tim Moore', state: 'NC', party: 'republican', bio: 'Speaker of the North Carolina House of Representatives representing District 111 (Kings Mountain). Longest-serving Speaker in state history.' },
  { name: 'Robert Reives', state: 'NC', party: 'democrat', bio: 'Minority Leader of the North Carolina House representing District 54 (Chatham County). Attorney focused on bipartisan cooperation.' },

  // Arizona
  { name: 'Ben Toma', state: 'AZ', party: 'republican', bio: 'Speaker of the Arizona House of Representatives representing District 27. Focuses on regulatory reform and government transparency.' },

  // Colorado
  { name: 'Julie McCluskie', state: 'CO', party: 'democrat', bio: 'Speaker of the Colorado House of Representatives representing District 13 (Dillon). First woman from the Western Slope to serve as Speaker.' },

  // Washington
  { name: 'Laurie Jinkins', state: 'WA', party: 'democrat', bio: 'Speaker of the Washington State House representing District 27 (Tacoma). First openly LGBTQ Speaker in Washington history.' },

  // Massachusetts
  { name: 'Ronald Mariano', state: 'MA', party: 'democrat', bio: 'Speaker of the Massachusetts House of Representatives representing the 3rd Norfolk district (Quincy). Veteran legislator focused on healthcare and labor.' },

  // New Jersey
  { name: 'Craig Coughlin', state: 'NJ', party: 'democrat', bio: 'Speaker of the New Jersey General Assembly representing District 19 (Woodbridge). Attorney focused on middle-class economic issues.' },

  // Wisconsin
  { name: 'Robin Vos', state: 'WI', party: 'republican', bio: 'Speaker of the Wisconsin State Assembly representing District 63 (Rochester). Longest-serving Speaker in Wisconsin history.' },
]

// Build the full records
const allOfficials = [
  ...STATE_SENATORS.map(s => ({
    name: s.name,
    slug: slugify(s.name),
    state: s.state,
    chamber: 'state_senate',
    party: s.party,
    title: `State Senator, ${s.state}`,
    bio: s.bio,
    image_url: null,
  })),
  ...STATE_HOUSE_REPS.map(r => ({
    name: r.name,
    slug: slugify(r.name),
    state: r.state,
    chamber: 'state_house',
    party: r.party,
    title: `State Representative, ${r.state}`,
    bio: r.bio,
    image_url: null,
  })),
]

console.log(`\nSeeding ${allOfficials.length} state legislators (${STATE_SENATORS.length} senators, ${STATE_HOUSE_REPS.length} house reps)...\n`)

const { data, error } = await supabase
  .from('politicians')
  .upsert(allOfficials, { onConflict: 'slug' })
  .select('name, slug, chamber')

if (error) {
  console.error('Error upserting:', error.message)
  process.exit(1)
}

console.log(`Successfully upserted ${data.length} state legislators:`)
console.log(`  State Senate: ${data.filter(d => d.chamber === 'state_senate').length}`)
console.log(`  State House:  ${data.filter(d => d.chamber === 'state_house').length}`)
console.log('\nDone!')
