import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SubmissionForm } from '@/components/forms/submission-form'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Submit a Tip | Poli',
  description: 'Have a source or tip about a politician\'s stance or record? Share it with us.',
}

export default function SubmitTipPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-[600px] px-6 pt-6 pb-16 md:px-10">
        <Link href="/contribute" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--poli-sub)] transition-colors hover:text-[var(--poli-text)]">
          &larr; Contribute
        </Link>
        <h1 className="mb-2 text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
          Submit a Tip
        </h1>
        <p className="mb-8 text-[15px] leading-[1.7] text-[var(--poli-sub)]">
          Have a source or information about a politician&apos;s stance or record? We&apos;ll review it.
        </p>

        <SubmissionForm
          type="submit_tip"
          submitLabel="Submit Tip"
          successMessage="Thanks for the tip! Our team will review it."
          fields={[
            { name: 'politician_name', label: 'Politician (if applicable)', placeholder: 'Name of the politician' },
            { name: 'tip_text', label: 'Your Tip', type: 'textarea', required: true, placeholder: 'What should we know?', maxLength: 5000 },
            { name: 'source_url', label: 'Source URL', type: 'url', placeholder: 'Link to source (optional)' },
          ]}
        />

        <Footer />
      </div>
    </>
  )
}
