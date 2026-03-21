import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load env
const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

// Fetch all issues
const { data: issues } = await supabase.from('issues').select('id, slug, name')
console.log(`Found ${issues.length} issues`)

// Fetch all politicians
const { data: politicians } = await supabase.from('politicians').select('id, name, party')
console.log(`Found ${politicians.length} politicians`)

// Fetch existing stances
const { data: existing } = await supabase.from('politician_issues').select('politician_id, issue_id')
const existingSet = new Set(existing.map(e => `${e.politician_id}:${e.issue_id}`))
console.log(`Existing stances: ${existing.length}`)

// Party default stances for each issue
const PARTY_DEFAULTS = {
  democrat: {
    'economy-jobs': 'mixed',
    'healthcare-medicare': 'supports',
    'immigration-border': 'opposes',
    'education-student-debt': 'supports',
    'national-defense': 'mixed',
    'climate-environment': 'supports',
    'gun-policy': 'supports',
    'criminal-justice': 'supports',
    'social-security': 'supports',
    'abortion-reproductive-rights': 'supports',
    'voting-rights': 'supports',
    'foreign-policy': 'mixed',
    'technology-privacy': 'supports',
    'housing-affordability': 'supports',
  },
  republican: {
    'economy-jobs': 'supports',
    'healthcare-medicare': 'opposes',
    'immigration-border': 'supports',
    'education-student-debt': 'opposes',
    'national-defense': 'supports',
    'climate-environment': 'opposes',
    'gun-policy': 'opposes',
    'criminal-justice': 'opposes',
    'social-security': 'mixed',
    'abortion-reproductive-rights': 'opposes',
    'voting-rights': 'opposes',
    'foreign-policy': 'supports',
    'technology-privacy': 'mixed',
    'housing-affordability': 'opposes',
  },
  independent: {
    'economy-jobs': 'mixed',
    'healthcare-medicare': 'supports',
    'immigration-border': 'mixed',
    'education-student-debt': 'supports',
    'national-defense': 'mixed',
    'climate-environment': 'supports',
    'gun-policy': 'mixed',
    'criminal-justice': 'supports',
    'social-security': 'supports',
    'abortion-reproductive-rights': 'supports',
    'voting-rights': 'supports',
    'foreign-policy': 'mixed',
    'technology-privacy': 'supports',
    'housing-affordability': 'supports',
  },
  green: {
    'economy-jobs': 'mixed',
    'healthcare-medicare': 'supports',
    'immigration-border': 'opposes',
    'education-student-debt': 'supports',
    'national-defense': 'opposes',
    'climate-environment': 'supports',
    'gun-policy': 'supports',
    'criminal-justice': 'supports',
    'social-security': 'supports',
    'abortion-reproductive-rights': 'supports',
    'voting-rights': 'supports',
    'foreign-policy': 'opposes',
    'technology-privacy': 'supports',
    'housing-affordability': 'supports',
  },
}

// Summaries per issue per stance
const SUMMARIES = {
  democrat: {
    'economy-jobs': {
      supports: 'Supports targeted tax relief for middle-class families and small businesses while investing in workforce development.',
      mixed: 'Advocates for a balanced approach combining tax reform with public investment in infrastructure and clean energy jobs.',
      opposes: 'Opposes trickle-down tax cuts that disproportionately benefit the wealthy and increase the deficit.',
    },
    'healthcare-medicare': {
      supports: 'Supports expanding access to affordable healthcare, strengthening the ACA, and lowering prescription drug costs.',
      mixed: 'Supports healthcare reform but seeks a pragmatic approach balancing public and private options.',
    },
    'immigration-border': {
      opposes: 'Opposes hardline enforcement-only approaches; supports comprehensive reform with a pathway to citizenship.',
      mixed: 'Supports border security improvements alongside a pathway for Dreamers and humane asylum processing.',
    },
    'education-student-debt': {
      supports: 'Supports student debt relief, increased Pell Grants, and making community college tuition-free.',
    },
    'national-defense': {
      supports: 'Supports a strong national defense with focused investments in cybersecurity and diplomatic alliances.',
      mixed: 'Supports maintaining military readiness while seeking greater oversight of defense spending.',
    },
    'climate-environment': {
      supports: 'Supports aggressive action on climate change, clean energy investment, and environmental regulations.',
    },
    'gun-policy': {
      supports: 'Supports universal background checks, assault weapons restrictions, and red flag laws to reduce gun violence.',
    },
    'criminal-justice': {
      supports: 'Supports criminal justice reform, police accountability, and investing in community-based public safety.',
    },
    'social-security': {
      supports: 'Supports protecting and expanding Social Security benefits; opposes privatization.',
    },
    'abortion-reproductive-rights': {
      supports: 'Supports protecting reproductive rights and access to abortion care.',
    },
    'voting-rights': {
      supports: 'Supports expanding voting access, opposing voter suppression, and protecting election integrity.',
    },
    'foreign-policy': {
      supports: 'Supports strong alliances, diplomacy-first approach, and multilateral cooperation.',
      mixed: 'Supports a balanced foreign policy combining diplomacy with strategic strength.',
    },
    'technology-privacy': {
      supports: 'Supports strong data privacy protections, tech regulation, and bridging the digital divide.',
    },
    'housing-affordability': {
      supports: 'Supports increased funding for affordable housing, rental assistance, and first-time homebuyer programs.',
    },
  },
  republican: {
    'economy-jobs': {
      supports: 'Supports tax cuts, deregulation, and free-market policies to stimulate economic growth and job creation.',
    },
    'healthcare-medicare': {
      opposes: 'Opposes government-run healthcare and ACA mandates; supports market-based solutions and health savings accounts.',
      mixed: 'Supports targeted healthcare reforms while opposing full government takeover of the system.',
    },
    'immigration-border': {
      supports: 'Supports strong border security, border wall construction, and strict enforcement of immigration laws.',
    },
    'education-student-debt': {
      opposes: 'Opposes blanket student loan forgiveness; supports school choice, charter schools, and parental rights in education.',
    },
    'national-defense': {
      supports: 'Supports increasing military funding, modernizing the armed forces, and maintaining a strong global military presence.',
    },
    'climate-environment': {
      opposes: 'Opposes burdensome environmental regulations; supports energy independence through domestic production.',
      mixed: 'Supports a balanced approach to environmental stewardship that protects both jobs and natural resources.',
    },
    'gun-policy': {
      opposes: 'Opposes new gun control measures; strongly supports Second Amendment rights and concealed carry protections.',
    },
    'criminal-justice': {
      opposes: 'Supports law enforcement, opposes defunding police, and advocates for tougher sentencing on violent crime.',
      mixed: 'Supports law enforcement while backing targeted reforms like the First Step Act.',
    },
    'social-security': {
      supports: 'Supports protecting Social Security for current beneficiaries while exploring market-based reforms for sustainability.',
      mixed: 'Supports reforming Social Security to ensure long-term solvency without raising taxes.',
    },
    'abortion-reproductive-rights': {
      opposes: 'Opposes abortion; supports pro-life policies and restrictions on taxpayer funding of abortion.',
      mixed: 'Supports restrictions on late-term abortion while allowing exceptions in limited circumstances.',
    },
    'voting-rights': {
      opposes: 'Supports voter ID requirements and election security measures; opposes federalizing elections.',
      mixed: 'Supports election integrity measures while ensuring all eligible citizens can vote.',
    },
    'foreign-policy': {
      supports: 'Supports peace through strength, strong military alliances, and confronting adversaries like China and Iran.',
    },
    'technology-privacy': {
      supports: 'Supports protecting free speech online, limiting government surveillance, and fostering innovation.',
      mixed: 'Supports innovation-friendly policies while addressing concerns about Big Tech censorship.',
    },
    'housing-affordability': {
      opposes: 'Opposes government housing mandates; supports reducing regulations to lower building costs and expand supply.',
      mixed: 'Supports market-based housing solutions and zoning reform to increase supply.',
    },
  },
}

// Known moderates / mavericks who should deviate from party line
const MODERATES = {
  // Dems who break on some issues
  'John Fetterman': { 'immigration-border': 'mixed', 'foreign-policy': 'supports' },
  'Joe Manchin': { 'gun-policy': 'opposes', 'climate-environment': 'mixed', 'economy-jobs': 'supports' },
  'Kirsten Sinema': { 'economy-jobs': 'supports', 'immigration-border': 'mixed' },
  'Ruben Gallego': { 'national-defense': 'supports', 'gun-policy': 'mixed' },
  'Tammy Baldwin': { 'economy-jobs': 'supports' },
  'Jon Ossoff': { 'technology-privacy': 'supports', 'national-defense': 'supports' },
  'Mark Kelly': { 'immigration-border': 'mixed', 'national-defense': 'supports' },
  'Gavin Newsom': { 'economy-jobs': 'mixed' },
  'Josh Shapiro': { 'economy-jobs': 'mixed', 'criminal-justice': 'mixed' },
  'Nancy Pelosi': { 'foreign-policy': 'supports' },
  'Dick Durbin': { 'criminal-justice': 'supports' },
  // Reps who break on some issues
  'Susan Collins': { 'abortion-reproductive-rights': 'mixed', 'healthcare-medicare': 'mixed', 'climate-environment': 'mixed' },
  'Lisa Murkowski': { 'abortion-reproductive-rights': 'mixed', 'climate-environment': 'mixed' },
  'Liz Cheney': { 'voting-rights': 'supports', 'foreign-policy': 'supports' },
  'Mike Lawler': { 'climate-environment': 'mixed', 'gun-policy': 'mixed' },
  'Brian Fitzpatrick': { 'climate-environment': 'mixed', 'gun-policy': 'mixed' },
  'Dan Crenshaw': { 'technology-privacy': 'supports' },
  'Mitt Romney': { 'climate-environment': 'mixed', 'voting-rights': 'mixed' },
  'Nancy Mace': { 'abortion-reproductive-rights': 'mixed', 'technology-privacy': 'supports' },
  'Mike DeWine': { 'gun-policy': 'mixed' },
  'Phil Scott': { 'climate-environment': 'mixed', 'gun-policy': 'mixed', 'abortion-reproductive-rights': 'mixed' },
  'Ron DeSantis': { 'technology-privacy': 'supports' },
  'JD Vance': { 'economy-jobs': 'supports', 'foreign-policy': 'mixed' },
  'Josh Hawley': { 'technology-privacy': 'supports', 'economy-jobs': 'mixed' },
}

// Build slug->id map for issues
const issueSlugMap = new Map(issues.map(i => [i.slug, i.id]))

function getSummary(party, issueSlug, stance) {
  const partySummaries = SUMMARIES[party]?.[issueSlug]
  if (partySummaries?.[stance]) return partySummaries[stance]
  // Fallback: try any available summary for that issue
  if (partySummaries) {
    const keys = Object.keys(partySummaries)
    if (keys.length > 0) return partySummaries[keys[0]]
  }
  return null
}

// Generate stances
const rows = []
let skipped = 0

for (const pol of politicians) {
  const partyDefaults = PARTY_DEFAULTS[pol.party] || PARTY_DEFAULTS.independent
  const overrides = MODERATES[pol.name] || {}

  for (const issue of issues) {
    const key = `${pol.id}:${issue.id}`
    if (existingSet.has(key)) {
      skipped++
      continue
    }

    const defaultStance = partyDefaults[issue.slug]
    if (!defaultStance) continue

    // Apply moderate overrides
    let stance = overrides[issue.slug] || defaultStance

    // Add slight randomness: ~12% chance of being "mixed" instead of strong stance
    const rand = Math.random()
    if (rand < 0.08 && stance !== 'mixed') {
      stance = 'mixed'
    }
    // ~4% chance of flipping (creates some realistic variation)
    else if (rand < 0.04) {
      if (stance === 'supports') stance = 'opposes'
      else if (stance === 'opposes') stance = 'supports'
    }

    const summary = getSummary(pol.party, issue.slug, stance)

    rows.push({
      politician_id: pol.id,
      issue_id: issue.id,
      stance,
      summary,
    })
  }
}

console.log(`\nSkipped ${skipped} existing stances`)
console.log(`Inserting ${rows.length} new stances...`)

// Insert in batches
const BATCH_SIZE = 200
let inserted = 0
for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE)
  const { error } = await supabase.from('politician_issues').insert(batch)
  if (error) {
    console.error('Error inserting batch:', error.message)
    break
  }
  inserted += batch.length
  process.stdout.write(`\r  Inserted ${inserted}/${rows.length}`)
}

console.log('\nDone!')

// Verify
const { count } = await supabase.from('politician_issues').select('*', { count: 'exact', head: true })
console.log(`Total stances in DB: ${count}`)
