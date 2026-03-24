// Fetch daily political news from GNews API and save to daily_topics table.
// Usage: export $(grep -v '^#' .env.local | xargs) && node scripts/fetch-daily-topics.mjs
//
// Can also be called via: POST /api/admin/daily-topics/refresh

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const vars = {}
for (const line of env.split('\n')) {
  const [k, ...v] = line.split('=')
  if (k && !k.startsWith('#')) vars[k.trim()] = v.join('=').trim()
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY)
const GNEWS_KEY = vars.GNEWS_API_KEY

if (!GNEWS_KEY) {
  console.error('Missing GNEWS_API_KEY in .env.local')
  process.exit(1)
}

// Issue keyword mapping — links news articles to platform issues
const ISSUE_KEYWORDS = {
  'immigration-and-border-security': ['immigration', 'border', 'migrant', 'deportation', 'asylum', 'ICE'],
  'economy-and-jobs': ['economy', 'jobs', 'unemployment', 'inflation', 'tariff', 'trade', 'GDP', 'recession', 'wages'],
  'healthcare-and-medicare': ['healthcare', 'medicare', 'medicaid', 'ACA', 'obamacare', 'insurance', 'drug prices', 'hospital'],
  'climate-and-environment': ['climate', 'environment', 'EPA', 'emissions', 'renewable', 'fossil fuel', 'green energy', 'pollution'],
  'gun-policy-and-2nd-amendment': ['gun', 'firearm', 'shooting', 'NRA', 'second amendment', '2nd amendment', 'gun control'],
  'education-and-student-debt': ['education', 'student loan', 'student debt', 'college', 'university', 'school'],
  'national-defense-and-military': ['military', 'defense', 'pentagon', 'troops', 'NATO', 'missile', 'army', 'navy'],
  'foreign-policy-and-diplomacy': ['foreign policy', 'diplomacy', 'sanctions', 'ambassador', 'treaty', 'UN', 'China', 'Russia', 'Ukraine'],
  'technology-and-ai-regulation': ['AI', 'artificial intelligence', 'tech regulation', 'social media', 'data privacy', 'TikTok'],
  'criminal-justice-reform': ['criminal justice', 'police', 'prison', 'sentencing', 'crime', 'law enforcement'],
  'social-security-and-medicare': ['social security', 'retirement', 'pension', 'seniors'],
  'infrastructure-and-transportation': ['infrastructure', 'roads', 'bridges', 'transportation', 'rail', 'highway'],
  'housing-and-affordability': ['housing', 'rent', 'mortgage', 'affordable housing', 'homelessness'],
  'energy-policy-and-oil-gas': ['energy', 'oil', 'gas', 'pipeline', 'drilling', 'OPEC', 'nuclear'],
}

async function fetchIssues() {
  const { data } = await supabase.from('issues').select('id, slug')
  return data ?? []
}

function matchIssue(title, description, issues) {
  const text = `${title} ${description}`.toLowerCase()
  let bestSlug = null
  let bestCount = 0

  for (const [slug, keywords] of Object.entries(ISSUE_KEYWORDS)) {
    const count = keywords.filter(kw => text.includes(kw.toLowerCase())).length
    if (count > bestCount) {
      bestCount = count
      bestSlug = slug
    }
  }

  if (!bestSlug) return null
  return issues.find(i => i.slug === bestSlug)?.id ?? null
}

async function main() {
  console.log('Fetching daily political news from GNews...')

  // Use targeted political searches for diverse, relevant results
  const searches = [
    'Congress legislation policy',
    'White House president executive',
    'Senate House representatives bill',
    'governor state policy',
  ]

  const allArticles = []
  const seenUrls = new Set()

  for (const q of searches) {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&country=us&max=5&apikey=${GNEWS_KEY}`
    const res = await fetch(url)
    if (!res.ok) {
      console.error(`  Search "${q}" failed: ${res.status}`)
      continue
    }
    const { articles } = await res.json()
    if (!articles) continue
    for (const a of articles) {
      if (!seenUrls.has(a.url)) {
        seenUrls.add(a.url)
        allArticles.push(a)
      }
    }
    console.log(`  Search "${q}": ${articles.length} results`)
  }

  if (allArticles.length === 0) {
    console.log('No articles returned')
    return
  }

  // Deduplicate similar headlines (same story from different outlets)
  const dedupedArticles = []
  for (const a of allArticles) {
    const words = a.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3)
    const isDupe = dedupedArticles.some(existing => {
      const existingWords = existing.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3)
      const overlap = words.filter(w => existingWords.includes(w)).length
      return overlap >= Math.min(words.length, existingWords.length) * 0.5
    })
    if (!isDupe) dedupedArticles.push(a)
    else console.log(`  Dedup skip: ${a.title.slice(0, 50)}...`)
  }

  const articles = dedupedArticles
  console.log(`Got ${articles.length} unique articles (from ${allArticles.length} total)`)

  const issues = await fetchIssues()
  console.log(`Loaded ${issues.length} issues for matching`)

  // Deactivate old topics (older than 48 hours)
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  await supabase
    .from('daily_topics')
    .update({ is_active: false })
    .lt('published_at', cutoff)
    .eq('is_pinned', false)

  let inserted = 0
  for (const article of articles) {
    // Skip duplicates by source URL
    const { data: existing } = await supabase
      .from('daily_topics')
      .select('id')
      .eq('source_url', article.url)
      .limit(1)

    if (existing && existing.length > 0) {
      console.log(`  Skip (duplicate): ${article.title.slice(0, 60)}...`)
      continue
    }

    const issueId = matchIssue(article.title, article.description ?? '', issues)

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

    if (error) {
      console.error(`  Error inserting "${article.title.slice(0, 40)}": ${error.message}`)
      continue
    }

    console.log(`  + ${article.title.slice(0, 60)}... (issue: ${issueId ? 'matched' : 'none'})`)
    inserted++
  }

  console.log(`\nDone! Inserted ${inserted} new topics.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
