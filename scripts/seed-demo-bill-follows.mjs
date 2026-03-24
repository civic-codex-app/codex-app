/**
 * Have demo users follow/save bills. Each user follows 0-3 bills randomly.
 * More popular bills get more follows.
 *
 * Usage: node scripts/seed-demo-bill-follows.mjs
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

async function run() {
  // Load bills
  let bills = [], from = 0
  while (true) {
    const { data } = await supabase.from('bills').select('id, title').range(from, from + 999)
    if (!data?.length) break
    bills.push(...data)
    from += 1000
  }
  console.log(`Bills: ${bills.length}`)

  // Load demo users
  let demos = []
  from = 0
  while (true) {
    const { data } = await supabase.from('profiles').select('id').eq('is_demo', true).range(from, from + 999)
    if (!data?.length) break
    demos.push(...data)
    from += 1000
  }
  console.log(`Demo users: ${demos.length}`)

  // Each user follows 0-3 bills
  const followRows = []
  for (const demo of demos) {
    const numFollows = Math.floor(Math.random() * 4) // 0-3
    if (numFollows === 0) continue

    // Weight toward first bills (usually more prominent/recent)
    const shuffled = [...bills].sort(() => Math.random() - 0.3)
    const picked = shuffled.slice(0, numFollows)

    for (const bill of picked) {
      followRows.push({ user_id: demo.id, bill_id: bill.id })
    }
  }

  console.log(`Inserting ${followRows.length} bill follows...`)

  let created = 0, failed = 0
  for (let i = 0; i < followRows.length; i += 500) {
    const batch = followRows.slice(i, i + 500)
    const { error } = await supabase
      .from('bill_follows')
      .upsert(batch, { onConflict: 'user_id,bill_id', ignoreDuplicates: true })
    if (error) {
      console.error(`Batch error: ${error.message}`)
      failed += batch.length
    } else {
      created += batch.length
    }
  }

  // Show top followed bills
  const billCounts = {}
  for (const f of followRows) {
    billCounts[f.bill_id] = (billCounts[f.bill_id] || 0) + 1
  }
  const top = Object.entries(billCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => {
      const bill = bills.find(b => b.id === id)
      return `${bill?.title?.slice(0, 50)}... (${count})`
    })

  console.log(`\n=== SUMMARY ===`)
  console.log(`Bill follows created: ${created} (failed: ${failed})`)
  console.log(`Avg per user: ${(created / demos.length).toFixed(1)}`)
  console.log(`Top bills:`)
  top.forEach(t => console.log(`  ${t}`))
}

run().catch(console.error)
