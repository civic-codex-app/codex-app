import Link from 'next/link'
import { Card, Chip, SectionLabel } from '@/components/app/surface'

/**
 * "Latest in Congress".
 *
 * NOT "Bills moving now", which is what the design calls it and what this
 * shipped as for one commit. Measured against the data: exactly ONE of the 175
 * bills has any recorded action in the last 30 days, three of the four cards
 * shown here last moved 67 days ago, and 105 of 175 are already signed into
 * law. A strip headed "moving now" over a bill that last moved in July is a
 * small lie told confidently, which is the kind this project keeps finding.
 *
 * So the heading says what is true, and every card carries the date of its
 * last action. The reader can then judge the staleness themselves rather than
 * being told it is fresh. If bill actions are ever re-pulled on a cron, the
 * honest heading may become "moving now" again — but the heading follows the
 * data, not the other way round.
 *
 * The design's bill cards lead with a plain-English sentence rather than the
 * official title — "Caps insulin at $35 for people on Medicare" instead of
 * "Insulin Affordability Act of 2025". That is the right instinct and it does
 * not require inventing anything: 161 of the 175 bills carry a Congressional
 * Research Service summary, and the CRS opening sentence is already plain
 * English:
 *
 *   H.R.139  "This bill makes daylight saving time the new, permanent
 *             standard time."
 *
 * So the sentence shown here is lifted from the summary, not written by us.
 * `plainSentence` below does the lifting and nothing more. Rewriting 175 bill
 * descriptions with a model would be generated text about live legislation on
 * a voter-facing site, which is the one thing this project does not do.
 *
 * Where no summary exists, the official title is shown instead — visibly
 * drier, which is honest, rather than a fabricated paraphrase.
 */

const STATUS: Record<string, { label: string; tone: 'good' | 'warn' | 'neutral' }> = {
  signed_into_law: { label: 'Signed into law', tone: 'good' },
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
function actionDate(iso: string | null): string | null {
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
    <section className="mb-6">
      <SectionLabel
        right={
          <Link
            href="/bills"
            className="text-[12px] font-semibold text-[var(--poli-input-focus)] no-underline"
          >
            All bills
          </Link>
        }
      >
        Latest in Congress
      </SectionLabel>

      <div className="space-y-3">
        {bills.map((b) => {
          const s = STATUS[b.status] ?? { label: b.status.replace(/_/g, ' '), tone: 'neutral' as const }
          return (
            <Link key={b.id} href="/bills" className="block no-underline">
              <Card>
                <div className="mb-2 flex items-center gap-2">
                  <Chip tone={s.tone}>{s.label}</Chip>
                  <span className="text-[12px] font-medium text-[var(--poli-faint)]">
                    {b.number}
                  </span>
                </div>
                <p className="text-[15px] font-semibold leading-[1.4] text-[var(--poli-text)]">
                  {plainSentence(b)}
                </p>
                {actionDate(b.last_action_date) && (
                  <p className="mt-2 text-[12px] text-[var(--poli-faint)]">
                    Last action {actionDate(b.last_action_date)}
                  </p>
                )}
              </Card>
            </Link>
          )
        })}
      </div>

      <p className="mt-2 px-1 text-[12px] leading-relaxed text-[var(--poli-faint)]">
        Summaries are written by the Congressional Research Service.
      </p>
    </section>
  )
}
