import { describe, it, expect } from 'vitest'
import { matchBillToIssues, doesVoteAlignWithStance } from '@/lib/utils/bill-issue-map'

describe('matchBillToIssues', () => {
  it('matches healthcare bills', () => {
    expect(matchBillToIssues('Affordable Health Care Act')).toContain('healthcare-and-medicare')
    expect(matchBillToIssues('Medicare Extension Act')).toContain('healthcare-and-medicare')
    expect(matchBillToIssues('Drug Pricing Reform')).toContain('healthcare-and-medicare')
  })

  it('matches immigration bills', () => {
    expect(matchBillToIssues('Border Security Act')).toContain('immigration-and-border-security')
    expect(matchBillToIssues('DACA Protection Act')).toContain('immigration-and-border-security')
    expect(matchBillToIssues('Laken Riley Act')).toContain('immigration-and-border-security')
  })

  it('matches defense bills', () => {
    expect(matchBillToIssues('National Defense Authorization Act (NDAA)')).toContain('national-defense-and-military')
    expect(matchBillToIssues('Veterans Care Act')).toContain('national-defense-and-military')
  })

  it('matches climate bills', () => {
    expect(matchBillToIssues('Clean Air Standards Act')).toContain('climate-and-environment')
    expect(matchBillToIssues('Carbon Emissions Reduction')).toContain('climate-and-environment')
  })

  it('matches gun policy bills', () => {
    expect(matchBillToIssues('Assault Weapon Ban Act')).toContain('gun-policy-and-2nd-amendment')
    expect(matchBillToIssues('Background Check Enhancement')).toContain('gun-policy-and-2nd-amendment')
  })

  it('matches economy bills', () => {
    expect(matchBillToIssues('Tax Reform Act')).toContain('economy-and-jobs')
    expect(matchBillToIssues('Small Business Relief')).toContain('economy-and-jobs')
    expect(matchBillToIssues('Inflation Reduction Act')).toContain('economy-and-jobs')
  })

  it('matches technology bills', () => {
    expect(matchBillToIssues('Online Safety for Kids Act')).toContain('technology-and-ai-regulation')
    expect(matchBillToIssues('TikTok Ban Act')).toContain('technology-and-ai-regulation')
  })

  it('matches housing bills', () => {
    expect(matchBillToIssues('Affordable Housing Act')).toContain('housing-and-affordability')
  })

  it('matches foreign policy bills', () => {
    expect(matchBillToIssues('Ukraine Aid Package')).toContain('foreign-policy-and-diplomacy')
    expect(matchBillToIssues('Sanctions on Iran')).toContain('foreign-policy-and-diplomacy')
    expect(matchBillToIssues('Taiwan Defense Act')).toContain('foreign-policy-and-diplomacy')
  })

  it('can match multiple issues for cross-cutting bills', () => {
    const issues = matchBillToIssues('Inflation Reduction Act for Renewable Energy Tax Credits')
    expect(issues).toContain('economy-and-jobs') // "tax", "inflation reduction"
    expect(issues).toContain('climate-and-environment') // "renewable"
    expect(issues.length).toBeGreaterThanOrEqual(2)
  })

  it('returns empty for unrelated bill', () => {
    expect(matchBillToIssues('Resolution to Honor National Pie Day')).toEqual([])
  })

  it('is case-insensitive', () => {
    expect(matchBillToIssues('HEALTHCARE REFORM')).toContain('healthcare-and-medicare')
  })
})

describe('doesVoteAlignWithStance', () => {
  // Aligned cases
  it('yea + supports = aligned', () => {
    expect(doesVoteAlignWithStance('yea', 'supports')).toBe('aligned')
    expect(doesVoteAlignWithStance('yea', 'strongly_supports')).toBe('aligned')
    expect(doesVoteAlignWithStance('yea', 'leans_support')).toBe('aligned')
  })

  it('nay + opposes = aligned', () => {
    expect(doesVoteAlignWithStance('nay', 'opposes')).toBe('aligned')
    expect(doesVoteAlignWithStance('nay', 'strongly_opposes')).toBe('aligned')
    expect(doesVoteAlignWithStance('nay', 'leans_oppose')).toBe('aligned')
  })

  // Contradicts cases
  it('nay + supports = contradicts', () => {
    expect(doesVoteAlignWithStance('nay', 'supports')).toBe('contradicts')
    expect(doesVoteAlignWithStance('nay', 'strongly_supports')).toBe('contradicts')
  })

  it('yea + opposes = contradicts', () => {
    expect(doesVoteAlignWithStance('yea', 'opposes')).toBe('contradicts')
    expect(doesVoteAlignWithStance('yea', 'strongly_opposes')).toBe('contradicts')
  })

  // Skip cases
  it('skips for ambiguous stances', () => {
    expect(doesVoteAlignWithStance('yea', 'mixed')).toBe('skip')
    expect(doesVoteAlignWithStance('yea', 'neutral')).toBe('skip')
    expect(doesVoteAlignWithStance('yea', 'unknown')).toBe('skip')
  })

  it('skips for non-yea/nay votes', () => {
    expect(doesVoteAlignWithStance('abstain', 'supports')).toBe('skip')
    expect(doesVoteAlignWithStance('not_voting', 'opposes')).toBe('skip')
    expect(doesVoteAlignWithStance('present', 'supports')).toBe('skip')
  })
})
