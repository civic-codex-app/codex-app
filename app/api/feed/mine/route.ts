import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { rateLimit, PUBLIC_READ } from '@/lib/utils/rate-limit'
import { isZip } from '@/lib/utils/zip'
import { repsForZip } from '@/lib/utils/reps'
import { fetchBallotRaces } from '@/lib/utils/fetch-ballot'
import { plainSentence } from '@/components/home/bills-moving'
import { STATE_NAMES } from '@/lib/constants/us-states'

/**
 * GET /api/feed/mine?zip=48104
 *
 * The visitor's own feed: stored news stories that name one of their
 * officials or someone running for one of their seats, and the events Poli
 * tracks for those people — a bill they will have voted on, a race that is
 * set, a filing they made. Newest first, with faces.
 *
 * Matching is by name against `daily_topics`, which the ingestion does not
 * link to people (daily_topic_politicians is empty). A story matches a
 * person when its title or summary contains their full name, or their
 * surname when the surname is distinctive (six letters or more) and the
 * text also names their state — "Rogers" alone would match too much, "Rogers"
 * with "Michigan" in the same headline is the candidate. Titles and summaries
 * are returned as stored, never rewritten.
 */

type Face = { src: string | null; alt: string; party: string | null }
type Person = { id: string; name: string; party: string; image_url: string | null; href: string; raceSlug?: string }

export interface FeedItem {
  kind: 'story' | 'event'
  date: string
  title: string
  meta: string
  faces: Face[]
  /** story */
  source?: string | null
  summary?: string | null
  url?: string | null
  /** event */
  href?: string
}

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, PUBLIC_READ)
  if (!limited.success) return limited.response

  const zip = new URL(request.url).searchParams.get('zip')
  if (!isZip(zip)) return NextResponse.json({ error: 'Valid 5-digit zip code required' }, { status: 400 })

  const { state, districts, reps } = await repsForZip(zip)
  if (!state) return NextResponse.json({ state: null, hero: null, items: [] })

  const supabase = createServiceRoleClient()
  const districtNumbers = districts.filter((d) => d.state === state).map((d) => d.district)
  const [races, { data: topics }, { data: bills }] = await Promise.all([
    fetchBallotRaces(state, districtNumbers.length ? districtNumbers : null, null),
    supabase
      .from('daily_topics')
      .select('title, summary, source_name, source_url, published_at')
      .eq('is_active', true)
      .gte('published_at', new Date(Date.now() - 45 * 86400000).toISOString())
      .order('published_at', { ascending: false })
      .limit(300),
    supabase
      .from('bills')
      .select('id, number, title, summary, status, last_action_date')
      .eq('status', 'signed_into_law')
      .not('summary', 'is', null)
      .order('last_action_date', { ascending: false, nullsFirst: false })
      .limit(1),
  ])

  const myRaces = races.filter((r) => ['senate', 'house', 'governor', 'presidential'].includes(r.chamber))

  // Everyone whose name is worth matching: the officials, and whoever is
  // running for their seats.
  const people: Person[] = reps.map((r) => ({ id: r.id, name: r.name, party: r.party, image_url: r.image_url, href: `/politicians/${r.slug}` }))
  for (const race of myRaces) {
    for (const c of race.candidates) {
      if (c.status !== 'running') continue
      if (people.some((p) => p.id === c.politician_id)) continue
      people.push({
        id: c.politician_id ?? c.id,
        name: c.name,
        party: c.party,
        image_url: c.image_url,
        href: c.politician_slug ? `/politicians/${c.politician_slug}` : `/candidates/${c.id}`,
        raceSlug: race.slug,
      })
    }
  }
  const stateName = STATE_NAMES[state] ?? state
  const matcher = (text: string) => {
    const t = text.toLowerCase()
    return people.filter((p) => {
      const full = p.name.toLowerCase().replace(/\s+/g, ' ')
      if (t.includes(full)) return true
      const surname = full.split(' ').pop() ?? ''
      return surname.length >= 6 && t.includes(surname) && t.includes(stateName.toLowerCase())
    })
  }

  const items: FeedItem[] = []
  for (const row of (topics ?? []) as Array<{ title: string; summary: string | null; source_name: string | null; source_url: string | null; published_at: string }>) {
    const hits = matcher(`${row.title} ${row.summary ?? ''}`)
    if (!hits.length) continue
    items.push({
      kind: 'story',
      date: row.published_at,
      title: row.title,
      meta: [row.source_name, when(row.published_at)].filter(Boolean).join(' · '),
      faces: hits.slice(0, 3).map(face),
      source: row.source_name,
      summary: row.summary,
      url: row.source_url,
    })
  }

  // Events Poli tracks for these people.
  const bill = (bills ?? [])[0] as { id: string; number: string; title: string; summary: string | null; status: string; last_action_date: string | null } | undefined
  const congress = reps.filter((r) => r.chamber === 'senate' || r.chamber === 'house')
  if (bill && bill.last_action_date && congress.length) {
    items.push({
      kind: 'event',
      date: bill.last_action_date,
      title: plainSentence(bill),
      meta: `${when(bill.last_action_date)} · signed into law · how they voted is coming`,
      faces: congress.slice(0, 3).map(face),
      href: `/bills/${bill.id}`,
    })
  }
  for (const race of myRaces) {
    const running = race.candidates.filter((c) => c.status === 'running')
    const major = running.filter((c) => c.party === 'democrat' || c.party === 'republican')
    if (major.length < 2) continue
    const [a, b] = major
    const office = race.chamber === 'senate' ? 'Senate' : race.chamber === 'governor' ? "Governor's" : race.chamber === 'house' ? 'House' : race.chamber
    items.push({
      kind: 'event',
      date: race.election_date,
      title: `${office} race is set: ${last(a.name)} vs. ${last(b.name)}`,
      meta: `Election ${when(race.election_date)}${running.length > 2 ? ` · ${running.length - 2} more on the ballot` : ''}`,
      faces: [a, b].map((c) => ({ src: c.image_url, alt: c.name, party: c.party })),
      href: `/elections/${race.slug}`,
    })
  }
  if (reps.length) {
    const year = myRaces[0]?.election_date?.slice(0, 4)
    const { data: finance } = await supabase
      .from('campaign_finance')
      .select('politician_id, cycle, total_raised, source')
      .in('politician_id', reps.map((r) => r.id))
      .eq('cycle', year ?? String(new Date().getUTCFullYear()))
    for (const f of (finance ?? []) as Array<{ politician_id: string; cycle: string; total_raised: number | null; source: string | null }>) {
      const rep = reps.find((r) => r.id === f.politician_id)
      const through = f.source?.match(/through (\d{4}-\d{2}-\d{2})/)?.[1]
      if (!rep || f.total_raised === null || !through) continue
      items.push({
        kind: 'event',
        date: through,
        title: `${last(rep.name)} reported ${money(f.total_raised)} raised`,
        meta: `${when(through)} · FEC filing, ${f.cycle} cycle`,
        faces: [face(rep)],
        href: `/politicians/${rep.slug}`,
      })
    }
  }

  // Newest first. A race "is set" event carries the election date, which is
  // in the future; for ordering it counts as today, so it sits with today's
  // stories rather than above everything until November.
  const today = new Date().toISOString()
  const key = (i: FeedItem) => (i.date > today ? today : i.date)
  items.sort((a, b) => key(b).localeCompare(key(a)))

  // The hero: the newest story about a race of theirs, else the newest story.
  const hero = items.find((i) => i.kind === 'story' && i.faces.length >= 2) ?? items.find((i) => i.kind === 'story') ?? null

  return NextResponse.json(
    { state, hero, items: items.filter((i) => i !== hero).slice(0, 12) },
    { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' } }
  )
}

function face(p: { name: string; party: string | null; image_url: string | null }): Face {
  return { src: p.image_url, alt: p.name, party: p.party }
}

function last(name: string) {
  return name.trim().split(/\s+/).pop() ?? name
}

function money(n: number) {
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${Math.round(n / 1000)}K`
}

/** "Oct 5", or "today 3:17" for something from the last day. */
function when(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const ageMs = Date.now() - d.getTime()
  if (ageMs >= 0 && ageMs < 86400000 && iso.length > 10) {
    return `today ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })}`
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}
