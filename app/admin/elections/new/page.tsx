import { ElectionForm } from '@/components/admin/election-form'

export default function NewElectionPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-serif text-3xl">Add Election</h1>
      <ElectionForm />
    </div>
  )
}
