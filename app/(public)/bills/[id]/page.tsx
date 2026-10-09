import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { AppShell, Card, Chip } from '@/components/app/surface'
import { Disclosure } from '@/components/app/disclosure'
import { Face } from '@/components/app/face'
import { FollowBillButton } from '@/components/bills/follow-bill-button'
import { YourPeopleVoted } from '@/components/bills/your-people-voted'
import { plainSentence } from '@/components/home/bills-moving'
import { BILL_STATUS_EXPLAINERS } from '@/lib/data/educational-content'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS: Record<string, { label: string; tone: 'ink' | 'good' | 'warn' | 'neutral' }> = {
  signed_into_law: { label: 'Law', tone: 'ink' },
  passed_house: { label: 'Passed House', tone: 'good' },
  passed_senate: { label: 'Passed Senate', tone: 'good' },
  in_committee: { label: 'In committee', tone: 'neutral' },
  failed: { label: 'Failed', tone: 'warn' },
  vetoed: { label: 'Vetoed', tone: 'warn' },
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * The bill's page on Congress.gov, built from its number and session, or
 * null when the number is not in a form we can map. "H.R.6500" + "119th" →
 * …/bill/119th-congress/house-bill/6500.
 */
function congressUrl(number: string, session: string | null): string | null {
  const m = number.replace(/\s+/g, '').match(/^([A-Za-z.]+?)\.?(\d+)$/)
  const s = session?.match(/^(\d+)(st|nd|rd|th)?/)
  if (!m || !s) return null
  const TYPES: Record<string, string> = {
    'H.R': 'house-bill', 'S': 'senate-bill',
    'H.J.RES': 'house-joint-resolution', 'S.J.RES': 'senate-joint-resolution',
    'H.CON.RES': 'house-concurrent-resolution', 'S.CON.RES': 'senate-concurrent-resolution',
    'H.RES': 'house-resolution', 'S.RES': 'senate-resolution',
  }
  const type = TYPES[m[1].toUpperCase().replace(/\.$/, '')]
  if (!type) return null
  const n = parseInt(s[1], 10)
  const suffix = n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'
  return `https://www.congress.gov/bill/${n}${suffix}-congress/${type}/${m[2]}`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('bills')
    .select('title, number, summary, status, congress_session')
    .eq('id', id)
    .single()

  if (!data) return { title: 'Not Found | Poli' }

  const description = data.summary?.slice(0, 160) || `Track votes and details for ${data.number}`
  const statusLabel = STATUS[data.status]?.label ?? data.status
  const ogUrl = `/api/og?title=${encodeURIComponent(data.number)}&subtitle=${encodeURIComponent(data.title)}&type=bill`

  return {
    title: `${data.number}: ${data.title} | Poli`,
    description,
    alternates: { canonical: `https://getpoli.app/bills/${id}` },
    openGraph: {
      title: `${data.number}: ${data.title}`,
      description,
      type: 'article',
      url: `https://getpoli.app/bills/${id}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.number}: ${data.title} (${statusLabel})`,
      images: [ogUrl],
    },
  }
}

/**
 * A bill in English: the Congressional Research Service's first sentence as
 * the headline, the official title beneath it, and three rows that open —
 * what it does (the full summary), how it got here (the dates we hold), and
 * how your people voted (your own members, resolved on the client).
 *
 * The summary is the CRS text verbatim. The only thing written here is the
 * chrome; nothing paraphrases live legislation.
 */
export default async function BillDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceRoleClient()

  const [billResult, votesResult, followCountResult] = await Promise.all([
    supabase.from('bills').select('*').eq('id', id).single(),
    supabase
      .from('voting_records')
      .select('*, politician:politician_id(id, name, slug, party, state, chamber, image_url)')
      .eq('bill_id', id)
      .order('vote')
      .order('created_at'),
    supabase.from('bill_follows').select('*', { count: 'exact', head: true }).eq('bill_id', id),
  ])

  const bill = billResult.data
  if (!bill) notFound()

  const voteList = (votesResult.data ?? []) as any[]
  const sc = STATUS[bill.status] ?? { label: String(bill.status).replace(/_/g, ' '), tone: 'neutral' as const }
  const lead = plainSentence({
    id: bill.id,
    number: bill.number,
    title: bill.title,
    summary: bill.summary,
    status: bill.status,
    last_action_date: bill.last_action_date,
  })
  const leadIsSummary = lead !== bill.title
  const summary = (bill.summary ?? '').replace(/&nbsp;/g, ' ').trim()
  const fullText = congressUrl(bill.number, bill.congress_session)

  // Vote tallies
  const yea = voteList.filter((v) => v.vote === 'yea').length
  const nay = voteList.filter((v) => v.vote === 'nay').length
  const total = voteList.length
  const votesByPolitician: Record<string, string> = {}
  for (const v of voteList) if (v.politician?.id) votesByPolitician[v.politician.id] = v.vote

  const steps = [
    bill.introduced_date && { date: bill.introduced_date, text: 'Introduced' },
    bill.last_action_date && bill.last_action_date !== bill.introduced_date && { date: bill.last_action_date, text: sc.label === 'Law' ? 'Signed into law' : `Last action · ${sc.label}` },
  ].filter(Boolean) as Array<{ date: string; text: string }>

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Legislation',
    name: `${bill.number}: ${bill.title}`,
    legislationIdentifier: bill.number,
    description: bill.summary,
    legislationDate: bill.introduced_date,
    url: `https://getpoli.app/bills/${bill.id}`,
    legislationPassedBy: bill.congress_session
      ? { '@type': 'Organization', name: `${bill.congress_session} United States Congress` }
      : undefined,
  }

  return (
    <AppShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-[560px] px-4 pt-3">
        <Link
          href="/bills"
          className="mb-2 inline-flex h-11 items-center gap-1 text-[14px] font-semibold text-[var(--poli-sub)] no-underline"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          Bills
        </Link>

        <header className="mb-4 px-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {sc.tone === 'ink' ? (
              <span className="inline-flex items-center rounded-sm bg-[var(--poli-text)] px-2 py-[3px] text-[11.5px] font-semibold text-[var(--poli-card)]">{sc.label}</span>
            ) : (
              <Chip tone={sc.tone}>{sc.label}</Chip>
            )}
            <Chip>{bill.number}</Chip>
            {bill.congress_session && <Chip>{bill.congress_session} Congress</Chip>}
          </div>
          {/* The CRS sentence is the headline when it is headline-length;
              a long one becomes the lead paragraph under the official title
              rather than eight lines of serif. */}
          {leadIsSummary && lead.length <= 90 ? (
            <>
              <h1 className="mt-3 font-serif text-[40px] font-normal leading-[1.08] text-[var(--poli-text)]">{lead}</h1>
              <p className="mt-2 text-[13.5px] text-[var(--poli-sub)]">{bill.title}</p>
            </>
          ) : (
            <>
              <h1 className="mt-3 font-serif text-[32px] font-normal leading-[1.1] text-[var(--poli-text)]">{bill.title}</h1>
              {leadIsSummary && <p className="mt-2.5 text-[15.5px] leading-[1.45] text-[var(--poli-text)]">{lead}</p>}
            </>
          )}
        </header>

        <Card className="mb-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[var(--poli-badge-bg)] px-3 py-2.5">
              <div className="text-[12px] font-semibold text-[var(--poli-sub)]">Introduced</div>
              <div className="mt-0.5 text-[16px] font-bold tabular-nums text-[var(--poli-text)]">{bill.introduced_date ? formatDate(bill.introduced_date) : '—'}</div>
            </div>
            <div className="rounded-xl bg-[var(--poli-badge-bg)] px-3 py-2.5">
              <div className="text-[12px] font-semibold text-[var(--poli-sub)]">Last action</div>
              <div className="mt-0.5 text-[16px] font-bold tabular-nums text-[var(--poli-text)]">{bill.last_action_date ? formatDate(bill.last_action_date) : '—'}</div>
            </div>
          </div>
          {BILL_STATUS_EXPLAINERS[bill.status] && (
            <p className="mt-3 text-[13px] leading-[1.5] text-[var(--poli-sub)]">{BILL_STATUS_EXPLAINERS[bill.status]}</p>
          )}
          <FollowBillButton billId={bill.id} initialCount={followCountResult.count ?? 0} className="mt-3 flex h-11 w-full items-center justify-center rounded-xl text-[14px] font-semibold" />
        </Card>

        <Card flush className="mb-3 px-4">
          {summary && (
            <Disclosure title="What it does" meta="The Congressional Research Service summary">
              {summary.split(/\n{2,}/).map((p: string, i: number) => (
                <p key={i} className="mb-3 text-[15px] leading-[1.55] text-[var(--poli-text)] last:mb-0">{p}</p>
              ))}
            </Disclosure>
          )}
          {steps.length > 0 && (
            <Disclosure title="How it got here" meta={`${steps.length} action${steps.length === 1 ? '' : 's'} on record`}>
              <ol className="m-0 list-none p-0">
                {steps.map((s, i) => {
                  const last = i === steps.length - 1
                  return (
                    <li key={i} className={`relative pl-6 ${last ? '' : 'pb-4'}`}>
                      {!last && <span className="absolute bottom-0 left-[4px] top-3 w-0.5 bg-[var(--poli-border)]" />}
                      <span className={`absolute left-0 top-1 rounded-full bg-[var(--poli-text)] ${last ? '-left-0.5 h-3.5 w-3.5' : 'h-2.5 w-2.5'}`} />
                      <div className="text-[12px] font-semibold text-[var(--poli-sub)]">{formatDate(s.date)}</div>
                      <div className={`mt-0.5 text-[14.5px] leading-[1.45] text-[var(--poli-text)] ${last ? 'font-semibold' : ''}`}>{s.text}</div>
                    </li>
                  )
                })}
              </ol>
              <p className="mt-3 text-[12px] text-[var(--poli-sub)]">Dates from Congress.gov. Poli holds the introduction and the latest action, not every step between.</p>
            </Disclosure>
          )}
          <Disclosure title="How your people voted" last={total === 0}>
            <YourPeopleVoted votes={votesByPolitician} />
          </Disclosure>
          {total > 0 && (
            <Disclosure title="Every recorded vote" meta={`${yea} yea · ${nay} nay · ${total} total`} last>
              <div className="mb-3 flex h-2.5 overflow-hidden rounded-full bg-[var(--poli-badge-bg)]">
                {yea > 0 && <div style={{ width: `${(yea / total) * 100}%`, background: 'var(--stance-for)' }} />}
                {nay > 0 && <div style={{ width: `${(nay / total) * 100}%`, background: 'var(--stance-against)' }} />}
              </div>
              {voteList.map((v, i) => {
                const pol = v.politician
                if (!pol) return null
                const vc = v.vote === 'yea' ? { label: 'Yea', tone: 'good' as const } : v.vote === 'nay' ? { label: 'Nay', tone: 'warn' as const } : { label: String(v.vote).replace(/_/g, ' '), tone: 'neutral' as const }
                return (
                  <Link key={v.id} href={`/politicians/${pol.slug}`} className={`flex min-h-[48px] items-center gap-3 no-underline ${i < voteList.length - 1 ? 'border-b border-[var(--poli-border)]' : ''}`}>
                    <Face src={pol.image_url} alt={pol.name} size={32} party={pol.party} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-[var(--poli-text)]">{pol.name}</span>
                      <span className="block text-[12px] text-[var(--poli-sub)]">{pol.state}</span>
                    </span>
                    <Chip tone={vc.tone}>{vc.label}</Chip>
                  </Link>
                )
              })}
            </Disclosure>
          )}
        </Card>

        <div className="mb-6 flex items-center justify-between gap-3 px-1">
          <span className="text-[12px] leading-[1.45] text-[var(--poli-sub)]">Source: Congress.gov; summary by the Congressional Research Service</span>
          {fullText && (
            <a href={fullText} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] shrink-0 items-center gap-1 text-[13px] font-semibold text-[var(--poli-text)] no-underline">
              Full text
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>
            </a>
          )}
        </div>
      </div>
    </AppShell>
  )
}
