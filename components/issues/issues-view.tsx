'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocation, type Rep } from '@/lib/hooks/use-location'
import { Card, Chip, SectionLabel } from '@/components/app/surface'
import { Disclosure } from '@/components/app/disclosure'
import { Face, FaceStack } from '@/components/app/face'
import { BottomSheet, SheetDone } from '@/components/app/sheet'
import { ZipForm } from '@/components/app/zip-form'
import { LANES, stanceLane, stanceWord, type Lane } from '@/lib/utils/stance-words'

export type IssueCard = {
  id: string
  slug: string
  name: string
  total: number
  supports: number
  opposes: number
  mixed: number
}

type StanceRow = { politician_id: string; issue_slug: string; stance: string }

const LANE_ORDER: Lane[] = ['for', 'mixed', 'against']

/** "Climate & Environment" → "Climate"; "Criminal Justice Reform" stays. */
function short(name: string) {
  return name.split(/ & | and /)[0]
}

function last(name: string) {
  return name.trim().split(/\s+/).pop() ?? name
}

function pct(n: number, total: number) {
  return total ? Math.round((n / total) * 1000) / 10 : 0
}

/**
 * Issues, around what is actually different.
 *
 * Your officials are usually one party, so on most issues the estimated
 * stances put all of them in the same place; a list of 22 rows saying so is
 * a wall. This leads with the one issue that splits them the most ways, says
 * the remaining splits in a sentence each, and folds the agreement into one
 * row. Everything is derived from the stance rows, so when real votes
 * replace the estimates the screen re-sorts itself.
 *
 * Without a ZIP it is the national picture: the 22 issues with how the
 * 8,000-odd officials in Poli split, each opening the same sheet.
 */
export function IssuesView({ issues, officials }: { issues: IssueCard[]; officials: number }) {
  const loc = useLocation()
  const [stances, setStances] = useState<StanceRow[] | null>(null)
  const [sheet, setSheet] = useState<string | 'est' | null>(null)
  const [agreeOpen, setAgreeOpen] = useState(false)

  const reps = useMemo(() => (loc.reps ?? []).filter((r) => ['senate', 'house', 'governor'].includes(r.chamber)), [loc.reps])

  useEffect(() => {
    if (!reps.length) {
      setStances(null)
      return
    }
    let cancelled = false
    fetch('/api/representatives/stances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ politician_ids: reps.map((r) => r.id), issue_slugs: issues.map((i) => i.slug) }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled) setStances(json?.stances ?? [])
      })
      .catch(() => {
        if (!cancelled) setStances([])
      })
    return () => {
      cancelled = true
    }
  }, [reps, issues])

  // For each issue: each rep's stance, the lanes used, and the groups by lane.
  const picture = useMemo(() => {
    if (!stances || !reps.length) return null
    const by = new Map<string, Map<string, string>>()
    for (const s of stances) {
      if (!by.has(s.issue_slug)) by.set(s.issue_slug, new Map())
      by.get(s.issue_slug)!.set(s.politician_id, s.stance)
    }
    return issues.map((issue) => {
      const m = by.get(issue.slug) ?? new Map<string, string>()
      const people = reps
        .filter((r) => m.has(r.id))
        .map((r) => ({ rep: r, stance: m.get(r.id)!, lane: stanceLane(m.get(r.id)!) }))
      const groups = LANE_ORDER.map((lane) => ({ lane, people: people.filter((p) => p.lane === lane) })).filter((g) => g.people.length)
      return { issue, people, groups, lanes: groups.length }
    })
  }, [stances, reps, issues])

  const splits = picture?.filter((p) => p.lanes > 1) ?? []
  const hero = splits.reduce<(typeof splits)[number] | null>((best, p) => {
    if (!best) return p
    if (p.lanes !== best.lanes) return p.lanes > best.lanes ? p : best
    const spread = (x: typeof p) => x.people.length - Math.max(...x.groups.map((g) => g.people.length))
    return spread(p) > spread(best) ? p : best
  }, null)
  const agree = picture?.filter((p) => p.lanes === 1) ?? []

  // The other splits, grouped by who stands apart and how, into one sentence each.
  const sentences = useMemo(() => {
    const out = new Map<string, { names: string; verb: string; word: string; rest: string; faces: Rep[]; issues: IssueCard[] }>()
    for (const p of splits) {
      if (p === hero) continue
      const majority = [...p.groups].sort((a, b) => b.people.length - a.people.length)[0]
      const minorities = p.groups.filter((g) => g !== majority)
      const key = minorities.map((g) => g.lane + ':' + g.people.map((x) => x.rep.id).sort().join(',')).join('|') + '>' + majority.lane
      if (!out.has(key)) {
        const names = minorities.map((g) => g.people.map((x) => last(x.rep.name)).join(' and ') + (minorities.length > 1 ? ` (${LANES[g.lane].label.toLowerCase()})` : '')).join(', ')
        const minorityCount = minorities.reduce((n, g) => n + g.people.length, 0)
        const restCount = majority.people.length
        const WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six']
        out.set(key, {
          names,
          verb: minorityCount === 1 ? 'is' : 'are',
          word: minorities.length === 1 ? minorities[0].people[0].stance && stanceWord(minorities[0].people[0].stance).toLowerCase() : 'split',
          rest: `the other ${WORDS[restCount] ?? restCount} ${restCount === 1 ? 'is' : 'are'} ${LANES[majority.lane].label.toLowerCase()}`,
          faces: minorities.flatMap((g) => g.people.map((x) => x.rep)),
          issues: [],
        })
      }
      out.get(key)!.issues.push(p.issue)
    }
    return [...out.values()]
  }, [splits, hero])

  const selected = sheet && sheet !== 'est' ? picture?.find((p) => p.issue.slug === sheet) ?? null : null
  const selectedIssue = sheet && sheet !== 'est' ? issues.find((i) => i.slug === sheet) ?? null : null

  const personal = loc.zip && picture && reps.length > 0
  const loading = loc.zip && (loc.loading || (reps.length > 0 && stances === null))

  return (
    <>
      <header className="mb-3 flex items-center justify-between px-1">
        <h1 className="font-serif text-[40px] font-normal leading-[1.08] text-[var(--poli-text)]">Issues</h1>
        <button
          type="button"
          onClick={() => setSheet('est')}
          className="inline-flex min-h-[32px] items-center gap-1.5 rounded-sm border border-dashed border-[var(--poli-faint)] px-2 text-[12px] font-semibold text-[var(--poli-sub)]"
        >
          Estimated
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 7.5v.5" /></svg>
        </button>
      </header>

      {loc.ready && !loc.zip && (
        <Card className="mb-4">
          <p className="mb-3 text-[14.5px] leading-[1.5] text-[var(--poli-sub)]">
            Enter your ZIP to see where your own senators, representative and governor stand.
          </p>
          <ZipForm onSubmit={loc.setZip} error={loc.error} />
        </Card>
      )}

      {loading && (
        <Card className="mb-4">
          <div className="mb-3 h-[18px] w-1/2 animate-pulse rounded bg-[var(--poli-border)]" />
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-14 w-14 animate-pulse rounded-full bg-[var(--poli-border)]" />)}
          </div>
        </Card>
      )}

      {personal && hero && (
        <>
          <SectionLabel right={<span className="text-[12px] text-[var(--poli-sub)]">{splits.length} of {issues.length}</span>}>
            Where your {reps.length === 4 ? 'four' : reps.length} split
          </SectionLabel>
          <button type="button" onClick={() => setSheet(hero.issue.slug)} className="mb-2.5 w-full text-left">
            <Card>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[17px] font-semibold text-[var(--poli-text)]">{short(hero.issue.name)}</span>
                <Chip>Split {hero.lanes === 3 ? 'three ways' : 'two ways'}</Chip>
              </div>
              <div className="mt-4 grid grid-cols-3 items-end gap-2">
                {LANE_ORDER.map((lane) => {
                  const g = hero.groups.find((x) => x.lane === lane)
                  return (
                    <div key={lane} className="flex flex-col items-center text-center">
                      <span className="flex">
                        {(g?.people ?? []).map((p, i) => (
                          <Face key={p.rep.id} src={p.rep.image_url} alt={p.rep.name} size={56} party={p.rep.party} className={i === 0 ? '' : '-ml-3.5'} />
                        ))}
                      </span>
                      <span className="mt-2 text-[12px] font-semibold leading-[1.2] text-[var(--poli-text)]">
                        {g ? g.people.map((p) => last(p.rep.name)).join(' · ') : '—'}
                      </span>
                      <span className="mt-1 inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: LANES[lane].ink }}>
                        <span className="h-2 w-2 rounded-full" style={{ background: LANES[lane].color }} />
                        {LANES[lane].label}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3.5 flex items-center justify-between border-t border-[var(--poli-border)] pt-3 text-[12.5px] text-[var(--poli-sub)]">
                <span>
                  Everyone in Poli: <strong className="font-semibold text-[var(--poli-text)]">{pct(hero.issue.supports, hero.issue.total)}% for</strong> · {pct(hero.issue.opposes, hero.issue.total)}% against
                </span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-[var(--poli-faint)]"><path d="M9 6l6 6-6 6" /></svg>
              </div>
            </Card>
          </button>

          {sentences.length > 0 && (
            <Card flush className="mb-2.5 px-4">
              {sentences.map((s, i) => (
                <div key={i} className={`py-3.5 ${i < sentences.length - 1 ? 'border-b border-[var(--poli-border)]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <FaceStack people={s.faces.map((r) => ({ src: r.image_url, alt: r.name, party: r.party }))} size={40} max={3} />
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold leading-[1.25] text-[var(--poli-text)]">
                        {s.names} {s.verb} {s.word}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] text-[var(--poli-sub)]">
                        {s.rest} on {s.issues.length === 1 ? 'this one' : `these ${s.issues.length}`}
                      </span>
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {s.issues.map((issue) => (
                      <button key={issue.slug} type="button" onClick={() => setSheet(issue.slug)} className="h-8 rounded-sm bg-[var(--poli-badge-bg)] px-2.5 text-[13px] font-semibold text-[var(--poli-text)]">
                        {short(issue.name)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </>
      )}

      {personal && !hero && (
        <Card className="mb-2.5">
          <p className="text-[15px] font-semibold text-[var(--poli-text)]">Your {reps.length} agree on every issue</p>
          <p className="mt-1 text-[13.5px] text-[var(--poli-sub)]">At least by the estimated stances. Open any issue below to see the words.</p>
        </Card>
      )}

      {(personal ? agree.length > 0 : loc.ready) && (
        <Card flush className="mb-4 px-4">
          <button
            type="button"
            aria-expanded={agreeOpen || !personal}
            onClick={() => setAgreeOpen((o) => !o)}
            className="flex min-h-[56px] w-full items-center gap-3 text-left"
          >
            {personal && <FaceStack people={reps.map((r) => ({ src: r.image_url, alt: r.name, party: r.party }))} size={28} max={4} />}
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-[var(--poli-text)]">
                {personal ? `All ${reps.length === 4 ? 'four' : reps.length} agree` : `All ${issues.length} issues`}
              </span>
              <span className="mt-0.5 block text-[12.5px] text-[var(--poli-sub)]">
                {personal ? `${agree.length} issues` : `How ${officials.toLocaleString()} officials in Poli split`}
              </span>
            </span>
            {personal && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-[var(--poli-faint)] transition-transform duration-3" style={{ transform: agreeOpen ? 'rotate(180deg)' : 'none' }}><path d="M6 9l6 6 6-6" /></svg>
            )}
          </button>
          {(agreeOpen || !personal) && (
            <div className="animate-fade-up grid grid-cols-2 gap-1.5 pb-4">
              {(personal ? agree.map((p) => p.issue) : issues).map((issue) => (
                <button
                  key={issue.slug}
                  type="button"
                  onClick={() => setSheet(issue.slug)}
                  className="flex h-10 items-center justify-between gap-2 rounded-sm bg-[var(--poli-badge-bg)] px-3 text-left text-[13px] font-semibold text-[var(--poli-text)]"
                >
                  <span className="truncate">{short(issue.name)}</span>
                  {!personal && <span className="shrink-0 text-[11.5px] tabular-nums text-[var(--poli-sub)]">{Math.round(pct(issue.supports, issue.total))}%</span>}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      <BottomSheet open={sheet === 'est'} onClose={() => setSheet(null)} label="Why estimated">
        <h2 className="font-serif text-[32px] font-normal leading-[1.08] text-[var(--poli-text)]">Why estimated?</h2>
        <p className="mt-3 text-[15px] leading-[1.5] text-[var(--poli-sub)]">
          Poli built every stance here from the person&rsquo;s party, not their own votes or words. Votes replace them as they are imported, and each stance with a real source is marked.
        </p>
        <SheetDone onClick={() => setSheet(null)} />
      </BottomSheet>

      <BottomSheet open={!!selectedIssue} onClose={() => setSheet(null)} label={selectedIssue?.name ?? 'Issue'}>
        {selectedIssue && (
          <>
            <h2 className="font-serif text-[30px] font-normal leading-[1.08] text-[var(--poli-text)]">{selectedIssue.name}</h2>
            {selected && selected.people.length > 0 && (
              <div className="mt-2.5">
                {selected.people.map((p, i) => (
                  <div key={p.rep.id} className={`flex min-h-[48px] items-center gap-3 ${i < selected.people.length - 1 ? 'border-b border-[var(--poli-border)]' : ''}`}>
                    <Face src={p.rep.image_url} alt={p.rep.name} size={32} party={p.rep.party} />
                    <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[var(--poli-text)]">{last(p.rep.name)}</span>
                    <span className="h-2 w-2 rounded-full" style={{ background: LANES[p.lane].color }} />
                    <span className="text-[13.5px] font-semibold" style={{ color: LANES[p.lane].ink }}>{stanceWord(p.stance)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3.5 flex items-baseline justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--poli-sub)]">Everyone in Poli</span>
              <span className="text-[12px] text-[var(--poli-sub)]">{selectedIssue.total.toLocaleString()} officials</span>
            </div>
            <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-[var(--poli-badge-bg)]">
              <span style={{ width: `${pct(selectedIssue.supports, selectedIssue.total)}%`, background: 'var(--stance-for)' }} />
              <span style={{ width: `${pct(selectedIssue.mixed, selectedIssue.total)}%`, background: 'var(--stance-mixed)' }} />
              <span style={{ width: `${pct(selectedIssue.opposes, selectedIssue.total)}%`, background: 'var(--stance-against)' }} />
            </div>
            <div className="mt-1.5 flex justify-between text-[12px] font-semibold">
              <span style={{ color: LANES.for.ink }}>{pct(selectedIssue.supports, selectedIssue.total)}% for</span>
              <span style={{ color: LANES.against.ink }}>{pct(selectedIssue.opposes, selectedIssue.total)}% against</span>
            </div>
            <p className="mt-3 text-[12.5px] leading-[1.45] text-[var(--poli-sub)]">
              Stances are estimated from each person&rsquo;s party until their votes are imported.
            </p>
            <Link
              href={`/issues/${selectedIssue.slug}`}
              className="mt-3.5 flex h-12 items-center justify-center rounded-xl bg-[var(--poli-marker)] text-[15px] font-semibold text-[var(--poli-marker-ink)] no-underline"
            >
              Every official on {short(selectedIssue.name)}
            </Link>
          </>
        )}
      </BottomSheet>
    </>
  )
}
