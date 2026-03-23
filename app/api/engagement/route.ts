import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { checkBadges, type EngagementStats } from '@/lib/constants/badges'
import { rateLimit, WRITE_OP } from '@/lib/utils/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, WRITE_OP); if (!limited.success) return limited.response;
    const supabaseAuth = await createClient()
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { event_type, metadata } = body

    if (!event_type || typeof event_type !== 'string') {
      return NextResponse.json(
        { error: 'event_type is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()
    const userId = user.id

    // Insert engagement event
    const { error: insertError } = await supabase
      .from('engagement_events')
      .insert({
        user_id: userId,
        event_type,
        metadata: metadata ?? {},
      })

    if (insertError) {
      console.error('Failed to insert engagement event:', insertError.message)
      return NextResponse.json(
        { error: 'Failed to log event' },
        { status: 500 }
      )
    }

    // Fetch current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak, longest_streak, last_active_date, badges')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Compute streak
    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    const lastActive = profile.last_active_date // date string or null

    let currentStreak = profile.current_streak ?? 0
    let longestStreak = profile.longest_streak ?? 0

    if (lastActive !== today) {
      if (lastActive) {
        const lastDate = new Date(lastActive + 'T00:00:00Z')
        const todayDate = new Date(today + 'T00:00:00Z')
        const diffMs = todayDate.getTime() - lastDate.getTime()
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          // Yesterday: increment streak
          currentStreak += 1
        } else {
          // Gap: reset streak
          currentStreak = 1
        }
      } else {
        // First ever activity
        currentStreak = 1
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak
      }
    }
    // If lastActive === today, streak is unchanged

    // Gather stats for badge checking
    const stats = await gatherStats(supabase, userId, currentStreak, longestStreak)

    // Check for new badges
    const existingBadges: string[] = Array.isArray(profile.badges) ? profile.badges : []
    const newBadges = checkBadges(stats, existingBadges)
    const updatedBadges = [...existingBadges, ...newBadges]

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_active_date: today,
        badges: updatedBadges,
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to update profile:', updateError.message)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      streak: currentStreak,
      longestStreak,
      newBadges,
      badges: updatedBadges,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const limited = rateLimit(request, WRITE_OP); if (!limited.success) return limited.response;
    const supabaseAuth = await createClient()
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceRoleClient()
    const userId = user.id

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak, longest_streak, last_active_date, badges')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Count total events
    const { count: totalEvents } = await supabase
      .from('engagement_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Recent events (last 20)
    const { data: recentEvents } = await supabase
      .from('engagement_events')
      .select('id, event_type, metadata, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({
      currentStreak: profile.current_streak ?? 0,
      longestStreak: profile.longest_streak ?? 0,
      badges: Array.isArray(profile.badges) ? profile.badges : [],
      totalEvents: totalEvents ?? 0,
      recentEvents: recentEvents ?? [],
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function gatherStats(
  supabase: ReturnType<typeof createServiceRoleClient>,
  userId: string,
  currentStreak: number,
  longestStreak: number
): Promise<EngagementStats> {
  // Run counts in parallel
  const [
    pollVotesResult,
    billFollowsResult,
    politicianFollowsResult,
    totalEventsResult,
    quizEventsResult,
  ] = await Promise.all([
    supabase
      .from('poll_votes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('bill_follows')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('engagement_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('engagement_events')
      .select('event_type, metadata')
      .eq('user_id', userId)
      .in('event_type', ['quiz_complete', 'quiz_answer']),
  ])

  const quizEvents = quizEventsResult.data ?? []
  const quizComplete = quizEvents.some((e) => e.event_type === 'quiz_complete')

  // Count unique quiz issues answered from metadata
  const answeredIssues = new Set<string>()
  for (const e of quizEvents) {
    if (e.event_type === 'quiz_answer' && e.metadata?.issue_slug) {
      answeredIssues.add(e.metadata.issue_slug as string)
    }
  }
  // If quiz is complete, they answered all 14
  const quizIssuesAnswered = quizComplete ? 14 : answeredIssues.size

  return {
    pollVotes: pollVotesResult.count ?? 0,
    quizComplete,
    quizIssuesAnswered,
    billsFollowed: billFollowsResult.count ?? 0,
    politiciansFollowed: politicianFollowsResult.count ?? 0,
    currentStreak,
    longestStreak,
    totalEvents: totalEventsResult.count ?? 0,
  }
}
