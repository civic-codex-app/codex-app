import { IssueForm } from '@/components/admin/issue-form'

export default function NewIssuePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold">Add Issue</h1>
      <IssueForm />
    </div>
  )
}
