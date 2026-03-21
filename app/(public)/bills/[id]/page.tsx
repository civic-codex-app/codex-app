import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AvatarImage } from '@/components/ui/avatar-image'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PartyIcon } from '@/components/icons/party-icons'
import { partyColor, partyLabel } from '@/lib/constants/parties'

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = createServiceRoleClient()
  const { data } = await supabase.from('bills').select('title, number').eq('id', id).single()
  if (!data) return { title: 'Not Found — Codex' }
  return { title: `${data.number}: ${data.title} — Codex` }
}

export default async function BillDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceRoleClient()

  const { data: bill } = await supabase.from('bills').select('*').eq('id', id).single()
  if (!bill) notFound()

  // Fetch voting records with politician info
  const { data: votes } = await supabase
    .from('voting_records')
    .select('*, politician:politician_id(id, name, slug, party, state, chamber, image_url)')
    .eq('bill_id', bill.id)
    .order('vote')
    .order('created_at')

  const voteList = votes ?? []

  const sc = STATUS_CONFIG[bill.status] ?? { label: bill.status, color: '#6B7280', bg: '#6B728018' }

  // Vote tallies
  const yea = voteList.filter((v: any) => v.vote === 'yea').length
  const nay = voteList.filter((v: any) => v.vote === 'nay').length
  const abstain = voteList.filter((v: any) => v.vote === 'abstain').length
  const notVoting = voteList.filter((v: any) => v.vote === 'not_voting').length
  const total = voteList.length

  // Party breakdown
  const partyVotes: Record<string, { yea: number; nay: number; other: number }> = {}
  for (const v of voteList as any[]) {
    const party = v.politician?.party ?? 'unknown'
    if (!partyVotes[party]) partyVotes[party] = { yea: 0, nay: 0, other: 0 }
    if (v.vote === 'yea') partyVotes[party].yea++
    else if (v.vote === 'nay') partyVotes[party].nay++
    else partyVotes[party].other++
  }

  // Group votes by type for display
  const voteGroups = ['yea', 'nay', 'abstain', 'not_voting']

  return (
    <>
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
          >
            {sc.label}
          </span>
          {bill.congress_session && (
            <span className="text-[11px] text-[var(--codex-faint)]">
              {bill.congress_session} Congress
            </span>
          )}
        </div>

        <h1 className="mb-3 font-serif text-[clamp(28px,4vw,42px)] font-normal leading-[1.1]">
          {bill.title}
        </h1>

        {bill.summary && (
          <p className="mb-6 text-[15px] leading-[1.7] text-[var(--codex-sub)]">{bill.summary}</p>
        )}

        {/* Dates */}
        <div className="mb-8 flex flex-wrap gap-6 text-[13px] text-[var(--codex-faint)]">
          {bill.introduced_date && (
            <span>
              Introduced:{' '}
              {new Date(bill.introduced_date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </span>
          )}
          {bill.last_action_date && (
            <span>
              Last Action:{' '}
              {new Date(bill.last_action_date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </span>
          )}
        </div>

        {/* Vote summary */}
        {total > 0 && (
          <div className="mb-8 rounded-md border border-[var(--codex-border)] p-5">
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--codex-sub)]">
              Vote Tally
            </h2>

            {/* Big vote bar */}
            <div className="mb-3 flex h-4 overflow-hidden rounded-full">
              {yea > 0 && <div style={{ width: `${(yea / total) * 100}%`, background: '#22C55ECC' }} />}
              {nay > 0 && <div style={{ width: `${(nay / total) * 100}%`, background: '#EF4444CC' }} />}
              {(abstain + notVoting) > 0 && <div style={{ width: `${((abstain + notVoting) / total) * 100}%`, background: 'var(--codex-border)' }} />}
            </div>

            <div className="mb-5 grid grid-cols-4 gap-4">
              <div>
                <div className="font-serif text-2xl text-green-400">{yea}</div>
                <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--codex-faint)]">Yea</div>
              </div>
              <div>
                <div className="font-serif text-2xl text-red-400">{nay}</div>
                <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--codex-faint)]">Nay</div>
              </div>
              <div>
                <div className="font-serif text-2xl text-yellow-400">{abstain}</div>
                <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--codex-faint)]">Abstain</div>
              </div>
              <div>
                <div className="font-serif text-2xl text-[var(--codex-faint)]">{notVoting}</div>
                <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--codex-faint)]">Not Voting</div>
              </div>
            </div>

            {/* Party breakdown bars */}
            <h3 className="mb-2 text-[11px] uppercase tracking-[0.08em] text-[var(--codex-faint)]">
              By Party
            </h3>
            <div className="space-y-2">
              {Object.entries(partyVotes).map(([party, counts]) => {
                const partyTotal = counts.yea + counts.nay + counts.other
                return (
                  <div key={party} className="flex items-center gap-3">
                    <div className="flex w-24 items-center gap-1.5">
                      <PartyIcon party={party} size={10} />
                      <span className="text-[11px]" style={{ color: partyColor(party) }}>
                        {partyLabel(party)}
                      </span>
                    </div>
                    <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[var(--codex-border)]">
                      {counts.yea > 0 && <div style={{ width: `${(counts.yea / partyTotal) * 100}%`, background: '#22C55E99' }} />}
                      {counts.nay > 0 && <div style={{ width: `${(counts.nay / partyTotal) * 100}%`, background: '#EF444499' }} />}
                    </div>
                    <span className="w-16 text-right text-[11px] tabular-nums text-[var(--codex-faint)]">
                      {counts.yea}Y / {counts.nay}N
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Individual votes */}
        {total > 0 && (
          <section className="mb-10">
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
                            className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-[var(--codex-card)]"
                            style={{ border: `1.5px solid ${partyColor(pol.party)}44` }}
                          >
                            <AvatarImage
                              src={pol.image_url}
                              alt={pol.name}
                              size={28}
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
            <div className="mb-2 font-serif text-lg">No recorded votes yet</div>
            <div className="text-sm">Voting records will appear as the bill progresses</div>
          </div>
        )}

        <Footer />
      </div>
    </>
  )
}
