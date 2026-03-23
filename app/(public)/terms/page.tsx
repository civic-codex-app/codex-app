import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Terms of Service | Poli',
  description: 'Terms governing your use of the Poli platform.',
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-[800px] px-6 pt-6 pb-16 md:px-10">
        <h1 className="mb-2 font-serif text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">Terms of Service</h1>
        <p className="mb-8 text-[13px] text-[var(--codex-faint)]">Last updated: March 2026</p>

        <div className="prose-sm space-y-6 text-[14px] leading-[1.8] text-[var(--codex-sub)]">
          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[var(--codex-text)]">Acceptance</h2>
            <p>By using Poli, you agree to these terms. If you don&apos;t agree, please don&apos;t use the platform.</p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[var(--codex-text)]">What Poli Is</h2>
            <p>Poli is a civic education platform that aggregates publicly available information about U.S. elected officials. We are nonpartisan and independent — not affiliated with any political party, campaign, or government agency.</p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[var(--codex-text)]">Accuracy Disclaimer</h2>
            <p>All data on Poli is compiled from public sources and may contain errors or be out of date. Stance ratings, alignment scores, and report cards are algorithmically generated and should not be taken as official positions. We make no guarantees about the accuracy, completeness, or timeliness of any information on this platform.</p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[var(--codex-text)]">Not Legal or Political Advice</h2>
            <p>Nothing on Poli constitutes legal, political, or voting advice. Always verify information through official government sources before making decisions.</p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[var(--codex-text)]">Your Account</h2>
            <p>You are responsible for your account and any activity under it. Don&apos;t share your credentials. We may suspend or terminate accounts that violate these terms or submit false information.</p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[var(--codex-text)]">User Contributions</h2>
            <p>When you submit corrections, suggestions, tips, or annotations, you grant Poli a non-exclusive license to use that information to improve our platform. Don&apos;t submit content that is false, defamatory, or violates someone else&apos;s rights.</p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[var(--codex-text)]">Limitation of Liability</h2>
            <p>Poli is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from your use of the platform, including but not limited to decisions made based on information found here.</p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[var(--codex-text)]">Changes</h2>
            <p>We may update these terms from time to time. Continued use of Poli after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[var(--codex-text)]">Contact</h2>
            <p>Questions? <a href="/contact" className="font-medium text-[var(--codex-text)] underline underline-offset-2">Contact us</a>.</p>
          </section>
        </div>

        <Footer />
      </div>
    </>
  )
}
