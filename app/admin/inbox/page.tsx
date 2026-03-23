import { createServiceRoleClient } from '@/lib/supabase/service-role'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, string> = {
  contact: 'Contact',
  suggest_politician: 'Suggest Politician',
  update_politician: 'Update Request',
  report_error: 'Error Report',
  submit_tip: 'Tip',
}

const STATUS_COLORS: Record<string, string> = {
  new: '#EAB308',
  reviewed: '#3B82F6',
  resolved: '#22C55E',
  dismissed: '#6B7280',
}

export default async function AdminInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = createServiceRoleClient()

  let query = supabase
    .from('public_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (params.type) query = query.eq('type', params.type)
  if (params.status) query = query.eq('status', params.status)

  const { data: submissions } = await query
  const items = submissions ?? []

  // Counts by status
  const { data: allItems } = await supabase.from('public_submissions').select('status')
  const statusCounts: Record<string, number> = {}
  for (const item of allItems ?? []) {
    statusCounts[item.status] = (statusCounts[item.status] || 0) + 1
  }

  function buildUrl(overrides: Record<string, string>) {
    const p: Record<string, string> = {}
    if (params.type) p.type = params.type
    if (params.status) p.status = params.status
    Object.assign(p, overrides)
    // Remove empty values
    for (const k of Object.keys(p)) { if (!p[k]) delete p[k] }
    const qs = new URLSearchParams(p).toString()
    return `/admin/inbox${qs ? `?${qs}` : ''}`
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Inbox</h1>
      <p className="mb-6 text-sm text-gray-500">
        All public submissions — contact messages, suggestions, error reports, and tips.
      </p>

      {/* Status tabs */}
      <div className="mb-4 flex gap-2">
        {['', 'new', 'reviewed', 'resolved', 'dismissed'].map((s) => (
          <Link
            key={s}
            href={buildUrl({ status: s })}
            className={`rounded-md px-3 py-1.5 text-xs font-medium no-underline transition-colors ${
              (params.status ?? '') === s
                ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            {s || 'All'}
            {s && statusCounts[s] ? ` (${statusCounts[s]})` : s === '' ? ` (${allItems?.length ?? 0})` : ''}
          </Link>
        ))}
      </div>

      {/* Type filter */}
      <div className="mb-6 flex gap-2">
        {['', ...Object.keys(TYPE_LABELS)].map((t) => (
          <Link
            key={t}
            href={buildUrl({ type: t })}
            className={`rounded-md px-3 py-1.5 text-xs font-medium no-underline transition-colors ${
              (params.type ?? '') === t
                ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            {t ? TYPE_LABELS[t] : 'All Types'}
          </Link>
        ))}
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No submissions found.</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <details key={item.id} className="rounded-lg border border-gray-200 dark:border-gray-700">
              <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[item.status] ?? '#6B7280' }}
                />
                <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase dark:bg-gray-800">
                  {TYPE_LABELS[item.type] ?? item.type}
                </span>
                <span className="flex-1 truncate font-medium">
                  {item.name ?? 'Anonymous'} — {item.email}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </summary>
              <div className="border-t border-gray-200 px-4 py-4 dark:border-gray-700">
                <div className="mb-3 grid gap-2 text-sm">
                  <div><span className="text-gray-400">Type:</span> {TYPE_LABELS[item.type] ?? item.type}</div>
                  <div><span className="text-gray-400">From:</span> {item.name} ({item.email})</div>
                  <div><span className="text-gray-400">Status:</span> {item.status}</div>
                  <div><span className="text-gray-400">Date:</span> {new Date(item.created_at).toLocaleString()}</div>
                </div>
                <div className="rounded-md bg-gray-50 p-3 text-sm dark:bg-gray-800">
                  <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(item.data, null, 2)}</pre>
                </div>
                {/* Status update form */}
                <form action={`/api/admin/submissions/${item.id}`} method="POST" className="mt-3 flex gap-2">
                  {['reviewed', 'resolved', 'dismissed'].filter(s => s !== item.status).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="rounded-md border px-3 py-1 text-xs font-medium capitalize transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={async () => {
                        // Client-side won't work here since this is a server component
                        // We'll use a separate admin action
                      }}
                    >
                      Mark {s}
                    </button>
                  ))}
                </form>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
