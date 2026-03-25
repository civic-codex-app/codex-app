/**
 * Seed likes across all federal politicians, weighted by prominence.
 * President gets the most likes. No one exceeds the president.
 *
 * Tiers:
 *   President:        200-300 likes
 *   VP:               120-180
 *   Cabinet/Presidential: 60-120
 *   Senate leaders:   80-140
 *   Prominent senators: 40-80
 *   Regular senators:   10-30
 *   Prominent house:   20-50
 *   Regular house:     3-15
 *   Governors:        15-40
 *
 * Also creates matching follows for every like.
 *
 * Usage:
 *   node scripts/seed-demo-likes.mjs
 *   node scripts/seed-demo-likes.mjs --delete   (clear all demo likes first)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)
const DELETE = process.argv.includes('--delete')

const STANCE_NUM = {
  strongly_supports: 0, supports: 1, leans_support: 2, neutral: 3,
  mixed: 3, leans_oppose: 4, opposes: 5, strongly_opposes: 6, unknown: -1,
}

function alignmentScore(voterStances, polStances) {
  let total = 0, matched = 0
  for (const [slug, vs] of Object.entries(voterStances)) {
    const ps = polStances[slug]
    if (!ps) continue
    const na = STANCE_NUM[vs] ?? -1
    const nb = STANCE_NUM[ps] ?? -1
    if (na < 0 || nb < 0) continue
    total++
    matched += Math.max(0, 1 - Math.abs(na - nb) / 6)
  }
  return total === 0 ? -1 : matched / total
}

// Named politicians with special tier assignments
const PRESIDENT = ['Donald Trump']
const VP = ['JD Vance']
const SENATE_LEADERS = [
  'Mitch McConnell', 'Chuck Schumer', 'John Thune', 'Dick Durbin',
]
const PROMINENT_SENATORS = [
  'Bernie Sanders', 'Ted Cruz', 'Elizabeth Warren', 'Rand Paul',
  'Susan Collins', 'Josh Hawley', 'Amy Klobuchar', 'Lindsey Graham',
  'Cory Booker', 'Marco Rubio', 'Tim Scott', 'John Fetterman',
  'Katie Britt', 'Kirsten Gillibrand', 'John Cornyn', 'Tom Cotton',
  'Chris Murphy', 'Raphael Warnock', 'Jon Ossoff', 'Tammy Baldwin',
  'Mark Kelly', 'Pete Ricketts', 'Rick Scott', 'Marsha Blackburn',
]
const PROMINENT_HOUSE = [
  'Nancy Pelosi', 'Alexandria Ocasio-Cortez', 'Marjorie Taylor Greene',
  'Jim Jordan', 'Hakeem Jeffries', 'Kevin McCarthy', 'Matt Gaetz',
  'Ilhan Omar', 'Rashida Tlaib', 'Dan Crenshaw', 'Byron Donalds',
  'Jamie Raskin', 'Adam Schiff', 'Lauren Boebert', 'Mike Johnson',
  'Maxine Waters', 'Ayanna Pressley', 'Chip Roy', 'Scott Perry',
  'Greg Casar', 'Ro Khanna', 'Ritchie Torres', 'Cori Bush',
  'Thomas Massie', 'Andy Biggs', 'Paul Gosar',
]
const PROMINENT_GOVERNORS = [
  'Gavin Newsom', 'Ron DeSantis', 'Greg Abbott', 'Gretchen Whitmer',
  'Glenn Youngkin', 'Josh Shapiro', 'Kathy Hochul', 'Sarah Huckabee Sanders',
  'Brian Kemp', 'JB Pritzker', 'Wes Moore', 'Tim Walz', 'Kim Reynolds',
]

function getTier(name, chamber) {
  if (PRESIDENT.includes(name)) return { min: 200, max: 300 }
  if (VP.includes(name)) return { min: 120, max: 180 }
  if (chamber === 'presidential') return { min: 60, max: 120 }
  if (SENATE_LEADERS.includes(name)) return { min: 80, max: 140 }
  if (PROMINENT_SENATORS.includes(name)) return { min: 40, max: 80 }
  if (chamber === 'senate') return { min: 10, max: 30 }
  if (PROMINENT_HOUSE.includes(name)) return { min: 20, max: 50 }
  if (chamber === 'house') return { min: 3, max: 15 }
  if (PROMINENT_GOVERNORS.includes(name)) return { min: 25, max: 50 }
  if (chamber === 'governor') return { min: 10, max: 25 }
  return { min: 2, max: 10 }
}

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

async function deleteLikes() {
  let demoIds = [], from = 0
  while (true) {
    const { data } = await supabase.from('profiles').select('id').eq('is_demo', true).range(from, from + 999)
    if (!data?.length) break
    demoIds.push(...data.map(d => d.id))
    from += 1000
  }
  console.log(`Deleting likes for ${demoIds.length} demo users...`)
  let deleted = 0
  for (let i = 0; i < demoIds.length; i += 100) {
    const batch = demoIds.slice(i, i + 100)
    const { count } = await supabase.from('likes').delete({ count: 'exact' }).in('user_id', batch)
    deleted += count || 0
  }
  console.log(`Deleted ${deleted} likes.`)
}

async function run() {
  if (DELETE) {
    await deleteLikes()
  }

  // Load all issues for stance lookup
  const { data: issues } = await supabase.from('issues').select('id, slug')
  const issueSlugById = Object.fromEntries(issues.map(i => [i.id, i.slug]))

  // Load all federal politicians
  let allPols = [], from = 0
  while (true) {
    const { data } = await supabase.from('politicians')
      .select('id, name, chamber')
      .in('chamber', ['senate', 'house', 'governor', 'presidential'])
      .range(from, from + 999)
    if (!data?.length) break
    allPols.push(...data)
    from += 1000
  }
  console.log(`Politicians: ${allPols.length}`)

  // Load all politician stances
  const polStances = {}
  from = 0
  while (true) {
    const { data } = await supabase.from('politician_issues')
      .select('politician_id, issue_id, stance')
      .eq('is_verified', true)
      .range(from, from + 999)
    if (!data?.length) break
    for (const r of data) {
      const slug = issueSlugById[r.issue_id]
      if (!slug) continue
      if (!polStances[r.politician_id]) polStances[r.politician_id] = {}
      polStances[r.politician_id][slug] = r.stance
    }
    from += 1000
  }

  // Load demo users (with state for same-state preference)
  let demos = []
  from = 0
  while (true) {
    const { data } = await supabase.from('profiles')
      .select('id, state, quiz_answers')
      .eq('is_demo', true)
      .range(from, from + 999)
    if (!data?.length) break
    demos.push(...data)
    from += 1000
  }
  console.log(`Demo users: ${demos.length}`)

  // Load existing likes to avoid duplicates
  const existingLikes = new Set()
  from = 0
  while (true) {
    const { data } = await supabase.from('likes').select('user_id, politician_id').range(from, from + 999)
    if (!data?.length) break
    for (const l of data) existingLikes.add(`${l.user_id}:${l.politician_id}`)
    from += 1000
  }
  console.log(`Existing likes: ${existingLikes.size}`)

  // For each politician, assign likes from best-aligned demo users
  const allLikes = []
  const allFollows = []

  // Process president first to establish the cap
  const trump = allPols.find(p => p.name === 'Donald Trump')
  let trumpLikes = 0

  // Sort: president first, then VP, then cabinet, then leaders, etc.
  const sorted = [...allPols].sort((a, b) => {
    const ta = getTier(a.name, a.chamber)
    const tb = getTier(b.name, b.chamber)
    return tb.max - ta.max // highest tier first
  })

  for (const pol of sorted) {
    const tier = getTier(pol.name, pol.chamber)
    let target = randInt(tier.min, tier.max)

    // Cap: nobody gets more than the president
    if (pol.name === 'Donald Trump') {
      trumpLikes = target
    } else if (trumpLikes > 0 && target >= trumpLikes) {
      target = trumpLikes - randInt(1, 10)
    }

    const ps = polStances[pol.id]
    if (!ps) continue

    // Score all demo users — boost same-state voters significantly
    const candidates = []
    for (const demo of demos) {
      if (!demo.quiz_answers || Object.keys(demo.quiz_answers).length === 0) continue
      const key = `${demo.id}:${pol.id}`
      if (existingLikes.has(key)) continue
      const score = alignmentScore(demo.quiz_answers, ps)
      if (score < 0.25) continue // very low threshold — centrists can still like

      // Same-state boost: voters are much more likely to like their own reps
      const sameState = demo.state && pol.state === demo.state
      const boostedScore = sameState ? score + 0.3 : score

      candidates.push({ userId: demo.id, score: boostedScore })
    }

    // Sort by boosted score with slight randomization
    candidates.sort((a, b) => b.score - a.score + (Math.random() - 0.5) * 0.08)

    const numToAdd = Math.min(target, candidates.length)
    for (let i = 0; i < numToAdd; i++) {
      const key = `${candidates[i].userId}:${pol.id}`
      if (!existingLikes.has(key)) {
        allLikes.push({ user_id: candidates[i].userId, politician_id: pol.id })
        allFollows.push({ user_id: candidates[i].userId, politician_id: pol.id })
        existingLikes.add(key)
      }
    }
  }

  console.log(`\nInserting ${allLikes.length} likes...`)
  let created = 0, failed = 0
  for (let i = 0; i < allLikes.length; i += 500) {
    const batch = allLikes.slice(i, i + 500)
    const { error } = await supabase.from('likes').upsert(batch, { onConflict: 'user_id,politician_id', ignoreDuplicates: true })
    if (error) { console.error('Like error:', error.message); failed += batch.length }
    else created += batch.length
    if (i % 2000 === 0 && i > 0) process.stdout.write(`${i}...`)
  }

  console.log(`\nSyncing ${allFollows.length} matching follows...`)
  let followsCreated = 0
  for (let i = 0; i < allFollows.length; i += 500) {
    const batch = allFollows.slice(i, i + 500)
    const { error } = await supabase.from('follows').upsert(batch, { onConflict: 'user_id,politician_id', ignoreDuplicates: true })
    if (error) console.error('Follow error:', error.message)
    else followsCreated += batch.length
  }

  // Verify president has the most
  const { count: trumpCount } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('politician_id', trump?.id)

  // Find max non-trump
  let maxOther = 0, maxOtherName = ''
  for (const pol of allPols) {
    if (pol.name === 'Donald Trump') continue
    const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('politician_id', pol.id)
    if (count > maxOther) { maxOther = count; maxOtherName = pol.name }
  }

  console.log(`\n=== SUMMARY ===`)
  console.log(`Likes created: ${created} (failed: ${failed})`)
  console.log(`Follows synced: ${followsCreated}`)
  console.log(`Trump likes: ${trumpCount}`)
  console.log(`Next highest: ${maxOtherName} with ${maxOther}`)
}

run().catch(console.error)
