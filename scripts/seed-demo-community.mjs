/**
 * Seed 400 demo community members (8 per state + DC).
 * Each voter gets realistic quiz_answers based on their state's political lean.
 *
 * Usage:
 *   node scripts/seed-demo-community.mjs
 *   node scripts/seed-demo-community.mjs --dry-run    (preview without writing)
 *   node scripts/seed-demo-community.mjs --delete      (remove all demo users)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import crypto from 'crypto'

// Load env
const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)

const DRY_RUN = process.argv.includes('--dry-run')
const DELETE = process.argv.includes('--delete')
const ADD_MODE = process.argv.includes('--add')
const ADD_COUNT = ADD_MODE ? parseInt(process.argv[process.argv.indexOf('--add') + 1] || '400', 10) : 0

// ── State political leanings ──
// Scale: -1 = solid blue, -0.5 = lean blue, 0 = swing, 0.5 = lean red, 1 = solid red
const STATE_LEAN = {
  AL: 0.9, AK: 0.5, AZ: 0.1, AR: 0.9, CA: -0.9,
  CO: -0.4, CT: -0.6, DE: -0.5, FL: 0.2, GA: 0.0,
  HI: -0.8, ID: 0.9, IL: -0.5, IN: 0.6, IA: 0.3,
  KS: 0.7, KY: 0.8, LA: 0.8, ME: -0.3, MD: -0.7,
  MA: -0.8, MI: -0.1, MN: -0.2, MS: 0.8, MO: 0.6,
  MT: 0.6, NE: 0.6, NV: -0.1, NH: -0.1, NJ: -0.5,
  NM: -0.4, NY: -0.7, NC: 0.1, ND: 0.8, OH: 0.4,
  OK: 0.9, OR: -0.5, PA: 0.0, RI: -0.6, SC: 0.7,
  SD: 0.8, TN: 0.8, TX: 0.4, UT: 0.7, VT: -0.8,
  VA: -0.3, WA: -0.6, WV: 0.9, WI: 0.0, WY: 0.9,
  DC: -1.0,
}

const STATES = Object.keys(STATE_LEAN)

// Issue slugs
const ISSUES = [
  'economy-and-jobs', 'healthcare-and-medicare', 'immigration-and-border-security',
  'education-and-student-debt', 'national-defense-and-military', 'climate-and-environment',
  'criminal-justice-reform', 'foreign-policy-and-diplomacy', 'technology-and-ai-regulation',
  'social-security-and-medicare', 'gun-policy-and-2nd-amendment', 'infrastructure-and-transportation',
  'housing-and-affordability', 'energy-policy-and-oil-gas', 'reproductive-rights',
  'lgbtq-rights', 'drug-policy', 'voting-rights', 'taxes-and-spending',
  'labor-and-unions', 'privacy-and-surveillance', 'trade-and-tariffs',
]

// "Left" baseline stances (Democrat-aligned voter) and "Right" baseline (Republican-aligned voter)
// These represent how a typical partisan voter feels (not a politician)
const LEFT_STANCES = {
  'economy-and-jobs': 'supports',
  'healthcare-and-medicare': 'strongly_supports',
  'immigration-and-border-security': 'leans_support',
  'education-and-student-debt': 'strongly_supports',
  'national-defense-and-military': 'neutral',
  'climate-and-environment': 'strongly_supports',
  'criminal-justice-reform': 'strongly_supports',
  'foreign-policy-and-diplomacy': 'supports',
  'technology-and-ai-regulation': 'supports',
  'social-security-and-medicare': 'strongly_supports',
  'gun-policy-and-2nd-amendment': 'supports',
  'infrastructure-and-transportation': 'strongly_supports',
  'housing-and-affordability': 'strongly_supports',
  'energy-policy-and-oil-gas': 'opposes',
  'reproductive-rights': 'strongly_supports',
  'lgbtq-rights': 'strongly_supports',
  'drug-policy': 'supports',
  'voting-rights': 'strongly_supports',
  'taxes-and-spending': 'supports',
  'labor-and-unions': 'strongly_supports',
  'privacy-and-surveillance': 'supports',
  'trade-and-tariffs': 'supports',
}

const RIGHT_STANCES = {
  'economy-and-jobs': 'supports',
  'healthcare-and-medicare': 'opposes',
  'immigration-and-border-security': 'strongly_supports',
  'education-and-student-debt': 'strongly_opposes',
  'national-defense-and-military': 'strongly_supports',
  'climate-and-environment': 'strongly_opposes',
  'criminal-justice-reform': 'opposes',
  'foreign-policy-and-diplomacy': 'supports',
  'technology-and-ai-regulation': 'opposes',
  'social-security-and-medicare': 'supports',
  'gun-policy-and-2nd-amendment': 'strongly_opposes',
  'infrastructure-and-transportation': 'supports',
  'housing-and-affordability': 'leans_oppose',
  'energy-policy-and-oil-gas': 'strongly_supports',
  'reproductive-rights': 'strongly_opposes',
  'lgbtq-rights': 'opposes',
  'drug-policy': 'opposes',
  'voting-rights': 'opposes',
  'taxes-and-spending': 'strongly_opposes',
  'labor-and-unions': 'opposes',
  'privacy-and-surveillance': 'leans_oppose',
  'trade-and-tariffs': 'opposes',
}

// Ordered stance values from most supportive to most opposed
const STANCE_SCALE = [
  'strongly_supports', 'supports', 'leans_support', 'neutral',
  'leans_oppose', 'opposes', 'strongly_opposes',
]

const STANCE_TO_NUM = Object.fromEntries(STANCE_SCALE.map((s, i) => [s, i]))

/**
 * Generate a voter's stances for a state.
 * @param {number} stateLean -1 to 1 (blue to red)
 * @param {number} voterIndex 0-7, used to spread voters across the spectrum
 */
function generateVoterStances(stateLean, voterIndex) {
  const stances = {}

  // Each voter has a personal offset from state mean
  // Spread: 0-7 maps to roughly -0.6 to +0.6 around state lean
  const personalOffset = ((voterIndex / 7) - 0.5) * 1.2
  const voterLean = Math.max(-1, Math.min(1, stateLean + personalOffset))

  for (const issue of ISSUES) {
    const leftNum = STANCE_TO_NUM[LEFT_STANCES[issue]] ?? 3
    const rightNum = STANCE_TO_NUM[RIGHT_STANCES[issue]] ?? 3

    // Interpolate between left and right based on voter lean
    // voterLean -1 = full left, +1 = full right
    const t = (voterLean + 1) / 2  // 0 to 1
    let rawNum = leftNum + (rightNum - leftNum) * t

    // Add per-issue noise (±1 step) for realism
    const noise = (Math.random() - 0.5) * 2
    rawNum = Math.round(Math.max(0, Math.min(6, rawNum + noise)))

    stances[issue] = STANCE_SCALE[rawNum]

    // Occasionally add 'mixed' for cross-cutting issues (~8%)
    if (Math.random() < 0.08) {
      stances[issue] = 'mixed'
    }
  }

  // Some voters skip a few issues (~15% chance per issue to not answer)
  const answered = {}
  for (const [slug, stance] of Object.entries(stances)) {
    if (Math.random() > 0.15) {
      answered[slug] = stance
    }
  }

  // Ensure at least 10 answers
  const slugs = Object.keys(stances)
  while (Object.keys(answered).length < 10) {
    const slug = slugs[Math.floor(Math.random() * slugs.length)]
    answered[slug] = stances[slug]
  }

  return answered
}

function generateAnonymousId() {
  return crypto.randomBytes(4).toString('hex') // 8-char hex
}

// ── State population weights (relative, based on 2020 census) ──
// Higher = more voters allocated when staggering
const STATE_POP_WEIGHT = {
  CA: 39.5, TX: 29.1, FL: 21.5, NY: 20.2, PA: 13.0,
  IL: 12.8, OH: 11.8, GA: 10.7, NC: 10.4, MI: 10.0,
  NJ: 9.3, VA: 8.6, WA: 7.6, AZ: 7.2, MA: 7.0,
  TN: 6.9, IN: 6.8, MO: 6.2, MD: 6.2, WI: 5.9,
  CO: 5.8, MN: 5.7, SC: 5.1, AL: 5.0, LA: 4.7,
  KY: 4.5, OR: 4.2, OK: 4.0, CT: 3.6, UT: 3.3,
  IA: 3.2, NV: 3.1, AR: 3.0, MS: 3.0, KS: 2.9,
  NM: 2.1, NE: 1.9, ID: 1.9, WV: 1.8, HI: 1.5,
  NH: 1.4, ME: 1.4, MT: 1.1, RI: 1.1, DE: 1.0,
  SD: 0.9, ND: 0.8, AK: 0.7, VT: 0.6, WY: 0.6,
  DC: 0.7,
}

/**
 * Distribute `total` voters across states proportional to population.
 * Every state gets at least 2, big states get up to ~20.
 */
function distributeByPopulation(total) {
  const totalPop = Object.values(STATE_POP_WEIGHT).reduce((a, b) => a + b, 0)
  const perState = {}
  let assigned = 0

  // First pass: proportional allocation with floor of 2
  for (const st of STATES) {
    const weight = STATE_POP_WEIGHT[st] || 1.0
    const raw = Math.max(2, Math.round((weight / totalPop) * total))
    perState[st] = raw
    assigned += raw
  }

  // Adjust to hit target: add/remove from largest states
  const sorted = [...STATES].sort((a, b) => (STATE_POP_WEIGHT[b] || 1) - (STATE_POP_WEIGHT[a] || 1))
  let idx = 0
  while (assigned > total) {
    if (perState[sorted[idx]] > 2) {
      perState[sorted[idx]]--
      assigned--
    }
    idx = (idx + 1) % sorted.length
  }
  while (assigned < total) {
    perState[sorted[idx]]++
    assigned++
    idx = (idx + 1) % sorted.length
  }

  return perState
}

// ── First names pool for display names ──
const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Drew',
  'Quinn', 'Avery', 'Parker', 'Sage', 'Robin', 'Skyler', 'River', 'Dakota',
  'Blake', 'Emery', 'Finley', 'Hayden', 'Jesse', 'Kerry', 'Logan', 'Marley',
  'Noel', 'Oakley', 'Peyton', 'Reese', 'Sam', 'Tatum', 'Val', 'Wren',
]

async function deleteDemo() {
  console.log('Deleting all demo users...')

  // Find demo profiles
  const { data: demos } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_demo', true)

  if (!demos?.length) {
    console.log('No demo users found.')
    return
  }

  console.log(`Found ${demos.length} demo profiles. Deleting auth users...`)

  let deleted = 0, failed = 0
  for (const d of demos) {
    const { error } = await supabase.auth.admin.deleteUser(d.id)
    if (error) {
      console.error(`  Failed to delete ${d.id}: ${error.message}`)
      failed++
    } else {
      deleted++
    }
  }

  console.log(`Deleted: ${deleted}, Failed: ${failed}`)
}

async function seed() {
  const totalVoters = STATES.length * 8 // 51 * 8 = 408
  console.log(`Seeding ${totalVoters} demo community members across ${STATES.length} states...`)

  if (DRY_RUN) {
    // Just show what would be created
    for (const state of STATES.slice(0, 3)) {
      console.log(`\n${state} (lean: ${STATE_LEAN[state]}):`)
      for (let i = 0; i < 8; i++) {
        const stances = generateVoterStances(STATE_LEAN[state], i)
        const answered = Object.keys(stances).length
        const supports = Object.values(stances).filter(s => s.includes('support')).length
        const opposes = Object.values(stances).filter(s => s.includes('oppose')).length
        console.log(`  Voter ${i}: ${answered} issues, ${supports} support, ${opposes} oppose`)
      }
    }
    console.log(`\n... (showing 3 of ${STATES.length} states)`)
    console.log(`Total would be: ${totalVoters} voters`)
    return
  }

  // Check for existing demo users
  const { count: existingCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_demo', true)

  if (existingCount > 0) {
    console.log(`WARNING: ${existingCount} demo users already exist. Run with --delete first to remove them.`)
    process.exit(1)
  }

  let created = 0, failed = 0

  for (const state of STATES) {
    process.stdout.write(`${state}...`)

    for (let i = 0; i < 8; i++) {
      const anonymousId = generateAnonymousId()
      const email = `demo-${state.toLowerCase()}-${i}@poli-demo.local`
      const displayName = FIRST_NAMES[(created) % FIRST_NAMES.length]
      const stances = generateVoterStances(STATE_LEAN[state], i)

      // 1. Create auth user (no password = can't log in)
      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { display_name: displayName },
      })

      if (authErr) {
        console.error(`\n  AUTH FAILED for ${email}: ${authErr.message}`)
        failed++
        continue
      }

      // 2. Update profile with demo data
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          state,
          quiz_answers: stances,
          sharing_enabled: true,
          anonymous_id: anonymousId,
          is_demo: true,
          display_name: displayName,
        })
        .eq('id', authUser.user.id)

      if (profileErr) {
        console.error(`\n  PROFILE FAILED for ${email}: ${profileErr.message}`)
        failed++
        continue
      }

      created++
    }
  }

  console.log(`\n\n=== SUMMARY ===`)
  console.log(`Created: ${created}`)
  console.log(`Failed: ${failed}`)
  console.log(`Total in DB: ${created} demo community members`)
}

async function addMore(total) {
  const perState = distributeByPopulation(total)
  const actualTotal = Object.values(perState).reduce((a, b) => a + b, 0)

  console.log(`Adding ${actualTotal} more demo voters (population-weighted)...`)

  // Show distribution
  const sorted = Object.entries(perState).sort((a, b) => b[1] - a[1])
  console.log(`Top 10: ${sorted.slice(0, 10).map(([s, n]) => `${s}:${n}`).join(', ')}`)
  console.log(`Bottom 10: ${sorted.slice(-10).map(([s, n]) => `${s}:${n}`).join(', ')}`)

  if (DRY_RUN) {
    console.log('\nFull distribution:')
    for (const [st, n] of sorted) console.log(`  ${st}: ${n}`)
    console.log(`\nTotal: ${actualTotal}`)
    return
  }

  // Get current max index per state to avoid email collisions
  const { data: existing } = await supabase
    .from('profiles')
    .select('email')
    .eq('is_demo', true)

  const stateMaxIdx = {}
  for (const e of existing ?? []) {
    const match = e.email?.match(/^demo-(\w+)-(\d+)@/)
    if (match) {
      const st = match[1].toUpperCase()
      const idx = parseInt(match[2], 10)
      stateMaxIdx[st] = Math.max(stateMaxIdx[st] || 0, idx + 1)
    }
  }

  let created = 0, failed = 0

  for (const state of STATES) {
    const count = perState[state]
    const startIdx = stateMaxIdx[state] || 0
    process.stdout.write(`${state}(${count})...`)

    for (let i = 0; i < count; i++) {
      const idx = startIdx + i
      const anonymousId = generateAnonymousId()
      const email = `demo-${state.toLowerCase()}-${idx}@poli-demo.local`
      const displayName = FIRST_NAMES[(created) % FIRST_NAMES.length]
      // Use idx to spread voters across spectrum within the state
      const voterIndex = Math.random() * 7
      const stances = generateVoterStances(STATE_LEAN[state], voterIndex)

      const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { display_name: displayName },
      })

      if (authErr) {
        console.error(`\n  AUTH FAILED for ${email}: ${authErr.message}`)
        failed++
        continue
      }

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          state,
          quiz_answers: stances,
          sharing_enabled: true,
          anonymous_id: anonymousId,
          is_demo: true,
          display_name: displayName,
        })
        .eq('id', authUser.user.id)

      if (profileErr) {
        console.error(`\n  PROFILE FAILED for ${email}: ${profileErr.message}`)
        failed++
        continue
      }

      created++
    }
  }

  console.log(`\n\n=== SUMMARY ===`)
  console.log(`Created: ${created}`)
  console.log(`Failed: ${failed}`)
}

if (DELETE) {
  deleteDemo().catch(console.error)
} else if (ADD_MODE) {
  addMore(ADD_COUNT).catch(console.error)
} else {
  seed().catch(console.error)
}
