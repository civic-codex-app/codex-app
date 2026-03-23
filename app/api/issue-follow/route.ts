import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ followed: [] })
  }

  const { data, error } = await supabase
    .from('issue_follows')
    .select('issue_id')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const followed = (data ?? []).map((r: { issue_id: string }) => r.issue_id)
  return NextResponse.json({ followed })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const issueId = body.issue_id as string | undefined

  if (!issueId) {
    return NextResponse.json({ error: 'issue_id is required' }, { status: 400 })
  }

  // Check if already following
  const { data: existing } = await supabase
    .from('issue_follows')
    .select('id')
    .eq('user_id', user.id)
    .eq('issue_id', issueId)
    .maybeSingle()

  if (existing) {
    // Unfollow
    const { error } = await supabase
      .from('issue_follows')
      .delete()
      .eq('user_id', user.id)
      .eq('issue_id', issueId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ following: false })
  } else {
    // Follow
    const { error } = await supabase
      .from('issue_follows')
      .insert({ user_id: user.id, issue_id: issueId })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ following: true })
  }
}
