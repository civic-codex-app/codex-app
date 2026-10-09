import Link from 'next/link'
import { Card } from '@/components/app/surface'
import { Disclosure } from '@/components/app/disclosure'
import type { SiteSettings } from '@/lib/utils/site-settings'

/**
 * "63 days until federal funding runs out."
 *
 * The schema records when a bill last moved, not what it set in motion, so a
 * statutory deadline is stated by an admin in Site Settings (deadline_*). The
 * row renders only while all of label and date are set and the date has not
 * passed; the day count is computed here, in UTC, against the deploy's date.
 */
export function DeadlineRow({ settings }: { settings: SiteSettings }) {
  const { deadline_label: label, deadline_date: date, deadline_note: note, deadline_href: href } = settings
  if (!label || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null

  const [y, m, d] = date.split('-').map(Number)
  const today = new Date()
  const utcToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  const days = Math.round((Date.UTC(y, m - 1, d) - utcToday) / 86400000)
  if (days < 0) return null

  const when = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <Card flush className="mb-5 px-4">
      <Disclosure
        last
        leading={
          <span className="text-[28px] font-bold leading-none tracking-[-0.02em] tabular-nums text-[var(--poli-text)]">
            {days}
          </span>
        }
        title={`${days === 1 ? 'day' : 'days'} until ${label}`}
      >
        <p className="text-[14.5px] leading-[1.45] text-[var(--poli-sub)]">
          {note || `The deadline is ${when}.`}
        </p>
        {href && (
          <Link href={href} className="mt-1 inline-flex min-h-[40px] items-center text-[14px] font-semibold text-[var(--poli-text)] no-underline">
            Read the bill →
          </Link>
        )}
      </Disclosure>
    </Card>
  )
}
