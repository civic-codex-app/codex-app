import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MoneyMapView } from '@/components/insights/money-map-view'

export const revalidate = 3600 // 1 hour
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Money Map | Poli',
  description: 'See how much politicians raise and spend by state with an interactive US map.',
}

const PAGE_SIZE = 900

export default async function MoneyMapPage() {
  const supabase = createServiceRoleClient()

  // Fetch all campaign finance records
  const allFinance: Array<{ politician_id: string; total_raised: number; total_spent: number; cash_on_hand: number; cycle: string }> = []
  let from = 0
  while (true) {
    const { data, error } = await supabase
      .from('campaign_finance')
      .select('politician_id, total_raised, total_spent, cash_on_hand, cycle')
      .range(from, from + PAGE_SIZE - 1)
    if (error || !data || data.length === 0) break
    allFinance.push(...(data as any[]))
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  // Fetch all politicians for state mapping
  const allPoliticians: Array<{ id: string; name: string; slug: string; state: string; party: string }> = []
  from = 0
  while (true) {
    const { data, error } = await supabase
      .from('politicians')
      .select('id, name, slug, state, party')
      .range(from, from + PAGE_SIZE - 1)
    if (error || !data || data.length === 0) break
    allPoliticians.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  const polMap = new Map(allPoliticians.map((p) => [p.id, p]))

  // Use most recent cycle per politician
  const latestByPol = new Map<string, typeof allFinance[0]>()
  for (const f of allFinance) {
    const existing = latestByPol.get(f.politician_id)
    if (!existing || f.cycle > existing.cycle) {
      latestByPol.set(f.politician_id, f)
    }
  }

  // Aggregate by state for each metric
  const stateFinance: Record<string, { raised: number; spent: number; cash: number; count: number; politicians: Array<{ name: string; slug: string; party: string; raised: number; spent: number; cash: number }> }> = {}

  for (const [polId, finance] of latestByPol) {
    const pol = polMap.get(polId)
    if (!pol || !pol.state) continue

    if (!stateFinance[pol.state]) {
      stateFinance[pol.state] = { raised: 0, spent: 0, cash: 0, count: 0, politicians: [] }
    }
    const sf = stateFinance[pol.state]
    sf.raised += Number(finance.total_raised) || 0
    sf.spent += Number(finance.total_spent) || 0
    sf.cash += Number(finance.cash_on_hand) || 0
    sf.count++
    sf.politicians.push({
      name: pol.name,
      slug: pol.slug,
      party: pol.party,
      raised: Number(finance.total_raised) || 0,
      spent: Number(finance.total_spent) || 0,
      cash: Number(finance.cash_on_hand) || 0,
    })
  }

  // Sort politicians within each state by raised desc
  for (const sf of Object.values(stateFinance)) {
    sf.politicians.sort((a, b) => b.raised - a.raised)
  }

  // Compute party totals
  const partyTotals: Record<string, { raised: number; spent: number; cash: number; count: number }> = {}
  for (const sf of Object.values(stateFinance)) {
    for (const p of sf.politicians) {
      if (!partyTotals[p.party]) partyTotals[p.party] = { raised: 0, spent: 0, cash: 0, count: 0 }
      partyTotals[p.party].raised += p.raised
      partyTotals[p.party].spent += p.spent
      partyTotals[p.party].cash += p.cash
      partyTotals[p.party].count++
    }
  }

  // Top 20 nationally
  const allPols = Object.values(stateFinance).flatMap((sf) => sf.politicians)
  const topRaised = [...allPols].sort((a, b) => b.raised - a.raised).slice(0, 20)
  const topSpent = [...allPols].sort((a, b) => b.spent - a.spent).slice(0, 20)

  // Dominant party per state for map coloring
  const stateDominantParty: Record<string, string> = {}
  for (const [state, sf] of Object.entries(stateFinance)) {
    const partyRaised: Record<string, number> = {}
    for (const p of sf.politicians) {
      partyRaised[p.party] = (partyRaised[p.party] ?? 0) + p.raised
    }
    let maxParty = ''
    let maxVal = 0
    for (const [party, val] of Object.entries(partyRaised)) {
      if (val > maxVal) { maxParty = party; maxVal = val }
    }
    stateDominantParty[state] = maxParty
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">
        <MoneyMapView
          stateFinance={stateFinance}
          partyTotals={partyTotals}
          topRaised={topRaised}
          topSpent={topSpent}
          stateDominantParty={stateDominantParty}
        />
        <Footer />
      </main>
    </>
  )
}
