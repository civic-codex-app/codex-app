import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Contribute | Poli',
  description: 'Help make Poli better — suggest politicians, submit tips, or report errors.',
}

const ACTIONS = [
  {
    href: '/contribute/suggest',
    title: 'Suggest a Politician',
    description: 'Know an official we\'re missing? Tell us who to add.',
    icon: 'M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 3a4 4 0 100 8 4 4 0 000-8zM20 8v6M23 11h-6',
  },
  {
    href: '/contribute/tip',
    title: 'Submit a Tip or Source',
    description: 'Have a source or insider knowledge about a politician\'s stance?',
    icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  },
  {
    href: '/contact',
    title: 'General Feedback',
    description: 'Questions, ideas, or partnership inquiries.',
    icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
  },
]

export default function ContributePage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-[800px] px-6 pt-6 pb-16 md:px-10">
        <h1 className="mb-2 text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
          Contribute
        </h1>
        <p className="mb-8 text-[15px] leading-[1.7] text-[var(--poli-sub)]">
          Poli is built on public data — help us make it more accurate and complete.
        </p>

        <div className="space-y-3">
          {ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-center gap-4 rounded-xl border border-[var(--poli-border)] p-5 no-underline transition-all hover:border-[var(--poli-text)] hover:shadow-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--poli-badge-bg)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--poli-sub)]">
                  <path d={action.icon} />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-[var(--poli-text)]">{action.title}</div>
                <div className="mt-0.5 text-[12px] text-[var(--poli-faint)]">{action.description}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--poli-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </div>

        <Footer />
      </div>
    </>
  )
}
