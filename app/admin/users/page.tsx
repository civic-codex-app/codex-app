import { createServiceRoleClient } from '@/lib/supabase/service-role'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const supabase = createServiceRoleClient()

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, email, role, avatar_url, state, zip_code, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const users = profiles ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--codex-text)]">Users</h1>
        <p className="mt-1 text-sm text-[var(--codex-sub)]">
          {users.length} registered users
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--codex-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--codex-border)] bg-[var(--codex-hover)]">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--codex-sub)]">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--codex-sub)]">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--codex-sub)]">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--codex-sub)]">State</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--codex-sub)]">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-b border-[var(--codex-border)] last:border-b-0 hover:bg-[var(--codex-hover)]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--codex-border)] text-xs font-medium text-[var(--codex-sub)]">
                        {(u.display_name || u.email || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-[var(--codex-text)]">
                      {u.display_name || 'No name'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--codex-sub)]">{u.email || '—'}</td>
                <td className="px-4 py-3">
                  {u.role === 'admin' ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">admin</span>
                  ) : (
                    <span className="text-[var(--codex-faint)]">user</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--codex-sub)]">{u.state || '—'}</td>
                <td className="px-4 py-3 text-[var(--codex-faint)]">
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
