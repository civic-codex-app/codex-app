import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { CandidateForm } from '@/components/admin/candidate-form'

interface PageProps {
  params: Promise<{ id: string; raceId: string }>
}

export default async function NewCandidatePage({ params }: PageProps) {
  const { id, raceId } = await params
  const supabase = createServiceRoleClient()

  const { data: race } = await supabase.from('races').select('id').eq('id', raceId).single()
  if (!race) notFound()

  const { data: politicians } = await supabase
    .from('politicians')
    .select('id, name')
    .order('name')

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-serif text-3xl">Add Candidate</h1>
      <CandidateForm race_id={raceId} election_id={id} politicians={politicians ?? []} />
    </div>
  )
}
