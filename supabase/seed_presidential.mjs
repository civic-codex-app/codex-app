import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Presidential administration & key cabinet members
const OFFICIALS = [
  // President & VP
  { name: 'Donald Trump', slug: 'donald-trump', state: 'FL', party: 'republican', title: 'President of the United States', since_year: 2025, bio: 'The 47th President of the United States, previously serving as the 45th President from 2017 to 2021. Former businessman and media personality who ran on a platform of economic nationalism, immigration enforcement, and America First foreign policy.' },
  { name: 'JD Vance', slug: 'jd-vance-vp', state: 'OH', party: 'republican', title: 'Vice President of the United States', since_year: 2025, bio: 'The 50th Vice President of the United States and former U.S. Senator from Ohio. Author of "Hillbilly Elegy," he represents a populist wing of the Republican Party focused on working-class issues.' },

  // Cabinet Secretaries
  { name: 'Marco Rubio', slug: 'marco-rubio', state: 'FL', party: 'republican', title: 'Secretary of State', since_year: 2025, bio: 'Secretary of State and former U.S. Senator from Florida. Known for his hawkish foreign policy views and focus on countering China and supporting democratic allies.' },
  { name: 'Pete Hegseth', slug: 'pete-hegseth', state: 'MN', party: 'republican', title: 'Secretary of Defense', since_year: 2025, bio: 'Secretary of Defense, formerly a Fox News host and Army National Guard veteran who served in Iraq and Afghanistan.' },
  { name: 'Scott Bessent', slug: 'scott-bessent', state: 'SC', party: 'republican', title: 'Secretary of the Treasury', since_year: 2025, bio: 'Secretary of the Treasury and former hedge fund manager. Focuses on economic growth through tax reform and deregulation.' },
  { name: 'Pam Bondi', slug: 'pam-bondi', state: 'FL', party: 'republican', title: 'Attorney General', since_year: 2025, bio: 'Attorney General of the United States and former Attorney General of Florida. Known for tough-on-crime policies and support for law enforcement.' },
  { name: 'Doug Burgum', slug: 'doug-burgum', state: 'ND', party: 'republican', title: 'Secretary of the Interior', since_year: 2025, bio: 'Secretary of the Interior and former Governor of North Dakota. Technology entrepreneur focused on energy development and public lands management.' },
  { name: 'Brooke Rollins', slug: 'brooke-rollins', state: 'TX', party: 'republican', title: 'Secretary of Agriculture', since_year: 2025, bio: 'Secretary of Agriculture, previously served as head of the America First Policy Institute. Focused on supporting American farmers and rural communities.' },
  { name: 'Howard Lutnick', slug: 'howard-lutnick', state: 'NY', party: 'republican', title: 'Secretary of Commerce', since_year: 2025, bio: 'Secretary of Commerce and CEO of Cantor Fitzgerald. Focused on trade policy, tariffs, and American economic competitiveness.' },
  { name: 'Lori Chavez-DeRemer', slug: 'lori-chavez-deremer', state: 'OR', party: 'republican', title: 'Secretary of Labor', since_year: 2025, bio: 'Secretary of Labor and former U.S. Representative from Oregon. Focused on workforce development, job training, and labor market policies.' },
  { name: 'Robert F. Kennedy Jr.', slug: 'robert-f-kennedy-jr', state: 'CA', party: 'republican', title: 'Secretary of Health and Human Services', since_year: 2025, bio: 'Secretary of Health and Human Services, known for his "Make America Healthy Again" initiative. Environmental lawyer turned health policy advocate.' },
  { name: 'Scott Turner', slug: 'scott-turner', state: 'TX', party: 'republican', title: 'Secretary of Housing and Urban Development', since_year: 2025, bio: 'Secretary of Housing and Urban Development, former NFL player and Texas state legislator. Focused on housing affordability and community development.' },
  { name: 'Sean Duffy', slug: 'sean-duffy', state: 'WI', party: 'republican', title: 'Secretary of Transportation', since_year: 2025, bio: 'Secretary of Transportation and former U.S. Representative from Wisconsin. Focused on infrastructure modernization and reducing regulatory barriers.' },
  { name: 'Chris Wright', slug: 'chris-wright', state: 'CO', party: 'republican', title: 'Secretary of Energy', since_year: 2025, bio: 'Secretary of Energy and CEO of Liberty Energy. Strong advocate for fossil fuel development and energy independence.' },
  { name: 'Linda McMahon', slug: 'linda-mcmahon', state: 'CT', party: 'republican', title: 'Secretary of Education', since_year: 2025, bio: 'Secretary of Education, former WWE executive and SBA Administrator. Focused on school choice, parental rights, and reducing federal education mandates.' },
  { name: 'Doug Collins', slug: 'doug-collins', state: 'GA', party: 'republican', title: 'Secretary of Veterans Affairs', since_year: 2025, bio: 'Secretary of Veterans Affairs and former U.S. Representative from Georgia. Chaplain in the Air Force Reserve focused on improving veteran services.' },
  { name: 'Kristi Noem', slug: 'kristi-noem-dhs', state: 'SD', party: 'republican', title: 'Secretary of Homeland Security', since_year: 2025, bio: 'Secretary of Homeland Security and former Governor of South Dakota. Focused on border security, immigration enforcement, and national security.' },
  { name: 'Tulsi Gabbard', slug: 'tulsi-gabbard', state: 'HI', party: 'republican', title: 'Director of National Intelligence', since_year: 2025, bio: 'Director of National Intelligence, former Democratic congresswoman from Hawaii and Army National Guard veteran. Known for anti-interventionist foreign policy views.' },
  { name: 'John Ratcliffe', slug: 'john-ratcliffe', state: 'TX', party: 'republican', title: 'CIA Director', since_year: 2025, bio: 'Director of the Central Intelligence Agency, previously serving in the role of Director of National Intelligence under Trump\'s first term.' },
  { name: 'Susie Wiles', slug: 'susie-wiles', state: 'FL', party: 'republican', title: 'White House Chief of Staff', since_year: 2025, bio: 'White House Chief of Staff and the first woman to hold the position. Long-time Republican strategist who managed Trump\'s successful 2024 campaign.' },
  { name: 'Russell Vought', slug: 'russell-vought', state: 'VA', party: 'republican', title: 'Director of the Office of Management and Budget', since_year: 2025, bio: 'Director of OMB, returning to the role he held in Trump\'s first term. Key architect of budget and regulatory reform policies.' },
  { name: 'Elon Musk', slug: 'elon-musk', state: 'TX', party: 'independent', title: 'Senior Advisor, Department of Government Efficiency', since_year: 2025, bio: 'Senior Advisor leading the Department of Government Efficiency (DOGE) initiative. CEO of Tesla, SpaceX, and owner of X. Focused on cutting government waste and modernizing federal operations.' },
]

// Check existing slugs to avoid duplicates
const { data: existing } = await supabase.from('politicians').select('slug')
const existingSlugs = new Set(existing.map(e => e.slug))

const toInsert = OFFICIALS.filter(o => !existingSlugs.has(o.slug))
const skipped = OFFICIALS.filter(o => existingSlugs.has(o.slug))

if (skipped.length > 0) {
  console.log(`Skipping ${skipped.length} already existing:`)
  skipped.forEach(s => console.log(`  - ${s.name} (${s.slug})`))
}

if (toInsert.length === 0) {
  console.log('\nNo new officials to insert.')
  process.exit(0)
}

console.log(`\nInserting ${toInsert.length} presidential/cabinet officials...`)

const rows = toInsert.map(o => ({
  ...o,
  chamber: 'presidential',
}))

const { data: inserted, error } = await supabase.from('politicians').insert(rows).select('id, name, slug')

if (error) {
  console.error('Error:', error.message)
  process.exit(1)
}

console.log(`Inserted ${inserted.length} officials:`)
inserted.forEach(p => console.log(`  ✓ ${p.name}`))

// Now generate stances for them
console.log('\nGenerating stances...')

const { data: issues } = await supabase.from('issues').select('id, slug')

const PARTY_DEFAULTS = {
  republican: {
    'economy-and-jobs': 'supports',
    'healthcare-and-medicare': 'opposes',
    'immigration-and-border-security': 'supports',
    'education-and-student-debt': 'opposes',
    'national-defense-and-military': 'supports',
    'climate-and-environment': 'opposes',
    'gun-policy-and-2nd-amendment': 'opposes',
    'criminal-justice-reform': 'opposes',
    'social-security-and-medicare': 'mixed',
    'foreign-policy-and-diplomacy': 'supports',
    'technology-and-ai-regulation': 'mixed',
    'housing-and-affordability': 'opposes',
    'infrastructure-and-transportation': 'supports',
    'energy-policy-and-oil-gas': 'supports',
  },
  independent: {
    'economy-and-jobs': 'mixed',
    'healthcare-and-medicare': 'supports',
    'immigration-and-border-security': 'mixed',
    'education-and-student-debt': 'mixed',
    'national-defense-and-military': 'mixed',
    'climate-and-environment': 'mixed',
    'gun-policy-and-2nd-amendment': 'mixed',
    'criminal-justice-reform': 'mixed',
    'social-security-and-medicare': 'mixed',
    'foreign-policy-and-diplomacy': 'mixed',
    'technology-and-ai-regulation': 'supports',
    'housing-and-affordability': 'mixed',
    'infrastructure-and-transportation': 'supports',
    'energy-policy-and-oil-gas': 'supports',
  },
}

// Some specific overrides for notable officials
const OVERRIDES = {
  'donald-trump': {
    'economy-and-jobs': 'supports',
    'immigration-and-border-security': 'supports',
    'climate-and-environment': 'opposes',
    'energy-policy-and-oil-gas': 'supports',
    'foreign-policy-and-diplomacy': 'mixed',
    'technology-and-ai-regulation': 'mixed',
  },
  'robert-f-kennedy-jr': {
    'healthcare-and-medicare': 'supports',
    'climate-and-environment': 'supports',
    'technology-and-ai-regulation': 'supports',
  },
  'tulsi-gabbard': {
    'national-defense-and-military': 'mixed',
    'foreign-policy-and-diplomacy': 'mixed',
  },
  'elon-musk': {
    'technology-and-ai-regulation': 'opposes',
    'economy-and-jobs': 'supports',
    'energy-policy-and-oil-gas': 'supports',
    'climate-and-environment': 'mixed',
  },
}

const stanceRows = []
for (const pol of inserted) {
  const official = OFFICIALS.find(o => o.slug === pol.slug)
  const partyDefaults = PARTY_DEFAULTS[official.party] || PARTY_DEFAULTS.independent
  const overrides = OVERRIDES[pol.slug] || {}

  for (const issue of issues) {
    let stance = overrides[issue.slug] || partyDefaults[issue.slug]
    if (!stance) continue

    // Small variation
    const rand = Math.random()
    if (rand < 0.06 && stance !== 'mixed') stance = 'mixed'

    stanceRows.push({
      politician_id: pol.id,
      issue_id: issue.id,
      stance,
    })
  }
}

const BATCH = 200
let count = 0
for (let i = 0; i < stanceRows.length; i += BATCH) {
  const batch = stanceRows.slice(i, i + BATCH)
  const { error } = await supabase.from('politician_issues').insert(batch)
  if (error) {
    console.error('Stance insert error:', error.message)
    break
  }
  count += batch.length
}

console.log(`Inserted ${count} stances for presidential officials`)

// Final count
const { count: total } = await supabase.from('politicians').select('*', { count: 'exact', head: true })
const { data: chambers } = await supabase.from('politicians').select('chamber')
const breakdown = {}
chambers.forEach(p => { breakdown[p.chamber] = (breakdown[p.chamber] || 0) + 1 })
console.log(`\nTotal politicians: ${total}`)
console.log('Chamber breakdown:', breakdown)
