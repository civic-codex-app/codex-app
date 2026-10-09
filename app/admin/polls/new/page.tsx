import { PollForm } from '@/components/admin/poll-form'

export default function NewPollPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 font-serif text-[32px] font-normal leading-[1.08]">Create Poll</h1>
      <PollForm />
    </div>
  )
}
