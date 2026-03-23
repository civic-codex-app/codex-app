import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

async function verifyAdmin(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const service = createServiceRoleClient()
  const { data: profile } = await service
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return null
  return user.id
}

export async function GET(request: NextRequest) {
  const adminId = await verifyAdmin(request)
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '30')
  const since = new Date(Date.now() - days * 86400000).toISOString()

  const supabase = createServiceRoleClient()

  // Run all queries in parallel
  const [
    topEventsResult,
    dailyUsersResult,
    topPagesResult,
    topPoliticiansResult,
    topSearchesResult,
    quizFunnelResult,
    hourlyResult,
    recentResult,
    totalEventsResult,
    totalUsersResult,
    newUsersResult,
  ] = await Promise.all([
    supabase.rpc('get_analytics_top_events', { since_date: since }),
    supabase.rpc('get_analytics_daily_users', { since_date: since }),
    supabase.rpc('get_analytics_top_pages', { since_date: since, max_results: 15 }),
    supabase.rpc('get_analytics_top_politicians', { since_date: since, max_results: 15 }),
    supabase.rpc('get_analytics_top_searches', { since_date: since, max_results: 15 }),
    supabase.rpc('get_analytics_quiz_funnel', { since_date: since }),
    supabase.rpc('get_analytics_hourly_pattern', { since_date: since }),
    supabase.rpc('get_analytics_recent_activity', { max_results: 50 }),
    // Total event count
    supabase.from('analytics_events').select('id', { count: 'exact', head: true }).gte('created_at', since),
    // Total unique users
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    // New users in period
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', since),
  ])

  // Top cities from event_data geo fields
  const { data: geoRows } = await supabase
    .from('analytics_events')
    .select('event_data')
    .gte('created_at', since)
    .not('event_data->>_city', 'is', null)
    .limit(1000)

  const cityMap = new Map<string, number>()
  for (const row of geoRows ?? []) {
    const city = row.event_data?._city as string | undefined
    const region = row.event_data?._region as string | undefined
    if (city) {
      const key = region ? `${city}, ${region}` : city
      cityMap.set(key, (cityMap.get(key) ?? 0) + 1)
    }
  }
  const topCities = Array.from(cityMap.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  // Compute today's stats
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { count: todayEvents } = await supabase
    .from('analytics_events')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', todayStart.toISOString())

  return NextResponse.json({
    period: { days, since },
    overview: {
      totalEvents: totalEventsResult.count ?? 0,
      todayEvents: todayEvents ?? 0,
      totalUsers: totalUsersResult.count ?? 0,
      newUsers: newUsersResult.count ?? 0,
    },
    topEvents: topEventsResult.data ?? [],
    dailyUsers: dailyUsersResult.data ?? [],
    topPages: topPagesResult.data ?? [],
    topPoliticians: topPoliticiansResult.data ?? [],
    topSearches: topSearchesResult.data ?? [],
    quizFunnel: quizFunnelResult.data ?? [],
    hourlyPattern: hourlyResult.data ?? [],
    recentActivity: recentResult.data ?? [],
    topCities,
  })
}
