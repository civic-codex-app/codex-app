import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { AdminShell } from '@/components/admin/admin-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Auth guard: check if user is logged in and has admin role
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin')
  }

  // Use service role to check admin status (bypasses RLS)
  const supabase = createServiceRoleClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  return <AdminShell>{children}</AdminShell>
}
