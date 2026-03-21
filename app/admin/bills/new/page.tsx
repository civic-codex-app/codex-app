import { BillForm } from '@/components/admin/bill-form'

export default function NewBillPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-serif text-3xl">Add Bill</h1>
      <BillForm />
    </div>
  )
}
