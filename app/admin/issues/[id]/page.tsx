import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { IssueForm } from '@/components/admin/issue-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditIssuePage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceRoleClient()

  const { data: issue } = await supabase.from('issues').select('*').eq('id', id).single()

  if (!issue) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">Edit Issue</h1>
      <IssueForm issue={issue as any} />
    </div>
  )
}
