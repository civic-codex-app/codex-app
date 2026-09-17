/**
 * The rest of an issue page's stance groups, on demand.
 *
 *   GET /api/issues/[slug]/stances?bucket=supports&offset=6&limit=6
 *     -> { entries: StanceEntry[] (politicians trimmed to a preview), entryCount }
 *   GET /api/issues/[slug]/stances?bucket=supports&entry=<key>
 *     -> { politicians: StancePolitician[] } — everyone in that entry
 *
 * The page itself ships only the first entries of each bucket with a preview
 * of each entry's politicians. Everything here is public data read with the
 * service role; responses are cacheable at the CDN for an hour, matching the
 * page's own revalidate window.
 */
import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { getIssueStanceGroups, trimEntry, INITIAL_ENTRIES, STANCE_BUCKETS, type StanceBucketKey } from '@/lib/issues/stance-groups'

const CACHE = { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const url = new URL(request.url)
  const bucket = url.searchParams.get('bucket') as StanceBucketKey | null
  const entryKey = url.searchParams.get('entry')
  const offset = Math.max(0, Number(url.searchParams.get('offset')) || 0)
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || INITIAL_ENTRIES))

  if (!bucket || !STANCE_BUCKETS.includes(bucket)) {
    return NextResponse.json({ error: `bucket must be one of ${STANCE_BUCKETS.join(', ')}` }, { status: 400 })
  }

  const supabase = createServiceRoleClient()
  const { data: issue, error } = await supabase.from('issues').select('id').eq('slug', slug).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!issue) return NextResponse.json({ error: 'issue not found' }, { status: 404 })

  const { buckets } = await getIssueStanceGroups(supabase, issue.id)
  const group = buckets[bucket]
  if (!group) return NextResponse.json({ error: 'no politicians in that bucket' }, { status: 404 })

  if (entryKey) {
    const entry = group.entries.find((e) => e.key === entryKey)
    if (!entry) return NextResponse.json({ error: 'no such entry' }, { status: 404 })
    return NextResponse.json({ politicians: entry.politicians }, { headers: CACHE })
  }

  return NextResponse.json(
    { entries: group.entries.slice(offset, offset + limit).map(trimEntry), entryCount: group.entries.length },
    { headers: CACHE }
  )
}
