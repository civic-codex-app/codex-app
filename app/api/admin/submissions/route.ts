import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  const serviceClient = createServiceRoleClient()

  const body = await request.json()
  const { id, status } = body

  if (!id || !['new', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { error } = await serviceClient
    .from('public_submissions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
