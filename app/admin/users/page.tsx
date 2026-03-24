import Image from 'next/image'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { DemoUserActions } from '@/components/admin/demo-user-actions'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const supabase = createServiceRoleClient()

  // Fetch real users (non-demo), sorted newest first
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, email, role, avatar_url, state, zip_code, is_demo, created_at')
    .eq('is_demo', false)
    .order('created_at', { ascending: false })
    .limit(200)

  // Count demo users
  const { count: demoCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_demo', true)

  // Count demo users by state for breakdown
  const { data: demoByState } = await supabase
    .from('profiles')
    .select('state')
    .eq('is_demo', true)

  const stateCounts: Record<string, number> = {}
  for (const d of demoByState ?? []) {
    if (d.state) stateCounts[d.state] = (stateCounts[d.state] || 0) + 1
  }

  const users = profiles ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--poli-text)]">Users</h1>
        <p className="mt-1 text-sm text-[var(--poli-sub)]">
          {users.length} registered users
        </p>
      </div>

      {/* Demo Users Section */}
      <div className="mb-8 rounded-lg border border-[var(--poli-border)] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
              Demo Community Members
            </h2>
            <p className="mt-1 text-[24px] font-bold text-[var(--poli-text)]">
              {demoCount ?? 0}
            </p>
            {Object.keys(stateCounts).length > 0 && (
              <p className="mt-1 text-[12px] text-[var(--poli-faint)]">
                Across {Object.keys(stateCounts).length} states
                {' · '}
                {Object.values(stateCounts).every(c => c === Object.values(stateCounts)[0])
                  ? `${Object.values(stateCounts)[0]} per state`
                  : `${Math.min(...Object.values(stateCounts))}–${Math.max(...Object.values(stateCounts))} per state`
                }
              </p>
            )}
          </div>
          <DemoUserActions count={demoCount ?? 0} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--poli-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--poli-border)] bg-[var(--poli-hover)]">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--poli-sub)]">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--poli-sub)]">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--poli-sub)]">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--poli-sub)]">State</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--poli-sub)]">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-b border-[var(--poli-border)] last:border-b-0 hover:bg-[var(--poli-hover)]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {u.avatar_url ? (
                      <Image src={u.avatar_url} alt={u.display_name || 'User avatar'} width={32} height={32} className="h-8 w-8 rounded-full object-cover" unoptimized />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--poli-border)] text-xs font-medium text-[var(--poli-sub)]">
                        {(u.display_name || u.email || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-[var(--poli-text)]">
                      {u.display_name || 'No name'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--poli-sub)]">{u.email || '—'}</td>
                <td className="px-4 py-3">
                  {u.role === 'admin' ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">admin</span>
                  ) : (
                    <span className="text-[var(--poli-faint)]">user</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--poli-sub)]">{u.state || '—'}</td>
                <td className="px-4 py-3 text-[var(--poli-faint)]">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
