/**
 * Every route the site serves, with real ids in the dynamic segments so each
 * page renders content rather than a not-found.
 *
 * Shared by the browser-driven gates (check-overflow, check-pages) so their
 * route lists cannot drift apart. If a row named here is deleted, the gate
 * that hits it reports a 404 on a seed route — which is the right outcome.
 * Update the id here; do not drop the route.
 *
 * Auth-gated routes are included deliberately. Signed out they redirect to
 * /login, and each gate reports the redirect rather than scoring /login under
 * the gated route's name. check-pages takes --login=email:password to check
 * them signed in.
 */
export const IDS = {
  politicianSlug: 'lisa-murkowski',
  politicianId: '00ac1000-70c0-4f35-bf86-22bd335d32d7',
  comparedWith: 'bernie-sanders',
  issueSlug: 'climate-and-environment',
  issueId: '04b514b6-e141-40df-aa1d-0083cc194104', // economy-and-jobs
  raceSlugHeavy: 'il-senate-2026', // 20 candidates — the heaviest race
  raceSlug: 'ny-12-house-2026',
  electionId: '2643378b-0097-4d2d-ac0b-abea65318430', // ak-2026-elections
  raceId: '50d1280a-aff4-4a9e-b130-04fab8eb7966', // ak-senate-2026, in that election
  candidateId: '8171fb23-6471-45c8-9dfc-37a8575e0342', // Mary Peltola, in that race
  // No politician link, so /candidates/[id] renders a candidate page instead of
  // redirecting to /politicians/[slug].
  unlinkedCandidateId: 'c8e007e8-e2e1-405d-91a8-348b9d6cbc53',
  billId: 'd5537282-792c-40b4-a857-84611f4dbc7a',
  pollId: 'd02c5750-9a14-4c6b-bdb5-e0b5b0f3de30',
  state: 'ak',
}

export const PUBLIC_ROUTES = [
  '/',
  '/directory',
  `/politicians/${IDS.politicianSlug}`,
  '/compare',
  `/compare?a=${IDS.politicianSlug}&b=${IDS.comparedWith}`,
  '/compare/users',
  '/issues',
  `/issues/${IDS.issueSlug}`,
  '/issues/map',
  '/insights',
  '/insights/money-map',
  '/elections',
  '/elections/countdown',
  `/elections/${IDS.raceSlugHeavy}`,
  `/elections/${IDS.raceSlug}`,
  '/states',
  `/states/${IDS.state}`,
  '/bills',
  `/bills/${IDS.billId}`,
  `/candidates/${IDS.unlinkedCandidateId}`,
  '/report-cards',
  '/polls',
  `/polls/${IDS.pollId}`,
  '/feed',
  '/community',
  '/ballot',
  '/quiz',
  '/contribute',
  '/contribute/suggest',
  '/contribute/tip',
  '/contact',
  '/data-sources',
  '/privacy',
  '/terms',
]

export const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password']

/** Redirect to /login when signed out. */
export const DASHBOARD_ROUTES = ['/dashboard', '/account', '/following', '/onboarding', '/ballot-scorecard']

/** Redirect to /login when signed out, and to /dashboard when signed in without the admin role. */
export const ADMIN_ROUTES = [
  '/admin',
  '/admin/analytics',
  '/admin/annotations',
  '/admin/bills',
  `/admin/bills/${IDS.billId}`,
  '/admin/bills/new',
  '/admin/daily-topics',
  '/admin/elections',
  `/admin/elections/${IDS.electionId}`,
  `/admin/elections/${IDS.electionId}/races/new`,
  `/admin/elections/${IDS.electionId}/races/${IDS.raceId}`,
  `/admin/elections/${IDS.electionId}/races/${IDS.raceId}/candidates/new`,
  `/admin/elections/${IDS.electionId}/races/${IDS.raceId}/candidates/${IDS.candidateId}`,
  '/admin/elections/new',
  '/admin/inbox',
  '/admin/issues',
  `/admin/issues/${IDS.issueId}`,
  '/admin/issues/new',
  '/admin/politicians',
  `/admin/politicians/${IDS.politicianId}`,
  '/admin/politicians/new',
  '/admin/polls',
  `/admin/polls/${IDS.pollId}`,
  '/admin/polls/new',
  '/admin/settings',
  '/admin/users',
]

export const ALL_ROUTES = [...PUBLIC_ROUTES, ...AUTH_ROUTES, ...DASHBOARD_ROUTES, ...ADMIN_ROUTES]
