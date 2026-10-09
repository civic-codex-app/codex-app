import Link from 'next/link'
import { Card, Chip, SectionLabel } from '@/components/app/surface'

/**
 * "Latest in Congress".
 *
 * NOT "Bills moving now", which is what the design calls it and what this
 * shipped as for one commit. Measured against the data: exactly ONE of the 175
 * bills has any recorded action in the last 30 days, three of the four shown
 * here last moved 67 days ago, and 105 of 175 are already signed into law. A
 * strip headed "moving now" over a bill that last moved in July is a small lie
 * told confidently, which is the kind this project keeps finding.
 *
 * So the heading says what is true, and every row carries the date of its
 * last action. The reader can then judge the staleness themselves.
 *
 * The rows lead with a plain-English sentence rather than the official title
 * — "Makes daylight saving time the new, permanent standard time" instead of
 * "Sunshine Protection Act of 2025". That does not require inventing
 * anything: 161 of the 175 bills carry a Congressional Research Service
 * summary whose opening sentence is already plain English. `plainSentence`
 * lifts it and nothing more. Rewriting bill descriptions with a model would
 * be generated text about live legislation on a voter-facing site, which is
 * the one thing this project does not do. Where no summary exists, the
 * official title is shown instead — visibly drier, which is honest.
 */

const STATUS: Record<string, { label: string; tone: 'good' | 'warn' | 'neutral' }> = {
  signed_into_law: { label: 'Law', tone: 'good' },
  passed_house: { label: 'Passed House', tone: 'neutral' },
  passed_senate: { label: 'Passed Senate', tone: 'neutral' },
  failed: { label: 'Failed', tone: 'warn' },
}

export type BillCard = {
  id: string
  number: string
  title: string
  summary: string | null
  status: string
  last_action_date: string | null
}

/** "Jul 14" — the date is the point, the year only when it is not this one. */
export function actionDate(iso: string | null): string | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  const dt = new Date(Date.UTC(y, m - 1, d))
  const sameYear = y === new Date().getUTCFullYear()
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * The first sentence of the CRS summary.
 *
 * CRS summaries usually open by repeating the bill's title, so that prefix is
 * stripped first. Abbreviations ("H.R.", "U.S.", "Sec. 101") would each end a
 * naive split on ".", so the sentence boundary requires the period to be
 * followed by whitespace and a capital letter, and the result is only used if
 * it is long enough to be a real sentence.
 */
export function plainSentence(bill: BillCard): string {
  const raw = (bill.summary ?? '').replace(/&nbsp;/g, ' ').trim()
  if (!raw) return bill.title
  const body = raw.startsWith(bill.title) ? raw.slice(bill.title.length).trim() : raw
  // [\s\S] rather than . with the s flag: the tsconfig target predates es2018,
  // where that flag was added, and it fails the build rather than the match.
  const m = body.match(/^([\s\S]+?\.)(?=\s+[A-Z(])/)
  const first = (m ? m[1] : body).trim()
  if (first.length < 25) return bill.title
  return first.length > 180 ? first.slice(0, 177).trimEnd() + '…' : first
}

export function BillsMoving({ bills }: { bills: BillCard[] }) {
  if (!bills.length) return null
  return (
    <section className="mb-5">
      <SectionLabel
        right={
          <Link href="/bills" className="text-[12px] font-semibold text-[var(--poli-text)] no-underline">
            All bills
          </Link>
        }
      >
        Latest in Congress
      </SectionLabel>

      <Card flush className="px-4">
        {bills.map((b, i) => {
          const s = STATUS[b.status] ?? { label: b.status.replace(/_/g, ' '), tone: 'neutral' as const }
          const when = actionDate(b.last_action_date)
          return (
            <Link
              key={b.id}
              href={`/bills/${b.id}`}
              className={`flex min-h-[60px] items-center gap-3 py-2.5 no-underline ${i < bills.length - 1 ? 'border-b border-[var(--poli-border)]' : ''}`}
            >
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-[14.5px] font-semibold leading-[1.35] text-[var(--poli-text)]">{plainSentence(b)}</span>
                <span className="mt-0.5 block text-[12px] text-[var(--poli-sub)]">
                  {b.number}
                  {when ? ` · ${when}` : ''}
                </span>
              </span>
              <Chip tone={s.tone}>{s.label}</Chip>
            </Link>
          )
        })}
      </Card>

      <p className="mt-2 px-1 text-[12px] leading-relaxed text-[var(--poli-faint)]">
        Summaries are written by the Congressional Research Service.
      </p>
    </section>
  )
}
