import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { STATE_NAMES, US_STATES } from '@/lib/constants/us-states'
import { partyColor } from '@/lib/constants/parties'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'States | Poli',
  description: 'Explore every U.S. state — see your senators, governor, and house reps, plus campaign finance totals, party breakdowns, and upcoming races.',
}

export default async function StatesIndexPage() {
  const supabase = createServiceRoleClient()

  const FEDERAL_CHAMBERS = new Set(['senate', 'house', 'governor'])

  // Fetch politicians with party + chamber, and race counts
  const [{ data: politicians }, { data: allRaces }] = await Promise.all([
    supabase.from('politicians').select('state, party, chamber'),
    supabase.from('races').select('state, candidates(id)'),
  ])

  const federalByState: Record<string, number> = {}
  const localByState: Record<string, number> = {}
  const fedPartiesByState: Record<string, Record<string, number>> = {}
  for (const p of politicians ?? []) {
    if (p.state) {
      if (FEDERAL_CHAMBERS.has(p.chamber)) {
        federalByState[p.state] = (federalByState[p.state] || 0) + 1
        if (!fedPartiesByState[p.state]) fedPartiesByState[p.state] = {}
        fedPartiesByState[p.state][p.party] = (fedPartiesByState[p.state][p.party] || 0) + 1
      } else {
        localByState[p.state] = (localByState[p.state] || 0) + 1
      }
    }
  }

  const racesByState: Record<string, number> = {}
  for (const r of allRaces ?? []) {
    // Only count races that have at least one candidate
    if (r.state && (r.candidates as any[])?.length > 0) {
      racesByState[r.state] = (racesByState[r.state] || 0) + 1
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'U.S. States',
    description: 'Browse elected officials by state.',
    url: 'https://getpoli.app/states',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 pt-6 pb-16 md:px-10">
        <h1 className="mb-2 text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
          States
        </h1>
        <p className="mb-8 text-[15px] leading-[1.7] text-[var(--codex-sub)]">
          Browse elected officials, campaign finance, and upcoming races by state.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {US_STATES.map((abbr) => {
            const name = STATE_NAMES[abbr] ?? abbr
            const federal = federalByState[abbr] ?? 0
            const local = localByState[abbr] ?? 0
            const races = racesByState[abbr] ?? 0
            const parties = fedPartiesByState[abbr] ?? {}
            const dem = parties['democrat'] ?? 0
            const rep = parties['republican'] ?? 0
            const fedTotal = Math.max(federal, 1)
            const other = federal - dem - rep

            return (
              <Link
                key={abbr}
                href={`/states/${abbr.toLowerCase()}`}
                className="group flex flex-col gap-2.5 rounded-lg border border-[var(--codex-border)] p-3 no-underline transition-all hover:border-[var(--codex-text)] hover:shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Image
                    src={abbr === 'DC' ? '/flags/us-dc.svg' : `https://flagcdn.com/48x36/us-${abbr.toLowerCase()}.png`}
                    alt={`${name} flag`}
                    width={32}
                    height={24}
                    className="rounded-sm shadow-sm"
                    unoptimized
                  />
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-medium text-[var(--codex-text)]">
                      {name}
                    </div>
                    <div className="text-[11px] text-[var(--codex-faint)]">
                      {federal} federal{local > 0 && <> · {local} local</>}
                      {races > 0 && <> · {races} race{races !== 1 ? 's' : ''}</>}
                    </div>
                  </div>
                </div>
                {federal > 0 && (
                  <div className="flex h-[4px] w-full overflow-hidden rounded-full">
                    {dem > 0 && (
                      <div
                        className="h-full"
                        style={{ width: `${(dem / fedTotal) * 100}%`, backgroundColor: partyColor('democrat') }}
                      />
                    )}
                    {other > 0 && (
                      <div
                        className="h-full"
                        style={{ width: `${(other / fedTotal) * 100}%`, backgroundColor: partyColor('independent') }}
                      />
                    )}
                    {rep > 0 && (
                      <div
                        className="h-full"
                        style={{ width: `${(rep / fedTotal) * 100}%`, backgroundColor: partyColor('republican') }}
                      />
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </div>

        <Footer />
      </div>
    </>
  )
}

