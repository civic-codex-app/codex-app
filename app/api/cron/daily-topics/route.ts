import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

// Vercel Cron: runs daily at 12pm UTC (7am CT)
// Configured in vercel.json

const GNEWS_KEY = process.env.GNEWS_API_KEY
const CRON_SECRET = process.env.CRON_SECRET

const ISSUE_KEYWORDS: Record<string, string[]> = {
  'immigration-and-border-security': ['immigration', 'border', 'migrant', 'deportation', 'asylum', 'ICE'],
  'economy-and-jobs': ['economy', 'jobs', 'unemployment', 'inflation', 'tariff', 'trade', 'GDP', 'recession'],
  'healthcare-and-medicare': ['healthcare', 'medicare', 'medicaid', 'ACA', 'obamacare', 'drug prices'],
  'climate-and-environment': ['climate', 'environment', 'EPA', 'emissions', 'renewable', 'fossil fuel'],
  'gun-policy-and-2nd-amendment': ['gun', 'firearm', 'shooting', 'NRA', 'gun control'],
  'education-and-student-debt': ['education', 'student loan', 'student debt', 'college', 'school'],
  'national-defense-and-military': ['military', 'defense', 'pentagon', 'troops', 'NATO'],
  'foreign-policy-and-diplomacy': ['foreign policy', 'diplomacy', 'sanctions', 'China', 'Russia', 'Ukraine'],
  'technology-and-ai-regulation': ['AI', 'artificial intelligence', 'tech regulation', 'TikTok', 'data privacy'],
  'criminal-justice-reform': ['criminal justice', 'police', 'prison', 'crime'],
  'social-security-and-medicare': ['social security', 'retirement', 'pension'],
  'infrastructure-and-transportation': ['infrastructure', 'roads', 'bridges', 'transportation'],
  'housing-and-affordability': ['housing', 'rent', 'mortgage', 'affordable housing'],
  'energy-policy-and-oil-gas': ['energy', 'oil', 'gas', 'pipeline', 'drilling'],
  'reproductive-rights': ['abortion', 'reproductive', 'roe', 'planned parenthood', 'contraception'],
  'lgbtq-rights': ['lgbtq', 'transgender', 'same-sex', 'marriage equality', 'gender identity'],
  'drug-policy': ['marijuana', 'cannabis', 'drug', 'opioid', 'fentanyl', 'legalization'],
  'voting-rights': ['voting rights', 'voter', 'election', 'gerrymandering', 'ballot'],
  'taxes-and-spending': ['tax', 'budget', 'deficit', 'spending', 'debt ceiling'],
  'labor-and-unions': ['labor', 'union', 'workers', 'strike', 'minimum wage'],
  'privacy-and-surveillance': ['privacy', 'surveillance', 'FISA', 'NSA', 'data collection'],
  'trade-and-tariffs': ['tariff', 'trade war', 'import', 'export', 'trade deal'],
}

function matchIssueSlug(title: string, description: string): string | null {
  const text = `${title} ${description}`.toLowerCase()
  let bestSlug: string | null = null
  let bestCount = 0
  for (const [slug, keywords] of Object.entries(ISSUE_KEYWORDS)) {
    const count = keywords.filter(kw => text.includes(kw.toLowerCase())).length
    if (count > bestCount) { bestCount = count; bestSlug = slug }
  }
  return bestSlug
}

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!GNEWS_KEY) {
    return NextResponse.json({ error: 'GNEWS_API_KEY not configured' }, { status: 500 })
  }

  const supabase = createServiceRoleClient()

  const allArticles: { title: string; description: string; url: string; source: { name: string }; image: string; publishedAt: string }[] = []
  const seenUrls = new Set<string>()

  const addArticles = (articles: typeof allArticles) => {
    for (const a of articles) {
      if (a.url && !seenUrls.has(a.url)) {
        seenUrls.add(a.url)
        allArticles.push(a)
      }
    }
  }

  // 1. Top headlines — freshest political news
  for (const topic of ['nation', 'world'] as const) {
    const url = `https://gnews.io/api/v4/top-headlines?topic=${topic}&lang=en&country=us&max=10&apikey=${GNEWS_KEY}`
    const res = await fetch(url)
    if (!res.ok) continue
    const { articles } = await res.json()
    if (articles) addArticles(articles)
  }

  // 2. Targeted searches for political coverage
  const searches = [
    'Congress legislation bill vote',
    'Senate House representatives policy',
    'governor state law executive order',
    'Supreme Court ruling decision',
  ]

  for (const q of searches) {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&country=us&max=5&sortby=publishedAt&apikey=${GNEWS_KEY}`
    const res = await fetch(url)
    if (!res.ok) continue
    const { articles } = await res.json()
    if (articles) addArticles(articles)
  }

  if (allArticles.length === 0) {
    return NextResponse.json({ message: 'No articles returned', inserted: 0 })
  }

  // Deduplicate similar headlines
  const dedupedArticles: typeof allArticles = []
  for (const a of allArticles) {
    const words = a.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3)
    const isDupe = dedupedArticles.some(existing => {
      const existingWords = existing.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3)
      const overlap = words.filter(w => existingWords.includes(w)).length
      return overlap >= Math.min(words.length, existingWords.length) * 0.7
    })
    if (!isDupe) dedupedArticles.push(a)
  }

  const { data: issues } = await supabase.from('issues').select('id, slug')
  const issueMap = new Map((issues ?? []).map(i => [i.slug, i.id]))

  // Deactivate old topics (48h, non-pinned)
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  await supabase
    .from('daily_topics')
    .update({ is_active: false })
    .lt('published_at', cutoff)
    .eq('is_pinned', false)

  let inserted = 0
  for (const article of dedupedArticles) {
    const { data: existing } = await supabase
      .from('daily_topics')
      .select('id')
      .eq('source_url', article.url)
      .limit(1)

    if (existing && existing.length > 0) continue

    const issueSlug = matchIssueSlug(article.title, article.description ?? '')
    const issueId = issueSlug ? issueMap.get(issueSlug) ?? null : null

    const { error } = await supabase
      .from('daily_topics')
      .insert({
        title: article.title,
        summary: article.description ?? null,
        source_url: article.url,
        source_name: article.source?.name ?? null,
        image_url: article.image ?? null,
        issue_id: issueId,
        published_at: article.publishedAt ?? new Date().toISOString(),
      })

    if (error) continue
    inserted++
  }

  return NextResponse.json({ message: `Inserted ${inserted} new topics`, inserted, total: dedupedArticles.length })
}
