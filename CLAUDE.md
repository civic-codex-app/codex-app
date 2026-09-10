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

## Data Status (verified 2026-09-09)
- **8,584 politicians** (4,610 state house, 1,982 state senate, 440 US House, 100 Senate, 55 governor, 383 other local, 376 county, 260 city council, 210 mayor, 148 school board, 20 presidential)
- **668 races** for the 2026 midterms across 52 election records (all dated 2026-11-03)
- **531 candidates** — 526 `running`, 5 `withdrawn`
- **1,893 campaign finance rows** — all real FEC API data, cycles 2018/2020/2022/2024/2026
- **175 bills** — all real Congress.gov data for the 119th Congress
- **0 voting records** — see Data Integrity below
- **0 election results** — all 271 were deleted 2026-09-10 as fabricated (see below)
- **22 issues** and **~188,848 `politician_issues` rows** (8,584 politicians × 22 issues)

> The figures "3,794 stances across 14 issues" appeared here for a long time and
> were stale by ~50x. Two live bugs came from trusting them: `/insights` sized its
> fetch batches as `70 × 14 = 980` and so silently lost 33.5% of all stances to
> Supabase's 1,000-row cap, and an attempt to count stances in the app timed out
> at 20s+. **Re-count before sizing any query against these numbers.**

## Data Integrity — READ BEFORE SEEDING ANYTHING

An audit on 2026-09-09 found that large parts of the original seed were
**fabricated data presented as fact**. This is a voter-facing civic site; that is
the most serious class of bug here, worse than missing or stale data.

What was found and done:
- **bills** — ~73% of 118 rows paired a real bill number with the wrong title
  (`S.1` stored as "For the People Act of 2023" when S.1 is the Freedom to Vote
  Act; `S.14` stored as the "Laken Riley Act" when S.14 does not exist and the
  real one is S.5). Replaced with 175 real bills via
  `scripts/rebuild-bills-from-congress.mjs`.
- **voting_records** — all 3,838 rows joined to those bad bills and referenced
  only 49 distinct bills across 43 dates, so real members were shown voting on
  misidentified legislation. Deleted. Not rebuilt: Congress.gov exposes House
  roll calls only (beta `/house-vote`), and Senate roll calls exist solely as XML
  on senate.gov, so a single-source rebuild would look complete while omitting
  the Senate.
- **campaign_finance** — 199 rows sourced `"FEC/OpenSecrets (approximate)"` were
  invented estimates, clustering at 0.58–0.73x of real filings (Cruz $73.6M
  stored vs $107.1M actual). Replaced with real FEC data; the 62 that FEC cannot
  verify (mostly governors, who file with state agencies) were deleted.
- **candidates** — the 2026 roster was machine-generated assuming *every
  incumbent seeks reelection*. False for retirements, members seeking another
  office, and primary losers. Five senators who announced 2025 retirements
  (McConnell, Durbin, Smith, Peters, Shaheen) were listed as active candidates in
  their own open-seat races; corrected to `withdrawn`.

Rules going forward:
1. Never seed politician, bill, vote, or finance data from model recollection.
   Use the FEC and Congress.gov APIs, or leave the row absent.
2. Stamp every imported row with its real `source` and the upstream coverage
   date, so vintage is auditable (see how the FEC importer builds `source`).
3. `candidates.is_verified` is true **only** for rows confirmed against an
   authoritative source. Seed-generated rows stay false.
4. Missing data beats invented data. An empty section is honest; a fabricated
   one is not.

### Second audit — 2026-09-10

- **election_results** — the 271 rows flagged suspect above were confirmed
  fabricated and deleted. The decisive signal: **269 of 271 `total_votes` were
  exact multiples of 1000** (288,000; 2,900,000; 11,400,000). `source` was NULL
  on all of them, 20 named the opponent "Various", one row's `result`
  contradicted its own percentages, and a FL presidential row carried national
  popular-vote totals. JSON backup written locally before deletion; see
  `scripts/purge-fabricated-election-results.mjs`.
- **politician_issues `is_verified`** — 13,558 rows claimed verification with
  **zero `source_url`**, because `scripts/generate-stances.mjs` hardcodes
  `is_verified: true` (line 73). All cleared via
  `scripts/unverify-unsourced-stances.mjs`. Note this does NOT change match
  scores: voter-match weights verified 1.0 / estimated 0.5, but the multiplier
  applies to numerator and denominator alike, so a uniform flag cancels out.
  There is a test pinning that.
- **report card "Engagement"** — was `isExecutive ? -1 : 60`. `voting_records`
  is empty, so the real branch never ran and every legislator was shown a
  hardcoded 60 as a measured score — a quarter of each grade. Now excluded
  when there are no votes.
- **`/report-cards` 1000-row truncation** — batch was sized `70 × ~14 issues`
  while the catalog is 22, so each query asked for 1,540 and silently got
  1,000. ~35% of stances discarded. Same bug as `/insights`. Fixed.

### The stance data — decided, not resolved

All **188,848** `politician_issues` rows are template-generated: 8,584
politicians × 22 issues, every one a definite position with a written summary,
and **not one `unknown`**. The summaries are templates with a name substituted
(a San Antonio ISD school board president holds a stance on Foreign Policy &
Diplomacy). 175,318 of those rows belong to state/local officials for whom
most of the catalog is outside their office entirely.

**Decision (2026-09-10): keep the data, label it everywhere.** Deletion was
considered and declined. That makes the labelling the safeguard, so:

- Every surface rendering a stance must show `EstimatedStanceNote`
  (`components/ui/estimated-stance-note.tsx`). Profiles use their own `Est.`
  badge, driven off `is_verified`.
- Do not reintroduce copy claiming this data is sourced. `/insights` used to
  say "Everything here is based on real data from official records", which was
  false for its stance-derived charts.

### Still unverified
- 526 `running` candidates are seed-generated (`is_verified = false`). 2026
  primary outcomes are unconfirmed — no free API covers them; needs state SoS,
  AP, or Ballotpedia.
- 196 races have no `incumbent_id` (mostly local: state house/senate, mayor,
  county, school board) and 172 races have zero candidates.
- The retirement list in `scripts/destale-2026.mjs` is hand-verified but **not
  exhaustive**.

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
11. …`011`–`023` — incremental features (profile fields, annotations, analytics, quizzes, site settings, indexes, submissions)
12. `024_candidate_verification.sql` — `candidates.is_verified`/`last_checked`, normalizes off-vocabulary `status`, and adds a CHECK locking it to `running|withdrawn|won|lost`

## Data Refresh Scripts
All are dry-run by default; pass `--apply` to write. Prefix with
`export $(grep -v '^#' .env.local | xargs)`.

| Script | Purpose |
|---|---|
| `scripts/destale-2026.mjs` | Derivable-only fixes: race incumbents via `(state, chamber, district)`, candidate→politician links, expired polls, status vocabulary, known retirements |
| `scripts/import-fec-finance.mjs` | Real FEC finance. `--cycle=2026 --office=S,H,P`. Caches responses to `.fec-cache/` |
| `scripts/rebuild-bills-from-congress.mjs` | Real 119th-Congress bills from Congress.gov (`--scan`, `--active`) |

Required keys in `.env.local`: `FEC_API_KEY` ([api.data.gov/signup](https://api.data.gov/signup/), 60/hr)
and `CONGRESS_API_KEY` ([api.congress.gov/sign-up](https://api.congress.gov/sign-up/), 20,000/hr).

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
