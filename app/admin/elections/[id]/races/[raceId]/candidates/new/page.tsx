import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { CandidateForm } from '@/components/admin/candidate-form'

export const dynamic = 'force-dynamic'

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
      <h1 className="mb-8 text-3xl font-bold">Add Candidate</h1>
      <CandidateForm race_id={raceId} election_id={id} politicians={politicians ?? []} />
    </div>
  )
}
