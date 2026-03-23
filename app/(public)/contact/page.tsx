import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SubmissionForm } from '@/components/forms/submission-form'

export const metadata: Metadata = {
  title: 'Contact | Poli',
  description: 'Get in touch with the Poli team — questions, feedback, or partnership inquiries.',
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 pt-6 pb-16 md:px-10">
        <h1 className="mb-2 text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">
          Contact Us
        </h1>
        <p className="mb-8 text-[15px] leading-[1.7] text-[var(--codex-sub)]">
          Have a question, feedback, or want to work with us? We&apos;d love to hear from you.
        </p>

        <SubmissionForm
          type="contact"
          submitLabel="Send Message"
          successMessage="Thanks for reaching out! We'll get back to you soon."
          fields={[
            { name: 'subject', label: 'Subject', required: true, placeholder: 'What is this about?' },
            { name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Your message...', maxLength: 5000 },
          ]}
        />

        <Footer />
      </div>
    </>
  )
}
