import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import Link from 'next/link'
import type { BillRow, BillStatRow, BillVoteRow } from '@/lib/types/supabase'
import { BILL_PROCESS_EXPLAINER, BILL_STATUS_EXPLAINERS } from '@/lib/data/educational-content'

export const revalidate = 600 // 10 minutes

export const metadata = {
  title: 'Bills & Legislation | Poli',
  description: 'Follow major legislation through Congress. See bill status, how your representatives voted, and what it means for the issues you care about.',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  signed_into_law: { label: 'Signed into Law', color: '#22C55E', bg: '#22C55E18' },
  passed_house: { label: 'Passed House', color: '#3B82F6', bg: '#3B82F618' },
  passed_senate: { label: 'Passed Senate', color: '#3B82F6', bg: '#3B82F618' },
  in_committee: { label: 'In Committee', color: '#EAB308', bg: '#EAB30818' },
  failed: { label: 'Failed', color: '#EF4444', bg: '#EF444418' },
  vetoed: { label: 'Vetoed', color: '#F97316', bg: '#F9731618' },
}

interface PageProps {
  searchParams: Promise<{ status?: string; session?: string }>
}

export default async function BillsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createServiceRoleClient()

  let query = supabase.from('bills').select('*').order('last_action_date', { ascending: false })

  if (params.status) {
    query = query.eq('status', params.status)
  }
  if (params.session) {
    query = query.eq('congress_session', params.session)
  }

  const { data: bills, error: billsError } = await query
  if (billsError) console.error('Failed to fetch bills:', billsError.message)

  if (!bills) {
    return (
      <>
        <Header />
        <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
          <div className="py-20 text-center">
            <div className="mb-3 text-2xl font-bold text-[var(--poli-text)]">Something went wrong</div>
            <p className="text-sm text-[var(--poli-sub)]">
              We couldn&apos;t load bills right now. Please try again later.
            </p>
          </div>
          <Footer />
        </div>
      </>
    )
  }

  const billList = bills as any as BillRow[]

  // Get vote counts per bill
  const billIds = billList.map((b) => b.id)
  const voteCounts = new Map<string, { yea: number; nay: number; total: number }>()

  if (billIds.length > 0) {
    const { data: votes, error: votesError } = await supabase
      .from('voting_records')
      .select('bill_id, vote')
      .in('bill_id', billIds)
    if (votesError) console.error('Failed to fetch vote counts:', votesError.message)

    for (const v of (votes ?? []) as any as BillVoteRow[]) {
      if (!voteCounts.has(v.bill_id)) voteCounts.set(v.bill_id, { yea: 0, nay: 0, total: 0 })
      const entry = voteCounts.get(v.bill_id)!
      entry.total++
      if (v.vote === 'yea') entry.yea++
      else if (v.vote === 'nay') entry.nay++
    }
  }

  // Stats
  const { data: allBills, error: allBillsError } = await supabase.from('bills').select('id, status')
  if (allBillsError) console.error('Failed to fetch bill stats:', allBillsError.message)
  const all = (allBills ?? []) as any as BillStatRow[]
  const signed = all.filter((b) => b.status === 'signed_into_law').length
  const active = all.filter((b) => ['in_committee', 'passed_house', 'passed_senate'].includes(b.status)).length
  const failed = all.filter((b) => ['failed', 'vetoed'].includes(b.status)).length

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        <div className="mb-10 max-w-[600px]">
          <h1 className="mb-4 animate-fade-up text-[clamp(32px,4vw,52px)] font-bold leading-[1.1]">
            Bills & Legislation
          </h1>
          <p className="animate-fade-up text-[15px] leading-[1.7] text-[var(--poli-subtle)]">
            Track major bills through Congress and see how your representatives voted.
          </p>
          <p className="mt-3 animate-fade-up text-[12px] leading-[1.6] text-[var(--poli-faint)]">
            {BILL_PROCESS_EXPLAINER}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 flex flex-wrap gap-6 border-y border-[var(--poli-border)] py-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{all.length}</span>
            <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--poli-sub)]">
              Total Bills
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-400">{signed}</span>
            <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--poli-sub)]">
              Signed
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-400">{active}</span>
            <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--poli-sub)]">
              Active
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-400">{failed}</span>
            <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--poli-sub)]">
              Failed / Vetoed
            </span>
          </div>
        </div>

        {/* Bill list */}
        <div className="space-y-3">
          {billList.map((bill) => {
            const sc = STATUS_CONFIG[bill.status] ?? { label: bill.status, color: '#6B7280', bg: '#6B728018' }
            const vc = voteCounts.get(bill.id)
            const yeaPct = vc && vc.total > 0 ? Math.round((vc.yea / vc.total) * 100) : null

            return (
              <Link
                key={bill.id}
                href={`/bills/${bill.id}`}
                className="group block cursor-pointer overflow-hidden rounded-md border border-[var(--poli-border)] no-underline transition-all duration-200 hover:border-[var(--poli-input-border)] hover:shadow-md"
              >
                {/* Vote bar at top */}
                {vc && vc.total > 0 && (
                  <div className="flex h-1">
                    <div style={{ width: `${(vc.yea / vc.total) * 100}%`, background: '#22C55E88' }} />
                    <div style={{ width: `${(vc.nay / vc.total) * 100}%`, background: '#EF444488' }} />
                    <div style={{ width: `${((vc.total - vc.yea - vc.nay) / vc.total) * 100}%`, background: 'var(--poli-border)' }} />
                  </div>
                )}

                <div className="p-5">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-sm bg-[var(--poli-badge-bg)] px-2 py-0.5 text-[11px] uppercase tracking-[0.06em] text-[var(--poli-badge-text)]">
                      {bill.number}
                    </span>
                    <span
                      className="rounded-sm px-2 py-0.5 text-[11px] uppercase tracking-[0.06em]"
                      style={{ color: sc.color, background: sc.bg }}
                      title={BILL_STATUS_EXPLAINERS[bill.status] ?? ''}
                    >
                      {sc.label}
                    </span>
                    {bill.congress_session && (
                      <span className="text-[11px] text-[var(--poli-faint)]">
                        {bill.congress_session} Congress
                      </span>
                    )}
                  </div>

                  <h3 className="mb-1.5 text-lg font-semibold transition-colors group-hover:text-[var(--poli-text)]">
                    {bill.title}
                  </h3>

                  {bill.summary && (
                    <p className="mb-3 line-clamp-2 text-[13px] leading-[1.6] text-[var(--poli-sub)]">
                      {bill.summary}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-[var(--poli-faint)]">
                    {bill.introduced_date && (
                      <span>Introduced {new Date(bill.introduced_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    )}
                    {vc && vc.total > 0 && (
                      <>
                        <span className="text-[var(--poli-border)]">&middot;</span>
                        <span>
                          <span className="text-green-400/70">{vc.yea} yea</span>
                          {' \u00B7 '}
                          <span className="text-red-400/70">{vc.nay} nay</span>
                          {yeaPct !== null && (
                            <span className="ml-1 text-[var(--poli-faint)]">({yeaPct}%)</span>
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}

          {billList.length === 0 && (
            <div className="py-20 text-center text-[var(--poli-faint)]">
              <div className="mb-2 text-2xl font-bold">No bills found</div>
              <div className="text-sm">Check back for legislation updates</div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  )
}
