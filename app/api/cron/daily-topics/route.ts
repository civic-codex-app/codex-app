import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

// Vercel Cron: runs every hour
// Configured in vercel.json

const GNEWS_KEY = process.env.GNEWS_API_KEY
const CRON_SECRET = process.env.CRON_SECRET

// Issue keyword matching — uses multi-word phrases where possible to avoid false positives.
// Single words are only used when they're unambiguous political terms.
const ISSUE_KEYWORDS: Record<string, string[]> = {
  'immigration-and-border-security': ['immigration', 'deportation', 'undocumented', 'migrant', 'asylum', 'border wall', 'border security', 'border patrol', 'illegal immigrant', 'immigration policy', 'ICE agent', 'ICE arrest', 'detained immigrant', 'ice memo', 'ice restrict'],
  'economy-and-jobs': ['recession', 'inflation', 'unemployment', 'economic growth', 'job market', 'federal reserve', 'interest rate', 'economic policy', 'stock market', 'wall street', 'jobs report', 'gdp'],
  'healthcare-and-medicare': ['healthcare', 'medicare', 'medicaid', 'obamacare', 'affordable care act', 'drug prices', 'health insurance', 'prescription drug', 'public health'],
  'climate-and-environment': ['climate change', 'global warming', 'carbon emissions', 'environmental protection', 'renewable energy', 'greenhouse gas', 'clean energy', 'paris agreement', 'wildfire', 'epa'],
  'gun-policy-and-2nd-amendment': ['gun control', 'gun violence', 'firearm', 'mass shooting', 'second amendment', 'gun legislation', 'gun law'],
  'education-and-student-debt': ['student loan', 'student debt', 'college tuition', 'education policy', 'school funding', 'teacher pay', 'public school', 'education'],
  'national-defense-and-military': ['pentagon', 'military', 'defense budget', 'armed forces', 'defense secretary', 'national security', 'troops', 'airstrike', 'missile strike', 'air strike', 'warship', 'navy', 'drone strike', 'army', 'strikes land', 'bombing', 'fighter jet'],
  'foreign-policy-and-diplomacy': ['foreign policy', 'diplomatic', 'sanctions', 'ceasefire', 'peace deal', 'state department', 'ambassador', 'nato', 'united nations', 'negotiations', 'peace plan', 'war with', 'conflict with', 'iran deal', 'iran war', 'ukraine war', 'middle east crisis', 'double bind'],
  'technology-and-ai-regulation': ['artificial intelligence', 'tech regulation', 'social media regulation', 'ai regulation', 'ai policy', 'data privacy law', 'big tech', 'antitrust', 'social media addiction'],
  'criminal-justice-reform': ['criminal justice', 'police reform', 'prison reform', 'sentencing reform', 'mass incarceration', 'death penalty', 'prosecution', 'indictment', 'arraign', 'contempt'],
  'social-security-and-medicare': ['social security', 'retirement benefits', 'social security reform'],
  'infrastructure-and-transportation': ['infrastructure bill', 'infrastructure spending', 'public transit', 'broadband access', 'highway funding'],
  'housing-and-affordability': ['housing crisis', 'affordable housing', 'housing market', 'rent control', 'homelessness', 'mortgage rate', 'housing policy'],
  'energy-policy-and-oil-gas': ['oil drilling', 'natural gas', 'pipeline project', 'energy independence', 'oil production', 'fracking', 'energy policy', 'oil sanctions', 'oil price', 'energy crisis', 'energy emergency'],
  'reproductive-rights': ['abortion', 'reproductive rights', 'roe v wade', 'planned parenthood', 'contraception', 'abortion ban'],
  'lgbtq-rights': ['lgbtq', 'transgender rights', 'same-sex marriage', 'marriage equality', 'gender identity'],
  'drug-policy': ['marijuana legalization', 'cannabis', 'opioid crisis', 'fentanyl', 'drug trafficking', 'drug enforcement', 'drug smuggling'],
  'voting-rights': ['voting rights', 'voter suppression', 'election integrity', 'gerrymandering', 'ballot', 'voter registration', 'special election', 'mail ballot', 'proof of citizenship', 'voting bill', ' vote'],
  'taxes-and-spending': ['tax reform', 'tax cut', 'tax increase', 'federal budget', 'national debt', 'debt ceiling', 'government shutdown', 'spending bill', 'appropriations', 'farm bill', 'food aid'],
  'labor-and-unions': ['labor union', 'minimum wage', 'workers rights', 'collective bargaining', 'labor dispute'],
  'privacy-and-surveillance': ['government surveillance', 'wiretapping', 'digital privacy', 'privacy law', 'fisa'],
  'trade-and-tariffs': ['tariff', 'trade war', 'trade agreement', 'trade deficit', 'trade policy', 'trade deal'],
}

// Filter out non-political articles from top-headlines (which includes general national news)
const POLITICAL_SIGNALS = [
  'congress', 'senate', 'house', 'representative', 'senator', 'governor', 'president',
  'trump', 'biden', 'democrat', 'republican', 'gop', 'legislation', 'bill', 'law',
  'policy', 'vote', 'election', 'campaign', 'court', 'judge', 'ruling', 'executive order',
  'white house', 'capitol', 'federal', 'government', 'administration', 'political',
  'bipartisan', 'partisan', 'caucus', 'committee', 'oversight', 'impeach', 'amendment',
  'military', 'pentagon', 'sanctions', 'diplomacy', 'ceasefire', 'war', 'troops',
  'immigration', 'border', 'deportation', 'tariff', 'tax', 'budget', 'shutdown',
  'supreme court', 'attorney general', 'doj', 'fbi', 'homeland security', 'state department',
  'abortion', 'gun control', 'healthcare', 'medicare', 'climate', 'union',
  'iran', 'ukraine', 'china', 'russia', 'nato', 'ballot', 'voter',
]

function isPolitical(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  return POLITICAL_SIGNALS.some(signal => text.includes(signal))
}

function matchIssueSlug(title: string, description: string): string | null {
  const text = `${title} ${description}`.toLowerCase()
  let bestSlug: string | null = null
  let bestScore = 0
  for (const [slug, keywords] of Object.entries(ISSUE_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) score++
    }
    if (score > bestScore) { bestScore = score; bestSlug = slug }
  }
  return bestScore >= 1 ? bestSlug : null
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

  // Filter out non-political stories (top-headlines includes general national news)
  const politicalArticles = allArticles.filter(a => isPolitical(a.title, a.description ?? ''))

  // Deduplicate similar headlines
  const dedupedArticles: typeof politicalArticles = []
  for (const a of politicalArticles) {
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

  // Deactivate old topics (24h, non-pinned)
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
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
