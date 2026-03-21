import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { PollForm } from '@/components/admin/poll-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPollPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceRoleClient()

  const { data: poll } = await supabase
    .from('polls')
    .select('*, poll_options(id, label, sort_order)')
    .eq('id', id)
    .single()

  if (!poll) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-serif text-3xl">Edit Poll</h1>
      <PollForm poll={poll as any} />
    </div>
  )
}
