import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

async function isAdmin() {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return false
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return data?.role === 'admin'
}

// GET: count demo users
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_demo', true)

  return NextResponse.json({ count: count ?? 0 })
}

// DELETE: remove all demo users
export async function DELETE() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()

  // Find all demo profiles
  let allDemos: { id: string }[] = []
  let from = 0
  while (true) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_demo', true)
      .range(from, from + 999)
    if (!data?.length) break
    allDemos.push(...data)
    from += 1000
  }

  if (allDemos.length === 0) {
    return NextResponse.json({ deleted: 0 })
  }

  // Delete auth users (cascades to profiles)
  let deleted = 0
  let failed = 0
  for (const d of allDemos) {
    const { error } = await supabase.auth.admin.deleteUser(d.id)
    if (error) {
      failed++
    } else {
      deleted++
    }
  }

  return NextResponse.json({ deleted, failed, total: allDemos.length })
}
