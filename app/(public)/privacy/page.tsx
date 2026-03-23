import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Privacy Policy | Poli',
  description: 'How Poli collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-[800px] px-6 pt-6 pb-16 md:px-10">
        <h1 className="mb-2 text-[clamp(28px,4vw,42px)] font-bold leading-[1.1]">Privacy Policy</h1>
        <p className="mb-8 text-[13px] text-[var(--codex-faint)]">Last updated: March 2026</p>

        <div className="prose-sm space-y-6 text-[14px] leading-[1.8] text-[var(--codex-sub)]">
          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[var(--codex-text)]">What We Collect</h2>
            <p>When you create an account, we collect your email address, display name, and optionally your state, zip code, and avatar. If you take the alignment quiz, we store your answers to match you with officials. We also track follows, likes, and poll votes tied to your account.</p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[var(--codex-text)]">How We Use It</h2>
            <p>Your data is used to personalize your experience — showing your representatives, ballot preview, and quiz matches. We do not sell your data. We do not share it with political parties, campaigns, or advertisers.</p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[var(--codex-text)]">Cookies</h2>
            <p>We use essential cookies for authentication (managed by Supabase) and to prevent duplicate poll votes. We do not use tracking cookies or third-party advertising cookies.</p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[var(--codex-text)]">Third-Party Services</h2>
            <p>We use Supabase for authentication and database hosting, Vercel for web hosting, and Cloudflare R2 for image storage. These services have their own privacy policies. We use Vercel Analytics for anonymous, aggregated usage metrics — no personal data is shared.</p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[var(--codex-text)]">Your Rights</h2>
            <p>You can delete your account at any time from your account settings. This permanently removes all your data including follows, likes, poll votes, and profile information. You can also update or correct your profile data at any time.</p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[var(--codex-text)]">Data Security</h2>
            <p>All data is transmitted over HTTPS. Passwords are hashed by Supabase Auth. We use Row-Level Security on our database to ensure users can only access their own data. Admin access is restricted to authorized team members.</p>
          </section>

          <section>
            <h2 className="mb-2 text-[16px] font-semibold text-[var(--codex-text)]">Contact</h2>
            <p>Questions about this policy? <a href="/contact" className="font-medium text-[var(--codex-text)] underline underline-offset-2">Contact us</a>.</p>
          </section>
        </div>

        <Footer />
      </div>
    </>
  )
}
