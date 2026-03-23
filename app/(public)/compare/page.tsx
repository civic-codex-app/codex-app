import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CompareSelector } from '@/components/compare/compare-selector'
import { CompareView } from '@/components/compare/compare-view'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Compare Politicians | Poli',
  description: 'Compare politicians side by side on issues, alignment, committees, campaign finance, and voting records.',
}

interface PageProps {
  searchParams: Promise<{ a?: string; b?: string }>
}

export default async function ComparePage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createServiceRoleClient()

  // Fetch both politicians by slug
  let polA = null
  let polB = null

  if (params.a) {
    const { data } = await supabase.from('politicians').select('*').eq('slug', params.a).single()
    polA = data
  }
  if (params.b) {
    const { data } = await supabase.from('politicians').select('*').eq('slug', params.b).single()
    polB = data
  }

  // Fetch all comparison data in parallel when both are selected
  let stancesA: any[] = []
  let stancesB: any[] = []
  let committeesA: any[] = []
  let committeesB: any[] = []
  let financeA: any[] = []
  let financeB: any[] = []
  let votingA: any[] = []
  let votingB: any[] = []
  let electionsA: any[] = []
  let electionsB: any[] = []

  if (polA && polB) {
    const [
      stA, stB, cmA, cmB, fnA, fnB, vtA, vtB, elA, elB,
    ] = await Promise.all([
      supabase.from('politician_issues')
        .select('*, issues:issue_id(id, name, slug, icon, category)')
        .eq('politician_id', polA.id),
      supabase.from('politician_issues')
        .select('*, issues:issue_id(id, name, slug, icon, category)')
        .eq('politician_id', polB.id),
      supabase.from('politician_committees')
        .select('role, committees:committee_id(id, name, slug)')
        .eq('politician_id', polA.id),
      supabase.from('politician_committees')
        .select('role, committees:committee_id(id, name, slug)')
        .eq('politician_id', polB.id),
      supabase.from('campaign_finance')
        .select('*').eq('politician_id', polA.id)
        .order('cycle', { ascending: false }),
      supabase.from('campaign_finance')
        .select('*').eq('politician_id', polB.id)
        .order('cycle', { ascending: false }),
      supabase.from('voting_records')
        .select('id, bill_name, bill_number, bill_id, vote, vote_date')
        .eq('politician_id', polA.id)
        .order('vote_date', { ascending: false })
        .limit(500),
      supabase.from('voting_records')
        .select('id, bill_name, bill_number, bill_id, vote, vote_date')
        .eq('politician_id', polB.id)
        .order('vote_date', { ascending: false })
        .limit(500),
      supabase.from('election_results')
        .select('*').eq('politician_id', polA.id)
        .order('election_year', { ascending: false }),
      supabase.from('election_results')
        .select('*').eq('politician_id', polB.id)
        .order('election_year', { ascending: false }),
    ])

    stancesA = stA.data ?? []
    stancesB = stB.data ?? []
    committeesA = cmA.data ?? []
    committeesB = cmB.data ?? []
    financeA = fnA.data ?? []
    financeB = fnB.data ?? []
    votingA = vtA.data ?? []
    votingB = vtB.data ?? []
    electionsA = elA.data ?? []
    electionsB = elB.data ?? []
  }

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        <div className="mb-10 max-w-[600px]">
          <h1 className="mb-4 animate-fade-up text-[clamp(32px,4vw,52px)] font-bold leading-[1.1]">
            Compare Officials
          </h1>
          <p className="animate-fade-up text-[15px] leading-[1.7] text-[var(--codex-subtle)]">
            See how two politicians stack up on the issues, campaign finance, voting records, and more.
          </p>
        </div>

        <CompareSelector
          selectedA={params.a ?? ''}
          selectedB={params.b ?? ''}
          nameA={polA?.name}
          nameB={polB?.name}
        />

        {polA && polB && (
          <CompareView
            polA={polA}
            polB={polB}
            stancesA={stancesA}
            stancesB={stancesB}
            committeesA={committeesA}
            committeesB={committeesB}
            financeA={financeA}
            financeB={financeB}
            votingA={votingA}
            votingB={votingB}
            electionsA={electionsA}
            electionsB={electionsB}
          />
        )}

        {(!polA || !polB) && (
          <div className="py-20 text-center text-[var(--codex-faint)]">
            <div className="mb-2 text-2xl font-bold">Select two officials to compare</div>
            <div className="text-sm">Search by name above to find officials</div>
          </div>
        )}

        <Footer />
      </div>
    </>
  )
}
