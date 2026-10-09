import { IssueForm } from '@/components/admin/issue-form'

export default function NewIssuePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-serif text-[32px] font-normal leading-[1.08]">Add Issue</h1>
      <IssueForm />
    </div>
  )
}
