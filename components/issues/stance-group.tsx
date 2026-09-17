'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { PartyIcon } from '@/components/icons/party-icons'
import type { StanceEntry, StancePolitician, StanceBucketKey } from '@/lib/issues/stance-groups'

export type { StanceEntry }

interface StanceGroupProps {
  issueSlug: string
  bucket: StanceBucketKey
  label: string
  color: string
  bgClass: string
  textClass: string
  /** The first entries, each with a preview of its politicians. */
  entries: StanceEntry[]
  /** How many entries the bucket has in all. */
  entryCount: number
  /** How many politicians the bucket has in all. */
  totalCount: number
  pageSize?: number
}

/**
 * One bucket of an issue page: entries collapsed by shared summary. The
 * server sends the first few entries with a preview of each; "Show more" and
 * "+N more" fetch the rest from /api/issues/[slug]/stances. The page used to
 * ship every politician in every entry as props — 2.8MB for about 40 visible.
 */
export function StanceGroup({ issueSlug, bucket, label, color, bgClass, textClass, entries: initial, entryCount, totalCount, pageSize = 6 }: StanceGroupProps) {
  const [entries, setEntries] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (entries.length === 0) return null

  const remaining = entryCount - entries.length

  async function loadMore() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/issues/${issueSlug}/stances?bucket=${bucket}&offset=${entries.length}&limit=${pageSize}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { entries: StanceEntry[] }
      setEntries((prev) => [...prev, ...data.entries])
    } catch {
      setError("Couldn't load more right now.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mb-10">
      <h2 className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
        <span className={`rounded-sm px-2 py-0.5 text-[10px] ${bgClass} ${textClass}`}>
          {label}
        </span>
        <span className="text-[var(--poli-faint)]">{totalCount}</span>
      </h2>
      <div className="space-y-2">
        {entries.map((entry) => {
          const rep = entry.politicians[0]
          const othersCount = entry.count - 1
          const hasSummary = entry.summary && entry.summary.trim().length > 0

          return (
            <div key={entry.key} className="rounded-md border border-[var(--poli-border)] p-4">
              {/* Representative politician */}
              <Link
                href={`/politicians/${rep.slug}`}
                className="group flex items-center gap-3 no-underline"
              >
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--poli-card)]">
                  <AvatarImage
                    src={rep.image_url}
                    alt={rep.name}
                    size={40}
                    party={rep.party}
                    fallbackColor={partyColor(rep.party)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium transition-colors group-hover:text-[var(--poli-text)]">
                      {rep.name}
                    </span>
                    <PartyIcon party={rep.party} size={10} />
                  </div>
                  <div className="text-[11px] text-[var(--poli-faint)]">
                    {rep.title} &middot; {rep.state}
                  </div>
                </div>
              </Link>

              {/* Summary text */}
              {hasSummary && (
                <p className="mt-2 text-[12px] leading-[1.6] text-[var(--poli-sub)]">
                  {entry.summary}
                </p>
              )}

              {/* "and X others" */}
              {othersCount > 0 && (
                <OthersRow
                  issueSlug={issueSlug}
                  bucket={bucket}
                  entryKey={entry.key}
                  preview={entry.politicians.slice(1)}
                  count={othersCount}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Show more */}
      {remaining > 0 && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-3 w-full rounded-lg border border-[var(--poli-border)] py-2.5 text-[13px] font-medium text-[var(--poli-sub)] transition-all hover:border-[var(--poli-text)] hover:text-[var(--poli-text)] disabled:opacity-60"
        >
          {loading ? 'Loading…' : `Show ${Math.min(remaining, pageSize)} more of ${entryCount}`}
        </button>
      )}
      {error && <p className="mt-2 text-center text-[12px] text-[var(--poli-faint)]">{error}</p>}
    </section>
  )
}

/** Collapsed row showing "and X others share this stance" with mini avatars */
function OthersRow({ issueSlug, bucket, entryKey, preview, count }: {
  issueSlug: string
  bucket: StanceBucketKey
  entryKey: string
  preview: StancePolitician[]
  count: number
}) {
  const [all, setAll] = useState<StancePolitician[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const visible = all ?? preview
  const remainingCount = count - visible.length

  async function expand() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/issues/${issueSlug}/stances?bucket=${bucket}&entry=${encodeURIComponent(entryKey)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { politicians: StancePolitician[] }
      // The first politician is the representative shown above the row.
      setAll(data.politicians.slice(1))
    } catch {
      setError("Couldn't load the full list right now.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-2 border-t border-[var(--poli-border)] pt-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-[var(--poli-faint)]">
          and {count} other{count !== 1 ? 's' : ''}:
        </span>
        {visible.map((pol) => (
          <Link
            key={pol.id}
            href={`/politicians/${pol.slug}`}
            className="inline-flex items-center gap-1 rounded-full border border-[var(--poli-border)] px-2 py-0.5 text-[11px] no-underline transition-colors hover:border-[var(--poli-input-border)]"
            title={`${pol.name} (${partyLabel(pol.party)}, ${pol.state})`}
          >
            <div className="h-4 w-4 flex-shrink-0 overflow-hidden rounded-full bg-[var(--poli-card)]">
              <AvatarImage
                src={pol.image_url}
                alt={pol.name}
                size={16}
                party={pol.party}
                fallbackColor={partyColor(pol.party)}
              />
            </div>
            <span className="text-[var(--poli-sub)]">{pol.name.split(' ').pop()}</span>
          </Link>
        ))}
        {!all && remainingCount > 0 && (
          <button
            onClick={expand}
            disabled={loading}
            className="text-[11px] text-[var(--poli-faint)] underline hover:text-[var(--poli-sub)] disabled:opacity-60"
          >
            {loading ? 'Loading…' : `+${remainingCount} more`}
          </button>
        )}
        {error && <span className="text-[11px] text-[var(--poli-faint)]">{error}</span>}
      </div>
    </div>
  )
}
