import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

const VALID_TYPES = ['correction', 'source', 'context'] as const

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { politicianId, issueId, annotationType, content, sourceUrl } = body

    if (!politicianId || !annotationType || !content?.trim()) {
      return NextResponse.json(
        { error: 'politicianId, annotationType, and content are required' },
        { status: 400 }
      )
    }

    if (!VALID_TYPES.includes(annotationType)) {
      return NextResponse.json(
        { error: 'annotationType must be correction, source, or context' },
        { status: 400 }
      )
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Content must be 2000 characters or fewer' },
        { status: 400 }
      )
    }

    const serviceClient = createServiceRoleClient()

    // Verify politician exists
    const { data: politician } = await serviceClient
      .from('politicians')
      .select('id')
      .eq('id', politicianId)
      .single()

    if (!politician) {
      return NextResponse.json({ error: 'Politician not found' }, { status: 404 })
    }

    // Verify issue exists if provided
    if (issueId) {
      const { data: issue } = await serviceClient
        .from('issues')
        .select('id')
        .eq('id', issueId)
        .single()

      if (!issue) {
        return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
      }
    }

    const { data: annotation, error } = await serviceClient
      .from('annotations')
      .insert({
        user_id: user.id,
        politician_id: politicianId,
        issue_id: issueId || null,
        annotation_type: annotationType,
        content: content.trim(),
        source_url: sourceUrl?.trim() || null,
        status: 'pending',
      })
      .select('id, annotation_type, content, status, created_at')
      .single()

    if (error) {
      console.error('Failed to create annotation:', error.message)
      return NextResponse.json({ error: 'Failed to create annotation' }, { status: 500 })
    }

    return NextResponse.json({ annotation }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const politicianId = sp.get('politicianId')

    if (!politicianId) {
      return NextResponse.json(
        { error: 'politicianId query parameter is required' },
        { status: 400 }
      )
    }

    const serviceClient = createServiceRoleClient()

    const { data: annotations, error } = await serviceClient
      .from('annotations')
      .select(
        `
        id,
        annotation_type,
        content,
        source_url,
        created_at,
        issue_id,
        user_id,
        profiles:user_id ( display_name ),
        issues:issue_id ( name, slug )
      `
      )
      .eq('politician_id', politicianId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Failed to fetch annotations:', error.message)
      return NextResponse.json({ error: 'Failed to fetch annotations' }, { status: 500 })
    }

    return NextResponse.json(
      { annotations: annotations ?? [] },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
