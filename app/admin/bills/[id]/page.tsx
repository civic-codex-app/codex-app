import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { BillForm } from '@/components/admin/bill-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditBillPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceRoleClient()

  const { data: bill } = await supabase
    .from('bills')
    .select('*')
    .eq('id', id)
    .single()

  if (!bill) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-serif text-3xl">Edit Bill</h1>
      <BillForm bill={bill as any} />
    </div>
  )
}
