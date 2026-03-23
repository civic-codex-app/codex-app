import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, PUBLIC_READ } from '@/lib/utils/rate-limit'

/**
 * POST /api/representatives/stances
 *
 * Body: { politician_ids: string[], issue_slugs: string[] }
 *
 * Returns stances for the given politicians on the given issues.
 */
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, PUBLIC_READ)
    if (!limited.success) return limited.response

    const body = await request.json()
    const { politician_ids, issue_slugs } = body as {
      politician_ids: string[]
      issue_slugs: string[]
    }

    if (
      !Array.isArray(politician_ids) ||
      !Array.isArray(issue_slugs) ||
      politician_ids.length === 0 ||
      issue_slugs.length === 0
    ) {
      return NextResponse.json({ stances: [] })
    }

    // Cap to prevent abuse
    const polIds = politician_ids.slice(0, 20)
    const slugs = issue_slugs.slice(0, 20)

    const supabase = await createClient()

    // Look up issue IDs from slugs
    const { data: issues } = await supabase
      .from('issues')
      .select('id, slug')
      .in('slug', slugs)

    if (!issues || issues.length === 0) {
      return NextResponse.json({ stances: [] })
    }

    const issueIds = issues.map((i) => i.id)
    const issueSlugMap = new Map(issues.map((i) => [i.id, i.slug]))

    // Fetch stances
    const { data: stanceRows } = await supabase
      .from('politician_issues')
      .select('politician_id, issue_id, stance')
      .in('politician_id', polIds)
      .in('issue_id', issueIds)

    const stances = (stanceRows ?? []).map((row) => ({
      politician_id: row.politician_id,
      issue_slug: issueSlugMap.get(row.issue_id) ?? '',
      stance: row.stance,
    }))

    return NextResponse.json(
      { stances },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    )
  } catch (err) {
    console.error('Representatives stances API error:', err)
    return NextResponse.json({ stances: [] }, { status: 500 })
  }
}
