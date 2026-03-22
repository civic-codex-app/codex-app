import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { QuizForm } from '@/components/match/quiz-form'

export const metadata = {
  title: 'Voter Match -- Codex',
  description:
    'Answer questions on key political issues and find which politicians most closely match your views.',
}

export default async function MatchPage() {
  const supabase = createServiceRoleClient()

  const { data: issues } = await supabase
    .from('issues')
    .select('id, name, slug, icon, description')
    .order('name')

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-6 pb-20 md:px-10">
        <div className="mb-10 text-center">
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight text-[var(--codex-text)]">
            Find Your Match
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--codex-sub)]">
            Share your stance on key issues and we'll show you which politicians
            align most closely with your views.
          </p>
        </div>

        <QuizForm issues={issues ?? []} />
      </main>
      <Footer />
    </>
  )
}
