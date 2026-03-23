import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, PUBLIC_READ } from '@/lib/utils/rate-limit'

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, PUBLIC_READ)
  if (!limited.success) return limited.response

  const q = request.nextUrl.searchParams.get('q')?.trim()?.slice(0, 200)

  if (!q || q.length < 2) {
    return NextResponse.json([])
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('politicians')
    .select('id, name, slug, title, state, party, image_url')
    .ilike('name', `%${q}%`)
    .order('name')
    .limit(8)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [], {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}
