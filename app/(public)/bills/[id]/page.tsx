import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PartyIcon } from '@/components/icons/party-icons'
import { partyColor, partyLabel } from '@/lib/constants/parties'
import { FollowBillButton } from '@/components/bills/follow-bill-button'
import { BILL_STATUS_EXPLAINERS, BILL_PROCESS_EXPLAINER, VOTE_EXPLAINERS } from '@/lib/data/educational-content'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  signed_into_law: { label: 'Signed into Law', color: '#22C55E', bg: '#22C55E18' },
  passed_house: { label: 'Passed House', color: '#3B82F6', bg: '#3B82F618' },
  passed_senate: { label: 'Passed Senate', color: '#3B82F6', bg: '#3B82F618' },
  in_committee: { label: 'In Committee', color: '#EAB308', bg: '#EAB30818' },
  failed: { label: 'Failed', color: '#EF4444', bg: '#EF444418' },
  vetoed: { label: 'Vetoed', color: '#F97316', bg: '#F9731618' },
}

const VOTE_CONFIG: Record<string, { label: string; color: string }> = {
  yea: { label: 'Yea', color: '#22C55E' },
  nay: { label: 'Nay', color: '#EF4444' },
  abstain: { label: 'Abstain', color: '#EAB308' },
  not_voting: { label: 'Not Voting', color: '#6B7280' },
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
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
  const statusLabel = STATUS_CONFIG[data.status]?.label ?? data.status
  const ogUrl = `/api/og?title=${encodeURIComponent(data.number)}&subtitle=${encodeURIComponent(data.title)}&type=bill`

  return {
    title: `${data.number}: ${data.title} | Poli`,
    description,
    openGraph: {
      title: `${data.number}: ${data.title}`,
      description,
      type: 'article',
      url: `https://getpoli.com/bills/${id}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.number}: ${data.title} (${statusLabel})`,
      images: [ogUrl],
    },
  }
}

export default async function BillDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceRoleClient()

  // Run both queries in parallel
  const [billResult, votesResult] = await Promise.all([
    supabase.from('bills').select('*').eq('id', id).single(),
    supabase
      .from('voting_records')
      .select('*, politician:politician_id(id, name, slug, party, state, chamber, image_url)')
      .eq('bill_id', id)
      .order('vote')
      .order('created_at'),
  ])

  const bill = billResult.data
  if (!bill) notFound()

  const voteList = votesResult.data ?? []
  const sc = STATUS_CONFIG[bill.status] ?? { label: bill.status, color: '#6B7280', bg: '#6B728018' }

  // Vote tallies
  const yea = voteList.filter((v: any) => v.vote === 'yea').length
  const nay = voteList.filter((v: any) => v.vote === 'nay').length
  const abstain = voteList.filter((v: any) => v.vote === 'abstain').length
  const notVoting = voteList.filter((v: any) => v.vote === 'not_voting').length
  const total = voteList.length
  const yeaPct = total > 0 ? Math.round((yea / total) * 100) : 0
  const nayPct = total > 0 ? Math.round((nay / total) * 100) : 0

  // Party breakdown
  const partyOrder = ['democrat', 'republican', 'independent', 'green']
  const partyVotes: Record<string, { yea: number; nay: number; other: number }> = {}
  for (const v of voteList as any[]) {
    const party = v.politician?.party ?? 'unknown'
    if (!partyVotes[party]) partyVotes[party] = { yea: 0, nay: 0, other: 0 }
    if (v.vote === 'yea') partyVotes[party].yea++
    else if (v.vote === 'nay') partyVotes[party].nay++
    else partyVotes[party].other++
  }

  // Sort parties in canonical order
  const sortedParties = Object.keys(partyVotes).sort((a, b) => {
    const ai = partyOrder.indexOf(a)
    const bi = partyOrder.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  // Group votes by type for display
  const voteGroups = ['yea', 'nay', 'abstain', 'not_voting']

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Legislation',
    name: bill.title,
    legislationIdentifier: bill.number,
    description: bill.summary,
    legislationDate: bill.introduced_date,
    url: `https://getpoli.com/bills/${bill.id}`,
    legislationPassedBy: bill.congress_session
      ? { '@type': 'Organization', name: `${bill.congress_session} United States Congress` }
      : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <div className="mx-auto max-w-[900px] px-6 md:px-10">
        <Link
          href="/bills"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--codex-sub)] transition-colors hover:text-[var(--codex-text)]"
        >
          &larr; Back to bills
        </Link>

        {/* Badges */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-sm bg-[var(--codex-badge-bg)] px-2.5 py-0.5 text-[11px] uppercase tracking-[0.06em] text-[var(--codex-badge-text)]">
            {bill.number}
          </span>
          <span
            className="rounded-sm px-2.5 py-0.5 text-[11px] uppercase tracking-[0.06em]"
            style={{ color: sc.color, background: sc.bg }}
            title={BILL_STATUS_EXPLAINERS[bill.status] ?? ''}
          >
            {sc.label}
          </span>
          {bill.congress_session && (
            <span className="text-[11px] text-[var(--codex-faint)]">
              {bill.congress_session} Congress
            </span>
          )}
          <FollowBillButton billId={bill.id} className="ml-auto" />
        </div>

        <h1 className="mb-3 text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
          {bill.title}
        </h1>

        {BILL_STATUS_EXPLAINERS[bill.status] && (
          <p className="mb-3 text-[12px] leading-[1.5] text-[var(--codex-faint)]">
            {BILL_STATUS_EXPLAINERS[bill.status]}
          </p>
        )}

        {bill.summary && (
          <p className="mb-6 text-[15px] leading-[1.7] text-[var(--codex-sub)]">{bill.summary}</p>
        )}

        {/* Dates */}
        <div className="mb-8 flex flex-wrap gap-6 text-[13px] text-[var(--codex-faint)]">
          {bill.introduced_date && (
            <span>Introduced: {formatDate(bill.introduced_date)}</span>
          )}
          {bill.last_action_date && (
            <span>Last Action: {formatDate(bill.last_action_date)}</span>
          )}
        </div>

        {/* Vote summary */}
        {total > 0 && (
          <div className="mb-8 rounded-md border border-[var(--codex-border)] p-5">
            <h2 className="mb-4 text-sm font-semibold text-[var(--codex-sub)]">
              Vote Tally
            </h2>

            {/* Big vote bar */}
            <div className="mb-3 flex h-4 overflow-hidden rounded-full">
              {yea > 0 && (
                <div
                  className="transition-all"
                  style={{ width: `${(yea / total) * 100}%`, background: '#22C55ECC' }}
                />
              )}
              {nay > 0 && (
                <div
                  className="transition-all"
                  style={{ width: `${(nay / total) * 100}%`, background: '#EF4444CC' }}
                />
              )}
              {(abstain + notVoting) > 0 && (
                <div
                  className="transition-all"
                  style={{ width: `${((abstain + notVoting) / total) * 100}%`, background: 'var(--codex-border)' }}
                />
              )}
            </div>

            {/* Yea vs Nay percentage labels */}
            <div className="mb-4 flex items-center justify-between text-[12px]">
              <span className="text-green-400">{yeaPct}% Yea</span>
              <span className="text-red-400">{nayPct}% Nay</span>
            </div>

            <div className="mb-5 grid grid-cols-4 gap-4">
              <div title={VOTE_EXPLAINERS.yea}>
                <div className="text-2xl font-bold text-green-400">{yea}</div>
                <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--codex-faint)]">Yea</div>
              </div>
              <div title={VOTE_EXPLAINERS.nay}>
                <div className="text-2xl font-bold text-red-400">{nay}</div>
                <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--codex-faint)]">Nay</div>
              </div>
              <div title={VOTE_EXPLAINERS.abstain}>
                <div className="text-2xl font-bold text-yellow-400">{abstain}</div>
                <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--codex-faint)]">Abstain</div>
              </div>
              <div title={VOTE_EXPLAINERS.not_voting}>
                <div className="text-2xl font-bold text-[var(--codex-faint)]">{notVoting}</div>
                <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--codex-faint)]">Not Voting</div>
              </div>
            </div>

            {/* Party breakdown bars */}
            <h3 className="mb-3 text-sm font-semibold text-[var(--codex-sub)]">
              By Party
            </h3>
            <div className="space-y-2.5">
              {sortedParties.map((party) => {
                const counts = partyVotes[party]
                const partyTotal = counts.yea + counts.nay + counts.other
                const partyYeaPct = Math.round((counts.yea / partyTotal) * 100)
                return (
                  <div key={party} className="flex items-center gap-3">
                    <div className="flex w-28 items-center gap-1.5">
                      <PartyIcon party={party} size={12} />
                    </div>
                    <div className="flex h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--codex-border)]">
                      {counts.yea > 0 && (
                        <div style={{ width: `${(counts.yea / partyTotal) * 100}%`, background: '#22C55E99' }} />
                      )}
                      {counts.nay > 0 && (
                        <div style={{ width: `${(counts.nay / partyTotal) * 100}%`, background: '#EF444499' }} />
                      )}
                    </div>
                    <span className="w-20 text-right text-[11px] tabular-nums text-[var(--codex-faint)]">
                      {counts.yea}Y / {counts.nay}N
                      <span className="ml-1 text-[var(--codex-faint)] opacity-50">({partyYeaPct}%)</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Individual votes grouped by vote type */}
        {total > 0 && (
          <section className="mb-10">
            <h2 className="mb-5 text-sm font-semibold text-[var(--codex-sub)]">
              Individual Votes
            </h2>
            {voteGroups.map((voteType) => {
              const groupVotes = voteList.filter((v: any) => v.vote === voteType)
              if (groupVotes.length === 0) return null
              const vc = VOTE_CONFIG[voteType] ?? { label: voteType, color: '#6B7280' }

              return (
                <div key={voteType} className="mb-6">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: vc.color }}
                    />
                    {vc.label}
                    <span className="text-[var(--codex-faint)]">{groupVotes.length}</span>
                  </h3>
                  <div className="grid gap-1.5 sm:grid-cols-2 md:grid-cols-3">
                    {groupVotes.map((v: any) => {
                      const pol = v.politician
                      if (!pol) return null
                      return (
                        <Link
                          key={v.id}
                          href={`/politicians/${pol.slug}`}
                          className="flex items-center gap-2.5 rounded-md border border-[var(--codex-border)] px-3 py-2 no-underline transition-all hover:border-[var(--codex-input-border)]"
                        >
                          <div
                            className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--codex-card)]"
                            style={{ border: `1.5px solid ${partyColor(pol.party)}44` }}
                          >
                            <AvatarImage
                              src={pol.image_url}
                              alt={pol.name}
                              size={28}
                              party={pol.party}
                              fallbackColor={partyColor(pol.party)}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13px] font-medium">{pol.name}</div>
                            <div className="flex items-center gap-1 text-[11px] text-[var(--codex-faint)]">
                              <PartyIcon party={pol.party} size={8} />
                              <span>{pol.state}</span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </section>
        )}

        {total === 0 && (
          <div className="mb-10 py-12 text-center text-[var(--codex-faint)]">
            <div className="mb-2 text-lg font-semibold">No recorded votes yet</div>
            <div className="text-sm">Voting records will appear as the bill progresses</div>
          </div>
        )}

        <Footer />
      </div>
    </>
  )
}
