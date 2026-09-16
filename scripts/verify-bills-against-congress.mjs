/**
 * Verify every bill in the database against the Congress.gov API.
 *
 * The 2026-09-09 audit found ~73% of the original 118 bills paired a real bill
 * number with the wrong title -- S.1 stored as "For the People Act of 2023"
 * when S.1 is the Freedom to Vote Act. They were replaced by
 * rebuild-bills-from-congress.mjs. A spot check of 11 of the 175 replacements
 * matched exactly, but 11 is a sample, not a verdict, and this is the class of
 * error that reads as plausible.
 *
 * So check all of them. Congress.gov allows 20,000 requests an hour, so there
 * is no reason to sample.
 *
 * Compares our stored title against the bill's display title and its full
 * title list, because a bill's short title ("TAKE IT DOWN Act") and its
 * official title ("An act to criminalize...") are both legitimate and a naive
 * string compare would flag the pairing as wrong.
 *
 * Report only. Responses cache to .congress-cache/.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | xargs)
 *   node scripts/verify-bills-against-congress.mjs
 *   node scripts/verify-bills-against-congress.mjs --verbose
 */
import { createClient } from '@supabase/supabase-js'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const VERBOSE = process.argv.includes('--verbose')
const KEY = process.env.CONGRESS_API_KEY
const CACHE = '.congress-cache/bills'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
if (!KEY) { console.error('CONGRESS_API_KEY is not set.'); process.exit(1) }

/**
 * Our own `number` column is not consistent: most rows use the dotted form
 * ("H.Con.Res.58") but a couple use a flattened one ("HCONRES.58"). Normalise
 * by stripping punctuation from the prefix rather than listing both spellings.
 */
const TYPE = {
  hr: 'hr', s: 's',
  hres: 'hres', sres: 'sres',
  hjres: 'hjres', sjres: 'sjres',
  hconres: 'hconres', sconres: 'sconres',
}
const typeOf = (prefix) => TYPE[String(prefix).toLowerCase().replace(/[^a-z]/g, '')] ?? null

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

async function bill(congress, type, num) {
  if (!existsSync(CACHE)) await mkdir(CACHE, { recursive: true })
  const f = `${CACHE}/${congress}-${type}-${num}.json`
  if (existsSync(f)) return JSON.parse(await readFile(f, 'utf8'))
  const r = await fetch(`https://api.congress.gov/v3/bill/${congress}/${type}/${num}?api_key=${KEY}`)
  if (!r.ok) return { __status: r.status }
  const j = await r.json()
  await writeFile(f, JSON.stringify(j))
  return j
}

async function titles(congress, type, num) {
  if (!existsSync(CACHE)) await mkdir(CACHE, { recursive: true })
  const f = `${CACHE}/${congress}-${type}-${num}-titles.json`
  if (existsSync(f)) return JSON.parse(await readFile(f, 'utf8'))
  const r = await fetch(`https://api.congress.gov/v3/bill/${congress}/${type}/${num}/titles?api_key=${KEY}`)
  if (!r.ok) return { titles: [] }
  const j = await r.json()
  await writeFile(f, JSON.stringify(j))
  return j
}

const rows = []
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb.from('bills').select('id, number, title, congress_session').range(from, from + 999)
  if (error) throw new Error(error.message)
  rows.push(...data)
  if (data.length < 1000) break
}
console.log(`\nverifying ${rows.length} bills against Congress.gov\n`)

const ok = [], mismatch = [], notFound = [], unparsed = [], oddFormat = []

/** The dotted form Congress.gov and most of our rows use. */
const CANONICAL = {
  hr: 'H.R.', s: 'S.', hres: 'H.Res.', sres: 'S.Res.',
  hjres: 'H.J.Res.', sjres: 'S.J.Res.', hconres: 'H.Con.Res.', sconres: 'S.Con.Res.',
}

for (const r of rows) {
  const m = String(r.number).match(/^([A-Za-z.]+?)(\d+)$/)
  const type = m ? typeOf(m[1]) : null
  if (!type) { unparsed.push(r); continue }
  // congress_session is stored as "119th", not a number.
  const congress = parseInt(String(r.congress_session), 10) || 119

  const canonical = `${CANONICAL[type]}${m[2]}`
  if (String(r.number) !== canonical) oddFormat.push({ r, canonical })

  const j = await bill(congress, type, m[2])
  if (j.__status) { notFound.push({ r, status: j.__status }); continue }

  const official = j.bill?.title ?? ''
  const mine = norm(r.title)
  let matched = norm(official) === mine || norm(official).startsWith(mine) || mine.startsWith(norm(official))

  // A bill legitimately has several titles; the short title and the official
  // title are both correct, so check the full list before calling it wrong.
  let all = [official]
  if (!matched) {
    const t = await titles(congress, type, m[2])
    all = (t.titles ?? []).map((x) => x.title).filter(Boolean)
    matched = all.some((x) => norm(x) === mine || norm(x).startsWith(mine) || mine.startsWith(norm(x)))
  }

  if (matched) ok.push(r)
  else mismatch.push({ r, official, all })
}

console.log(`match      ${ok.length}`)
console.log(`MISMATCH   ${mismatch.length}`)
console.log(`not found  ${notFound.length}`)
console.log(`unparsed   ${unparsed.length}`)
console.log(`non-canonical number format: ${oddFormat.length}`)

if (mismatch.length) {
  console.log('\nMISMATCHES:')
  for (const { r, official, all } of mismatch) {
    console.log(`  ${r.number}`)
    console.log(`    ours     : ${r.title}`)
    console.log(`    congress : ${official}`)
    if (VERBOSE && all.length > 1) for (const a of all.slice(0, 6)) console.log(`       alt   : ${a}`)
  }
}
for (const { r, status } of notFound) console.log(`  not found: ${r.number} (HTTP ${status})`)
for (const r of unparsed) console.log(`  unparsed number: ${JSON.stringify(r.number)}`)
if (oddFormat.length) {
  console.log('\nNON-CANONICAL NUMBER FORMAT (cosmetic — the bills themselves verify):')
  for (const { r, canonical } of oddFormat) console.log(`  ${JSON.stringify(r.number)} -> should render as "${canonical}"`)
}

console.log(`\n${mismatch.length + notFound.length + unparsed.length === 0 ? 'ALL VERIFIED' : 'issues above'}`)
