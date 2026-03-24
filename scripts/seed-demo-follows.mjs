/**
 * Have each demo community member follow 5-10 politicians they're aligned with.
 * Matches based on stance similarity between voter quiz_answers and politician stances.
 *
 * Usage:
 *   node scripts/seed-demo-follows.mjs
 *   node scripts/seed-demo-follows.mjs --delete   (remove all demo follows)
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

// Numeric stance scale for distance calculation
const STANCE_NUM = {
  strongly_supports: 0, supports: 1, leans_support: 2, neutral: 3,
  mixed: 3, leans_oppose: 4, opposes: 5, strongly_opposes: 6, unknown: -1,
}

function stanceDistance(a, b) {
  const na = STANCE_NUM[a] ?? -1
  const nb = STANCE_NUM[b] ?? -1
  if (na < 0 || nb < 0) return null // skip unknown
  return Math.abs(na - nb)
}

function alignmentScore(voterStances, polStances) {
  let total = 0, matched = 0
  for (const [slug, voterStance] of Object.entries(voterStances)) {
    const polStance = polStances[slug]
    if (!polStance) continue
    const dist = stanceDistance(voterStance, polStance)
    if (dist === null) continue
    total++
    // Convert distance to 0-1 similarity
    matched += Math.max(0, 1 - dist / 6)
  }
  if (total === 0) return -1
  return matched / total
}

async function deleteFollows() {
  // Get all demo user IDs
  let demoIds = [], from = 0
  while (true) {
    const { data } = await supabase.from('profiles').select('id').eq('is_demo', true).range(from, from + 999)
    if (!data?.length) break
    demoIds.push(...data.map(d => d.id))
    from += 1000
  }

  if (!demoIds.length) {
    console.log('No demo users found.')
    return
  }

  console.log(`Deleting follows for ${demoIds.length} demo users...`)
  let deleted = 0, issueDeleted = 0
  for (let i = 0; i < demoIds.length; i += 100) {
    const batch = demoIds.slice(i, i + 100)
    const { count: fc } = await supabase.from('follows').delete({ count: 'exact' }).in('user_id', batch)
    const { count: ic } = await supabase.from('issue_follows').delete({ count: 'exact' }).in('user_id', batch)
    deleted += fc || 0
    issueDeleted += ic || 0
  }
  console.log(`Deleted ${deleted} politician follows, ${issueDeleted} issue follows.`)
}

async function seed() {
  // 1. Load all demo profiles with quiz_answers and state
  console.log('Loading demo profiles...')
  let demos = [], from = 0
  while (true) {
    const { data } = await supabase
      .from('profiles')
      .select('id, state, quiz_answers')
      .eq('is_demo', true)
      .range(from, from + 999)
    if (!data?.length) break
    demos.push(...data)
    from += 1000
  }
  console.log(`Loaded ${demos.length} demo profiles`)

  // 2. Load all politicians with their stances (federal only for follows)
  console.log('Loading politicians and stances...')
  const { data: issues } = await supabase.from('issues').select('id, slug')
  const issueSlugById = Object.fromEntries(issues.map(i => [i.id, i.slug]))

  let allPols = []
  from = 0
  while (true) {
    const { data } = await supabase
      .from('politicians')
      .select('id, name, state, party, chamber')
      .in('chamber', ['senate', 'house', 'governor', 'presidential'])
      .range(from, from + 999)
    if (!data?.length) break
    allPols.push(...data)
    from += 1000
  }
  console.log(`Loaded ${allPols.length} politicians`)

  // Load all politician stances into a map: polId -> { issueSlug: stance }
  const polStances = {}
  from = 0
  while (true) {
    const { data } = await supabase
      .from('politician_issues')
      .select('politician_id, issue_id, stance')
      .eq('is_verified', true)
      .range(from, from + 999)
    if (!data?.length) break
    for (const row of data) {
      const slug = issueSlugById[row.issue_id]
      if (!slug) continue
      if (!polStances[row.politician_id]) polStances[row.politician_id] = {}
      polStances[row.politician_id][slug] = row.stance
    }
    from += 1000
  }
  console.log(`Loaded stances for ${Object.keys(polStances).length} politicians`)

  // 3. For each demo user, find best-aligned politicians and follow 5-10
  let totalFollows = 0, failed = 0
  const followRows = []

  for (const demo of demos) {
    const voterStances = demo.quiz_answers
    if (!voterStances || Object.keys(voterStances).length === 0) continue

    // Score all politicians
    const scores = []
    for (const pol of allPols) {
      const ps = polStances[pol.id]
      if (!ps) continue
      const score = alignmentScore(voterStances, ps)
      if (score < 0) continue

      // Bonus for same-state politicians (they're more likely to follow their reps)
      const sameState = demo.state && pol.state === demo.state
      scores.push({ polId: pol.id, score, sameState })
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score)

    // Pick 5-10: prioritize same-state, then top aligned
    const numFollows = 5 + Math.floor(Math.random() * 6) // 5-10
    const picked = new Set()

    // First: pick same-state politicians from top 30
    const sameState = scores.filter(s => s.sameState).slice(0, 4)
    for (const s of sameState) {
      picked.add(s.polId)
    }

    // Fill remaining from top aligned
    for (const s of scores) {
      if (picked.size >= numFollows) break
      picked.add(s.polId)
    }

    for (const polId of picked) {
      followRows.push({ user_id: demo.id, politician_id: polId })
    }
  }

  console.log(`\nInserting ${followRows.length} politician follows...`)

  // Batch insert politician follows
  for (let i = 0; i < followRows.length; i += 500) {
    const batch = followRows.slice(i, i + 500)
    const { error } = await supabase
      .from('follows')
      .upsert(batch, { onConflict: 'user_id,politician_id', ignoreDuplicates: true })

    if (error) {
      console.error(`Batch ${i}: ${error.message}`)
      failed += batch.length
    } else {
      totalFollows += batch.length
    }
    if (i % 2000 === 0 && i > 0) process.stdout.write(`${i}...`)
  }

  // 4. Issue follows: each demo user follows 0-2 issues they feel strongly about
  console.log(`\nGenerating issue follows (0-2 per user)...`)
  const issueFollowRows = []

  for (const demo of demos) {
    const voterStances = demo.quiz_answers
    if (!voterStances || Object.keys(voterStances).length === 0) continue

    // Find issues with strong stances
    const strongIssues = Object.entries(voterStances)
      .filter(([, stance]) => stance.startsWith('strongly_'))
      .map(([slug]) => slug)

    // Pick 0-2 random strong issues
    const numIssueFollows = Math.floor(Math.random() * 3) // 0, 1, or 2
    if (numIssueFollows === 0 || strongIssues.length === 0) continue

    // Shuffle and pick
    const shuffled = strongIssues.sort(() => Math.random() - 0.5)
    const picked = shuffled.slice(0, numIssueFollows)

    for (const slug of picked) {
      const issue = issues.find(i => i.slug === slug)
      if (issue) {
        issueFollowRows.push({ user_id: demo.id, issue_id: issue.id })
      }
    }
  }

  console.log(`Inserting ${issueFollowRows.length} issue follows...`)
  let issueFollowsCreated = 0, issueFollowsFailed = 0

  for (let i = 0; i < issueFollowRows.length; i += 500) {
    const batch = issueFollowRows.slice(i, i + 500)
    const { error } = await supabase
      .from('issue_follows')
      .upsert(batch, { onConflict: 'user_id,issue_id', ignoreDuplicates: true })

    if (error) {
      console.error(`Issue follows batch ${i}: ${error.message}`)
      issueFollowsFailed += batch.length
    } else {
      issueFollowsCreated += batch.length
    }
  }

  console.log(`\n=== SUMMARY ===`)
  console.log(`Demo users: ${demos.length}`)
  console.log(`Politician follows: ${totalFollows} (failed: ${failed})`)
  console.log(`Issue follows: ${issueFollowsCreated} (failed: ${issueFollowsFailed})`)
  console.log(`Avg politician follows/user: ${(totalFollows / demos.length).toFixed(1)}`)
  console.log(`Avg issue follows/user: ${(issueFollowsCreated / demos.length).toFixed(1)}`)
}

if (DELETE) {
  deleteFollows().catch(console.error)
} else {
  seed().catch(console.error)
}
