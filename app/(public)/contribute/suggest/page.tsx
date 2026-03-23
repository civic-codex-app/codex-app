import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SubmissionForm } from '@/components/forms/submission-form'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Suggest a Politician | Poli',
  description: 'Know an elected official we\'re missing? Help us add them to the database.',
}

export default function SuggestPoliticianPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-[600px] px-6 pt-6 pb-16 md:px-10">
        <Link href="/contribute" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--codex-sub)] transition-colors hover:text-[var(--codex-text)]">
          &larr; Contribute
        </Link>
        <h1 className="mb-2 text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
          Suggest a Politician
        </h1>
        <p className="mb-8 text-[15px] leading-[1.7] text-[var(--codex-sub)]">
          Know an elected official we&apos;re missing? Tell us who to add.
        </p>

        <SubmissionForm
          type="suggest_politician"
          submitLabel="Submit Suggestion"
          successMessage="Thanks! We'll review this and add them if they qualify."
          fields={[
            { name: 'politician_name', label: 'Politician Name', required: true, placeholder: 'Full name' },
            { name: 'state', label: 'State', placeholder: 'e.g. TX, CA' },
            { name: 'party', label: 'Party', type: 'select', options: [
              { value: 'democrat', label: 'Democrat' },
              { value: 'republican', label: 'Republican' },
              { value: 'independent', label: 'Independent' },
              { value: 'other', label: 'Other' },
            ]},
            { name: 'office', label: 'Office / Title', placeholder: 'e.g. U.S. Senator, Mayor of Austin' },
            { name: 'source_url', label: 'Source URL', type: 'url', placeholder: 'Link to verify (optional)' },
            { name: 'notes', label: 'Additional Notes', type: 'textarea', placeholder: 'Anything else we should know?' },
          ]}
        />

        <Footer />
      </div>
    </>
  )
}
