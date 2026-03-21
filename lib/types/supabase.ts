/**
 * TypeScript interfaces for Supabase query results.
 *
 * Each interface matches the exact shape returned by a `.select()` query
 * used in one or more page components. Keeps `as any[]` off iterated items.
 */

// ──────────────────────────────────────────────
// Shared / reusable join fragments
// ──────────────────────────────────────────────

/** Minimal issue join returned by `issues:issue_id(slug)` */
export interface IssueSlugJoin {
  slug: string
}

/** Issue join returned by `issues:issue_id(id, name, slug, icon, category)` */
export interface IssueDetailJoin {
  id: string
  name: string
  slug: string
  icon?: string | null
  category: string
}

/** Issue join returned by `issues:issue_id(id, name, slug, icon)` */
export interface IssueCompactJoin {
  id: string
  name: string
  slug: string
  icon: string | null
}

/** Politician join returned on candidates / issue-detail pages */
export interface PoliticianJoin {
  id: string
  name: string
  slug: string
  party: string
  chamber: string
  state: string
  title: string
  image_url: string | null
}

/** Politician join on candidates (wider — includes bio) */
export interface PoliticianCandidateJoin extends PoliticianJoin {
  bio: string | null
}

// ──────────────────────────────────────────────
// Home page  (app/(public)/page.tsx)
// ──────────────────────────────────────────────

/** Row from `politician_issues` with `issues:issue_id(slug)` join — home page */
export interface HomeStanceRow {
  politician_id: string
  stance: string
  issue_id: string
  issues: IssueSlugJoin | null
}

// ──────────────────────────────────────────────
// Politician detail  (app/(public)/politicians/[slug]/page.tsx)
// ──────────────────────────────────────────────

/** Row from `politician_issues` with full issue join — politician detail page */
export interface PoliticianStanceRow {
  id: string
  politician_id: string
  issue_id: string
  stance: string
  summary: string | null
  is_verified: boolean | null
  created_at: string
  issues: IssueDetailJoin | null
}

/** Row from `politician_committees` with committee join */
export interface CommitteeMembershipRow {
  role: string
  committees: {
    id: string
    name: string
    slug: string
    chamber: string
  } | null
}

/** Row from `voting_records` — politician detail page */
export interface VotingRecordRow {
  id: string
  bill_name: string | null
  bill_number: string | null
  bill_id: string | null
  vote: string
  vote_date: string | null
}

/** Row from `campaign_finance` */
export interface CampaignFinanceRow {
  id: string
  politician_id: string
  cycle: string
  total_raised: number | null
  total_spent: number | null
  cash_on_hand: number | null
  source: string | null
  last_updated: string | null
}

/** Row from `election_results` */
export interface ElectionResultRow {
  id: string
  politician_id: string
  election_year: number
  state: string
  chamber: string
  district: string | null
  race_name: string
  party: string
  result: string
  vote_percentage: number | null
  total_votes: number | null
  opponent_name: string | null
  opponent_party: string | null
  opponent_vote_percentage: number | null
  is_special_election: boolean
  is_runoff: boolean
  notes: string | null
}

/** Minimal stance row used for like-minded comparison */
export interface ComparisonStanceRow {
  politician_id: string
  stance: string
  issue_id: string
}

/** Politician fields fetched for the like-minded sidebar */
export interface LikeMindedPoliticianRow {
  id: string
  name: string
  slug: string
  party: string
  state: string
  chamber: string
  image_url: string | null
}

// ──────────────────────────────────────────────
// Bills page  (app/(public)/bills/page.tsx)
// ──────────────────────────────────────────────

/** Row from `bills` table */
export interface BillRow {
  id: string
  number: string
  title: string
  summary: string | null
  status: string
  congress_session: string | null
  introduced_date: string | null
  last_action_date: string | null
}

/** Minimal bill row for stats */
export interface BillStatRow {
  id: string
  status: string
}

/** Voting record row used for bill vote counts */
export interface BillVoteRow {
  bill_id: string
  vote: string
}

// ──────────────────────────────────────────────
// Issues index  (app/(public)/issues/page.tsx)
// ──────────────────────────────────────────────

/** Row from `issues` with nested `politician_issues` — issues index page */
export interface IssueWithStancesRow {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  category: string
  politician_issues: Array<{ id: string; stance: string }>
}

// ──────────────────────────────────────────────
// Issue detail  (app/(public)/issues/[slug]/page.tsx)
// ──────────────────────────────────────────────

/** Full issue row */
export interface IssueRow {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  category: string
}

/** Row from `politician_issues` with politician join — issue detail page */
export interface IssueStanceWithPoliticianRow {
  id: string
  stance: string
  summary: string | null
  politicians: PoliticianJoin | null
}

// ──────────────────────────────────────────────
// Election detail  (app/(public)/elections/[slug]/page.tsx)
// ──────────────────────────────────────────────

/** Election join on races */
export interface ElectionJoin {
  id: string
  name: string
  slug: string
  election_date: string | null
}

/** Incumbent politician join on races */
export interface IncumbentJoin {
  id: string
  name: string
  slug: string
  party: string
  image_url: string | null
  state: string
  title: string
}

/** Race row with election + incumbent joins */
export interface RaceDetailRow {
  id: string
  slug: string
  name: string
  description: string | null
  state: string
  district: string | null
  chamber: string
  elections: ElectionJoin | null
  incumbent: IncumbentJoin | null
}

/** Candidate row with politician join */
export interface CandidateRow {
  id: string
  name: string
  party: string
  status: string
  is_incumbent: boolean
  image_url: string | null
  bio: string | null
  website_url: string | null
  race_id: string
  politician: PoliticianCandidateJoin | null
}

/** Stance row for election candidate comparison */
export interface ElectionStanceRow {
  politician_id: string
  stance: string
  issue_id: string
  issues: IssueCompactJoin | null
}

// ──────────────────────────────────────────────
// Insights page  (app/(public)/insights/page.tsx)
// ──────────────────────────────────────────────

/** Politician row for insights aggregation */
export interface InsightsPoliticianRow {
  id: string
  name: string
  slug: string
  party: string | null
  state: string | null
  chamber: string | null
  image_url: string | null
  title: string | null
}

/** Stance row with issue join for insights */
export interface InsightsStanceRow {
  politician_id: string
  stance: string
  issues: IssueDetailJoin | null
}

/** Issue row for insights */
export interface InsightsIssueRow {
  id: string
  name: string
  slug: string
  icon: string
  category: string
}
