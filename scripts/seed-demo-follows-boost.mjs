/**
 * Add ~1000 more follows concentrated on high-profile politicians
 * (presidential, senate leadership, prominent governors).
 *
 * Usage:
 *   node scripts/seed-demo-follows-boost.mjs
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

async function run() {
  // Load issues
  const { data: issues } = await supabase.from('issues').select('id, slug')
  const issueSlugById = Object.fromEntries(issues.map(i => [i.id, i.slug]))

  // Load high-profile politicians: presidential + top senators + prominent governors
  const highProfile = new Set()

  // All presidential/cabinet
  let from = 0
  while (true) {
    const { data } = await supabase.from('politicians').select('id, name, chamber').eq('chamber', 'presidential').range(from, from + 999)
    if (!data?.length) break
    data.forEach(p => highProfile.add(p.id))
    from += 1000
  }

  // Prominent senators by name
  const prominentNames = [
    'Mitch McConnell', 'Chuck Schumer', 'John Fetterman', 'Bernie Sanders',
    'Ted Cruz', 'Elizabeth Warren', 'Rand Paul', 'Susan Collins',
    'Josh Hawley', 'Amy Klobuchar', 'Lindsey Graham', 'Cory Booker',
    'Tim Scott', 'Kirsten Gillibrand', 'John Cornyn', 'Dick Durbin',
    'John Thune', 'Tammy Baldwin', 'Mark Kelly', 'Katie Britt',
    'Marco Rubio', 'Rick Scott', 'Tom Cotton', 'Chris Murphy',
    'Raphael Warnock', 'Jon Ossoff', 'Pete Ricketts', 'Mitt Romney',
  ]

  for (const name of prominentNames) {
    const { data } = await supabase.from('politicians').select('id').eq('name', name).limit(1)
    if (data?.length) highProfile.add(data[0].id)
  }

  // Prominent governors
  const prominentGovs = [
    'Gavin Newsom', 'Ron DeSantis', 'Greg Abbott', 'Gretchen Whitmer',
    'Glenn Youngkin', 'Josh Shapiro', 'Kathy Hochul', 'Sarah Huckabee Sanders',
    'Brian Kemp', 'JB Pritzker', 'Wes Moore', 'Tim Walz',
    'Jeff Landry', 'Kim Reynolds', 'Abigail Spanberger',
  ]

  for (const name of prominentGovs) {
    const { data } = await supabase.from('politicians').select('id').eq('name', name).limit(1)
    if (data?.length) highProfile.add(data[0].id)
  }

  console.log(`High-profile politicians: ${highProfile.size}`)

  // Load their stances
  const polStances = {}
  const hpIds = [...highProfile]
  for (let i = 0; i < hpIds.length; i += 50) {
    const batch = hpIds.slice(i, i + 50)
    let rf = 0
    while (true) {
      const { data } = await supabase.from('politician_issues').select('politician_id, issue_id, stance').in('politician_id', batch).eq('is_verified', true).range(rf, rf + 999)
      if (!data?.length) break
      for (const r of data) {
        const slug = issueSlugById[r.issue_id]
        if (!slug) continue
        if (!polStances[r.politician_id]) polStances[r.politician_id] = {}
        polStances[r.politician_id][slug] = r.stance
      }
      if (data.length < 1000) break
      rf += 1000
    }
  }

  // Load demo users
  let demos = []
  from = 0
  while (true) {
    const { data } = await supabase.from('profiles').select('id, quiz_answers').eq('is_demo', true).range(from, from + 999)
    if (!data?.length) break
    demos.push(...data)
    from += 1000
  }
  console.log(`Demo users: ${demos.length}`)

  // Load existing follows to avoid duplicates
  const existingFollows = new Set()
  from = 0
  while (true) {
    const { data } = await supabase.from('follows').select('user_id, politician_id').range(from, from + 999)
    if (!data?.length) break
    for (const f of data) existingFollows.add(`${f.user_id}:${f.politician_id}`)
    from += 1000
  }
  console.log(`Existing follows: ${existingFollows.size}`)

  // Load chamber info for high-profile pols
  const polChamber = {}
  for (const polId of hpIds) {
    const { data } = await supabase.from('politicians').select('chamber').eq('id', polId).single()
    if (data) polChamber[polId] = data.chamber
  }

  // Follows per politician weighted by level
  // Presidential: 30-50, Senate: 15-25, Governor: 10-20
  function followsForChamber(chamber) {
    if (chamber === 'presidential') return 30 + Math.floor(Math.random() * 21) // 30-50
    if (chamber === 'senate') return 15 + Math.floor(Math.random() * 11)       // 15-25
    return 10 + Math.floor(Math.random() * 11)                                  // 10-20 (governor)
  }

  const TARGET = 1000
  const newFollows = []

  // Shuffle demos for variety
  const shuffledDemos = [...demos].sort(() => Math.random() - 0.5)

  // Process presidential first, then senate, then governors
  const orderedIds = [...hpIds].sort((a, b) => {
    const order = { presidential: 0, senate: 1, governor: 2 }
    return (order[polChamber[a]] ?? 3) - (order[polChamber[b]] ?? 3)
  })

  for (const polId of orderedIds) {
    if (newFollows.length >= TARGET) break
    const ps = polStances[polId]
    if (!ps) continue

    const candidates = []
    for (const demo of shuffledDemos) {
      if (!demo.quiz_answers || Object.keys(demo.quiz_answers).length === 0) continue
      const key = `${demo.id}:${polId}`
      if (existingFollows.has(key)) continue

      const score = alignmentScore(demo.quiz_answers, ps)
      if (score > 0.5) {
        candidates.push({ userId: demo.id, score })
      }
    }

    candidates.sort((a, b) => b.score - a.score)
    const chamber = polChamber[polId] || 'governor'
    const numToAdd = Math.min(followsForChamber(chamber), candidates.length, TARGET - newFollows.length)

    for (let i = 0; i < numToAdd; i++) {
      const key = `${candidates[i].userId}:${polId}`
      if (!existingFollows.has(key)) {
        newFollows.push({ user_id: candidates[i].userId, politician_id: polId })
        existingFollows.add(key)
      }
    }
  }

  console.log(`\nInserting ${newFollows.length} new follows for high-profile politicians...`)

  let created = 0, failed = 0
  for (let i = 0; i < newFollows.length; i += 500) {
    const batch = newFollows.slice(i, i + 500)
    const { error } = await supabase
      .from('follows')
      .upsert(batch, { onConflict: 'user_id,politician_id', ignoreDuplicates: true })

    if (error) {
      console.error(`Batch error: ${error.message}`)
      failed += batch.length
    } else {
      created += batch.length
    }
  }

  // ── Also add ~1000 likes for high-profile politicians ──
  // Likes use the same table structure, weighted same way
  const existingLikes = new Set()
  from = 0
  while (true) {
    const { data } = await supabase.from('likes').select('user_id, politician_id').range(from, from + 999)
    if (!data?.length) break
    for (const l of data) existingLikes.add(`${l.user_id}:${l.politician_id}`)
    from += 1000
  }

  const newLikes = []
  const shuffledDemos2 = [...demos].sort(() => Math.random() - 0.5)

  for (const polId of orderedIds) {
    if (newLikes.length >= TARGET) break
    const ps = polStances[polId]
    if (!ps) continue

    const candidates = []
    for (const demo of shuffledDemos2) {
      if (!demo.quiz_answers || Object.keys(demo.quiz_answers).length === 0) continue
      const key = `${demo.id}:${polId}`
      if (existingLikes.has(key)) continue

      const score = alignmentScore(demo.quiz_answers, ps)
      if (score > 0.5) {
        candidates.push({ userId: demo.id, score })
      }
    }

    candidates.sort((a, b) => b.score - a.score)
    const chamber = polChamber[polId] || 'governor'
    const numToAdd = Math.min(followsForChamber(chamber), candidates.length, TARGET - newLikes.length)

    for (let i = 0; i < numToAdd; i++) {
      const key = `${candidates[i].userId}:${polId}`
      if (!existingLikes.has(key)) {
        newLikes.push({ user_id: candidates[i].userId, politician_id: polId })
        existingLikes.add(key)
      }
    }
  }

  console.log(`\nInserting ${newLikes.length} new likes for high-profile politicians...`)

  let likesCreated = 0, likesFailed = 0
  for (let i = 0; i < newLikes.length; i += 500) {
    const batch = newLikes.slice(i, i + 500)
    const { error } = await supabase
      .from('likes')
      .upsert(batch, { onConflict: 'user_id,politician_id', ignoreDuplicates: true })

    if (error) {
      console.error(`Likes batch error: ${error.message}`)
      likesFailed += batch.length
    } else {
      likesCreated += batch.length
    }
  }

  console.log(`\n=== SUMMARY ===`)
  console.log(`New follows: ${created} (failed: ${failed})`)
  console.log(`New likes: ${likesCreated} (failed: ${likesFailed})`)
}

run().catch(console.error)
