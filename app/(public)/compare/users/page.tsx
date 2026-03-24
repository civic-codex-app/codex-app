import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { createClient as createServerAuthClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { UserCompareView } from '@/components/community/user-compare-view'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Voters | Poli',
  description: 'See how your political stances compare with another anonymous voter.',
}

interface PageProps {
  searchParams: Promise<{ them?: string; me?: string }>
}

export default async function UserComparePage({ searchParams }: PageProps) {
  const params = await searchParams
  const themId = params.them
  const meId = params.me

  if (!themId) {
    return (
      <>
        <Header />
        <main id="main-content" className="mx-auto max-w-[800px] px-6 pb-16 pt-6 md:px-10">
          <div className="py-20 text-center">
            <h1 className="mb-2 text-2xl font-bold text-[var(--poli-text)]">
              Compare Voters
            </h1>
            <p className="mb-4 text-[14px] text-[var(--poli-sub)]">
              Pick a voter from the community page to compare with.
            </p>
            <Link
              href="/community"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-[13px] font-semibold text-white no-underline transition-all hover:bg-blue-700"
            >
              Browse Community
            </Link>
          </div>
          <Footer />
        </main>
      </>
    )
  }

  const supabase = createServiceRoleClient()

  // Fetch "them" profile (anonymous-safe columns only)
  const { data: themProfile } = await supabase
    .from('profiles')
    .select('anonymous_id, state, quiz_answers')
    .eq('anonymous_id', themId)
    .eq('sharing_enabled', true)
    .single()

  if (!themProfile || !themProfile.quiz_answers) {
    return (
      <>
        <Header />
        <main id="main-content" className="mx-auto max-w-[800px] px-6 pb-16 pt-6 md:px-10">
          <div className="py-20 text-center">
            <h1 className="mb-2 text-2xl font-bold text-[var(--poli-text)]">
              Voter not found
            </h1>
            <p className="mb-4 text-[14px] text-[var(--poli-sub)]">
              This voter may have disabled sharing or the link may be invalid.
            </p>
            <Link
              href="/community"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-[13px] font-semibold text-white no-underline transition-all hover:bg-blue-700"
            >
              Browse Community
            </Link>
          </div>
          <Footer />
        </main>
      </>
    )
  }

  // If "me" is provided, fetch that profile too (two public profiles comparing)
  let meProfile = null
  if (meId) {
    const { data } = await supabase
      .from('profiles')
      .select('anonymous_id, state, quiz_answers')
      .eq('anonymous_id', meId)
      .eq('sharing_enabled', true)
      .single()

    if (data?.quiz_answers) {
      meProfile = {
        anonymousId: data.anonymous_id!,
        state: data.state,
        stances: data.quiz_answers as Record<string, string>,
      }
    }
  }

  // Check if current user is authenticated
  let isAuthenticated = false
  try {
    const authClient = await createServerAuthClient()
    const { data: { user } } = await authClient.auth.getUser()
    isAuthenticated = !!user
  } catch {}

  // Fetch issues for display
  const { data: issues } = await supabase
    .from('issues')
    .select('slug, name, icon')
    .order('name')

  const them = {
    anonymousId: themProfile.anonymous_id!,
    state: themProfile.state,
    stances: themProfile.quiz_answers as Record<string, string>,
  }

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-[800px] px-6 pb-16 pt-6 md:px-10">
        <div className="mb-6">
          <Link
            href="/community"
            className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-[var(--poli-faint)] no-underline transition-colors hover:text-[var(--poli-text)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Community
          </Link>
          <h1 className="mb-2 text-[clamp(24px,3vw,36px)] font-bold leading-[1.1]">
            Voter Comparison
          </h1>
          <p className="text-[14px] text-[var(--poli-sub)]">
            See where you agree and disagree on the issues.
          </p>
        </div>

        <UserCompareView
          them={them}
          me={meProfile}
          issues={(issues ?? []) as Array<{ slug: string; name: string; icon?: string }>}
          isAuthenticated={isAuthenticated}
        />

        <Footer />
      </main>
    </>
  )
}
