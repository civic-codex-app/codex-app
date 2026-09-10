import { describe, it, expect } from 'vitest'
import { computeVoterMatch } from '@/lib/utils/voter-match'

describe('computeVoterMatch', () => {
  it('returns 100% for identical stances', () => {
    const stances = {
      'healthcare': 'supports',
      'economy': 'opposes',
      'climate': 'strongly_supports',
    }
    const result = computeVoterMatch(stances, stances)
    expect(result.score).toBe(100)
    expect(result.matched).toBe(3)
  })

  it('returns 0% for maximally opposite stances', () => {
    const user = {
      'healthcare': 'strongly_supports',
      'economy': 'strongly_supports',
    }
    const pol = {
      'healthcare': 'strongly_opposes',
      'economy': 'strongly_opposes',
    }
    const result = computeVoterMatch(user, pol)
    expect(result.score).toBe(0)
  })

  it('no penalty when politician is more extreme on same side', () => {
    const user = { 'healthcare': 'supports' }
    const pol = { 'healthcare': 'strongly_supports' }
    const result = computeVoterMatch(user, pol)
    // Same side, politician more extreme = perfect match
    expect(result.score).toBe(100)
    expect(result.matched).toBe(1)
  })

  it('penalizes when politician is less extreme (toward center)', () => {
    const user = { 'healthcare': 'supports' }
    const pol = { 'healthcare': 'leans_support' }
    const result = computeVoterMatch(user, pol)
    // Same side but politician is closer to center = 1 step penalty
    expect(result.score).toBe(90)
    expect(result.matched).toBe(1)
  })

  it('skips issues only present on one side', () => {
    const user = { 'healthcare': 'supports', 'economy': 'opposes' }
    const pol = { 'healthcare': 'supports' }
    const result = computeVoterMatch(user, pol)
    expect(result.matched).toBe(1)
    expect(result.score).toBe(100)
  })

  it('skips unknown stances', () => {
    const user = { 'healthcare': 'unknown' }
    const pol = { 'healthcare': 'supports' }
    const result = computeVoterMatch(user, pol)
    expect(result.matched).toBe(0)
    expect(result.score).toBe(0)
  })

  it('returns 0 when no issues overlap', () => {
    const user = { 'healthcare': 'supports' }
    const pol = { 'economy': 'supports' }
    const result = computeVoterMatch(user, pol)
    expect(result.matched).toBe(0)
    expect(result.score).toBe(0)
  })

  it('weights strongly-felt issues higher via conviction', () => {
    // User strongly supports healthcare, leans on economy
    // Politician opposes both — crossing sides
    const user = {
      'healthcare': 'strongly_supports', // conviction 3.0
      'economy': 'leans_support',        // conviction 1.0
    }
    const pol = {
      'healthcare': 'leans_oppose',  // crosses neutral, distance matters
      'economy': 'leans_oppose',     // crosses neutral, distance matters
    }
    const result = computeVoterMatch(user, pol)
    // healthcare: distance 4 = 0.15, economy: distance 2 = 0.7
    // (3.0 * 0.15 + 1.0 * 0.7) / (3.0 + 1.0) = 1.15 / 4.0 = 0.2875 => 29%
    expect(result.score).toBe(29)
  })

  it('applies verification weight when verifiedMap is provided', () => {
    const user = { 'healthcare': 'supports', 'economy': 'supports' }
    const pol = { 'healthcare': 'supports', 'economy': 'supports' }
    const verified = { 'healthcare': true, 'economy': false }
    const result = computeVoterMatch(user, pol, verified)
    // Both match perfectly, but economy is estimated (0.5 weight) vs verified (1.0)
    // (2.0 * 1.0 * 1.0 + 2.0 * 1.0 * 0.5) / (2.0 * 1.0 + 2.0 * 0.5) = 3.0 / 3.0 = 100
    expect(result.score).toBe(100)
  })

  it('uniform verification weight cancels out of the score', () => {
    // The verified/estimated multiplier is applied to both the numerator and
    // the denominator, so it only shifts a score when the flags DIFFER across
    // issues. Flagging every row the same way -- all true or all false --
    // leaves every score identical. This is why clearing the bogus
    // `is_verified = true` across politician_issues was a correctness fix to
    // the data rather than a change to anyone's match percentage.
    const user = { a: 'strongly_supports', b: 'supports', c: 'opposes' }
    const pol = { a: 'supports', b: 'strongly_opposes', c: 'leans_oppose' }
    const allVerified = { a: true, b: true, c: true }
    const allEstimated = { a: false, b: false, c: false }

    const verified = computeVoterMatch(user, pol, allVerified)
    const estimated = computeVoterMatch(user, pol, allEstimated)

    expect(estimated.score).toBe(verified.score)
    expect(estimated.matched).toBe(verified.matched)
  })

  it('mixed verification flags DO move the score', () => {
    // The counterpart to the above: the weighting is real, it just needs a mix.
    // Down-weighting the issue the politician agrees on lowers the score.
    const user = { a: 'strongly_supports', b: 'strongly_supports' }
    const pol = { a: 'strongly_supports', b: 'strongly_opposes' }

    const agreementVerified = computeVoterMatch(user, pol, { a: true, b: false })
    const agreementEstimated = computeVoterMatch(user, pol, { a: false, b: true })

    expect(agreementVerified.score).toBeGreaterThan(agreementEstimated.score)
  })

  it('handles empty inputs', () => {
    expect(computeVoterMatch({}, {}).score).toBe(0)
    expect(computeVoterMatch({}, {}).matched).toBe(0)
  })

  it('2-step distance gives 70% similarity', () => {
    const user = { 'issue': 'strongly_supports' } // numeric 6
    const pol = { 'issue': 'leans_support' }       // numeric 4
    const result = computeVoterMatch(user, pol)
    expect(result.score).toBe(70)
  })

  it('3-step distance gives 40% similarity', () => {
    const user = { 'issue': 'strongly_supports' } // numeric 6
    const pol = { 'issue': 'neutral' }             // numeric 3
    const result = computeVoterMatch(user, pol)
    expect(result.score).toBe(40)
  })

  it('skips neutral user stances entirely — no penalty', () => {
    const user = {
      'healthcare': 'supports',
      'economy': 'neutral',
    }
    const pol = {
      'healthcare': 'supports',
      'economy': 'strongly_opposes', // would be max distance if counted
    }
    const result = computeVoterMatch(user, pol)
    // Only healthcare should count — perfect match
    expect(result.score).toBe(100)
    expect(result.matched).toBe(1)
  })

  it('skips mixed user stances entirely', () => {
    const user = {
      'healthcare': 'opposes',
      'economy': 'mixed',
    }
    const pol = {
      'healthcare': 'opposes',
      'economy': 'strongly_supports',
    }
    const result = computeVoterMatch(user, pol)
    expect(result.score).toBe(100)
    expect(result.matched).toBe(1)
  })

  it('returns 0 matched when all user stances are neutral', () => {
    const user = { 'healthcare': 'neutral', 'economy': 'neutral' }
    const pol = { 'healthcare': 'supports', 'economy': 'opposes' }
    const result = computeVoterMatch(user, pol)
    expect(result.matched).toBe(0)
    expect(result.score).toBe(0)
  })
})
