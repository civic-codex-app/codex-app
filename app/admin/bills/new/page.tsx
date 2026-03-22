import { BillForm } from '@/components/admin/bill-form'

export default function NewBillPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">Add Bill</h1>
      <BillForm />
    </div>
  )
}
