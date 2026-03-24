# Implementation Plan: Poli Phase 2 — Full Platform Expansion

## Goal
Expand Poli from a basic directory into a comprehensive civic engagement platform with full admin CRUD, user polls/likes, account management, all 535+ Congress members + governors, and voter-useful data (issues, voting records, campaign finance).

## Audit Findings to Fix
- Admin routes unprotected (no role check)
- Missing reset-password page
- Missing admin pages for bills, voting records, campaign finance
- Duplicated code (slugify, US_STATES, form field styles)
- FollowButton missing error handling
- No error boundaries

## Phase 2 Steps

### Step 1: Security & Bug Fixes
- **Files:** `lib/supabase/middleware.ts` (modify), `app/(auth)/reset-password/page.tsx` (create), `lib/constants/us-states.ts` (create), `lib/utils.ts` (modify), `components/directory/follow-button.tsx` (modify), `app/not-found.tsx` (create), `app/error.tsx` (create)
- **What:** Add admin role check in middleware (fetch profile, verify role='admin' for /admin routes). Create reset-password page. Extract shared utilities (slugify, US_STATES). Add error handling to FollowButton. Add global 404 and error pages.
- **Complexity:** Straightforward

### Step 2: Database Schema Expansion
- **Files:** `supabase/002_phase2_schema.sql` (create)
- **What:** New tables:
  - `likes` — user_id, politician_id, unique constraint (simple like/unlike)
  - `polls` — id, title, description, type (approval/matchup/issue), chamber_filter, state_filter, status (active/closed), created_by, starts_at, ends_at, created_at
  - `poll_options` — id, poll_id, label, politician_id (nullable), position (nullable), sort_order
  - `poll_votes` — id, poll_id, option_id, user_id, unique(poll_id, user_id)
  - `issues` — id, name, slug, description, category (economy/healthcare/immigration/education/defense/environment/justice/foreign_policy/technology/social)
  - `politician_issues` — id, politician_id, issue_id, stance (supports/opposes/mixed/unknown), summary, source_url
  - `committees` — id, name, chamber, type (standing/select/joint)
  - `politician_committees` — politician_id, committee_id, role (chair/ranking_member/member)
  - Update `profiles` — add avatar_url, bio, state, notifications_enabled
  - RLS: likes/poll_votes = user manages own. polls = admin create, public read. issues/committees = admin write, public read.
- **Complexity:** Straightforward

### Step 3: Comprehensive Seed Data — All Politicians
- **Files:** `supabase/seed_all_politicians.sql` (create), `supabase/seed_issues.sql` (create), `supabase/seed_committees.sql` (create)
- **What:** SQL inserts for:
  - All 100 U.S. Senators (current 119th Congress)
  - All 435 U.S. Representatives (top ~100 most notable to start, expandable)
  - All 50 Governors
  - Key 2024/2028 Presidential candidates
  - 10 core policy issues with descriptions
  - Major committees (Senate and House)
- **Complexity:** Tricky (lots of data, must be accurate)

### Step 4: User Account Pages
- **Files:** `app/(dashboard)/account/page.tsx` (create), `app/(dashboard)/account/edit/page.tsx` (create), `components/account/profile-form.tsx` (create), `components/account/change-password.tsx` (create), `app/(dashboard)/layout.tsx` (modify — add Account nav item)
- **What:** User account page showing profile info, email, state. Edit page with form for display_name, bio, state, avatar_url. Change password form. Update dashboard nav to include Account link.
- **Complexity:** Straightforward

### Step 5: Like System
- **Files:** `components/directory/like-button.tsx` (create), `app/(public)/politicians/[slug]/page.tsx` (modify), `components/directory/politician-card.tsx` (modify), `app/api/likes/route.ts` (create)
- **What:** Heart/thumbs-up button on politician cards and detail pages. Shows like count. Toggles on click (inserts/deletes from likes table). API route for like toggle with auth check. Display like counts on cards. Unlike follow (private), likes are public — show aggregate count.
- **Complexity:** Straightforward

### Step 6: Polls System
- **Files:** `app/(public)/polls/page.tsx` (create), `app/(public)/polls/[id]/page.tsx` (create), `components/polls/poll-card.tsx` (create), `components/polls/poll-vote-form.tsx` (create), `components/polls/poll-results.tsx` (create), `app/admin/polls/page.tsx` (create), `app/admin/polls/new/page.tsx` (create), `app/admin/polls/[id]/page.tsx` (create), `components/admin/poll-form.tsx` (create)
- **What:** Public polls page showing active polls. Three poll types:
  - **Approval** — "Do you approve of [Politician]'s job performance?" (Yes/No)
  - **Matchup** — "Who would you vote for: [A] vs [B]?" (pick one)
  - **Issue** — "What's the most important issue facing [State/Country]?" (pick from list)
  Users vote once per poll (enforced by unique constraint). Results shown as bar charts after voting. Admin can create/manage polls with start/end dates, filter by chamber/state. Polls page linked from main nav.
- **Complexity:** Tricky

### Step 7: Issues & Stances on Politician Pages
- **Files:** `app/(public)/politicians/[slug]/page.tsx` (modify — add tabs), `app/(public)/issues/page.tsx` (create), `app/(public)/issues/[slug]/page.tsx` (create), `components/directory/politician-tabs.tsx` (create), `components/directory/issue-stance-card.tsx` (create), `components/directory/voting-record-table.tsx` (create), `components/directory/finance-summary.tsx` (create)
- **What:** Expand politician detail pages with tabbed interface:
  - **Overview** — current bio, links, stats (what exists now)
  - **Issues** — grid of issue cards showing politician's stance (supports/opposes/mixed) with source links
  - **Voting Record** — table of recent votes (bill name, date, vote yea/nay)
  - **Campaign Finance** — total raised/spent/cash on hand by cycle, source attribution
  - **Committees** — list of committee memberships with role

  Issues index page at `/issues` listing all categories. Individual issue page at `/issues/[slug]` showing all politicians' stances on that issue.
- **Complexity:** Tricky

### Step 8: Full Admin CRUD — Bills, Voting Records, Finance, Issues, Polls
- **Files:** `app/admin/bills/page.tsx` (create), `app/admin/bills/new/page.tsx` (create), `app/admin/bills/[id]/page.tsx` (create), `app/admin/voting-records/page.tsx` (create), `app/admin/voting-records/new/page.tsx` (create), `app/admin/finance/page.tsx` (create), `app/admin/finance/new/page.tsx` (create), `app/admin/issues/page.tsx` (create), `app/admin/issues/[id]/page.tsx` (create), `app/admin/users/page.tsx` (create), `components/admin/bill-form.tsx` (create), `components/admin/voting-record-form.tsx` (create), `components/admin/finance-form.tsx` (create), `components/admin/issue-form.tsx` (create), `app/admin/layout.tsx` (modify — add new nav items)
- **What:** Complete admin CRUD for every data type. Bills: number, title, summary, status, dates. Voting records: select politician + bill, vote type, date. Campaign finance: select politician, cycle, amounts. Issues: name, category, description. Politician stances: select politician + issue, stance, summary, source. User management: list users, promote to admin. Update admin sidebar nav with all sections.
- **Complexity:** Tricky (lots of forms but repetitive pattern)

### Step 9: Admin Account Page
- **Files:** `app/admin/account/page.tsx` (create), `app/admin/layout.tsx` (modify)
- **What:** Admin account page showing admin user info, ability to change password, view role. Add to admin sidebar nav.
- **Complexity:** Trivial

### Step 10: Navigation & Homepage Updates
- **Files:** `components/layout/header.tsx` (modify), `app/(public)/page.tsx` (modify), `app/(public)/layout.tsx` (modify)
- **What:** Add Polls and Issues links to main nav header. Add "Popular Polls" and "Key Issues" sections to homepage below the politician directory. Update hero copy if needed.
- **Complexity:** Straightforward

## Risks
1. **Data accuracy** — Seeding 535+ politicians with correct current data is error-prone. Start with Senators and Governors (150), expand to House later.
2. **Poll abuse** — Users could create multiple accounts to vote multiple times. Mitigate with email verification requirement before voting.
3. **Admin CRUD volume** — 8 admin sections with CRUD is a lot of forms. Use consistent patterns and shared components to stay DRY.

## Definition of Done
- [ ] Admin routes require admin role
- [ ] Reset password flow works end-to-end
- [ ] All 100 Senators + 50 Governors in database
- [ ] User can like politicians (public count visible)
- [ ] User can vote in polls (one vote per poll)
- [ ] Admin can create/manage polls
- [ ] Politician pages show issues/stances, voting records, finance, committees
- [ ] `/issues` and `/issues/[slug]` pages work
- [ ] `/polls` and `/polls/[id]` pages work
- [ ] Admin CRUD for all data types (bills, votes, finance, issues, polls, users)
- [ ] User and admin account pages work
- [ ] Build passes clean
