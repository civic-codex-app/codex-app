import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

// Vercel Cron: runs weekly Sunday at 12pm UTC (7am CT)
// Tasks: refresh missing images, rotate demo engagement, flag stale data

const CRON_SECRET = process.env.CRON_SECRET
const WIKIPEDIA_UA = 'PoliApp/1.0 (civic engagement platform; contact@getpoli.app)'

export const maxDuration = 300 // 5 min max for weekly maintenance

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const results: Record<string, unknown> = {}

  // ── 1. Refresh missing politician images ──
  try {
    let missing: { id: string; name: string; state: string; chamber: string }[] = []
    let from = 0
    while (true) {
      const { data } = await supabase
        .from('politicians')
        .select('id, name, state, chamber')
        .is('image_url', null)
        .in('chamber', ['senate', 'house', 'governor', 'presidential'])
        .range(from, from + 999)
      if (!data?.length) break
      missing.push(...data)
      from += 1000
    }

    let imagesFound = 0
    for (const pol of missing.slice(0, 20)) { // cap at 20 per run
      const imageUrl = await searchWikipediaImage(pol.name)
      if (imageUrl) {
        await supabase.from('politicians').update({ image_url: imageUrl }).eq('id', pol.id)
        imagesFound++
      }
    }
    results.images = { missing: missing.length, found: imagesFound }
  } catch (e) {
    results.images = { error: String(e) }
  }

  // ── 2. Rotate demo engagement (shuffle some likes/follows) ──
  try {
    // Pick ~50 random demo users and add 1-2 new likes for variety
    const { data: demos } = await supabase
      .from('profiles')
      .select('id, state, quiz_answers')
      .eq('is_demo', true)
      .limit(50)

    if (demos?.length) {
      // Get politicians they could like from their state
      let newLikes = 0
      for (const demo of demos) {
        if (!demo.quiz_answers || !demo.state) continue
        const { data: statePols } = await supabase
          .from('politicians')
          .select('id')
          .eq('state', demo.state)
          .in('chamber', ['senate', 'house', 'governor'])
          .limit(5)

        if (!statePols?.length) continue

        // Try to add a like for a random state politician
        const randomPol = statePols[Math.floor(Math.random() * statePols.length)]
        const { error } = await supabase
          .from('likes')
          .upsert(
            { user_id: demo.id, politician_id: randomPol.id },
            { onConflict: 'user_id,politician_id', ignoreDuplicates: true }
          )
        if (!error) newLikes++
      }
      results.engagement = { usersProcessed: demos.length, newLikes }
    }
  } catch (e) {
    results.engagement = { error: String(e) }
  }

  // ── 3. Flag stale data ──
  try {
    // Count politicians with unverified stances
    const { count: unverified } = await supabase
      .from('politician_issues')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', false)

    // Count upcoming elections
    const { count: activeElections } = await supabase
      .from('elections')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Deactivate past elections
    const { count: deactivated } = await supabase
      .from('elections')
      .update({ is_active: false })
      .lt('election_date', new Date().toISOString().split('T')[0])
      .eq('is_active', true)

    results.data = { unverifiedStances: unverified, activeElections, electionsDeactivated: deactivated }
  } catch (e) {
    results.data = { error: String(e) }
  }

  return NextResponse.json({ message: 'Weekly maintenance complete', results })
}

async function searchWikipediaImage(name: string): Promise<string | null> {
  const variants = [name, `${name} (politician)`]
  for (const title of variants) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=400&redirects=1`
      const res = await fetch(url, { headers: { 'User-Agent': WIKIPEDIA_UA } })
      if (!res.ok) continue
      const data = await res.json()
      const pages = data.query?.pages || {}
      for (const p of Object.values(pages) as { thumbnail?: { source: string } }[]) {
        if (p.thumbnail?.source) {
          return p.thumbnail.source.replace(/\/\d+px-/, '/400px-')
        }
      }
    } catch { continue }
  }
  return null
}
