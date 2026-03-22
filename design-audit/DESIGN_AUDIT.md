# Design Audit Brief — Civic Engagement App

## Overview
A civic engagement platform tracking 8,471 U.S. politicians across federal, state, and local government. Users can search, compare, follow politicians, take a voter match quiz, and track legislation.

**Tech:** Next.js 16 + React 19 + Tailwind CSS v4 + Supabase
**Design System:** Dark-first, CSS variables (`--codex-*`), serif headings + sans body, minimal/editorial style
**Mobile:** Progressive Web App (Capacitor for iOS/Android)

---

## Pages & Routes

### 1. Homepage (`/`)
**Purpose:** Landing page — search, stats, trending, featured officials, explore links
**Components:**
- Sticky header with party icon branding (elephant + donkey)
- Desktop nav: Directory, Compare, Bills, Elections, Issues, Grades, Polls, Insights
- Search autocomplete with popover (politician photos, party dots, metadata)
- Stats grid: Total Officials, Democratic, Republican, Independent (with counts + party icons)
- Trending section: Most-followed politicians (from `follows` table)
- Featured Officials: 6 curated cards (Trump, Vance, Sanders, Cruz, Pelosi, McConnell)
- Explore section: Voter Match, Compare, Civic Profiles, Issue Map link cards
- Footer (desktop only): party icons + "Built for civic transparency" + theme toggle

**UX Notes:**
- "Match" nav link only visible when logged in (auth-gated feature)
- "Account"/"Sign In" link in top right (desktop)
- Mobile: bottom tab bar (Directory, Elections, Issues, Insights, More)
- Search popover navigates directly to politician profiles on selection

---

### 2. Politician Profile (`/politicians/[slug]`)
**Purpose:** Comprehensive profile for any politician
**Sections (top to bottom):**
- Hero: Photo (160px mobile, 340px desktop), name, party pill, follow/like buttons, social links, compare button
- Metadata: State, Chamber, Since Year
- Party Alignment gauge (0-100% bar)
- Civic Profile (auth-gated): Score ring (0-100), tier label (Highly Active/Engaged/Moderate/etc.), quick stats (Issues/Votes/Committees/Years), dimension cards with insights
- Breaks from Party Line: Issues where they deviate from party default
- Votes vs Stances: Accountability score — % of votes matching stated positions, with contradiction list
- Like-Minded Officials: 6 similar politicians by stance overlap
- Committee Memberships
- Voting History: Recent votes with bill names and yea/nay badges
- Campaign Finance: Bars for raised/spent/cash by cycle
- Election History: Win/loss record with vote percentages

**UX Notes:**
- Non-authenticated users see "Sign up to see the full report card" CTA instead of Civic Profile
- Photo is grayscale(20%) for editorial feel
- All stances use color-coded badges (green=supports, red=opposes, yellow=mixed)

---

### 3. Compare Page (`/compare`)
**Purpose:** Side-by-side comparison of any two politicians
**Components:**
- Two search autocomplete inputs (Official A / Official B) with swap button
- Profile cards: Avatar, party alignment bar, stance breakdown, type label
- Issue Agreement meter: Green/red bar with agree/disagree counts
- Issue Positions table: Side-by-side stance badges per issue (color-coded)
- Background Comparison: Title, State, Chamber, Party, Years in Office table
- Campaign Finance: Indigo/orange horizontal bars (Total Raised, Spent, Cash on Hand)
- Voting Record Overlap: Agreement % bar + shared bill vote list
- Election History: Win/loss records side-by-side
- Shared Committees

**UX Notes:**
- Uses fixed indigo/orange colors for finance bars (works for same-party comparisons)
- Empty states for missing data sections
- "Compare" links appear throughout the app (profiles, match results, race pages)

---

### 4. Voter Match Quiz (`/match`)
**Purpose:** 14-question quiz matching users to politicians by stance alignment
**Flow:**
1. Progress bar (Question X of 14, percentage)
2. Issue icon + name + description
3. 7 stance buttons: Strongly Supports → Strongly Opposes
4. Skip option + Back/Next navigation
5. "See My Matches" on last question (requires 3+ answers)
6. Results: Top 3 "podium" cards + remaining in compact list
7. Share Results + Retake Quiz buttons

**UX Notes:**
- Auth-gated (only visible in nav when logged in)
- Scoring uses distance-decay algorithm (same as party alignment)
- Share button uses native Web Share API with clipboard fallback
- OG image generated at `/api/og/match` for social sharing

---

### 5. Issues Index (`/issues`)
**Purpose:** Browse all 14 tracked political issues
**Layout:** Grid of issue cards with icons, stance breakdown bars, party statistics

---

### 6. Issue Detail (`/issues/[slug]`)
**Purpose:** All politicians and their stances on a specific issue
**Components:**
- Summary stats: Support/Oppose/Mixed/Total counts
- Party breakdown bars (Democratic/Republican/Independent)
- Filters: Party + Chamber
- Paginated politician list grouped by stance (50 per page)
- Each politician: avatar, name, party, title, stance summary

---

### 7. Issue Map (`/issues/map`)
**Purpose:** Interactive US map colored by state stance averages
**Components:**
- Issue selector dropdown with icons
- SVG US map (real geographic state shapes from MapSVG data)
- Color scale: green (supports) → gray (neutral) → red (opposes)
- 7-tier color legend
- Click state → detail panel with individual politicians and their stances

**UX Notes:**
- Only includes federal politicians (senate/house/governor) for performance
- ~2 second load time

---

### 8. Elections (`/elections`)
**Purpose:** Browse active and upcoming elections
**Features:** Election cards with date, race count, status badges

---

### 9. Election Detail (`/elections/[slug]`)
**Purpose:** Individual race with candidates
**Components:**
- Election date + countdown timer (live, updates every minute/second)
- Party breakdown bar
- Candidate Issue Comparison: Side-by-side stance badges when 2+ candidates have stances
- "Full Comparison" link to /compare for politician-linked candidates
- Individual candidate cards: photo, party, bio, stance bar, alignment, links

---

### 10. Bills (`/bills`)
**Purpose:** Browse tracked legislation
**Features:** Bill cards with number, title, status badge, date
**Bill Detail:** Full summary + voting records + follow/bookmark button (auth-gated)

---

### 11. Civic Profiles (`/report-cards`)
**Purpose:** All politicians ranked by civic activity score
**Components:**
- Chamber tabs: All, Senate, House, Governor
- Party filter: All, Democratic, Republican, Independent
- Result count
- Ranked list: rank number, avatar, name, party + state, mini dimension bars (BP/EN/TR/EF), colored score
- Pagination (50 per page)

**Scoring dimensions:**
- Bipartisanship: How often they break from party line
- Engagement: Voting attendance (yea/nay vs abstain)
- Transparency: Stance coverage + verification
- Effectiveness: Committee involvement + leadership

---

### 12. Insights (`/insights`)
**Purpose:** Data visualizations and analysis
**Visualizations:**
- Chamber Composition (hemicycle chart)
- Issue Heatmap (party × issue grid)
- Party Alignment Spectrum (scatter plot)
- Bipartisan Score Card (ranked bars)
- Explore More section: Issue Map, Money Map, Report Cards link cards

---

### 13. Money Map (`/insights/money-map`)
**Purpose:** Campaign finance by state on interactive US map
**Components:**
- Metric selector: Total Raised / Total Spent / Cash on Hand
- US map with heat map colors (yellow → orange → red by percentile)
- Click state → detail panel with state totals + politician breakdown list

---

### 14. Directory (`/directory`)
**Purpose:** Full browsable list of all politicians with filters
**Features:**
- Search autocomplete
- State/party/chamber URL filters
- Paginated results (50 per page)
- Linked from dashboard "View all" for state representatives

---

### 15. Polls (`/polls`)
**Purpose:** Community polls on political topics
**Types:** Approval, Matchup, Issue polls

---

### 16. Login (`/login`)
**Components:** Email/password form + "Continue with Google" OAuth button + party icon branding
**Links:** Create account, Forgot password

### 17. Signup (`/signup`)
**Components:** Display name, email, password form + Google OAuth
**Post-signup:** Redirects to onboarding wizard

### 18. Forgot/Reset Password (`/forgot-password`, `/reset-password`)
**Standard:** Email input → reset link → new password form

---

### 19. Onboarding (`/onboarding`)
**Purpose:** 3-step post-signup wizard (auth-gated)
1. "Where do you live?" — State selector (saved to profile)
2. "What issues matter?" — Toggle 3-5 issues from grid (saved to localStorage)
3. "Find your match" — CTA to take quiz or skip to dashboard

---

### 20. Dashboard (`/dashboard`)
**Purpose:** Personalized home for logged-in users
**Sections:**
- Your Representatives (based on state + zip → district lookup)
- Quick Links: Voter Match, Report Cards, Issue Map, Money Map
- Recent Activity: Vote feed from followed politicians
- Saved Bills: Bookmarked legislation with status badges
- Upcoming Election: Countdown timer to next election
- Following: List of followed politicians

**Mobile:** Bottom tabs switch to account context (Home, Following, Settings, More)
**More menu:** Links back to public pages (Directory, Elections, Issues, Insights) + Sign Out

---

### 21. Account Settings (`/account`)
**Sections:**
- Profile: Avatar upload (with camera hover overlay), email (read-only), display name, state, zip code, bio, notifications toggle
- Change Password
- Danger Zone: Account deletion with confirmation dialog

---

## Design System

### Colors (CSS Variables)
- `--codex-text`: Primary text
- `--codex-sub`: Secondary text
- `--codex-faint`: Tertiary/disabled text
- `--codex-border`: Borders
- `--codex-card`: Card backgrounds
- `--codex-hover`: Hover states
- `--codex-bg`: Page background
- `--codex-input-bg`, `--codex-input-border`, `--codex-input-focus`: Form inputs

### Party Colors
- Democratic: `#2563EB` (blue)
- Republican: `#DC2626` (red)
- Independent: `#7C3AED` (purple)
- Green: `#16A34A`

### Typography
- Headings: `font-serif` (editorial feel)
- Body: `font-sans`
- Section headers: `text-[12px] font-medium uppercase tracking-[0.12-0.15em] text-[var(--codex-sub)]`

### Stance Colors
- Strongly Supports: `#10B981` (emerald)
- Supports: `#22C55E` (green)
- Leans Support: `#84CC16` (lime)
- Neutral: `#9CA3AF` (gray)
- Mixed: `#EAB308` (yellow)
- Leans Oppose: `#F97316` (orange)
- Opposes: `#EF4444` (red)
- Strongly Opposes: `#E11D48` (rose)

### Common Patterns
- Cards: `rounded-md border border-[var(--codex-border)]` or `rounded-lg`
- Badges: Colored text + matching alpha background (`color: X, background: X18`)
- Buttons: Black fill for primary, border for secondary
- Avatar: Rounded with party-colored border
- Party indicators: Small colored dot + party icon

---

## Key UX Patterns

### Auth Gating
- Voter Match: Nav link hidden unless logged in
- Civic Profile: Shows "Sign up" CTA for non-auth users
- Bill following: Redirects to login
- Dashboard features: Route-protected via middleware

### Navigation
- Desktop: Sticky top nav with all links + Account/Sign In
- Mobile: Bottom tab bar (5 tabs + More menu)
- Dashboard mobile: Context-switched tabs (Home, Following, Settings, More → back to public)

### Data Display
- Stats use serif font for numbers
- Party breakdown uses colored proportional bars
- Stance badges are consistent color-coded pills throughout
- Empty states: Serif heading + descriptive text + CTA when applicable

---

## Known Issues for Design Review

1. **Header nav overflow**: Too many links on smaller desktop screens (Directory, Compare, Match, Bills, Elections, Issues, Grades, Polls, Insights, Account)
2. **Beta disclaimer banner**: Takes up significant space on every page
3. **Featured officials hardcoded**: Should be dynamic or editable
4. **Trending section**: Only shows 1 politician when few follows exist
5. **Branding TBD**: Currently icons-only, name being decided
6. **Issue Map load time**: ~2s on first visit while fetching all stance data
7. **Civic Profile gating**: Transition between gated/ungated could be smoother
8. **Mobile "More" menu**: Contains many links, could use better organization
9. **Compare page on mobile**: Lots of horizontal data that needs responsive attention
10. **Directory page**: Minimal — needs filter UI (currently only URL params)
