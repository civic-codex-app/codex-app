'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocation } from '@/lib/hooks/use-location'
import { Card, Chip, SectionLabel } from '@/components/app/surface'
import { FaceStack } from '@/components/app/face'
import { BottomSheet } from '@/components/app/sheet'
import { ZipForm } from '@/components/app/zip-form'

type Face = { src: string | null; alt: string; party: string | null }

export interface FeedItem {
  kind: 'story' | 'event'
  date: string
  title: string
  meta: string
  faces: Face[]
  source?: string | null
  summary?: string | null
  url?: string | null
  href?: string
}

export interface NationalStory {
  title: string
  summary: string | null
  source: string | null
  url: string | null
  time: string
  issue: string | null
}

/**
 * The feed, the other way up: your race first, your people second, the
 * national headlines last. The personal part arrives from /api/feed/mine
 * once a ZIP is known; the national list is prerendered with the page.
 */
export function FeedView({ national, today, nationalCount }: { national: NationalStory[]; today: string; nationalCount: number }) {
  const loc = useLocation()
  const [mine, setMine] = useState<{ hero: FeedItem | null; items: FeedItem[] } | null>(null)
  const [sheet, setSheet] = useState<{ title: string; summary: string | null; source: string | null; url: string | null; meta: string; faces: Face[] } | null>(null)

  useEffect(() => {
    if (!loc.zip) {
      setMine(null)
      return
    }
    let cancelled = false
    fetch(`/api/feed/mine?zip=${encodeURIComponent(loc.zip)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled) setMine(json ? { hero: json.hero ?? null, items: json.items ?? [] } : { hero: null, items: [] })
      })
      .catch(() => {
        if (!cancelled) setMine({ hero: null, items: [] })
      })
    return () => {
      cancelled = true
    }
  }, [loc.zip])

  const hero = mine?.hero ?? null

  return (
    <>
      <header className="mb-3 flex items-center justify-between px-1">
        <h1 className="font-serif text-[40px] font-normal leading-[1.08] text-[var(--poli-text)]">Feed</h1>
        <span className="text-[13px] font-semibold text-[var(--poli-sub)]">{today}</span>
      </header>

      {loc.ready && !loc.zip && (
        <Card className="mb-4">
          <p className="mb-3 text-[14.5px] leading-[1.5] text-[var(--poli-sub)]">
            Enter your ZIP to put your own officials and races at the top.
          </p>
          <ZipForm onSubmit={loc.setZip} error={loc.error} />
        </Card>
      )}

      {hero && (
        <>
          <SectionLabel right={<span className="text-[12px] text-[var(--poli-sub)]">{hero.meta}</span>}>Your race</SectionLabel>
          <Card className="mb-4">
            <div className="flex items-center justify-between">
              <Chip tone="marker">On your ballot</Chip>
            </div>
            {hero.faces.length >= 2 ? (
              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                {[hero.faces[0], null, hero.faces[1]].map((f, i) =>
                  f ? (
                    <div key={i} className="flex flex-col items-center text-center">
                      <FaceStack people={[f]} size={64} max={1} />
                      <span className="mt-2 text-[13px] font-semibold text-[var(--poli-text)]">{f.alt.split(' ').pop()}</span>
                    </div>
                  ) : (
                    <span key={i} className="pb-6 text-[12px] font-semibold text-[var(--poli-faint)]">vs</span>
                  )
                )}
              </div>
            ) : (
              <div className="mt-3"><FaceStack people={hero.faces} size={56} max={3} /></div>
            )}
            <button
              type="button"
              onClick={() => setSheet({ title: hero.title, summary: hero.summary ?? null, source: hero.source ?? null, url: hero.url ?? null, meta: hero.meta, faces: hero.faces })}
              className="mt-3.5 w-full text-left"
            >
              <span className="block text-[17px] font-semibold leading-[1.3] text-[var(--poli-text)]">{hero.title}</span>
              {hero.summary && <span className="mt-1.5 block text-[13.5px] leading-[1.45] text-[var(--poli-sub)]">{hero.summary}</span>}
            </button>
            <div className="mt-3.5 flex gap-2 border-t border-[var(--poli-border)] pt-3">
              {hero.url && (
                <a href={hero.url} target="_blank" rel="noopener noreferrer" className="flex h-10 flex-1 items-center justify-center rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] text-[13.5px] font-semibold text-[var(--poli-text)] no-underline">
                  Read at {hero.source ?? 'the source'}
                </a>
              )}
              <Link href="/ballot" className="flex h-10 flex-1 items-center justify-center rounded-xl bg-[var(--poli-text)] text-[13.5px] font-semibold text-[var(--poli-card)] no-underline">
                Open my ballot
              </Link>
            </div>
          </Card>
        </>
      )}

      {loc.zip && mine && mine.items.length > 0 && (
        <>
          <SectionLabel right={<span className="text-[12px] text-[var(--poli-sub)]">Newest first</span>}>Your people</SectionLabel>
          <Card flush className="mb-4 px-3.5">
            {mine.items.map((it, i) => {
              const cls = `flex min-h-[66px] w-full items-center gap-3 text-left no-underline ${i < mine.items.length - 1 ? 'border-b border-[var(--poli-border)]' : ''}`
              const body = (
                <>
                  <FaceStack people={it.faces} size={40} max={3} />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[15px] font-semibold leading-[1.3] text-[var(--poli-text)]">{it.title}</span>
                    <span className="mt-0.5 block text-[12.5px] text-[var(--poli-sub)]">{it.meta}</span>
                  </span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-[var(--poli-faint)]"><path d="M9 6l6 6-6 6" /></svg>
                </>
              )
              return it.kind === 'story' ? (
                <button key={i} type="button" className={cls} onClick={() => setSheet({ title: it.title, summary: it.summary ?? null, source: it.source ?? null, url: it.url ?? null, meta: it.meta, faces: it.faces })}>
                  {body}
                </button>
              ) : (
                <Link key={i} href={it.href ?? '/'} className={cls}>
                  {body}
                </Link>
              )
            })}
          </Card>
        </>
      )}

      {loc.zip && mine && !hero && mine.items.length === 0 && (
        <Card className="mb-4">
          <p className="text-[14.5px] text-[var(--poli-sub)]">Nothing about your officials in the last few weeks of stored news. The national headlines are below.</p>
        </Card>
      )}

      {national.length > 0 && (
        <>
          <SectionLabel right={<span className="text-[12px] text-[var(--poli-sub)]">{nationalCount} stories</span>}>National · today</SectionLabel>
          <Card flush className="mb-4 px-3.5">
            {national.map((n, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSheet({ title: n.title, summary: n.summary, source: n.source, url: n.url, meta: [n.source, n.time].filter(Boolean).join(' · '), faces: [] })}
                className={`flex w-full items-start gap-3 py-3 text-left ${i < national.length - 1 ? 'border-b border-[var(--poli-border)]' : ''}`}
              >
                <span className="w-11 shrink-0 pt-0.5 text-[12px] font-semibold tabular-nums text-[var(--poli-sub)]">{n.time}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold leading-[1.3] text-[var(--poli-text)]">{n.title}</span>
                  <span className="mt-1 flex items-center gap-2 text-[12px] text-[var(--poli-sub)]">
                    {n.source}
                    {n.issue && <Chip>{n.issue}</Chip>}
                  </span>
                </span>
              </button>
            ))}
          </Card>
        </>
      )}

      <BottomSheet open={!!sheet} onClose={() => setSheet(null)} label={sheet?.title ?? 'Story'}>
        {sheet && (
          <>
            {sheet.faces.length > 0 && <div className="mb-3"><FaceStack people={sheet.faces} size={44} max={3} /></div>}
            <div className="text-[12.5px] font-medium text-[var(--poli-sub)]">{sheet.meta}</div>
            <h2 className="mt-2 font-serif text-[28px] font-normal leading-[1.08] text-[var(--poli-text)]">{sheet.title}</h2>
            {sheet.summary && <p className="mt-3 text-[15px] leading-[1.5] text-[var(--poli-sub)]">{sheet.summary}</p>}
            {sheet.url && (
              <a href={sheet.url} target="_blank" rel="noopener noreferrer" className="mt-4 flex h-12 items-center justify-center gap-1.5 rounded-xl bg-[var(--poli-text)] text-[15px] font-semibold text-[var(--poli-card)] no-underline">
                Read at {sheet.source ?? 'the source'}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>
              </a>
            )}
          </>
        )}
      </BottomSheet>
    </>
  )
}
