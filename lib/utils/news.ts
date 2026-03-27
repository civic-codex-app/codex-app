import { unstable_cache } from 'next/cache'
import {
  getBias,
  biasToGroup,
  type MediaBias,
  type BiasGroup,
} from '@/lib/data/media-bias'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface NewsArticle {
  title: string
  url: string
  source: string
  sourceDomain: string
  bias: MediaBias | null
  biasGroup: BiasGroup
  publishedAt: string // ISO date string
}

/* ------------------------------------------------------------------ */
/*  Simple RSS XML parser (no dependency needed)                       */
/* ------------------------------------------------------------------ */

function parseRssItems(xml: string): Array<{
  title: string
  link: string
  pubDate: string
  source: string
  sourceUrl: string
}> {
  const items: Array<{
    title: string
    link: string
    pubDate: string
    source: string
    sourceUrl: string
  }> = []

  // Match all <item>...</item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]

    const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() ?? ''
    const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? ''
    const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? ''
    const sourceMatch = block.match(/<source\s+url="([^"]*)"[^>]*>([\s\S]*?)<\/source>/)
    const source = sourceMatch?.[2]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() ?? ''
    const sourceUrl = sourceMatch?.[1] ?? ''

    if (title && link) {
      items.push({ title, link, pubDate, source, sourceUrl })
    }
  }

  return items
}

/* ------------------------------------------------------------------ */
/*  Fetcher                                                            */
/* ------------------------------------------------------------------ */

async function fetchPoliticianNews(name: string): Promise<NewsArticle[]> {
  const query = encodeURIComponent(`"${name}" politics`)
  const url = `https://news.google.com/rss/search?q=${query}&ceid=US:en&hl=en-US&gl=US`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const resp = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PoliApp/1.0)',
      },
    })
    clearTimeout(timeout)

    if (!resp.ok) {
      console.error(`[News] RSS fetch failed for "${name}": HTTP ${resp.status}`)
      return []
    }

    const xml = await resp.text()
    const items = parseRssItems(xml)

    if (items.length === 0) {
      console.warn(`[News] No items parsed for "${name}" (xml length: ${xml.length})`)
    }

    // Map ALL items (not just first 30) so we get balanced perspective coverage
    const allArticles = items
      .map((item) => {
        let sourceDomain = ''
        try {
          sourceDomain = item.sourceUrl
            ? new URL(item.sourceUrl).hostname.replace(/^www\./, '')
            : ''
        } catch {}
        const bias = getBias(item.sourceUrl || item.link)
        return {
          title: item.title,
          url: item.link,
          source: item.source || sourceDomain,
          sourceDomain,
          bias,
          biasGroup: biasToGroup(bias),
          publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        }
      })
      .filter((a) => a.title && a.url)

    // Build balanced selection: up to 5 per perspective, sorted by date
    const byGroup: Record<string, NewsArticle[]> = { left: [], center: [], right: [], unknown: [] }
    for (const a of allArticles) {
      byGroup[a.biasGroup].push(a)
    }

    // Take up to 5 per known perspective + up to 5 from unknown/other
    const PER_GROUP = 5
    const balanced: NewsArticle[] = [
      ...byGroup.left.slice(0, PER_GROUP),
      ...byGroup.center.slice(0, PER_GROUP),
      ...byGroup.right.slice(0, PER_GROUP),
      ...byGroup.unknown.slice(0, PER_GROUP),
    ]

    // Sort final selection by date (newest first)
    return balanced.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  } catch {
    return []
  }
}

/* ------------------------------------------------------------------ */
/*  Cached wrapper                                                     */
/* ------------------------------------------------------------------ */

export function getCachedNews(name: string): Promise<NewsArticle[]> {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return unstable_cache(
    () => fetchPoliticianNews(name),
    [`news-v2-${slug}`],
    { revalidate: 600, tags: ['news'] }
  )()
}
