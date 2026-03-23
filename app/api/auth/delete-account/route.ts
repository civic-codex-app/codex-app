import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { rateLimit, EXPENSIVE_OP } from '@/lib/utils/rate-limit'

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, EXPENSIVE_OP); if (!limited.success) return limited.response;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Delete user data first (service role bypasses RLS)
  const admin = createServiceRoleClient()
  await admin.from('follows').delete().eq('user_id', user.id)
  await admin.from('likes').delete().eq('user_id', user.id)
  await admin.from('poll_votes').delete().eq('user_id', user.id)
  await admin.from('profiles').delete().eq('id', user.id)

  // Delete the auth user (requires service role)
  const { error } = await admin.auth.admin.deleteUser(user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
