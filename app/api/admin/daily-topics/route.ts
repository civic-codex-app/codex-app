import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { refreshDailyTopics } from '@/lib/utils/daily-topics'
import { requireAdmin } from '@/lib/auth/require-admin'

// Manual "refresh news" trigger for the admin Daily Topics screen.
// Shares one ingestion path with the cron route (lib/utils/daily-topics) so the
// two can't drift apart again — they previously kept separate, divergent issue
// keyword lists and both hard-failed without GNEWS_API_KEY.

export async function POST() {
  // This route had no auth check at all, and the proxy does not cover
  // /api/admin (it matches on "/admin", which "/api/admin/…" does not start
  // with). An anonymous POST reached this handler, ingested news into
  // daily_topics through the service role — which bypasses the RLS that
  // migration 029 added — and spent the GNews quota on request.
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

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
