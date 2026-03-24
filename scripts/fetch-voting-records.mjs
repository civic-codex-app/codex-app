import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const API_KEY = process.env.CONGRESS_API_KEY
const BASE = 'https://api.congress.gov/v3'

async function fetchJson(url) {
  const sep = url.includes('?') ? '&' : '?'
  const resp = await fetch(`${url}${sep}api_key=${API_KEY}&format=json`)
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${url}`)
  return resp.json()
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// Get all politicians indexed by name (lowercase)
async function getPoliticianMap() {
  const map = new Map()
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data } = await supabase.from('politicians').select('id, name, state, chamber').range(from, from + PAGE - 1)
    if (!data || data.length === 0) break
    for (const p of data) {
      // Index by last name + state for better matching
      const lastName = p.name.split(' ').pop().toLowerCase()
      const key = `${lastName}-${(p.state || '').toLowerCase()}`
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(p)
    }
    if (data.length < PAGE) break
    from += PAGE
  }
  return map
}

function findPolitician(polMap, memberName, state) {
  const parts = memberName.split(/[,\s]+/).filter(Boolean)
  const lastName = parts[0]?.toLowerCase()
  if (!lastName) return null
  
  const stKey = `${lastName}-${(state || '').toLowerCase()}`
  const candidates = polMap.get(stKey) || []
  if (candidates.length === 1) return candidates[0]
  
  // Try first name match
  const firstName = parts.length > 1 ? parts[parts.length - 1]?.toLowerCase() : ''
  for (const c of candidates) {
    if (c.name.toLowerCase().includes(firstName) && c.name.toLowerCase().includes(lastName)) {
      return c
    }
  }
  return candidates[0] || null
}

async function main() {
  console.log('Loading politician map...')
  const polMap = await getPoliticianMap()
  console.log(`Indexed politicians by ${polMap.size} name-state keys`)

  // Fetch recent Senate roll call votes
  let inserted = 0
  let skipped = 0
  let notFound = 0

  for (const congress of [119, 118]) {
    for (const chamber of ['senate', 'house']) {
      console.log(`\nFetching ${chamber} votes for congress ${congress}...`)
      
      try {
        const listUrl = `${BASE}/roll-call-vote/${congress}/${chamber}?limit=50`
        const listData = await fetchJson(listUrl)
        const votes = listData.rollCallVotes || listData['roll-call-votes'] || []
        
        if (!votes.length) {
          // Try alternative endpoint
          const altUrl = `${BASE}/congress/${congress}/${chamber}/votes?limit=20`
          const altData = await fetchJson(altUrl)
          console.log('Alt response keys:', Object.keys(altData))
          continue
        }
        
        console.log(`Found ${votes.length} roll call votes`)
        
        for (const vote of votes.slice(0, 20)) {
          await sleep(500) // Rate limit
          
          try {
            const detailUrl = vote.url || `${BASE}/roll-call-vote/${congress}/${chamber}/${vote.rollCallNumber || vote.number}`
            const detail = await fetchJson(detailUrl)
            const rv = detail.rollCallVote || detail['roll-call-vote'] || detail
            
            const billNumber = rv.bill?.number ? `${rv.bill.type || 'S'}.${rv.bill.number}` : rv.question || 'Unknown'
            const billName = rv.bill?.title || rv.question || rv.description || 'Roll Call Vote'
            const voteDate = rv.date || rv.voteDate
            
            const positions = rv.positions || rv.members || []
            
            for (const pos of positions) {
              const memberName = pos.member_full || pos.memberFull || pos.name || ''
              const memberState = pos.state || ''
              const votePosition = (pos.vote_position || pos.votePosition || pos.vote || '').toLowerCase()
              
              let normalizedVote = 'not_voting'
              if (votePosition.includes('yea') || votePosition === 'aye') normalizedVote = 'yea'
              else if (votePosition.includes('nay') || votePosition === 'no') normalizedVote = 'nay'
              else if (votePosition.includes('present')) normalizedVote = 'present'
              
              const pol = findPolitician(polMap, memberName, memberState)
              if (!pol) { notFound++; continue }
              
              const { error } = await supabase.from('voting_records').insert({
                politician_id: pol.id,
                bill_name: billName.slice(0, 500),
                bill_number: billNumber,
                vote: normalizedVote,
                vote_date: voteDate,
              })
              
              if (error) {
                if (error.code === '23505') skipped++ // duplicate
                else console.error('Insert error:', error.message)
              } else {
                inserted++
              }
            }
            
            console.log(`  Vote ${billNumber}: ${positions.length} positions processed`)
          } catch (e) {
            console.error('  Error processing vote:', e.message)
          }
        }
      } catch (e) {
        console.error(`Error fetching ${chamber} votes:`, e.message)
        
        // Try ProPublica-style endpoint as fallback
        try {
          const ppUrl = `${BASE}/congress/${congress}/votes?limit=20`
          const ppData = await fetchJson(ppUrl)
          console.log('Fallback response:', Object.keys(ppData))
        } catch {}
      }
      
      await sleep(1000)
    }
  }

  console.log(`\n=== Done ===`)
  console.log(`Inserted: ${inserted}`)
  console.log(`Skipped (duplicates): ${skipped}`)
  console.log(`Not found in DB: ${notFound}`)
  
  // Check total
  const { count } = await supabase.from('voting_records').select('id', { count: 'exact', head: true })
  console.log(`Total voting records in DB: ${count}`)
}

main().catch(console.error)
