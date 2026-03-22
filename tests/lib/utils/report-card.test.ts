import { describe, it, expect } from 'vitest'
import { computeReportCard, gradeFromScore, gradeColor, type ReportCardInput } from '@/lib/utils/report-card'

describe('gradeFromScore', () => {
  it('maps score ranges to correct grades', () => {
    expect(gradeFromScore(100)).toBe('A')
    expect(gradeFromScore(75)).toBe('A')
    expect(gradeFromScore(74)).toBe('B')
    expect(gradeFromScore(60)).toBe('B')
    expect(gradeFromScore(59)).toBe('C')
    expect(gradeFromScore(45)).toBe('C')
    expect(gradeFromScore(44)).toBe('D')
    expect(gradeFromScore(30)).toBe('D')
    expect(gradeFromScore(29)).toBe('F')
    expect(gradeFromScore(0)).toBe('F')
  })
})

describe('gradeColor', () => {
  it('returns hex colors for each grade', () => {
    expect(gradeColor('A')).toMatch(/^#/)
    expect(gradeColor('B')).toMatch(/^#/)
    expect(gradeColor('C')).toMatch(/^#/)
    expect(gradeColor('D')).toMatch(/^#/)
    expect(gradeColor('F')).toMatch(/^#/)
  })

  it('returns distinct colors for each grade', () => {
    const colors = ['A', 'B', 'C', 'D', 'F'].map(gradeColor)
    expect(new Set(colors).size).toBe(5)
  })

  it('returns F color for unknown grades', () => {
    expect(gradeColor('X')).toBe(gradeColor('F'))
  })
})

describe('computeReportCard', () => {
  const baseInput: ReportCardInput = {
    party: 'democrat',
    chamber: 'senate',
    stances: [
      { stance: 'supports', issues: { slug: 'economy-and-jobs' } },
      { stance: 'strongly_supports', issues: { slug: 'healthcare-and-medicare' } },
      { stance: 'strongly_supports', issues: { slug: 'climate-and-environment' } },
    ],
    votingRecords: [
      { vote: 'yea' },
      { vote: 'nay' },
      { vote: 'yea' },
    ],
    committees: [
      { role: 'member' },
      { role: 'chair' },
    ],
    verifiedStances: 2,
    totalStances: 3,
  }

  it('returns all expected fields', () => {
    const card = computeReportCard(baseInput)
    expect(card).toHaveProperty('grade')
    expect(card).toHaveProperty('score')
    expect(card).toHaveProperty('bipartisanship')
    expect(card).toHaveProperty('engagement')
    expect(card).toHaveProperty('transparency')
    expect(card).toHaveProperty('effectiveness')
  })

  it('score is 0-100', () => {
    const card = computeReportCard(baseInput)
    expect(card.score).toBeGreaterThanOrEqual(0)
    expect(card.score).toBeLessThanOrEqual(100)
  })

  it('individual dimensions are 0-100 (except engagement for executives)', () => {
    const card = computeReportCard(baseInput)
    expect(card.bipartisanship).toBeGreaterThanOrEqual(0)
    expect(card.bipartisanship).toBeLessThanOrEqual(100)
    expect(card.transparency).toBeGreaterThanOrEqual(0)
    expect(card.transparency).toBeLessThanOrEqual(100)
    expect(card.effectiveness).toBeGreaterThanOrEqual(0)
    expect(card.effectiveness).toBeLessThanOrEqual(100)
  })

  it('engagement is 100% when all votes are yea/nay', () => {
    const card = computeReportCard({
      ...baseInput,
      votingRecords: [{ vote: 'yea' }, { vote: 'nay' }, { vote: 'yea' }],
    })
    expect(card.engagement).toBe(100)
  })

  it('engagement drops when votes are abstain/not_voting', () => {
    const card = computeReportCard({
      ...baseInput,
      votingRecords: [{ vote: 'yea' }, { vote: 'not_voting' }, { vote: 'present' }],
    })
    expect(card.engagement).toBeLessThan(100)
    expect(card.engagement).toBe(33) // 1 of 3
  })

  it('executives skip engagement dimension', () => {
    const card = computeReportCard({
      ...baseInput,
      chamber: 'governor',
    })
    expect(card.engagement).toBe(-1)
    // Score should still be valid
    expect(card.score).toBeGreaterThanOrEqual(0)
  })

  it('presidential is executive too', () => {
    const card = computeReportCard({
      ...baseInput,
      chamber: 'presidential',
    })
    expect(card.engagement).toBe(-1)
  })

  it('transparency increases with more stances', () => {
    const few = computeReportCard({ ...baseInput, totalStances: 2, verifiedStances: 0 })
    const many = computeReportCard({ ...baseInput, totalStances: 14, verifiedStances: 0 })
    expect(many.transparency).toBeGreaterThan(few.transparency)
  })

  it('verified stances boost transparency', () => {
    const unverified = computeReportCard({ ...baseInput, totalStances: 10, verifiedStances: 0 })
    const verified = computeReportCard({ ...baseInput, totalStances: 10, verifiedStances: 10 })
    expect(verified.transparency).toBeGreaterThan(unverified.transparency)
  })

  it('committee chair boosts effectiveness', () => {
    const noChair = computeReportCard({ ...baseInput, committees: [{ role: 'member' }] })
    const withChair = computeReportCard({ ...baseInput, committees: [{ role: 'chair' }] })
    expect(withChair.effectiveness).toBeGreaterThan(noChair.effectiveness)
  })

  it('no stances gives low transparency', () => {
    const card = computeReportCard({ ...baseInput, totalStances: 0, verifiedStances: 0, stances: [] })
    expect(card.transparency).toBe(30)
  })

  it('grade matches score', () => {
    const card = computeReportCard(baseInput)
    expect(card.grade).toBe(gradeFromScore(card.score))
  })
})
