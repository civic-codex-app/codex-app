import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { refreshDailyTopics } from '@/lib/utils/daily-topics'

// Vercel Cron — schedule lives in vercel.json.
// Keep it at every 3 hours or slower: each run costs 6 GNews requests and the
// free tier allows 100/day. Hourly (144/day) exhausts the quota.
//
// A missing GNEWS_API_KEY is no longer fatal — refreshDailyTopics falls back to
// keyless publisher RSS. This route previously 500'd without the key, which is
// why the homepage served 125-day-old headlines.

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const result = await refreshDailyTopics(supabase, {
    gnewsKey: process.env.GNEWS_API_KEY,
  })

  if (result.fetched === 0) {
    return NextResponse.json(
      { error: 'No articles from GNews or RSS', ...result },
      { status: 502 }
    )
  }

  return NextResponse.json({
    message: `Inserted ${result.inserted} new topics from ${result.source}`,
    ...result,
  })
}
