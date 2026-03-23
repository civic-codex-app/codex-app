import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export const dynamic = 'force-dynamic'

const CATEGORY_LABELS: Record<string, string> = {
  economy: 'Economy',
  healthcare: 'Healthcare',
  immigration: 'Immigration',
  education: 'Education',
  defense: 'Defense',
  environment: 'Environment',
  justice: 'Justice',
  foreign_policy: 'Foreign Policy',
  technology: 'Technology',
  social: 'Social',
  gun_policy: 'Gun Policy',
  infrastructure: 'Infrastructure',
  housing: 'Housing',
  energy: 'Energy',
}

export default async function AdminIssuesPage() {
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('issues')
    .select('*, politician_issues(id)')
    .order('name')

  const issues = data ?? []

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold">Issues</h1>
          <p className="text-sm text-[var(--codex-sub)]">{issues.length} issues</p>
        </div>
        <Link
          href="/admin/issues/new"
          className="rounded-md bg-[var(--codex-text)] px-4 py-2 text-sm font-medium text-[var(--codex-bg)] no-underline hover:opacity-90"
        >
          + Add Issue
        </Link>
      </div>

      <div className="overflow-hidden rounded-md border border-[var(--codex-border)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--codex-border)] bg-[var(--codex-card)]">
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Issue
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Category
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Stances
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue: any) => (
              <tr
                key={issue.id}
                className="border-b border-[var(--codex-border)] transition-colors hover:bg-[var(--codex-hover)]"
              >
                <td className="px-4 py-3 text-sm font-medium">
                  {issue.icon && <span className="mr-2">{issue.icon}</span>}
                  {issue.name}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--codex-badge-text)]">
                    {CATEGORY_LABELS[issue.category] ?? issue.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[var(--codex-sub)]">
                  {(issue.politician_issues as any[])?.length ?? 0} politicians
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/issues/${issue.id}`}
                    className="text-xs text-[var(--codex-sub)] hover:text-[var(--codex-text)]"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {issues.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-[var(--codex-faint)]">
                  No issues yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
