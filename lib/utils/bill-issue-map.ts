/**
 * Maps bills to issues by keyword matching on bill title/name.
 *
 * Each issue has keywords that, if found in a bill title, associate
 * that bill with the issue. A bill can match multiple issues.
 *
 * The "expected vote" for a stance:
 *   supports/strongly_supports/leans_support → expected "yea"
 *   opposes/strongly_opposes/leans_oppose → expected "nay"
 *   mixed/neutral/unknown → no expectation (skip)
 */

const ISSUE_KEYWORDS: Record<string, string[]> = {
  'healthcare-and-medicare': ['health', 'medicare', 'medicaid', 'affordable care', 'aca', 'hospital', 'drug pricing', 'insulin', 'prescription'],
  'immigration-and-border-security': ['immigration', 'border', 'immigrant', 'asylum', 'visa', 'deportation', 'migrant', 'daca', 'dreamer', 'laken riley', 'alien'],
  'national-defense-and-military': ['defense', 'military', 'armed forces', 'ndaa', 'pentagon', 'veteran', 'nato', 'weapons'],
  'economy-and-jobs': ['economy', 'tax', 'jobs', 'employment', 'labor', 'minimum wage', 'small business', 'trade', 'tariff', 'inflation reduction'],
  'education-and-student-debt': ['education', 'student', 'school', 'college', 'university', 'loan forgiveness', 'pell grant', 'title ix'],
  'climate-and-environment': ['climate', 'environment', 'emissions', 'clean air', 'clean water', 'epa', 'carbon', 'renewable', 'green new deal', 'paris agreement'],
  'criminal-justice-reform': ['criminal justice', 'police', 'prison', 'sentencing', 'bail', 'law enforcement', 'crime'],
  'gun-policy-and-2nd-amendment': ['gun', 'firearm', 'second amendment', '2nd amendment', 'assault weapon', 'background check', 'concealed carry'],
  'infrastructure-and-transportation': ['infrastructure', 'transportation', 'highway', 'bridge', 'rail', 'broadband', 'internet'],
  'energy-policy-and-oil-gas': ['energy', 'oil', 'gas', 'drilling', 'pipeline', 'fossil fuel', 'fracking', 'nuclear', 'lng'],
  'social-security-and-medicare': ['social security', 'retirement', 'pension', 'seniors'],
  'technology-and-ai-regulation': ['technology', 'artificial intelligence', 'ai ', 'cyber', 'data privacy', 'big tech', 'tiktok', 'online safety'],
  'housing-and-affordability': ['housing', 'rent', 'mortgage', 'affordable housing', 'homelessness', 'hud'],
  'foreign-policy-and-diplomacy': ['foreign affairs', 'diplomacy', 'sanction', 'treaty', 'ambassador', 'state department', 'ukraine', 'israel', 'china', 'taiwan', 'iran'],
}

/**
 * Given a bill title/name, return matching issue slugs.
 */
export function matchBillToIssues(billTitle: string): string[] {
  const lower = billTitle.toLowerCase()
  const matches: string[] = []
  for (const [issueSlug, keywords] of Object.entries(ISSUE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      matches.push(issueSlug)
    }
  }
  return matches
}

/**
 * Determine if a vote aligns with a stated stance.
 *
 * For "supports" stances on an issue, we expect a "yea" vote on bills related to that issue.
 * For "opposes" stances, we expect a "nay" vote.
 *
 * IMPORTANT: Some bills are *against* an issue (e.g., a bill to restrict immigration
 * would flip the expectation for someone who supports immigration reform).
 * This simple approach doesn't handle that nuance — it's a rough signal.
 */
export function doesVoteAlignWithStance(
  vote: string,
  stance: string
): 'aligned' | 'contradicts' | 'skip' {
  // Can't judge if vote isn't yea/nay or stance is ambiguous
  if (vote !== 'yea' && vote !== 'nay') return 'skip'
  if (['mixed', 'neutral', 'unknown'].includes(stance)) return 'skip'

  const supports = ['strongly_supports', 'supports', 'leans_support'].includes(stance)
  const opposes = ['strongly_opposes', 'opposes', 'leans_oppose'].includes(stance)

  if (supports && vote === 'yea') return 'aligned'
  if (supports && vote === 'nay') return 'contradicts'
  if (opposes && vote === 'nay') return 'aligned'
  if (opposes && vote === 'yea') return 'contradicts'

  return 'skip'
}
