import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { refreshDailyTopics } from '@/lib/utils/daily-topics'

// Manual "refresh news" trigger for the admin Daily Topics screen.
// Shares one ingestion path with the cron route (lib/utils/daily-topics) so the
// two can't drift apart again — they previously kept separate, divergent issue
// keyword lists and both hard-failed without GNEWS_API_KEY.

export async function POST() {
  const supabase = createServiceRoleClient()
  const result = await refreshDailyTopics(supabase, {
    gnewsKey: process.env.GNEWS_API_KEY,
  })

  if (result.fetched === 0) {
    return NextResponse.json(
      { error: 'No articles available from GNews or RSS', ...result },
      { status: 502 }
    )
  }

  return NextResponse.json({
    message: `Inserted ${result.inserted} new topics from ${result.source}`,
    ...result,
  })
}
