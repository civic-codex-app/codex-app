# Implementation Plan: Codex — Political Directory App

## Goal
Transform the single-file Codex prototype into a scalable full-stack Next.js app deployed on Vercel with Capacitor for iOS, mirroring the Apex app architecture.

## Chosen Approach
Clone the Apex scaffolding (Next.js + Supabase + Capacitor + Tailwind/Shadcn) and build Codex-specific features on top. Data entered manually via admin panel for now, with room to plug in APIs later.

## Steps

### Step 1: Project Scaffolding
- **Files:** `package.json` (create), `tsconfig.json` (create), `next.config.ts` (create), `postcss.config.js` (create), `tailwind.config.ts` (create), `.env.example` (create), `.env.local` (create), `.gitignore` (create)
- **What:** Initialize Next.js 16 + TypeScript project with pnpm. Install core deps: React 19, Supabase SSR, Capacitor, Tailwind, Shadcn prerequisites (clsx, tailwind-merge, class-variance-authority, @radix-ui/react-slot, lucide-react). Configure Tailwind with Codex brand colors (dark navy #050505, Democrat blue #2563EB, Republican red #DC2626, Green #16A34A, Independent purple #7C3AED).
- **Why:** Foundation everything else builds on. Match Apex patterns exactly so both apps share muscle memory.
- **Depends on:** None
- **Complexity:** Straightforward

### Step 2: Core File Structure + Layout
- **Files:** `app/layout.tsx` (create), `app/globals.css` (create), `app/favicon.ico` (create), `lib/utils.ts` (create), `components/ui/button.tsx` (create), `public/manifest.json` (create)
- **What:** Root layout with Instrument Serif + DM Sans fonts (Google Fonts via next/font/google). Global CSS with Codex brand variables + Shadcn HSL variables for both dark and light themes. PWA manifest. The cn() utility. A starter Button component from Shadcn.
- **Why:** Establishes theming, fonts, and component patterns. Codex already has dark/light — we preserve that with CSS variables instead of the inline JS theme object.
- **Depends on:** Step 1
- **Complexity:** Straightforward

### Step 3: Supabase Setup
- **Files:** `lib/supabase/client.ts` (create), `lib/supabase/server.ts` (create), `lib/supabase/service-role.ts` (create), `lib/supabase/middleware.ts` (create), `middleware.ts` (create), `.env.local` (update)
- **What:** Copy Apex's Supabase client pattern exactly — browser client, server client (cookies-based), service-role client, and middleware for session refresh. Configure protected routes for `/dashboard`, `/admin`. Redirect authenticated users away from `/login`.
- **Why:** Auth and data layer. Same proven pattern as Apex.
- **Depends on:** Step 1, Supabase project created (manual step)
- **Complexity:** Straightforward

### Step 4: Database Schema
- **Files:** `supabase/migrations/001_initial_schema.sql` (create)
- **What:** Create the core tables:
  - `politicians` — id, name, slug, state, chamber (enum: senate/house/governor/presidential), party (enum: democrat/republican/green/independent), title, since_year, bio, website_url, donate_url, wiki_url, image_url, created_at, updated_at
  - `profiles` — id (references auth.users), display_name, email, role (enum: user/admin), created_at
  - `follows` — id, user_id (references profiles), politician_id (references politicians), created_at
  - `voting_records` — id, politician_id, bill_name, bill_number, vote (enum: yea/nay/abstain/not_voting), vote_date, session, created_at
  - `bills` — id, number, title, summary, status, introduced_date, last_action_date, congress_session, created_at
  - `campaign_finance` — id, politician_id, cycle, total_raised, total_spent, cash_on_hand, source, last_updated, created_at
  - Enable RLS on all tables. Public read on politicians/bills/voting_records/campaign_finance. Authenticated write on follows. Admin-only write on politicians/bills/voting_records/campaign_finance.
- **Why:** Scalable relational model. Starts manual, structured for API ingestion later.
- **Depends on:** Step 3
- **Complexity:** Straightforward

### Step 5: Seed Data
- **Files:** `supabase/seed.sql` (create)
- **What:** Insert the 16 politicians from the current `POLS` array into the `politicians` table. This is the manual data entry starting point.
- **Why:** Immediate working data without building admin panel first.
- **Depends on:** Step 4
- **Complexity:** Trivial

### Step 6: Public Routes — Directory
- **Files:** `app/(public)/page.tsx` (create), `app/(public)/layout.tsx` (create), `app/(public)/politicians/[slug]/page.tsx` (create), `components/directory/politician-card.tsx` (create), `components/directory/politician-detail.tsx` (create), `components/directory/chamber-tabs.tsx` (create), `components/directory/party-pill.tsx` (create), `components/directory/search-input.tsx` (create), `components/directory/stats-bar.tsx` (create), `components/icons/party-icons.tsx` (create), `components/layout/header.tsx` (create), `components/layout/footer.tsx` (create), `components/layout/theme-toggle.tsx` (create), `lib/constants/parties.ts` (create), `lib/constants/chambers.ts` (create)
- **What:** Rebuild the current Codex UI as proper Next.js server components + client components. Homepage fetches politicians from Supabase server-side. Individual politician pages at `/politicians/[slug]` with full detail (replaces the slide-in panel for SEO — keep the panel for quick-view too). Search uses Supabase full-text search instead of Anthropic API. Chamber tabs filter server-side. All styled with Tailwind replacing the inline styles.
- **Why:** This is the core product. Server-side rendering for SEO. Real database queries. Proper routing.
- **Depends on:** Steps 2, 4, 5
- **Complexity:** Tricky (largest step — most UI work)

### Step 7: Auth Pages
- **Files:** `app/(auth)/login/page.tsx` (create), `app/(auth)/signup/page.tsx` (create), `app/(auth)/forgot-password/page.tsx` (create), `app/(auth)/reset-password/page.tsx` (create), `app/(auth)/layout.tsx` (create), `app/auth/callback/route.ts` (create)
- **What:** Email/password auth flows matching Apex patterns. Minimal UI — Codex branded login/signup forms. OAuth callback handler. Auth layout with centered card.
- **Why:** Users need accounts to follow politicians and get alerts.
- **Depends on:** Step 3
- **Complexity:** Straightforward

### Step 8: Dashboard — User Features
- **Files:** `app/(dashboard)/dashboard/page.tsx` (create), `app/(dashboard)/layout.tsx` (create), `app/(dashboard)/following/page.tsx` (create), `components/dashboard/sidebar.tsx` (create), `components/dashboard/follow-button.tsx` (create)
- **What:** Protected dashboard with sidebar nav. "Following" page shows politicians the user follows. Follow/unfollow button on politician cards and detail pages (writes to `follows` table). Dashboard homepage shows feed of followed politicians' latest activity.
- **Why:** Core user engagement feature. Makes accounts worthwhile.
- **Depends on:** Steps 6, 7
- **Complexity:** Straightforward

### Step 9: Admin Panel
- **Files:** `app/admin/layout.tsx` (create), `app/admin/page.tsx` (create), `app/admin/politicians/page.tsx` (create), `app/admin/politicians/[id]/page.tsx` (create), `app/admin/politicians/new/page.tsx` (create), `app/admin/bills/page.tsx` (create), `app/admin/voting-records/page.tsx` (create), `app/admin/finance/page.tsx` (create), `components/admin/sidebar.tsx` (create), `components/admin/data-table.tsx` (create), `components/admin/politician-form.tsx` (create)
- **What:** Admin-only section (role check in middleware). CRUD for politicians, bills, voting records, campaign finance. Data table component for list views. Form component for create/edit. This is how you manually enter data for now.
- **Why:** "Pull everything manually together" — this is the tool for that.
- **Depends on:** Steps 4, 7
- **Complexity:** Tricky (lots of forms and tables)

### Step 10: Capacitor + iOS Setup
- **Files:** `capacitor.config.ts` (create), `ios/` directory (generated via `cap add ios`)
- **What:** Configure Capacitor pointing to production Codex URL. iOS scheme, dark background, push notification and status bar plugins. Same pattern as Apex's `capacitor.config.ts`.
- **Why:** iOS app distribution.
- **Depends on:** Step 6 (needs a working web app to wrap)
- **Complexity:** Straightforward

### Step 11: Vercel Deployment Config
- **Files:** `vercel.json` (create)
- **What:** Production deployment config. Custom domain setup. Environment variables for Supabase credentials.
- **Why:** Ship it.
- **Depends on:** Step 1
- **Complexity:** Trivial

## Risks
1. **Supabase project setup is manual** — Need to create the project, get credentials, and run migrations before Steps 4-5 work. I'll provide the SQL but you'll need to run it.
2. **Scope creep on politician detail pages** — Voting records, bills, and finance data on politician pages could balloon. Start with just the bio/links view from the prototype, add data tabs incrementally.
3. **Search complexity** — Supabase full-text search works for basic queries but may need pg_trgm or a dedicated search service (Algolia/Meilisearch) as the dataset grows.

## Definition of Done
- [ ] `pnpm dev` runs without errors
- [ ] Homepage renders politician cards from Supabase
- [ ] Individual politician pages work at `/politicians/[slug]`
- [ ] Search filters politicians by name, state, party
- [ ] Chamber tabs filter correctly
- [ ] Dark/light theme toggle works
- [ ] User can sign up, log in, follow/unfollow politicians
- [ ] Admin can CRUD politicians via admin panel
- [ ] Capacitor builds to iOS simulator
- [ ] Deployed to Vercel with working production URL
