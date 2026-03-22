import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { RaceForm } from '@/components/admin/race-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NewRacePage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceRoleClient()

  const { data: election } = await supabase.from('elections').select('id').eq('id', id).single()
  if (!election) notFound()

  const { data: politicians } = await supabase
    .from('politicians')
    .select('id, name')
    .order('name')

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">Add Race</h1>
      <RaceForm election_id={id} politicians={politicians ?? []} />
    </div>
  )
}
