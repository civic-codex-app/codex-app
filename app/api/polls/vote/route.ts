import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { rateLimit } from '@/lib/utils/rate-limit'
import { trackServerEvent } from '@/lib/utils/analytics-server'

// Strict rate limit: 5 votes per minute per IP
const POLL_VOTE_LIMIT = { windowMs: 60_000, maxRequests: 5 }

function getIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, POLL_VOTE_LIMIT, 'poll-vote')
  if (!limited.success) return limited.response

  try {
    const body = await request.json()
    const { pollId, optionId } = body

    if (!pollId || !optionId) {
      return NextResponse.json(
        { error: 'pollId and optionId are required' },
        { status: 400 }
      )
    }

    // Check if user already voted via cookie (fast, no DB hit)
    const cookieStore = await cookies()
    const existingVote = cookieStore.get(`voted-${pollId}`)

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted on this poll' },
        { status: 409 }
      )
    }

    const ip = getIP(request)
    const supabase = createServiceRoleClient()

    // Check if this IP already voted on this poll
    if (ip !== 'unknown') {
      const { data: existingIpVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('ip_address', ip)
        .limit(1)
        .maybeSingle()

      if (existingIpVote) {
        return NextResponse.json(
          { error: 'Already voted from this network' },
          { status: 409 }
        )
      }
    }

    // Verify poll exists and is active
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id, status, ends_at')
      .eq('id', pollId)
      .single()

    if (pollError || !poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }

    if (poll.status !== 'active') {
      return NextResponse.json(
        { error: 'This poll is closed' },
        { status: 400 }
      )
    }

    if (poll.ends_at && new Date(poll.ends_at) < new Date()) {
      return NextResponse.json(
        { error: 'This poll has expired' },
        { status: 400 }
      )
    }

    // Verify option belongs to this poll
    const { data: option, error: optionError } = await supabase
      .from('poll_options')
      .select('id, poll_id')
      .eq('id', optionId)
      .eq('poll_id', pollId)
      .single()

    if (optionError || !option) {
      return NextResponse.json(
        { error: 'Invalid option for this poll' },
        { status: 400 }
      )
    }

    // Insert the vote with IP tracking
    const { error: voteError } = await supabase.from('poll_votes').insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: null,
      ip_address: ip !== 'unknown' ? ip : null,
    })

    if (voteError) {
      console.error('Failed to insert vote:', voteError.message)
      return NextResponse.json(
        { error: 'Failed to record vote' },
        { status: 500 }
      )
    }

    // Set cookie to prevent re-voting (expires in 1 year)
    cookieStore.set(`voted-${pollId}`, optionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })

    // Fetch updated results
    const { data: updatedVotes } = await supabase
      .from('poll_votes')
      .select('id, option_id')
      .eq('poll_id', pollId)

    const totalVotes = updatedVotes?.length ?? 0

    const { data: options } = await supabase
      .from('poll_options')
      .select('id, label, sort_order')
      .eq('poll_id', pollId)
      .order('sort_order')

    const results = (options ?? []).map((opt) => {
      const count = updatedVotes?.filter((v) => v.option_id === opt.id).length ?? 0
      return {
        id: opt.id,
        label: opt.label,
        votes: count,
        pct: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0,
      }
    })

    // Track poll vote
    trackServerEvent('poll_voted', { pollId, optionId, totalVotes }, { request })

    return NextResponse.json({
      success: true,
      totalVotes,
      results,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
