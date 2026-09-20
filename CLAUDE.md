# Poli App — Project Memory

## What This Is
Poli is a **civic engagement platform** that tracks U.S. politicians, their stances on issues, voting records, campaign finance, elections, and candidates. The goal is transparent, data-driven political information for voters.

**Live URL:** Deployed via Vercel (Next.js)
**Supabase project:** `jzxgkvwbhdagqwvisxkt`

## Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Database:** Supabase (PostgreSQL) with Row-Level Security
- **Styling:** Tailwind CSS **v3.4** with `tailwind.config.ts`, `darkMode: ['class']`,
  CSS variables (`--poli-*`). **Light is the default theme.** Bare `:root` is the
  light palette and `:root.dark` overrides it; the app goes dark only when the
  theme toggle has written `poli-theme` to localStorage. Do not reintroduce a
  `prefers-color-scheme` fallback — it used to sit in three places at once and
  gave every visitor with a dark phone a dark app they had never chosen. This
  line said "dark-first design" for a long time, which is how that survived.
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
- **8,617 politicians** (536 `is_verified` against Congress.gov, 2026-09-16) (4,610 state house, 1,982 state senate, 440 US House, 100 Senate, 55 governor, 383 other local, 376 county, 260 city council, 210 mayor, 148 school board, 20 presidential)
- **668 races** for the 2026 midterms across 52 election records (all dated 2026-11-03)
- **2,829 candidates** — 2,510 `is_verified` from FEC filings (imported 2026-09-16),
  the rest seed-generated and unverified
- **1,893 campaign finance rows** — all real FEC API data, cycles 2018/2020/2022/2024/2026
- **175 bills** — all real Congress.gov data for the 119th Congress. All 175
  re-verified title-by-title against the API on 2026-09-14: zero mismatches.
  (`scripts/verify-bills-against-congress.mjs`. Note `congress_session` is the
  string `"119th"`, so anything building an API path from it must parse the
  integer first, and two rows store the number flattened as `HCONRES.58`.)
- **0 voting records** — see Data Integrity below
- **0 election results** — all 271 were deleted 2026-09-10 as fabricated (see below)
- **22 issues** and **~188,848 `politician_issues` rows** (8,584 politicians × 22 issues)
- **5,501 politicians and 268 candidates with a photo.** All but 48 serve
  from **`cdn.getpoli.app`**, our own R2 bucket behind a custom domain
  (migrated 2026-09-19; 579 dead URLs were nulled on 2026-09-17 first). The
  48 keep working external URLs: malegislature.gov was returning 503
  site-wide (37), camara.pr.gov and njleg.state.nj.us refuse connections (7),
  one legis.ga.gov portrait will not decode, a few are rate-limited. Re-run
  the migration to pick them up.

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

### Security — 2026-09-15

**`daily_topics` and `daily_topic_politicians` accept anonymous writes.**
Confirmed against the live database: an anonymous INSERT succeeded, an
anonymous UPDATE changed a row's title, an anonymous DELETE removed it.
`daily_topics` is the homepage "Today in Politics" strip, so this is content
injection and removal on a voter-facing site by anyone holding the anon key —
which ships in the client bundle. Probe rows were removed immediately.

Cause, in `013_daily_topics.sql`:

```sql
CREATE POLICY "Service role full access topics" ON daily_topics
  FOR ALL USING (true) WITH CHECK (true);
```

Named for the service role, but with no `TO` clause it applies to every role
including `anon`, and `FOR ALL` covers all three write verbs. The service role
bypasses RLS entirely and never needed a policy. `029` replaces both with
admin-only writes. **Applied 2026-09-16.** Verified after: `pg_policies` shows
0 world-writable `FOR ALL USING (true)` policies (was 2, both `roles={public}`
— the confirmation that 013 granted them to everyone, not to the service
role), an anonymous INSERT into `daily_topics` is refused, and `pnpm
verify:rls` reports no table accepting an anonymous write.

`011_contact_submissions.sql` repeats the pattern; that table does not exist,
so it never took effect. Do not copy it forward.

Scope was checked empirically across all 24 tables — those two are the only
ones affected. `likes` separately exposes 11,281 rows with `user_id` to anon
(028 fixes it); `profiles`, `follows` and `issue_follows` are correctly closed.

### Verification gates

Two classes of bug here are invisible to TypeScript, tests and the build,
because PostgREST returns `{ data: null, error }` rather than throwing and most
callers ignore `error` — so a broken query renders as an empty section.

| Command | Catches |
|---|---|
| `pnpm verify:selects` | Any `.select()`, `.order()`, filter or insert/update payload naming a column or relationship that does not exist. Found 4 real outages, incl. the campaign-finance section hidden on every profile and the feed's poll card never rendering. |
| `pnpm verify:rls` | Tables accepting anonymous writes. |
| `pnpm verify:overflow` | Horizontal overflow at 375/768/1440 on every route, with the element responsible. Needs `pnpm dev` running. |
| `pnpm verify:routes` | Every page's caching declaration means what it says: no page both declares `revalidate` and imports the cookie-backed Supabase client; every dynamic segment with `revalidate` has `generateStaticParams`; nothing declares both `revalidate` and `force-dynamic`. Also counts routes with no `loading.tsx` above them, which cannot be usefully prefetched. Needs no env. |
| `pnpm verify:api` | Every API route requires what it claims to. Static pass reads each handler for its guard; dynamic pass calls each one unauthenticated and checks it refuses. A route with no entry in its table fails as unclassified, so adding one forces a decision about who may call it. |
| `pnpm verify:pages` | Every route in a real browser: HTTP status and redirects, uncaught exceptions and console errors (where React reports hydration mismatches), failed same-origin requests, images that rendered with no pixels, and every internal link followed. Site-wide nav links are always checked; long tails are sampled and the sample size printed. Needs `pnpm dev`. |
| `pnpm verify:skeletons` | Whether each `loading.tsx` is the same size as the page it stands in for, block by block, at 390 and 768. Navigates by click with speculative prefetch blocked, so the hop is cold and the fallback actually mounts. Found every skeleton mis-sized on first write: subtitles reserved one line where they wrap to two on a phone, stat tiles sized to glyph heights instead of line boxes, a map hint drawn at widths where the real one is `sm:hidden`. Needs a production build on :3001 (`pnpm build && PORT=3001 pnpm start`). |

`verify:selects` and `verify:rls` need `.env.local` exported; run them after
schema changes. The two browser gates share one route list,
`scripts/lib/routes.mjs`, covering every `page.tsx` with real ids in the
dynamic segments — update an id there rather than dropping a route. Signed
out, the 31 dashboard and admin routes measure the login page, so both take
`--login=email:password` or `--ephemeral-admin`, which creates an admin with a
random password for the run and deletes it afterwards (a survivor of a
crashed run is removed at the start of the next). `verify:pages` fetches
links two at a time on purpose: the dev server renders concurrent heavy pages
far slower than in sequence (issue pages: 2–7s alone, 25–32s two at a time,
timeouts six at a time). Pass `--concurrency=8` against a production build.
Editing a layout while a sweep runs produces "Hydration failed" noise — the
server HTML comes from one version of the module and the client bundle from
the other — so re-run the affected routes before treating it as a bug.
`verify:pages` also ignores two things it causes itself, printing the reason
rather than failing: HTTP 429 from our own API (69 routes in a burst crosses
a 30-writes-a-minute limit no visitor would), and supabase-js's
`lock:sb-*-auth-token` being stolen when the sweep navigates mid-hand-off.
That second one is **not** several browser clients competing —
`@supabase/ssr` 0.5.2 returns one cached client in the browser, and no
"Multiple GoTrueClient instances" warning appears; it is one client
interrupted, on a page that still renders. After a branch switch,
restart `pnpm dev` before trusting a "still broken" result: the Turbopack
watcher has been seen to stop picking up edits.

When probing RLS, note that **DELETE is useless as a test**: an RLS DELETE
policy acts as a row filter, so a delete matching nothing returns success
whether or not a policy exists. Sweeping with it reports every table as
writable. Use INSERT, with foreign keys pointed at a nonexistent uuid so a
permitted write fails on the FK rather than on a cast — a cast error is raised
before RLS is consulted and reads as a false negative.

### Page crawl — 2026-09-17

The first `verify:pages` run over 69 routes and 571 links, plus
`verify:overflow --ephemeral-admin`, found and fixed:

- **/insights** logged a hydration error for every dot in both hemicycles.
  `ChamberComposition` rendered raw `Math.cos`/`Math.sin` output as SVG
  attributes; Node and Chrome differ in the last digit. Coordinates are
  rounded to two decimals. Rule: never render an unrounded float as an
  attribute.
- **/states/[state]** summed every `campaign_finance` row and listed "Top
  Fundraisers" once per row — one row per politician *per cycle*, so a
  senator with three cycles appeared three times. Now each politician's
  latest cycle, labelled.
- **/issues/[slug]** linked "Browse all N politicians" to `/politicians?issue=`,
  which does not exist. Its HTML was **2.8MB**: all 8,584 politicians shipped
  as props to the client-side stance groups with ~40 visible. Grouping now
  lives in `lib/issues/stance-groups.ts`; the page sends the first six
  entries per bucket with a six-politician preview each, and
  `/api/issues/[slug]/stances` serves the rest on click (CDN-cacheable for an
  hour). **118–182KB** now. The page also read cookies (follow state) and
  awaited `searchParams` it never used — either one makes a page render per
  request and silently defeats `export const revalidate`. Follow state is
  resolved in the button on the client. Even then it kept rendering per
  request, because **a dynamic segment without `generateStaticParams` is
  never cached**, whatever `revalidate` says — the production build showed
  `Cache-Control: no-store` and no `x-nextjs-cache` header. An empty
  `generateStaticParams` fixes it: nothing prerenders at build, each page is
  cached after its first visitor (MISS 5.3s, then HIT 3ms). Same fix on
  `/states/[state]`. `/politicians/[slug]` declares `revalidate = 1800` but
  reads the auth cookie, so it stays per-request by design. Rule: a page
  with `revalidate` must not touch `cookies()`, `headers()` or
  `searchParams`, and a dynamic one also needs `generateStaticParams`.
- **Every admin screen overflowed at 375px** (and the list pages at 768px):
  `AdminShell` rendered a fixed 224px sidebar and `ml-56` at every width.
  The sidebar now appears at `lg`; below that the same links are a scrollable
  strip under a top bar. Admin tables scroll inside `overflow-x-auto`. The
  sidebar also linked to `/admin/voting-records` and `/admin/finance`, which
  never existed, and omitted `/admin/polls` and `/admin/inbox`, which did.
- **579 politician/candidate photos were dead URLs** rendering as
  broken-image icons (`<Image unoptimized>` has no fallback). Found with
  `scripts/check-image-urls.mjs`, which judges a URL the way Chrome does
  (status, non-image body → ORB, CORP header, dead host, bad certificate) and
  sends the headers Chrome sends for a cross-site `<img>` — Referer and
  `Sec-Fetch-Dest: image` — because hotlink protection keys on them:
  akleg.gov serves a bare request the photo and a request with a Referer a
  403, which is what the voter's browser gets. Nulled with
  `scripts/clear-dead-image-urls.mjs` so the party mark renders instead.
  Backups: `dead-images-backup-2026-09-17.json` and
  `dead-images-hotlink-backup-2026-09-17.json` (gitignored).
  A first version of the probe reported 1,357 dead: 584 were our own R2
  bucket rate-limiting a 12-wide sweep and 240 were incomplete-certificate
  hosts. Per-host concurrency is 2 and 429s retry. Re-run it before acting.

### API routes — 2026-09-19

`/api/admin/daily-topics` **had no auth check at all.** An anonymous POST
reached the handler and ran the news ingestion with the service role, which
bypasses RLS — so migration 029 could not stop it — and spent the GNews quota
on request. `daily_topics` is the homepage "Today in Politics" strip, the
same table as the 2026-09-15 RLS hole.

The proxy did not cover it. `updateSession` tests
`pathname.startsWith('/admin')`, and **"/api/admin/…" does not start with
"/admin"**, so every route under `/api/admin` has always had to defend
itself. Four of the five did, in four different copy-pasted shapes; the fifth
did not. Proof, signed out: `GET /admin` → 307 (proxy), `GET
/api/admin/analytics` → 401 (its own guard), `GET /api/admin/daily-topics` →
**405** — the router answered, so the request had reached the route.

Fixed three ways: `lib/auth/require-admin.ts` is now the single guard and all
five routes call it; `updateSession` refuses `/api/admin` with JSON 401/403
as a second layer; and `pnpm verify:api` checks the whole surface.

Also found: both `/api/cron` routes read
`if (CRON_SECRET && authHeader !== …)`, which **skips the check entirely when
the variable is unset** — a deployment missing it would leave
`weekly-maintenance` (it writes politicians, profiles, likes,
politician_issues, elections) open to anyone. Both now refuse when the secret
is absent.

Rules: a route under `/api/admin` calls `requireAdmin()` as its first
statement; an auth check is `if (!SECRET || …)`, never `if (SECRET && …)`;
and the proxy's path tests do not protect `/api/*`.

### Photos — 2026-09-19

Every photo used to be on somebody else's server. They now serve from
`cdn.getpoli.app` (R2 bucket `codex`, keys prefixed `codex/`).

- `scripts/migrate-images-to-r2.mjs` downloads, converts to WebP via sharp and
  uploads. **Dry-run by default**; `--apply` writes after backing up every URL
  it will change. `preflight()` refuses to run until endpoint, bucket and
  public URL are proven against a real object — as originally configured it
  would have treated all 5,501 photos as external and rewritten every one to a
  domain that does not resolve. It caught exactly that when `R2_PUBLIC_URL`
  changed mid-session.
- `--only-host` restricts a run. `--accept-incomplete-chain` relaxes Node's
  certificate check and **refuses without `--only-host`**: six state
  legislatures serve over a chain browsers complete and Node rejects, which is
  215 photos. `--batch`/`--delay` pace a run.
- `scripts/diagnose-unmigrated-images.mjs` says *which* rows did not move and
  why, grouped by host. The migration reports one skip count for two failure
  points (download and decode), which is not enough to act on. It decodes what
  it downloads — that is what exposed a legis.ga.gov "portrait" that is a
  1,938-byte octet-stream.
- `scripts/rewrite-image-origin.mjs` moves stored URLs between origins,
  keeping the path, and refuses unless a sample serves at the new origin.

Rules: keep photos on our own origin; never point `image_url` at a host we do
not control if the file can be re-hosted. A `<Image unoptimized>` has no error
path, so a dead URL draws a broken-image icon — prefer `AvatarImage`, which
falls back. Add any new image host to `remotePatterns` in `next.config.ts`.

### Caching — 2026-09-19

Three pages declared a cache and then defeated it. The symptom is silent: the
page still renders, just from scratch every time, and the only way to see it
is to serve a production build and read `x-nextjs-cache`.

| Route | What was wrong | After |
|---|---|---|
| `/politicians/[slug]` | read the auth cookie **and** had no `generateStaticParams` — either alone is fatal | MISS 1.0–4.2s, then **HIT ~2ms** |
| `/` | read the auth cookie, so dynamic for 100% of traffic including signed-out | **HIT ~1.9ms**, prerendered at build |
| `/report-cards` | declared `revalidate = 3600` beside an auth read, but genuinely returns a different page to signed-out visitors | now honestly `force-dynamic` |

The rule, now enforced by `pnpm verify:routes`: **a page with `revalidate`
must not touch `cookies()`, `headers()` or `searchParams`, and a dynamic
segment also needs `generateStaticParams`.** A page that genuinely varies per
request should say `force-dynamic` rather than declare a cache it can never
use.

How the auth reads were removed:

- `/politicians/[slug]` passed `isAuthenticated` to two client components.
  Both now resolve session themselves through `lib/hooks/use-session-user.ts`,
  which uses `getSession()` (a local JWT read) rather than `getUser()` (a
  network round-trip to GoTrue). Note the report card's signed-out branch
  already rendered the same data behind a CSS blur — it is a signup prompt,
  not a data boundary, so nothing was ever being withheld server-side.
- `/` moved its four personalised pieces into
  `components/home/personal-strip.tsx`, fed by `app/api/me/home`. The
  featured list and the three party tallies are `unstable_cache`d.
  `<HotTopics>` lost `followedIssueIds`, which only re-ordered followed
  topics to the front — not worth the whole page's cache.

**Making a page static can break client components that were fine when it was
dynamic.** `useSearchParams()` bails out of prerendering, so
`components/politicians/profile-tabs.tsx` started returning 500s from the
production build the moment the page became cacheable. Its tab state is now
local React state with `history.replaceState` for the URL, which also removed
a server round-trip from every tab tap.

### Still unverified
- 2026 primary *outcomes* remain unconfirmed — FEC lists who filed, not who
  won a primary. No free API covers that; needs state SoS, AP, or Ballotpedia.
  The 319 candidates still `is_verified = false` are the original seed rows for
  non-federal races; FEC cannot verify those at all, since state and local
  candidates file with state agencies.
- 152 races have no `incumbent_id` (was 196; 44 were derived on 2026-09-10 —
  38 mayors and county executives matched by place name + office, 6 at-large
  House seats). The rest are genuinely underivable from what we hold.
- 155 races have zero candidates, **all non-federal** (was 172). Every federal
  race now has at least one FEC-sourced candidate. The remainder are state and
  local seats with no free authoritative source.
- The retirement list in `scripts/destale-2026.mjs` is hand-verified but **not
  exhaustive**.

## SQL Migrations (in order)

Each is idempotent. Two ways to run them:

- `node scripts/apply-migrations.mjs` validates every pending file inside a
  transaction and rolls back; `--apply` commits. Needs `DATABASE_URL` in
  `.env.local` (Supabase → Project Settings → Database → connection URI).
  **The `sb_secret_*` API keys cannot do this** — they are PostgREST
  credentials and reach rows, not DDL.
- Or paste into the Supabase SQL Editor by hand, which is how 001–024 were
  applied.

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
13. `025_candidate_source.sql` — `candidates.source`; unblocks the FEC candidate importer *(applied 2026-09-16)*
14. `026_politician_source.sql` — `politicians.source`/`is_verified`/`last_checked` *(applied 2026-09-16)*
15. `027_public_submissions.sql` — creates the table `app/api/submissions` and `app/admin/inbox` use *(applied 2026-09-16)*
16. `028_like_counts_view.sql` — `public_like_counts` view; stops `likes` exposing a per-user political-preference graph *(applied 2026-09-16; anon now reads 0 of 11,281 rows)*
17. **`029_fix_daily_topics_rls.sql` — SECURITY.** *(applied 2026-09-16)* See below.

> **Only 011–015 are in this repo.** 001–010 and 016–024 exist solely in the
> live Supabase project, so the schema cannot be rebuilt from source control.
> That is also why `public_submissions` and `contact_submissions` are missing
> from the database despite being referenced in code.

> **Do not run `015_public_follow_counts.sql` as written.** It grants
> `FOR SELECT USING (true)` on `follows`, `bill_follows` and `issue_follows` to
> expose aggregate counts. That would publish three per-user preference graphs
> (28,337 follow rows among them). It has never been applied — anon reads 0
> rows from all three. If those counts are wanted, give each a view like 028's.

## Data Refresh Scripts
All are dry-run by default; pass `--apply` to write. Prefix with
`export $(grep -v '^#' .env.local | xargs)`.

| Script | Purpose |
|---|---|
| `scripts/destale-2026.mjs` | Derivable-only fixes: race incumbents via `(state, chamber, district)`, candidate→politician links, expired polls, status vocabulary, known retirements |
| `scripts/import-fec-finance.mjs` | Real FEC finance. `--cycle=2026 --office=S,H,P`. Caches responses to `.fec-cache/` |
| `scripts/rebuild-bills-from-congress.mjs` | Real 119th-Congress bills from Congress.gov (`--scan`, `--active`) |
| `scripts/import-fec-candidates.mjs` | Real FEC 2026 candidate filings. Needs migration 025; refuses to `--apply` without it |
| `scripts/import-congress-members.mjs` | Inserts serving members we lack, corrects party/district, stamps provenance. Needs 026. Never deletes |
| `scripts/audit-congress-members.mjs` | Report-only reconciliation against Congress.gov |
| `scripts/verify-bills-against-congress.mjs` | Title-by-title bill verification. Report-only |
| `scripts/merge-duplicate-politicians.mjs` | Merges the 3 people stored twice (Waltz/Turner/Carter), whose records are split across the pair. Needs a decision on the surviving slug |
| `scripts/unverify-unsourced-stances.mjs` | Clears `is_verified` where no `source_url`. Already applied |
| `scripts/purge-fabricated-election-results.mjs` | Deleted the 271 fabricated rows. Already applied |
| `scripts/apply-migrations.mjs` | Applies pending migrations over a direct Postgres connection. Validates and rolls back by default; `--apply` commits. Needs `DATABASE_URL` |
| `scripts/audit-anon-write-access.mjs` | `pnpm verify:rls` — probes every table for anonymous write access |
| `scripts/verify-supabase-selects.mjs` | `pnpm verify:selects` — runs every literal query shape against the real schema |
| `scripts/check-overflow.mjs` | `pnpm verify:overflow` — horizontal overflow per route and width. `--login`, `--ephemeral-admin` for gated pages |
| `scripts/check-pages.mjs` | `pnpm verify:pages` — status, console errors, broken images, dead links across every route. `--routes-file=` for a DB-generated list, `--links=0` to skip the crawl |
| `scripts/migrate-images-to-r2.mjs` | Re-hosts photos on R2. Dry-run by default; `--apply`, `--limit`, `--only-host`, `--accept-incomplete-chain`, `--batch`, `--delay` |
| `scripts/diagnose-unmigrated-images.mjs` | Which photos a migration run left behind and why, grouped by host |
| `scripts/rewrite-image-origin.mjs` | Moves stored image URLs between origins, keeping the path; refuses unless a sample serves |
| `scripts/check-image-urls.mjs` | Probes every `image_url` as a browser would judge it; buckets dead / cert-chain / unreachable; writes rows to `--out` |
| `scripts/check-route-config.mjs` | `pnpm verify:routes` — asserts every page's caching declaration is honoured |
| `scripts/check-api-routes.mjs` | `pnpm verify:api` — every API route requires what it claims to. `--static-only` skips the requests |
| `scripts/clear-dead-image-urls.mjs` | Nulls the `dead` bucket from that file, each update conditioned on the URL being unchanged, after a backup |

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
7. **Tailwind v3.4, NOT v4** — this entry said the opposite until 2026-09-19.
   Config is the JS-first `tailwind.config.ts`; `app/globals.css` starts with
   `@tailwind base/components/utilities`. There is no `@theme` block and no
   `@import "tailwindcss"`. Anyone following the old note would write
   CSS-first config that silently never compiles.
8. **Motion tokens** — durations (`duration-1`..`5`) and easings
   (`ease-ios`, `ease-spring`, `ease-sheet`, …) resolve to CSS custom
   properties in `globals.css`. Do not hardcode a `cubic-bezier`.
9. **Press feedback is automatic** — a global `:active` rule inside
   `@media (hover: none)` covers every `a`/`button`/`[role=button]`. Add
   `.press-scale` only for small controls; opt out with `data-no-press`.
   Hover utilities are wrapped in `@media (hover: hover)` by
   `future.hoverOnlyWhenSupported`, so hover and press never both apply.

## Pending / TODO
- [ ] Admin CRUD for elections/races/candidates
- [x] R2 bucket integration for image storage — **done 2026-09-19.** 5,721 of
      5,769 photos serve from `cdn.getpoli.app`; see "Photos" above.
- [ ] Capacitor production URL configuration
- [ ] More House member data (only ~100 of 435 in politicians table)
- [ ] Replace `<img>` with Next.js `<Image>` component
- [ ] Add Zod validation to admin forms
- [ ] Schema.org JSON-LD structured data for politician pages
- [ ] OG image generation for social sharing
