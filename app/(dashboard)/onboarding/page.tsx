import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Welcome -- Poli',
  description: 'Set up your Poli profile in a few quick steps.',
}

export default async function OnboardingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if onboarding is already complete (state is set)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, state')
    .eq('id', user.id)
    .single()

  if (profile?.state) {
    redirect('/dashboard')
  }

  return <OnboardingWizard profileId={user.id} />
}
