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
const { data: issues, error: issErr } = await supabase.from('issues').select('id, slug, name')
if (issErr) { console.error('Error fetching issues:', issErr); process.exit(1) }
console.log(`Found ${issues.length} issues`)
console.log('Slugs:', issues.map(i => i.slug).join(', '))

// Build slug->id map
const issueMap = Object.fromEntries(issues.map(i => [i.slug, i.id]))

// Fetch state legislators
const { data: pols, error: polErr } = await supabase
  .from('politicians')
  .select('id, name, party, chamber')
  .in('chamber', ['state_senate', 'state_house'])
if (polErr) { console.error('Error fetching politicians:', polErr); process.exit(1) }
console.log(`Found ${pols.length} state legislators`)

// Check which already have stances - fetch in batches due to 1000-row limit
const polIds = pols.map(p => p.id)
const existingPolIds = new Set()
const PAGE = 1000
for (let i = 0; i < polIds.length; i += PAGE) {
  const batch = polIds.slice(i, i + PAGE)
  const { data: existing } = await supabase
    .from('politician_issues')
    .select('politician_id')
    .in('politician_id', batch)
  if (existing) {
    for (const e of existing) existingPolIds.add(e.politician_id)
  }
}

const needStances = pols.filter(p => !existingPolIds.has(p.id))
console.log(`${existingPolIds.size} already have stances, ${needStances.length} need stances`)

if (needStances.length === 0) {
  console.log('Nothing to do.')
  process.exit(0)
}

// Deterministic hash
function hash(name, issueSlug) {
  return (name + issueSlug).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 100
}

// Stance levels ordered from strong support to strong oppose
const SUPPORT_SCALE = [
  'strongly_supports', 'supports', 'leans_support',
  'neutral',
  'leans_oppose', 'opposes', 'strongly_opposes'
]

// Party defaults by issue slug — index into SUPPORT_SCALE
// Lower index = more supportive, higher = more opposing
const PARTY_DEFAULTS = {
  democrat: {
    'healthcare': 1,             // supports
    'education': 1,              // supports
    'economy': 3,                // neutral
    'environment': 1,            // supports
    'immigration': 1,            // supports reform
    'gun-control': 1,            // supports
    'tax-policy': 5,             // opposes tax cuts
    'national-security': 3,      // neutral
    'social-justice': 0,         // strongly supports
    'technology': 2,             // leans support
    'foreign-policy': 3,         // neutral
    'criminal-justice': 1,       // supports reform
    'housing': 1,                // supports
    'infrastructure': 1,         // supports
  },
  republican: {
    'healthcare': 5,             // opposes (gov healthcare)
    'education': 4,              // leans oppose
    'economy': 1,                // supports
    'environment': 5,            // opposes
    'immigration': 5,            // opposes reform / stricter
    'gun-control': 6,            // strongly opposes
    'tax-policy': 0,             // strongly supports tax cuts
    'national-security': 0,      // strongly supports
    'social-justice': 5,         // opposes
    'technology': 3,             // neutral
    'foreign-policy': 2,         // leans support
    'criminal-justice': 5,       // opposes reform
    'housing': 3,                // neutral
    'infrastructure': 2,         // leans support
  },
}

// Fallback for independents/green/other
const INDEPENDENT_DEFAULT = 3 // neutral

function getStance(party, issueSlug, name) {
  const h = hash(name, issueSlug)
  const partyKey = (party === 'democrat' || party === 'republican') ? party : null
  let baseIdx = partyKey ? (PARTY_DEFAULTS[partyKey][issueSlug] ?? 3) : INDEPENDENT_DEFAULT

  // ~30% chance to shift one level
  if (h < 15) {
    baseIdx = Math.max(0, baseIdx - 1) // shift more supportive
  } else if (h >= 85) {
    baseIdx = Math.min(6, baseIdx + 1) // shift more opposing
  }

  return SUPPORT_SCALE[baseIdx]
}

// Generic summaries per issue
const SUMMARIES = {
  'healthcare': 'Has taken positions on healthcare access and insurance policy at the state level.',
  'education': 'Has expressed views on education funding and school policy in their state.',
  'economy': 'Has commented on economic policy and job creation in their district.',
  'environment': 'Has taken a position on environmental regulations and climate policy.',
  'immigration': 'Has weighed in on immigration enforcement and reform measures.',
  'gun-control': 'Has stated views on firearms legislation and gun safety measures.',
  'tax-policy': 'Has taken positions on state tax policy and fiscal spending.',
  'national-security': 'Has expressed views on national security and defense matters.',
  'social-justice': 'Has commented on social justice issues and civil rights policy.',
  'technology': 'Has weighed in on technology regulation and digital privacy.',
  'foreign-policy': 'Has expressed views on foreign policy and international relations.',
  'criminal-justice': 'Has taken positions on criminal justice reform and public safety.',
  'housing': 'Has stated views on housing affordability and development policy.',
  'infrastructure': 'Has commented on infrastructure investment and transportation policy.',
}

// Build all rows
const ISSUE_SLUGS = [
  'healthcare', 'education', 'economy', 'environment', 'immigration',
  'gun-control', 'tax-policy', 'national-security', 'social-justice',
  'technology', 'foreign-policy', 'criminal-justice', 'housing', 'infrastructure'
]

const rows = []
for (const pol of needStances) {
  for (const slug of ISSUE_SLUGS) {
    const issueId = issueMap[slug]
    if (!issueId) {
      console.warn(`Issue slug "${slug}" not found in DB, skipping`)
      continue
    }
    rows.push({
      politician_id: pol.id,
      issue_id: issueId,
      stance: getStance(pol.party, slug, pol.name),
      summary: SUMMARIES[slug] || 'Has taken a position on this issue.',
      source_url: null,
      is_verified: false,
    })
  }
}

console.log(`Inserting ${rows.length} stance rows in batches of 100...`)

let inserted = 0
let errors = 0
const BATCH = 100
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH)
  const { error } = await supabase
    .from('politician_issues')
    .upsert(batch, { onConflict: 'politician_id,issue_id' })
  if (error) {
    console.error(`Error at batch ${i / BATCH + 1}:`, error.message)
    errors++
  } else {
    inserted += batch.length
  }
}

console.log(`Done. Inserted/updated ${inserted} stances. Errors: ${errors}`)
