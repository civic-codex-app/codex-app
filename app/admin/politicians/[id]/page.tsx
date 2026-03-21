import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { PoliticianEditForm } from '@/components/admin/politician-edit-form'
import type { Politician } from '@/lib/types/politician'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPoliticianPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceRoleClient()
  const { data } = await supabase.from('politicians').select('*').eq('id', id).single()

  if (!data) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-serif text-3xl">Edit Politician</h1>
      <PoliticianEditForm politician={data as Politician} />
    </div>
  )
}
