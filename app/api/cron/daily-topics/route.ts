import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

// Vercel Cron: runs daily at 12pm UTC (7am CT)
// Configured in vercel.json

const GNEWS_KEY = process.env.GNEWS_API_KEY
const CRON_SECRET = process.env.CRON_SECRET

// Keywords use word-boundary matching to avoid false positives (e.g. "AI" in "Air Canada")
// Each keyword can be a phrase (matched as substring) or a single word (matched with boundaries)
const ISSUE_KEYWORDS: Record<string, string[]> = {
  'immigration-and-border-security': ['immigration', 'border wall', 'border security', 'migrant', 'deportation', 'asylum seeker', 'undocumented', 'illegal immigrant', 'border patrol', 'immigration policy'],
  'economy-and-jobs': ['economic growth', 'unemployment rate', 'inflation rate', 'job market', 'recession', 'GDP growth', 'federal reserve', 'interest rate', 'economic policy', 'stock market crash'],
  'healthcare-and-medicare': ['healthcare', 'medicare', 'medicaid', 'affordable care act', 'obamacare', 'drug prices', 'health insurance', 'public health', 'prescription drug'],
  'climate-and-environment': ['climate change', 'global warming', 'carbon emissions', 'environmental protection', 'renewable energy', 'paris agreement', 'greenhouse gas', 'clean energy'],
  'gun-policy-and-2nd-amendment': ['gun control', 'gun violence', 'firearm', 'mass shooting', 'second amendment', 'gun legislation', 'background check'],
  'education-and-student-debt': ['student loan', 'student debt', 'college tuition', 'public education', 'education policy', 'school funding', 'teacher pay'],
  'national-defense-and-military': ['military spending', 'defense budget', 'pentagon', 'armed forces', 'military base', 'defense secretary', 'national security'],
  'foreign-policy-and-diplomacy': ['foreign policy', 'diplomatic', 'sanctions against', 'international relations', 'peace deal', 'treaty', 'ambassador', 'state department'],
  'technology-and-ai-regulation': ['artificial intelligence', 'tech regulation', 'data privacy law', 'social media regulation', 'antitrust tech', 'ai regulation', 'ai policy'],
  'criminal-justice-reform': ['criminal justice', 'police reform', 'prison reform', 'sentencing reform', 'mass incarceration', 'death penalty'],
  'social-security-and-medicare': ['social security', 'retirement benefits', 'pension fund', 'social security reform'],
  'infrastructure-and-transportation': ['infrastructure bill', 'infrastructure spending', 'highway', 'public transit', 'broadband access'],
  'housing-and-affordability': ['housing crisis', 'affordable housing', 'housing market', 'rent control', 'homelessness', 'mortgage rate'],
  'energy-policy-and-oil-gas': ['energy policy', 'oil drilling', 'natural gas', 'pipeline project', 'energy independence', 'oil production', 'fracking'],
  'reproductive-rights': ['abortion', 'reproductive rights', 'roe v wade', 'planned parenthood', 'contraception', 'abortion ban'],
  'lgbtq-rights': ['lgbtq', 'transgender rights', 'same-sex marriage', 'marriage equality', 'gender identity', 'anti-lgbtq'],
  'drug-policy': ['marijuana legalization', 'cannabis', 'opioid crisis', 'fentanyl', 'drug enforcement', 'drug trafficking', 'war on drugs'],
  'voting-rights': ['voting rights', 'voter suppression', 'election integrity', 'gerrymandering', 'ballot access', 'voter registration'],
  'taxes-and-spending': ['tax reform', 'tax cut', 'tax increase', 'federal budget', 'national debt', 'debt ceiling', 'government spending', 'government shutdown'],
  'labor-and-unions': ['labor union', 'workers rights', 'strike action', 'minimum wage', 'collective bargaining', 'labor dispute'],
  'privacy-and-surveillance': ['privacy law', 'government surveillance', 'wiretapping', 'data collection', 'digital privacy'],
  'trade-and-tariffs': ['trade tariff', 'trade war', 'trade agreement', 'trade deficit', 'import tariff', 'trade policy', 'trade deal'],
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
  // Require at least 2 keyword matches to assign a category — avoids false positives
  return bestScore >= 2 ? bestSlug : null
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
