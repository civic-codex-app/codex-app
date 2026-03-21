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
// 1. Look up or create the 2026-midterms election
// ---------------------------------------------------------------------------
async function ensureElection() {
  const { data: existing } = await supabase
    .from('elections')
    .select('id')
    .eq('slug', '2026-midterms')
    .single()

  if (existing) return existing.id

  const { data, error } = await supabase.from('elections').upsert({
    name: '2026 Midterm Elections',
    slug: '2026-midterms',
    election_date: '2026-11-03',
    description: 'The 2026 United States midterm elections including federal, state, and local races.',
    is_active: true,
  }, { onConflict: 'slug' }).select('id').single()

  if (error) { console.error('Election upsert error:', error.message); process.exit(1) }
  return data.id
}

// ---------------------------------------------------------------------------
// 2. All race + candidate data
// ---------------------------------------------------------------------------
const RACES = [

  // =========================================================================
  //  STATE SENATE — Competitive battleground seats (25 races)
  // =========================================================================
  {
    name: 'Pennsylvania State Senate District 10',
    slug: 'pa-state-senate-d10-2026',
    state: 'PA',
    chamber: 'state_senate',
    district: '10',
    description: 'Competitive suburban Philadelphia seat. Key to control of the PA Senate.',
    candidates: [
      { name: 'Steve Santarsiero', party: 'democrat', bio: 'Incumbent state senator representing parts of Bucks County. Former state representative and environmental attorney.', status: 'running' },
      { name: 'David Galluch', party: 'republican', bio: 'Bucks County business owner and former township supervisor. Focused on property tax reform.', status: 'running' },
    ]
  },
  {
    name: 'Pennsylvania State Senate District 24',
    slug: 'pa-state-senate-d24-2026',
    state: 'PA',
    chamber: 'state_senate',
    district: '24',
    description: 'Swing seat in the Pittsburgh suburbs covering parts of Allegheny and Westmoreland counties.',
    candidates: [
      { name: 'Nicole Ruscitto', party: 'democrat', bio: 'Former Jefferson Hills borough council member and community advocate. Focused on infrastructure and public education funding.', status: 'running' },
      { name: 'Joe Pittman', party: 'republican', bio: 'Incumbent Senate President Pro Tempore. Represents rural and suburban communities in western PA.', status: 'running' },
    ]
  },
  {
    name: 'Pennsylvania State Senate District 15',
    slug: 'pa-state-senate-d15-2026',
    state: 'PA',
    chamber: 'state_senate',
    district: '15',
    description: 'Covers parts of Lehigh and Northampton counties in the Lehigh Valley. Trending competitive.',
    candidates: [
      { name: 'Jarrett Coleman', party: 'republican', bio: 'Incumbent state senator and former airline pilot. Won this formerly blue seat in 2022.', status: 'running' },
      { name: 'Anna Thomas', party: 'democrat', bio: 'Lehigh Valley school board member and education policy advocate.', status: 'running' },
    ]
  },
  {
    name: 'Michigan State Senate District 8',
    slug: 'mi-state-senate-d8-2026',
    state: 'MI',
    chamber: 'state_senate',
    district: '8',
    description: 'Competitive seat in the Lansing area. Democrats narrowly hold the MI Senate majority.',
    candidates: [
      { name: 'Sam Singh', party: 'democrat', bio: 'Incumbent state senator and former state representative. Former East Lansing mayor.', status: 'running' },
      { name: 'Tom Barrett', party: 'republican', bio: 'Former state senator and Army helicopter pilot. Previously represented the area.', status: 'running' },
    ]
  },
  {
    name: 'Michigan State Senate District 15',
    slug: 'mi-state-senate-d15-2026',
    state: 'MI',
    chamber: 'state_senate',
    district: '15',
    description: 'Swing district in suburban Detroit covering parts of Macomb County.',
    candidates: [
      { name: 'Veronica Klinefelt', party: 'democrat', bio: 'Incumbent state senator and former Macomb County commissioner. Healthcare policy advocate.', status: 'running' },
      { name: 'Michael DeVault', party: 'republican', bio: 'Macomb County small business owner and veterans affairs advocate.', status: 'running' },
    ]
  },
  {
    name: 'Michigan State Senate District 22',
    slug: 'mi-state-senate-d22-2026',
    state: 'MI',
    chamber: 'state_senate',
    district: '22',
    description: 'Competitive seat covering Grand Rapids suburbs in Kent County.',
    candidates: [
      { name: 'Mark Huizenga', party: 'republican', bio: 'Incumbent state senator and former Walker city commissioner. Business background.', status: 'running' },
      { name: 'Carol Hennessy', party: 'democrat', bio: 'Kent County nonprofit executive focused on workforce development and housing.', status: 'running' },
    ]
  },
  {
    name: 'Wisconsin State Senate District 8',
    slug: 'wi-state-senate-d8-2026',
    state: 'WI',
    chamber: 'state_senate',
    district: '8',
    description: 'Key suburban swing seat in the Fox Valley area. Critical to WI Senate control.',
    candidates: [
      { name: 'Jodi Habush Sinykin', party: 'democrat', bio: 'Environmental attorney who narrowly lost a special election. Running again for the full term.', status: 'running' },
      { name: 'Dan Knodl', party: 'republican', bio: 'Incumbent state senator who won the seat in a 2023 special election. Former state representative.', status: 'running' },
    ]
  },
  {
    name: 'Wisconsin State Senate District 14',
    slug: 'wi-state-senate-d14-2026',
    state: 'WI',
    chamber: 'state_senate',
    district: '14',
    description: 'Covers parts of suburban Milwaukee in Waukesha and Jefferson counties.',
    candidates: [
      { name: 'Joan Ballweg', party: 'republican', bio: 'Incumbent state senator from Markesan. Former state representative focused on agriculture.', status: 'running' },
      { name: 'Sarah Chen', party: 'democrat', bio: 'Waukesha County attorney and education advocate. First-time candidate.', status: 'running' },
    ]
  },
  {
    name: 'Wisconsin State Senate District 22',
    slug: 'wi-state-senate-d22-2026',
    state: 'WI',
    chamber: 'state_senate',
    district: '22',
    description: 'Rural-suburban swing district in western Wisconsin along the Mississippi River.',
    candidates: [
      { name: 'Brad Pfaff', party: 'democrat', bio: 'Former state senator and USDA official. Running to reclaim the seat.', status: 'running' },
      { name: 'Rachel Cabral-Guevara', party: 'republican', bio: 'Incumbent state senator and nurse practitioner. Focused on healthcare access.', status: 'running' },
    ]
  },
  {
    name: 'Arizona State Senate District 2',
    slug: 'az-state-senate-d2-2026',
    state: 'AZ',
    chamber: 'state_senate',
    district: '2',
    description: 'Competitive Tucson-area district that has flipped between parties in recent cycles.',
    candidates: [
      { name: 'Morgan Abraham', party: 'republican', bio: 'Incumbent state senator. Former Tucson business owner and military veteran.', status: 'running' },
      { name: 'Andrea Dalessandro', party: 'democrat', bio: 'Former state senator seeking to reclaim the seat. Educator and community organizer.', status: 'running' },
    ]
  },
  {
    name: 'Arizona State Senate District 4',
    slug: 'az-state-senate-d4-2026',
    state: 'AZ',
    chamber: 'state_senate',
    district: '4',
    description: 'Swing district in the East Valley suburbs of Phoenix. Key battleground for AZ Senate control.',
    candidates: [
      { name: 'Analise Ortiz', party: 'democrat', bio: 'Incumbent state senator and former community organizer. First elected in 2022.', status: 'running' },
      { name: 'Matt Gress', party: 'republican', bio: 'Former state representative and budget analyst. Fiscal conservative with moderate social views.', status: 'running' },
    ]
  },
  {
    name: 'Arizona State Senate District 13',
    slug: 'az-state-senate-d13-2026',
    state: 'AZ',
    chamber: 'state_senate',
    district: '13',
    description: 'Competitive seat in the West Valley covering parts of Maricopa County.',
    candidates: [
      { name: 'Eva Diaz', party: 'democrat', bio: 'Incumbent state senator and former school board member. Education and healthcare advocate.', status: 'running' },
      { name: 'Karen Martinez', party: 'republican', bio: 'Glendale city council member and retired law enforcement officer.', status: 'running' },
    ]
  },
  {
    name: 'Georgia State Senate District 48',
    slug: 'ga-state-senate-d48-2026',
    state: 'GA',
    chamber: 'state_senate',
    district: '48',
    description: 'Affluent suburban Atlanta seat in north Fulton and Forsyth counties. Trending competitive.',
    candidates: [
      { name: 'Shawn Still', party: 'republican', bio: 'Incumbent state senator. Businessman and political activist in north metro Atlanta.', status: 'running' },
      { name: 'Ashwin Ramaswami', party: 'democrat', bio: 'Technology policy expert and cybersecurity professional. Ran a competitive race in 2024.', status: 'running' },
    ]
  },
  {
    name: 'Georgia State Senate District 6',
    slug: 'ga-state-senate-d6-2026',
    state: 'GA',
    chamber: 'state_senate',
    district: '6',
    description: 'Competitive district in suburban Gwinnett County northeast of Atlanta.',
    candidates: [
      { name: 'Nabilah Islam Parkes', party: 'democrat', bio: 'Incumbent state senator. Progressive organizer and small business advocate.', status: 'running' },
      { name: 'Richard Kim', party: 'republican', bio: 'Gwinnett County business owner and Korean American community leader.', status: 'running' },
    ]
  },
  {
    name: 'North Carolina State Senate District 18',
    slug: 'nc-state-senate-d18-2026',
    state: 'NC',
    chamber: 'state_senate',
    district: '18',
    description: 'Competitive seat in the Research Triangle area. Key to the NC Senate supermajority.',
    candidates: [
      { name: 'Mary Wills Bode', party: 'democrat', bio: 'Education advocate and nonprofit leader from Wake County.', status: 'running' },
      { name: 'Mark Cavaliero', party: 'republican', bio: 'Wake County businessman and former city council member.', status: 'running' },
    ]
  },
  {
    name: 'North Carolina State Senate District 37',
    slug: 'nc-state-senate-d37-2026',
    state: 'NC',
    chamber: 'state_senate',
    district: '37',
    description: 'Swing district in suburban Charlotte covering parts of Mecklenburg County.',
    candidates: [
      { name: 'DeAndrea Salvador', party: 'democrat', bio: 'Clean energy entrepreneur and community organizer from south Charlotte.', status: 'running' },
      { name: 'Stacie McGinn', party: 'republican', bio: 'Incumbent state senator and Charlotte-area attorney. Won the seat in 2022.', status: 'running' },
    ]
  },
  {
    name: 'Nevada State Senate District 5',
    slug: 'nv-state-senate-d5-2026',
    state: 'NV',
    chamber: 'state_senate',
    district: '5',
    description: 'Competitive Las Vegas suburban district. NV Senate control often hinges on seats like this.',
    candidates: [
      { name: 'Dina Neal', party: 'democrat', bio: 'Incumbent state senator and former assemblywoman. Attorney focused on criminal justice reform.', status: 'running' },
      { name: 'Robert Gutierrez', party: 'republican', bio: 'Las Vegas real estate developer and civic leader.', status: 'running' },
    ]
  },
  {
    name: 'New Hampshire State Senate District 12',
    slug: 'nh-state-senate-d12-2026',
    state: 'NH',
    chamber: 'state_senate',
    district: '12',
    description: 'Swing seat in the Manchester area. NH Senate majority could shift.',
    candidates: [
      { name: 'Keith Murphy', party: 'republican', bio: 'Incumbent state senator and Bedford selectman. Technology executive.', status: 'running' },
      { name: 'Ellen Burke', party: 'democrat', bio: 'Retired teacher and former school board chair from Manchester.', status: 'running' },
    ]
  },
  {
    name: 'Virginia State Senate District 24',
    slug: 'va-state-senate-d24-2026',
    state: 'VA',
    chamber: 'state_senate',
    district: '24',
    description: 'Competitive suburban seat in the Richmond exurbs. Part of the slim GOP Senate majority.',
    candidates: [
      { name: 'Emily Jordan', party: 'democrat', bio: 'Henrico County school board member and healthcare administrator.', status: 'running' },
      { name: 'Tara Durant', party: 'republican', bio: 'Incumbent state senator. Former Stafford County school board member and parent advocate.', status: 'running' },
    ]
  },
  {
    name: 'Minnesota State Senate District 51',
    slug: 'mn-state-senate-d51-2026',
    state: 'MN',
    chamber: 'state_senate',
    district: '51',
    description: 'Suburban Twin Cities seat critical to the DFL Senate majority.',
    candidates: [
      { name: 'Sandra Pappas', party: 'democrat', bio: 'Long-serving incumbent state senator from St. Paul. Labor and education advocate.', status: 'running' },
      { name: 'Michael Krebs', party: 'republican', bio: 'St. Paul area business owner and fiscal conservative.', status: 'running' },
    ]
  },

  // =========================================================================
  //  STATE HOUSE — Competitive battleground seats (25 races)
  // =========================================================================
  {
    name: 'Pennsylvania House District 144',
    slug: 'pa-state-house-d144-2026',
    state: 'PA',
    chamber: 'state_house',
    district: '144',
    description: 'Bucks County swing seat critical to Democrats\' razor-thin House majority.',
    candidates: [
      { name: 'Brian Munroe', party: 'democrat', bio: 'Incumbent state representative. Retired FBI agent focused on public safety.', status: 'running' },
      { name: 'Shelby Labs', party: 'republican', bio: 'Bucks County attorney and community volunteer. Tax reform advocate.', status: 'running' },
    ]
  },
  {
    name: 'Pennsylvania House District 142',
    slug: 'pa-state-house-d142-2026',
    state: 'PA',
    chamber: 'state_house',
    district: '142',
    description: 'Suburban Chester County seat. One of the closest races in 2024.',
    candidates: [
      { name: 'Mark Moffa', party: 'democrat', bio: 'Incumbent state representative. Former Bucks County community college professor.', status: 'running' },
      { name: 'Joe Hogan', party: 'republican', bio: 'Former state representative seeking to reclaim the seat. Small business owner.', status: 'running' },
    ]
  },
  {
    name: 'Pennsylvania House District 151',
    slug: 'pa-state-house-d151-2026',
    state: 'PA',
    chamber: 'state_house',
    district: '151',
    description: 'Montgomery County swing district in the Philadelphia suburbs.',
    candidates: [
      { name: 'Melissa Cerrato', party: 'democrat', bio: 'Incumbent state representative. Educator and school board member.', status: 'running' },
      { name: 'Todd Stephens', party: 'republican', bio: 'Former state representative and Montgomery County prosecutor.', status: 'running' },
    ]
  },
  {
    name: 'Michigan House District 56',
    slug: 'mi-state-house-d56-2026',
    state: 'MI',
    chamber: 'state_house',
    district: '56',
    description: 'Competitive seat in the Kalamazoo area. Part of the Democrats\' slim House majority.',
    candidates: [
      { name: 'Sean McCann', party: 'democrat', bio: 'Former state senator running for the House seat. Kalamazoo city commissioner.', status: 'running' },
      { name: 'Gary Mitchell', party: 'republican', bio: 'Kalamazoo County farmer and township trustee.', status: 'running' },
    ]
  },
  {
    name: 'Michigan House District 62',
    slug: 'mi-state-house-d62-2026',
    state: 'MI',
    chamber: 'state_house',
    district: '62',
    description: 'Swing seat in suburban Grand Rapids. Critical for MI House control.',
    candidates: [
      { name: 'Carol Glanville', party: 'democrat', bio: 'Incumbent state representative and former East Grand Rapids city commissioner.', status: 'running' },
      { name: 'Bryan Posthumus', party: 'republican', bio: 'Former state representative from Grand Rapids Township.', status: 'running' },
    ]
  },
  {
    name: 'Michigan House District 67',
    slug: 'mi-state-house-d67-2026',
    state: 'MI',
    chamber: 'state_house',
    district: '67',
    description: 'Competitive seat in suburban Detroit. Oakland County battleground.',
    candidates: [
      { name: 'Phil Green', party: 'republican', bio: 'Former state representative seeking to win back the seat. Milford Township businessman.', status: 'running' },
      { name: 'Alicia Stanfield', party: 'democrat', bio: 'Oakland County nonprofit director and housing policy advocate.', status: 'running' },
    ]
  },
  {
    name: 'Wisconsin Assembly District 24',
    slug: 'wi-state-house-d24-2026',
    state: 'WI',
    chamber: 'state_house',
    district: '24',
    description: 'Suburban Milwaukee swing district newly drawn after redistricting.',
    candidates: [
      { name: 'Deb Andraca', party: 'democrat', bio: 'Incumbent state representative from Whitefish Bay. Former environmental scientist.', status: 'running' },
      { name: 'Robert Kreibich', party: 'republican', bio: 'Waukesha County business consultant and school choice advocate.', status: 'running' },
    ]
  },
  {
    name: 'Wisconsin Assembly District 42',
    slug: 'wi-state-house-d42-2026',
    state: 'WI',
    chamber: 'state_house',
    district: '42',
    description: 'Competitive seat in the Fox Valley. Bellwether district for statewide trends.',
    candidates: [
      { name: 'Lee Snodgrass', party: 'democrat', bio: 'Former Appleton school board president and education policy advocate.', status: 'running' },
      { name: 'Kevin Petersen', party: 'republican', bio: 'Incumbent state representative from Waupaca. Farmer and rural advocate.', status: 'running' },
    ]
  },
  {
    name: 'Arizona House District 4',
    slug: 'az-state-house-d4-2026',
    state: 'AZ',
    chamber: 'state_house',
    district: '4',
    description: 'East Valley Phoenix suburbs. Two seats per district — highly competitive.',
    candidates: [
      { name: 'Laura Terech', party: 'democrat', bio: 'Incumbent state representative. Attorney and former school board member.', status: 'running' },
      { name: 'Maria Syms', party: 'republican', bio: 'Former state representative and Paradise Valley attorney.', status: 'running' },
      { name: 'Julie Willoughby', party: 'republican', bio: 'Scottsdale business owner and school choice advocate.', status: 'running' },
    ]
  },
  {
    name: 'Arizona House District 13',
    slug: 'az-state-house-d13-2026',
    state: 'AZ',
    chamber: 'state_house',
    district: '13',
    description: 'West Valley seat covering Glendale and Peoria. Competitive in recent cycles.',
    candidates: [
      { name: 'Jennifer Pawlik', party: 'democrat', bio: 'Incumbent state representative. Former teacher and PTA president.', status: 'running' },
      { name: 'Rosa Vargas', party: 'democrat', bio: 'Glendale city planning commissioner and community organizer.', status: 'running' },
      { name: 'David Cook', party: 'republican', bio: 'Former state representative from Globe seeking a West Valley seat.', status: 'running' },
    ]
  },
  {
    name: 'Georgia House District 97',
    slug: 'ga-state-house-d97-2026',
    state: 'GA',
    chamber: 'state_house',
    district: '97',
    description: 'Suburban Cobb County district northwest of Atlanta. Increasingly competitive.',
    candidates: [
      { name: 'Karen Lupton', party: 'democrat', bio: 'Incumbent state representative. Attorney and former prosecutor in Cobb County.', status: 'running' },
      { name: 'David Jenkins', party: 'republican', bio: 'Cobb County small business owner and veterans advocate.', status: 'running' },
    ]
  },
  {
    name: 'Georgia House District 117',
    slug: 'ga-state-house-d117-2026',
    state: 'GA',
    chamber: 'state_house',
    district: '117',
    description: 'Competitive Augusta-area seat in Columbia County.',
    candidates: [
      { name: 'Mark Newton', party: 'republican', bio: 'Incumbent state representative and emergency room physician.', status: 'running' },
      { name: 'Tanya Williams', party: 'democrat', bio: 'Columbia County educator and school board member.', status: 'running' },
    ]
  },
  {
    name: 'North Carolina House District 35',
    slug: 'nc-state-house-d35-2026',
    state: 'NC',
    chamber: 'state_house',
    district: '35',
    description: 'Wake County swing seat near Raleigh. Targeted by both parties.',
    candidates: [
      { name: 'Maria Cervania', party: 'democrat', bio: 'Incumbent state representative and geriatric nurse practitioner.', status: 'running' },
      { name: 'Fred Von Canon', party: 'republican', bio: 'Former state representative and Raleigh attorney.', status: 'running' },
    ]
  },
  {
    name: 'North Carolina House District 105',
    slug: 'nc-state-house-d105-2026',
    state: 'NC',
    chamber: 'state_house',
    district: '105',
    description: 'Suburban Charlotte seat in southern Mecklenburg County.',
    candidates: [
      { name: 'Beth Helfrich', party: 'democrat', bio: 'Incumbent state representative. Charlotte marketing executive and mother of three.', status: 'running' },
      { name: 'Jennifer Crawford', party: 'republican', bio: 'Charlotte-area CPA and school board volunteer. Tax policy advocate.', status: 'running' },
    ]
  },
  {
    name: 'Nevada Assembly District 35',
    slug: 'nv-state-house-d35-2026',
    state: 'NV',
    chamber: 'state_house',
    district: '35',
    description: 'Competitive Las Vegas suburban seat in Henderson.',
    candidates: [
      { name: 'Michelle Gorelow', party: 'democrat', bio: 'Incumbent assemblywoman from Henderson. Former school board member.', status: 'running' },
      { name: 'Frank Marquez', party: 'republican', bio: 'Henderson business owner and retired Army officer.', status: 'running' },
    ]
  },
  {
    name: 'New Hampshire House Hillsborough 37',
    slug: 'nh-state-house-hillsborough37-2026',
    state: 'NH',
    chamber: 'state_house',
    district: 'Hillsborough-37',
    description: 'Competitive Manchester-area district in NH\'s 400-member House.',
    candidates: [
      { name: 'Olivia Walsh', party: 'democrat', bio: 'Manchester nonprofit director and affordable housing advocate.', status: 'running' },
      { name: 'Paul Terry', party: 'republican', bio: 'Incumbent state representative and retired firefighter.', status: 'running' },
    ]
  },
  {
    name: 'Virginia House District 82',
    slug: 'va-state-house-d82-2026',
    state: 'VA',
    chamber: 'state_house',
    district: '82',
    description: 'Competitive Virginia Beach area district. Part of narrow Democratic House majority.',
    candidates: [
      { name: 'Karen Greenhalgh', party: 'republican', bio: 'Virginia Beach attorney and former city council candidate. Navy veteran spouse.', status: 'running' },
      { name: 'Phil Hernandez', party: 'democrat', bio: 'Incumbent delegate. Navy veteran and cybersecurity professional.', status: 'running' },
    ]
  },
  {
    name: 'Virginia House District 57',
    slug: 'va-state-house-d57-2026',
    state: 'VA',
    chamber: 'state_house',
    district: '57',
    description: 'Swing seat in Prince William County south of DC.',
    candidates: [
      { name: 'Briana Sewell', party: 'democrat', bio: 'Incumbent delegate and Army veteran. Focused on veterans affairs and education.', status: 'running' },
      { name: 'George Becerra', party: 'republican', bio: 'Prince William County school board member and small business owner.', status: 'running' },
    ]
  },
  {
    name: 'Minnesota House District 51A',
    slug: 'mn-state-house-d51a-2026',
    state: 'MN',
    chamber: 'state_house',
    district: '51A',
    description: 'Suburban Twin Cities seat in Dakota County. Swing district.',
    candidates: [
      { name: 'Laurie Pryor', party: 'democrat', bio: 'Incumbent state representative from Minnetonka. Former nonprofit executive.', status: 'running' },
      { name: 'Jake Schneider', party: 'republican', bio: 'Minneapolis suburb resident and fiscal policy analyst.', status: 'running' },
    ]
  },
  {
    name: 'Minnesota House District 47B',
    slug: 'mn-state-house-d47b-2026',
    state: 'MN',
    chamber: 'state_house',
    district: '47B',
    description: 'Exurban Twin Cities swing seat. One of the tightest races in 2024.',
    candidates: [
      { name: 'Greg Boe', party: 'republican', bio: 'Chanhassen area farmer and township board member.', status: 'running' },
      { name: 'Ann Breidel', party: 'democrat', bio: 'Carver County small business owner and environmental advocate.', status: 'running' },
    ]
  },

  // =========================================================================
  //  COUNTY EXECUTIVE / BOARD RACES (20 races)
  // =========================================================================
  {
    name: 'Los Angeles County Board of Supervisors District 4',
    slug: 'la-county-d4-2026',
    state: 'CA',
    chamber: 'county',
    district: '4',
    description: 'Represents over 2 million people across parts of LA County. One of the most powerful local positions in the US.',
    candidates: [
      { name: 'Janice Hahn', party: 'democrat', bio: 'Incumbent supervisor since 2016. Former congresswoman and LA city council member.', status: 'running' },
      { name: 'Robert Luna', party: 'democrat', bio: 'LA County Sheriff considering a run. Former Long Beach police chief.', status: 'exploring' },
    ]
  },
  {
    name: 'Cook County Board President',
    slug: 'cook-county-president-2026',
    state: 'IL',
    chamber: 'county',
    district: null,
    description: 'Governs the second-most-populous county in the US, encompassing Chicago and 130 suburbs.',
    candidates: [
      { name: 'Toni Preckwinkle', party: 'democrat', bio: 'Incumbent Cook County Board President since 2010. Former alderman and teacher.', status: 'running' },
      { name: 'Brandon Johnson', party: 'democrat', bio: 'Chicago Mayor potentially seeking county office if not running for re-election.', status: 'exploring' },
      { name: 'Richard Boykin', party: 'democrat', bio: 'Former county commissioner and attorney. Government reform advocate.', status: 'running' },
    ]
  },
  {
    name: 'Harris County Judge',
    slug: 'harris-county-judge-2026',
    state: 'TX',
    chamber: 'county',
    district: null,
    description: 'Chief executive of Harris County (Houston metro), the third-largest county in the US.',
    candidates: [
      { name: 'Lina Hidalgo', party: 'democrat', bio: 'Incumbent county judge since 2018. Colombian-American attorney and youngest person elected to the position.', status: 'running' },
      { name: 'Alexandra del Moral Mealer', party: 'republican', bio: 'West Point graduate, Army veteran, and attorney. Previously ran in 2022.', status: 'running' },
    ]
  },
  {
    name: 'Maricopa County Board of Supervisors District 1',
    slug: 'maricopa-county-d1-2026',
    state: 'AZ',
    chamber: 'county',
    district: '1',
    description: 'Maricopa County is the fourth-most-populous county in the US and a key election battleground.',
    candidates: [
      { name: 'Jack Sellers', party: 'republican', bio: 'Incumbent supervisor since 2017. Former Chandler city council member and business owner.', status: 'running' },
      { name: 'Maria Espinoza', party: 'democrat', bio: 'Tempe community organizer and former school board member. Housing advocate.', status: 'running' },
    ]
  },
  {
    name: 'Maricopa County Board of Supervisors District 3',
    slug: 'maricopa-county-d3-2026',
    state: 'AZ',
    chamber: 'county',
    district: '3',
    description: 'West Valley district in the largest county in Arizona. Growing rapidly.',
    candidates: [
      { name: 'Bill Gates', party: 'republican', bio: 'Incumbent supervisor and former board chair. Attorney who gained national attention defending 2020 election integrity.', status: 'running' },
      { name: 'Daniel Lopez', party: 'democrat', bio: 'Buckeye city council member and veterans advocate.', status: 'running' },
    ]
  },
  {
    name: 'King County Executive',
    slug: 'king-county-exec-2026',
    state: 'WA',
    chamber: 'county',
    district: null,
    description: 'Chief executive of King County, WA (Seattle metro). Over 2.2 million residents.',
    candidates: [
      { name: 'Dow Constantine', party: 'democrat', bio: 'Incumbent county executive since 2009. Former state senator focused on transit and climate.', status: 'running' },
      { name: 'Reagan Dunn', party: 'republican', bio: 'County council member and former federal prosecutor. Son of former US Rep. Jennifer Dunn.', status: 'running' },
    ]
  },
  {
    name: 'Fulton County Commission Chair',
    slug: 'fulton-county-chair-2026',
    state: 'GA',
    chamber: 'county',
    district: null,
    description: 'Fulton County encompasses most of Atlanta and is Georgia\'s most populous county.',
    candidates: [
      { name: 'Robb Pitts', party: 'democrat', bio: 'Incumbent commission chair since 2018. Long-serving Atlanta-area public official.', status: 'running' },
      { name: 'Bridgette Stevens', party: 'republican', bio: 'North Fulton business owner and community leader.', status: 'running' },
    ]
  },
  {
    name: 'Wayne County Executive',
    slug: 'wayne-county-exec-2026',
    state: 'MI',
    chamber: 'county',
    district: null,
    description: 'Largest county in Michigan, encompassing Detroit and surrounding communities.',
    candidates: [
      { name: 'Warren Evans', party: 'democrat', bio: 'Incumbent county executive since 2015. Former Wayne County sheriff.', status: 'running' },
      { name: 'Tim Killeen', party: 'democrat', bio: 'Former Dearborn Heights mayor and county commissioner.', status: 'running' },
    ]
  },
  {
    name: 'Allegheny County Executive',
    slug: 'allegheny-county-exec-2026',
    state: 'PA',
    chamber: 'county',
    district: null,
    description: 'Encompasses Pittsburgh and surrounding communities. Key western PA political office.',
    candidates: [
      { name: 'Sara Innamorato', party: 'democrat', bio: 'Incumbent county executive and former state representative. Progressive advocate for government transparency.', status: 'running' },
      { name: 'Joe Rockey', party: 'republican', bio: 'Pittsburgh-area business owner and fiscal conservative.', status: 'running' },
    ]
  },
  {
    name: 'Hennepin County Board District 3',
    slug: 'hennepin-county-d3-2026',
    state: 'MN',
    chamber: 'county',
    district: '3',
    description: 'Largest county in Minnesota, encompassing Minneapolis. District 3 covers south Minneapolis.',
    candidates: [
      { name: 'Marion Greene', party: 'democrat', bio: 'Incumbent county commissioner. Former corporate sustainability executive.', status: 'running' },
      { name: 'Chris Parsons', party: 'republican', bio: 'Minneapolis small business owner and public safety advocate.', status: 'running' },
    ]
  },
  {
    name: 'Clark County Commission District C',
    slug: 'clark-county-dc-2026',
    state: 'NV',
    chamber: 'county',
    district: 'C',
    description: 'Clark County encompasses Las Vegas and is the most populous county in Nevada.',
    candidates: [
      { name: 'Ross Miller', party: 'democrat', bio: 'Former Nevada Secretary of State. Attorney and political scion.', status: 'running' },
      { name: 'Drew Johnson', party: 'republican', bio: 'Policy analyst and columnist. Fiscal conservative and libertarian-leaning.', status: 'running' },
    ]
  },
  {
    name: 'Cuyahoga County Executive',
    slug: 'cuyahoga-county-exec-2026',
    state: 'OH',
    chamber: 'county',
    district: null,
    description: 'Encompasses Cleveland and is the second-most-populous county in Ohio.',
    candidates: [
      { name: 'Chris Ronayne', party: 'democrat', bio: 'Incumbent county executive since 2023. Former University Circle Inc. president and city planner.', status: 'running' },
      { name: 'Lee Weingart', party: 'republican', bio: 'Former county Republican Party chair and banking executive.', status: 'running' },
    ]
  },
  {
    name: 'Milwaukee County Executive',
    slug: 'milwaukee-county-exec-2026',
    state: 'WI',
    chamber: 'county',
    district: null,
    description: 'Milwaukee County is the most populous county in Wisconsin and a key Democratic stronghold.',
    candidates: [
      { name: 'David Crowley', party: 'democrat', bio: 'Incumbent county executive since 2020. Youngest person and first Black person to hold the position.', status: 'running' },
      { name: 'Jeff Schmidt', party: 'republican', bio: 'Former county supervisor and retired business executive.', status: 'running' },
    ]
  },
  {
    name: 'Wake County Board of Commissioners Chair',
    slug: 'wake-county-chair-2026',
    state: 'NC',
    chamber: 'county',
    district: null,
    description: 'Wake County (Raleigh metro) is the most populous county in North Carolina and rapidly growing.',
    candidates: [
      { name: 'Shinica Thomas', party: 'democrat', bio: 'Incumbent board chair and former city council member. Education and transit advocate.', status: 'running' },
      { name: 'Matt Calabria', party: 'democrat', bio: 'County commissioner and attorney. Infrastructure and affordable housing advocate.', status: 'running' },
    ]
  },
  {
    name: 'Dane County Executive',
    slug: 'dane-county-exec-2026',
    state: 'WI',
    chamber: 'county',
    district: null,
    description: 'Dane County encompasses Madison, the state capital, and the University of Wisconsin.',
    candidates: [
      { name: 'Melissa Agard', party: 'democrat', bio: 'Incumbent county executive and former state senator. Progressive focused on climate and equity.', status: 'running' },
      { name: 'James Hartman', party: 'republican', bio: 'Dane County business owner and property rights advocate.', status: 'running' },
    ]
  },
  {
    name: 'Oakland County Executive',
    slug: 'oakland-county-exec-2026',
    state: 'MI',
    chamber: 'county',
    district: null,
    description: 'Suburban Detroit county and one of the wealthiest counties in Michigan.',
    candidates: [
      { name: 'Dave Coulter', party: 'democrat', bio: 'Incumbent county executive since 2019. Former Ferndale mayor focused on economic development.', status: 'running' },
      { name: 'Mike McCready', party: 'republican', bio: 'Oakland County business leader and former township supervisor.', status: 'running' },
    ]
  },
  {
    name: 'Tarrant County Judge',
    slug: 'tarrant-county-judge-2026',
    state: 'TX',
    chamber: 'county',
    district: null,
    description: 'Fort Worth metro area. Third-most-populous county in Texas and politically competitive.',
    candidates: [
      { name: 'Tim O\'Hare', party: 'republican', bio: 'Incumbent county judge since 2023. Former Farmers Branch mayor and attorney.', status: 'running' },
      { name: 'Deborah Peoples', party: 'democrat', bio: 'Former Tarrant County Democratic Party chair and AT&T executive.', status: 'running' },
    ]
  },
  {
    name: 'Gwinnett County Commission Chair',
    slug: 'gwinnett-county-chair-2026',
    state: 'GA',
    chamber: 'county',
    district: null,
    description: 'Gwinnett County is the second-most-populous county in Georgia. Rapidly diversifying suburban Atlanta area.',
    candidates: [
      { name: 'Nicole Love Hendrickson', party: 'democrat', bio: 'Incumbent commission chair since 2021. First Black woman to lead the county.', status: 'running' },
      { name: 'Victor Hayes', party: 'republican', bio: 'Gwinnett County business owner and former planning commission member.', status: 'running' },
    ]
  },

  // =========================================================================
  //  MAYORAL RACES — Even-year cities (10 races)
  // =========================================================================
  {
    name: 'Las Vegas Mayor',
    slug: 'las-vegas-mayor-2026',
    state: 'NV',
    chamber: 'mayor',
    district: null,
    description: 'Mayor of Las Vegas proper. Nonpartisan election but party affiliations are well known.',
    candidates: [
      { name: 'Shelley Berkley', party: 'democrat', bio: 'Candidate and former US Representative from Nevada. Former Touro University president.', status: 'running' },
      { name: 'Victoria Seaman', party: 'republican', bio: 'Las Vegas city council member and former state assemblywoman. Real estate attorney.', status: 'running' },
      { name: 'Cedric Crear', party: 'democrat', bio: 'Las Vegas city council member and community development professional.', status: 'running' },
    ]
  },
  {
    name: 'Phoenix Mayor',
    slug: 'phoenix-mayor-2026',
    state: 'AZ',
    chamber: 'mayor',
    district: null,
    description: 'Fifth-largest city in the US. Technically nonpartisan but highly competitive.',
    candidates: [
      { name: 'Kate Gallego', party: 'democrat', bio: 'Incumbent mayor since 2019. Former city council member focused on economic development, water, and tech industry growth.', status: 'running' },
      { name: 'Sal DiCiccio', party: 'republican', bio: 'Former Phoenix city council member. Known fiscal conservative and public safety advocate.', status: 'exploring' },
    ]
  },
  {
    name: 'Mesa Mayor',
    slug: 'mesa-mayor-2026',
    state: 'AZ',
    chamber: 'mayor',
    district: null,
    description: 'Third-largest city in Arizona. Nonpartisan municipal election.',
    candidates: [
      { name: 'John Giles', party: 'republican', bio: 'Incumbent mayor since 2014. Moderate Republican who has emphasized bipartisan governance.', status: 'running' },
      { name: 'Ryan Winkle', party: 'democrat', bio: 'Mesa city council member and urban planning advocate.', status: 'running' },
    ]
  },
  {
    name: 'Reno Mayor',
    slug: 'reno-mayor-2026',
    state: 'NV',
    chamber: 'mayor',
    district: null,
    description: 'Second-largest city in Nevada. Growing tech hub with cost-of-living concerns.',
    candidates: [
      { name: 'Hillary Schieve', party: 'independent', bio: 'Incumbent mayor since 2014. Independent focused on economic diversification and homelessness.', status: 'running' },
      { name: 'Eddie Lorton', party: 'republican', bio: 'Reno business owner and commercial real estate developer.', status: 'running' },
    ]
  },
  {
    name: 'Austin Mayor',
    slug: 'austin-mayor-2026',
    state: 'TX',
    chamber: 'mayor',
    district: null,
    description: 'Texas state capital and one of the fastest-growing cities in the US.',
    candidates: [
      { name: 'Kirk Watson', party: 'democrat', bio: 'Incumbent mayor and former state senator. Returned to office in 2022 focused on housing and transit.', status: 'running' },
      { name: 'Mackenzie Kelly', party: 'republican', bio: 'Austin city council member and real estate professional.', status: 'exploring' },
    ]
  },
  {
    name: 'San Antonio Mayor',
    slug: 'san-antonio-mayor-2026',
    state: 'TX',
    chamber: 'mayor',
    district: null,
    description: 'Seventh-largest city in the US. Nonpartisan municipal election.',
    candidates: [
      { name: 'Ron Nirenberg', party: 'democrat', bio: 'Incumbent mayor since 2017. Focused on infrastructure, climate, and military community relations.', status: 'running' },
      { name: 'Greg Brockhouse', party: 'republican', bio: 'Former city council member. Police union-backed candidate who nearly won in 2019.', status: 'running' },
    ]
  },
  {
    name: 'Portland Mayor',
    slug: 'portland-mayor-2026',
    state: 'OR',
    chamber: 'mayor',
    district: null,
    description: 'Oregon\'s largest city under a new form of government with a strong mayor system.',
    candidates: [
      { name: 'Keith Wilson', party: 'democrat', bio: 'Incumbent mayor elected in 2024 under the new charter. Trucking company owner focused on homelessness.', status: 'running' },
      { name: 'Carmen Rubio', party: 'democrat', bio: 'Former city commissioner and nonprofit leader. Ran for mayor in 2024.', status: 'exploring' },
    ]
  },
  {
    name: 'Tucson Mayor',
    slug: 'tucson-mayor-2026',
    state: 'AZ',
    chamber: 'mayor',
    district: null,
    description: 'Second-largest city in Arizona. Ward-based council with at-large mayor.',
    candidates: [
      { name: 'Regina Romero', party: 'democrat', bio: 'Incumbent mayor since 2019. First Latina mayor of Tucson. Focused on climate, housing, and immigration.', status: 'running' },
      { name: 'Ed Ackerley', party: 'republican', bio: 'Tucson business owner and billboard company executive.', status: 'running' },
    ]
  },
  {
    name: 'Henderson Mayor',
    slug: 'henderson-mayor-2026',
    state: 'NV',
    chamber: 'mayor',
    district: null,
    description: 'Second-largest city in Nevada, bordering Las Vegas. One of the fastest-growing cities.',
    candidates: [
      { name: 'Michelle Romero', party: 'republican', bio: 'Incumbent mayor since 2022. Former city council member and Henderson native.', status: 'running' },
      { name: 'Dan Shaw', party: 'democrat', bio: 'Henderson planning commissioner and retired urban planner.', status: 'running' },
    ]
  },
  {
    name: 'El Paso Mayor',
    slug: 'el-paso-mayor-2026',
    state: 'TX',
    chamber: 'mayor',
    district: null,
    description: 'Largest US city on the Mexican border. Sixth-largest city in Texas.',
    candidates: [
      { name: 'Oscar Leeser', party: 'democrat', bio: 'Incumbent mayor in his second non-consecutive term. Car dealership owner focused on border and economic issues.', status: 'running' },
      { name: 'Veronica Carbajal', party: 'democrat', bio: 'El Paso County attorney and community advocate.', status: 'running' },
    ]
  },

  // =========================================================================
  //  SCHOOL BOARD RACES (15 races)
  // =========================================================================
  {
    name: 'Los Angeles Unified School Board District 2',
    slug: 'lausd-d2-2026',
    state: 'CA',
    chamber: 'school_board',
    district: '2',
    description: 'Second-largest school district in the US with over 400,000 students. District 2 covers parts of the San Fernando Valley.',
    candidates: [
      { name: 'Rocio Rivas', party: 'democrat', bio: 'Incumbent board member and former LAUSD administrator. Public school advocate.', status: 'running' },
      { name: 'Daniel Cano', party: 'democrat', bio: 'Charter school advocate and education nonprofit director.', status: 'running' },
    ]
  },
  {
    name: 'Los Angeles Unified School Board District 4',
    slug: 'lausd-d4-2026',
    state: 'CA',
    chamber: 'school_board',
    district: '4',
    description: 'Covers the Eastside, downtown LA, and parts of South LA. Heavily debated between charter and public school advocates.',
    candidates: [
      { name: 'Nick Melvoin', party: 'democrat', bio: 'Incumbent board member and former charter school teacher. Education reform advocate.', status: 'running' },
      { name: 'Tracy Hernandez', party: 'democrat', bio: 'Education advocate and parent organizer focused on bilingual education.', status: 'running' },
    ]
  },
  {
    name: 'Chicago Public Schools Board District 1',
    slug: 'cps-d1-2026',
    state: 'IL',
    chamber: 'school_board',
    district: '1',
    description: 'Chicago\'s first-ever elected school board. CPS is the third-largest district in the US.',
    candidates: [
      { name: 'Michelle Pierre', party: 'democrat', bio: 'Education advocate and community organizer from the South Side.', status: 'running' },
      { name: 'Theresa Platt', party: 'democrat', bio: 'Retired CPS teacher and CTU member. Three decades in education.', status: 'running' },
    ]
  },
  {
    name: 'Houston ISD Board District III',
    slug: 'hisd-d3-2026',
    state: 'TX',
    chamber: 'school_board',
    district: '3',
    description: 'Largest school district in Texas under state takeover. Board elections are key to restoring local control.',
    candidates: [
      { name: 'Sergio Lira', party: 'democrat', bio: 'Community organizer and parent advocate fighting for restoration of elected board governance.', status: 'running' },
      { name: 'Patricia Allen', party: 'republican', bio: 'Former HISD teacher and school choice advocate.', status: 'running' },
    ]
  },
  {
    name: 'Maricopa County School Superintendent',
    slug: 'maricopa-school-super-2026',
    state: 'AZ',
    chamber: 'school_board',
    district: null,
    description: 'Oversees education policy for the largest county school system in Arizona.',
    candidates: [
      { name: 'Steve Watson', party: 'republican', bio: 'Incumbent superintendent focused on school choice and parental rights.', status: 'running' },
      { name: 'Laura Metcalfe', party: 'democrat', bio: 'Former school administrator and education equity advocate.', status: 'running' },
    ]
  },
  {
    name: 'Gwinnett County School Board District 4',
    slug: 'gwinnett-school-d4-2026',
    state: 'GA',
    chamber: 'school_board',
    district: '4',
    description: 'Largest school district in Georgia with nearly 200,000 students.',
    candidates: [
      { name: 'Everton Blair Jr.', party: 'democrat', bio: 'Former board chair and youngest person elected to the board. Education access advocate.', status: 'running' },
      { name: 'Adrienne Thompson', party: 'republican', bio: 'Gwinnett County parent and curriculum review advocate.', status: 'running' },
    ]
  },
  {
    name: 'Wake County School Board District 5',
    slug: 'wake-school-d5-2026',
    state: 'NC',
    chamber: 'school_board',
    district: '5',
    description: 'Wake County Public Schools is the largest district in NC with over 160,000 students.',
    candidates: [
      { name: 'Lynn Edmonds', party: 'democrat', bio: 'Incumbent board member and education researcher from Cary.', status: 'running' },
      { name: 'David Martin', party: 'republican', bio: 'Cary business owner and parent advocate for school transparency.', status: 'running' },
    ]
  },
  {
    name: 'Fairfax County School Board At-Large',
    slug: 'fairfax-school-atlarge-2026',
    state: 'VA',
    chamber: 'school_board',
    district: 'At-Large',
    description: 'Largest school district in Virginia with over 180,000 students. Northern Virginia suburbs of DC.',
    candidates: [
      { name: 'Karen Keys-Gamarra', party: 'democrat', bio: 'Incumbent at-large school board member and former attorney.', status: 'running' },
      { name: 'Priscilla DeStefano', party: 'republican', bio: 'Parent advocate and small business owner. Focused on curriculum transparency.', status: 'running' },
    ]
  },
  {
    name: 'Denver Public Schools Board District 2',
    slug: 'dps-d2-2026',
    state: 'CO',
    chamber: 'school_board',
    district: '2',
    description: 'Denver Public Schools serves around 90,000 students. Board elections are nonpartisan but politically charged.',
    candidates: [
      { name: 'Scott Esserman', party: 'democrat', bio: 'Incumbent board member. Attorney and education reform advocate.', status: 'running' },
      { name: 'Xochitl Gaytan', party: 'democrat', bio: 'Community organizer and parent. Progressive education advocate focused on equity.', status: 'running' },
    ]
  },
  {
    name: 'Clark County School Board District E',
    slug: 'ccsd-de-2026',
    state: 'NV',
    chamber: 'school_board',
    district: 'E',
    description: 'Fifth-largest school district in the US serving over 300,000 students in the Las Vegas metro.',
    candidates: [
      { name: 'Linda Cavazos', party: 'democrat', bio: 'Former board president and education veteran. Focused on teacher retention.', status: 'running' },
      { name: 'Jeff Pratt', party: 'republican', bio: 'Parent and accountant. School choice and fiscal accountability advocate.', status: 'running' },
    ]
  },
  {
    name: 'Broward County School Board District 4',
    slug: 'broward-school-d4-2026',
    state: 'FL',
    chamber: 'school_board',
    district: '4',
    description: 'Sixth-largest school district in the US. Broward County includes Fort Lauderdale area.',
    candidates: [
      { name: 'Torey Alston', party: 'republican', bio: 'Incumbent board member appointed by Gov. DeSantis. Business consultant.', status: 'running' },
      { name: 'Sarah Leonardi', party: 'democrat', bio: 'Former board member seeking to return. Public school teacher and union advocate.', status: 'running' },
    ]
  },
  {
    name: 'Hillsborough County School Board District 7',
    slug: 'hillsborough-school-d7-2026',
    state: 'FL',
    chamber: 'school_board',
    district: '7',
    description: 'Tampa-area district and one of the largest in Florida with over 220,000 students.',
    candidates: [
      { name: 'Karen Perez', party: 'democrat', bio: 'Incumbent board member and community college administrator. First Hispanic woman on the board.', status: 'running' },
      { name: 'Todd Marks', party: 'republican', bio: 'Tampa CPA and parent. Fiscal accountability and school safety advocate.', status: 'running' },
    ]
  },
  {
    name: 'Loudoun County School Board Algonkian District',
    slug: 'loudoun-school-algonkian-2026',
    state: 'VA',
    chamber: 'school_board',
    district: 'Algonkian',
    description: 'Loudoun County has been at the center of national school board debates on curriculum and policy.',
    candidates: [
      { name: 'Tammy Kaufax', party: 'republican', bio: 'Incumbent school board member. Parent advocate focused on academic standards.', status: 'running' },
      { name: 'Megan Baker', party: 'democrat', bio: 'Loudoun County attorney and parent. Public school funding and teacher pay advocate.', status: 'running' },
    ]
  },
  {
    name: 'Cobb County School Board District 2',
    slug: 'cobb-school-d2-2026',
    state: 'GA',
    chamber: 'school_board',
    district: '2',
    description: 'Large suburban Atlanta school district with over 100,000 students.',
    candidates: [
      { name: 'Leroy Tre Hutchins', party: 'democrat', bio: 'Incumbent board member and education equity advocate. Former pastor.', status: 'running' },
      { name: 'Beth Carroccio', party: 'republican', bio: 'Cobb County parent and homeschool advocate turned public school supporter.', status: 'running' },
    ]
  },
  {
    name: 'Williamson County School Board District 6',
    slug: 'williamson-school-d6-2026',
    state: 'TN',
    chamber: 'school_board',
    district: '6',
    description: 'Affluent Nashville suburb that has become a flashpoint in national school board politics.',
    candidates: [
      { name: 'Jay Galbreath', party: 'republican', bio: 'Incumbent board member and business executive. Parental rights advocate.', status: 'running' },
      { name: 'Claire Reeves', party: 'democrat', bio: 'Williamson County parent and education nonprofit director.', status: 'running' },
      { name: 'Robert Bennett', party: 'independent', bio: 'Retired teacher and school administrator. Advocate for keeping politics out of schools.', status: 'running' },
    ]
  },
]

// ---------------------------------------------------------------------------
// 3. Upsert logic
// ---------------------------------------------------------------------------
const BATCH_SIZE = 25

async function main() {
  const electionId = await ensureElection()
  console.log(`Using election ID: ${electionId}`)

  let racesUpserted = 0
  let candidatesUpserted = 0

  // Process races in batches
  for (let i = 0; i < RACES.length; i += BATCH_SIZE) {
    const batch = RACES.slice(i, i + BATCH_SIZE)

    // Upsert races
    const raceRows = batch.map(r => ({
      election_id: electionId,
      name: r.name,
      slug: r.slug,
      state: r.state,
      chamber: r.chamber,
      district: r.district || null,
      description: r.description,
    }))

    const { data: upsertedRaces, error: raceError } = await supabase
      .from('races')
      .upsert(raceRows, { onConflict: 'slug' })
      .select('id, slug')

    if (raceError) {
      console.error(`Race upsert error (batch ${i}):`, raceError.message)
      continue
    }

    racesUpserted += upsertedRaces.length
    console.log(`  Upserted ${upsertedRaces.length} races (batch ${Math.floor(i / BATCH_SIZE) + 1})`)

    // Build slug -> id map
    const slugToId = {}
    for (const r of upsertedRaces) slugToId[r.slug] = r.id

    // Upsert candidates for this batch
    const candidateRows = []
    for (const race of batch) {
      const raceId = slugToId[race.slug]
      if (!raceId) {
        console.warn(`  Warning: no race ID for ${race.slug}, skipping candidates`)
        continue
      }
      for (const c of race.candidates) {
        candidateRows.push({
          race_id: raceId,
          name: c.name,
          party: c.party,
          bio: c.bio,
          status: c.status,
          is_incumbent: false,
        })
      }
    }

    if (candidateRows.length === 0) continue

    // Delete existing candidates for these races, then insert fresh
    const raceIds = Object.values(slugToId)
    const { error: deleteError } = await supabase
      .from('candidates')
      .delete()
      .in('race_id', raceIds)

    if (deleteError) {
      console.error(`  Candidate delete error:`, deleteError.message)
    }

    const { data: insertedCandidates, error: candError } = await supabase
      .from('candidates')
      .insert(candidateRows)
      .select('id')

    if (candError) {
      console.error(`  Candidate insert error:`, candError.message)
    } else {
      candidatesUpserted += insertedCandidates.length
      console.log(`  Inserted ${insertedCandidates.length} candidates`)
    }
  }

  console.log(`\n=== Summary ===`)
  console.log(`Races upserted:      ${racesUpserted}`)
  console.log(`Candidates inserted: ${candidatesUpserted}`)
  console.log(`Total race types:`)

  const typeCounts = {}
  for (const r of RACES) {
    typeCounts[r.chamber] = (typeCounts[r.chamber] || 0) + 1
  }
  for (const [type, count] of Object.entries(typeCounts).sort()) {
    console.log(`  ${type}: ${count}`)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
