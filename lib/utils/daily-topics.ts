import { parseRssItems } from './news'

/**
 * Shared news ingestion for the homepage "Today in Politics" strip
 * (the `daily_topics` table).
 *
 * History worth knowing: this used to live twice, inline, in the cron route and
 * the admin route, each with its own divergent keyword list, and each returning
 * HTTP 500 when GNEWS_API_KEY was unset. The key was never set, so the hourly
 * cron failed silently and the homepage served 125-day-old headlines stamped
 * "125d ago". Hence two rules here:
 *
 *   1. GNews is preferred (it supplies summaries and images) but is NEVER the
 *      only source -- publisher RSS needs no key and no quota, so a missing,
 *      rejected, or quota-exhausted key degrades quality instead of freezing
 *      the homepage.
 *   2. This module costs 6 GNews requests per run. The GNews free tier allows
 *      100/day, but the binding constraint is Vercel's Hobby plan, which only
 *      permits a cron to fire once per day — an hourly schedule made every
 *      deployment fail outright. See vercel.json and the cron route.
 */

/** Politics sections from outlets spread across the spectrum. No key required. */
export const POLITICS_FEEDS: Array<{ name: string; url: string }> = [
  { name: 'NPR', url: 'https://feeds.npr.org/1014/rss.xml' },
  { name: 'PBS NewsHour', url: 'https://www.pbs.org/newshour/feeds/rss/politics' },
  { name: 'The Hill', url: 'https://thehill.com/news/feed/' },
  { name: 'Politico', url: 'https://rss.politico.com/politics-news.xml' },
  { name: 'ABC News', url: 'https://feeds.abcnews.com/abcnews/politicsheadlines' },
  { name: 'CBS News', url: 'https://www.cbsnews.com/latest/rss/politics' },
  { name: 'Fox News', url: 'https://feeds.foxnews.com/foxnews/politics' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/us-news/us-politics/rss' },
]

/**
 * Multi-word phrases wherever possible -- bare words like "border" or "ICE"
 * produce false issue tags on unrelated stories.
 */
const ISSUE_KEYWORDS: Record<string, string[]> = {
  'immigration-and-border-security': ['immigration', 'deportation', 'undocumented', 'migrant', 'asylum', 'border wall', 'border security', 'border patrol', 'immigration policy', 'ice agent', 'ice arrest', 'ice raid'],
  'economy-and-jobs': ['recession', 'inflation', 'unemployment', 'economic growth', 'job market', 'federal reserve', 'interest rate', 'economic policy', 'stock market', 'jobs report', 'gdp'],
  'healthcare-and-medicare': ['healthcare', 'medicare', 'medicaid', 'obamacare', 'affordable care act', 'drug prices', 'health insurance', 'prescription drug', 'public health'],
  'climate-and-environment': ['climate change', 'global warming', 'carbon emissions', 'environmental protection', 'renewable energy', 'greenhouse gas', 'clean energy', 'wildfire', 'epa'],
  'gun-policy-and-2nd-amendment': ['gun control', 'gun violence', 'firearm', 'mass shooting', 'second amendment', 'gun legislation', 'gun law'],
  'education-and-student-debt': ['student loan', 'student debt', 'college tuition', 'education policy', 'school funding', 'teacher pay', 'public school'],
  'national-defense-and-military': ['pentagon', 'military', 'defense budget', 'armed forces', 'defense secretary', 'national security', 'troops', 'airstrike', 'missile strike', 'drone strike', 'warship'],
  'foreign-policy-and-diplomacy': ['foreign policy', 'diplomatic', 'sanctions', 'ceasefire', 'peace deal', 'state department', 'ambassador', 'nato', 'united nations', 'peace plan', 'ukraine war', 'middle east'],
  'technology-and-ai-regulation': ['artificial intelligence', 'tech regulation', 'social media regulation', 'ai regulation', 'ai policy', 'data privacy law', 'big tech', 'antitrust'],
  'criminal-justice-reform': ['criminal justice', 'police reform', 'prison reform', 'sentencing reform', 'mass incarceration', 'death penalty', 'indictment'],
  'social-security-and-medicare': ['social security', 'retirement benefits', 'social security reform'],
  'infrastructure-and-transportation': ['infrastructure bill', 'infrastructure spending', 'public transit', 'broadband access', 'highway funding'],
  'housing-and-affordability': ['housing crisis', 'affordable housing', 'housing market', 'rent control', 'homelessness', 'mortgage rate', 'housing policy'],
  'energy-policy-and-oil-gas': ['oil drilling', 'natural gas', 'pipeline project', 'energy independence', 'oil production', 'fracking', 'energy policy', 'oil price'],
  'reproductive-rights': ['abortion', 'reproductive rights', 'roe v wade', 'planned parenthood', 'contraception', 'abortion ban'],
  'lgbtq-rights': ['lgbtq', 'transgender rights', 'same-sex marriage', 'marriage equality', 'gender identity'],
  'drug-policy': ['marijuana legalization', 'cannabis', 'opioid crisis', 'fentanyl', 'drug trafficking', 'drug enforcement'],
  'voting-rights': ['voting rights', 'voter suppression', 'election integrity', 'gerrymandering', 'voter registration', 'mail ballot', 'proof of citizenship'],
  'taxes-and-spending': ['tax reform', 'tax cut', 'tax increase', 'federal budget', 'national debt', 'debt ceiling', 'government shutdown', 'spending bill', 'appropriations'],
  'labor-and-unions': ['labor union', 'minimum wage', 'workers rights', 'collective bargaining', 'labor dispute'],
  'privacy-and-surveillance': ['government surveillance', 'wiretapping', 'digital privacy', 'privacy law', 'fisa'],
  'trade-and-tariffs': ['tariff', 'trade war', 'trade agreement', 'trade deficit', 'trade policy', 'trade deal'],
}

/** GNews `top-headlines` mixes in general national news, so screen it. */
const POLITICAL_SIGNALS = [
  'congress', 'senate', 'house', 'representative', 'senator', 'governor', 'president',
  'trump', 'democrat', 'republican', 'gop', 'legislation', 'bill', 'law', 'policy',
  'vote', 'election', 'campaign', 'court', 'judge', 'ruling', 'executive order',
  'white house', 'capitol', 'federal', 'government', 'administration', 'political',
  'bipartisan', 'caucus', 'committee', 'oversight', 'impeach', 'amendment', 'military',
  'pentagon', 'sanctions', 'diplomacy', 'ceasefire', 'immigration', 'border', 'tariff',
  'tax', 'budget', 'shutdown', 'supreme court', 'attorney general', 'doj', 'fbi',
  'abortion', 'gun control', 'healthcare', 'medicare', 'climate', 'union', 'voter',
]

export interface Topic {
  title: string
  description: string
  url: string
  sourceName: string | null
  image: string | null
  publishedAt: string
}

export function isPolitical(title: string, description = ''): boolean {
  const text = `${title} ${description}`.toLowerCase()
  return POLITICAL_SIGNALS.some((s) => text.includes(s))
}

export function matchIssueSlug(title: string, description = ''): string | null {
  const text = `${title} ${description}`.toLowerCase()
  let bestSlug: string | null = null
  let bestScore = 0
  for (const [slug, keywords] of Object.entries(ISSUE_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) if (text.includes(kw)) score++
    if (score > bestScore) {
      bestScore = score
      bestSlug = slug
    }
  }
  return bestScore >= 1 ? bestSlug : null
}

/** Drop near-identical headlines (the same story from many outlets). */
export function dedupeByTitle<T extends { title: string }>(articles: T[]): T[] {
  const words = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 3)
  const out: T[] = []
  for (const a of articles) {
    const aw = words(a.title)
    const dupe = out.some((seen) => {
      const sw = words(seen.title)
      const overlap = aw.filter((w) => sw.includes(w)).length
      return overlap >= Math.min(aw.length, sw.length) * 0.7
    })
    if (!dupe) out.push(a)
  }
  return out
}

async function getText(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), timeoutMs)
    const r = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PoliApp/1.0)' },
    })
    clearTimeout(t)
    return r.ok ? r.text() : null
  } catch {
    return null
  }
}

/** Preferred source: carries summaries and images. Costs 6 requests. */
export async function fetchFromGNews(key: string): Promise<Topic[]> {
  const out: Topic[] = []
  const urls = [
    ...(['nation', 'world'] as const).map(
      (t) => `https://gnews.io/api/v4/top-headlines?topic=${t}&lang=en&country=us&max=10&apikey=${key}`
    ),
    ...[
      'Congress legislation bill vote',
      'Senate House representatives policy',
      'governor state law executive order',
      'Supreme Court ruling decision',
    ].map(
      (q) =>
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&country=us&max=5&sortby=publishedAt&apikey=${key}`
    ),
  ]

  for (const [i, url] of urls.entries()) {
    // The free tier 429s on rapid bursts, so space the calls out.
    if (i > 0) await new Promise((r) => setTimeout(r, 1200))
    const body = await getText(url)
    if (!body) continue
    let json: { articles?: Array<Record<string, unknown>> }
    try {
      json = JSON.parse(body)
    } catch {
      continue
    }
    for (const a of json.articles ?? []) {
      const title = String(a.title ?? '')
      const link = String(a.url ?? '')
      if (!title || !link) continue
      out.push({
        title,
        description: String(a.description ?? ''),
        url: link,
        sourceName: (a.source as { name?: string } | undefined)?.name ?? null,
        image: (a.image as string | undefined) ?? null,
        publishedAt: (a.publishedAt as string | undefined) ?? new Date().toISOString(),
      })
    }
  }
  return out
}

/** Always-available source: no key, no quota. Summaries yes, images no. */
export async function fetchFromRss(): Promise<Topic[]> {
  const results = await Promise.allSettled(
    POLITICS_FEEDS.map(async ({ name, url }) => {
      const xml = await getText(url)
      if (!xml) return [] as Topic[]
      return parseRssItems(xml).map((i) => ({
        title: i.title,
        description: i.description,
        url: i.link,
        sourceName: i.source || name,
        image: null,
        publishedAt: i.pubDate ? new Date(i.pubDate).toISOString() : new Date().toISOString(),
      }))
    })
  )
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}

export interface RefreshResult {
  source: 'gnews' | 'rss' | 'gnews+rss'
  fetched: number
  considered: number
  inserted: number
  deactivated: number
  skippedExisting: number
}

/**
 * Refresh `daily_topics`. Pulls GNews when a key is supplied, and falls back to
 * RSS whenever GNews returns too little to fill the homepage strip.
 */
export async function refreshDailyTopics(
  supabase: {
    from: (t: string) => any
  },
  opts: { gnewsKey?: string; maxAgeDays?: number } = {}
): Promise<RefreshResult> {
  const { gnewsKey, maxAgeDays = 3 } = opts

  // RSS leads. The GNews free tier is explicitly 12 hours behind ("real-time
  // news data is only available on paid plans") and 429s on bursts, so relying
  // on it would reintroduce the staleness this module exists to fix. Publisher
  // feeds are minutes old, keyless and unthrottled. GNews is merged in on top
  // when a key exists, purely for the images and extra breadth it adds.
  const rss = await fetchFromRss()
  const usedRss = rss.length > 0

  let gnews: Topic[] = []
  if (gnewsKey) gnews = await fetchFromGNews(gnewsKey)
  const usedGnews = gnews.length > 0

  // RSS first so that on a duplicate story the fresher RSS copy wins.
  const articles = [...rss, ...gnews]

  const fetched = articles.length

  // unique urls, recent enough, political, then collapse duplicate stories
  const seen = new Set<string>()
  const cutoffMs = Date.now() - maxAgeDays * 86400000
  const fresh = articles.filter((a) => {
    if (!a.url || seen.has(a.url)) return false
    seen.add(a.url)
    const t = new Date(a.publishedAt).getTime()
    if (!Number.isFinite(t) || t < cutoffMs) return false
    return isPolitical(a.title, a.description)
  })
  const deduped = dedupeByTitle(fresh).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  // retire yesterday's strip so the homepage can never serve stale headlines
  const cutoffIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: retired } = await supabase
    .from('daily_topics')
    .update({ is_active: false })
    .lt('published_at', cutoffIso)
    .eq('is_pinned', false)
    .eq('is_active', true)
    .select('id')
  const deactivated = retired?.length ?? 0

  const { data: issues } = await supabase.from('issues').select('id, slug')
  const issueMap = new Map<string, string>((issues ?? []).map((i: any) => [i.slug, i.id]))

  const { data: existing } = await supabase
    .from('daily_topics')
    .select('source_url')
    .in('source_url', deduped.map((a) => a.url))
  const known = new Set<string>((existing ?? []).map((r: any) => r.source_url))

  const rows = deduped
    .filter((a) => !known.has(a.url))
    .map((a) => {
      const slug = matchIssueSlug(a.title, a.description)
      return {
        title: a.title,
        summary: a.description || null,
        source_url: a.url,
        source_name: a.sourceName,
        image_url: a.image,
        issue_id: slug ? issueMap.get(slug) ?? null : null,
        published_at: a.publishedAt,
        is_active: true,
      }
    })

  let inserted = 0
  for (let i = 0; i < rows.length; i += 50) {
    const chunk = rows.slice(i, i + 50)
    const { error } = await supabase.from('daily_topics').insert(chunk)
    if (!error) inserted += chunk.length
  }

  return {
    source: usedGnews && usedRss ? 'gnews+rss' : usedGnews ? 'gnews' : 'rss',
    fetched,
    considered: deduped.length,
    inserted,
    deactivated,
    skippedExisting: known.size,
  }
}
