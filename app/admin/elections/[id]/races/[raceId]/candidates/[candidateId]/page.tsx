import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { CandidateForm } from '@/components/admin/candidate-form'

interface PageProps {
  params: Promise<{ id: string; raceId: string; candidateId: string }>
}

export default async function EditCandidatePage({ params }: PageProps) {
  const { id, raceId, candidateId } = await params
  const supabase = createServiceRoleClient()

  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .single()

  if (!candidate) notFound()

  const { data: politicians } = await supabase
    .from('politicians')
    .select('id, name')
    .order('name')

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">Edit Candidate</h1>
      <CandidateForm
        race_id={raceId}
        election_id={id}
        candidate={candidate as any}
        politicians={politicians ?? []}
      />
    </div>
  )
}
