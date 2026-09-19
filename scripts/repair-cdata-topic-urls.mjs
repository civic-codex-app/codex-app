/**
 * Unwrap CDATA from daily_topics.source_url.
 *
 * parseRssItems ran every text field through htmlToText (which unwraps CDATA)
 * but took <link> raw, so feeds that wrap their links — ABC News does — stored
 * the literal "<![CDATA[https://…]]>". An href that is not an absolute URL is
 * resolved relative to our own origin, so those rows rendered as homepage
 * links that 404'd against getpoli.app. Found by `pnpm verify:pages`, which
 * follows every internal link.
 *
 * The parser is fixed in lib/utils/news.ts (extractUrl); this repairs what the
 * old one already wrote. A row whose URL cannot be recovered as an absolute
 * http(s) URL is left alone and reported rather than guessed at.
 *
 * Dry-run by default; --apply writes, after a backup.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/repair-cdata-topic-urls.mjs [--apply]
 */
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'node:fs'
import { has } from './lib/cli.mjs'

const APPLY = has('apply')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

/** Mirrors extractUrl in lib/utils/news.ts. */
function extractUrl(raw) {
  const unwrapped = String(raw ?? '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  const decoded = unwrapped.replace(/&amp;/g, '&').trim()
  try {
    const u = new URL(decoded)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : ''
  } catch {
    return ''
  }
}

const rows = []
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb.from('daily_topics').select('id,title,source_url,source_name').range(from, from + 999)
  if (error) throw new Error(error.message)
  rows.push(...data)
  if (data.length < 1000) break
}

// A URL the browser would resolve against our own origin is the defect,
// whether or not CDATA is the cause.
const broken = rows.filter((r) => r.source_url && extractUrl(r.source_url) !== r.source_url)
const repairable = broken.filter((r) => extractUrl(r.source_url) !== '')
const unrecoverable = broken.filter((r) => extractUrl(r.source_url) === '')

console.log(`${APPLY ? '*** APPLYING ***' : '--- DRY RUN (pass --apply to write) ---'}\n`)
console.log(`${rows.length} daily_topics rows; ${broken.length} with an unusable source_url`)
const byHost = new Map()
for (const r of repairable) {
  const h = new URL(extractUrl(r.source_url)).host
  byHost.set(h, (byHost.get(h) ?? 0) + 1)
}
for (const [h, n] of [...byHost].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${h}`)
if (unrecoverable.length) {
  console.log(`\n${unrecoverable.length} cannot be recovered and will be left as they are:`)
  for (const r of unrecoverable.slice(0, 5)) console.log(`  ${String(r.source_url).slice(0, 88)}`)
}
if (!repairable.length) { console.log('\nNothing to repair.'); process.exit(0) }

console.log(`\nexample: ${String(repairable[0].source_url).slice(0, 78)}`)
console.log(`      -> ${extractUrl(repairable[0].source_url).slice(0, 78)}`)

if (!APPLY) { console.log('\nNothing written.'); process.exit(0) }

const backup = `daily-topics-url-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`
writeFileSync(backup, JSON.stringify(broken.map(({ id, source_url }) => ({ id, source_url })), null, 1))
console.log(`\nbacked up ${broken.length} row(s) to ${backup}`)

let fixed = 0, failed = 0
for (const r of repairable) {
  const { error } = await sb.from('daily_topics').update({ source_url: extractUrl(r.source_url) }).eq('id', r.id).eq('source_url', r.source_url)
  if (error) { failed++; console.log(`  FAILED ${r.id}: ${error.message}`) } else fixed++
}
console.log(`\nrepaired ${fixed}, ${failed} failed, ${unrecoverable.length} left alone`)
process.exit(failed ? 1 : 0)
