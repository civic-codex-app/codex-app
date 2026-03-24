# Poli App — Project Memory

## What This Is
Poli is a **civic engagement platform** that tracks U.S. politicians, their stances on issues, voting records, campaign finance, elections, and candidates. The goal is transparent, data-driven political information for voters.

**Live URL:** Deployed via Vercel (Next.js)
**Supabase project:** `jzxgkvwbhdagqwvisxkt`

## Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Database:** Supabase (PostgreSQL) with Row-Level Security
- **Styling:** Tailwind CSS v4 — dark-first design, CSS variables (`--poli-*`)
- **Mobile:** Capacitor (iOS/Android shell wrapping the web app)
- **Package manager:** pnpm
- **Visualizations:** Pure SVG + CSS (no charting library)
- **Fonts:** Serif (headings) + Sans (body), design is minimal/editorial

## Key Patterns

### Next.js App Router
- All public pages under `app/(public)/`
- Admin pages under `app/admin/`
- Dashboard pages under `app/(dashboard)/`
- Auth pages under `app/(auth)/`
- `params` is a **Promise** in Next.js 16 — always `await params`
- Server components by default; `'use client'` only when needed

### Supabase
- Service role client at `lib/supabase/service-role.ts` — for server-side data fetching
- **1000-row limit:** Supabase caps `.select()` at 1000 rows. Must paginate with `.range(from, from + PAGE - 1)` in a loop. `.limit(5000)` does NOT override this.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- For seed scripts (.mjs files), must `export $(grep -v '^#' .env.local | xargs)` before running with `node`

### Design System
- Color tokens: `--poli-text`, `--poli-sub`, `--poli-faint`, `--poli-border`, `--poli-card`, `--poli-hover`, `--poli-badge-bg`, `--poli-badge-text`, `--poli-input-border`
- Typography: `font-serif` for headings, `text-[clamp(...)]` for responsive sizing
- Section headers: `text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]`
- Party colors via `partyColor()` from `lib/constants/parties.ts`

## Database Schema (Key Tables)

### Core
- **politicians** — id, name, slug, state, chamber, party, title, image_url, bio, website_url, twitter_handle, facebook_url, instagram_url, youtube_url
- **issues** — id, name, slug, description, category, icon (Lucide icon name)
- **politician_issues** — politician_id, issue_id, stance (7-point scale), summary, source_url, is_verified

### Elections
- **elections** — id, name, slug, election_date, description, is_active
- **races** — id, election_id, name, slug, state, chamber, district, description, incumbent_id
- **candidates** — id, race_id, politician_id (nullable), name, party, is_incumbent, status, website_url, image_url, bio
- **candidate_issues** — candidate_id, issue_id, stance, summary, source_url, is_verified
- **election_results** — politician_id, election_year, state, chamber, district, race_name, party, result, vote_percentage, total_votes, opponent info

### Other
- **bills**, **voting_records**, **campaign_finance**, **committees**, **politician_committees**
- **likes**, **follows**, **polls**, **poll_options**, **poll_votes**
- **profiles** — extends Supabase auth.users

### Enums
- **stance_type:** `strongly_supports | supports | leans_support | neutral | mixed | leans_oppose | opposes | strongly_opposes | unknown` (7-point intensity scale)
- **chamber_type:** `senate | house | governor | presidential | mayor | city_council | state_senate | state_house | county | school_board | other_local`
- **party_type:** `democrat | republican | green | independent`
- **result_type:** `won | lost | runoff`

## Shared Utilities

### `lib/utils/stances.ts`
Central stance definitions used everywhere:
- `STANCE_STYLES` — bg, text, label, color, shortLabel for each stance type
- `STANCE_NUMERIC` — 0-6 scale for alignment scoring and radar charts
- `STANCE_ORDER` — canonical display order
- `stanceStyle(stance)` — safe lookup with fallback to unknown
- `stanceBucket(stance)` — collapses intensity to supports/opposes/neutral/mixed/unknown

### `lib/utils/alignment.ts`
- `computeAlignment(party, stances)` — 0-100 score using numeric distance
- `getPartyDefault(party, issueSlug)` — canonical party position per issue
- `alignmentMeta(score)` — label + color for alignment tiers
- `PARTY_DEFAULTS` — per-party default stances on all 14 issues (uses intensity values)

### `lib/constants/parties.ts`
- `partyColor(party)` — hex color for each party
- `partyLabel(party)` — display name

### `lib/constants/chambers.ts`
- `CHAMBER_LABELS` — display names for chamber types

## Data Status
- **271 politicians** in DB (100 Senators, ~100 House members, 50 Governors, Cabinet/Presidential)
- **3,794 stances** across 14 issues — migrated to 7-point intensity scale
- **276 election results** (historical)
- **206 campaign finance records** (real FEC data)
- **Social media links** for 271 politicians (real Twitter/Facebook/Instagram/YouTube)
- **2026 Midterms:** 33 Senate + 435 House + 35 Governor + 83 local = **586 total races**
- **Candidates:** 146 (Senate/Gov) + 171 (local) = **317 candidates** seeded
- **Local races:** 10 mayoral, 18 county, 20 state senate, 20 state house, 15 school board

## SQL Migrations (in order)
Run in Supabase SQL Editor. Each is idempotent:
1. `001_initial_schema.sql` — base tables, enums, RLS
2. `002_phase2_schema.sql` — polls, issues, committees, likes
3. `003_fix_rls_recursion.sql`
4. `004_elections_schema.sql` — elections, races, candidates
5. `005_social_media.sql` — social media columns on politicians
6. `006_candidate_issues.sql` — stance tracking for candidates
7. `007_election_results.sql` — historical results
8. `008_stance_verified.sql` — is_verified flag on politician_issues
9. `009_stance_intensity.sql` — expand stance_type to 7-point scale
10. `010_local_chambers.sql` — add mayor, city_council, state_senate, state_house, county, school_board, other_local

## Key Pages
| Route | Description |
|-------|-------------|
| `/` | Homepage — featured politicians, stats, search |
| `/politicians/[slug]` | Politician profile — stances, alignment, voting, finance, elections |
| `/issues` | Issues index with stance breakdowns |
| `/issues/[slug]` | Single issue — all politicians grouped by stance |
| `/insights` | Data visualizations — chamber composition, heatmap, spectrum, bipartisan index |
| `/elections/[slug]` | Election detail — races and candidates |
| `/candidates/[id]` | Candidate profile (redirects to politician if linked) |
| `/compare` | Side-by-side politician comparison with radar chart |
| `/polls` | Community polls |
| `/bills` | Legislative bills tracker |

## Visualization Components (all pure SVG, no libraries)
- `ChamberComposition` — parliament-style hemicycle
- `IssueHeatmap` — grid of issues × parties with stacked stance bars
- `PartyAlignmentSpectrum` — scatter plot of politicians on 0-100 alignment scale
- `BipartisanScoreCard` — ranked list with horizontal bars
- `IssueRadar` — spider chart comparing two politicians across 14 issues
- `StanceSunburst` — animated donut chart of stance breakdown
- `ElectionTimeline` — vertical timeline for election history

## Common Gotchas
1. **Supabase 1000-row limit** — always paginate with `.range()` loop
2. **Node scripts with env vars** — use `export $(grep -v '^#' .env.local | xargs)` before running `.mjs` files
3. **Shell `!` in node -e** — bash interprets `!` in double-quoted strings. Use `.mjs` script files instead of inline `node -e`
4. **Agent token limits** — single agents choke on very large outputs (>32K tokens). Split into multiple smaller parallel agents
5. **chamber_type for local** — recently expanded; some UI components may still only handle senate/house/governor
6. **stance bucketing** — when aggregating for charts, use `stanceBucket()` to collapse intensity into 4 categories
7. **Tailwind v4** — uses CSS-first config, not `tailwind.config.js`

## Pending / TODO
- [ ] Admin CRUD for elections/races/candidates
- [ ] R2 bucket integration for image storage
- [ ] Capacitor production URL configuration
- [ ] More House member data (only ~100 of 435 in politicians table)
- [ ] Replace `<img>` with Next.js `<Image>` component
- [ ] Add Zod validation to admin forms
- [ ] Schema.org JSON-LD structured data for politician pages
- [ ] OG image generation for social sharing
