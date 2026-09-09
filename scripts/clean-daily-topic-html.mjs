/**
 * Scrub leftover HTML markup and entities out of stored `daily_topics` text.
 *
 * The RSS parser used to strip tags BEFORE decoding entities, so feeds that
 * wrap entity-escaped markup in CDATA (The Guardian) had their whole anchor
 * stored as literal text -- including utm tracking URLs approaching 300
 * characters. One unbreakable token that long sets the min-content width of
 * its grid track and pushes the homepage "Today in Politics" strip past the
 * viewport on mobile.
 *
 * lib/utils/news.ts is fixed, but that only affects rows ingested from now on
 * and the cron runs once a day, so this repairs what is already stored. It
 * only ever rewrites text the feed itself supplied -- it invents nothing.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/clean-daily-topic-html.mjs           # dry run, prints diffs
 *   node scripts/clean-daily-topic-html.mjs --apply   # writes
 */
import { createClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Keep in step with decodeEntities()/htmlToText() in lib/utils/news.ts.
const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  hellip: '…', mdash: '—', ndash: '–', middot: '·',
}

function decodeEntities(input) {
  return input.replace(/&(#\d+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (whole, body) => {
    if (body[0] !== '#') return NAMED_ENTITIES[body.toLowerCase()] ?? whole
    const code = body[1] === 'x' || body[1] === 'X'
      ? parseInt(body.slice(2), 16)
      : parseInt(body.slice(1), 10)
    if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return whole
    if (code >= 0xd800 && code <= 0xdfff) return whole
    return String.fromCodePoint(code)
  })
}

function htmlToText(raw) {
  let text = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  for (let pass = 0; pass < 3; pass++) {
    const next = decodeEntities(text).replace(/<[^>]*>/g, ' ')
    if (next === text) break
    text = next
  }
  return text.replace(/\s+/g, ' ').trim()
}

const PAGE = 1000
const rows = []
for (let from = 0; ; from += PAGE) {
  const { data, error } = await sb
    .from('daily_topics')
    .select('id, title, summary, source_name')
    .range(from, from + PAGE - 1)
  if (error) throw new Error(error.message)
  rows.push(...data)
  if (data.length < PAGE) break
}

const longestToken = (s) =>
  (s || '').split(/\s+/).reduce((a, w) => (w.length > a.length ? w : a), '')

console.log(`\n${APPLY ? '*** APPLYING ***' : '--- DRY RUN (pass --apply to write) ---'}`)
console.log(`scanned ${rows.length} daily_topics rows\n`)

const dirty = []
for (const r of rows) {
  const next = {
    title: htmlToText(r.title ?? ''),
    summary: r.summary === null ? null : htmlToText(r.summary) || null,
    source_name: r.source_name === null ? null : htmlToText(r.source_name) || null,
  }
  const changed = Object.keys(next).filter((k) => next[k] !== r[k])
  if (changed.length) dirty.push({ row: r, next, changed })
}

for (const { row, next, changed } of dirty) {
  console.log(`- ${row.id}`)
  for (const field of changed) {
    const before = row[field] ?? ''
    const after = next[field] ?? ''
    const wasLongest = longestToken(before).length
    const nowLongest = longestToken(after).length
    console.log(`    ${field}: ${before.length} -> ${after.length} chars, longest token ${wasLongest} -> ${nowLongest}`)
    if (wasLongest > 40) console.log(`      dropped: ${JSON.stringify(longestToken(before).slice(0, 90))}...`)
  }
}

console.log(`\n${dirty.length} of ${rows.length} rows need cleaning`)

if (APPLY && dirty.length) {
  let ok = 0
  for (const { row, next } of dirty) {
    const { error } = await sb.from('daily_topics').update(next).eq('id', row.id)
    if (error) console.log(`  ! ${row.id}: ${error.message}`)
    else ok++
  }
  console.log(`=> updated ${ok}`)
}
