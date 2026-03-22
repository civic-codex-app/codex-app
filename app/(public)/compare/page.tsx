import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CompareSelector } from '@/components/compare/compare-selector'
import { CompareView } from '@/components/compare/compare-view'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Politicians — Codex',
  description: 'Compare politicians side by side on issues, alignment, and committees.',
}

interface PageProps {
  searchParams: Promise<{ a?: string; b?: string }>
}

export default async function ComparePage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = createServiceRoleClient()

  // If both slugs are provided, fetch full data
  let polA = null
  let polB = null
  let stancesA: any[] = []
  let stancesB: any[] = []
  let committeesA: any[] = []
  let committeesB: any[] = []

  if (params.a) {
    const { data } = await supabase.from('politicians').select('*').eq('slug', params.a).single()
    polA = data
  }
  if (params.b) {
    const { data } = await supabase.from('politicians').select('*').eq('slug', params.b).single()
    polB = data
  }

  if (polA) {
    const { data } = await supabase
      .from('politician_issues')
      .select('*, issues:issue_id(id, name, slug, icon, category)')
      .eq('politician_id', polA.id)
    stancesA = data ?? []
    const { data: cm } = await supabase
      .from('politician_committees')
      .select('role, committees:committee_id(id, name, slug)')
      .eq('politician_id', polA.id)
    committeesA = cm ?? []
  }

  if (polB) {
    const { data } = await supabase
      .from('politician_issues')
      .select('*, issues:issue_id(id, name, slug, icon, category)')
      .eq('politician_id', polB.id)
    stancesB = data ?? []
    const { data: cm } = await supabase
      .from('politician_committees')
      .select('role, committees:committee_id(id, name, slug)')
      .eq('politician_id', polB.id)
    committeesB = cm ?? []
  }

  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <div className="mb-10 max-w-[600px]">
          <h1 className="mb-4 animate-fade-up font-serif text-[clamp(32px,4vw,52px)] font-normal leading-[1.1]">
            Compare{' '}
            <span className="italic text-[var(--codex-subtle)]">Officials</span>
          </h1>
          <p className="animate-fade-up text-[15px] leading-[1.7] text-[var(--codex-subtle)]">
            See how two politicians stack up on the issues, party alignment, and committee roles.
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
          />
        )}

        {(!polA || !polB) && (
          <div className="py-20 text-center text-[var(--codex-faint)]">
            <div className="mb-2 font-serif text-2xl">Select two officials to compare</div>
            <div className="text-sm">Search by name above to find officials</div>
          </div>
        )}

        <Footer />
      </div>
    </>
  )
}
