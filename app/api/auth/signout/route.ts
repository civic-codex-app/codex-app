import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, WRITE_OP } from '@/lib/utils/rate-limit'

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, WRITE_OP); if (!limited.success) return limited.response;
  const supabase = await createClient()
  await supabase.auth.signOut()
  const origin = request.nextUrl.origin
  return NextResponse.redirect(new URL('/?signedout=1', origin))
}
