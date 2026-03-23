import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { STATE_NAMES, US_STATES } from '@/lib/constants/us-states'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'States | Poli',
  description: 'Browse U.S. states and territories to see elected officials, campaign finance, and upcoming races.',
}

export default async function StatesIndexPage() {
  const supabase = createServiceRoleClient()

  // Fetch politician counts grouped by state
  const { data: politicians } = await supabase
    .from('politicians')
    .select('state')

  const countsByState: Record<string, number> = {}
  for (const p of politicians ?? []) {
    if (p.state) {
      countsByState[p.state] = (countsByState[p.state] || 0) + 1
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
        <h1 className="mb-2 font-serif text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
          States
        </h1>
        <p className="mb-8 text-[15px] leading-[1.7] text-[var(--codex-sub)]">
          Browse elected officials, campaign finance, and upcoming races by state.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {US_STATES.map((abbr) => {
            const name = STATE_NAMES[abbr] ?? abbr
            const count = countsByState[abbr] ?? 0

            return (
              <Link
                key={abbr}
                href={`/states/${abbr.toLowerCase()}`}
                className="group flex items-center gap-3 rounded-lg border border-[var(--codex-border)] p-3 no-underline transition-all hover:border-[var(--codex-text)] hover:shadow-sm"
              >
                <span className="text-2xl leading-none">{stateFlag(abbr)}</span>
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-medium text-[var(--codex-text)] transition-colors group-hover:text-[var(--codex-text)]">
                    {name}
                  </div>
                  <div className="text-[11px] text-[var(--codex-faint)]">
                    {count} official{count !== 1 ? 's' : ''}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <Footer />
      </div>
    </>
  )
}

/** Map state abbreviation to a flag emoji or fallback */
function stateFlag(abbr: string): string {
  // US states don't have individual emoji flags, use regional indicator for US flag
  // Use a simple text abbreviation styled as a badge instead
  return '\uD83C\uDDFA\uD83C\uDDF8' // US flag emoji as fallback
}
