'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { PoliticianCard } from './politician-card'
import type { Politician } from '@/lib/types/politician'

interface StanceData {
  supports: number
  opposes: number
  mixed: number
}

interface PoliticianListProps {
  initialPoliticians: Politician[]
  initialStances: Record<string, StanceData>
  initialAlignments: Record<string, number>
  totalCount: number
  filterParams: Record<string, string>
  hasMore: boolean
}

function SkeletonCard() {
  return (
    <div className="grid grid-cols-[48px_1fr_auto] items-center gap-3 border-b border-[var(--poli-border)] px-3 py-[14px] sm:grid-cols-[56px_1fr_auto] sm:gap-4 sm:py-[18px]">
      <div className="h-12 w-12 animate-pulse rounded-full bg-[var(--poli-border)] sm:h-14 sm:w-14" />
      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-[var(--poli-border)]" />
        <div className="h-3 w-48 animate-pulse rounded bg-[var(--poli-border)]" />
        <div className="h-1.5 w-16 animate-pulse rounded-full bg-[var(--poli-border)]" />
      </div>
      <div className="h-4 w-4 animate-pulse rounded bg-[var(--poli-border)]" />
    </div>
  )
}

export function PoliticianList({
  initialPoliticians,
  initialStances,
  initialAlignments,
  totalCount,
  filterParams,
  hasMore: initialHasMore,
}: PoliticianListProps) {
  const [politicians, setPoliticians] = useState(initialPoliticians)
  const [stances, setStances] = useState(initialStances)
  const [alignments, setAlignments] = useState(initialAlignments)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Reset when filters change
  useEffect(() => {
    setPoliticians(initialPoliticians)
    setStances(initialStances)
    setAlignments(initialAlignments)
    setHasMore(initialHasMore)
    setPage(1)
  }, [initialPoliticians, initialStances, initialAlignments, initialHasMore])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)

    const nextPage = page + 1
    const params = new URLSearchParams(filterParams)
    params.set('page', String(nextPage))

    try {
      const res = await fetch(`/api/politicians?${params.toString()}`)
      const data = await res.json()

      setPoliticians(prev => [...prev, ...data.politicians])
      setStances(prev => ({ ...prev, ...data.stances }))
      setAlignments(prev => ({ ...prev, ...data.alignments }))
      setHasMore(data.hasMore)
      setPage(nextPage)
    } catch (e) {
      console.error('Failed to load more politicians:', e)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, filterParams])

  // Intersection observer for infinite scroll (mobile only)
  useEffect(() => {
    if (!isMobile) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore, isMobile])

  // Desktop pagination URL builder
  const currentPage = parseInt(filterParams.page ?? '1', 10) || 1
  const totalPages = Math.ceil(totalCount / 50)

  function pageUrl(p: number) {
    const sp = new URLSearchParams(filterParams)
    if (p > 1) sp.set('page', String(p))
    else sp.delete('page')
    const qs = sp.toString()
    return qs ? `/?${qs}` : '/'
  }

  return (
    <div className="animate-fade-up">
      {politicians.map((pol) => {
        const data = stances[pol.id]
        return (
          <PoliticianCard
            key={pol.id}
            politician={pol}
            alignment={alignments[pol.id]}
            stances={data}
          />
        )
      })}

      {politicians.length === 0 && (
        <div className="py-20 text-center text-[var(--poli-faint)]">
          <div className="mb-2 text-2xl font-bold">No results</div>
          <div className="text-sm">Try adjusting your filters or search query</div>
        </div>
      )}

      {/* Mobile: infinite scroll */}
      {isMobile && loading && (
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
        </div>
      )}
      {isMobile && hasMore && !loading && <div ref={sentinelRef} className="h-1" />}
      {isMobile && !hasMore && politicians.length > 0 && (
        <div className="py-8 text-center text-[12px] text-[var(--poli-faint)]">
          Showing all {totalCount.toLocaleString()} officials
        </div>
      )}

      {/* Desktop: pagination */}
      {!isMobile && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-[var(--poli-border)] py-8">
          {currentPage > 1 && (
            <Link
              href={pageUrl(currentPage - 1)}
              className="rounded-md border border-[var(--poli-border)] px-3 py-1.5 text-[13px] text-[var(--poli-sub)] transition-colors hover:border-[var(--poli-text)] hover:text-[var(--poli-text)]"
            >
              &larr; Prev
            </Link>
          )}
          <span className="px-3 text-[13px] tabular-nums text-[var(--poli-faint)]">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={pageUrl(currentPage + 1)}
              className="rounded-md border border-[var(--poli-border)] px-3 py-1.5 text-[13px] text-[var(--poli-sub)] transition-colors hover:border-[var(--poli-text)] hover:text-[var(--poli-text)]"
            >
              Next &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
