import { Metadata } from 'next'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { QuizForm } from '@/components/match/quiz-form'

const BASE_URL = 'https://codex-app-gold.vercel.app'

interface PageProps {
  searchParams: Promise<{ result?: string; score?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams
  const { result, score } = params

  // Default metadata when no share params
  if (!result || !score) {
    return {
      title: 'Who Represents You -- Codex',
      description:
        'Answer questions on key political issues and find which politicians most closely match your views.',
    }
  }

  // Fetch politician data for the shared result
  const supabase = createServiceRoleClient()
  const { data: politician } = await supabase
    .from('politicians')
    .select('name, party, state')
    .eq('slug', result)
    .single()

  if (!politician) {
    return {
      title: 'Who Represents You -- Codex',
      description:
        'Answer questions on key political issues and find which politicians most closely match your views.',
    }
  }

  const title = `${score}% Match with ${politician.name} -- Codex`
  const description = `I'm ${score}% aligned with ${politician.name}. Take the Who Represents You quiz on Codex to see who represents you!`

  const ogImageUrl = `${BASE_URL}/api/og/match?${new URLSearchParams({
    name: politician.name,
    party: politician.party ?? '',
    state: politician.state ?? '',
    score,
  }).toString()}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/match?result=${result}&score=${score}`,
      siteName: 'Codex',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${score}% match with ${politician.name}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
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
      <main className="mx-auto max-w-2xl px-6 pt-6 pb-20 md:px-10">
        <div className="mb-10 text-center">
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight text-[var(--codex-text)]">
            Who Represents You?
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
