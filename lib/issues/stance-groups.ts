/**
 * Stance groups for an issue page: every politician's position on one
 * issue, deduplicated and collapsed by identical summary, in four buckets.
 *
 * Server-only. The page renders the first few entries of each bucket with a
 * preview of each entry's politicians; app/api/issues/[slug]/stances serves
 * the rest on demand. Before that split the page shipped all ~8,600
 * politicians as props to the client-side groups — 2.8MB of HTML, of which
 * about 40 politicians were visible.
 */
import { createHash } from 'node:crypto'
import type { createServiceRoleClient } from '@/lib/supabase/service-role'
import type { IssueStanceWithPoliticianRow } from '@/lib/types/supabase'
import { stanceBucket, stanceDisplayBadge, STANCE_STYLES } from '@/lib/utils/stances'

type Supabase = ReturnType<typeof createServiceRoleClient>

export interface StancePolitician {
  id: string
  name: string
  slug: string
  party: string
  chamber: string
  state: string
  title: string
  image_url: string | null
}

export interface StanceEntry {
  /** Stable id for this entry within its bucket; the API looks entries up by it. */
  key: string
  summary: string | null
  /** Everyone in the entry. `politicians` may hold only a preview of them. */
  count: number
  politicians: StancePolitician[]
}

export type StanceBucketKey = 'supports' | 'mixed' | 'opposes' | 'unknown'
export const STANCE_BUCKETS: readonly StanceBucketKey[] = ['supports', 'mixed', 'opposes', 'unknown']

export interface StanceGroupData {
  entries: StanceEntry[]
  totalCount: number
  label: string
  style: typeof STANCE_STYLES.supports
}

/** Entries per bucket in the initial HTML; "Show more" fetches the next batch. */
export const INITIAL_ENTRIES = 6
/** Politicians per entry in the initial HTML: the representative plus five others. */
export const ENTRY_PREVIEW = 6

export function trimEntry(entry: StanceEntry): StanceEntry {
  return { ...entry, politicians: entry.politicians.slice(0, ENTRY_PREVIEW) }
}

/**
 * Every stance row for the issue, past Supabase's 1000-row cap.
 *
 * One round trip for the count, then every page at once. Paging sequentially
 * meant nine dependent round trips for ~8,600 rows: about 9s per issue page on
 * its own, and with six visitors at once the issue pages took two minutes.
 * The ordering is what makes parallel ranges safe — without it, pages could
 * overlap or skip rows.
 */
export async function fetchAllStances(supabase: Supabase, issueId: string): Promise<IssueStanceWithPoliticianRow[]> {
  const PAGE = 1000
  const { count, error: countError } = await supabase
    .from('politician_issues')
    .select('id', { count: 'exact', head: true })
    .eq('issue_id', issueId)
  if (countError || count === null) {
    console.error('Failed to count stances:', countError?.message ?? 'no count')
    return []
  }
  const pages = Math.ceil(count / PAGE)
  const results = await Promise.all(
    Array.from({ length: pages }, (_, i) =>
      supabase
        .from('politician_issues')
        .select('stance, summary, politician_id, politicians:politician_id!inner(id, name, slug, party, chamber, state, title, image_url)')
        .eq('issue_id', issueId)
        .order('stance')
        .order('id')
        .range(i * PAGE, i * PAGE + PAGE - 1)
    )
  )
  const all: IssueStanceWithPoliticianRow[] = []
  for (const { data, error } of results) {
    if (error) {
      console.error('Failed to fetch stances:', error.message)
      continue
    }
    all.push(...((data ?? []) as unknown as IssueStanceWithPoliticianRow[]))
  }
  return all
}

/** Patterns that indicate a generic/boilerplate summary */
const GENERIC_PATTERNS = [
  /^supports?\s+(this\s+)?issue/i,
  /^opposes?\s+(this\s+)?issue/i,
  /^has\s+(a\s+)?(mixed|neutral|unknown)\s+(stance|position)/i,
  /^no\s+(known\s+)?(stance|position)/i,
  /^position\s+(is\s+)?(unclear|unknown)/i,
  /supports?\s+key\s+aspects?\s+of/i,
  /opposes?\s+key\s+aspects?\s+of/i,
  /generally\s+(supports?|opposes?|favors?)/i,
  /estimated\s+position/i,
  /based\s+on\s+party/i,
  /^\w+\s+\w+\s+supports?\s+key\s+aspects/i, // "[Name] supports key aspects"
  /^\w+\s+\w+\s+opposes?\s+key\s+aspects/i,
  /^\w+\s+\w+\s+has\s+(a\s+)?(mixed|neutral)/i,
  /^\w+\s+\w+\s+generally\s+(supports?|opposes?)/i,
]

export function isGenericSummary(summary: string | null): boolean {
  if (!summary || summary.trim().length === 0) return true
  if (summary.trim().length < 20) return true
  return GENERIC_PATTERNS.some((p) => p.test(summary.trim()))
}

/**
 * Normalize: lowercase, strip trailing punctuation, collapse whitespace,
 * remove common filler words to catch near-identical summaries.
 */
function summaryKey(summary: string): string {
  return summary
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\b(the|a|an|of|and|in|on|for|to|is|has|with|their|this|that)\b/g, '')
    .replace(/\b(\w{4,})s\b/g, '$1') // naive depluralize (5+ char words) to merge "protections"/"protection"
    .replace(/\s+/g, ' ')
    .trim()
}

const GENERIC_KEY = 'generic'
const entryKey = (normalized: string) => createHash('sha1').update(normalized).digest('hex').slice(0, 12)

/**
 * Deduplicate by politician, bucket by stance (neutral folds into mixed),
 * and within each bucket collapse politicians who share a summary into one
 * entry. Entries are ordered by size; politicians with only a boilerplate
 * summary form the last entry.
 */
export function buildStanceGroups(stances: IssueStanceWithPoliticianRow[]): Partial<Record<StanceBucketKey, StanceGroupData>> {
  const seenPol = new Set<string>()
  const deduped = stances.filter((s) => {
    const polId = s.politicians?.id
    if (!polId || seenPol.has(polId)) return false
    seenPol.add(polId)
    return true
  })

  const forBadge = stanceDisplayBadge('supports')
  const mixedBadge = stanceDisplayBadge('mixed')
  const againstBadge = stanceDisplayBadge('opposes')
  const unknownBadge = stanceDisplayBadge('unknown')
  const BUCKET_CONFIG: Record<StanceBucketKey, { label: string; style: StanceGroupData['style'] }> = {
    supports: { label: 'Favors', style: { ...STANCE_STYLES.supports, bg: 'bg-emerald-50', text: 'text-emerald-700', color: forBadge.color } },
    mixed: { label: 'Mixed', style: { ...STANCE_STYLES.mixed, bg: 'bg-amber-50', text: 'text-amber-700', color: mixedBadge.color } },
    opposes: { label: 'Opposes', style: { ...STANCE_STYLES.opposes, bg: 'bg-red-50', text: 'text-red-700', color: againstBadge.color } },
    unknown: { label: 'Unknown', style: { ...STANCE_STYLES.unknown, bg: 'bg-gray-50', text: 'text-gray-500', color: unknownBadge.color } },
  }

  const buckets: Record<StanceBucketKey, IssueStanceWithPoliticianRow[]> = { supports: [], mixed: [], opposes: [], unknown: [] }
  for (const s of deduped) {
    let bucket = stanceBucket(s.stance)
    if (bucket === 'neutral') bucket = 'mixed'
    buckets[bucket as StanceBucketKey].push(s)
  }

  const result: Partial<Record<StanceBucketKey, StanceGroupData>> = {}

  for (const bucket of STANCE_BUCKETS) {
    const items = buckets[bucket]
    if (items.length === 0) continue
    const config = BUCKET_CONFIG[bucket]

    const summaryMap = new Map<string, StanceEntry>()
    const noSummaryPols: StancePolitician[] = []

    for (const s of items) {
      const pol = s.politicians!
      const polData: StancePolitician = {
        id: pol.id,
        name: pol.name,
        slug: pol.slug,
        party: pol.party,
        chamber: pol.chamber,
        state: pol.state,
        title: pol.title,
        image_url: pol.image_url,
      }
      if (isGenericSummary(s.summary)) {
        noSummaryPols.push(polData)
        continue
      }
      const norm = summaryKey(s.summary!)
      const existing = summaryMap.get(norm)
      if (existing) {
        existing.politicians.push(polData)
        existing.count++
      } else {
        summaryMap.set(norm, { key: entryKey(norm), summary: s.summary!.trim(), count: 1, politicians: [polData] })
      }
    }

    const entries: StanceEntry[] = Array.from(summaryMap.values()).sort((a, b) => b.count - a.count)
    if (noSummaryPols.length > 0) {
      entries.push({ key: GENERIC_KEY, summary: null, count: noSummaryPols.length, politicians: noSummaryPols })
    }

    result[bucket] = { entries, totalCount: items.length, label: config.label, style: config.style }
  }

  return result
}

export async function getIssueStanceGroups(supabase: Supabase, issueId: string) {
  return buildStanceGroups(await fetchAllStances(supabase, issueId))
}
