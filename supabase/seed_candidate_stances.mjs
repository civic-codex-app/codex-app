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
console.log('Slugs:', issues.map(i => i.slug).join(', '))

// Fetch standalone candidates (no politician_id)
const { data: candidates } = await supabase
  .from('candidates')
  .select('id, name, party, politician_id')
  .is('politician_id', null)
console.log(`Found ${candidates.length} standalone candidates`)

// Check existing
const { data: existing } = await supabase.from('candidate_issues').select('candidate_id, issue_id')
const existingSet = new Set((existing ?? []).map(e => `${e.candidate_id}:${e.issue_id}`))
console.log(`Existing candidate stances: ${existing?.length ?? 0}`)

// Party default stances — using ACTUAL slugs from the DB
const PARTY_DEFAULTS = {
  democrat: {
    'economy-and-jobs': 'mixed',
    'healthcare-and-medicare': 'supports',
    'immigration-and-border-security': 'opposes',
    'education-and-student-debt': 'supports',
    'national-defense-and-military': 'mixed',
    'climate-and-environment': 'supports',
    'gun-policy-and-2nd-amendment': 'supports',
    'criminal-justice-reform': 'supports',
    'social-security-and-medicare': 'supports',
    'foreign-policy-and-diplomacy': 'mixed',
    'technology-and-ai-regulation': 'supports',
    'housing-and-affordability': 'supports',
    'infrastructure-and-transportation': 'supports',
    'energy-policy-and-oil-gas': 'mixed',
  },
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
    'education-and-student-debt': 'supports',
    'national-defense-and-military': 'mixed',
    'climate-and-environment': 'supports',
    'gun-policy-and-2nd-amendment': 'mixed',
    'criminal-justice-reform': 'supports',
    'social-security-and-medicare': 'supports',
    'foreign-policy-and-diplomacy': 'mixed',
    'technology-and-ai-regulation': 'supports',
    'housing-and-affordability': 'supports',
    'infrastructure-and-transportation': 'supports',
    'energy-policy-and-oil-gas': 'mixed',
  },
  green: {
    'economy-and-jobs': 'mixed',
    'healthcare-and-medicare': 'supports',
    'immigration-and-border-security': 'opposes',
    'education-and-student-debt': 'supports',
    'national-defense-and-military': 'opposes',
    'climate-and-environment': 'supports',
    'gun-policy-and-2nd-amendment': 'supports',
    'criminal-justice-reform': 'supports',
    'social-security-and-medicare': 'supports',
    'foreign-policy-and-diplomacy': 'opposes',
    'technology-and-ai-regulation': 'supports',
    'housing-and-affordability': 'supports',
    'infrastructure-and-transportation': 'supports',
    'energy-policy-and-oil-gas': 'opposes',
  },
}

// Summaries per party per issue
const SUMMARIES = {
  democrat: {
    'economy-and-jobs': { mixed: 'Advocates for a balanced approach combining tax reform with public investment in infrastructure and clean energy jobs.' },
    'healthcare-and-medicare': { supports: 'Supports expanding access to affordable healthcare, strengthening the ACA, and lowering prescription drug costs.' },
    'immigration-and-border-security': { opposes: 'Opposes hardline enforcement-only approaches; supports comprehensive reform with a pathway to citizenship.' },
    'education-and-student-debt': { supports: 'Supports student debt relief, increased Pell Grants, and making community college tuition-free.' },
    'national-defense-and-military': { mixed: 'Supports maintaining military readiness while seeking greater oversight of defense spending.' },
    'climate-and-environment': { supports: 'Supports aggressive action on climate change, clean energy investment, and environmental regulations.' },
    'gun-policy-and-2nd-amendment': { supports: 'Supports universal background checks, assault weapons restrictions, and red flag laws to reduce gun violence.' },
    'criminal-justice-reform': { supports: 'Supports criminal justice reform, police accountability, and investing in community-based public safety.' },
    'social-security-and-medicare': { supports: 'Supports protecting and expanding Social Security and Medicare benefits; opposes privatization.' },
    'foreign-policy-and-diplomacy': { mixed: 'Supports a balanced foreign policy combining diplomacy with strategic strength.' },
    'technology-and-ai-regulation': { supports: 'Supports strong data privacy protections, responsible AI regulation, and bridging the digital divide.' },
    'housing-and-affordability': { supports: 'Supports increased funding for affordable housing, rental assistance, and first-time homebuyer programs.' },
    'infrastructure-and-transportation': { supports: 'Supports major infrastructure investments including roads, bridges, broadband, and public transit.' },
    'energy-policy-and-oil-gas': { mixed: 'Supports transitioning to clean energy while managing economic impacts on fossil fuel communities.' },
  },
  republican: {
    'economy-and-jobs': { supports: 'Supports tax cuts, deregulation, and free-market policies to stimulate economic growth and job creation.' },
    'healthcare-and-medicare': { opposes: 'Opposes government-run healthcare and ACA mandates; supports market-based solutions and health savings accounts.' },
    'immigration-and-border-security': { supports: 'Supports strong border security, border wall construction, and strict enforcement of immigration laws.' },
    'education-and-student-debt': { opposes: 'Opposes blanket student loan forgiveness; supports school choice, charter schools, and parental rights in education.' },
    'national-defense-and-military': { supports: 'Supports increasing military funding, modernizing the armed forces, and maintaining a strong global presence.' },
    'climate-and-environment': { opposes: 'Opposes burdensome environmental regulations; supports energy independence through domestic production.' },
    'gun-policy-and-2nd-amendment': { opposes: 'Opposes new gun control measures; strongly supports Second Amendment rights and concealed carry protections.' },
    'criminal-justice-reform': { opposes: 'Supports law enforcement, opposes defunding police, and advocates for tougher sentencing on violent crime.' },
    'social-security-and-medicare': { mixed: 'Supports reforming Social Security and Medicare to ensure long-term solvency without raising taxes.' },
    'foreign-policy-and-diplomacy': { supports: 'Supports peace through strength, strong military alliances, and confronting adversaries.' },
    'technology-and-ai-regulation': { mixed: 'Supports innovation-friendly policies while addressing concerns about Big Tech and AI safety.' },
    'housing-and-affordability': { opposes: 'Opposes government housing mandates; supports reducing regulations to lower building costs and expand supply.' },
    'infrastructure-and-transportation': { supports: 'Supports infrastructure investment focused on roads, bridges, and rural broadband with private-sector partnerships.' },
    'energy-policy-and-oil-gas': { supports: 'Supports expanding domestic oil and gas production, energy independence, and an all-of-the-above energy strategy.' },
  },
  independent: {
    'economy-and-jobs': { mixed: 'Takes a pragmatic approach to economic policy, balancing fiscal responsibility with targeted public investment.' },
    'healthcare-and-medicare': { supports: 'Supports expanding healthcare access through a mix of public programs and private-sector innovation.' },
    'immigration-and-border-security': { mixed: 'Supports balanced immigration reform combining border security with humane treatment and legal pathways.' },
    'education-and-student-debt': { supports: 'Supports making education more affordable through targeted relief and institutional reform.' },
    'national-defense-and-military': { mixed: 'Supports a strong defense posture with responsible spending and diplomatic engagement.' },
    'climate-and-environment': { supports: 'Supports addressing climate change through innovation, market incentives, and common-sense regulation.' },
    'gun-policy-and-2nd-amendment': { mixed: 'Supports responsible gun ownership with common-sense safety measures like background checks.' },
    'criminal-justice-reform': { supports: 'Supports evidence-based criminal justice reform that balances public safety with rehabilitation.' },
    'social-security-and-medicare': { supports: 'Supports protecting benefits while exploring bipartisan reforms for long-term sustainability.' },
    'foreign-policy-and-diplomacy': { mixed: 'Supports a pragmatic foreign policy that prioritizes American interests while maintaining global partnerships.' },
    'technology-and-ai-regulation': { supports: 'Supports protecting digital privacy and promoting innovation with sensible AI regulation.' },
    'housing-and-affordability': { supports: 'Supports addressing the housing crisis through a mix of market solutions and targeted assistance.' },
    'infrastructure-and-transportation': { supports: 'Supports bipartisan infrastructure investment in roads, transit, and broadband connectivity.' },
    'energy-policy-and-oil-gas': { mixed: 'Supports a balanced energy policy that includes both traditional and renewable energy sources.' },
  },
}
SUMMARIES.green = SUMMARIES.independent

// Generate stances
const rows = []
let skipped = 0

for (const cand of candidates) {
  const partyDefaults = PARTY_DEFAULTS[cand.party] || PARTY_DEFAULTS.independent

  for (const issue of issues) {
    const key = `${cand.id}:${issue.id}`
    if (existingSet.has(key)) {
      skipped++
      continue
    }

    const defaultStance = partyDefaults[issue.slug]
    if (!defaultStance) {
      console.log(`  No default for ${cand.party} / ${issue.slug}`)
      continue
    }

    // Add variation: ~12% chance of "mixed" instead of strong stance
    let stance = defaultStance
    const rand = Math.random()
    if (rand < 0.10 && stance !== 'mixed') {
      stance = 'mixed'
    } else if (rand < 0.05) {
      if (stance === 'supports') stance = 'opposes'
      else if (stance === 'opposes') stance = 'supports'
    }

    const partySummaries = (SUMMARIES[cand.party] || SUMMARIES.independent)[issue.slug]
    const summary = partySummaries?.[stance] || partySummaries?.[defaultStance] || null

    rows.push({
      candidate_id: cand.id,
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
  const { error } = await supabase.from('candidate_issues').insert(batch)
  if (error) {
    console.error('Error inserting batch:', error.message)
    break
  }
  inserted += batch.length
  process.stdout.write(`\r  Inserted ${inserted}/${rows.length}`)
}

console.log('\nDone!')

// Verify
const { count } = await supabase.from('candidate_issues').select('*', { count: 'exact', head: true })
console.log(`Total candidate stances in DB: ${count}`)
