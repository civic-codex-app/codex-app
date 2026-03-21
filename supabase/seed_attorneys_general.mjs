import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia'
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Current state attorneys general as of early 2026
// Note: Several former AGs won governor races in 2024 (Josh Stein NC, Bob Ferguson WA, Patrick Morrisey WV)
// Their replacements are listed instead.
const ATTORNEYS_GENERAL = [
  { name: 'Steve Marshall', state: 'AL', party: 'republican', bio: 'Attorney General of Alabama since 2017. Former district attorney focused on violent crime prosecution, opioid crisis response, and defending state laws.' },
  { name: 'Treg Taylor', state: 'AK', party: 'republican', bio: 'Attorney General of Alaska since 2020. Former oil and gas attorney appointed by Governor Dunleavy, focused on resource development and state sovereignty.' },
  { name: 'Kris Mayes', state: 'AZ', party: 'democrat', bio: 'Attorney General of Arizona since 2023. Former Arizona Corporation Commissioner focused on consumer protection, water rights, and election integrity.' },
  { name: 'Tim Griffin', state: 'AR', party: 'republican', bio: 'Attorney General of Arkansas since 2023. Former U.S. Representative and Lieutenant Governor focused on combating drug trafficking and protecting consumers.' },
  { name: 'Rob Bonta', state: 'CA', party: 'democrat', bio: 'Attorney General of California since 2021. Former state assemblymember and the first Filipino American to serve as California AG, focused on civil rights, gun safety, and environmental justice.' },
  { name: 'Phil Weiser', state: 'CO', party: 'democrat', bio: 'Attorney General of Colorado since 2019. Former University of Colorado law dean focused on antitrust enforcement, consumer protection, and technology policy.' },
  { name: 'William Tong', state: 'CT', party: 'democrat', bio: 'Attorney General of Connecticut since 2019. The first Asian American elected AG in U.S. history, focused on consumer protection, gun safety, and combating the opioid crisis.' },
  { name: 'Kathy Jennings', state: 'DE', party: 'democrat', bio: 'Attorney General of Delaware since 2019. Former state prosecutor with decades of experience, focused on criminal justice reform, gun violence prevention, and consumer protection.' },
  { name: 'Ashley Moody', state: 'FL', party: 'republican', bio: 'Attorney General of Florida since 2019. Former circuit court judge focused on combating human trafficking, opioid abuse, and consumer fraud.' },
  { name: 'Chris Carr', state: 'GA', party: 'republican', bio: 'Attorney General of Georgia since 2016. Former executive counsel to the governor focused on gang prosecution, human trafficking, and cybercrime.' },
  { name: 'Anne Lopez', state: 'HI', party: 'democrat', bio: 'Attorney General of Hawaii since 2023. Career prosecutor appointed by Governor Green, focused on public safety and environmental protection.' },
  { name: 'Raul Labrador', state: 'ID', party: 'republican', bio: 'Attorney General of Idaho since 2023. Former U.S. Representative focused on defending state sovereignty, Second Amendment rights, and limited government.' },
  { name: 'Kwame Raoul', state: 'IL', party: 'democrat', bio: 'Attorney General of Illinois since 2019. Former state senator who succeeded the Senate seat of Barack Obama, focused on criminal justice reform and civil rights.' },
  { name: 'Todd Rokita', state: 'IN', party: 'republican', bio: 'Attorney General of Indiana since 2021. Former U.S. Representative and Secretary of State focused on defending state laws, combating human trafficking, and consumer protection.' },
  { name: 'Brenna Bird', state: 'IA', party: 'republican', bio: 'Attorney General of Iowa since 2023. Former county attorney focused on public safety, combating drug trafficking, and supporting law enforcement.' },
  { name: 'Kris Kobach', state: 'KS', party: 'republican', bio: 'Attorney General of Kansas since 2023. Former Kansas Secretary of State known for immigration enforcement, election security, and defending state authority.' },
  { name: 'Russell Coleman', state: 'KY', party: 'republican', bio: 'Attorney General of Kentucky since 2024. Former U.S. Attorney for the Western District of Kentucky focused on public safety, combating drug trafficking, and government accountability.' },
  { name: 'Liz Murrill', state: 'LA', party: 'republican', bio: 'Attorney General of Louisiana since 2024. Former Solicitor General of Louisiana with extensive appellate litigation experience, focused on public safety and defending state interests.' },
  { name: 'Aaron Frey', state: 'ME', party: 'democrat', bio: 'Attorney General of Maine since 2019. Former state legislator elected by the legislature, focused on consumer protection, environmental enforcement, and opioid crisis response.' },
  { name: 'Anthony Brown', state: 'MD', party: 'democrat', bio: 'Attorney General of Maryland since 2023. Former U.S. Representative and Lieutenant Governor, the first African American to serve as Maryland AG.' },
  { name: 'Andrea Joy Campbell', state: 'MA', party: 'democrat', bio: 'Attorney General of Massachusetts since 2023. Former Boston City Council president and the first Black woman to serve as Massachusetts AG, focused on civil rights and consumer protection.' },
  { name: 'Dana Nessel', state: 'MI', party: 'democrat', bio: 'Attorney General of Michigan since 2019. Civil rights attorney and the first openly gay person elected to statewide office in Michigan, focused on consumer protection and hate crimes.' },
  { name: 'Keith Ellison', state: 'MN', party: 'democrat', bio: 'Attorney General of Minnesota since 2019. Former U.S. Representative and the first African American and first Muslim elected to Congress from Minnesota, known for prosecuting the Derek Chauvin case.' },
  { name: 'Lynn Fitch', state: 'MS', party: 'republican', bio: 'Attorney General of Mississippi since 2020. The first woman elected AG of Mississippi, focused on human trafficking, consumer protection, and defending state laws.' },
  { name: 'Andrew Bailey', state: 'MO', party: 'republican', bio: 'Attorney General of Missouri since 2023. Former general counsel to Governor Parson focused on combating violent crime, defending parental rights, and government transparency.' },
  { name: 'Austin Knudsen', state: 'MT', party: 'republican', bio: 'Attorney General of Montana since 2021. Former state legislator and Speaker of the Montana House, focused on defending public lands access and state sovereignty.' },
  { name: 'Mike Hilgers', state: 'NE', party: 'republican', bio: 'Attorney General of Nebraska since 2023. Former Speaker of the Nebraska Legislature focused on public safety, human trafficking, and defending state interests.' },
  { name: 'Aaron Ford', state: 'NV', party: 'democrat', bio: 'Attorney General of Nevada since 2019. Former state senate majority leader and the first African American elected to statewide office in Nevada, focused on criminal justice reform.' },
  { name: 'John Formella', state: 'NH', party: 'republican', bio: 'Attorney General of New Hampshire since 2021. Appointed by Governor Sununu, focused on combating the opioid crisis, consumer protection, and public safety.' },
  { name: 'Matthew Platkin', state: 'NJ', party: 'democrat', bio: 'Attorney General of New Jersey since 2022. Former chief counsel to Governor Murphy focused on gun safety, police reform, and environmental enforcement.' },
  { name: 'Raul Torrez', state: 'NM', party: 'democrat', bio: 'Attorney General of New Mexico since 2023. Former Bernalillo County District Attorney focused on violent crime prosecution, consumer protection, and government accountability.' },
  { name: 'Letitia James', state: 'NY', party: 'democrat', bio: 'Attorney General of New York since 2019. Former New York City Public Advocate and the first African American and first woman to serve as New York AG.' },
  { name: 'Jeff Jackson', state: 'NC', party: 'democrat', bio: 'Attorney General of North Carolina since 2025. Former U.S. Representative and state senator known for transparency and constituent engagement on social media.' },
  { name: 'Drew Wrigley', state: 'ND', party: 'republican', bio: 'Attorney General of North Dakota since 2022. Former U.S. Attorney and Lieutenant Governor focused on combating drug trafficking and supporting law enforcement.' },
  { name: 'Dave Yost', state: 'OH', party: 'republican', bio: 'Attorney General of Ohio since 2019. Former state auditor focused on fighting human trafficking, the opioid epidemic, and protecting consumers.' },
  { name: 'Gentner Drummond', state: 'OK', party: 'republican', bio: 'Attorney General of Oklahoma since 2023. Former military pilot and rancher focused on tribal sovereignty issues, criminal justice, and government accountability.' },
  { name: 'Dan Rayfield', state: 'OR', party: 'democrat', bio: 'Attorney General of Oregon since 2025. Former Oregon House Speaker focused on consumer protection, environmental enforcement, and access to justice.' },
  { name: 'Michelle Henry', state: 'PA', party: 'democrat', bio: 'Attorney General of Pennsylvania since 2023. Career prosecutor appointed as First Assistant AG before becoming AG, focused on public safety and consumer protection.' },
  { name: 'Peter Neronha', state: 'RI', party: 'democrat', bio: 'Attorney General of Rhode Island since 2019. Former federal prosecutor focused on public safety, consumer protection, and environmental enforcement.' },
  { name: 'Alan Wilson', state: 'SC', party: 'republican', bio: 'Attorney General of South Carolina since 2011. The longest-serving current state AG, focused on combating human trafficking, internet crimes against children, and opioid abuse.' },
  { name: 'Marty Jackley', state: 'SD', party: 'republican', bio: 'Attorney General of South Dakota since 2023. Previously served as AG from 2009-2018 and as U.S. Attorney, focused on public safety and combating drug trafficking.' },
  { name: 'Jonathan Skrmetti', state: 'TN', party: 'republican', bio: 'Attorney General of Tennessee since 2022. Appointed by the state Supreme Court, focused on defending state laws, consumer protection, and technology regulation.' },
  { name: 'Ken Paxton', state: 'TX', party: 'republican', bio: 'Attorney General of Texas since 2015. Former state legislator known for filing numerous lawsuits against federal government policies and defending state sovereignty.' },
  { name: 'Sean Reyes', state: 'UT', party: 'republican', bio: 'Attorney General of Utah since 2013. Focused on combating human trafficking and internet crimes against children, with significant involvement in tech industry legal issues.' },
  { name: 'Charity Clark', state: 'VT', party: 'democrat', bio: 'Attorney General of Vermont since 2023. Former chief of staff in the AG office focused on consumer protection, environmental enforcement, and affordability issues.' },
  { name: 'Jason Miyares', state: 'VA', party: 'republican', bio: 'Attorney General of Virginia since 2022. The first Latino elected to statewide office in Virginia, focused on public safety, parental rights, and government accountability.' },
  { name: 'Nick Brown', state: 'WA', party: 'democrat', bio: 'Attorney General of Washington since 2025. Former U.S. Attorney for the Western District of Washington and the first African American to serve as Washington AG.' },
  { name: 'J.B. McCuskey', state: 'WV', party: 'republican', bio: 'Attorney General of West Virginia since 2025. Former state delegate and attorney focused on consumer protection and public safety.' },
  { name: 'Josh Kaul', state: 'WI', party: 'democrat', bio: 'Attorney General of Wisconsin since 2019. Former federal prosecutor focused on public safety, consumer protection, and environmental enforcement.' },
  { name: 'Bridget Hill', state: 'WY', party: 'republican', bio: 'Attorney General of Wyoming since 2019. Appointed by Governor Gordon, focused on natural resource law, public lands, and defending state interests.' },
  { name: 'Brian Schwalb', state: 'DC', party: 'democrat', bio: 'Attorney General of the District of Columbia since 2023. Former managing partner at a major law firm focused on public safety, consumer protection, and civil rights.' },
]

async function main() {
  console.log(`Seeding ${ATTORNEYS_GENERAL.length} state attorneys general...`)

  const rows = ATTORNEYS_GENERAL.map(ag => ({
    name: ag.name,
    slug: slugify(ag.name),
    state: ag.state,
    chamber: 'governor',
    party: ag.party,
    title: `Attorney General of ${STATE_NAMES[ag.state]}`,
    bio: ag.bio,
    image_url: null,
    website_url: null,
  }))

  const { data, error } = await supabase
    .from('politicians')
    .upsert(rows, { onConflict: 'slug' })
    .select('id, name, state')

  if (error) {
    console.error('Error upserting attorneys general:', error)
    process.exit(1)
  }

  console.log(`Successfully upserted ${data.length} attorneys general.`)

  // Print summary by party
  const dems = ATTORNEYS_GENERAL.filter(ag => ag.party === 'democrat').length
  const reps = ATTORNEYS_GENERAL.filter(ag => ag.party === 'republican').length
  console.log(`  Democrats: ${dems}`)
  console.log(`  Republicans: ${reps}`)
  console.log(`  Total: ${ATTORNEYS_GENERAL.length}`)
}

main().catch(console.error)
