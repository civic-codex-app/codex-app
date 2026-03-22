import { ElectionForm } from '@/components/admin/election-form'

export default function NewElectionPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">Add Election</h1>
      <ElectionForm />
    </div>
  )
}
