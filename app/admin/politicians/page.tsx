import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'
import type { Politician } from '@/lib/types/politician'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string; party?: string; chamber?: string }>
}

export default async function AdminPoliticiansPage({ searchParams }: PageProps) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10))
  const query = params.q ?? ''
  const partyFilter = params.party ?? ''
  const chamberFilter = params.chamber ?? ''

  const supabase = createServiceRoleClient()

  let dbQuery = supabase.from('politicians').select('*', { count: 'exact' })

  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`)
  }
  if (partyFilter) {
    dbQuery = dbQuery.eq('party', partyFilter)
  }
  if (chamberFilter) {
    dbQuery = dbQuery.eq('chamber', chamberFilter)
  }

  const from = (currentPage - 1) * PAGE_SIZE
  const { data, count } = await dbQuery
    .order('name')
    .range(from, from + PAGE_SIZE - 1)

  const politicians = (data ?? []) as Politician[]
  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  function buildUrl(overrides: Record<string, string>) {
    const base: Record<string, string> = {}
    if (query) base.q = query
    if (partyFilter) base.party = partyFilter
    if (chamberFilter) base.chamber = chamberFilter
    base.page = '1'
    const merged = { ...base, ...overrides }
    // Remove empty values
    const filtered = Object.fromEntries(Object.entries(merged).filter(([, v]) => v))
    const qs = new URLSearchParams(filtered).toString()
    return `/admin/politicians${qs ? `?${qs}` : ''}`
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold">Politicians</h1>
          <p className="text-sm text-[var(--poli-sub)]">{totalCount} entries</p>
        </div>
        <Link
          href="/admin/politicians/new"
          className="rounded-md bg-[var(--poli-text)] px-4 py-2 text-sm font-medium text-[var(--poli-bg)] no-underline hover:opacity-90"
        >
          + Add Politician
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" action="/admin/politicians" className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--poli-sub)]">
            Search
          </label>
          <input
            name="q"
            type="text"
            defaultValue={query}
            placeholder="Search by name..."
            className="w-full border border-[var(--poli-input-border)] bg-[var(--poli-input-bg)] px-4 py-2.5 text-sm text-[var(--poli-text)] outline-none focus:border-[var(--poli-input-focus)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--poli-sub)]">
            Party
          </label>
          <select
            name="party"
            defaultValue={partyFilter}
            className="border border-[var(--poli-input-border)] bg-[var(--poli-input-bg)] px-4 py-2.5 text-sm text-[var(--poli-text)] outline-none focus:border-[var(--poli-input-focus)]"
          >
            <option value="">All Parties</option>
            <option value="democrat">Democrat</option>
            <option value="republican">Republican</option>
            <option value="independent">Independent</option>
            <option value="green">Green</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--poli-sub)]">
            Chamber
          </label>
          <select
            name="chamber"
            defaultValue={chamberFilter}
            className="border border-[var(--poli-input-border)] bg-[var(--poli-input-bg)] px-4 py-2.5 text-sm text-[var(--poli-text)] outline-none focus:border-[var(--poli-input-focus)]"
          >
            <option value="">All Chambers</option>
            <option value="senate">Senate</option>
            <option value="house">House</option>
            <option value="governor">Governor</option>
            <option value="presidential">Presidential</option>
            <option value="mayor">Mayor</option>
            <option value="city_council">City Council</option>
            <option value="state_senate">State Senate</option>
            <option value="state_house">State House</option>
            <option value="county">County</option>
            <option value="school_board">School Board</option>
            <option value="other_local">Other Local</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--poli-text)] px-4 py-2.5 text-sm font-medium text-[var(--poli-bg)] hover:opacity-90"
        >
          Filter
        </button>
        {(query || partyFilter || chamberFilter) && (
          <Link
            href="/admin/politicians"
            className="px-3 py-2.5 text-sm text-[var(--poli-sub)] hover:text-[var(--poli-text)]"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-md border border-[var(--poli-border)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--poli-border)] bg-[var(--poli-card)]">
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--poli-sub)]">
                Name
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--poli-sub)]">
                Party
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--poli-sub)]">
                State
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--poli-sub)]">
                Chamber
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--poli-sub)]">
                Image
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-[var(--poli-sub)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {politicians.map((pol) => (
              <tr
                key={pol.id}
                className="border-b border-[var(--poli-border)] transition-colors hover:bg-[var(--poli-hover)]"
              >
                <td className="px-4 py-3 text-sm font-medium">{pol.name}</td>
                <td className="px-4 py-3 text-sm">
                  <PartyIcon party={pol.party} size={14} />
                </td>
                <td className="px-4 py-3 text-sm text-[var(--poli-sub)]">{pol.state}</td>
                <td className="px-4 py-3 text-sm text-[var(--poli-sub)]">
                  {CHAMBER_LABELS[pol.chamber as ChamberKey] ?? pol.chamber}
                </td>
                <td className="px-4 py-3 text-sm">
                  {pol.image_url ? (
                    <span className="text-green-400">Yes</span>
                  ) : (
                    <span className="text-[var(--poli-faint)]">No</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/politicians/${pol.id}`}
                    className="text-xs text-[var(--poli-sub)] hover:text-[var(--poli-text)]"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {politicians.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--poli-faint)]">
                  {query || partyFilter || chamberFilter ? 'No politicians match your filters' : 'No politicians yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-[var(--poli-sub)]">
            Showing {from + 1}–{Math.min(from + PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={buildUrl({ page: String(currentPage - 1) })}
                className="rounded-md border border-[var(--poli-border)] px-3 py-1.5 text-sm text-[var(--poli-sub)] no-underline hover:bg-[var(--poli-hover)]"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center gap-2">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-[var(--poli-faint)]">...</span>
                  )}
                  <Link
                    href={buildUrl({ page: String(p) })}
                    className={`rounded-md border px-3 py-1.5 text-sm no-underline ${
                      p === currentPage
                        ? 'border-[var(--poli-text)] bg-[var(--poli-text)] text-[var(--poli-bg)]'
                        : 'border-[var(--poli-border)] text-[var(--poli-sub)] hover:bg-[var(--poli-hover)]'
                    }`}
                  >
                    {p}
                  </Link>
                </span>
              ))}
            {currentPage < totalPages && (
              <Link
                href={buildUrl({ page: String(currentPage + 1) })}
                className="rounded-md border border-[var(--poli-border)] px-3 py-1.5 text-sm text-[var(--poli-sub)] no-underline hover:bg-[var(--poli-hover)]"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
