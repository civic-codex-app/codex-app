import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SearchInput } from '@/components/directory/search-input'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'
import { CHAMBER_LABELS, type ChamberKey } from '@/lib/constants/chambers'

export const revalidate = 1800 // 30 minutes
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Browse Politicians | Poli',
  description: 'Browse all U.S. politicians by state, party, and chamber.',
}

interface PageProps {
  searchParams: Promise<{ state?: string; party?: string; chamber?: string; page?: string }>
}

const PAGE_SIZE = 50

export default async function DirectoryPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createServiceRoleClient()
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase.from('politicians').select('id, name, slug, party, state, chamber, title, image_url', { count: 'exact' })

  if (params.state) query = query.eq('state', params.state)
  if (params.party) query = query.eq('party', params.party)
  if (params.chamber) query = query.eq('chamber', params.chamber)

  query = query.order('name').range(offset, offset + PAGE_SIZE - 1)

  const { data, count } = await query
  const politicians = data ?? []
  const totalCount = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const stateLabel = params.state ?? 'All States'
  const partyLabel2 = params.party ? partyLabel(params.party) : 'All Parties'

  function buildUrl(overrides: Record<string, string>) {
    const p: Record<string, string> = {}
    if (params.state) p.state = params.state
    if (params.party) p.party = params.party
    if (params.chamber) p.chamber = params.chamber
    Object.assign(p, overrides)
    if (p.page === '1') delete p.page
    const qs = new URLSearchParams(p).toString()
    return `/directory${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        <h1 className="mb-2 text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
          {params.state ? `${stateLabel} Officials` : 'Browse Officials'}
        </h1>
        <p className="mb-6 text-[14px] text-[var(--codex-sub)]">
          {totalCount.toLocaleString()} results
          {params.state ? ` in ${stateLabel}` : ''}
          {params.party ? ` · ${partyLabel2}` : ''}
          {params.chamber ? ` · ${CHAMBER_LABELS[params.chamber as ChamberKey] ?? params.chamber}` : ''}
        </p>

        <Suspense>
          <SearchInput basePath="/directory" />
        </Suspense>

        {/* Results */}
        <div className="mb-8 space-y-2">
          {politicians.map((pol) => {
            const color = partyColor(pol.party)
            return (
              <Link
                key={pol.id}
                href={`/politicians/${pol.slug}`}
                className="flex cursor-pointer items-center gap-4 rounded-md border border-[var(--codex-border)] p-3 no-underline transition-all duration-200 hover:border-[var(--codex-text)] hover:shadow-md"
              >
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--codex-card)]">
                  <AvatarImage
                    src={pol.image_url}
                    alt={pol.name}
                    size={40}
                    party={pol.party}
                    fallbackColor={color}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium text-[var(--codex-text)]">{pol.name}</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--codex-faint)]">
                    <PartyIcon party={pol.party} size={10} />
                    <span style={{ color }}>{partyLabel(pol.party)}</span>
                    <span>·</span>
                    <span>{pol.state}</span>
                    {pol.title && <><span>·</span><span>{pol.title}</span></>}
                  </div>
                </div>
                <span className="hidden text-[11px] text-[var(--codex-faint)] sm:block">
                  {CHAMBER_LABELS[pol.chamber as ChamberKey] ?? pol.chamber}
                </span>
              </Link>
            )
          })}

          {politicians.length === 0 && (
            <div className="py-16 text-center text-[var(--codex-faint)]">
              <div className="mb-2 text-xl font-semibold">No officials found</div>
              <div className="text-sm">Try adjusting your filters</div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mb-10 flex items-center justify-between">
            <span className="text-[11px] text-[var(--codex-faint)]">
              Page {safePage} of {totalPages}
            </span>
            <div className="flex gap-2">
              {safePage > 1 && (
                <Link
                  href={buildUrl({ page: String(safePage - 1) })}
                  className="rounded-md border border-[var(--codex-border)] px-3 py-1.5 text-sm text-[var(--codex-sub)] no-underline hover:bg-[var(--codex-hover)]"
                >
                  Previous
                </Link>
              )}
              {safePage < totalPages && (
                <Link
                  href={buildUrl({ page: String(safePage + 1) })}
                  className="rounded-md border border-[var(--codex-border)] px-3 py-1.5 text-sm text-[var(--codex-sub)] no-underline hover:bg-[var(--codex-hover)]"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  )
}
