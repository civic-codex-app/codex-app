'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/app/surface'
import { BottomSheet, SheetDone } from '@/components/app/sheet'
import { Disclosure } from '@/components/app/disclosure'
import { stanceLane, stanceTone, stanceWord } from '@/lib/utils/stance-words'
import { STANCE_NUMERIC } from '@/lib/utils/stances'

export interface StanceRowData {
  stance: string
  is_verified: boolean | null
  issues?: { name: string; slug: string } | null
}

/**
 * Where they stand, in words: an issue, a dot, "Strongly for". Six rows lead
 * — the ones that are not simply "for" first, because that is where the
 * information is for a party-line record — and the rest open on request.
 *
 * Every row that is not sourced says so once, in the chip, which opens the
 * same explanation everywhere in the app: these are estimated from party
 * until the person's own votes and statements replace them.
 */
export function StancesCard({ stances }: { stances: StanceRowData[] }) {
  const [why, setWhy] = useState(false)
  const rows = stances.filter((s) => s.issues?.name)
  if (!rows.length) return null

  const estimated = rows.some((s) => !s.is_verified)
  const score = (s: StanceRowData) => {
    const lane = stanceLane(s.stance)
    const v = STANCE_NUMERIC[s.stance] ?? 3
    // against, then mixed, then the strongest "for"
    return lane === 'against' ? 0 : lane === 'mixed' ? 1 : 2 + (6 - v)
  }
  const ordered = [...rows].sort((a, b) => score(a) - score(b) || a.issues!.name.localeCompare(b.issues!.name))
  const lead = ordered.slice(0, 6)
  const rest = ordered.slice(6)

  const Row = ({ s, last }: { s: StanceRowData; last: boolean }) => {
    const t = stanceTone(s.stance)
    return (
      <Link
        href={`/issues/${s.issues!.slug}`}
        className={`flex min-h-[46px] items-center gap-2.5 no-underline ${last ? '' : 'border-b border-[var(--poli-border)]'}`}
      >
        <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-[var(--poli-text)]">{s.issues!.name}</span>
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: t.color }} />
        <span className="shrink-0 text-[13px] font-semibold" style={{ color: t.ink }}>
          {stanceWord(s.stance)}
        </span>
      </Link>
    )
  }

  return (
    <Card className="mb-3 pb-1.5">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--poli-sub)]">Stances</h2>
        {estimated && (
          <button
            type="button"
            onClick={() => setWhy(true)}
            className="-my-1.5 inline-flex min-h-[30px] items-center gap-1.5 rounded-sm border border-dashed border-[var(--poli-faint)] px-2 text-[12px] font-semibold text-[var(--poli-sub)]"
          >
            Estimated
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 7.5v.5" /></svg>
          </button>
        )}
      </div>
      <div className="mt-1.5">
        {lead.map((s, i) => (
          <Row key={s.issues!.slug} s={s} last={i === lead.length - 1 && rest.length === 0} />
        ))}
      </div>
      {rest.length > 0 && (
        <Disclosure last title={`All ${rows.length} issues`}>
          {rest.map((s, i) => (
            <Row key={s.issues!.slug} s={s} last={i === rest.length - 1} />
          ))}
        </Disclosure>
      )}

      <BottomSheet open={why} onClose={() => setWhy(false)} label="Why estimated">
        <h2 className="font-serif text-[32px] font-normal leading-[1.08] text-[var(--poli-text)]">Why estimated?</h2>
        <p className="mt-3 text-[15px] leading-[1.5] text-[var(--poli-sub)]">
          Poli built these from the party&rsquo;s positions, not this person&rsquo;s own votes or statements. Real sources replace them as they come in, and each stance with one is marked.
        </p>
        <SheetDone onClick={() => setWhy(false)} />
      </BottomSheet>
    </Card>
  )
}
